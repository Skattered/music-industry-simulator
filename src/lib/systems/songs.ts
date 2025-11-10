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
	TREND_FADE_DURATION,
	UPGRADES,
	GENRES
} from '../game/config';

// Create a Map for O(1) upgrade lookups
const UPGRADE_MAP = new Map(UPGRADES.map((u) => [u.id, u]));

/**
 * Calculate the current trending multiplier with fade
 * Starts at TRENDING_MULTIPLIER and fades linearly to 1.0 over TREND_FADE_DURATION
 *
 * @param state - Current game state
 * @returns Current trending multiplier (1.0 to TRENDING_MULTIPLIER)
 */
export function getTrendingMultiplier(state: GameState): number {
	if (state.currentTrendingGenre === null || state.trendDiscoveredAt === null) {
		return 1.0;
	}

	const now = Date.now();
	const elapsed = now - state.trendDiscoveredAt;

	// If trend has fully faded, return 1.0
	if (elapsed >= TREND_FADE_DURATION) {
		return 1.0;
	}

	// Linear fade from TRENDING_MULTIPLIER to 1.0
	const fadeProgress = elapsed / TREND_FADE_DURATION; // 0.0 to 1.0
	const multiplierRange = TRENDING_MULTIPLIER - 1.0; // e.g., 2.0 - 1.0 = 1.0
	const currentMultiplier = TRENDING_MULTIPLIER - (multiplierRange * fadeProgress);

	return currentMultiplier;
}

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
export function getSongGenerationSpeed(state: GameState): number {
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
 * Get the current batch size (how many songs to process simultaneously)
 */
export function getBatchSize(state: GameState): number {
	// Find the maximum batchSize value among all upgrades (higher is better)
	let batchSize = 1;

	for (const upgradeId in state.upgrades) {
		const upgrade = UPGRADE_MAP.get(upgradeId);
		if (upgrade?.effects.batchSize !== undefined) {
			batchSize = Math.max(batchSize, upgrade.effects.batchSize);
		}
	}

	return batchSize;
}

/**
 * Get the current song cost from upgrades
 */
export function getCurrentSongCost(state: GameState): number {
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
	// When a trending genre is discovered, intentionally create all songs in that genre
	// to capitalize on the trend bonus before it fades. This is the core mechanic:
	// research trend -> make songs in that genre -> bonus fades -> research new trend
	const genre = state.currentTrendingGenre || selectRandomGenre();
	const createdAt = Date.now();

	// Determine if song is trending
	const isTrending = state.currentTrendingGenre !== null && genre === state.currentTrendingGenre;

	// Calculate base income per second
	const upgradeMultiplier = getIncomeMultiplier(state);
	let incomePerSecond = BASE_INCOME_PER_SONG * upgradeMultiplier * state.experienceMultiplier;

	// Apply fading trending multiplier if applicable (starts at 2.0x, fades to 1.0x over 5 minutes)
	if (isTrending) {
		const trendingMultiplier = getTrendingMultiplier(state);
		incomePerSecond *= trendingMultiplier;
	}

	// Calculate fan generation rate
	let fanGenerationRate = BASE_FAN_GENERATION_RATE;

	// Apply fading trending multiplier to fan generation as well
	if (isTrending) {
		const trendingMultiplier = getTrendingMultiplier(state);
		fanGenerationRate *= trendingMultiplier;
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
 * Songs are processed in batches based on the batch size upgrade.
 * When batch processing is enabled, multiple songs progress simultaneously.
 * When a song completes, it's added to the completed songs list and removed from queue.
 *
 * @param state - Current game state (will be modified)
 * @param deltaTime - Time elapsed since last update in milliseconds
 */
export function processSongQueue(state: GameState, deltaTime: number): void {
	if (state.songQueue.length === 0) {
		return;
	}

	// Get current batch size (how many songs to process simultaneously)
	const batchSize = getBatchSize(state);

	// Process up to batchSize songs from the front of the queue
	const songsToProcess = Math.min(batchSize, state.songQueue.length);
	let remainingTime = deltaTime;

	for (let i = 0; i < songsToProcess; i++) {
		const currentSong = state.songQueue[i];
		if (!currentSong) break;

		currentSong.progress += deltaTime;
	}

	// Check for completed songs and remove them
	while (state.songQueue.length > 0 && state.songQueue[0].progress >= state.songQueue[0].totalTime) {
		const completedSong = state.songQueue[0];
		
		// Generate completed song
		const newSong = generateSong(state);
		state.songs.push(newSong);

		// Calculate remaining time from this song
		remainingTime = completedSong.progress - completedSong.totalTime;

		// Remove from queue
		state.songQueue.shift();

		// If there's remaining time and more songs in queue, process them recursively
		if (remainingTime > 0 && state.songQueue.length > 0) {
			processSongQueue(state, remainingTime);
			return; // Exit after recursive call
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
