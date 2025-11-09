/**
 * Exploitation Ability Data and Utilities
 *
 * This file provides structured access to exploitation abilities and related data.
 * The actual ability definitions are in config.ts - this file provides
 * helper functions and organization specific to the exploitation system.
 */

import { BOOSTS } from '../game/config';
import type { BoostDefinition, BoostType, Phase } from '../game/types';

/**
 * Get all exploitation ability definitions
 * @returns Array of all available abilities
 */
export function getAllAbilities(): BoostDefinition[] {
	return BOOSTS;
}

/**
 * Get a specific ability by its ID
 * @param abilityId - The unique ability identifier
 * @returns The ability definition or undefined if not found
 */
export function getAbilityById(abilityId: string): BoostDefinition | undefined {
	return BOOSTS.find((boost) => boost.id === abilityId);
}

/**
 * Get a specific ability by its type
 * @param boostType - The boost type
 * @returns The ability definition or undefined if not found
 */
export function getAbilityByType(boostType: BoostType): BoostDefinition | undefined {
	return BOOSTS.find((boost) => boost.type === boostType);
}

/**
 * Get all abilities for a specific phase
 * @param phase - The game phase (1-5)
 * @returns Array of abilities available in that phase
 */
export function getAbilitiesByPhase(phase: Phase): BoostDefinition[] {
	// Map abilities to their minimum phase requirements
	const phaseAbilities: Record<Phase, BoostType[]> = {
		1: ['bot_streams', 'playlist_placement', 'social_media_campaign'],
		2: [
			'bot_streams',
			'playlist_placement',
			'social_media_campaign',
			'limited_edition_variants',
			'shut_down_competitors',
			'exclusive_retailer_deals'
		],
		3: [
			'bot_streams',
			'playlist_placement',
			'social_media_campaign',
			'limited_edition_variants',
			'shut_down_competitors',
			'exclusive_retailer_deals',
			'scalp_records',
			'limit_tickets',
			'scalp_tickets',
			'fomo_marketing'
		],
		4: [
			'bot_streams',
			'playlist_placement',
			'social_media_campaign',
			'limited_edition_variants',
			'shut_down_competitors',
			'exclusive_retailer_deals',
			'scalp_records',
			'limit_tickets',
			'scalp_tickets',
			'fomo_marketing',
			'dynamic_pricing'
		],
		5: [
			'bot_streams',
			'playlist_placement',
			'social_media_campaign',
			'limited_edition_variants',
			'shut_down_competitors',
			'exclusive_retailer_deals',
			'scalp_records',
			'limit_tickets',
			'scalp_tickets',
			'fomo_marketing',
			'dynamic_pricing'
		]
	};

	const allowedTypes = phaseAbilities[phase] || [];
	return BOOSTS.filter((boost) => allowedTypes.includes(boost.type));
}

/**
 * Phase names for display purposes
 */
export const PHASE_NAMES: Record<Phase, string> = {
	1: 'Streaming Phase',
	2: 'Physical Albums Phase',
	3: 'Tours & Concerts Phase',
	4: 'Platform Ownership Phase',
	5: 'Total Automation Phase'
};

/**
 * Get the phase when an ability is first unlocked
 * @param abilityId - The unique ability identifier
 * @returns The phase when this ability unlocks, or 1 if not found
 */
export function getAbilityUnlockPhase(abilityId: string): Phase {
	const ability = getAbilityById(abilityId);
	if (!ability) return 1;

	// Determine unlock phase based on ability type
	const phaseMap: Record<BoostType, Phase> = {
		bot_streams: 1,
		playlist_placement: 1,
		social_media_campaign: 1,
		limited_edition_variants: 2,
		shut_down_competitors: 2,
		exclusive_retailer_deals: 2,
		scalp_records: 3,
		limit_tickets: 3,
		scalp_tickets: 3,
		fomo_marketing: 3,
		dynamic_pricing: 4
	};

	return phaseMap[ability.type] || 1;
}

/**
 * Get abilities that are focused on income generation
 * @returns Array of income-focused abilities
 */
export function getIncomeAbilities(): BoostDefinition[] {
	return BOOSTS.filter((boost) => boost.incomeMultiplier > boost.fanMultiplier);
}

/**
 * Get abilities that are focused on fan generation
 * @returns Array of fan-focused abilities
 */
export function getFanAbilities(): BoostDefinition[] {
	return BOOSTS.filter((boost) => boost.fanMultiplier > boost.incomeMultiplier);
}

/**
 * Get the most powerful ability (highest combined multiplier)
 * @returns The most powerful ability definition
 */
export function getMostPowerfulAbility(): BoostDefinition {
	return BOOSTS.reduce((prev, current) => {
		const prevPower = prev.incomeMultiplier + prev.fanMultiplier;
		const currentPower = current.incomeMultiplier + current.fanMultiplier;
		return currentPower > prevPower ? current : prev;
	});
}

/**
 * Get the cheapest ability (lowest base cost)
 * @returns The cheapest ability definition
 */
export function getCheapestAbility(): BoostDefinition {
	return BOOSTS.reduce((prev, current) => (current.baseCost < prev.baseCost ? current : prev));
}
