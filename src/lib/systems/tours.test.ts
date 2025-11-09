/**
 * Unit tests for Tour and Concert System
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	unlockTours,
	startTour,
	processTours,
	calculateTourIncome,
	canRunMultipleTours,
	canAffordTour,
	canStartTour,
	calculateTourCost
} from './tours';
import type { GameState, Artist, UnlockedSystems, PhysicalAlbum, Tour } from '../game/types';
import {
	TOUR_BASE_COST,
	TOUR_DURATION,
	TOUR_BASE_INCOME_PER_SECOND,
	TOUR_FAN_MULTIPLIER,
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
	GAME_VERSION
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
		songGenerationSpeed: 30000,
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
		unlockedSystems: defaultUnlockedSystems,
		lastUpdate: now,
		createdAt: now,
		version: GAME_VERSION,
		...overrides
	};
}

/**
 * Create test physical albums
 */
function createTestAlbums(count: number): PhysicalAlbum[] {
	const albums: PhysicalAlbum[] = [];
	for (let i = 0; i < count; i++) {
		albums.push({
			id: `album-${i}`,
			name: `Test Album ${i}`,
			songCount: 10,
			releasedAt: Date.now(),
			payout: 100000,
			variantCount: 1,
			isRerelease: false
		});
	}
	return albums;
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

describe('unlockTours', () => {
	it('should return false if tours system is not unlocked', () => {
		const state = createTestGameState({
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, tours: false },
			physicalAlbums: createTestAlbums(10),
			fans: 100_000,
			techTier: 3
		});

		expect(unlockTours(state)).toBe(false);
	});

	it('should return false if less than 10 albums released', () => {
		const state = createTestGameState({
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, tours: true },
			physicalAlbums: createTestAlbums(9),
			fans: 100_000,
			techTier: 3
		});

		expect(unlockTours(state)).toBe(false);
	});

	it('should return false if less than 100,000 fans', () => {
		const state = createTestGameState({
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, tours: true },
			physicalAlbums: createTestAlbums(10),
			fans: 99_999,
			techTier: 3
		});

		expect(unlockTours(state)).toBe(false);
	});

	it('should return true when all requirements are met', () => {
		const state = createTestGameState({
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, tours: true },
			physicalAlbums: createTestAlbums(10),
			fans: 100_000,
			techTier: 3
		});

		expect(unlockTours(state)).toBe(true);
	});

	it('should return true with more than minimum requirements', () => {
		const state = createTestGameState({
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, tours: true },
			physicalAlbums: createTestAlbums(50),
			fans: 10_000_000,
			techTier: 5
		});

		expect(unlockTours(state)).toBe(true);
	});
});

// ============================================================================
// MULTIPLE TOURS TESTS
// ============================================================================

describe('canRunMultipleTours', () => {
	it('should return 1 tour at tech tier 3', () => {
		const state = createTestGameState({ techTier: 3 });
		expect(canRunMultipleTours(state)).toBe(1);
	});

	it('should return 2 tours at tech tier 4', () => {
		const state = createTestGameState({ techTier: 4 });
		expect(canRunMultipleTours(state)).toBe(2);
	});

	it('should return 3 tours at tech tier 5', () => {
		const state = createTestGameState({ techTier: 5 });
		expect(canRunMultipleTours(state)).toBe(3);
	});

	it('should return 4 tours at tech tier 6', () => {
		const state = createTestGameState({ techTier: 6 });
		expect(canRunMultipleTours(state)).toBe(4);
	});

	it('should return 4 tours at tech tier 7', () => {
		const state = createTestGameState({ techTier: 7 });
		expect(canRunMultipleTours(state)).toBe(4);
	});
});

// ============================================================================
// TOUR COST TESTS
// ============================================================================

describe('calculateTourCost', () => {
	it('should return base cost with no completed tours', () => {
		const state = createTestGameState({ tours: [] });
		expect(calculateTourCost(state)).toBe(TOUR_BASE_COST);
	});

	it('should increase cost by 10% per completed tour', () => {
		const completedTour: Tour = {
			id: 'tour-1',
			name: 'Test Tour',
			startedAt: Date.now() - 200000,
			completedAt: Date.now() - 10000,
			incomePerSecond: 10000,
			usesScarcity: false
		};

		const state = createTestGameState({ tours: [completedTour] });
		expect(calculateTourCost(state)).toBe(Math.floor(TOUR_BASE_COST * 1.1));
	});

	it('should not count active tours in cost calculation', () => {
		const activeTour: Tour = {
			id: 'tour-1',
			name: 'Test Tour',
			startedAt: Date.now(),
			completedAt: null,
			incomePerSecond: 10000,
			usesScarcity: false
		};

		const state = createTestGameState({ tours: [activeTour] });
		expect(calculateTourCost(state)).toBe(TOUR_BASE_COST);
	});
});

describe('canAffordTour', () => {
	it('should return false if insufficient money', () => {
		const state = createTestGameState({ money: TOUR_BASE_COST - 1 });
		expect(canAffordTour(state)).toBe(false);
	});

	it('should return true if sufficient money', () => {
		const state = createTestGameState({ money: TOUR_BASE_COST });
		expect(canAffordTour(state)).toBe(true);
	});
});

// ============================================================================
// START TOUR TESTS
// ============================================================================

describe('canStartTour', () => {
	it('should return false if tours not unlocked', () => {
		const state = createTestGameState({
			money: TOUR_BASE_COST * 10,
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, tours: false }
		});

		expect(canStartTour(state)).toBe(false);
	});

	it('should return false if at simultaneous tour limit', () => {
		const activeTour: Tour = {
			id: 'tour-1',
			name: 'Test Tour',
			startedAt: Date.now(),
			completedAt: null,
			incomePerSecond: 10000,
			usesScarcity: false
		};

		const state = createTestGameState({
			money: TOUR_BASE_COST * 10,
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, tours: true },
			physicalAlbums: createTestAlbums(10),
			fans: 100_000,
			techTier: 3, // Only allows 1 simultaneous tour
			tours: [activeTour]
		});

		expect(canStartTour(state)).toBe(false);
	});

	it('should return true when all requirements met', () => {
		const state = createTestGameState({
			money: TOUR_BASE_COST * 10,
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, tours: true },
			physicalAlbums: createTestAlbums(10),
			fans: 100_000,
			techTier: 3
		});

		expect(canStartTour(state)).toBe(true);
	});
});

describe('startTour', () => {
	beforeEach(() => {
		mockUuidCounter = 0;
		vi.stubGlobal('crypto', { randomUUID: mockUuid });
	});

	it('should throw error if requirements not met', () => {
		const state = createTestGameState({
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, tours: false }
		});

		expect(() => startTour(state)).toThrow('Cannot start tour: requirements not met');
	});

	it('should create a tour with correct properties', () => {
		const state = createTestGameState({
			money: TOUR_BASE_COST * 10,
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, tours: true },
			physicalAlbums: createTestAlbums(10),
			fans: 100_000,
			techTier: 3,
			songs: []
		});

		const tour = startTour(state);

		expect(tour.id).toBe('test-uuid-0');
		expect(tour.name).toBeTruthy();
		expect(tour.startedAt).toBeGreaterThan(0);
		expect(tour.completedAt).toBe(null);
		expect(tour.incomePerSecond).toBe(TOUR_BASE_INCOME_PER_SECOND + 100_000 * TOUR_FAN_MULTIPLIER);
		expect(tour.usesScarcity).toBe(false);
	});

	it('should deduct tour cost from money', () => {
		const initialMoney = TOUR_BASE_COST * 10;
		const state = createTestGameState({
			money: initialMoney,
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, tours: true },
			physicalAlbums: createTestAlbums(10),
			fans: 100_000,
			techTier: 3
		});

		startTour(state);

		expect(state.money).toBe(initialMoney - TOUR_BASE_COST);
	});

	it('should add tour to state.tours array', () => {
		const state = createTestGameState({
			money: TOUR_BASE_COST * 10,
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, tours: true },
			physicalAlbums: createTestAlbums(10),
			fans: 100_000,
			techTier: 3,
			tours: []
		});

		expect(state.tours.length).toBe(0);
		startTour(state);
		expect(state.tours.length).toBe(1);
	});

	it('should calculate income based on fan count', () => {
		const state = createTestGameState({
			money: TOUR_BASE_COST * 10,
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, tours: true },
			physicalAlbums: createTestAlbums(10),
			fans: 1_000_000,
			techTier: 3,
			songs: []
		});

		const tour = startTour(state);
		const expectedIncome = TOUR_BASE_INCOME_PER_SECOND + 1_000_000 * TOUR_FAN_MULTIPLIER;
		expect(tour.incomePerSecond).toBe(expectedIncome);
	});

	it('should calculate income based on song catalog', () => {
		const state = createTestGameState({
			money: TOUR_BASE_COST * 10,
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, tours: true },
			physicalAlbums: createTestAlbums(10),
			fans: 100_000, // Must meet minimum fan requirement
			techTier: 3,
			songs: [
				{
					id: '1',
					name: 'Song 1',
					genre: 'pop',
					createdAt: Date.now(),
					incomePerSecond: 1,
					fanGenerationRate: 10,
					isTrending: false
				},
				{
					id: '2',
					name: 'Song 2',
					genre: 'rock',
					createdAt: Date.now(),
					incomePerSecond: 1,
					fanGenerationRate: 10,
					isTrending: false
				}
			]
		});

		const tour = startTour(state);
		// Expected income: base + (fans * multiplier) + (songs * 100)
		const expectedIncome = TOUR_BASE_INCOME_PER_SECOND + 100_000 * TOUR_FAN_MULTIPLIER + 2 * 100;
		expect(tour.incomePerSecond).toBe(expectedIncome);
	});
});

// ============================================================================
// PROCESS TOURS TESTS
// ============================================================================

describe('processTours', () => {
	it('should not modify tours if none exist', () => {
		const state = createTestGameState({ tours: [] });
		processTours(state, 1000);
		expect(state.tours.length).toBe(0);
	});

	it('should not complete tours before duration elapsed', () => {
		const tour: Tour = {
			id: 'tour-1',
			name: 'Test Tour',
			startedAt: Date.now(),
			completedAt: null,
			incomePerSecond: 10000,
			usesScarcity: false
		};

		const state = createTestGameState({ tours: [tour] });
		processTours(state, 1000);

		expect(state.tours[0].completedAt).toBe(null);
	});

	it('should complete tours after duration elapsed', () => {
		const now = Date.now();
		const tour: Tour = {
			id: 'tour-1',
			name: 'Test Tour',
			startedAt: now - TOUR_DURATION - 1000, // Started more than TOUR_DURATION ago
			completedAt: null,
			incomePerSecond: 10000,
			usesScarcity: false
		};

		const state = createTestGameState({ tours: [tour] });
		processTours(state, 1000);

		expect(state.tours[0].completedAt).not.toBe(null);
		expect(state.tours[0].completedAt).toBeGreaterThan(0);
	});

	it('should not modify already completed tours', () => {
		const completedAt = Date.now() - 10000;
		const tour: Tour = {
			id: 'tour-1',
			name: 'Test Tour',
			startedAt: Date.now() - TOUR_DURATION - 20000,
			completedAt: completedAt,
			incomePerSecond: 10000,
			usesScarcity: false
		};

		const state = createTestGameState({ tours: [tour] });
		processTours(state, 1000);

		expect(state.tours[0].completedAt).toBe(completedAt);
	});

	it('should handle multiple active tours', () => {
		const now = Date.now();
		const tours: Tour[] = [
			{
				id: 'tour-1',
				name: 'Test Tour 1',
				startedAt: now - TOUR_DURATION - 1000, // Should complete
				completedAt: null,
				incomePerSecond: 10000,
				usesScarcity: false
			},
			{
				id: 'tour-2',
				name: 'Test Tour 2',
				startedAt: now, // Should not complete
				completedAt: null,
				incomePerSecond: 10000,
				usesScarcity: false
			}
		];

		const state = createTestGameState({ tours });
		processTours(state, 1000);

		expect(state.tours[0].completedAt).not.toBe(null);
		expect(state.tours[1].completedAt).toBe(null);
	});
});

// ============================================================================
// INCOME CALCULATION TESTS
// ============================================================================

describe('calculateTourIncome', () => {
	it('should return 0 with no tours', () => {
		const state = createTestGameState({ tours: [] });
		expect(calculateTourIncome(state)).toBe(0);
	});

	it('should return 0 with only completed tours', () => {
		const tour: Tour = {
			id: 'tour-1',
			name: 'Test Tour',
			startedAt: Date.now() - 200000,
			completedAt: Date.now() - 10000,
			incomePerSecond: 10000,
			usesScarcity: false
		};

		const state = createTestGameState({ tours: [tour] });
		expect(calculateTourIncome(state)).toBe(0);
	});

	it('should return income from active tours', () => {
		const tour: Tour = {
			id: 'tour-1',
			name: 'Test Tour',
			startedAt: Date.now(),
			completedAt: null,
			incomePerSecond: 15000,
			usesScarcity: false
		};

		const state = createTestGameState({ tours: [tour] });
		expect(calculateTourIncome(state)).toBe(15000);
	});

	it('should sum income from multiple active tours', () => {
		const tours: Tour[] = [
			{
				id: 'tour-1',
				name: 'Test Tour 1',
				startedAt: Date.now(),
				completedAt: null,
				incomePerSecond: 10000,
				usesScarcity: false
			},
			{
				id: 'tour-2',
				name: 'Test Tour 2',
				startedAt: Date.now(),
				completedAt: null,
				incomePerSecond: 20000,
				usesScarcity: false
			},
			{
				id: 'tour-3',
				name: 'Test Tour 3',
				startedAt: Date.now() - 200000,
				completedAt: Date.now() - 10000,
				incomePerSecond: 30000,
				usesScarcity: false
			}
		];

		const state = createTestGameState({ tours });
		expect(calculateTourIncome(state)).toBe(30000); // Only active tours
	});
});
