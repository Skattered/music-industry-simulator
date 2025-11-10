/**
 * Platform Definitions
 *
 * Defines all available platforms that can be purchased in the monopoly system.
 * Each platform represents a major piece of music industry infrastructure.
 *
 * Platforms unlock in Phase 4 and provide:
 * - Massive passive income from other artists' work
 * - Industry control percentage contribution
 * - Path to total music industry domination
 */

import type { Platform } from '../game/types';

/**
 * Extended platform definition with metadata
 */
export interface PlatformDefinition {
	/** Unique platform identifier */
	id: string;
	/** Platform type */
	type: 'streaming' | 'algorithm' | 'ticketing' | 'venue' | 'billboard' | 'grammys' | 'training_data';
	/** Display name */
	name: string;
	/** Description of what owning this platform means */
	description: string;
	/** Purchase cost in dollars */
	baseCost: number;
	/** Passive income generated per second in dollars */
	incomePerSecond: number;
	/** How much this contributes to industry control (0-100) */
	controlContribution: number;
	/** Optional prerequisites (platform IDs that must be owned first) */
	prerequisites?: string[];
	/** Flavor text about the exploitation mechanics */
	flavorText: string;
}

/**
 * All available platforms for purchase
 *
 * Balance Philosophy:
 * - Costs scale massively (hundreds of millions)
 * - Income scales to match investment
 * - Control contributions sum to >100% to allow multiple paths
 * - Later platforms require earlier ones as prerequisites
 */
export const PLATFORM_DEFINITIONS: PlatformDefinition[] = [
	{
		id: 'streaming_service',
		type: 'streaming',
		name: 'Major Streaming Platform',
		description: 'Own a major music streaming service. Every stream generates revenue for YOU.',
		baseCost: 100_000_000, // $100M
		incomePerSecond: 50_000, // $50K/sec = $180M/hour
		controlContribution: 15,
		flavorText:
			'Control distribution. Every artist on the platform pays you a cut. You decide who gets promoted.'
	},
	{
		id: 'algorithm_control',
		type: 'algorithm',
		name: 'Algorithm Control',
		description: 'Control the recommendation algorithms. Decide what billions of people hear.',
		baseCost: 250_000_000, // $250M
		incomePerSecond: 100_000, // $100K/sec = $360M/hour
		controlContribution: 20,
		prerequisites: ['streaming_service'],
		flavorText:
			'Your songs always trend. Competitors get buried. You control what becomes popular.'
	},
	{
		id: 'ticketing_monopoly',
		type: 'ticketing',
		name: 'Ticketing Monopoly',
		description: 'Own the dominant ticketing platform. Control all live music ticket sales.',
		baseCost: 150_000_000, // $150M
		incomePerSecond: 75_000, // $75K/sec = $270M/hour
		controlContribution: 12,
		flavorText:
			'Every concert ticket sold generates fees for you. Set prices, control supply, scalp legally.'
	},
	{
		id: 'venue_chain',
		type: 'venue',
		name: 'Global Venue Chain',
		description: 'Own venues worldwide. Every concert happens on your terms, at your prices.',
		baseCost: 200_000_000, // $200M
		incomePerSecond: 80_000, // $80K/sec = $288M/hour
		controlContribution: 10,
		prerequisites: ['ticketing_monopoly'],
		flavorText:
			'Control the physical spaces. No tour happens without your permission. Rent is expensive.'
	},
	{
		id: 'billboard_charts',
		type: 'billboard',
		name: 'Billboard Charts',
		description: 'Own the most influential music charts. Decide what counts as a "hit."',
		baseCost: 500_000_000, // $500M
		incomePerSecond: 200_000, // $200K/sec = $720M/hour
		controlContribution: 18,
		prerequisites: ['streaming_service', 'algorithm_control'],
		flavorText:
			'Define success. Your songs are always #1. Competitors can pay for chart position.'
	},
	{
		id: 'grammy_awards',
		type: 'grammys',
		name: 'The Recording Academy',
		description: 'Own the Grammys. Control industry recognition and legacy.',
		baseCost: 750_000_000, // $750M
		incomePerSecond: 300_000, // $300K/sec = $1.08B/hour
		controlContribution: 15,
		prerequisites: ['billboard_charts'],
		flavorText:
			'Award yourself every Grammy. Sell awards to the highest bidder. Control artistic legitimacy.'
	},
	{
		id: 'training_data_monopoly',
		type: 'training_data',
		name: 'AI Training Data Monopoly',
		description:
			'Own all music training data. Every AI music model trained pays royalties to YOU.',
		baseCost: 1_000_000_000, // $1B
		incomePerSecond: 500_000, // $500K/sec = $1.8B/hour
		controlContribution: 25,
		prerequisites: ['algorithm_control'],
		flavorText:
			'Every AI musician pays you. Control the future of music creation. You are the source.'
	}
];

/**
 * Get platform definition by ID
 */
export function getPlatformDefinition(platformId: string): PlatformDefinition | undefined {
	return PLATFORM_DEFINITIONS.find((p) => p.id === platformId);
}

/**
 * Get all platforms that are currently purchasable (prerequisites met)
 */
export function getAvailablePlatforms(ownedPlatformIds: string[]): PlatformDefinition[] {
	return PLATFORM_DEFINITIONS.filter((platform) => {
		// Already owned
		if (ownedPlatformIds.includes(platform.id)) {
			return false;
		}

		// Check prerequisites
		if (platform.prerequisites && platform.prerequisites.length > 0) {
			const hasAllPrereqs = platform.prerequisites.every((prereqId) =>
				ownedPlatformIds.includes(prereqId)
			);
			return hasAllPrereqs;
		}

		// No prerequisites, available
		return true;
	});
}

/**
 * Check if a platform can be purchased
 */
export function canPurchasePlatform(
	platformId: string,
	ownedPlatformIds: string[],
	money: number
): boolean {
	const platform = getPlatformDefinition(platformId);
	if (!platform) {
		return false;
	}

	// Already owned
	if (ownedPlatformIds.includes(platformId)) {
		return false;
	}

	// Check prerequisites
	if (platform.prerequisites && platform.prerequisites.length > 0) {
		const hasAllPrereqs = platform.prerequisites.every((prereqId) =>
			ownedPlatformIds.includes(prereqId)
		);
		if (!hasAllPrereqs) {
			return false;
		}
	}

	// Check affordability
	if (money < platform.baseCost) {
		return false;
	}

	return true;
}
