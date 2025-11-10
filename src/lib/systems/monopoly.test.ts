/**
 * Unit tests for Monopoly System
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
	unlockPlatformOwnership,
	purchasePlatform,
	calculateIndustryControl,
	updateControlProgress,
	processPlatformIncome,
	getPlatformIncomeRate,
	getTotalPlatformInvestment,
	hasAllPlatforms,
	getPlatformProgress,
	MIN_TOURS_FOR_PLATFORMS,
	MIN_FANS_FOR_PLATFORMS,
	MIN_TECH_TIER_FOR_PLATFORMS
} from './monopoly';
import type { GameState, Artist, UnlockedSystems, Tour, TechTier } from '../game/types';
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
	GAME_VERSION,
	BASE_SONG_GENERATION_TIME
} from '../game/config';
import { PLATFORM_DEFINITIONS } from '../data/platforms';

// ============================================================================
// TEST HELPERS
// ============================================================================

/**
 * Create a minimal valid GameState for testing
 */
function createTestGameState(overrides?: Partial<GameState>): GameState {
	const now = Date.now();

	const defaultArtist: Artist = {
		name: 'Test Artist',
		songs: 0,
		fans: 0,
		peakFans: 0,
		createdAt: now
	};

	const defaultUnlockedSystems: UnlockedSystems = { ...INITIAL_UNLOCKED_SYSTEMS };

	return {
		money: INITIAL_MONEY,
		songs: [],
		fans: INITIAL_FANS,
		gpu: INITIAL_GPU,
		phase: INITIAL_PHASE,
		industryControl: INITIAL_INDUSTRY_CONTROL,
		currentArtist: defaultArtist,
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
		unlockedSystems: defaultUnlockedSystems,
		lastUpdate: now,
		createdAt: now,
		version: GAME_VERSION,
		...overrides
	};
}

/**
 * Create a completed tour for testing
 */
function createCompletedTour(id: string, completedAt: number): Tour {
	return {
		id,
		name: `Tour ${id}`,
		startedAt: completedAt - 180000, // 3 minutes ago
		completedAt,
		incomePerSecond: 10000,
		usesScarcity: false
	};
}

/**
 * Create an active (not completed) tour for testing
 */
function createActiveTour(id: string): Tour {
	return {
		id,
		name: `Tour ${id}`,
		startedAt: Date.now(),
		completedAt: null,
		incomePerSecond: 10000,
		usesScarcity: false
	};
}

// ============================================================================
// UNLOCK PLATFORM OWNERSHIP TESTS
// ============================================================================

describe('unlockPlatformOwnership', () => {
	it('should return false when no requirements are met', () => {
		const state = createTestGameState();
		expect(unlockPlatformOwnership(state)).toBe(false);
	});

	it('should return false when only tours requirement is met', () => {
		const tours: Tour[] = [];
		for (let i = 0; i < MIN_TOURS_FOR_PLATFORMS; i++) {
			tours.push(createCompletedTour(`tour-${i}`, Date.now()));
		}

		const state = createTestGameState({
			tours,
			fans: 0,
			techTier: 1
		});

		expect(unlockPlatformOwnership(state)).toBe(false);
	});

	it('should return false when only fans requirement is met', () => {
		const state = createTestGameState({
			tours: [],
			fans: MIN_FANS_FOR_PLATFORMS,
			techTier: 1
		});

		expect(unlockPlatformOwnership(state)).toBe(false);
	});

	it('should return false when only tech tier requirement is met', () => {
		const state = createTestGameState({
			tours: [],
			fans: 0,
			techTier: MIN_TECH_TIER_FOR_PLATFORMS as TechTier
		});

		expect(unlockPlatformOwnership(state)).toBe(false);
	});

	it('should return false when tours and fans met but not tech tier', () => {
		const tours: Tour[] = [];
		for (let i = 0; i < MIN_TOURS_FOR_PLATFORMS; i++) {
			tours.push(createCompletedTour(`tour-${i}`, Date.now()));
		}

		const state = createTestGameState({
			tours,
			fans: MIN_FANS_FOR_PLATFORMS,
			techTier: 5 as TechTier // One tier below requirement
		});

		expect(unlockPlatformOwnership(state)).toBe(false);
	});

	it('should return true when all requirements are met', () => {
		const tours: Tour[] = [];
		for (let i = 0; i < MIN_TOURS_FOR_PLATFORMS; i++) {
			tours.push(createCompletedTour(`tour-${i}`, Date.now()));
		}

		const state = createTestGameState({
			tours,
			fans: MIN_FANS_FOR_PLATFORMS,
			techTier: MIN_TECH_TIER_FOR_PLATFORMS as TechTier
		});

		expect(unlockPlatformOwnership(state)).toBe(true);
	});

	it('should return true when requirements are exceeded', () => {
		const tours: Tour[] = [];
		for (let i = 0; i < MIN_TOURS_FOR_PLATFORMS * 2; i++) {
			tours.push(createCompletedTour(`tour-${i}`, Date.now()));
		}

		const state = createTestGameState({
			tours,
			fans: MIN_FANS_FOR_PLATFORMS * 10,
			techTier: 7 as TechTier
		});

		expect(unlockPlatformOwnership(state)).toBe(true);
	});

	it('should only count completed tours, not active ones', () => {
		const tours: Tour[] = [];

		// Add completed tours (one less than required)
		for (let i = 0; i < MIN_TOURS_FOR_PLATFORMS - 1; i++) {
			tours.push(createCompletedTour(`completed-${i}`, Date.now()));
		}

		// Add active tours
		for (let i = 0; i < 10; i++) {
			tours.push(createActiveTour(`active-${i}`));
		}

		const state = createTestGameState({
			tours,
			fans: MIN_FANS_FOR_PLATFORMS,
			techTier: MIN_TECH_TIER_FOR_PLATFORMS as TechTier
		});

		expect(unlockPlatformOwnership(state)).toBe(false);
	});
});

// ============================================================================
// PURCHASE PLATFORM TESTS
// ============================================================================

describe('purchasePlatform', () => {
	it('should return false if platformOwnership is not unlocked', () => {
		const state = createTestGameState({
			money: 1_000_000_000,
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				platformOwnership: false
			}
		});

		const result = purchasePlatform(state, 'streaming_service');
		expect(result).toBe(false);
		expect(state.ownedPlatforms.length).toBe(0);
	});

	it('should return false if platform does not exist', () => {
		const state = createTestGameState({
			money: 1_000_000_000,
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				platformOwnership: true
			}
		});

		const result = purchasePlatform(state, 'nonexistent_platform');
		expect(result).toBe(false);
		expect(state.ownedPlatforms.length).toBe(0);
	});

	it('should return false if player cannot afford platform', () => {
		const state = createTestGameState({
			money: 1000, // Not enough for any platform
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				platformOwnership: true
			}
		});

		const result = purchasePlatform(state, 'streaming_service');
		expect(result).toBe(false);
		expect(state.ownedPlatforms.length).toBe(0);
		expect(state.money).toBe(1000); // Money should not change
	});

	it('should return false if platform is already owned', () => {
		const state = createTestGameState({
			money: 1_000_000_000,
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				platformOwnership: true
			},
			ownedPlatforms: [
				{
					id: 'streaming_service',
					type: 'streaming',
					name: 'Major Streaming Platform',
					cost: 100_000_000,
					acquiredAt: Date.now(),
					incomePerSecond: 50_000,
					controlContribution: 15
				}
			]
		});

		const initialMoney = state.money;
		const result = purchasePlatform(state, 'streaming_service');
		expect(result).toBe(false);
		expect(state.ownedPlatforms.length).toBe(1);
		expect(state.money).toBe(initialMoney); // Money should not change
	});

	it('should successfully purchase platform when all conditions are met', () => {
		const state = createTestGameState({
			money: 200_000_000,
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				platformOwnership: true
			}
		});

		const result = purchasePlatform(state, 'streaming_service');
		expect(result).toBe(true);
		expect(state.ownedPlatforms.length).toBe(1);

		const platform = state.ownedPlatforms[0];
		expect(platform.id).toBe('streaming_service');
		expect(platform.type).toBe('streaming');
		expect(platform.name).toBe('Major Streaming Platform');
		expect(platform.incomePerSecond).toBe(50_000);
		expect(platform.controlContribution).toBe(15);
		expect(state.money).toBe(100_000_000); // 200M - 100M cost
	});

	it('should return false if prerequisites are not met', () => {
		const state = createTestGameState({
			money: 1_000_000_000,
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				platformOwnership: true
			}
		});

		// Try to buy algorithm_control without owning streaming_service first
		const result = purchasePlatform(state, 'algorithm_control');
		expect(result).toBe(false);
		expect(state.ownedPlatforms.length).toBe(0);
	});

	it('should successfully purchase platform with prerequisites met', () => {
		const state = createTestGameState({
			money: 500_000_000,
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				platformOwnership: true
			},
			ownedPlatforms: [
				{
					id: 'streaming_service',
					type: 'streaming',
					name: 'Major Streaming Platform',
					cost: 100_000_000,
					acquiredAt: Date.now(),
					incomePerSecond: 50_000,
					controlContribution: 15
				}
			]
		});

		// Now we can buy algorithm_control
		const result = purchasePlatform(state, 'algorithm_control');
		expect(result).toBe(true);
		expect(state.ownedPlatforms.length).toBe(2);
		expect(state.money).toBe(250_000_000); // 500M - 250M cost
	});

	it('should update industry control when platform is purchased', () => {
		const state = createTestGameState({
			money: 200_000_000,
			industryControl: 0,
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				platformOwnership: true
			}
		});

		purchasePlatform(state, 'streaming_service');
		expect(state.industryControl).toBe(15); // Control contribution from streaming service
	});
});

// ============================================================================
// INDUSTRY CONTROL TESTS
// ============================================================================

describe('calculateIndustryControl', () => {
	it('should return 0 when no achievements are met', () => {
		const state = createTestGameState();
		expect(calculateIndustryControl(state)).toBe(0);
	});

	// Fan Milestone Tests
	it('should award 2% control at 10k fans', () => {
		const state = createTestGameState({ fans: 10_000 });
		expect(calculateIndustryControl(state)).toBe(2);
	});

	it('should award 5% control at 100k fans (2% + 3%)', () => {
		const state = createTestGameState({ fans: 100_000 });
		expect(calculateIndustryControl(state)).toBe(5); // 2 + 3
	});

	it('should award 9% control at 1M fans (2% + 3% + 4%)', () => {
		const state = createTestGameState({ fans: 1_000_000 });
		expect(calculateIndustryControl(state)).toBe(9); // 2 + 3 + 4
	});

	it('should award 14% control at 10M fans (2% + 3% + 4% + 5%)', () => {
		const state = createTestGameState({ fans: 10_000_000 });
		expect(calculateIndustryControl(state)).toBe(14); // 2 + 3 + 4 + 5
	});

	// Tech Tier Achievement Tests
	it('should award 5% control at tech tier 3 (Local AI Models)', () => {
		const state = createTestGameState({ techTier: 3 as TechTier });
		expect(calculateIndustryControl(state)).toBe(5);
	});

	it('should award 13% control at tech tier 6 (Own Your Software)', () => {
		const state = createTestGameState({ techTier: 6 as TechTier });
		expect(calculateIndustryControl(state)).toBe(13); // 5 + 8
	});

	it('should award 23% control at tech tier 7 (AI Agents)', () => {
		const state = createTestGameState({ techTier: 7 as TechTier });
		expect(calculateIndustryControl(state)).toBe(23); // 5 + 8 + 10
	});

	// Phase Unlock Tests
	it('should award 5% control at phase 2 (Physical Albums)', () => {
		const state = createTestGameState({ phase: 2 });
		expect(calculateIndustryControl(state)).toBe(5);
	});

	it('should award 11% control at phase 3 (Tours)', () => {
		const state = createTestGameState({ phase: 3 });
		expect(calculateIndustryControl(state)).toBe(11); // 5 + 6
	});

	it('should award 18% control at phase 4 (Platform Ownership)', () => {
		const state = createTestGameState({ phase: 4 });
		expect(calculateIndustryControl(state)).toBe(18); // 5 + 6 + 7
	});

	it('should award 26% control at phase 5 (Total Automation)', () => {
		const state = createTestGameState({ phase: 5 });
		expect(calculateIndustryControl(state)).toBe(26); // 5 + 6 + 7 + 8
	});

	// Prestige Tests
	it('should award 8% control per prestige', () => {
		const state1 = createTestGameState({ prestigeCount: 1 });
		expect(calculateIndustryControl(state1)).toBe(8);

		const state2 = createTestGameState({ prestigeCount: 3 });
		expect(calculateIndustryControl(state2)).toBe(24); // 8 * 3

		const state3 = createTestGameState({ prestigeCount: 5 });
		expect(calculateIndustryControl(state3)).toBe(40); // 8 * 5
	});

	// Platform Ownership Tests
	it('should return correct control for single platform', () => {
		const state = createTestGameState({
			ownedPlatforms: [
				{
					id: 'streaming_service',
					type: 'streaming',
					name: 'Major Streaming Platform',
					cost: 100_000_000,
					acquiredAt: Date.now(),
					incomePerSecond: 50_000,
					controlContribution: 15
				}
			]
		});

		expect(calculateIndustryControl(state)).toBe(15);
	});

	it('should sum control contributions from multiple platforms', () => {
		const state = createTestGameState({
			ownedPlatforms: [
				{
					id: 'streaming_service',
					type: 'streaming',
					name: 'Major Streaming Platform',
					cost: 100_000_000,
					acquiredAt: Date.now(),
					incomePerSecond: 50_000,
					controlContribution: 15
				},
				{
					id: 'algorithm_control',
					type: 'algorithm',
					name: 'Algorithm Control',
					cost: 250_000_000,
					acquiredAt: Date.now(),
					incomePerSecond: 100_000,
					controlContribution: 20
				},
				{
					id: 'ticketing_monopoly',
					type: 'ticketing',
					name: 'Ticketing Monopoly',
					cost: 150_000_000,
					acquiredAt: Date.now(),
					incomePerSecond: 75_000,
					controlContribution: 12
				}
			]
		});

		expect(calculateIndustryControl(state)).toBe(47); // 15 + 20 + 12
	});

	// Combined Achievement Tests
	it('should combine all sources of control correctly', () => {
		const state = createTestGameState({
			fans: 10_000_000, // 14%
			techTier: 7 as TechTier, // 23%
			phase: 5, // 26%
			prestigeCount: 3, // 24%
			ownedPlatforms: [
				{
					id: 'streaming_service',
					type: 'streaming',
					name: 'Major Streaming Platform',
					cost: 100_000_000,
					acquiredAt: Date.now(),
					incomePerSecond: 50_000,
					controlContribution: 15
				}
			] // 15%
		});

		// Total: 14 + 23 + 26 + 24 + 15 = 102, capped at 100
		expect(calculateIndustryControl(state)).toBe(100);
	});

	it('should cap control at 100%', () => {
		// Create state with maximum achievements
		const allPlatforms = PLATFORM_DEFINITIONS.map((def) => ({
			id: def.id,
			type: def.type,
			name: def.name,
			cost: def.baseCost,
			acquiredAt: Date.now(),
			incomePerSecond: def.incomePerSecond,
			controlContribution: def.controlContribution
		}));

		const state = createTestGameState({
			fans: 100_000_000, // Max fans (14%)
			techTier: 7 as TechTier, // Max tech (23%)
			phase: 5, // Max phase (26%)
			prestigeCount: 10, // 10 prestiges (80%)
			ownedPlatforms: allPlatforms // All platforms (125%)
		});

		// Total would be 14 + 23 + 26 + 80 + 125 = 268, but capped at 100
		expect(calculateIndustryControl(state)).toBe(100);
	});

	it('should achieve 100% control with 3 prestiges and minimal platforms', () => {
		const state = createTestGameState({
			fans: 10_000_000, // 14%
			techTier: 7 as TechTier, // 23%
			phase: 5, // 26%
			prestigeCount: 3, // 24% (total so far: 87%)
			ownedPlatforms: [
				{
					id: 'streaming_service',
					type: 'streaming',
					name: 'Major Streaming Platform',
					cost: 100_000_000,
					acquiredAt: Date.now(),
					incomePerSecond: 50_000,
					controlContribution: 15 // 13% needed, 15% provided
				}
			]
		});

		// Total: 14 + 23 + 26 + 24 + 15 = 102, capped at 100
		expect(calculateIndustryControl(state)).toBe(100);
	});

	it('should achieve 100% control with 5 prestiges and no platforms', () => {
		const state = createTestGameState({
			fans: 10_000_000, // 14%
			techTier: 7 as TechTier, // 23%
			phase: 5, // 26%
			prestigeCount: 5 // 40%
		});

		// Total: 14 + 23 + 26 + 40 = 103, capped at 100
		expect(calculateIndustryControl(state)).toBe(100);
	});
});

describe('updateControlProgress', () => {
	it('should set industry control based on all achievement sources', () => {
		const state = createTestGameState({
			industryControl: 0,
			fans: 10_000, // 2%
			techTier: 3 as TechTier, // 5%
			phase: 2, // 5%
			prestigeCount: 1, // 8%
			ownedPlatforms: [
				{
					id: 'streaming_service',
					type: 'streaming',
					name: 'Major Streaming Platform',
					cost: 100_000_000,
					acquiredAt: Date.now(),
					incomePerSecond: 50_000,
					controlContribution: 15
				}
			] // 15%
		});

		updateControlProgress(state);
		// Total: 2 + 5 + 5 + 8 + 15 = 35
		expect(state.industryControl).toBe(35);
	});

	it('should cap industry control at 100', () => {
		// Create state with all platforms (control should exceed 100)
		const allPlatforms = PLATFORM_DEFINITIONS.map((def) => ({
			id: def.id,
			type: def.type,
			name: def.name,
			cost: def.baseCost,
			acquiredAt: Date.now(),
			incomePerSecond: def.incomePerSecond,
			controlContribution: def.controlContribution
		}));

		const state = createTestGameState({
			industryControl: 0,
			fans: 100_000_000, // 14%
			techTier: 7 as TechTier, // 23%
			phase: 5, // 26%
			prestigeCount: 10, // 80%
			ownedPlatforms: allPlatforms // 125%
		});

		updateControlProgress(state);
		expect(state.industryControl).toBe(100); // Should be capped at 100
	});

	it('should update control dynamically as achievements change', () => {
		const state = createTestGameState({
			industryControl: 0,
			fans: 5_000 // Not yet at 10k milestone
		});

		updateControlProgress(state);
		expect(state.industryControl).toBe(0);

		// Reach 10k fans
		state.fans = 10_000;
		updateControlProgress(state);
		expect(state.industryControl).toBe(2);

		// Reach 100k fans
		state.fans = 100_000;
		updateControlProgress(state);
		expect(state.industryControl).toBe(5);

		// Add a prestige
		state.prestigeCount = 1;
		updateControlProgress(state);
		expect(state.industryControl).toBe(13); // 5 + 8
	});

	it('should persist control through game progression', () => {
		const state = createTestGameState({
			fans: 10_000_000, // 14%
			techTier: 7 as TechTier, // 23%
			phase: 5, // 26%
			prestigeCount: 3 // 24%
		});

		updateControlProgress(state);
		// Total: 14 + 23 + 26 + 24 = 87
		expect(state.industryControl).toBe(87);

		// Industry control should reflect all accumulated achievements
		// Even if fans decrease (which shouldn't happen), control is based on current state
		// This test verifies the calculation is deterministic
		updateControlProgress(state);
		expect(state.industryControl).toBe(87);
	});
});

// ============================================================================
// PLATFORM INCOME TESTS
// ============================================================================

describe('processPlatformIncome', () => {
	it('should not add income when no platforms are owned', () => {
		const state = createTestGameState({
			money: 1000
		});

		processPlatformIncome(state, 1000); // 1 second
		expect(state.money).toBe(1000);
	});

	it('should add correct income for one platform over 1 second', () => {
		const state = createTestGameState({
			money: 0,
			ownedPlatforms: [
				{
					id: 'streaming_service',
					type: 'streaming',
					name: 'Major Streaming Platform',
					cost: 100_000_000,
					acquiredAt: Date.now(),
					incomePerSecond: 50_000,
					controlContribution: 15
				}
			]
		});

		processPlatformIncome(state, 1000); // 1 second = 1000ms
		expect(state.money).toBeCloseTo(50_000);
	});

	it('should add correct income for multiple platforms', () => {
		const state = createTestGameState({
			money: 0,
			ownedPlatforms: [
				{
					id: 'streaming_service',
					type: 'streaming',
					name: 'Major Streaming Platform',
					cost: 100_000_000,
					acquiredAt: Date.now(),
					incomePerSecond: 50_000,
					controlContribution: 15
				},
				{
					id: 'algorithm_control',
					type: 'algorithm',
					name: 'Algorithm Control',
					cost: 250_000_000,
					acquiredAt: Date.now(),
					incomePerSecond: 100_000,
					controlContribution: 20
				}
			]
		});

		processPlatformIncome(state, 1000); // 1 second
		expect(state.money).toBeCloseTo(150_000); // 50K + 100K
	});

	it('should handle partial seconds correctly', () => {
		const state = createTestGameState({
			money: 0,
			ownedPlatforms: [
				{
					id: 'streaming_service',
					type: 'streaming',
					name: 'Major Streaming Platform',
					cost: 100_000_000,
					acquiredAt: Date.now(),
					incomePerSecond: 50_000,
					controlContribution: 15
				}
			]
		});

		processPlatformIncome(state, 500); // 0.5 seconds
		expect(state.money).toBeCloseTo(25_000); // 50K * 0.5
	});
});

describe('getPlatformIncomeRate', () => {
	it('should return 0 when no platforms are owned', () => {
		const state = createTestGameState();
		expect(getPlatformIncomeRate(state)).toBe(0);
	});

	it('should return correct rate for one platform', () => {
		const state = createTestGameState({
			ownedPlatforms: [
				{
					id: 'streaming_service',
					type: 'streaming',
					name: 'Major Streaming Platform',
					cost: 100_000_000,
					acquiredAt: Date.now(),
					incomePerSecond: 50_000,
					controlContribution: 15
				}
			]
		});

		expect(getPlatformIncomeRate(state)).toBe(50_000);
	});

	it('should sum rates from multiple platforms', () => {
		const state = createTestGameState({
			ownedPlatforms: [
				{
					id: 'streaming_service',
					type: 'streaming',
					name: 'Major Streaming Platform',
					cost: 100_000_000,
					acquiredAt: Date.now(),
					incomePerSecond: 50_000,
					controlContribution: 15
				},
				{
					id: 'algorithm_control',
					type: 'algorithm',
					name: 'Algorithm Control',
					cost: 250_000_000,
					acquiredAt: Date.now(),
					incomePerSecond: 100_000,
					controlContribution: 20
				}
			]
		});

		expect(getPlatformIncomeRate(state)).toBe(150_000);
	});
});

// ============================================================================
// PLATFORM QUERY TESTS
// ============================================================================

describe('getTotalPlatformInvestment', () => {
	it('should return 0 when no platforms are owned', () => {
		const state = createTestGameState();
		expect(getTotalPlatformInvestment(state)).toBe(0);
	});

	it('should return correct investment for one platform', () => {
		const state = createTestGameState({
			ownedPlatforms: [
				{
					id: 'streaming_service',
					type: 'streaming',
					name: 'Major Streaming Platform',
					cost: 100_000_000,
					acquiredAt: Date.now(),
					incomePerSecond: 50_000,
					controlContribution: 15
				}
			]
		});

		expect(getTotalPlatformInvestment(state)).toBe(100_000_000);
	});

	it('should sum investments from multiple platforms', () => {
		const state = createTestGameState({
			ownedPlatforms: [
				{
					id: 'streaming_service',
					type: 'streaming',
					name: 'Major Streaming Platform',
					cost: 100_000_000,
					acquiredAt: Date.now(),
					incomePerSecond: 50_000,
					controlContribution: 15
				},
				{
					id: 'algorithm_control',
					type: 'algorithm',
					name: 'Algorithm Control',
					cost: 250_000_000,
					acquiredAt: Date.now(),
					incomePerSecond: 100_000,
					controlContribution: 20
				}
			]
		});

		expect(getTotalPlatformInvestment(state)).toBe(350_000_000);
	});
});

describe('hasAllPlatforms', () => {
	it('should return false when no platforms are owned', () => {
		const state = createTestGameState();
		expect(hasAllPlatforms(state)).toBe(false);
	});

	it('should return false when some platforms are owned', () => {
		const state = createTestGameState({
			ownedPlatforms: [
				{
					id: 'streaming_service',
					type: 'streaming',
					name: 'Major Streaming Platform',
					cost: 100_000_000,
					acquiredAt: Date.now(),
					incomePerSecond: 50_000,
					controlContribution: 15
				}
			]
		});

		expect(hasAllPlatforms(state)).toBe(false);
	});

	it('should return true when all platforms are owned', () => {
		const allPlatforms = PLATFORM_DEFINITIONS.map((def) => ({
			id: def.id,
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

		expect(hasAllPlatforms(state)).toBe(true);
	});
});

describe('getPlatformProgress', () => {
	it('should return correct progress when no platforms are owned', () => {
		const state = createTestGameState();
		const progress = getPlatformProgress(state);

		expect(progress.owned).toBe(0);
		expect(progress.total).toBe(PLATFORM_DEFINITIONS.length);
		expect(progress.percentage).toBe(0);
	});

	it('should return correct progress when some platforms are owned', () => {
		const state = createTestGameState({
			ownedPlatforms: [
				{
					id: 'streaming_service',
					type: 'streaming',
					name: 'Major Streaming Platform',
					cost: 100_000_000,
					acquiredAt: Date.now(),
					incomePerSecond: 50_000,
					controlContribution: 15
				},
				{
					id: 'algorithm_control',
					type: 'algorithm',
					name: 'Algorithm Control',
					cost: 250_000_000,
					acquiredAt: Date.now(),
					incomePerSecond: 100_000,
					controlContribution: 20
				}
			]
		});

		const progress = getPlatformProgress(state);

		expect(progress.owned).toBe(2);
		expect(progress.total).toBe(PLATFORM_DEFINITIONS.length);
		expect(progress.percentage).toBeCloseTo((2 / PLATFORM_DEFINITIONS.length) * 100);
	});

	it('should return 100% when all platforms are owned', () => {
		const allPlatforms = PLATFORM_DEFINITIONS.map((def) => ({
			id: def.id,
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

		const progress = getPlatformProgress(state);

		expect(progress.owned).toBe(PLATFORM_DEFINITIONS.length);
		expect(progress.total).toBe(PLATFORM_DEFINITIONS.length);
		expect(progress.percentage).toBe(100);
	});
});
