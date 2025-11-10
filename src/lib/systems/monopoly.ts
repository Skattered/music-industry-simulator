/**
 * Monopoly System
 *
 * Handles late-game industry platform ownership mechanics.
 * Players can purchase major music industry infrastructure to:
 * - Generate massive passive income from other artists
 * - Increase industry control percentage
 * - Progress toward total music industry domination
 *
 * Unlock Requirements:
 * - 50 tours completed
 * - 1,000,000 fans
 * - Own Your Software (tech tier 6)
 */

import type { GameState, Platform } from '../game/types';
import {
	PLATFORM_DEFINITIONS,
	getPlatformDefinition,
	canPurchasePlatform
} from '../data/platforms';

// ============================================================================
// UNLOCK CONDITIONS
// ============================================================================

/**
 * Minimum tours completed to unlock platform ownership
 */
export const MIN_TOURS_FOR_PLATFORMS = 50;

/**
 * Minimum fans required to unlock platform ownership
 */
export const MIN_FANS_FOR_PLATFORMS = 1_000_000;

/**
 * Minimum tech tier required to unlock platform ownership (tier 6 = Own Your Software)
 */
export const MIN_TECH_TIER_FOR_PLATFORMS = 6;

/**
 * Check if platform ownership system is unlocked
 *
 * Requirements:
 * - At least 50 tours completed
 * - At least 1,000,000 fans
 * - Tech tier 6 or higher (Own Your Software)
 *
 * @param state - Current game state
 * @returns true if platform ownership is unlocked
 */
export function unlockPlatformOwnership(state: GameState): boolean {
	// Count completed tours
	const completedTours = state.tours.filter((tour) => tour.completedAt !== null).length;

	// Check all requirements
	const hasEnoughTours = completedTours >= MIN_TOURS_FOR_PLATFORMS;
	const hasEnoughFans = state.fans >= MIN_FANS_FOR_PLATFORMS;
	const hasRequiredTech = state.techTier >= MIN_TECH_TIER_FOR_PLATFORMS;

	return hasEnoughTours && hasEnoughFans && hasRequiredTech;
}

// ============================================================================
// PLATFORM PURCHASE
// ============================================================================

/**
 * Purchase a platform
 *
 * Validates prerequisites, checks affordability, deducts cost,
 * and adds platform to owned platforms.
 *
 * @param state - Current game state (will be mutated)
 * @param platformId - ID of platform to purchase
 * @returns true if purchase successful, false otherwise
 */
export function purchasePlatform(state: GameState, platformId: string): boolean {
	// Check if platform ownership is unlocked
	if (!state.unlockedSystems.platformOwnership) {
		return false;
	}

	// Get platform definition
	const platformDef = getPlatformDefinition(platformId);
	if (!platformDef) {
		return false;
	}

	// Get list of owned platform IDs
	const ownedPlatformIds = state.ownedPlatforms.map((p) => p.id);

	// Check if can purchase (prerequisites, not already owned, affordability)
	if (!canPurchasePlatform(platformId, ownedPlatformIds, state.money)) {
		return false;
	}

	// Deduct cost
	state.money -= platformDef.baseCost;

	// Create platform instance
	const platform: Platform = {
		id: platformDef.id,
		type: platformDef.type,
		name: platformDef.name,
		cost: platformDef.baseCost,
		acquiredAt: Date.now(),
		incomePerSecond: platformDef.incomePerSecond,
		controlContribution: platformDef.controlContribution
	};

	// Add to owned platforms
	state.ownedPlatforms.push(platform);

	// Update industry control
	updateControlProgress(state);

	return true;
}

// ============================================================================
// INDUSTRY CONTROL
// ============================================================================

/**
 * Calculate current industry control percentage from owned platforms
 *
 * Sums up control contributions from all owned platforms.
 * Does not include other sources (milestones, etc) - just platform ownership.
 *
 * @param state - Current game state
 * @returns Industry control percentage from platforms (0-100+)
 */
export function calculateIndustryControl(state: GameState): number {
	let control = 0;

	for (const platform of state.ownedPlatforms) {
		control += platform.controlContribution;
	}

	return control;
}

/**
 * Update the game state's industry control based on owned platforms
 *
 * This function updates state.industryControl by adding platform contributions.
 * It preserves any existing control from other sources (prestige, milestones, etc.)
 *
 * Note: In full implementation, this should be part of a larger control system
 * that tracks various sources of control. For now, it focuses on platform contributions.
 *
 * @param state - Current game state (will be mutated)
 */
export function updateControlProgress(state: GameState): void {
	// Calculate platform control contribution
	const platformControl = calculateIndustryControl(state);

	// For now, set industry control to platform control
	// In a full implementation, this would add to existing control from other sources
	// (prestige bonuses, tech milestones, fan thresholds, etc.)
	state.industryControl = Math.min(platformControl, 100);
}

// ============================================================================
// PLATFORM INCOME
// ============================================================================

/**
 * Process platform income and add to money
 *
 * Note: Platform income calculation is already handled in the income system
 * (see src/lib/systems/income.ts - calculatePlatformIncome).
 * This function is provided for completeness and explicit integration.
 *
 * @param state - Current game state (will be mutated)
 * @param deltaTime - Time elapsed since last update in milliseconds
 */
export function processPlatformIncome(state: GameState, deltaTime: number): void {
	// Calculate income per second from all platforms
	let incomePerSecond = 0;
	for (const platform of state.ownedPlatforms) {
		incomePerSecond += platform.incomePerSecond;
	}

	// Convert to income for this tick
	const deltaSeconds = deltaTime / 1000;
	const income = incomePerSecond * deltaSeconds;

	// Add to money
	state.money += income;
}

// ============================================================================
// PLATFORM QUERIES
// ============================================================================

/**
 * Get total passive income per second from all owned platforms
 *
 * @param state - Current game state
 * @returns Total income per second in dollars
 */
export function getPlatformIncomeRate(state: GameState): number {
	let incomePerSecond = 0;
	for (const platform of state.ownedPlatforms) {
		incomePerSecond += platform.incomePerSecond;
	}
	return incomePerSecond;
}

/**
 * Get the total amount spent on platforms
 *
 * @param state - Current game state
 * @returns Total cost of all owned platforms in dollars
 */
export function getTotalPlatformInvestment(state: GameState): number {
	let total = 0;
	for (const platform of state.ownedPlatforms) {
		total += platform.cost;
	}
	return total;
}

/**
 * Check if all platforms have been acquired
 *
 * @param state - Current game state
 * @returns true if all platforms are owned
 */
export function hasAllPlatforms(state: GameState): boolean {
	return state.ownedPlatforms.length >= PLATFORM_DEFINITIONS.length;
}

/**
 * Get progress toward owning all platforms
 *
 * @param state - Current game state
 * @returns Object with current count, total count, and percentage
 */
export function getPlatformProgress(state: GameState): {
	owned: number;
	total: number;
	percentage: number;
} {
	const owned = state.ownedPlatforms.length;
	const total = PLATFORM_DEFINITIONS.length;
	const percentage = total > 0 ? (owned / total) * 100 : 0;

	return { owned, total, percentage };
}
