/**
 * Unit tests for Tour and Concert System
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	shouldUnlockTours,
	canStartTour,
	getMaxActiveTours,
	getActiveTourCount,
	calculateTourIncomePerSecond,
	startTour,
	processTours,
	calculateTourIncome,
	getTourCost,
	getTourDuration,
	enableScarcityTactics,
	getTotalTourRevenue,
	getTourStats
} from './tours';
import type {
	GameState,
	TechTier,
	Artist,
	UnlockedSystems,
	PhysicalAlbum,
	Tour
} from '../game/types';
import {
	TOUR_BASE_COST,
	TOUR_DURATION,
	TOUR_BASE_INCOME_PER_SECOND,
	TOUR_FAN_MULTIPLIER,
	MAX_ACTIVE_TOURS,
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
 * Create test physical album
 */
function createTestAlbum(id: number): PhysicalAlbum {
	return {
		id: `album-${id}`,
		name: `Test Album ${id}`,
		songCount: 10,
		releasedAt: Date.now(),
		payout: 500000,
		variantCount: 1,
		isRerelease: false
	};
}

/**
 * Mock crypto.randomUUID for deterministic tests
 */
let mockUuidCounter = 0;
function mockUuid(): string {
	return `test-uuid-${mockUuidCounter++}`;
}

// ============================================================================
// UNLOCK TESTS
// ============================================================================

describe('shouldUnlockTours', () => {
	beforeEach(() => {
		mockUuidCounter = 0;
		vi.stubGlobal('crypto', { randomUUID: mockUuid });
	});

	it('should return false when tours system is not unlocked', () => {
		const state = createTestGameState({
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, tours: false },
			fans: 100_000,
			physicalAlbums: Array.from({ length: 10 }, (_, i) => createTestAlbum(i))
		});

		expect(shouldUnlockTours(state)).toBe(false);
	});

	it('should return false when not enough albums', () => {
		const state = createTestGameState({
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, tours: true },
			fans: 100_000,
			physicalAlbums: Array.from({ length: 5 }, (_, i) => createTestAlbum(i))
		});

		expect(shouldUnlockTours(state)).toBe(false);
	});

	it('should return false when not enough fans', () => {
		const state = createTestGameState({
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, tours: true },
			fans: 50_000,
			physicalAlbums: Array.from({ length: 10 }, (_, i) => createTestAlbum(i))
		});

		expect(shouldUnlockTours(state)).toBe(false);
	});

	it('should return true when all requirements are met', () => {
		const state = createTestGameState({
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, tours: true },
			fans: 100_000,
			physicalAlbums: Array.from({ length: 10 }, (_, i) => createTestAlbum(i))
		});

		expect(shouldUnlockTours(state)).toBe(true);
	});

	it('should return true when exceeding minimum requirements', () => {
		const state = createTestGameState({
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, tours: true },
			fans: 500_000,
			physicalAlbums: Array.from({ length: 50 }, (_, i) => createTestAlbum(i))
		});

		expect(shouldUnlockTours(state)).toBe(true);
	});
});

describe('canStartTour', () => {
	beforeEach(() => {
		mockUuidCounter = 0;
		vi.stubGlobal('crypto', { randomUUID: mockUuid });
	});

	it('should return false when tours are not unlocked', () => {
		const state = createTestGameState({
			money: 10_000_000,
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, tours: false }
		});

		expect(canStartTour(state)).toBe(false);
	});

	it('should return false when not enough money', () => {
		const state = createTestGameState({
			money: 1_000_000, // Less than TOUR_BASE_COST (5M)
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, tours: true },
			fans: 100_000,
			physicalAlbums: Array.from({ length: 10 }, (_, i) => createTestAlbum(i))
		});

		expect(canStartTour(state)).toBe(false);
	});

	it('should return false when max active tours reached', () => {
		const activeTours: Tour[] = [
			{
				id: 'tour-1',
				name: 'Test Tour 1',
				startedAt: Date.now(),
				completedAt: null,
				incomePerSecond: 50000,
				usesScarcity: false
			}
		];

		const state = createTestGameState({
			money: 10_000_000,
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, tours: true },
			fans: 100_000,
			physicalAlbums: Array.from({ length: 10 }, (_, i) => createTestAlbum(i)),
			techTier: 3, // Max 1 tour at tier 3
			tours: activeTours
		});

		expect(canStartTour(state)).toBe(false);
	});

	it('should return true when all conditions are met', () => {
		const state = createTestGameState({
			money: 10_000_000,
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, tours: true },
			fans: 100_000,
			physicalAlbums: Array.from({ length: 10 }, (_, i) => createTestAlbum(i)),
			techTier: 3
		});

		expect(canStartTour(state)).toBe(true);
	});
});

// ============================================================================
// MAX TOURS TESTS
// ============================================================================

describe('getMaxActiveTours', () => {
	it('should return 1 for tech tier 3', () => {
		const state = createTestGameState({ techTier: 3 });
		expect(getMaxActiveTours(state)).toBe(1);
	});

	it('should return 2 for tech tier 4', () => {
		const state = createTestGameState({ techTier: 4 });
		expect(getMaxActiveTours(state)).toBe(2);
	});

	it('should return 3 for tech tier 5+', () => {
		const state = createTestGameState({ techTier: 5 });
		expect(getMaxActiveTours(state)).toBe(3);
	});

	it('should return 3 for tech tier 6', () => {
		const state = createTestGameState({ techTier: 6 });
		expect(getMaxActiveTours(state)).toBe(3);
	});

	it('should return 3 for tech tier 7', () => {
		const state = createTestGameState({ techTier: 7 });
		expect(getMaxActiveTours(state)).toBe(3);
	});

	it('should return 1 for tech tier 1', () => {
		const state = createTestGameState({ techTier: 1 });
		expect(getMaxActiveTours(state)).toBe(1);
	});
});

describe('getActiveTourCount', () => {
	beforeEach(() => {
		mockUuidCounter = 0;
		vi.stubGlobal('crypto', { randomUUID: mockUuid });
	});

	it('should return 0 when no tours exist', () => {
		const state = createTestGameState();
		expect(getActiveTourCount(state)).toBe(0);
	});

	it('should count only active tours', () => {
		const tours: Tour[] = [
			{
				id: 'tour-1',
				name: 'Active Tour 1',
				startedAt: Date.now() - 60000,
				completedAt: null,
				incomePerSecond: 50000,
				usesScarcity: false
			},
			{
				id: 'tour-2',
				name: 'Active Tour 2',
				startedAt: Date.now() - 30000,
				completedAt: null,
				incomePerSecond: 60000,
				usesScarcity: false
			},
			{
				id: 'tour-3',
				name: 'Completed Tour',
				startedAt: Date.now() - 200000,
				completedAt: Date.now() - 20000,
				incomePerSecond: 40000,
				usesScarcity: false
			}
		];

		const state = createTestGameState({ tours });
		expect(getActiveTourCount(state)).toBe(2);
	});

	it('should return 0 when all tours are completed', () => {
		const tours: Tour[] = [
			{
				id: 'tour-1',
				name: 'Completed Tour 1',
				startedAt: Date.now() - 200000,
				completedAt: Date.now() - 20000,
				incomePerSecond: 50000,
				usesScarcity: false
			},
			{
				id: 'tour-2',
				name: 'Completed Tour 2',
				startedAt: Date.now() - 300000,
				completedAt: Date.now() - 120000,
				incomePerSecond: 60000,
				usesScarcity: false
			}
		];

		const state = createTestGameState({ tours });
		expect(getActiveTourCount(state)).toBe(0);
	});
});

// ============================================================================
// INCOME CALCULATION TESTS
// ============================================================================

describe('calculateTourIncomePerSecond', () => {
	beforeEach(() => {
		mockUuidCounter = 0;
		vi.stubGlobal('crypto', { randomUUID: mockUuid });
	});

	it('should return base income with no fans or songs', () => {
		const state = createTestGameState({
			fans: 0,
			songs: []
		});

		const income = calculateTourIncomePerSecond(state);
		expect(income).toBe(TOUR_BASE_INCOME_PER_SECOND);
	});

	it('should scale with fan count', () => {
		const state = createTestGameState({
			fans: 1_000_000,
			songs: []
		});

		const expectedIncome = TOUR_BASE_INCOME_PER_SECOND + 1_000_000 * TOUR_FAN_MULTIPLIER;
		const income = calculateTourIncomePerSecond(state);
		expect(income).toBe(expectedIncome);
	});

	it('should scale with song catalog size', () => {
		const songs = Array.from({ length: 100 }, (_, i) => ({
			id: `song-${i}`,
			name: `Song ${i}`,
			genre: 'pop' as const,
			createdAt: Date.now(),
			incomePerSecond: 10,
			fanGenerationRate: 10,
			isTrending: false
		}));

		const state = createTestGameState({
			fans: 0,
			songs
		});

		const catalogBonus = 100 * 100; // 100 songs * $100/sec
		const expectedIncome = TOUR_BASE_INCOME_PER_SECOND + catalogBonus;
		const income = calculateTourIncomePerSecond(state);
		expect(income).toBe(expectedIncome);
	});

	it('should apply prestige multiplier', () => {
		const state = createTestGameState({
			fans: 0,
			songs: [],
			experienceMultiplier: 2.5
		});

		const expectedIncome = TOUR_BASE_INCOME_PER_SECOND * 2.5;
		const income = calculateTourIncomePerSecond(state);
		expect(income).toBe(expectedIncome);
	});

	it('should combine all income factors', () => {
		const songs = Array.from({ length: 50 }, (_, i) => ({
			id: `song-${i}`,
			name: `Song ${i}`,
			genre: 'pop' as const,
			createdAt: Date.now(),
			incomePerSecond: 10,
			fanGenerationRate: 10,
			isTrending: false
		}));

		const state = createTestGameState({
			fans: 500_000,
			songs,
			experienceMultiplier: 1.5
		});

		const baseIncome = TOUR_BASE_INCOME_PER_SECOND;
		const fanBonus = 500_000 * TOUR_FAN_MULTIPLIER;
		const catalogBonus = 50 * 100;
		const expectedIncome = (baseIncome + fanBonus + catalogBonus) * 1.5;

		const income = calculateTourIncomePerSecond(state);
		expect(income).toBe(expectedIncome);
	});
});

// ============================================================================
// TOUR CREATION TESTS
// ============================================================================

describe('startTour', () => {
	beforeEach(() => {
		mockUuidCounter = 0;
		vi.stubGlobal('crypto', { randomUUID: mockUuid });
	});

	it('should return null when tour cannot be started', () => {
		const state = createTestGameState({
			money: 1_000_000, // Not enough
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, tours: true },
			fans: 100_000,
			physicalAlbums: Array.from({ length: 10 }, (_, i) => createTestAlbum(i))
		});

		const tour = startTour(state);
		expect(tour).toBeNull();
	});

	it('should deduct cost from state', () => {
		const state = createTestGameState({
			money: 10_000_000,
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, tours: true },
			fans: 100_000,
			physicalAlbums: Array.from({ length: 10 }, (_, i) => createTestAlbum(i)),
			techTier: 3
		});

		const initialMoney = state.money;
		startTour(state);

		expect(state.money).toBe(initialMoney - TOUR_BASE_COST);
	});

	it('should create tour with correct properties', () => {
		const state = createTestGameState({
			money: 10_000_000,
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, tours: true },
			fans: 100_000,
			physicalAlbums: Array.from({ length: 10 }, (_, i) => createTestAlbum(i)),
			techTier: 3
		});

		const tour = startTour(state);

		expect(tour).not.toBeNull();
		expect(tour?.id).toBe('test-uuid-0');
		expect(tour?.name).toBeTruthy();
		expect(tour?.startedAt).toBeLessThanOrEqual(Date.now());
		expect(tour?.completedAt).toBeNull();
		expect(tour?.incomePerSecond).toBeGreaterThan(0);
		expect(tour?.usesScarcity).toBe(false);
	});

	it('should add tour to state.tours array', () => {
		const state = createTestGameState({
			money: 10_000_000,
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, tours: true },
			fans: 100_000,
			physicalAlbums: Array.from({ length: 10 }, (_, i) => createTestAlbum(i)),
			techTier: 3
		});

		expect(state.tours.length).toBe(0);

		const tour = startTour(state);

		expect(state.tours.length).toBe(1);
		expect(state.tours[0]).toBe(tour);
	});

	it('should calculate income based on current state', () => {
		const songs = Array.from({ length: 100 }, (_, i) => ({
			id: `song-${i}`,
			name: `Song ${i}`,
			genre: 'pop' as const,
			createdAt: Date.now(),
			incomePerSecond: 10,
			fanGenerationRate: 10,
			isTrending: false
		}));

		const state = createTestGameState({
			money: 10_000_000,
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, tours: true },
			fans: 1_000_000,
			songs,
			physicalAlbums: Array.from({ length: 10 }, (_, i) => createTestAlbum(i)),
			techTier: 3
		});

		const tour = startTour(state);
		const expectedIncome = calculateTourIncomePerSecond(state);

		expect(tour?.incomePerSecond).toBe(expectedIncome);
	});
});

// ============================================================================
// TOUR PROCESSING TESTS
// ============================================================================

describe('processTours', () => {
	beforeEach(() => {
		mockUuidCounter = 0;
		vi.stubGlobal('crypto', { randomUUID: mockUuid });
	});

	it('should not affect completed tours', () => {
		const tours: Tour[] = [
			{
				id: 'tour-1',
				name: 'Completed Tour',
				startedAt: Date.now() - 300000,
				completedAt: Date.now() - 120000,
				incomePerSecond: 50000,
				usesScarcity: false
			}
		];

		const state = createTestGameState({ tours });
		const completedAt = tours[0].completedAt;

		processTours(state, 100);

		expect(state.tours[0].completedAt).toBe(completedAt);
	});

	it('should mark tour as completed when duration expires', () => {
		const tours: Tour[] = [
			{
				id: 'tour-1',
				name: 'Active Tour',
				startedAt: Date.now() - TOUR_DURATION - 1000, // Started over duration ago
				completedAt: null,
				incomePerSecond: 50000,
				usesScarcity: false
			}
		];

		const state = createTestGameState({ tours });

		expect(state.tours[0].completedAt).toBeNull();

		processTours(state, 100);

		expect(state.tours[0].completedAt).not.toBeNull();
		expect(state.tours[0].completedAt).toBeLessThanOrEqual(Date.now());
	});

	it('should not mark tour as completed before duration expires', () => {
		const tours: Tour[] = [
			{
				id: 'tour-1',
				name: 'Active Tour',
				startedAt: Date.now() - 60000, // Started 1 minute ago
				completedAt: null,
				incomePerSecond: 50000,
				usesScarcity: false
			}
		];

		const state = createTestGameState({ tours });

		processTours(state, 100);

		expect(state.tours[0].completedAt).toBeNull();
	});

	it('should handle multiple tours correctly', () => {
		const now = Date.now();
		const tours: Tour[] = [
			{
				id: 'tour-1',
				name: 'Completed Tour',
				startedAt: now - TOUR_DURATION - 1000,
				completedAt: null,
				incomePerSecond: 50000,
				usesScarcity: false
			},
			{
				id: 'tour-2',
				name: 'Active Tour',
				startedAt: now - 60000,
				completedAt: null,
				incomePerSecond: 60000,
				usesScarcity: false
			}
		];

		const state = createTestGameState({ tours });

		processTours(state, 100);

		expect(state.tours[0].completedAt).not.toBeNull();
		expect(state.tours[1].completedAt).toBeNull();
	});
});

describe('calculateTourIncome', () => {
	beforeEach(() => {
		mockUuidCounter = 0;
		vi.stubGlobal('crypto', { randomUUID: mockUuid });
	});

	it('should return 0 when no tours exist', () => {
		const state = createTestGameState();
		expect(calculateTourIncome(state)).toBe(0);
	});

	it('should sum income from active tours only', () => {
		const tours: Tour[] = [
			{
				id: 'tour-1',
				name: 'Active Tour 1',
				startedAt: Date.now() - 60000,
				completedAt: null,
				incomePerSecond: 50000,
				usesScarcity: false
			},
			{
				id: 'tour-2',
				name: 'Active Tour 2',
				startedAt: Date.now() - 30000,
				completedAt: null,
				incomePerSecond: 60000,
				usesScarcity: false
			},
			{
				id: 'tour-3',
				name: 'Completed Tour',
				startedAt: Date.now() - 200000,
				completedAt: Date.now() - 20000,
				incomePerSecond: 40000,
				usesScarcity: false
			}
		];

		const state = createTestGameState({ tours });
		const income = calculateTourIncome(state);

		expect(income).toBe(110000); // 50000 + 60000, excludes completed tour
	});

	it('should return 0 when all tours are completed', () => {
		const tours: Tour[] = [
			{
				id: 'tour-1',
				name: 'Completed Tour 1',
				startedAt: Date.now() - 200000,
				completedAt: Date.now() - 20000,
				incomePerSecond: 50000,
				usesScarcity: false
			}
		];

		const state = createTestGameState({ tours });
		expect(calculateTourIncome(state)).toBe(0);
	});
});

// ============================================================================
// UTILITY FUNCTION TESTS
// ============================================================================

describe('getTourCost', () => {
	it('should return base tour cost', () => {
		const state = createTestGameState();
		expect(getTourCost(state)).toBe(TOUR_BASE_COST);
	});
});

describe('getTourDuration', () => {
	it('should return base tour duration', () => {
		const state = createTestGameState();
		expect(getTourDuration(state)).toBe(TOUR_DURATION);
	});
});

describe('enableScarcityTactics', () => {
	beforeEach(() => {
		mockUuidCounter = 0;
		vi.stubGlobal('crypto', { randomUUID: mockUuid });
	});

	it('should enable scarcity on active tours only', () => {
		const tours: Tour[] = [
			{
				id: 'tour-1',
				name: 'Active Tour',
				startedAt: Date.now() - 60000,
				completedAt: null,
				incomePerSecond: 50000,
				usesScarcity: false
			},
			{
				id: 'tour-2',
				name: 'Completed Tour',
				startedAt: Date.now() - 200000,
				completedAt: Date.now() - 20000,
				incomePerSecond: 40000,
				usesScarcity: false
			}
		];

		const state = createTestGameState({ tours });

		enableScarcityTactics(state);

		expect(state.tours[0].usesScarcity).toBe(true);
		expect(state.tours[1].usesScarcity).toBe(false);
	});

	it('should increase income by 50% on active tours', () => {
		const tours: Tour[] = [
			{
				id: 'tour-1',
				name: 'Active Tour',
				startedAt: Date.now() - 60000,
				completedAt: null,
				incomePerSecond: 50000,
				usesScarcity: false
			}
		];

		const state = createTestGameState({ tours });
		const originalIncome = state.tours[0].incomePerSecond;

		enableScarcityTactics(state);

		expect(state.tours[0].incomePerSecond).toBe(originalIncome * 1.5);
	});
});

describe('getTotalTourRevenue', () => {
	beforeEach(() => {
		mockUuidCounter = 0;
		vi.stubGlobal('crypto', { randomUUID: mockUuid });
	});

	it('should return 0 when no tours exist', () => {
		const state = createTestGameState();
		expect(getTotalTourRevenue(state)).toBe(0);
	});

	it('should calculate revenue from completed tours', () => {
		const startedAt = Date.now() - 200000;
		const completedAt = Date.now() - 20000;
		const duration = completedAt - startedAt;
		const incomePerSecond = 50000;

		const tours: Tour[] = [
			{
				id: 'tour-1',
				name: 'Completed Tour',
				startedAt,
				completedAt,
				incomePerSecond,
				usesScarcity: false
			}
		];

		const state = createTestGameState({ tours });
		const revenue = getTotalTourRevenue(state);

		const expectedRevenue = incomePerSecond * (duration / 1000);
		expect(revenue).toBe(expectedRevenue);
	});

	it('should not count active tours', () => {
		const tours: Tour[] = [
			{
				id: 'tour-1',
				name: 'Active Tour',
				startedAt: Date.now() - 60000,
				completedAt: null,
				incomePerSecond: 50000,
				usesScarcity: false
			}
		];

		const state = createTestGameState({ tours });
		expect(getTotalTourRevenue(state)).toBe(0);
	});

	it('should sum revenue from multiple completed tours', () => {
		const tours: Tour[] = [
			{
				id: 'tour-1',
				name: 'Completed Tour 1',
				startedAt: Date.now() - 300000,
				completedAt: Date.now() - 120000,
				incomePerSecond: 50000,
				usesScarcity: false
			},
			{
				id: 'tour-2',
				name: 'Completed Tour 2',
				startedAt: Date.now() - 500000,
				completedAt: Date.now() - 320000,
				incomePerSecond: 60000,
				usesScarcity: false
			}
		];

		const state = createTestGameState({ tours });
		const revenue = getTotalTourRevenue(state);

		const revenue1 = 50000 * ((tours[0].completedAt! - tours[0].startedAt) / 1000);
		const revenue2 = 60000 * ((tours[1].completedAt! - tours[1].startedAt) / 1000);
		const expectedRevenue = revenue1 + revenue2;

		expect(revenue).toBe(expectedRevenue);
	});
});

describe('getTourStats', () => {
	beforeEach(() => {
		mockUuidCounter = 0;
		vi.stubGlobal('crypto', { randomUUID: mockUuid });
	});

	it('should return zeros when no tours exist', () => {
		const state = createTestGameState({ techTier: 3 });
		const stats = getTourStats(state);

		expect(stats).toEqual({
			totalTours: 0,
			activeTours: 0,
			completedTours: 0,
			totalRevenue: 0,
			maxActiveTours: 1
		});
	});

	it('should return correct stats with mixed tours', () => {
		const tours: Tour[] = [
			{
				id: 'tour-1',
				name: 'Active Tour 1',
				startedAt: Date.now() - 60000,
				completedAt: null,
				incomePerSecond: 50000,
				usesScarcity: false
			},
			{
				id: 'tour-2',
				name: 'Active Tour 2',
				startedAt: Date.now() - 30000,
				completedAt: null,
				incomePerSecond: 60000,
				usesScarcity: false
			},
			{
				id: 'tour-3',
				name: 'Completed Tour',
				startedAt: Date.now() - 200000,
				completedAt: Date.now() - 20000,
				incomePerSecond: 40000,
				usesScarcity: false
			}
		];

		const state = createTestGameState({ tours, techTier: 5 });
		const stats = getTourStats(state);

		expect(stats.totalTours).toBe(3);
		expect(stats.activeTours).toBe(2);
		expect(stats.completedTours).toBe(1);
		expect(stats.maxActiveTours).toBe(3);
		expect(stats.totalRevenue).toBeGreaterThan(0);
	});
});
