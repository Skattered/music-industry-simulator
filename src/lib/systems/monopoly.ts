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
 * Calculate current industry control percentage from all sources
 *
 * Control sources (designed to reach 100% after 3-5 prestiges):
 * - Fan milestones: 10k (2%), 100k (3%), 1M (4%), 10M (5%) = 14% total
 * - Tech tiers: T3 (5%), T6 (8%), T7 (10%) = 23% total
 * - Phase unlocks: P2 (5%), P3 (6%), P4 (7%), P5 (8%) = 26% total
 * - Prestige bonuses: 8% per prestige (24% at 3 prestiges, 40% at 5)
 * - Platform ownership: varies, 15-30% per platform (115% total available)
 *
 * Expected progression to 100%:
 * - 3 prestiges + minimal platforms: 63% (milestones) + 24% (prestige) + 13% (platforms) = 100%
 * - 5 prestiges + no platforms: 63% + 40% = 103% (over 100%)
 *
 * Progress persists through prestige - industry control NEVER decreases.
 *
 * @param state - Current game state
 * @returns Industry control percentage (0-100)
 */
export function calculateIndustryControl(state: GameState): number {
	let control = 0;

	// Fan milestones (14% total)
	if (state.fans >= 10_000) control += 2;
	if (state.fans >= 100_000) control += 3;
	if (state.fans >= 1_000_000) control += 4;
	if (state.fans >= 10_000_000) control += 5;

	// Tech tier achievements (23% total)
	if (state.techTier >= 3) control += 5; // Local AI Models
	if (state.techTier >= 6) control += 8; // Own Your Software
	if (state.techTier >= 7) control += 10; // AI Agents

	// Phase unlocks (26% total)
	if (state.phase >= 2) control += 5; // Physical Albums
	if (state.phase >= 3) control += 6; // Tours & Concerts
	if (state.phase >= 4) control += 7; // Platform Ownership
	if (state.phase >= 5) control += 8; // Total Automation

	// Prestige bonuses (8% per prestige)
	control += state.prestigeCount * 8;

	// Platform ownership (15-30% per platform, 125% total available)
	for (const platform of state.ownedPlatforms) {
		control += platform.controlContribution;
	}

	// Cap at 100% for victory
	return Math.min(control, 100);
}

/**
 * Update the game state's industry control based on all achievement sources
 *
 * Recalculates industry control from fan milestones, tech tiers, phase unlocks,
 * prestige count, and platform ownership. Progress persists through prestige.
 *
 * @param state - Current game state (will be mutated)
 */
export function updateControlProgress(state: GameState): void {
	state.industryControl = calculateIndustryControl(state);
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
