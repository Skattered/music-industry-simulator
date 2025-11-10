/**
 * Platform Definitions Unit Tests
 *
 * Tests for platform data structure and helper functions including:
 * - PLATFORM_DEFINITIONS data validation
 * - getPlatformDefinition
 * - getAvailablePlatforms
 * - canPurchasePlatform
 */

import { describe, it, expect } from 'vitest';
import {
	PLATFORM_DEFINITIONS,
	getPlatformDefinition,
	getAvailablePlatforms,
	canPurchasePlatform,
	type PlatformDefinition
} from './platforms';

describe('PLATFORM_DEFINITIONS', () => {
	it('should contain 7 platform definitions', () => {
		expect(PLATFORM_DEFINITIONS).toBeDefined();
		expect(PLATFORM_DEFINITIONS.length).toBe(7);
	});

	it('should have unique platform IDs', () => {
		const ids = PLATFORM_DEFINITIONS.map((p) => p.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(PLATFORM_DEFINITIONS.length);
	});

	it('should have valid platform types', () => {
		const validTypes = [
			'streaming',
			'algorithm',
			'ticketing',
			'venue',
			'billboard',
			'grammys',
			'training_data'
		];

		PLATFORM_DEFINITIONS.forEach((platform) => {
			expect(validTypes).toContain(platform.type);
		});
	});

	it('should have positive costs for all platforms', () => {
		PLATFORM_DEFINITIONS.forEach((platform) => {
			expect(platform.baseCost).toBeGreaterThan(0);
			expect(platform.baseCost).toBeGreaterThanOrEqual(100_000_000); // At least $100M
		});
	});

	it('should have positive income rates for all platforms', () => {
		PLATFORM_DEFINITIONS.forEach((platform) => {
			expect(platform.incomePerSecond).toBeGreaterThan(0);
		});
	});

	it('should have positive control contributions for all platforms', () => {
		PLATFORM_DEFINITIONS.forEach((platform) => {
			expect(platform.controlContribution).toBeGreaterThan(0);
			expect(platform.controlContribution).toBeLessThanOrEqual(100);
		});
	});

	it('should have required string fields', () => {
		PLATFORM_DEFINITIONS.forEach((platform) => {
			expect(platform.id).toBeDefined();
			expect(typeof platform.id).toBe('string');
			expect(platform.id.length).toBeGreaterThan(0);

			expect(platform.name).toBeDefined();
			expect(typeof platform.name).toBe('string');
			expect(platform.name.length).toBeGreaterThan(0);

			expect(platform.description).toBeDefined();
			expect(typeof platform.description).toBe('string');
			expect(platform.description.length).toBeGreaterThan(0);

			expect(platform.flavorText).toBeDefined();
			expect(typeof platform.flavorText).toBe('string');
			expect(platform.flavorText.length).toBeGreaterThan(0);
		});
	});

	it('should have streaming_service platform', () => {
		const streaming = PLATFORM_DEFINITIONS.find((p) => p.id === 'streaming_service');
		expect(streaming).toBeDefined();
		expect(streaming?.type).toBe('streaming');
		expect(streaming?.baseCost).toBe(100_000_000);
		expect(streaming?.incomePerSecond).toBe(50_000);
		expect(streaming?.controlContribution).toBe(15);
		expect(streaming?.prerequisites).toBeUndefined();
	});

	it('should have algorithm_control platform with prerequisites', () => {
		const algorithm = PLATFORM_DEFINITIONS.find((p) => p.id === 'algorithm_control');
		expect(algorithm).toBeDefined();
		expect(algorithm?.type).toBe('algorithm');
		expect(algorithm?.baseCost).toBe(250_000_000);
		expect(algorithm?.prerequisites).toEqual(['streaming_service']);
	});

	it('should have ticketing_monopoly platform', () => {
		const ticketing = PLATFORM_DEFINITIONS.find((p) => p.id === 'ticketing_monopoly');
		expect(ticketing).toBeDefined();
		expect(ticketing?.type).toBe('ticketing');
		expect(ticketing?.baseCost).toBe(150_000_000);
		expect(ticketing?.prerequisites).toBeUndefined();
	});

	it('should have venue_chain platform with prerequisites', () => {
		const venue = PLATFORM_DEFINITIONS.find((p) => p.id === 'venue_chain');
		expect(venue).toBeDefined();
		expect(venue?.type).toBe('venue');
		expect(venue?.prerequisites).toEqual(['ticketing_monopoly']);
	});

	it('should have billboard_charts platform with multiple prerequisites', () => {
		const billboard = PLATFORM_DEFINITIONS.find((p) => p.id === 'billboard_charts');
		expect(billboard).toBeDefined();
		expect(billboard?.type).toBe('billboard');
		expect(billboard?.prerequisites).toEqual(['streaming_service', 'algorithm_control']);
	});

	it('should have grammy_awards platform', () => {
		const grammys = PLATFORM_DEFINITIONS.find((p) => p.id === 'grammy_awards');
		expect(grammys).toBeDefined();
		expect(grammys?.type).toBe('grammys');
		expect(grammys?.prerequisites).toEqual(['billboard_charts']);
	});

	it('should have training_data_monopoly platform', () => {
		const training = PLATFORM_DEFINITIONS.find((p) => p.id === 'training_data_monopoly');
		expect(training).toBeDefined();
		expect(training?.type).toBe('training_data');
		expect(training?.baseCost).toBe(1_000_000_000); // $1B
		expect(training?.prerequisites).toEqual(['algorithm_control']);
	});

	it('should have costs that scale up appropriately', () => {
		const costs = PLATFORM_DEFINITIONS.map((p) => p.baseCost);
		const minCost = Math.min(...costs);
		const maxCost = Math.max(...costs);

		expect(minCost).toBe(100_000_000); // $100M
		expect(maxCost).toBe(1_000_000_000); // $1B
		expect(maxCost / minCost).toBe(10); // 10x range
	});

	it('should have income that scales with cost', () => {
		// Generally, more expensive platforms should generate more income
		const streaming = PLATFORM_DEFINITIONS.find((p) => p.id === 'streaming_service');
		const training = PLATFORM_DEFINITIONS.find((p) => p.id === 'training_data_monopoly');

		expect(training!.incomePerSecond).toBeGreaterThan(streaming!.incomePerSecond);
	});
});

describe('getPlatformDefinition', () => {
	it('should return platform by ID', () => {
		const platform = getPlatformDefinition('streaming_service');

		expect(platform).toBeDefined();
		expect(platform?.id).toBe('streaming_service');
		expect(platform?.name).toBe('Major Streaming Platform');
	});

	it('should return undefined for non-existent ID', () => {
		const platform = getPlatformDefinition('non_existent_platform');

		expect(platform).toBeUndefined();
	});

	it('should return correct platform for all valid IDs', () => {
		const ids = [
			'streaming_service',
			'algorithm_control',
			'ticketing_monopoly',
			'venue_chain',
			'billboard_charts',
			'grammy_awards',
			'training_data_monopoly'
		];

		ids.forEach((id) => {
			const platform = getPlatformDefinition(id);
			expect(platform).toBeDefined();
			expect(platform?.id).toBe(id);
		});
	});

	it('should handle empty string', () => {
		const platform = getPlatformDefinition('');
		expect(platform).toBeUndefined();
	});

	it('should be case-sensitive', () => {
		const platform = getPlatformDefinition('STREAMING_SERVICE');
		expect(platform).toBeUndefined();
	});
});

describe('getAvailablePlatforms', () => {
	it('should return all platforms with no prerequisites when none owned', () => {
		const available = getAvailablePlatforms([]);

		// Should return: streaming_service and ticketing_monopoly (no prerequisites)
		expect(available.length).toBe(2);
		expect(available.find((p) => p.id === 'streaming_service')).toBeDefined();
		expect(available.find((p) => p.id === 'ticketing_monopoly')).toBeDefined();
	});

	it('should exclude already owned platforms', () => {
		const available = getAvailablePlatforms(['streaming_service']);

		// streaming_service should not be in available list
		expect(available.find((p) => p.id === 'streaming_service')).toBeUndefined();
	});

	it('should unlock platforms when prerequisites are met', () => {
		const available = getAvailablePlatforms(['streaming_service']);

		// algorithm_control should now be available (requires streaming_service)
		expect(available.find((p) => p.id === 'algorithm_control')).toBeDefined();
	});

	it('should not unlock platforms with unmet prerequisites', () => {
		const available = getAvailablePlatforms(['streaming_service']);

		// billboard_charts requires both streaming_service AND algorithm_control
		expect(available.find((p) => p.id === 'billboard_charts')).toBeUndefined();
	});

	it('should unlock platforms with multiple prerequisites when all are met', () => {
		const available = getAvailablePlatforms(['streaming_service', 'algorithm_control']);

		// billboard_charts should now be available
		expect(available.find((p) => p.id === 'billboard_charts')).toBeDefined();
	});

	it('should unlock venue_chain when ticketing_monopoly is owned', () => {
		const available = getAvailablePlatforms(['ticketing_monopoly']);

		expect(available.find((p) => p.id === 'venue_chain')).toBeDefined();
	});

	it('should unlock training_data_monopoly when algorithm_control is owned', () => {
		const available = getAvailablePlatforms(['streaming_service', 'algorithm_control']);

		expect(available.find((p) => p.id === 'training_data_monopoly')).toBeDefined();
	});

	it('should unlock grammy_awards when billboard_charts is owned', () => {
		const available = getAvailablePlatforms([
			'streaming_service',
			'algorithm_control',
			'billboard_charts'
		]);

		expect(available.find((p) => p.id === 'grammy_awards')).toBeDefined();
	});

	it('should return empty array when all platforms are owned', () => {
		const allPlatformIds = PLATFORM_DEFINITIONS.map((p) => p.id);
		const available = getAvailablePlatforms(allPlatformIds);

		expect(available.length).toBe(0);
	});

	it('should handle complex prerequisite chains', () => {
		// Own streaming_service -> unlocks algorithm_control
		// Own algorithm_control -> unlocks billboard_charts and training_data_monopoly
		// Own billboard_charts -> unlocks grammy_awards
		const available = getAvailablePlatforms(['streaming_service', 'algorithm_control']);

		const availableIds = available.map((p) => p.id);

		// Should have: ticketing_monopoly (no prereqs), billboard_charts, training_data_monopoly
		expect(availableIds).toContain('ticketing_monopoly');
		expect(availableIds).toContain('billboard_charts');
		expect(availableIds).toContain('training_data_monopoly');

		// Should NOT have: grammy_awards (needs billboard_charts), venue_chain (needs ticketing_monopoly)
		expect(availableIds).not.toContain('grammy_awards');
		expect(availableIds).not.toContain('venue_chain');
	});

	it('should handle empty owned platforms array', () => {
		const available = getAvailablePlatforms([]);

		expect(available.length).toBeGreaterThan(0);
		// Only platforms without prerequisites
		available.forEach((platform) => {
			expect(platform.prerequisites || []).toHaveLength(0);
		});
	});
});

describe('canPurchasePlatform', () => {
	it('should return true when platform is affordable and not owned', () => {
		const canPurchase = canPurchasePlatform('streaming_service', [], 100_000_000);

		expect(canPurchase).toBe(true);
	});

	it('should return false when platform is not affordable', () => {
		const canPurchase = canPurchasePlatform('streaming_service', [], 50_000_000);

		expect(canPurchase).toBe(false);
	});

	it('should return false when platform is already owned', () => {
		const canPurchase = canPurchasePlatform('streaming_service', ['streaming_service'], 200_000_000);

		expect(canPurchase).toBe(false);
	});

	it('should return false when platform does not exist', () => {
		const canPurchase = canPurchasePlatform('non_existent', [], 1_000_000_000);

		expect(canPurchase).toBe(false);
	});

	it('should return false when prerequisites are not met', () => {
		const canPurchase = canPurchasePlatform('algorithm_control', [], 250_000_000);

		expect(canPurchase).toBe(false);
	});

	it('should return true when prerequisites are met and affordable', () => {
		const canPurchase = canPurchasePlatform(
			'algorithm_control',
			['streaming_service'],
			250_000_000
		);

		expect(canPurchase).toBe(true);
	});

	it('should return false when only some prerequisites are met', () => {
		// billboard_charts requires both streaming_service AND algorithm_control
		const canPurchase = canPurchasePlatform(
			'billboard_charts',
			['streaming_service'],
			500_000_000
		);

		expect(canPurchase).toBe(false);
	});

	it('should return true when all prerequisites are met', () => {
		const canPurchase = canPurchasePlatform(
			'billboard_charts',
			['streaming_service', 'algorithm_control'],
			500_000_000
		);

		expect(canPurchase).toBe(true);
	});

	it('should handle platforms with no prerequisites', () => {
		const canPurchase = canPurchasePlatform('ticketing_monopoly', [], 150_000_000);

		expect(canPurchase).toBe(true);
	});

	it('should return false when money is exactly 1 dollar short', () => {
		const canPurchase = canPurchasePlatform('streaming_service', [], 99_999_999);

		expect(canPurchase).toBe(false);
	});

	it('should return true when money is exactly enough', () => {
		const canPurchase = canPurchasePlatform('streaming_service', [], 100_000_000);

		expect(canPurchase).toBe(true);
	});

	it('should handle venue_chain prerequisites', () => {
		// venue_chain requires ticketing_monopoly
		const canPurchase = canPurchasePlatform(
			'venue_chain',
			['ticketing_monopoly'],
			200_000_000
		);

		expect(canPurchase).toBe(true);
	});

	it('should handle grammy_awards prerequisites', () => {
		// grammy_awards requires billboard_charts
		const canPurchase = canPurchasePlatform(
			'grammy_awards',
			['streaming_service', 'algorithm_control', 'billboard_charts'],
			750_000_000
		);

		expect(canPurchase).toBe(true);
	});

	it('should handle training_data_monopoly prerequisites', () => {
		// training_data_monopoly requires algorithm_control
		const canPurchase = canPurchasePlatform(
			'training_data_monopoly',
			['streaming_service', 'algorithm_control'],
			1_000_000_000
		);

		expect(canPurchase).toBe(true);
	});

	it('should return false for most expensive platform with insufficient funds', () => {
		const canPurchase = canPurchasePlatform(
			'training_data_monopoly',
			['streaming_service', 'algorithm_control'],
			999_999_999
		);

		expect(canPurchase).toBe(false);
	});

	it('should handle empty string platform ID', () => {
		const canPurchase = canPurchasePlatform('', [], 1_000_000_000);

		expect(canPurchase).toBe(false);
	});

	it('should handle very large money amounts', () => {
		const canPurchase = canPurchasePlatform('streaming_service', [], Number.MAX_SAFE_INTEGER);

		expect(canPurchase).toBe(true);
	});

	it('should handle zero money', () => {
		const canPurchase = canPurchasePlatform('streaming_service', [], 0);

		expect(canPurchase).toBe(false);
	});

	it('should handle negative money', () => {
		const canPurchase = canPurchasePlatform('streaming_service', [], -1000);

		expect(canPurchase).toBe(false);
	});
});

describe('Platform prerequisite chains', () => {
	it('should have valid prerequisite chains (no circular dependencies)', () => {
		// Build a prerequisite graph and check for cycles
		const visited = new Set<string>();
		const recursionStack = new Set<string>();

		function hasCycle(platformId: string): boolean {
			if (!visited.has(platformId)) {
				visited.add(platformId);
				recursionStack.add(platformId);

				const platform = getPlatformDefinition(platformId);
				if (platform && platform.prerequisites) {
					for (const prereqId of platform.prerequisites) {
						if (!visited.has(prereqId) && hasCycle(prereqId)) {
							return true;
						} else if (recursionStack.has(prereqId)) {
							return true;
						}
					}
				}
			}
			recursionStack.delete(platformId);
			return false;
		}

		let hasCycles = false;
		for (const platform of PLATFORM_DEFINITIONS) {
			if (hasCycle(platform.id)) {
				hasCycles = true;
				break;
			}
		}

		expect(hasCycles).toBe(false);
	});

	it('should have valid prerequisite references', () => {
		// All prerequisites should reference existing platforms
		PLATFORM_DEFINITIONS.forEach((platform) => {
			if (platform.prerequisites) {
				platform.prerequisites.forEach((prereqId) => {
					const prereqPlatform = getPlatformDefinition(prereqId);
					expect(prereqPlatform).toBeDefined();
				});
			}
		});
	});

	it('should have at least one platform with no prerequisites (entry point)', () => {
		const noPrerequsites = PLATFORM_DEFINITIONS.filter(
			(p) => !p.prerequisites || p.prerequisites.length === 0
		);

		expect(noPrerequsites.length).toBeGreaterThan(0);
	});
});
