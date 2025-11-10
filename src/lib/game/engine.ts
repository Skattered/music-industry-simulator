/**
 * Game Engine - Core tick-based game loop
 *
 * Runs at 10 TPS (ticks per second) with frame-independent logic using deltaTime.
 * Handles all game system updates, auto-saving, and edge cases like tab visibility
 * and clock changes.
 */

import type { GameState } from './types';
import { TICK_RATE, SAVE_KEY, BACKUP_KEY } from './config';
import { processSongQueue } from '../systems/songs';
import { generateIncome } from '../systems/income';
import { generateFans } from '../systems/fans';
import { processActiveBoosts } from '../systems/exploitation';
import { processPhysicalAlbums } from '../systems/physical';
import { processTours } from '../systems/tours';
import { processLegacyArtists } from '../systems/prestige';
import { processPlatformIncome, updateControlProgress } from '../systems/monopoly';
import { checkPhaseUnlocks } from '../systems/unlocks';

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
		// Process song generation queue (must be first to add completed songs)
		processSongQueue(this.gameState, deltaTime);

		// Process income from all sources
		generateIncome(this.gameState, deltaTime);

		// Process fan generation
		generateFans(this.gameState, deltaTime);

		// Process active boosts (check for expiration)
		processActiveBoosts(this.gameState, deltaTime);

		// Process physical album auto-releases
		processPhysicalAlbums(this.gameState, deltaTime);

		// Process active tours (check for completion)
		processTours(this.gameState, deltaTime);

		// Process legacy artists (cross-promotion fan generation)
		processLegacyArtists(this.gameState, deltaTime);


		// Update industry control based on owned platforms
		updateControlProgress(this.gameState);

		// Check and unlock systems based on milestones
		checkPhaseUnlocks(this.gameState);
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
	 * Force an immediate save
	 */
	public forceSave(): void {
		this.saveGame();
	}
}
