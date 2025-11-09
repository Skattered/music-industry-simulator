/**
 * Monopoly System Unit Tests
 *
 * Comprehensive tests for the platform ownership and industry control system:
 * - Platform unlock requirements
 * - Platform purchasing logic
 * - Industry control calculations
 * - Passive income generation
 * - Victory conditions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
	unlockPlatformOwnership,
	shouldUnlockPlatformOwnership,
	canAffordPlatform,
	purchasePlatform,
	processPlatformIncome,
	calculateIndustryControl,
	updateControlProgress,
	hasAchievedVictory,
	getAvailablePlatformsForPurchase,
	getMonopolySummary,
	getRecommendedPlatform,
	getUnlockProgress,
	purchaseMultiplePlatforms,
	getTimeToAfford,
	PLATFORM_UNLOCK_REQUIREMENTS
} from './monopoly';
import { getAllPlatforms, getPlatformByType } from '../data/platforms';
import type { GameState, Tour } from '../game/types';
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
	BASE_SONG_GENERATION_TIME,
	PLATFORM_DEFINITIONS
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

// Helper to create completed tours
function createCompletedTours(count: number): Tour[] {
	const tours: Tour[] = [];
	for (let i = 0; i < count; i++) {
		tours.push({
			id: `tour_${i}`,
			name: `Test Tour ${i}`,
			startedAt: Date.now() - 200000,
			completedAt: Date.now() - 10000,
			incomePerSecond: 10000,
			usesScarcity: false
		});
	}
	return tours;
}

describe('Monopoly System - Platform Ownership', () => {
	describe('Platform Unlock Requirements', () => {
		it('should NOT unlock with insufficient requirements', () => {
			const state = createTestGameState({
				fans: 500_000, // Not enough fans
				techTier: 6,
				tours: createCompletedTours(50)
			});

			const unlocked = unlockPlatformOwnership(state);
			expect(unlocked).toBe(false);
			expect(state.unlockedSystems.platformOwnership).toBe(false);
		});

		it('should NOT unlock without enough completed tours', () => {
			const state = createTestGameState({
				fans: 1_000_000,
				techTier: 6,
				tours: createCompletedTours(30) // Not enough tours
			});

			const unlocked = unlockPlatformOwnership(state);
			expect(unlocked).toBe(false);
			expect(state.unlockedSystems.platformOwnership).toBe(false);
		});

		it('should NOT unlock without tech tier 6', () => {
			const state = createTestGameState({
				fans: 1_000_000,
				techTier: 5, // Not high enough
				tours: createCompletedTours(50)
			});

			const unlocked = unlockPlatformOwnership(state);
			expect(unlocked).toBe(false);
			expect(state.unlockedSystems.platformOwnership).toBe(false);
		});

		it('should unlock with all requirements met', () => {
			const state = createTestGameState({
				fans: 1_000_000,
				techTier: 6,
				tours: createCompletedTours(50)
			});

			const unlocked = unlockPlatformOwnership(state);
			expect(unlocked).toBe(true);
			expect(state.unlockedSystems.platformOwnership).toBe(true);
		});

		it('should unlock with requirements exceeded', () => {
			const state = createTestGameState({
				fans: 10_000_000, // Way more than needed
				techTier: 7, // Higher than needed
				tours: createCompletedTours(200) // Way more than needed
			});

			const unlocked = unlockPlatformOwnership(state);
			expect(unlocked).toBe(true);
			expect(state.unlockedSystems.platformOwnership).toBe(true);
		});

		it('should return false if already unlocked', () => {
			const state = createTestGameState({
				fans: 1_000_000,
				techTier: 6,
				tours: createCompletedTours(50),
				unlockedSystems: {
					...INITIAL_UNLOCKED_SYSTEMS,
					platformOwnership: true
				}
			});

			const unlocked = unlockPlatformOwnership(state);
			expect(unlocked).toBe(false); // Already unlocked, so returns false
			expect(state.unlockedSystems.platformOwnership).toBe(true);
		});

		it('should correctly check unlock requirements with shouldUnlockPlatformOwnership', () => {
			const state1 = createTestGameState({
				fans: 1_000_000,
				techTier: 6,
				tours: createCompletedTours(50)
			});
			expect(shouldUnlockPlatformOwnership(state1)).toBe(true);

			const state2 = createTestGameState({
				fans: 500_000,
				techTier: 6,
				tours: createCompletedTours(50)
			});
			expect(shouldUnlockPlatformOwnership(state2)).toBe(false);
		});

		it('should not count active tours toward unlock requirement', () => {
			const activeTours: Tour[] = [
				{
					id: 'tour_active',
					name: 'Active Tour',
					startedAt: Date.now() - 10000,
					completedAt: null, // Still running
					incomePerSecond: 10000,
					usesScarcity: false
				}
			];

			const state = createTestGameState({
				fans: 1_000_000,
				techTier: 6,
				tours: [...createCompletedTours(49), ...activeTours]
			});

			// 49 completed + 1 active = should not unlock (needs 50 completed)
			const shouldUnlock = shouldUnlockPlatformOwnership(state);
			expect(shouldUnlock).toBe(false);
		});
	});

	describe('Platform Purchasing', () => {
		it('should not allow purchase if system is locked', () => {
			const state = createTestGameState({
				money: 1_000_000_000,
				unlockedSystems: {
					...INITIAL_UNLOCKED_SYSTEMS,
					platformOwnership: false
				}
			});

			const canAfford = canAffordPlatform(state, 'streaming');
			expect(canAfford).toBe(false);

			const purchased = purchasePlatform(state, 'streaming');
			expect(purchased).toBe(false);
		});

		it('should not allow purchase if already owned', () => {
			const streamingDef = getPlatformByType('streaming')!;
			const state = createTestGameState({
				money: 1_000_000_000,
				unlockedSystems: {
					...INITIAL_UNLOCKED_SYSTEMS,
					platformOwnership: true
				},
				ownedPlatforms: [
					{
						id: 'streaming_1',
						type: 'streaming',
						name: streamingDef.name,
						cost: streamingDef.baseCost,
						acquiredAt: Date.now(),
						incomePerSecond: streamingDef.incomePerSecond,
						controlContribution: streamingDef.controlContribution
					}
				]
			});

			const canAfford = canAffordPlatform(state, 'streaming');
			expect(canAfford).toBe(false);

			const purchased = purchasePlatform(state, 'streaming');
			expect(purchased).toBe(false);
		});

		it('should not allow purchase if insufficient money', () => {
			const state = createTestGameState({
				money: 100, // Not enough
				unlockedSystems: {
					...INITIAL_UNLOCKED_SYSTEMS,
					platformOwnership: true
				}
			});

			const canAfford = canAffordPlatform(state, 'streaming');
			expect(canAfford).toBe(false);

			const purchased = purchasePlatform(state, 'streaming');
			expect(purchased).toBe(false);
		});

		it('should successfully purchase platform with sufficient money', () => {
			const streamingDef = getPlatformByType('streaming')!;
			const state = createTestGameState({
				money: 50_000_000,
				unlockedSystems: {
					...INITIAL_UNLOCKED_SYSTEMS,
					platformOwnership: true
				}
			});

			const initialMoney = state.money;
			const canAfford = canAffordPlatform(state, 'streaming');
			expect(canAfford).toBe(true);

			const purchased = purchasePlatform(state, 'streaming');
			expect(purchased).toBe(true);
			expect(state.ownedPlatforms).toHaveLength(1);
			expect(state.ownedPlatforms[0].type).toBe('streaming');
			expect(state.ownedPlatforms[0].name).toBe(streamingDef.name);
			expect(state.ownedPlatforms[0].incomePerSecond).toBe(streamingDef.incomePerSecond);
			expect(state.ownedPlatforms[0].controlContribution).toBe(
				streamingDef.controlContribution
			);
			expect(state.money).toBe(initialMoney - streamingDef.baseCost);
		});

		it('should update industry control after platform purchase', () => {
			const streamingDef = getPlatformByType('streaming')!;
			const state = createTestGameState({
				money: 50_000_000,
				unlockedSystems: {
					...INITIAL_UNLOCKED_SYSTEMS,
					platformOwnership: true
				}
			});

			expect(state.industryControl).toBe(0);

			purchasePlatform(state, 'streaming');
			expect(state.industryControl).toBe(streamingDef.controlContribution);
		});

		it('should allow purchasing multiple different platforms', () => {
			const state = createTestGameState({
				money: 1_000_000_000,
				unlockedSystems: {
					...INITIAL_UNLOCKED_SYSTEMS,
					platformOwnership: true
				}
			});

			purchasePlatform(state, 'streaming');
			expect(state.ownedPlatforms).toHaveLength(1);

			purchasePlatform(state, 'ticketing');
			expect(state.ownedPlatforms).toHaveLength(2);

			purchasePlatform(state, 'venue');
			expect(state.ownedPlatforms).toHaveLength(3);

			expect(state.ownedPlatforms.map((p) => p.type)).toEqual([
				'streaming',
				'ticketing',
				'venue'
			]);
		});

		it('should handle invalid platform type gracefully', () => {
			const state = createTestGameState({
				money: 1_000_000_000,
				unlockedSystems: {
					...INITIAL_UNLOCKED_SYSTEMS,
					platformOwnership: true
				}
			});

			// @ts-expect-error Testing invalid input
			const canAfford = canAffordPlatform(state, 'invalid_platform');
			expect(canAfford).toBe(false);

			// @ts-expect-error Testing invalid input
			const purchased = purchasePlatform(state, 'invalid_platform');
			expect(purchased).toBe(false);
		});
	});

	describe('Industry Control Calculations', () => {
		it('should calculate 0% control with no platforms', () => {
			const state = createTestGameState();
			const control = calculateIndustryControl(state);
			expect(control).toBe(0);
		});

		it('should calculate correct control with single platform', () => {
			const streamingDef = getPlatformByType('streaming')!;
			const state = createTestGameState({
				ownedPlatforms: [
					{
						id: 'streaming_1',
						type: 'streaming',
						name: streamingDef.name,
						cost: streamingDef.baseCost,
						acquiredAt: Date.now(),
						incomePerSecond: streamingDef.incomePerSecond,
						controlContribution: streamingDef.controlContribution
					}
				]
			});

			const control = calculateIndustryControl(state);
			expect(control).toBe(streamingDef.controlContribution);
		});

		it('should sum control from multiple platforms', () => {
			const streamingDef = getPlatformByType('streaming')!;
			const ticketingDef = getPlatformByType('ticketing')!;

			const state = createTestGameState({
				ownedPlatforms: [
					{
						id: 'streaming_1',
						type: 'streaming',
						name: streamingDef.name,
						cost: streamingDef.baseCost,
						acquiredAt: Date.now(),
						incomePerSecond: streamingDef.incomePerSecond,
						controlContribution: streamingDef.controlContribution
					},
					{
						id: 'ticketing_1',
						type: 'ticketing',
						name: ticketingDef.name,
						cost: ticketingDef.baseCost,
						acquiredAt: Date.now(),
						incomePerSecond: ticketingDef.incomePerSecond,
						controlContribution: ticketingDef.controlContribution
					}
				]
			});

			const control = calculateIndustryControl(state);
			const expected =
				streamingDef.controlContribution + ticketingDef.controlContribution;
			expect(control).toBe(expected);
		});

		it('should reach 100%+ control with all platforms owned', () => {
			const allPlatforms = getAllPlatforms().map((def) => ({
				id: `${def.type}_1`,
				type: def.type,
				name: def.name,
				cost: def.baseCost,
				acquiredAt: Date.now(),
				incomePerSecond: def.incomePerSecond,
				controlContribution: def.controlContribution
			}));

			const state = createTestGameState({
				ownedPlatforms: allPlatforms
			});

			const control = calculateIndustryControl(state);
			// Total control from all 6 platforms should be >= 100
			expect(control).toBeGreaterThanOrEqual(100);
		});

		it('should update state.industryControl when updateControlProgress is called', () => {
			const streamingDef = getPlatformByType('streaming')!;
			const state = createTestGameState({
				ownedPlatforms: [
					{
						id: 'streaming_1',
						type: 'streaming',
						name: streamingDef.name,
						cost: streamingDef.baseCost,
						acquiredAt: Date.now(),
						incomePerSecond: streamingDef.incomePerSecond,
						controlContribution: streamingDef.controlContribution
					}
				],
				industryControl: 0 // Manually set to 0
			});

			updateControlProgress(state);
			expect(state.industryControl).toBe(streamingDef.controlContribution);
		});
	});

	describe('Victory Conditions', () => {
		it('should not achieve victory with 0 platforms', () => {
			const state = createTestGameState();
			expect(hasAchievedVictory(state)).toBe(false);
		});

		it('should not achieve victory with partial control', () => {
			const streamingDef = getPlatformByType('streaming')!;
			const state = createTestGameState({
				industryControl: streamingDef.controlContribution
			});
			expect(hasAchievedVictory(state)).toBe(false);
		});

		it('should achieve victory with 100% control', () => {
			const state = createTestGameState({
				industryControl: 100
			});
			expect(hasAchievedVictory(state)).toBe(true);
		});

		it('should achieve victory with >100% control', () => {
			const state = createTestGameState({
				industryControl: 125 // All platforms owned
			});
			expect(hasAchievedVictory(state)).toBe(true);
		});
	});

	describe('Available Platforms', () => {
		it('should return empty array if system is locked', () => {
			const state = createTestGameState({
				unlockedSystems: {
					...INITIAL_UNLOCKED_SYSTEMS,
					platformOwnership: false
				}
			});

			const available = getAvailablePlatformsForPurchase(state);
			expect(available).toHaveLength(0);
		});

		it('should return all 6 platforms if none are owned', () => {
			const state = createTestGameState({
				unlockedSystems: {
					...INITIAL_UNLOCKED_SYSTEMS,
					platformOwnership: true
				}
			});

			const available = getAvailablePlatformsForPurchase(state);
			expect(available).toHaveLength(6);
		});

		it('should exclude owned platforms from available list', () => {
			const streamingDef = getPlatformByType('streaming')!;
			const state = createTestGameState({
				unlockedSystems: {
					...INITIAL_UNLOCKED_SYSTEMS,
					platformOwnership: true
				},
				ownedPlatforms: [
					{
						id: 'streaming_1',
						type: 'streaming',
						name: streamingDef.name,
						cost: streamingDef.baseCost,
						acquiredAt: Date.now(),
						incomePerSecond: streamingDef.incomePerSecond,
						controlContribution: streamingDef.controlContribution
					}
				]
			});

			const available = getAvailablePlatformsForPurchase(state);
			expect(available).toHaveLength(5);
			expect(available.some((p) => p.type === 'streaming')).toBe(false);
		});

		it('should return empty array if all platforms are owned', () => {
			const allPlatforms = getAllPlatforms().map((def) => ({
				id: `${def.type}_1`,
				type: def.type,
				name: def.name,
				cost: def.baseCost,
				acquiredAt: Date.now(),
				incomePerSecond: def.incomePerSecond,
				controlContribution: def.controlContribution
			}));

			const state = createTestGameState({
				unlockedSystems: {
					...INITIAL_UNLOCKED_SYSTEMS,
					platformOwnership: true
				},
				ownedPlatforms: allPlatforms
			});

			const available = getAvailablePlatformsForPurchase(state);
			expect(available).toHaveLength(0);
		});
	});

	describe('Monopoly Summary', () => {
		it('should provide accurate summary for new game', () => {
			const state = createTestGameState({
				unlockedSystems: {
					...INITIAL_UNLOCKED_SYSTEMS,
					platformOwnership: true
				}
			});

			const summary = getMonopolySummary(state);
			expect(summary.unlocked).toBe(true);
			expect(summary.ownedPlatforms).toBe(0);
			expect(summary.totalPlatforms).toBe(6);
			expect(summary.availablePlatforms).toBe(6);
			expect(summary.industryControl).toBe(0);
			expect(summary.platformIncome).toBe(0);
			expect(summary.hasWon).toBe(false);
		});

		it('should provide accurate summary with platforms owned', () => {
			const streamingDef = getPlatformByType('streaming')!;
			const state = createTestGameState({
				unlockedSystems: {
					...INITIAL_UNLOCKED_SYSTEMS,
					platformOwnership: true
				},
				ownedPlatforms: [
					{
						id: 'streaming_1',
						type: 'streaming',
						name: streamingDef.name,
						cost: streamingDef.baseCost,
						acquiredAt: Date.now(),
						incomePerSecond: streamingDef.incomePerSecond,
						controlContribution: streamingDef.controlContribution
					}
				]
			});

			updateControlProgress(state);

			const summary = getMonopolySummary(state);
			expect(summary.ownedPlatforms).toBe(1);
			expect(summary.availablePlatforms).toBe(5);
			expect(summary.industryControl).toBe(streamingDef.controlContribution);
			expect(summary.platformIncome).toBe(streamingDef.incomePerSecond);
		});
	});

	describe('Recommended Platform', () => {
		it('should return null if no platforms available', () => {
			const allPlatforms = getAllPlatforms().map((def) => ({
				id: `${def.type}_1`,
				type: def.type,
				name: def.name,
				cost: def.baseCost,
				acquiredAt: Date.now(),
				incomePerSecond: def.incomePerSecond,
				controlContribution: def.controlContribution
			}));

			const state = createTestGameState({
				unlockedSystems: {
					...INITIAL_UNLOCKED_SYSTEMS,
					platformOwnership: true
				},
				ownedPlatforms: allPlatforms
			});

			const recommended = getRecommendedPlatform(state);
			expect(recommended).toBeNull();
		});

		it('should recommend platform with best control per dollar ratio', () => {
			const state = createTestGameState({
				unlockedSystems: {
					...INITIAL_UNLOCKED_SYSTEMS,
					platformOwnership: true
				}
			});

			const recommended = getRecommendedPlatform(state);
			expect(recommended).not.toBeNull();

			// Calculate efficiency for verification
			const efficiency = recommended!.controlContribution / recommended!.baseCost;

			// Check that this is indeed the best efficiency
			const allPlatforms = getAllPlatforms();
			for (const platform of allPlatforms) {
				const platformEfficiency = platform.controlContribution / platform.baseCost;
				expect(efficiency).toBeGreaterThanOrEqual(platformEfficiency);
			}
		});
	});

	describe('Unlock Progress Tracking', () => {
		it('should track progress toward unlock requirements', () => {
			const state = createTestGameState({
				fans: 500_000, // 50% of requirement
				techTier: 6,
				tours: createCompletedTours(25) // 50% of requirement
			});

			const progress = getUnlockProgress(state);
			expect(progress.fans.percentage).toBe(50);
			expect(progress.tours.percentage).toBe(50);
			expect(progress.techTier.met).toBe(true);
			expect(progress.allRequirementsMet).toBe(false);
		});

		it('should cap progress at 100%', () => {
			const state = createTestGameState({
				fans: 10_000_000, // 1000% of requirement
				techTier: 7,
				tours: createCompletedTours(500) // 1000% of requirement
			});

			const progress = getUnlockProgress(state);
			expect(progress.fans.percentage).toBe(100);
			expect(progress.tours.percentage).toBe(100);
			expect(progress.allRequirementsMet).toBe(true);
		});
	});

	describe('Batch Platform Purchase', () => {
		it('should purchase multiple platforms at once', () => {
			const state = createTestGameState({
				money: 1_000_000_000,
				unlockedSystems: {
					...INITIAL_UNLOCKED_SYSTEMS,
					platformOwnership: true
				}
			});

			const purchased = purchaseMultiplePlatforms(state, [
				'streaming',
				'ticketing',
				'venue'
			]);
			expect(purchased).toHaveLength(3);
			expect(state.ownedPlatforms).toHaveLength(3);
		});

		it('should skip platforms that cannot be afforded', () => {
			const state = createTestGameState({
				money: 15_000_000, // Only enough for streaming
				unlockedSystems: {
					...INITIAL_UNLOCKED_SYSTEMS,
					platformOwnership: true
				}
			});

			const purchased = purchaseMultiplePlatforms(state, [
				'streaming',
				'ticketing', // Too expensive
				'billboard' // Too expensive
			]);
			expect(purchased).toHaveLength(1);
			expect(purchased[0]).toBe('streaming');
		});

		it('should skip already owned platforms', () => {
			const streamingDef = getPlatformByType('streaming')!;
			const state = createTestGameState({
				money: 1_000_000_000,
				unlockedSystems: {
					...INITIAL_UNLOCKED_SYSTEMS,
					platformOwnership: true
				},
				ownedPlatforms: [
					{
						id: 'streaming_1',
						type: 'streaming',
						name: streamingDef.name,
						cost: streamingDef.baseCost,
						acquiredAt: Date.now(),
						incomePerSecond: streamingDef.incomePerSecond,
						controlContribution: streamingDef.controlContribution
					}
				]
			});

			const purchased = purchaseMultiplePlatforms(state, ['streaming', 'ticketing']);
			expect(purchased).toHaveLength(1);
			expect(purchased[0]).toBe('ticketing');
		});
	});

	describe('Time to Afford Calculation', () => {
		it('should return 0 if already affordable', () => {
			const state = createTestGameState({
				money: 50_000_000
			});

			const time = getTimeToAfford(state, 'streaming', 10000);
			expect(time).toBe(0);
		});

		it('should calculate correct time based on income rate', () => {
			const streamingDef = getPlatformByType('streaming')!;
			const state = createTestGameState({
				money: 0
			});

			const incomePerSecond = 10000;
			const time = getTimeToAfford(state, 'streaming', incomePerSecond);
			const expectedTime = streamingDef.baseCost / incomePerSecond;
			expect(time).toBe(expectedTime);
		});

		it('should return Infinity if no income', () => {
			const state = createTestGameState({
				money: 0
			});

			const time = getTimeToAfford(state, 'streaming', 0);
			expect(time).toBe(Infinity);
		});

		it('should return null for invalid platform', () => {
			const state = createTestGameState();

			// @ts-expect-error Testing invalid input
			const time = getTimeToAfford(state, 'invalid_platform', 10000);
			expect(time).toBeNull();
		});
	});

	describe('Platform Income Processing', () => {
		it('should not crash when called with platforms', () => {
			const streamingDef = getPlatformByType('streaming')!;
			const state = createTestGameState({
				ownedPlatforms: [
					{
						id: 'streaming_1',
						type: 'streaming',
						name: streamingDef.name,
						cost: streamingDef.baseCost,
						acquiredAt: Date.now(),
						incomePerSecond: streamingDef.incomePerSecond,
						controlContribution: streamingDef.controlContribution
					}
				]
			});

			// processPlatformIncome exists for future extensions
			// Currently income is handled by the income system
			expect(() => processPlatformIncome(state, 1000)).not.toThrow();
		});
	});
});
