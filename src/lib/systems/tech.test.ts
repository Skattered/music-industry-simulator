/**
 * Tech System Unit Tests
 *
 * Comprehensive tests for the tech tier upgrade system including:
 * - Purchase logic validation
 * - Effect application
 * - Progressive unlocking
 * - Prestige unlock conditions
 */

import { describe, it, expect } from 'vitest';
import {
	purchaseTechUpgrade,
	canAffordUpgrade,
	applyTechEffects,
	getTechUpgrades,
	getAvailableTechUpgrades,
	getSongGenerationCost,
	getTechIncomeMultiplier,
	getTechProgressionSummary
} from './tech';
import { getUpgradeById } from '../data/tech-upgrades';
import type { GameState } from '../game/types';
import {
	INITIAL_MONEY,
	INITIAL_FANS,
	INITIAL_GPU,
	INITIAL_TECH_TIER,
	INITIAL_TECH_SUB_TIER,
	INITIAL_PHASE,
	INITIAL_INDUSTRY_CONTROL,
	INITIAL_PRESTIGE_COUNT,
	INITIAL_EXPERIENCE_MULTIPLIER,
	INITIAL_UNLOCKED_SYSTEMS,
	BASE_SONG_GENERATION_TIME
} from '../game/config';

// Helper to create a minimal game state for testing
function createTestGameState(overrides?: Partial<GameState>): GameState {
	return {
		money: INITIAL_MONEY,
		songs: [],
		fans: INITIAL_FANS,
		gpu: INITIAL_GPU,
		phase: INITIAL_PHASE,
		industryControl: INITIAL_INDUSTRY_CONTROL,
		currentArtist: {
			name: 'Test Artist',
			songs: 0,
			fans: 0,
			peakFans: 0,
			createdAt: Date.now()
		},
		legacyArtists: [],
		songQueue: [],
		songGenerationSpeed: BASE_SONG_GENERATION_TIME,
		currentTrendingGenre: null,
		trendDiscoveredAt: null,
		techTier: INITIAL_TECH_TIER,
		techSubTier: INITIAL_TECH_SUB_TIER,
		upgrades: {},
		activeBoosts: [],
		boostUsageCounts: {},
		physicalAlbums: [],
		tours: [],
		ownedPlatforms: [],
		prestigeCount: INITIAL_PRESTIGE_COUNT,
		experienceMultiplier: INITIAL_EXPERIENCE_MULTIPLIER,
		unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS },
		lastUpdate: Date.now(),
		createdAt: Date.now(),
		version: '1.0.0',
		...overrides
	};
}

describe('Tech Upgrade System', () => {
	describe('getTechUpgrades', () => {
		it('should return all 21 tech upgrades (7 tiers × 3 sub-tiers)', () => {
			const upgrades = getTechUpgrades();
			expect(upgrades).toHaveLength(21);
		});

		it('should include all 7 tech tiers', () => {
			const upgrades = getTechUpgrades();
			const tiers = new Set(upgrades.map((u) => u.tier));
			expect(tiers.size).toBe(7);
			expect(tiers.has(1)).toBe(true);
			expect(tiers.has(2)).toBe(true);
			expect(tiers.has(3)).toBe(true);
			expect(tiers.has(4)).toBe(true);
			expect(tiers.has(5)).toBe(true);
			expect(tiers.has(6)).toBe(true);
			expect(tiers.has(7)).toBe(true);
		});

		it('should have 3 upgrades per tier', () => {
			const upgrades = getTechUpgrades();
			for (let tier = 1; tier <= 7; tier++) {
				const tierUpgrades = upgrades.filter((u) => u.tier === tier);
				expect(tierUpgrades).toHaveLength(3);
			}
		});
	});

	describe('canAffordUpgrade', () => {
		it('should return true when player has enough money and meets prerequisites', () => {
			const state = createTestGameState({ money: 100 });
			const result = canAffordUpgrade(state, 'tier1_basic');
			expect(result).toBe(true);
		});

		it('should return false when player does not have enough money', () => {
			const state = createTestGameState({ money: 5 });
			const result = canAffordUpgrade(state, 'tier1_basic');
			expect(result).toBe(false);
		});

		it('should return false when upgrade is already purchased', () => {
			const state = createTestGameState({
				money: 100,
				upgrades: {
					tier1_basic: { purchasedAt: Date.now(), tier: 1 }
				}
			});
			const result = canAffordUpgrade(state, 'tier1_basic');
			expect(result).toBe(false);
		});

		it('should return false when prerequisites are not met', () => {
			const state = createTestGameState({ money: 1000 });
			const result = canAffordUpgrade(state, 'tier1_improved');
			expect(result).toBe(false);
		});

		it('should return true when prerequisites are met', () => {
			const state = createTestGameState({
				money: 1000,
				upgrades: {
					tier1_basic: { purchasedAt: Date.now(), tier: 1 }
				}
			});
			const result = canAffordUpgrade(state, 'tier1_improved');
			expect(result).toBe(true);
		});

		it('should return false for non-existent upgrade', () => {
			const state = createTestGameState({ money: 1000000 });
			const result = canAffordUpgrade(state, 'non_existent_upgrade');
			expect(result).toBe(false);
		});
	});

	describe('purchaseTechUpgrade', () => {
		it('should successfully purchase an affordable upgrade', () => {
			const state = createTestGameState({ money: 100 });
			const initialMoney = state.money;
			const upgrade = getUpgradeById('tier1_basic');

			const result = purchaseTechUpgrade(state, 'tier1_basic');

			expect(result).toBe(true);
			expect(state.upgrades['tier1_basic']).toBeDefined();
			expect(state.money).toBe(initialMoney - upgrade!.cost);
		});

		it('should fail to purchase when cannot afford', () => {
			const state = createTestGameState({ money: 5 });
			const result = purchaseTechUpgrade(state, 'tier1_basic');

			expect(result).toBe(false);
			expect(state.upgrades['tier1_basic']).toBeUndefined();
		});

		it('should update tech tier and sub-tier after purchase', () => {
			const state = createTestGameState({ money: 100 });

			purchaseTechUpgrade(state, 'tier1_basic');
			expect(state.techTier).toBe(1);
			expect(state.techSubTier).toBe(0);
		});

		it('should increment sub-tier when purchasing within same tier', () => {
			const state = createTestGameState({ money: 100000 });

			purchaseTechUpgrade(state, 'tier1_basic');
			expect(state.techSubTier).toBe(0);

			purchaseTechUpgrade(state, 'tier1_improved');
			expect(state.techSubTier).toBe(1);

			purchaseTechUpgrade(state, 'tier1_advanced');
			expect(state.techSubTier).toBe(2);
		});

		it('should fail when prerequisites not met', () => {
			const state = createTestGameState({ money: 100000 });
			const result = purchaseTechUpgrade(state, 'tier1_improved');

			expect(result).toBe(false);
			expect(state.upgrades['tier1_improved']).toBeUndefined();
		});
	});

	describe('applyTechEffects', () => {
		it('should update song generation speed', () => {
			const state = createTestGameState();
			const upgrade = getUpgradeById('tier1_basic');

			applyTechEffects(state, upgrade!);

			expect(state.songGenerationSpeed).toBe(15000);
		});


		// NOTE: System unlocks (GPU, Prestige, Physical Albums, Trend Research) are now
		// handled in unlocks.ts to prevent duplicate toasts. These tests are moved there.

		it('should unlock monopoly mechanics when specified', () => {
			const state = createTestGameState();
			const upgrade = getUpgradeById('tier6_advanced');

			applyTechEffects(state, upgrade!);

			expect(state.unlockedSystems.monopoly).toBe(true);
		});
	});

	// NOTE: unlockPrestigePoints tests removed - prestige unlocking now handled in unlocks.ts

	describe('Progressive Tier Unlocking', () => {
		it('should allow purchasing all upgrades in tier 1 sequentially', () => {
			const state = createTestGameState({ money: 1000000 });

			expect(purchaseTechUpgrade(state, 'tier1_basic')).toBe(true);
			expect(state.techTier).toBe(1);
			expect(state.techSubTier).toBe(0);

			expect(purchaseTechUpgrade(state, 'tier1_improved')).toBe(true);
			expect(state.techTier).toBe(1);
			expect(state.techSubTier).toBe(1);

			expect(purchaseTechUpgrade(state, 'tier1_advanced')).toBe(true);
			expect(state.techTier).toBe(1);
			expect(state.techSubTier).toBe(2);
		});

		it('should allow purchasing tier 2 after tier 1 is complete', () => {
			const state = createTestGameState({ money: 1000000 });

			purchaseTechUpgrade(state, 'tier1_basic');
			purchaseTechUpgrade(state, 'tier1_improved');
			purchaseTechUpgrade(state, 'tier1_advanced');

			expect(purchaseTechUpgrade(state, 'tier2_basic')).toBe(true);
			expect(state.techTier).toBe(2);
			expect(state.techSubTier).toBe(0);
		});

		it('should enforce prerequisites through all tiers', () => {
			const state = createTestGameState({ money: 10000000000 });

			// Try to buy tier 7 upgrade without prerequisites
			expect(purchaseTechUpgrade(state, 'tier7_basic')).toBe(false);

			// Purchase all prerequisites in order
			const upgradeSequence = [
				'tier1_basic',
				'tier1_improved',
				'tier1_advanced',
				'tier2_basic',
				'tier2_improved',
				'tier2_advanced',
				'tier3_basic',
				'tier3_improved',
				'tier3_advanced',
				'tier4_basic',
				'tier4_improved',
				'tier4_advanced',
				'tier5_basic',
				'tier5_improved',
				'tier5_advanced',
				'tier6_basic',
				'tier6_improved',
				'tier6_advanced',
				'tier7_basic'
			];

			for (const upgradeId of upgradeSequence) {
				expect(purchaseTechUpgrade(state, upgradeId)).toBe(true);
			}

			expect(state.techTier).toBe(7);
		});
	});

	describe('All 7 Tiers Purchasable', () => {
		it('should successfully purchase all upgrades in all 7 tiers', () => {
			const state = createTestGameState({ money: 10000000000 });

			const allUpgradeIds = [
				// Tier 1
				'tier1_basic',
				'tier1_improved',
				'tier1_advanced',
				// Tier 2
				'tier2_basic',
				'tier2_improved',
				'tier2_advanced',
				// Tier 3
				'tier3_basic',
				'tier3_improved',
				'tier3_advanced',
				// Tier 4
				'tier4_basic',
				'tier4_improved',
				'tier4_advanced',
				// Tier 5
				'tier5_basic',
				'tier5_improved',
				'tier5_advanced',
				// Tier 6
				'tier6_basic',
				'tier6_improved',
				'tier6_advanced',
				// Tier 7
				'tier7_basic',
				'tier7_improved',
				'tier7_advanced'
			];

			for (const upgradeId of allUpgradeIds) {
				const result = purchaseTechUpgrade(state, upgradeId);
				expect(result).toBe(true);
			}

			expect(Object.keys(state.upgrades)).toHaveLength(21);
			expect(state.techTier).toBe(7);
			expect(state.techSubTier).toBe(2);
		});
	});

	describe('Helper Functions', () => {
		it('getAvailableTechUpgrades should return only purchasable upgrades', () => {
			const state = createTestGameState({ money: 1000000 });

			const available = getAvailableTechUpgrades(state);
			expect(available).toHaveLength(1);
			expect(available[0].id).toBe('tier1_basic');

			purchaseTechUpgrade(state, 'tier1_basic');
			const availableAfter = getAvailableTechUpgrades(state);
			expect(availableAfter[0].id).toBe('tier1_improved');
		});

		it('getSongGenerationCost should return correct cost based on upgrades', () => {
			const state = createTestGameState({ money: 1000000 });

			purchaseTechUpgrade(state, 'tier1_basic');
			expect(getSongGenerationCost(state)).toBe(1.5);

			purchaseTechUpgrade(state, 'tier1_improved');
			expect(getSongGenerationCost(state)).toBe(1.0);

			purchaseTechUpgrade(state, 'tier1_advanced');
			expect(getSongGenerationCost(state)).toBe(0.5);

			purchaseTechUpgrade(state, 'tier2_basic');
			expect(getSongGenerationCost(state)).toBe(0); // Free!
		});

		it('getTechIncomeMultiplier should return highest multiplier', () => {
			const state = createTestGameState({ money: 10000000 });

			expect(getTechIncomeMultiplier(state)).toBe(1.0);

			// Purchase upgrades with income multipliers
			purchaseTechUpgrade(state, 'tier1_basic');
			purchaseTechUpgrade(state, 'tier1_improved');
			purchaseTechUpgrade(state, 'tier1_advanced');
			purchaseTechUpgrade(state, 'tier2_basic');
			purchaseTechUpgrade(state, 'tier2_improved');
			expect(getTechIncomeMultiplier(state)).toBe(1.5);

			purchaseTechUpgrade(state, 'tier2_advanced');
			expect(getTechIncomeMultiplier(state)).toBe(2.0);
		});

		it('getTechProgressionSummary should return accurate summary', () => {
			const state = createTestGameState({ money: 1000000 });

			purchaseTechUpgrade(state, 'tier1_basic');
			purchaseTechUpgrade(state, 'tier1_improved');

			const summary = getTechProgressionSummary(state);
			expect(summary.currentTier).toBe(1);
			expect(summary.currentSubTier).toBe(1);
			expect(summary.purchasedUpgrades).toBe(2);
			expect(summary.totalUpgrades).toBe(21);
			expect(summary.nextUpgrade?.id).toBe('tier1_advanced');
		});
	});

	describe('Effect Application Validation', () => {
		it('should correctly reduce song generation speed through tiers', () => {
			const state = createTestGameState({ money: 100000000 });

			purchaseTechUpgrade(state, 'tier1_basic');
			expect(state.songGenerationSpeed).toBe(15000);

			purchaseTechUpgrade(state, 'tier1_improved');
			expect(state.songGenerationSpeed).toBe(12000);

			purchaseTechUpgrade(state, 'tier1_advanced');
			expect(state.songGenerationSpeed).toBe(10000);

			purchaseTechUpgrade(state, 'tier2_basic');
			expect(state.songGenerationSpeed).toBe(10000);

			// Continue through higher tiers
			purchaseTechUpgrade(state, 'tier2_improved');
			expect(state.songGenerationSpeed).toBe(8000);

			purchaseTechUpgrade(state, 'tier2_advanced');
			expect(state.songGenerationSpeed).toBe(6000);
		});

		it('should unlock monopoly through tier progression', () => {
			const state = createTestGameState({ money: 1000000000 });

			const allUpgrades = [
				'tier1_basic',
				'tier1_improved',
				'tier1_advanced',
				'tier2_basic',
				'tier2_improved',
				'tier2_advanced',
				'tier3_basic',
				'tier3_improved',
				'tier3_advanced',
				'tier4_basic',
				'tier4_improved',
				'tier4_advanced',
				'tier5_basic',
				'tier5_improved',
				'tier5_advanced',
				'tier6_basic',
				'tier6_improved',
				'tier6_advanced',
				'tier7_basic',
				'tier7_improved',
				'tier7_advanced'
			];

			for (const upgradeId of allUpgrades) {
				purchaseTechUpgrade(state, upgradeId);
			}

			// Monopoly unlocks directly in tech.ts (no additional conditions)
			expect(state.unlockedSystems.monopoly).toBe(true);

			// NOTE: Other system unlocks (trendResearch, physicalAlbums, gpu, prestige)
			// are now handled in unlocks.ts to prevent duplicate toasts.
			// Tours and platform ownership also require additional milestone checks in unlocks.ts
		});
	});
});
