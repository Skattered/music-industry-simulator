/**
 * Song Generation System
 *
 * Handles song creation, queue management, cost calculation, and income generation.
 * Songs are queued and processed sequentially based on tech tier generation speed.
 */

import type { GameState, Song, QueuedSong, Genre } from '../game/types';
import {
	BASE_INCOME_PER_SONG,
	BASE_FAN_GENERATION_RATE,
	BASE_SONG_COST,
	TRENDING_MULTIPLIER,
	UPGRADES,
	GENRES
} from '../game/config';

// Create a Map for O(1) upgrade lookups
const UPGRADE_MAP = new Map(UPGRADES.map((u) => [u.id, u]));

// ============================================================================
// NAME GENERATION
// ============================================================================

const ADJECTIVES = [
	'Electric',
	'Midnight',
	'Digital',
	'Neon',
	'Crystal',
	'Cosmic',
	'Velvet',
	'Golden',
	'Silver',
	'Wild',
	'Lost',
	'Broken',
	'Sweet',
	'Dark',
	'Bright',
	'Fading',
	'Rising',
	'Dancing',
	'Burning',
	'Frozen'
];

const NOUNS = [
	'Dreams',
	'Hearts',
	'Lights',
	'Shadows',
	'Echoes',
	'Nights',
	'Stars',
	'Waves',
	'Fire',
	'Thunder',
	'Memories',
	'Paradise',
	'Rain',
	'Sky',
	'Ocean',
	'Highway',
	'City',
	'Moon',
	'Sun',
	'Love'
];

/**
 * Generate a random song name using mad-lib style
 */
function generateSongName(): string {
	const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
	const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
	return `${adj} ${noun}`;
}

/**
 * Select a random genre from available genres
 */
function selectRandomGenre(): Genre {
	return GENRES[Math.floor(Math.random() * GENRES.length)];
}

// ============================================================================
// SONG GENERATION
// ============================================================================

/**
 * Get the current income multiplier from purchased upgrades
 */
function getIncomeMultiplier(state: GameState): number {
	let multiplier = 1.0;

	// Apply upgrade income multipliers
	for (const upgradeId in state.upgrades) {
		const upgrade = UPGRADE_MAP.get(upgradeId);
		if (upgrade?.effects.incomeMultiplier) {
			multiplier *= upgrade.effects.incomeMultiplier;
		}
	}

	return multiplier;
}

/**
 * Get the current song generation speed in milliseconds
 */
function getSongGenerationSpeed(state: GameState): number {
	// Find the minimum songSpeed value among all upgrades (lower is better)
	let speed = state.songGenerationSpeed;

	const speeds: number[] = [];
	for (const upgradeId in state.upgrades) {
		const upgrade = UPGRADE_MAP.get(upgradeId);
		if (upgrade?.effects.songSpeed !== undefined) {
			speeds.push(upgrade.effects.songSpeed);
		}
	}

	if (speeds.length > 0) {
		speed = Math.min(speed, ...speeds);
	}

	return speed;
}

/**
 * Get the current song cost from upgrades
 */
function getCurrentSongCost(state: GameState): number {
	let cost = BASE_SONG_COST;

	const costs: number[] = [];

	// Collect all songCost values from upgrades
	for (const upgradeId in state.upgrades) {
		const upgrade = UPGRADE_MAP.get(upgradeId);
		if (upgrade?.effects.songCost !== undefined) {
			costs.push(upgrade.effects.songCost);
		}
	}

	if (costs.length > 0) {
		cost = Math.min(...costs);
	}

	return cost;
}

/**
 * Generate a single completed song
 *
 * @param state - Current game state
 * @returns A new Song object
 */
export function generateSong(state: GameState): Song {
	// Generate song properties
	const id = crypto.randomUUID();
	const name = generateSongName();
	const genre = state.currentTrendingGenre || selectRandomGenre();
	const createdAt = Date.now();

	// Determine if song is trending
	const isTrending = state.currentTrendingGenre !== null && genre === state.currentTrendingGenre;

	// Calculate base income per second
	const upgradeMultiplier = getIncomeMultiplier(state);
	let incomePerSecond = BASE_INCOME_PER_SONG * upgradeMultiplier * state.experienceMultiplier;

	// Apply trending multiplier if applicable
	if (isTrending) {
		incomePerSecond *= TRENDING_MULTIPLIER;
	}

	// Calculate fan generation rate
	let fanGenerationRate = BASE_FAN_GENERATION_RATE;

	// Apply trending multiplier to fan generation as well
	if (isTrending) {
		fanGenerationRate *= TRENDING_MULTIPLIER;
	}

	return {
		id,
		name,
		genre,
		createdAt,
		incomePerSecond,
		fanGenerationRate,
		isTrending
	};
}

// ============================================================================
// QUEUE MANAGEMENT
// ============================================================================

/**
 * Calculate the total cost to queue a number of songs
 *
 * @param state - Current game state
 * @param count - Number of songs to queue
 * @returns Total cost in dollars
 */
export function calculateSongCost(state: GameState, count: number): number {
	const costPerSong = getCurrentSongCost(state);
	return costPerSong * count;
}

/**
 * Queue songs for generation
 *
 * @param state - Current game state (will be modified)
 * @param count - Number of songs to queue
 * @returns true if songs were queued successfully, false if insufficient funds
 */
export function queueSongs(state: GameState, count: number): boolean {
	const totalCost = calculateSongCost(state, count);

	// Check if player can afford
	if (state.money < totalCost) {
		return false;
	}

	// Deduct cost
	state.money -= totalCost;

	// Get generation speed
	const generationSpeed = getSongGenerationSpeed(state);

	// Add songs to queue
	for (let i = 0; i < count; i++) {
		const queuedSong: QueuedSong = {
			id: crypto.randomUUID(),
			progress: 0,
			totalTime: generationSpeed
		};
		state.songQueue.push(queuedSong);
	}

	return true;
}

/**
 * Process the song generation queue
 *
 * Songs are processed sequentially - only the first song in queue progresses at a time.
 * When a song completes, it's added to the completed songs list and removed from queue.
 *
 * @param state - Current game state (will be modified)
 * @param deltaTime - Time elapsed since last update in milliseconds
 */
export function processSongQueue(state: GameState, deltaTime: number): void {
	if (state.songQueue.length === 0) {
		return;
	}

	// Process only the first song in the queue (sequential processing)
	const currentSong = state.songQueue[0];
	currentSong.progress += deltaTime;

	// Check if song is complete
	if (currentSong.progress >= currentSong.totalTime) {
		// Generate completed song
		const completedSong = generateSong(state);
		state.songs.push(completedSong);

		// Remove from queue
		state.songQueue.shift();

		// Process any remaining time on the next song if available
		const remainingTime = currentSong.progress - currentSong.totalTime;
		if (remainingTime > 0 && state.songQueue.length > 0) {
			processSongQueue(state, remainingTime);
		}
	}
}

// ============================================================================
// INCOME & FAN CALCULATION
// ============================================================================

/**
 * Get the total active boost multiplier for income
 */
function getIncomeBoostMultiplier(state: GameState): number {
	let multiplier = 1.0;

	const now = Date.now();
	for (const boost of state.activeBoosts) {
		const elapsedTime = now - boost.activatedAt;
		if (elapsedTime < boost.duration) {
			multiplier *= boost.incomeMultiplier;
		}
	}

	return multiplier;
}

/**
 * Get the total active boost multiplier for fan generation
 */
function getFanBoostMultiplier(state: GameState): number {
	let multiplier = 1.0;

	const now = Date.now();
	for (const boost of state.activeBoosts) {
		const elapsedTime = now - boost.activatedAt;
		if (elapsedTime < boost.duration) {
			multiplier *= boost.fanMultiplier;
		}
	}

	return multiplier;
}

/**
 * Calculate total income per second from all songs
 *
 * @param state - Current game state
 * @returns Total income per second in dollars
 */
export function calculateSongIncome(state: GameState): number {
	// Sum base income from all songs
	const baseIncome = state.songs.reduce((total, song) => total + song.incomePerSecond, 0);

	// Apply boost multipliers
	const boostMultiplier = getIncomeBoostMultiplier(state);

	return baseIncome * boostMultiplier;
}

/**
 * Calculate total fan generation per second from all songs
 *
 * @param state - Current game state
 * @returns Total fans generated per second
 */
export function calculateFanGeneration(state: GameState): number {
	// Sum base fan generation from all songs
	const baseFanGeneration = state.songs.reduce((total, song) => total + song.fanGenerationRate, 0);

	// Apply boost multipliers
	const boostMultiplier = getFanBoostMultiplier(state);

	return baseFanGeneration * boostMultiplier;
}
