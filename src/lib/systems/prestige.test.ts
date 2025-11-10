/**
 * Unit tests for Prestige System
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	canPrestige,
	performPrestige,
	calculateExperienceBonus,
	calculateLegacyIncome,
	processLegacyArtists
} from './prestige';
import type { GameState, Artist, UnlockedSystems, Song } from '../game/types';
import {
	BASE_INCOME_PER_SONG,
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
	MAX_LEGACY_ARTISTS,
	PRESTIGE_MULTIPLIER_PER_LEVEL
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
 * Mock artist name generation for deterministic tests
 */
let mockArtistNameCounter = 0;
function mockGenerateArtistName(): string {
	return `Test Artist ${mockArtistNameCounter++}`;
}

// ============================================================================
// CAN PRESTIGE TESTS
// ============================================================================

describe('canPrestige', () => {
	it('should return false when prestige is not unlocked', () => {
		const state = createTestGameState({
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				prestige: false
			}
		});

		expect(canPrestige(state)).toBe(false);
	});

	it('should return true when prestige is unlocked', () => {
		const state = createTestGameState({
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				prestige: true
			}
		});

		expect(canPrestige(state)).toBe(true);
	});

	it('should return true even with 0 fans (no fan gate)', () => {
		const state = createTestGameState({
			fans: 0,
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				prestige: true
			}
		});

		expect(canPrestige(state)).toBe(true);
	});
});

// ============================================================================
// PERFORM PRESTIGE TESTS
// ============================================================================

describe('performPrestige', () => {
	beforeEach(() => {
		mockArtistNameCounter = 0;
		// Mock generateArtistName in the prestige module
		vi.mock('../data/names', () => ({
			generateArtistName: mockGenerateArtistName
		}));
	});

	it('should return false when prestige is not unlocked', () => {
		const state = createTestGameState({
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				prestige: false
			}
		});

		const result = performPrestige(state);
		expect(result).toBe(false);
	});

	it('should create legacy artist from current artist', () => {
		const state = createTestGameState({
			currentArtist: {
				name: 'Original Artist',
				songs: 100,
				fans: 50_000_000,
				peakFans: 50_000_000,
				createdAt: Date.now() - 1000000
			},
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				prestige: true
			}
		});

		performPrestige(state);

		expect(state.legacyArtists.length).toBe(1);
		expect(state.legacyArtists[0].name).toBe('Original Artist');
		expect(state.legacyArtists[0].songs).toBe(100);
		expect(state.legacyArtists[0].peakFans).toBe(50_000_000);
	});

	it('should calculate legacy artist income as 80% of current song income', () => {
		const songs: Song[] = [
			{
				id: '1',
				name: 'Song 1',
				genre: 'pop',
				createdAt: Date.now(),
				incomePerSecond: 100,
				fanGenerationRate: 10,
				isTrending: false
			},
			{
				id: '2',
				name: 'Song 2',
				genre: 'rock',
				createdAt: Date.now(),
				incomePerSecond: 200,
				fanGenerationRate: 10,
				isTrending: false
			}
		];

		const state = createTestGameState({
			songs,
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				prestige: true
			}
		});

		performPrestige(state);

		// Total song income = 300/sec, legacy should get 80% = 240/sec
		expect(state.legacyArtists[0].incomeRate).toBe(240);
	});

	it('should reset money to INITIAL_MONEY', () => {
		const state = createTestGameState({
			money: 1_000_000,
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				prestige: true
			}
		});

		performPrestige(state);

		expect(state.money).toBe(INITIAL_MONEY);
	});

	it('should reset fans to INITIAL_FANS', () => {
		const state = createTestGameState({
			fans: 10_000_000,
			currentArtist: {
				name: 'Test Artist',
				songs: 50,
				fans: 10_000_000,
				peakFans: 10_000_000,
				createdAt: Date.now()
			},
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				prestige: true
			}
		});

		performPrestige(state);

		expect(state.fans).toBe(INITIAL_FANS);
		expect(state.currentArtist.fans).toBe(0);
	});

	it('should clear songs array', () => {
		const songs: Song[] = [
			{
				id: '1',
				name: 'Song 1',
				genre: 'pop',
				createdAt: Date.now(),
				incomePerSecond: 100,
				fanGenerationRate: 10,
				isTrending: false
			}
		];

		const state = createTestGameState({
			songs,
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				prestige: true
			}
		});

		performPrestige(state);

		expect(state.songs.length).toBe(0);
	});

	it('should clear song queue', () => {
		const state = createTestGameState({
			songQueue: [
				{ id: '1', progress: 5000, totalTime: 10000 },
				{ id: '2', progress: 0, totalTime: 10000 }
			],
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				prestige: true
			}
		});

		performPrestige(state);

		expect(state.songQueue.length).toBe(0);
	});

	it('should keep tech upgrades', () => {
		const state = createTestGameState({
			techTier: 5,
			techSubTier: 2,
			upgrades: {
				tier5_basic: { purchasedAt: Date.now(), tier: 5 },
				tier5_improved: { purchasedAt: Date.now(), tier: 5 }
			},
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				prestige: true
			}
		});

		const originalUpgradeCount = Object.keys(state.upgrades).length;
		performPrestige(state);

		expect(state.techTier).toBe(5);
		expect(state.techSubTier).toBe(2);
		expect(Object.keys(state.upgrades).length).toBe(originalUpgradeCount);
	});

	it('should keep industry control', () => {
		const state = createTestGameState({
			industryControl: 45,
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				prestige: true
			}
		});

		performPrestige(state);

		expect(state.industryControl).toBe(45);
	});

	it('should increment prestige count', () => {
		const state = createTestGameState({
			prestigeCount: 0,
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				prestige: true
			}
		});

		performPrestige(state);
		expect(state.prestigeCount).toBe(1);

		performPrestige(state);
		expect(state.prestigeCount).toBe(2);
	});

	it('should update experience multiplier', () => {
		const state = createTestGameState({
			prestigeCount: 0,
			experienceMultiplier: 1.0,
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				prestige: true
			}
		});

		performPrestige(state);

		// After 1st prestige: 1.0 + (1 * 0.1) = 1.1
		expect(state.experienceMultiplier).toBe(1.1);
	});

	it('should create a new artist', () => {
		const state = createTestGameState({
			currentArtist: {
				name: 'Original Artist',
				songs: 100,
				fans: 50_000_000,
				peakFans: 50_000_000,
				createdAt: Date.now() - 1000000
			},
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				prestige: true
			}
		});

		performPrestige(state);

		expect(state.currentArtist.name).not.toBe('Original Artist');
		expect(state.currentArtist.songs).toBe(0);
		expect(state.currentArtist.fans).toBe(0);
		expect(state.currentArtist.peakFans).toBe(0);
	});

	it('should keep only MAX_LEGACY_ARTISTS (3) most recent artists', () => {
		const state = createTestGameState({
			prestigeCount: 3,
			legacyArtists: [
				{
					name: 'Artist 1',
					peakFans: 10_000_000,
					songs: 50,
					incomeRate: 1000,
					createdAt: Date.now() - 4000000,
					prestigedAt: Date.now() - 3000000
				},
				{
					name: 'Artist 2',
					peakFans: 20_000_000,
					songs: 75,
					incomeRate: 2000,
					createdAt: Date.now() - 2000000,
					prestigedAt: Date.now() - 1000000
				},
				{
					name: 'Artist 3',
					peakFans: 30_000_000,
					songs: 100,
					incomeRate: 3000,
					createdAt: Date.now() - 1000000,
					prestigedAt: Date.now() - 500000
				}
			],
			currentArtist: {
				name: 'Artist 4',
				songs: 150,
				fans: 50_000_000,
				peakFans: 50_000_000,
				createdAt: Date.now() - 300000
			},
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				prestige: true
			}
		});

		performPrestige(state);

		// Should have exactly MAX_LEGACY_ARTISTS (3)
		expect(state.legacyArtists.length).toBe(MAX_LEGACY_ARTISTS);

		// Oldest artist (Artist 1) should be removed
		expect(state.legacyArtists.find((a) => a.name === 'Artist 1')).toBeUndefined();

		// Remaining artists should be Artist 2, 3, and 4
		expect(state.legacyArtists.find((a) => a.name === 'Artist 2')).toBeDefined();
		expect(state.legacyArtists.find((a) => a.name === 'Artist 3')).toBeDefined();
		expect(state.legacyArtists.find((a) => a.name === 'Artist 4')).toBeDefined();
	});

	it('should retire oldest artist on 4th prestige', () => {
		const state = createTestGameState({
			prestigeCount: 3,
			legacyArtists: [
				{
					name: 'Oldest Artist',
					peakFans: 10_000_000,
					songs: 50,
					incomeRate: 5000,
					createdAt: Date.now() - 4000000,
					prestigedAt: Date.now() - 3000000
				},
				{
					name: 'Middle Artist',
					peakFans: 20_000_000,
					songs: 75,
					incomeRate: 10000,
					createdAt: Date.now() - 2000000,
					prestigedAt: Date.now() - 1000000
				},
				{
					name: 'Recent Artist',
					peakFans: 30_000_000,
					songs: 100,
					incomeRate: 15000,
					createdAt: Date.now() - 1000000,
					prestigedAt: Date.now() - 500000
				}
			],
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				prestige: true
			}
		});

		// Before prestige: 3 legacy artists
		expect(state.legacyArtists.length).toBe(3);
		const totalIncomeBeforeRetirement = state.legacyArtists.reduce(
			(sum, a) => sum + a.incomeRate,
			0
		);
		expect(totalIncomeBeforeRetirement).toBe(30000);

		performPrestige(state);

		// After 4th prestige: still 3 legacy artists
		expect(state.legacyArtists.length).toBe(MAX_LEGACY_ARTISTS);

		// Oldest artist should be retired (removed)
		expect(state.legacyArtists.find((a) => a.name === 'Oldest Artist')).toBeUndefined();

		// Total income should be reduced (lost oldest artist's income)
		const totalIncomeAfterRetirement = state.legacyArtists.reduce((sum, a) => sum + a.incomeRate, 0);
		expect(totalIncomeAfterRetirement).toBeLessThan(totalIncomeBeforeRetirement);
	});
});

// ============================================================================
// CALCULATE EXPERIENCE BONUS TESTS
// ============================================================================

describe('calculateExperienceBonus', () => {
	it('should return 1.0 for 0 prestiges', () => {
		const state = createTestGameState({
			prestigeCount: 0
		});

		const bonus = calculateExperienceBonus(state);
		expect(bonus).toBe(1.0);
	});

	it('should return 1.1 for 1 prestige', () => {
		const state = createTestGameState({
			prestigeCount: 1
		});

		const bonus = calculateExperienceBonus(state);
		expect(bonus).toBe(1.1);
	});

	it('should return 1.2 for 2 prestiges', () => {
		const state = createTestGameState({
			prestigeCount: 2
		});

		const bonus = calculateExperienceBonus(state);
		expect(bonus).toBe(1.2);
	});

	it('should return 1.5 for 5 prestiges', () => {
		const state = createTestGameState({
			prestigeCount: 5
		});

		const bonus = calculateExperienceBonus(state);
		expect(bonus).toBe(1.5);
	});

	it('should use PRESTIGE_MULTIPLIER_PER_LEVEL correctly', () => {
		const state = createTestGameState({
			prestigeCount: 3
		});

		const bonus = calculateExperienceBonus(state);
		const expected = 1.0 + 3 * PRESTIGE_MULTIPLIER_PER_LEVEL;
		expect(bonus).toBe(expected);
	});
});

// ============================================================================
// CALCULATE LEGACY INCOME TESTS
// ============================================================================

describe('calculateLegacyIncome', () => {
	it('should return 0 when no legacy artists exist', () => {
		const state = createTestGameState({
			legacyArtists: []
		});

		const income = calculateLegacyIncome(state);
		expect(income).toBe(0);
	});

	it('should return income from single legacy artist', () => {
		const state = createTestGameState({
			legacyArtists: [
				{
					name: 'Legacy Artist',
					peakFans: 50_000_000,
					songs: 100,
					incomeRate: 5000,
					createdAt: Date.now() - 1000000,
					prestigedAt: Date.now() - 500000
				}
			]
		});

		const income = calculateLegacyIncome(state);
		expect(income).toBe(5000);
	});

	it('should sum income from multiple legacy artists', () => {
		const state = createTestGameState({
			legacyArtists: [
				{
					name: 'Artist 1',
					peakFans: 50_000_000,
					songs: 100,
					incomeRate: 5000,
					createdAt: Date.now() - 2000000,
					prestigedAt: Date.now() - 1000000
				},
				{
					name: 'Artist 2',
					peakFans: 100_000_000,
					songs: 200,
					incomeRate: 10000,
					createdAt: Date.now() - 1000000,
					prestigedAt: Date.now() - 500000
				},
				{
					name: 'Artist 3',
					peakFans: 150_000_000,
					songs: 300,
					incomeRate: 15000,
					createdAt: Date.now() - 500000,
					prestigedAt: Date.now() - 250000
				}
			]
		});

		const income = calculateLegacyIncome(state);
		expect(income).toBe(30000);
	});
});

// ============================================================================
// PROCESS LEGACY ARTISTS TESTS
// ============================================================================

describe('processLegacyArtists', () => {
	it('should do nothing when no legacy artists exist', () => {
		const state = createTestGameState({
			legacyArtists: [],
			fans: 1000
		});

		processLegacyArtists(state, 1000);

		expect(state.fans).toBe(1000);
	});

	it('should add cross-promotion fans from legacy artists', () => {
		const state = createTestGameState({
			legacyArtists: [
				{
					name: 'Legacy Artist',
					peakFans: 100_000_000, // 100M peak fans
					songs: 100,
					incomeRate: 5000,
					createdAt: Date.now() - 1000000,
					prestigedAt: Date.now() - 500000
				}
			],
			fans: 0,
			currentArtist: {
				name: 'New Artist',
				songs: 0,
				fans: 0,
				peakFans: 0,
				createdAt: Date.now()
			}
		});

		// Process 1 second (1000ms)
		processLegacyArtists(state, 1000);

		// Cross-promotion rate: 0.00001 (0.001%)
		// 100M * 0.00001 = 1000 fans/sec
		// 1 second = 1000 fans
		expect(state.fans).toBeGreaterThan(0);
		expect(state.currentArtist.fans).toBeGreaterThan(0);
		expect(state.fans).toBeCloseTo(1000, 0);
	});

	it('should sum cross-promotion from multiple legacy artists', () => {
		const state = createTestGameState({
			legacyArtists: [
				{
					name: 'Artist 1',
					peakFans: 50_000_000,
					songs: 100,
					incomeRate: 5000,
					createdAt: Date.now() - 2000000,
					prestigedAt: Date.now() - 1000000
				},
				{
					name: 'Artist 2',
					peakFans: 100_000_000,
					songs: 200,
					incomeRate: 10000,
					createdAt: Date.now() - 1000000,
					prestigedAt: Date.now() - 500000
				}
			],
			fans: 0,
			currentArtist: {
				name: 'New Artist',
				songs: 0,
				fans: 0,
				peakFans: 0,
				createdAt: Date.now()
			}
		});

		// Process 1 second
		processLegacyArtists(state, 1000);

		// Artist 1: 50M * 0.00001 = 500 fans/sec
		// Artist 2: 100M * 0.00001 = 1000 fans/sec
		// Total: 1500 fans/sec * 1 sec = 1500 fans
		expect(state.fans).toBeCloseTo(1500, 0);
		expect(state.currentArtist.fans).toBeCloseTo(1500, 0);
	});

	it('should update peak fans when current exceeds it', () => {
		const state = createTestGameState({
			legacyArtists: [
				{
					name: 'Legacy Artist',
					peakFans: 100_000_000,
					songs: 100,
					incomeRate: 5000,
					createdAt: Date.now() - 1000000,
					prestigedAt: Date.now() - 500000
				}
			],
			fans: 500,
			currentArtist: {
				name: 'New Artist',
				songs: 0,
				fans: 500,
				peakFans: 500,
				createdAt: Date.now()
			}
		});

		processLegacyArtists(state, 1000);

		// Should gain ~1000 fans, bringing total to ~1500
		expect(state.currentArtist.peakFans).toBeGreaterThan(500);
		expect(state.currentArtist.peakFans).toBe(state.currentArtist.fans);
	});

	it('should scale with deltaTime correctly', () => {
		const state = createTestGameState({
			legacyArtists: [
				{
					name: 'Legacy Artist',
					peakFans: 100_000_000,
					songs: 100,
					incomeRate: 5000,
					createdAt: Date.now() - 1000000,
					prestigedAt: Date.now() - 500000
				}
			],
			fans: 0,
			currentArtist: {
				name: 'New Artist',
				songs: 0,
				fans: 0,
				peakFans: 0,
				createdAt: Date.now()
			}
		});

		// Process 5 seconds (5000ms)
		processLegacyArtists(state, 5000);

		// 1000 fans/sec * 5 sec = 5000 fans
		expect(state.fans).toBeCloseTo(5000, 0);
	});

	it('should handle small deltaTime values (100ms tick)', () => {
		const state = createTestGameState({
			legacyArtists: [
				{
					name: 'Legacy Artist',
					peakFans: 100_000_000,
					songs: 100,
					incomeRate: 5000,
					createdAt: Date.now() - 1000000,
					prestigedAt: Date.now() - 500000
				}
			],
			fans: 0,
			currentArtist: {
				name: 'New Artist',
				songs: 0,
				fans: 0,
				peakFans: 0,
				createdAt: Date.now()
			}
		});

		// Process 100ms (one game tick at 10 TPS)
		processLegacyArtists(state, 100);

		// 1000 fans/sec * 0.1 sec = 100 fans
		expect(state.fans).toBeCloseTo(100, 0);
	});
});
