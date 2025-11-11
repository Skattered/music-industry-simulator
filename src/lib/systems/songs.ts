/**
 * Song Generation System
 *
 * Handles song creation, queue management, cost calculation, and income generation.
 * Songs are queued and processed sequentially based on tech tier generation speed.
 */

import type { GameState, Song, QueuedSong, Genre } from '../game/types';
import {
	INCOME_PER_FAN_PER_SONG,
	BASE_FAN_GENERATION_RATE,
	BASE_SONG_COST,
	TRENDING_MULTIPLIER,
	TREND_FADE_DURATION,
	UPGRADES,
	GENRES
} from '../game/config';
import { ADJECTIVES, NOUNS } from '../data/words';

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
 * Takes the HIGHEST multiplier from all purchased upgrades (they don't stack)
 */
function getIncomeMultiplier(state: GameState): number {
	let multiplier = 1.0;

	// Find the highest income multiplier among all upgrades (they replace, not multiply)
	for (const upgradeId in state.upgrades) {
		const upgrade = UPGRADE_MAP.get(upgradeId);
		if (upgrade?.effects.incomeMultiplier) {
			multiplier = Math.max(multiplier, upgrade.effects.incomeMultiplier);
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
 * IMPORTANT: This function bakes ALL multipliers into the song's income and fan values:
 * - Upgrade multiplier (from tech tier)
 * - Prestige experience multiplier
 * - Trending multiplier (if applicable, with fade)
 * - Fan-based income (income scales with total fans at creation time)
 * 
 * These multipliers should NOT be re-applied in income/fan calculations!
 * Only temporary boost multipliers should be applied there.
 *
 * @param state - Current game state
 * @returns A new Song object with final calculated values
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

	// Calculate base income per second based on current fan count
	// Income = $0.000001 * fans * upgrade multiplier * experience multiplier
	const upgradeMultiplier = getIncomeMultiplier(state);
	let incomePerSecond = state.fans * INCOME_PER_FAN_PER_SONG * upgradeMultiplier * state.experienceMultiplier;

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

	// Add songs to queue
	for (let i = 0; i < count; i++) {
		const queuedSong: QueuedSong = {
			id: crypto.randomUUID(),
			progress: 0
		};
		state.songQueue.push(queuedSong);
	}

	return true;
}

/**
 * Process the song generation queue
 *
 * Processes the first song in the queue. When it completes, generates one song.
 *
 * @param state - Current game state (will be modified)
 * @param deltaTime - Time elapsed since last update in milliseconds
 */
export function processSongQueue(state: GameState, deltaTime: number): void {
	if (state.songQueue.length === 0) {
		return;
	}

	// Get current generation speed
	const currentSpeed = getSongGenerationSpeed(state);

	// Process only the first song in the queue
	const currentSong = state.songQueue[0];
	currentSong.progress += deltaTime;

	// Check if song is complete
	if (currentSong.progress >= currentSpeed) {
		// Generate completed song
		const completedSong = generateSong(state);
		state.songs.push(completedSong);

		// Calculate remaining time
		const remainingTime = currentSong.progress - currentSpeed;

		// Remove from queue
		state.songQueue.shift();

		// Process any remaining time on the next song if available
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
