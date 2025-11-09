/**
 * Tour and Concert System
 *
 * Handles tour creation, management, and income generation.
 * Tours unlock at phase 3 and provide significant passive income.
 * Higher tech tiers enable running multiple simultaneous tours.
 */

import type { GameState, Tour } from '../game/types';
import {
	TOUR_BASE_COST,
	TOUR_DURATION,
	TOUR_BASE_INCOME_PER_SECOND,
	TOUR_FAN_MULTIPLIER,
	MAX_ACTIVE_TOURS
} from '../game/config';

// ============================================================================
// TOUR NAME GENERATION
// ============================================================================

const TOUR_PREFIXES = [
	'World',
	'Global',
	'International',
	'Continental',
	'Mega',
	'Ultimate',
	'Legendary',
	'Epic',
	'Grand',
	'Supreme'
];

const TOUR_THEMES = [
	'Domination',
	'Revolution',
	'Experience',
	'Journey',
	'Spectacle',
	'Phenomenon',
	'Extravaganza',
	'Festival',
	'Odyssey',
	'Adventure'
];

/**
 * Generate a random tour name
 */
function generateTourName(): string {
	const prefix = TOUR_PREFIXES[Math.floor(Math.random() * TOUR_PREFIXES.length)];
	const theme = TOUR_THEMES[Math.floor(Math.random() * TOUR_THEMES.length)];
	const year = new Date().getFullYear();
	return `${prefix} ${theme} Tour ${year}`;
}

// ============================================================================
// UNLOCK SYSTEM
// ============================================================================

/**
 * Check if tours are unlocked and ready to use
 *
 * Requirements:
 * - Tours system unlocked via tech upgrade (tier 3 advanced)
 * - 10 physical albums released
 * - 100,000 fans
 *
 * @param state - Current game state
 * @returns true if tours can be started
 */
export function unlockTours(state: GameState): boolean {
	// Must have tours system unlocked
	if (!state.unlockedSystems.tours) {
		return false;
	}

	// Must have released at least 10 physical albums
	if (state.physicalAlbums.length < 10) {
		return false;
	}

	// Must have at least 100,000 fans
	if (state.fans < 100_000) {
		return false;
	}

	return true;
}

// ============================================================================
// TOUR MANAGEMENT
// ============================================================================

/**
 * Calculate the maximum number of simultaneous tours based on tech tier
 * Higher tech tiers enable more simultaneous tours (AI advantage)
 *
 * @param state - Current game state
 * @returns Maximum number of simultaneous tours
 */
export function canRunMultipleTours(state: GameState): number {
	// Base: 1 tour at tier 3
	// Tier 4: 2 tours
	// Tier 5: 3 tours
	// Tier 6+: 4 tours (exceeds MAX_ACTIVE_TOURS for future-proofing)

	if (state.techTier >= 6) {
		return 4;
	} else if (state.techTier >= 5) {
		return 3;
	} else if (state.techTier >= 4) {
		return 2;
	} else {
		return 1;
	}
}

/**
 * Get the number of currently active tours
 *
 * @param state - Current game state
 * @returns Number of tours currently running
 */
function getActiveTourCount(state: GameState): number {
	const now = Date.now();
	return state.tours.filter((tour) => tour.completedAt === null).length;
}

/**
 * Calculate the cost to start a tour
 * Base cost with scaling based on number of previous tours
 *
 * @param state - Current game state
 * @returns Cost in dollars to start a tour
 */
export function calculateTourCost(state: GameState): number {
	// Cost scales slightly with number of tours completed to prevent spam
	const completedTours = state.tours.filter((tour) => tour.completedAt !== null).length;
	const costMultiplier = 1 + completedTours * 0.1; // +10% per completed tour
	return Math.floor(TOUR_BASE_COST * costMultiplier);
}

/**
 * Calculate income per second for a new tour
 * Scales with fan count and total song catalog
 *
 * @param state - Current game state
 * @returns Income per second in dollars
 */
function calculateTourIncomePerSecond(state: GameState): number {
	// Base income
	let incomePerSecond = TOUR_BASE_INCOME_PER_SECOND;

	// Scale with fan count (primary factor)
	incomePerSecond += state.fans * TOUR_FAN_MULTIPLIER;

	// Scale with song catalog (each song adds value to the tour)
	const songCatalogBonus = state.songs.length * 100; // $100/sec per song
	incomePerSecond += songCatalogBonus;

	return incomePerSecond;
}

/**
 * Check if player can afford to start a tour
 *
 * @param state - Current game state
 * @returns true if player can afford a tour
 */
export function canAffordTour(state: GameState): boolean {
	const cost = calculateTourCost(state);
	return state.money >= cost;
}

/**
 * Check if player can start a new tour
 * Checks unlock status, active tour limit, and affordability
 *
 * @param state - Current game state
 * @returns true if a new tour can be started
 */
export function canStartTour(state: GameState): boolean {
	// Tours must be unlocked
	if (!unlockTours(state)) {
		return false;
	}

	// Check if we've reached the simultaneous tour limit
	const activeTours = getActiveTourCount(state);
	const maxTours = Math.min(canRunMultipleTours(state), MAX_ACTIVE_TOURS);
	if (activeTours >= maxTours) {
		return false;
	}

	// Must be able to afford the tour
	if (!canAffordTour(state)) {
		return false;
	}

	return true;
}

/**
 * Start a new tour
 *
 * @param state - Current game state (will be modified)
 * @returns The newly created Tour object
 * @throws Error if tour cannot be started
 */
export function startTour(state: GameState): Tour {
	if (!canStartTour(state)) {
		throw new Error('Cannot start tour: requirements not met');
	}

	// Calculate and deduct cost
	const cost = calculateTourCost(state);
	state.money -= cost;

	// Create new tour
	const tour: Tour = {
		id: crypto.randomUUID(),
		name: generateTourName(),
		startedAt: Date.now(),
		completedAt: null,
		incomePerSecond: calculateTourIncomePerSecond(state),
		usesScarcity: false // Can be extended later with upgrade system
	};

	// Add to tours list
	state.tours.push(tour);

	return tour;
}

// ============================================================================
// TOUR PROCESSING
// ============================================================================

/**
 * Process all active tours and complete those that have finished
 *
 * @param state - Current game state (will be modified)
 * @param deltaTime - Time elapsed since last update in milliseconds
 */
export function processTours(state: GameState, deltaTime: number): void {
	const now = Date.now();

	// Process each active tour
	for (const tour of state.tours) {
		// Skip already completed tours
		if (tour.completedAt !== null) {
			continue;
		}

		// Check if tour duration has elapsed
		const elapsed = now - tour.startedAt;
		if (elapsed >= TOUR_DURATION) {
			// Mark tour as completed
			tour.completedAt = now;
		}
	}
}

// ============================================================================
// INCOME CALCULATION
// ============================================================================

/**
 * Calculate total income per second from all active tours
 *
 * @param state - Current game state
 * @returns Total tour income per second in dollars
 */
export function calculateTourIncome(state: GameState): number {
	const now = Date.now();
	let totalIncome = 0;

	// Sum income from all active tours
	for (const tour of state.tours) {
		// Only count active (not completed) tours
		if (tour.completedAt === null) {
			totalIncome += tour.incomePerSecond;
		}
	}

	return totalIncome;
}

// ============================================================================
// UPGRADE SYSTEM (Future expansion)
// ============================================================================

/**
 * Apply scarcity tactics to a tour for increased income
 * This is a placeholder for future exploitation mechanics
 *
 * @param state - Current game state
 * @param tourId - ID of tour to modify
 * @returns true if scarcity was applied
 */
export function applyScarcityTactics(state: GameState, tourId: string): boolean {
	const tour = state.tours.find((t) => t.id === tourId);
	if (!tour || tour.completedAt !== null) {
		return false;
	}

	// Mark tour as using scarcity
	tour.usesScarcity = true;

	// Increase income by 50% for scarcity tactics
	tour.incomePerSecond *= 1.5;

	return true;
}
