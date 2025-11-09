/**
 * Trend Research System
 *
 * Allows players to research and change the trending genre to optimize song generation.
 * Costs money early game, GPU resources after unlock.
 * Trending songs receive a 2x multiplier that fades over 5 minutes.
 */

import type { GameState, Genre } from '../game/types';
import { GENRES, TREND_RESEARCH_COST } from '../game/config';
import { getTrendingMultiplier } from './songs';

/**
 * Research and change the trending genre
 *
 * Costs money in early game, GPU after GPU system is unlocked.
 * Changes to a random genre different from the current one.
 *
 * @param state - Current game state (will be modified if successful)
 * @returns true if research was successful, false if unable to afford or not unlocked
 */
export function researchTrend(state: GameState): boolean {
	// Check if trend research is unlocked
	if (!state.unlockedSystems.trendResearch) {
		return false;
	}

	// Determine cost resource (GPU if unlocked, otherwise money)
	const useGPU = state.unlockedSystems.gpu;

	// Check if player can afford
	if (useGPU) {
		if (state.gpu < TREND_RESEARCH_COST) {
			return false;
		}
	} else {
		if (state.money < TREND_RESEARCH_COST) {
			return false;
		}
	}

	// Deduct cost
	if (useGPU) {
		state.gpu -= TREND_RESEARCH_COST;
	} else {
		state.money -= TREND_RESEARCH_COST;
	}

	// Change the trending genre
	changeTrendingGenre(state);

	return true;
}

/**
 * Change the current trending genre to a random different one
 *
 * @param state - Current game state (will be modified)
 */
export function changeTrendingGenre(state: GameState): void {
	// Get available genres (exclude current trending genre if set)
	const availableGenres = state.currentTrendingGenre
		? GENRES.filter(g => g !== state.currentTrendingGenre)
		: [...GENRES];

	// Select random genre
	const randomIndex = Math.floor(Math.random() * availableGenres.length);
	const newGenre = availableGenres[randomIndex];

	// Update state
	state.currentTrendingGenre = newGenre;
	state.trendDiscoveredAt = Date.now();
}

/**
 * Get the current trending genre
 *
 * @param state - Current game state
 * @returns The current trending genre name, or empty string if no trend is active
 */
export function getTrendingGenre(state: GameState): string {
	return state.currentTrendingGenre || '';
}

/**
 * Get the current trend bonus multiplier (fades from 2.0x to 1.0x over 5 minutes)
 *
 * @param state - Current game state
 * @returns The current trend multiplier (1.0 to 2.0)
 */
export function getTrendBonus(state: GameState): number {
	return getTrendingMultiplier(state);
}
