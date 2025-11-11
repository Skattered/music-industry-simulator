/**
 * Tour and Concert System
 *
 * Handles concert tours which provide large income bursts based on catalog size.
 * Tours run automatically once unlocked and can run multiple simultaneously (AI advantage).
 *
 * Unlock Requirements:
 * - 10 physical albums released
 * - 100,000 fans
 * - Own Local Models (tech tier 3)
 *
 * Mechanics:
 * - Tours cost money to start but generate massive income over their duration
 * - Income scales with fan count and total song catalog
 * - Multiple tours can run simultaneously (max 3 by default)
 * - Tours last 3 minutes and generate constant income during that period
 */

import type { GameState, Tour } from '../game/types';
import {
	TOUR_BASE_COST,
	TOUR_DURATION,
	TOUR_BASE_INCOME_PER_SECOND,
	TOUR_FAN_MULTIPLIER,
	MAX_ACTIVE_TOURS,
	TOUR_SONG_CATALOG_BONUS,
	TOUR_MAX_TIERS,
	TOUR_SCARCITY_MULTIPLIER
} from '../game/config';
import { TOUR_ADJECTIVES, TOUR_NOUNS } from '../data/words';

// ============================================================================
// TOUR NAME GENERATION
// ============================================================================

/**
 * Generate a random tour name using mad-lib style
 */
function generateTourName(): string {
	const adj = TOUR_ADJECTIVES[Math.floor(Math.random() * TOUR_ADJECTIVES.length)];
	const noun = TOUR_NOUNS[Math.floor(Math.random() * TOUR_NOUNS.length)];
	return `${adj} ${noun}`;
}

// ============================================================================
// UNLOCK CHECKING
// ============================================================================

/**
 * Check if tours should be unlocked based on game state
 *
 * Requirements:
 * - Tours system unlocked (via tech upgrade)
 * - 10 physical albums released
 * - 100,000 fans
 *
 * @param state - Current game state
 * @returns true if tours should be unlocked
 */
export function shouldUnlockTours(state: GameState): boolean {
	// Check if tours system is already unlocked via tech upgrades
	if (!state.unlockedSystems.tours) {
		return false;
	}

	// Check minimum album requirement
	const hasEnoughAlbums = state.physicalAlbums.length >= 10;

	// Check minimum fan requirement
	const hasEnoughFans = state.fans >= 100_000;

	return hasEnoughAlbums && hasEnoughFans;
}

/**
 * Check if a tour can be started based on current game state
 *
 * @param state - Current game state
 * @returns true if a tour can be started
 */
export function canStartTour(state: GameState): boolean {
	// Must have tours unlocked
	if (!shouldUnlockTours(state)) {
		return false;
	}

	// Check if we can afford the tour
	if (state.money < TOUR_BASE_COST) {
		return false;
	}

	// Check if we've reached max active tours
	const activeTourCount = getActiveTourCount(state);
	const maxTours = getMaxActiveTours(state);

	if (activeTourCount >= maxTours) {
		return false;
	}

	return true;
}

/**
 * Get the number of tours that can run simultaneously
 *
 * @param state - Current game state
 * @returns Maximum number of simultaneous tours
 */
export function getMaxActiveTours(state: GameState): number {
	// Base: 1 tour at a time
	let maxTours = 1;

	// Tech tier upgrades increase max tours
	// Tier 3+: Can run 1 tour
	if (state.techTier >= TOUR_MAX_TIERS.TIER_1_TOUR) {
		maxTours = 1;
	}

	// Tier 4+: Can run 2 tours
	if (state.techTier >= TOUR_MAX_TIERS.TIER_2_TOURS) {
		maxTours = 2;
	}

	// Tier 5+: Can run 3 tours (max)
	if (state.techTier >= TOUR_MAX_TIERS.TIER_3_TOURS) {
		maxTours = MAX_ACTIVE_TOURS;
	}

	return maxTours;
}

/**
 * Get the count of currently active (not completed) tours
 *
 * @param state - Current game state
 * @returns Number of active tours
 */
export function getActiveTourCount(state: GameState): number {
	return state.tours.filter((tour) => tour.completedAt === null).length;
}

// ============================================================================
// TOUR CREATION AND MANAGEMENT
// ============================================================================

/**
 * Calculate tour income per second based on game state
 * Income scales with fan count and total song catalog
 *
 * @param state - Current game state
 * @returns Income per second for a new tour
 */
export function calculateTourIncomePerSecond(state: GameState): number {
	// Base income
	let incomePerSecond = TOUR_BASE_INCOME_PER_SECOND;

	// Scale with fan count
	incomePerSecond += state.fans * TOUR_FAN_MULTIPLIER;

	// Scale with song catalog size (more songs = bigger shows)
	const songCatalogBonus = state.songs.length * TOUR_SONG_CATALOG_BONUS;
	incomePerSecond += songCatalogBonus;

	// Apply prestige multiplier
	incomePerSecond *= state.experienceMultiplier;

	return incomePerSecond;
}

/**
 * Start a new tour
 * Deducts cost and creates a new active tour
 *
 * @param state - Current game state (will be modified)
 * @returns The newly created Tour, or null if tour couldn't be started
 */
export function startTour(state: GameState): Tour | null {
	if (!canStartTour(state)) {
		return null;
	}

	// Deduct cost
	state.money -= TOUR_BASE_COST;

	// Calculate income for this tour
	const incomePerSecond = calculateTourIncomePerSecond(state);

	// Create tour
	const tour: Tour = {
		id: crypto.randomUUID(),
		name: generateTourName(),
		startedAt: Date.now(),
		completedAt: null,
		incomePerSecond,
		usesScarcity: false // Can be set by exploitation abilities
	};

	// Add to tours array
	state.tours.push(tour);

	return tour;
}

/**
 * Process active tours and mark completed ones
 * This is called by the game engine each tick
 *
 * @param state - Current game state (will be modified)
 * @param deltaTime - Time elapsed since last update in milliseconds (unused, kept for signature compatibility)
 */
export function processTours(state: GameState, deltaTime: number): void {
	const currentTime = Date.now();

	for (const tour of state.tours) {
		if (tour.completedAt === null) {
			const elapsed = currentTime - tour.startedAt;

			if (elapsed >= TOUR_DURATION) {
				tour.completedAt = currentTime;
			}
		}
	}
}

/**
 * Calculate total income per second from all active tours
 * Only counts tours that are still running
 *
 * @param state - Current game state
 * @returns Total income per second from tours
 */
export function calculateTourIncome(state: GameState): number {
	let totalIncome = 0;

	for (const tour of state.tours) {
		// Only count active tours (not completed)
		if (tour.completedAt === null) {
			totalIncome += tour.incomePerSecond;
		}
	}

	return totalIncome;
}

/**
 * Get cost to start a tour
 * Could be modified by upgrades in future
 *
 * @param state - Current game state
 * @returns Cost to start a tour in dollars
 */
export function getTourCost(state: GameState): number {
	// Base cost - could apply discounts based on upgrades
	return TOUR_BASE_COST;
}

/**
 * Get the duration of a tour in milliseconds
 * Could be modified by upgrades in future
 *
 * @param state - Current game state
 * @returns Tour duration in milliseconds
 */
export function getTourDuration(state: GameState): number {
	// Base duration - could apply modifications based on upgrades
	return TOUR_DURATION;
}

/**
 * Enable scarcity tactics on active tours
 * This is called when exploitation abilities are activated
 *
 * @param state - Current game state (will be modified)
 */
export function enableScarcityTactics(state: GameState): void {
	for (const tour of state.tours) {
		if (tour.completedAt === null) {
			tour.usesScarcity = true;
			// Scarcity increases income by TOUR_SCARCITY_MULTIPLIER
			tour.incomePerSecond *= TOUR_SCARCITY_MULTIPLIER;
		}
	}
}

/**
 * Get total revenue earned from all completed tours
 * Useful for statistics and milestones
 *
 * @param state - Current game state
 * @returns Total revenue from completed tours
 */
export function getTotalTourRevenue(state: GameState): number {
	let totalRevenue = 0;

	for (const tour of state.tours) {
		if (tour.completedAt !== null) {
			// Calculate duration and total earnings
			const duration = tour.completedAt - tour.startedAt;
			const durationSeconds = duration / 1000;
			const revenue = tour.incomePerSecond * durationSeconds;
			totalRevenue += revenue;
		}
	}

	return totalRevenue;
}

/**
 * Get stats about tours for display purposes
 *
 * @param state - Current game state
 * @returns Object with tour statistics
 */
export function getTourStats(state: GameState): {
	totalTours: number;
	activeTours: number;
	completedTours: number;
	totalRevenue: number;
	maxActiveTours: number;
} {
	const activeTours = getActiveTourCount(state);
	const completedTours = state.tours.filter((tour) => tour.completedAt !== null).length;

	return {
		totalTours: state.tours.length,
		activeTours,
		completedTours,
		totalRevenue: getTotalTourRevenue(state),
		maxActiveTours: getMaxActiveTours(state)
	};
}
