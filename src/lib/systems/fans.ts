/**
 * Fan Accumulation System
 *
 * Handles fan growth and tracking for the game.
 * Fan growth is frame-independent and uses deltaTime for smooth progression.
 *
 * Fan sources:
 * - Songs: Each song generates fans per second (multipliers baked in at creation)
 * - Trending songs: Get trending bonus baked into fanGenerationRate at creation
 *
 * Features:
 * - Passive fan accumulation from all songs
 * - Boost multipliers for temporary fan growth (applied here)
 * - Prestige experience multiplier (baked into songs at creation)
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
 * 
 * NOTE: Songs already have trending bonus baked in when created.
 * song.fanGenerationRate already includes trending multiplier if applicable.
 */
function calculateSongFanGeneration(state: GameState): number {
	let fanGeneration = 0;

	for (const song of state.songs) {
		// Songs already have all multipliers (trending, prestige) baked in
		fanGeneration += song.fanGenerationRate;
	}

	return fanGeneration;
}

/**
 * Apply all fan generation multipliers
 * 
 * NOTE: Prestige multiplier is already baked into song fan generation rates
 * during song creation. Only apply temporary boost multipliers here.
 *
 * @param state - The current game state
 * @param baseFanGeneration - Base fan generation before multipliers
 * @returns Fan generation after all multipliers applied
 */
function applyFanMultipliers(state: GameState, baseFanGeneration: number): number {
	// Apply active boost multipliers (multiplicative stacking)
	const boostMultiplier = calculateBoostMultiplier(state, 'fanMultiplier');
	return baseFanGeneration * boostMultiplier;
}

