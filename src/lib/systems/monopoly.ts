/**
 * Monopoly System - Platform Ownership & Industry Control
 *
 * Late-game system where players can purchase major industry infrastructure
 * to gain monopolistic control over the music industry.
 *
 * Features:
 * - Platform ownership (streaming, ticketing, venues, charts, awards, AI data)
 * - Industry control percentage tracking
 * - Massive passive income generation
 * - Victory condition contribution
 *
 * Unlock Requirements:
 * - 50 tours completed
 * - 1,000,000 fans
 * - Own Your Software (tech tier 6)
 */

import type { GameState, Platform } from '../game/types';
import {
	getAllPlatforms,
	getPlatformByType,
	getAvailablePlatforms,
	calculatePlatformCost,
	getTotalPossibleControl
} from '../data/platforms';
import { INDUSTRY_CONTROL_WIN_THRESHOLD, PHASE_REQUIREMENTS } from '../game/config';

/**
 * Requirements to unlock platform ownership system
 */
export const PLATFORM_UNLOCK_REQUIREMENTS = {
	minTours: 50,
	minFans: 1_000_000,
	minTechTier: 6 // Own Your Software
} as const;

/**
 * Check if platform ownership system should be unlocked
 * @param state - Current game state
 * @returns True if all requirements are met
 */
export function shouldUnlockPlatformOwnership(state: GameState): boolean {
	// Count completed tours
	const completedTours = state.tours.filter((tour) => tour.completedAt !== null).length;

	return (
		completedTours >= PLATFORM_UNLOCK_REQUIREMENTS.minTours &&
		state.fans >= PLATFORM_UNLOCK_REQUIREMENTS.minFans &&
		state.techTier >= PLATFORM_UNLOCK_REQUIREMENTS.minTechTier
	);
}

/**
 * Unlock platform ownership if requirements are met
 * Updates the game state to enable platform purchasing
 * @param state - Current game state (will be mutated)
 * @returns True if platform ownership was newly unlocked
 */
export function unlockPlatformOwnership(state: GameState): boolean {
	// Already unlocked
	if (state.unlockedSystems.platformOwnership) {
		return false;
	}

	// Check requirements
	if (!shouldUnlockPlatformOwnership(state)) {
		return false;
	}

	// Unlock the system
	state.unlockedSystems.platformOwnership = true;
	return true;
}

/**
 * Check if player can afford a specific platform
 * @param state - Current game state
 * @param platformType - Type of platform to check
 * @returns True if player has enough money and platform is available
 */
export function canAffordPlatform(state: GameState, platformType: Platform['type']): boolean {
	// System must be unlocked
	if (!state.unlockedSystems.platformOwnership) {
		return false;
	}

	// Platform must not already be owned
	if (state.ownedPlatforms.some((p) => p.type === platformType)) {
		return false;
	}

	// Platform must exist
	const platformDef = getPlatformByType(platformType);
	if (!platformDef) {
		return false;
	}

	// Player must have enough money
	const cost = calculatePlatformCost(platformType);
	return state.money >= cost;
}

/**
 * Purchase a platform and add it to owned platforms
 * @param state - Current game state (will be mutated)
 * @param platformType - Type of platform to purchase
 * @returns True if purchase was successful
 */
export function purchasePlatform(state: GameState, platformType: Platform['type']): boolean {
	// Validate purchase
	if (!canAffordPlatform(state, platformType)) {
		return false;
	}

	const platformDef = getPlatformByType(platformType);
	if (!platformDef) {
		return false;
	}

	// Calculate cost
	const cost = calculatePlatformCost(platformType);

	// Deduct money
	state.money -= cost;

	// Create platform instance
	const platform: Platform = {
		id: `${platformType}_${Date.now()}`,
		type: platformType,
		name: platformDef.name,
		cost: cost,
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

/**
 * Process passive income from owned platforms
 * Called each game tick to generate platform revenue
 * @param state - Current game state (will be mutated)
 * @param deltaTime - Time elapsed since last update in milliseconds
 */
export function processPlatformIncome(state: GameState, deltaTime: number): void {
	// Platform income is already handled by the income system
	// This function exists for completeness and future extensions
	// (e.g., platform-specific events, maintenance costs, etc.)

	// Income calculation is delegated to the income system
	// See src/lib/systems/income.ts -> calculatePlatformIncome()
}

/**
 * Calculate total industry control percentage
 * Based on owned platforms and other achievements
 * @param state - Current game state
 * @returns Industry control percentage (0-100+)
 */
export function calculateIndustryControl(state: GameState): number {
	let control = 0;

	// Add control from owned platforms
	for (const platform of state.ownedPlatforms) {
		control += platform.controlContribution;
	}

	// Additional control sources could be added here:
	// - Prestige count bonus
	// - Fan milestones
	// - Tech tier achievements
	// These are intentionally not included to keep platforms as primary source

	return control;
}

/**
 * Update the industry control progress bar
 * Recalculates and updates state.industryControl
 * @param state - Current game state (will be mutated)
 */
export function updateControlProgress(state: GameState): void {
	state.industryControl = calculateIndustryControl(state);
}

/**
 * Check if player has achieved victory condition
 * Victory occurs when industry control reaches 100%
 * @param state - Current game state
 * @returns True if player has won the game
 */
export function hasAchievedVictory(state: GameState): boolean {
	return state.industryControl >= INDUSTRY_CONTROL_WIN_THRESHOLD;
}

/**
 * Get list of platforms available for purchase
 * Excludes already owned platforms
 * @param state - Current game state
 * @returns Array of available platform definitions
 */
export function getAvailablePlatformsForPurchase(state: GameState) {
	if (!state.unlockedSystems.platformOwnership) {
		return [];
	}
	return getAvailablePlatforms(state.ownedPlatforms);
}

/**
 * Get summary of monopoly progression
 * @param state - Current game state
 * @returns Object with monopoly stats and status
 */
export function getMonopolySummary(state: GameState) {
	const totalPlatforms = getAllPlatforms().length;
	const ownedCount = state.ownedPlatforms.length;
	const availablePlatforms = getAvailablePlatformsForPurchase(state);
	const totalPossibleControl = getTotalPossibleControl();
	const currentControl = calculateIndustryControl(state);

	// Calculate total passive income from platforms
	const platformIncome = state.ownedPlatforms.reduce(
		(sum, p) => sum + p.incomePerSecond,
		0
	);

	return {
		unlocked: state.unlockedSystems.platformOwnership,
		ownedPlatforms: ownedCount,
		totalPlatforms,
		availablePlatforms: availablePlatforms.length,
		industryControl: currentControl,
		totalPossibleControl,
		controlPercentage: (currentControl / totalPossibleControl) * 100,
		platformIncome,
		hasWon: hasAchievedVictory(state),
		requirementsmet: shouldUnlockPlatformOwnership(state)
	};
}

/**
 * Get next recommended platform to purchase
 * Based on cost-effectiveness (control contribution per dollar)
 * @param state - Current game state
 * @returns Best platform to purchase next, or null if none available
 */
export function getRecommendedPlatform(state: GameState) {
	const available = getAvailablePlatformsForPurchase(state);

	if (available.length === 0) {
		return null;
	}

	// Sort by control per dollar (value efficiency)
	const sorted = [...available].sort((a, b) => {
		const efficiencyA = a.controlContribution / a.baseCost;
		const efficiencyB = b.controlContribution / b.baseCost;
		return efficiencyB - efficiencyA;
	});

	return sorted[0];
}

/**
 * Calculate progress toward platform ownership unlock
 * @param state - Current game state
 * @returns Object with progress percentages for each requirement
 */
export function getUnlockProgress(state: GameState) {
	const completedTours = state.tours.filter((tour) => tour.completedAt !== null).length;

	return {
		tours: {
			current: completedTours,
			required: PLATFORM_UNLOCK_REQUIREMENTS.minTours,
			percentage: Math.min(
				(completedTours / PLATFORM_UNLOCK_REQUIREMENTS.minTours) * 100,
				100
			)
		},
		fans: {
			current: state.fans,
			required: PLATFORM_UNLOCK_REQUIREMENTS.minFans,
			percentage: Math.min(
				(state.fans / PLATFORM_UNLOCK_REQUIREMENTS.minFans) * 100,
				100
			)
		},
		techTier: {
			current: state.techTier,
			required: PLATFORM_UNLOCK_REQUIREMENTS.minTechTier,
			met: state.techTier >= PLATFORM_UNLOCK_REQUIREMENTS.minTechTier
		},
		allRequirementsMet: shouldUnlockPlatformOwnership(state)
	};
}

/**
 * Purchase multiple platforms at once (batch purchase)
 * Useful for late-game when player has massive capital
 * @param state - Current game state (will be mutated)
 * @param platformTypes - Array of platform types to purchase
 * @returns Array of successfully purchased platform types
 */
export function purchaseMultiplePlatforms(
	state: GameState,
	platformTypes: Platform['type'][]
): Platform['type'][] {
	const purchased: Platform['type'][] = [];

	for (const type of platformTypes) {
		if (purchasePlatform(state, type)) {
			purchased.push(type);
		}
	}

	return purchased;
}

/**
 * Get estimated time to afford a platform based on current income
 * @param state - Current game state
 * @param platformType - Type of platform to estimate
 * @param incomePerSecond - Current income rate
 * @returns Estimated seconds until affordable, or null if already affordable
 */
export function getTimeToAfford(
	state: GameState,
	platformType: Platform['type'],
	incomePerSecond: number
): number | null {
	const platformDef = getPlatformByType(platformType);
	if (!platformDef) {
		return null;
	}

	const cost = calculatePlatformCost(platformType);
	const deficit = cost - state.money;

	// Already affordable
	if (deficit <= 0) {
		return 0;
	}

	// No income, will never afford
	if (incomePerSecond <= 0) {
		return Infinity;
	}

	return deficit / incomePerSecond;
}
