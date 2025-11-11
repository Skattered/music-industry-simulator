/**
 * Income Generation System
 *
 * Handles all income calculation and accumulation for the game.
 * Income is frame-independent and uses deltaTime for smooth progression.
 *
 * Income sources:
 * - Songs: Base income per song (multipliers already baked in at creation)
 * - Legacy Artists: Passive income from prestiged artists
 * - Platforms: Passive income from owned infrastructure
 * - Tours: Active income from ongoing tours
 *
 * Multipliers applied:
 * - Upgrade and prestige multipliers: Baked into song values at creation
 * - Trending genre bonuses: Baked into song values at creation (2x for matching songs)
 * - Active boost multipliers: Applied here (temporary, multiplicative stacking)
 */

import type { GameState } from '../game/types';
import { TRENDING_MULTIPLIER } from '../game/config';
import { calculateBoostMultiplier } from './boosts';

/**
 * Generate income and add it to the game state
 * This is the main function called each game tick
 *
 * @param state - The current game state (will be mutated)
 * @param deltaTime - Time elapsed since last update in milliseconds
 */
export function generateIncome(state: GameState, deltaTime: number): void {
	const incomePerSecond = calculateTotalIncome(state);
	const deltaSeconds = deltaTime / 1000;
	const incomeThisTick = incomePerSecond * deltaSeconds;

	state.money += incomeThisTick;
}

/**
 * Calculate total income per second from all sources
 *
 * @param state - The current game state
 * @returns Total income per second in dollars
 */
export function calculateTotalIncome(state: GameState): number {
	// Calculate base income from all sources
	const songIncome = calculateSongIncome(state);
	const legacyIncome = calculateLegacyArtistIncome(state);
	const platformIncome = calculatePlatformIncome(state);
	const tourIncome = calculateTourIncome(state);

	const baseIncome = songIncome + legacyIncome + platformIncome + tourIncome;

	// Apply multipliers
	const totalIncome = applyIncomeMultipliers(state, baseIncome);

	return totalIncome;
}

/**
 * Apply all income multipliers to base income
 *
 * NOTE: Upgrade and prestige multipliers are already baked into song values
 * during song creation. Only apply temporary boost multipliers here.
 *
 * @param state - The current game state
 * @param baseIncome - Base income before multipliers
 * @returns Income after all multipliers applied
 */
export function applyIncomeMultipliers(state: GameState, baseIncome: number): number {
	let income = baseIncome;

	// Apply active boost multipliers (multiplicative stacking)
	const boostMultiplier = calculateBoostMultiplier(state, 'incomeMultiplier');
	income *= boostMultiplier;

	return income;
}

/**
 * Calculate income from all songs
 * 
 * NOTE: Songs already have trending bonus baked in when created.
 * song.incomePerSecond already includes trending multiplier if applicable.
 */
function calculateSongIncome(state: GameState): number {
	let income = 0;

	for (const song of state.songs) {
		// Songs already have all multipliers (trending, prestige, upgrades) baked in
		income += song.incomePerSecond;
	}

	return income;
}

/**
 * Calculate passive income from legacy artists (from prestige)
 */
function calculateLegacyArtistIncome(state: GameState): number {
	let income = 0;

	for (const artist of state.legacyArtists) {
		income += artist.incomeRate;
	}

	return income;
}

/**
 * Calculate passive income from owned platforms
 */
function calculatePlatformIncome(state: GameState): number {
	let income = 0;

	for (const platform of state.ownedPlatforms) {
		income += platform.incomePerSecond;
	}

	return income;
}

/**
 * Calculate income from active tours
 * Only counts tours that are still running
 */
function calculateTourIncome(state: GameState): number {
	let income = 0;

	for (const tour of state.tours) {
		// Only count active tours (not completed)
		if (tour.completedAt === null) {
			income += tour.incomePerSecond;
		}
	}

	return income;
}



