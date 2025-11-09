/**
 * Fan Accumulation System
 *
 * Handles fan growth and tracking for the game.
 * Fan growth is frame-independent and uses deltaTime for smooth progression.
 *
 * Fan sources:
 * - Songs: Each song generates fans per second based on fanGenerationRate
 * - Trending songs: Get additional fan generation when matching current trend
 *
 * Features:
 * - Passive fan accumulation from all songs
 * - Boost multipliers for temporary fan growth
 * - Prestige experience multiplier for enhanced growth
 * - Peak fan tracking for prestige bonuses
 * - Current artist fan tracking separate from total fans
 */

import type { GameState } from '../game/types';
import { TRENDING_MULTIPLIER } from '../game/config';
import { calculateBoostMultiplier } from './boosts';

/**
 * Generate fans and add them to the game state
 * This is the main function called each game tick
 *
 * @param state - The current game state (will be mutated)
 * @param deltaTime - Time elapsed since last update in milliseconds
 */
export function generateFans(state: GameState, deltaTime: number): void {
	const fansPerSecond = calculateFanGeneration(state);
	const deltaSeconds = deltaTime / 1000;
	const fansThisTick = fansPerSecond * deltaSeconds;

	// Add fans to both total and current artist
	state.fans += fansThisTick;
	state.currentArtist.fans += fansThisTick;

	// Update peak fans if current fans are higher
	updatePeakFans(state);
}

/**
 * Calculate total fan generation per second from all sources
 *
 * @param state - The current game state
 * @returns Total fans generated per second
 */
export function calculateFanGeneration(state: GameState): number {
	// Calculate base fan generation from songs
	const baseFanGeneration = calculateSongFanGeneration(state);

	// Apply fan generation multipliers (prestige and boosts)
	const totalFanGeneration = applyFanMultipliers(state, baseFanGeneration);

	return totalFanGeneration;
}

/**
 * Update peak fans if current artist has surpassed previous peak
 * Peak fans are used for prestige bonuses
 *
 * @param state - The current game state (will be mutated)
 */
export function updatePeakFans(state: GameState): void {
	if (state.currentArtist.fans > state.currentArtist.peakFans) {
		state.currentArtist.peakFans = state.currentArtist.fans;
	}
}

/**
 * Calculate fan generation from all songs
 * Includes trending bonuses for songs matching current trend
 */
function calculateSongFanGeneration(state: GameState): number {
	let fanGeneration = 0;

	for (const song of state.songs) {
		let songFanGen = song.fanGenerationRate;

		// Apply trending multiplier if song matches current trending genre and is marked as trending
		if (state.currentTrendingGenre === song.genre && song.isTrending) {
			songFanGen *= TRENDING_MULTIPLIER;
		}

		fanGeneration += songFanGen;
	}

	return fanGeneration;
}

/**
 * Apply all fan generation multipliers
 * Applies prestige experience multiplier and active boost multipliers
 *
 * @param state - The current game state
 * @param baseFanGeneration - Base fan generation before multipliers
 * @returns Fan generation after all multipliers applied
 */
function applyFanMultipliers(state: GameState, baseFanGeneration: number): number {
	let fanGeneration = baseFanGeneration;

	// Apply prestige experience multiplier
	fanGeneration *= state.experienceMultiplier;

	// Apply active boost multipliers (multiplicative stacking)
	const boostMultiplier = calculateBoostMultiplier(state, 'fanMultiplier');
	fanGeneration *= boostMultiplier;

	return fanGeneration;
}

