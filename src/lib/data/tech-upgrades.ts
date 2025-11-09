/**
 * Tech Upgrade Data and Utilities
 *
 * This file provides structured access to tech tier upgrades and related data.
 * The actual upgrade definitions are in config.ts - this file provides
 * helper functions and organization specific to the tech upgrade system.
 */

import { UPGRADES } from '../game/config';
import type { TechTier, UpgradeDefinition } from '../game/types';

/**
 * Get all tech upgrade definitions
 * @returns Array of all available tech upgrades
 */
export function getAllTechUpgrades(): UpgradeDefinition[] {
	return UPGRADES;
}

/**
 * Get all upgrades for a specific tech tier
 * @param tier - The tech tier to filter by (1-7)
 * @returns Array of upgrades for that tier
 */
export function getUpgradesByTier(tier: TechTier): UpgradeDefinition[] {
	return UPGRADES.filter((upgrade) => upgrade.tier === tier);
}

/**
 * Get a specific upgrade by its ID
 * @param upgradeId - The unique upgrade identifier
 * @returns The upgrade definition or undefined if not found
 */
export function getUpgradeById(upgradeId: string): UpgradeDefinition | undefined {
	return UPGRADES.find((upgrade) => upgrade.id === upgradeId);
}

/**
 * Get the next upgrade in a tier progression
 * @param currentUpgradeId - The ID of the current upgrade
 * @returns The next upgrade in sequence or undefined if at end of tier
 */
export function getNextUpgrade(currentUpgradeId: string): UpgradeDefinition | undefined {
	const current = getUpgradeById(currentUpgradeId);
	if (!current) return undefined;

	// Find upgrades that list the current upgrade as a prerequisite
	return UPGRADES.find(
		(upgrade) =>
			upgrade.prerequisites?.includes(currentUpgradeId) && upgrade.tier === current.tier
	);
}

/**
 * Get all upgrades available for purchase given current state
 * @param purchasedUpgradeIds - Set of already purchased upgrade IDs
 * @returns Array of upgrades that can be purchased next
 */
export function getAvailableUpgrades(purchasedUpgradeIds: Set<string>): UpgradeDefinition[] {
	return UPGRADES.filter((upgrade) => {
		// Already purchased
		if (purchasedUpgradeIds.has(upgrade.id)) return false;

		// Check prerequisites
		if (upgrade.prerequisites && upgrade.prerequisites.length > 0) {
			return upgrade.prerequisites.every((prereq) => purchasedUpgradeIds.has(prereq));
		}

		// No prerequisites means it's a starting upgrade (tier 1 basic)
		return true;
	});
}

/**
 * Determine the tech tier and sub-tier from purchased upgrades
 * @param purchasedUpgradeIds - Set of purchased upgrade IDs
 * @returns Object with tier and subTier
 */
export function calculateTechTier(purchasedUpgradeIds: Set<string>): {
	tier: TechTier;
	subTier: 0 | 1 | 2;
} {
	let highestTier: TechTier = 1;
	let highestSubTier: 0 | 1 | 2 = 0;

	// Map of tier to upgrade count (basic=0, improved=1, advanced=2)
	const tierUpgradeCounts: Record<TechTier, number> = {
		1: 0,
		2: 0,
		3: 0,
		4: 0,
		5: 0,
		6: 0,
		7: 0
	};

	// Count purchased upgrades per tier
	for (const upgradeId of purchasedUpgradeIds) {
		const upgrade = getUpgradeById(upgradeId);
		if (upgrade) {
			tierUpgradeCounts[upgrade.tier]++;
		}
	}

	// Find highest tier with at least one purchase
	for (let tier = 7; tier >= 1; tier--) {
		if (tierUpgradeCounts[tier as TechTier] > 0) {
			highestTier = tier as TechTier;
			// Sub-tier is 0-indexed, so 1 purchase = sub-tier 0, 2 = sub-tier 1, 3 = sub-tier 2
			highestSubTier = Math.min(
				tierUpgradeCounts[tier as TechTier] - 1,
				2
			) as 0 | 1 | 2;
			break;
		}
	}

	return { tier: highestTier, subTier: highestSubTier };
}

/**
 * Tech tier names for display purposes
 */
export const TECH_TIER_NAMES: Record<TechTier, string> = {
	1: 'Third-party Web Services',
	2: 'Lifetime Licenses/Subscriptions',
	3: 'Local AI Models',
	4: 'Fine-tuned Models',
	5: 'Train Your Own Models',
	6: 'Build Your Own Software',
	7: 'AI Agent Automation'
};

/**
 * Prestige unlock tiers - which tiers unlock prestige ability
 */
export const PRESTIGE_UNLOCK_TIERS: TechTier[] = [3, 5, 6, 7];

/**
 * Check if a tech tier unlocks prestige
 * @param tier - The tech tier to check
 * @returns True if this tier unlocks prestige
 */
export function doesTierUnlockPrestige(tier: TechTier): boolean {
	return PRESTIGE_UNLOCK_TIERS.includes(tier);
}
