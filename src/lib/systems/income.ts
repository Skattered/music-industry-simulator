/**
 * Income Generation System
 *
 * Handles all income calculation and accumulation for the game.
 * Income is frame-independent and uses deltaTime for smooth progression.
 *
 * Income sources:
 * - Songs: Base income per song with trending bonuses
 * - Legacy Artists: Passive income from prestiged artists
 * - Platforms: Passive income from owned infrastructure
 * - Tours: Active income from ongoing tours
 *
 * Multipliers applied:
 * - Upgrade income multipliers (stacked additively)
 * - Active boost multipliers (stacked multiplicatively)
 * - Trending genre bonuses (2x for matching songs)
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
 * @param state - The current game state
 * @param baseIncome - Base income before multipliers
 * @returns Income after all multipliers applied
 */
export function applyIncomeMultipliers(state: GameState, baseIncome: number): number {
	let income = baseIncome;

	// Apply upgrade multipliers (additive stacking)
	const upgradeMultiplier = calculateUpgradeMultiplier(state);
	income *= upgradeMultiplier;

	// Apply prestige experience multiplier
	income *= state.experienceMultiplier;

	// Apply active boost multipliers (multiplicative stacking)
	const boostMultiplier = calculateBoostMultiplier(state, 'incomeMultiplier');
	income *= boostMultiplier;

	return income;
}

/**
 * Calculate income from all songs
 * Includes trending bonuses for songs matching current trend
 */
function calculateSongIncome(state: GameState): number {
	let income = 0;

	for (const song of state.songs) {
		let songIncome = song.incomePerSecond;

		// Apply trending multiplier if song matches current trend
		if (song.isTrending && state.currentTrendingGenre === song.genre) {
			songIncome *= TRENDING_MULTIPLIER;
		}

		income += songIncome;
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

/**
 * Calculate total income multiplier from upgrades
 * Stacks additively (1.0 base + sum of all upgrade multipliers)
 */
function calculateUpgradeMultiplier(state: GameState): number {
	let multiplier = 1.0;

	// Note: In a full implementation, we would look up upgrade definitions
	// and sum their incomeMultiplier effects. For now, we return base multiplier.
	// This will be implemented when the upgrade system is added.

	return multiplier;
}

