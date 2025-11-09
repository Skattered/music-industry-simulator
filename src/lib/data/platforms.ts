/**
 * Platform Ownership Data and Utilities
 *
 * This file provides structured access to platform definitions and related data
 * for the late-game monopoly system where players can purchase industry infrastructure.
 *
 * Platforms represent major industry control points:
 * - Streaming services
 * - Ticketing platforms
 * - Concert venues
 * - Billboard charts
 * - The Grammys
 * - AI training data monopoly
 *
 * Each platform provides:
 * - Massive passive income
 * - Industry control percentage contribution
 * - Strategic monopoly over a segment of the music industry
 */

import { PLATFORM_DEFINITIONS } from '../game/config';
import type { Platform } from '../game/types';

/**
 * Platform definition from configuration
 * Includes all static properties before purchase
 */
export interface PlatformDefinition {
	readonly type: 'streaming' | 'ticketing' | 'venue' | 'billboard' | 'grammys' | 'training_data';
	readonly name: string;
	readonly baseCost: number;
	readonly incomePerSecond: number;
	readonly controlContribution: number;
}

/**
 * Get all available platform definitions
 * @returns Array of all platform definitions from config
 */
export function getAllPlatforms(): readonly PlatformDefinition[] {
	return PLATFORM_DEFINITIONS;
}

/**
 * Get a specific platform definition by type
 * @param type - The platform type identifier
 * @returns Platform definition or undefined if not found
 */
export function getPlatformByType(
	type: Platform['type']
): PlatformDefinition | undefined {
	return PLATFORM_DEFINITIONS.find((p) => p.type === type);
}

/**
 * Get platforms that are available for purchase (not yet owned)
 * @param ownedPlatforms - Array of already owned platforms
 * @returns Array of platform definitions that can be purchased
 */
export function getAvailablePlatforms(ownedPlatforms: Platform[]): PlatformDefinition[] {
	const ownedTypes = new Set(ownedPlatforms.map((p) => p.type));
	return PLATFORM_DEFINITIONS.filter((p) => !ownedTypes.has(p.type));
}

/**
 * Calculate the cost to purchase a platform
 * Currently uses base cost, but could be extended with dynamic pricing
 * @param platformType - The type of platform to price
 * @returns Cost in dollars
 */
export function calculatePlatformCost(platformType: Platform['type']): number {
	const platform = getPlatformByType(platformType);
	return platform?.baseCost ?? 0;
}

/**
 * Get platforms sorted by cost (cheapest first)
 * Useful for displaying purchase options in order of accessibility
 * @returns Array of platforms sorted by ascending cost
 */
export function getPlatformsSortedByCost(): readonly PlatformDefinition[] {
	return [...PLATFORM_DEFINITIONS].sort((a, b) => a.baseCost - b.baseCost);
}

/**
 * Get platforms sorted by control contribution (highest impact first)
 * Useful for strategic decision making
 * @returns Array of platforms sorted by descending control contribution
 */
export function getPlatformsSortedByControl(): readonly PlatformDefinition[] {
	return [...PLATFORM_DEFINITIONS].sort((a, b) => b.controlContribution - a.controlContribution);
}

/**
 * Get platforms sorted by income potential (highest earners first)
 * Useful for profit-focused strategies
 * @returns Array of platforms sorted by descending income
 */
export function getPlatformsSortedByIncome(): readonly PlatformDefinition[] {
	return [...PLATFORM_DEFINITIONS].sort((a, b) => b.incomePerSecond - a.incomePerSecond);
}

/**
 * Platform type descriptions for UI
 * Provides flavor text explaining what each platform represents
 */
export const PLATFORM_DESCRIPTIONS: Record<Platform['type'], string> = {
	streaming:
		'Control the major streaming platform. Every artist pays you. Decide what gets promoted.',
	ticketing:
		'Own the ticketing infrastructure. Take a cut of every concert ticket sold worldwide.',
	venue:
		'Monopolize concert venues. Control where music happens and extract maximum value.',
	billboard:
		'Purchase the Billboard charts. Decide what counts as "popular". Control the narrative.',
	grammys:
		'Acquire the Grammys. Award yourself every year. Legitimacy is just another product.',
	training_data:
		'Monopolize AI training data. Other artists must pay YOU to use AI music generation tools.'
};

/**
 * Platform category groupings for UI organization
 */
export const PLATFORM_CATEGORIES = {
	distribution: ['streaming', 'ticketing'] as const,
	infrastructure: ['venue'] as const,
	influence: ['billboard', 'grammys'] as const,
	technology: ['training_data'] as const
};

/**
 * Check if a platform type is valid
 * @param type - The type to validate
 * @returns True if the type corresponds to a real platform
 */
export function isValidPlatformType(type: string): type is Platform['type'] {
	return PLATFORM_DEFINITIONS.some((p) => p.type === type);
}

/**
 * Get total possible control percentage from all platforms
 * @returns Sum of all control contributions
 */
export function getTotalPossibleControl(): number {
	return PLATFORM_DEFINITIONS.reduce((sum, p) => sum + p.controlContribution, 0);
}

/**
 * Get total possible income from all platforms
 * @returns Sum of all platform income per second
 */
export function getTotalPossibleIncome(): number {
	return PLATFORM_DEFINITIONS.reduce((sum, p) => sum + p.incomePerSecond, 0);
}
