/**
 * Game Engine - Core tick-based game loop
 *
 * Runs at 10 TPS (ticks per second) with frame-independent logic using deltaTime.
 * Handles all game system updates, auto-saving, and edge cases like tab visibility
 * and clock changes.
 */

import type { GameState, QueuedSong, ActiveBoost, Tour } from './types';
import { TICK_RATE, SAVE_KEY, BACKUP_KEY, TRENDING_MULTIPLIER, TOUR_DURATION } from './config';

/**
 * Callback function type for save operations
 */
export type SaveCallback = (state: GameState) => void;

/**
 * Callback function type for tick updates
 */
export type TickCallback = (state: GameState, deltaTime: number) => void;

/**
 * Core game engine with tick-based loop
 *
 * Features:
 * - Runs at consistent 10 TPS (100ms intervals)
 * - Frame-independent logic using deltaTime
 * - Auto-saves every 10 seconds
 * - Handles tab visibility changes
 * - Detects and handles clock changes
 * - Clean start/stop with no memory leaks
 */
export class GameEngine {
	private gameState: GameState;
	private isRunning: boolean = false;
	private tickInterval: number | null = null;
	private lastTickTime: number = 0;
	private autoSaveCounter: number = 0;
	private saveCallback: SaveCallback | null = null;
	private tickCallback: TickCallback | null = null;
	private visibilityChangeHandler: (() => void) | null = null;

	// Constants
	private readonly AUTO_SAVE_INTERVAL_MS = 10000; // 10 seconds
	private readonly MAX_DELTA_TIME = 5000; // Maximum 5 seconds to prevent huge jumps
	private readonly CLOCK_CHANGE_THRESHOLD = 60000; // 60 seconds - detect if clock jumped

	/**
	 * Creates a new game engine instance
	 * @param state - The initial game state to manage
	 */
	constructor(state: GameState) {
		this.gameState = state;
		this.lastTickTime = Date.now();
	}

	/**
	 * Set a callback to be called when the game needs to save
	 * @param callback - Function to call with game state when saving
	 */
	public onSave(callback: SaveCallback): void {
		this.saveCallback = callback;
	}

	/**
	 * Set a callback to be called on each tick
	 * @param callback - Function to call with game state and deltaTime on each tick
	 */
	public onTick(callback: TickCallback): void {
		this.tickCallback = callback;
	}

	/**
	 * Start the game engine
	 * Initializes the tick interval and sets up visibility change handling
	 */
	public start(): void {
		if (this.isRunning) {
			console.warn('GameEngine: Already running');
			return;
		}

		this.isRunning = true;
		this.lastTickTime = Date.now();
		this.autoSaveCounter = 0;

		// Set up visibility change handler
		this.setupVisibilityHandler();

		// Start the main game loop
		this.tickInterval = window.setInterval(() => {
			this.tick();
		}, TICK_RATE);

		console.log('GameEngine: Started at 10 TPS');
	}

	/**
	 * Stop the game engine
	 * Clears intervals, auto-saves, and cleans up event listeners
	 */
	public stop(): void {
		if (!this.isRunning) {
			console.warn('GameEngine: Not running');
			return;
		}

		this.isRunning = false;

		// Clear the tick interval
		if (this.tickInterval !== null) {
			clearInterval(this.tickInterval);
			this.tickInterval = null;
		}

		// Clean up visibility change handler
		this.cleanupVisibilityHandler();

		// Auto-save on stop
		this.saveGame();

		console.log('GameEngine: Stopped');
	}

	/**
	 * Main tick function - called every 100ms (10 TPS)
	 * Calculates deltaTime and processes all game systems
	 */
	private tick(): void {
		const currentTime = Date.now();

		// Calculate deltaTime in milliseconds
		let deltaTime = currentTime - this.lastTickTime;

		// Detect clock changes (system time jumped forward/backward)
		if (this.detectClockChange(deltaTime)) {
			console.warn('GameEngine: Clock change detected, capping deltaTime');
			deltaTime = TICK_RATE; // Use normal tick rate instead
		} else if (deltaTime > this.MAX_DELTA_TIME) {
			// Cap deltaTime to prevent huge jumps (e.g., tab was hidden for a long time)
			console.warn(`GameEngine: Large deltaTime detected (${deltaTime}ms), capping to ${this.MAX_DELTA_TIME}ms`);
			deltaTime = this.MAX_DELTA_TIME;
		}

		// Update last tick time
		this.lastTickTime = currentTime;

		// Process all game systems
		this.processSystems(deltaTime);

		// Call tick callback if set
		if (this.tickCallback) {
			this.tickCallback(this.gameState, deltaTime);
		}

		// Handle auto-save
		this.autoSaveCounter += deltaTime;
		if (this.autoSaveCounter >= this.AUTO_SAVE_INTERVAL_MS) {
			this.saveGame();
			this.autoSaveCounter = 0;
		}

		// Update lastUpdate timestamp
		this.gameState.lastUpdate = currentTime;
	}

	/**
	 * Process all game systems with frame-independent logic
	 * @param deltaTime - Time elapsed since last tick in milliseconds
	 */
	private processSystems(deltaTime: number): void {
		const deltaSeconds = deltaTime / 1000; // Convert to seconds for easier calculations

		// Process song generation queue
		this.processSongGeneration(deltaTime);

		// Process income from all sources
		this.processIncome(deltaSeconds);

		// Process fan generation
		this.processFans(deltaSeconds);

		// Process active boosts (check for expiration)
		this.processBoosts();

		// Process active tours (check for completion)
		this.processTours();

		// Check and unlock systems based on milestones
		this.checkSystemUnlocks();
	}

	/**
	 * Process song generation queue
	 * Updates progress on queued songs and completes them when ready
	 */
	private processSongGeneration(deltaTime: number): void {
		if (this.gameState.songQueue.length === 0) {
			return;
		}

		// Process the first song in queue
		const queuedSong = this.gameState.songQueue[0];
		queuedSong.progress += deltaTime;

		// Check if song is complete
		if (queuedSong.progress >= queuedSong.totalTime) {
			// Remove from queue - the actual song creation should be handled
			// by the game logic layer, not the engine
			this.gameState.songQueue.shift();
		}
	}

	/**
	 * Process income generation from all sources
	 * Applies frame-independent income using deltaSeconds
	 */
	private processIncome(deltaSeconds: number): void {
		let totalIncome = 0;

		// Calculate multipliers from active boosts
		const incomeMultiplier = this.calculateIncomeMultiplier();

		// Income from songs
		for (const song of this.gameState.songs) {
			let songIncome = song.incomePerSecond * deltaSeconds;

			// Apply trending bonus if applicable
			if (song.isTrending) {
				songIncome *= TRENDING_MULTIPLIER;
			}

			totalIncome += songIncome;
		}

		// Income from legacy artists
		for (const artist of this.gameState.legacyArtists) {
			totalIncome += artist.incomeRate * deltaSeconds;
		}

		// Income from active tours
		for (const tour of this.gameState.tours) {
			if (tour.completedAt === null) {
				totalIncome += tour.incomePerSecond * deltaSeconds;
			}
		}

		// Income from owned platforms
		for (const platform of this.gameState.ownedPlatforms) {
			totalIncome += platform.incomePerSecond * deltaSeconds;
		}

		// Apply boost multipliers and add to balance
		totalIncome *= incomeMultiplier;
		this.gameState.money += totalIncome;
	}

	/**
	 * Process fan generation from songs
	 */
	private processFans(deltaSeconds: number): void {
		let totalFans = 0;

		// Calculate multipliers from active boosts
		const fanMultiplier = this.calculateFanMultiplier();

		// Fans from songs
		for (const song of this.gameState.songs) {
			let songFans = song.fanGenerationRate * deltaSeconds;

			// Apply trending bonus if applicable
			if (song.isTrending) {
				songFans *= TRENDING_MULTIPLIER;
			}

			totalFans += songFans;
		}

		// Apply boost multipliers
		totalFans *= fanMultiplier;

		// Update fan counts
		this.gameState.fans += totalFans;
		this.gameState.currentArtist.fans += totalFans;

		// Update peak fans if necessary
		if (this.gameState.currentArtist.fans > this.gameState.currentArtist.peakFans) {
			this.gameState.currentArtist.peakFans = this.gameState.currentArtist.fans;
		}
	}

	/**
	 * Process active boosts and remove expired ones
	 */
	private processBoosts(): void {
		const currentTime = Date.now();

		// Filter out expired boosts
		this.gameState.activeBoosts = this.gameState.activeBoosts.filter((boost: ActiveBoost) => {
			const elapsed = currentTime - boost.activatedAt;
			return elapsed < boost.duration;
		});
	}

	/**
	 * Process active tours and mark completed ones
	 */
	private processTours(): void {
		const currentTime = Date.now();

		for (const tour of this.gameState.tours) {
			if (tour.completedAt === null) {
				const elapsed = currentTime - tour.startedAt;

				if (elapsed >= TOUR_DURATION) {
					tour.completedAt = currentTime;
				}
			}
		}
	}

	/**
	 * Calculate total income multiplier from all active boosts
	 */
	private calculateIncomeMultiplier(): number {
		let multiplier = 1.0;

		for (const boost of this.gameState.activeBoosts) {
			multiplier *= boost.incomeMultiplier;
		}

		// Apply experience multiplier from prestige
		multiplier *= this.gameState.experienceMultiplier;

		return multiplier;
	}

	/**
	 * Calculate total fan generation multiplier from all active boosts
	 */
	private calculateFanMultiplier(): number {
		let multiplier = 1.0;

		for (const boost of this.gameState.activeBoosts) {
			multiplier *= boost.fanMultiplier;
		}

		return multiplier;
	}

	/**
	 * Detect if the system clock has changed dramatically
	 * This can happen when user changes system time or computer sleeps/hibernates
	 */
	private detectClockChange(deltaTime: number): boolean {
		// If deltaTime is negative or wildly different from expected tick rate
		if (deltaTime < 0) {
			return true;
		}

		// If deltaTime is way larger than threshold (e.g., > 60 seconds)
		if (deltaTime > this.CLOCK_CHANGE_THRESHOLD) {
			return true;
		}

		return false;
	}

	/**
	 * Set up visibility change handler to pause/resume on tab visibility
	 */
	private setupVisibilityHandler(): void {
		this.visibilityChangeHandler = () => {
			if (document.hidden) {
				// Tab is hidden - the tick will continue but we'll cap deltaTime
				console.log('GameEngine: Tab hidden, will cap deltaTime on return');
			} else {
				// Tab is visible again - reset last tick time to prevent huge delta
				console.log('GameEngine: Tab visible, resetting tick time');
				this.lastTickTime = Date.now();
			}
		};

		document.addEventListener('visibilitychange', this.visibilityChangeHandler);
	}

	/**
	 * Clean up visibility change handler
	 */
	private cleanupVisibilityHandler(): void {
		if (this.visibilityChangeHandler) {
			document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
			this.visibilityChangeHandler = null;
		}
	}

	/**
	 * Save the game state
	 * Uses the save callback if set, otherwise saves to localStorage
	 */
	private saveGame(): void {
		if (this.saveCallback) {
			this.saveCallback(this.gameState);
		} else {
			// Default save to localStorage
			try {
				// Create backup of current save
				const currentSave = localStorage.getItem(SAVE_KEY);
				if (currentSave) {
					localStorage.setItem(BACKUP_KEY, currentSave);
				}

				// Save current state
				const saveData = {
					state: this.gameState,
					savedAt: Date.now(),
					version: this.gameState.version
				};

				localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
				console.log('GameEngine: Auto-saved');
			} catch (error) {
				console.error('GameEngine: Failed to save', error);
			}
		}
	}

	/**
	 * Get the current game state
	 */
	public getState(): GameState {
		return this.gameState;
	}

	/**
	 * Update the game state (for external modifications)
	 */
	public setState(state: GameState): void {
		this.gameState = state;
	}

	/**
	 * Check if the engine is currently running
	 */
	public get running(): boolean {
		return this.isRunning;
	}

	/**
	 * Check and automatically unlock systems based on milestones
	 */
	private checkSystemUnlocks(): void {
		// Check platform ownership unlock
		if (!this.gameState.unlockedSystems.platformOwnership) {
			const completedTours = this.gameState.tours.filter((tour) => tour.completedAt !== null).length;
			const hasEnoughTours = completedTours >= 50; // MIN_TOURS_FOR_PLATFORMS
			const hasEnoughFans = this.gameState.fans >= 1_000_000; // MIN_FANS_FOR_PLATFORMS
			const hasRequiredTech = this.gameState.techTier >= 6; // MIN_TECH_TIER_FOR_PLATFORMS

			if (hasEnoughTours && hasEnoughFans && hasRequiredTech) {
				this.gameState.unlockedSystems.platformOwnership = true;
				console.log('GameEngine: Platform ownership unlocked!');
			}
		}
	}

	/**
	 * Force an immediate save
	 */
	public forceSave(): void {
		this.saveGame();
	}
}
