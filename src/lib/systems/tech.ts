/**
 * Tech Tier Upgrade System
 *
 * Manages technology progression, upgrade purchases, and effect application.
 * Handles all 7 tech tiers with 3 sub-tiers each.
 */

import type { GameState, UpgradeDefinition } from '../game/types';
import {
	getAllTechUpgrades,
	getUpgradeById,
	getAvailableUpgrades,
	calculateTechTier
} from '../data/tech-upgrades';
import { BASE_SONG_COST } from '../game/config';
import { toastStore } from '../stores/toasts.svelte';

/**
 * Get all available tech upgrades
 * @returns Array of all tech upgrade definitions
 */
export function getTechUpgrades(): UpgradeDefinition[] {
	return getAllTechUpgrades();
}

/**
 * Check if player can afford a specific upgrade
 * @param state - Current game state
 * @param upgradeId - ID of the upgrade to check
 * @returns True if player can afford the upgrade
 */
export function canAffordUpgrade(state: GameState, upgradeId: string): boolean {
	const upgrade = getUpgradeById(upgradeId);
	if (!upgrade) return false;

	// Check if already purchased
	if (state.upgrades[upgradeId]) return false;

	// Check if player has enough money
	if (state.money < upgrade.cost) return false;

	// Check prerequisites
	if (upgrade.prerequisites && upgrade.prerequisites.length > 0) {
		const allPrereqsMet = upgrade.prerequisites.every((prereqId) =>
			Boolean(state.upgrades[prereqId])
		);
		if (!allPrereqsMet) return false;
	}

	return true;
}

/**
 * Purchase a tech upgrade and apply its effects
 * @param state - Current game state (will be mutated)
 * @param upgradeId - ID of the upgrade to purchase
 * @returns True if purchase was successful, false otherwise
 */
export function purchaseTechUpgrade(state: GameState, upgradeId: string): boolean {
	// Validate purchase
	if (!canAffordUpgrade(state, upgradeId)) {
		return false;
	}

	const upgrade = getUpgradeById(upgradeId);
	if (!upgrade) return false;

	// Deduct cost
	state.money -= upgrade.cost;

	// Record purchase
	state.upgrades[upgradeId] = {
		purchasedAt: Date.now(),
		tier: upgrade.tier
	};

	// Apply effects
	applyTechEffects(state, upgrade);

	// Update tech tier and sub-tier
	const { tier, subTier } = calculateTechTier(new Set(Object.keys(state.upgrades)));
	state.techTier = tier;
	state.techSubTier = subTier;

	return true;
}

/**
 * Apply the effects of a tech upgrade to the game state
 * @param state - Current game state (will be mutated)
 * @param upgrade - The upgrade definition whose effects to apply
 */
export function applyTechEffects(state: GameState, upgrade: UpgradeDefinition): void {
	const { effects } = upgrade;

	// Apply song cost change
	if (effects.songCost !== undefined) {
		// Song cost is tracked implicitly through tech tier
		// The actual cost calculation happens in the song generation system
		// This effect is passive and doesn't require state mutation here
	}

	// Apply song generation speed change
	if (effects.songSpeed !== undefined) {
		state.songGenerationSpeed = effects.songSpeed;
	}

	// Income multiplier is applied by the income calculation system using getTechIncomeMultiplier.
	// Not applied here to avoid incorrect stacking and ensure new songs get the multiplier.

	// NOTE: All system unlocks are handled in unlocks.ts to prevent duplicate toasts
	// Tours require: upgrade + 10 albums + 100K fans
	// Platform ownership requires: upgrade + 50 tours + 1M fans
	// All other systems unlock immediately when upgrade is purchased (checked in unlocks.ts)

	if (effects.unlockMonopoly) {
		state.unlockedSystems.monopoly = true;
	}
}

/**
 * Get upgrades available for purchase given current game state
 * @param state - Current game state
 * @returns Array of purchasable upgrades
 */
export function getAvailableTechUpgrades(state: GameState): UpgradeDefinition[] {
	const purchasedIds = new Set(Object.keys(state.upgrades));
	return getAvailableUpgrades(purchasedIds);
}

/**
 * Get the current song generation cost based on tech tier
 * @param state - Current game state
 * @returns Cost in dollars to generate one song
 */
export function getSongGenerationCost(state: GameState): number {
	// Find the purchased upgrade with the highest tier that sets songCost
	const upgradesWithCost = Object.keys(state.upgrades)
		.map((id) => getUpgradeById(id))
		.filter((upgrade): upgrade is UpgradeDefinition => upgrade !== undefined)
		.filter((upgrade) => upgrade.effects.songCost !== undefined);

	// Find the upgrade with the lowest cost (progression is enforced by prerequisites,
	// so the most advanced upgrade will have the lowest cost)
	const bestUpgrade = upgradesWithCost.reduce<UpgradeDefinition | undefined>(
		(best, upgrade) => {
			if (!best) return upgrade;
			// Compare by tier first (higher is better)
			if (upgrade.tier > best.tier) return upgrade;
			if (upgrade.tier < best.tier) return best;
			// Same tier - compare by cost (lower is better)
			if (upgrade.effects.songCost! < best.effects.songCost!) return upgrade;
			return best;
		},
		undefined
	);

	if (bestUpgrade) {
		return bestUpgrade.effects.songCost!;
	}

	// Default to base cost from config
	return BASE_SONG_COST;
}

/**
 * Calculate the total income multiplier from all purchased tech upgrades
 * @param state - Current game state
 * @returns The cumulative income multiplier
 */
export function getTechIncomeMultiplier(state: GameState): number {
	const purchasedUpgrades = Object.keys(state.upgrades)
		.map((id) => getUpgradeById(id))
		.filter((upgrade): upgrade is UpgradeDefinition => upgrade !== undefined);

	// Find the highest income multiplier (they don't stack, just use the best one)
	let maxMultiplier = 1.0;
	for (const upgrade of purchasedUpgrades) {
		if (upgrade.effects.incomeMultiplier !== undefined) {
			maxMultiplier = Math.max(maxMultiplier, upgrade.effects.incomeMultiplier);
		}
	}

	return maxMultiplier;
}

/**
 * Get a summary of the current tech progression
 * @param state - Current game state
 * @returns Object with tech tier info and stats
 */
export function getTechProgressionSummary(state: GameState) {
	const purchasedCount = Object.keys(state.upgrades).length;
	const totalCount = getAllTechUpgrades().length;
	const availableUpgrades = getAvailableTechUpgrades(state);
	const nextUpgrade = availableUpgrades[0]; // First available is typically the next in sequence

	return {
		currentTier: state.techTier,
		currentSubTier: state.techSubTier,
		purchasedUpgrades: purchasedCount,
		totalUpgrades: totalCount,
		progressPercentage: (purchasedCount / totalCount) * 100,
		nextUpgrade: nextUpgrade || null,
		availableUpgradesCount: availableUpgrades.length,
		prestigeUnlocked: state.unlockedSystems.prestige,
		songGenerationSpeed: state.songGenerationSpeed,
		songGenerationCost: getSongGenerationCost(state),
		incomeMultiplier: getTechIncomeMultiplier(state)
	};
}
