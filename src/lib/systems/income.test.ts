import { describe, it, expect } from 'vitest';
import { generateIncome, calculateTotalIncome, applyIncomeMultipliers } from './income';
import type { GameState, Song, ActiveBoost, LegacyArtist, Platform, Tour } from '../game/types';

// Helper function to create a minimal game state for testing
function createTestState(overrides: Partial<GameState> = {}): GameState {
	return {
		money: 0,
		songs: [],
		fans: 0,
		gpu: 0,
		phase: 1,
		industryControl: 0,
		currentArtist: {
			name: 'Test Artist',
			songs: 0,
			fans: 0,
			peakFans: 0,
			createdAt: Date.now()
		},
		legacyArtists: [],
		songQueue: [],
		songGenerationSpeed: 30000,
		currentTrendingGenre: null,
		trendDiscoveredAt: null,
		techTier: 1,
		techSubTier: 0,
		upgrades: {},
		activeBoosts: [],
		boostUsageCounts: {},
		physicalAlbums: [],
		tours: [],
		ownedPlatforms: [],
		prestigeCount: 0,
		experienceMultiplier: 1.0,
		unlockedSystems: {
			trendResearch: false,
			physicalAlbums: false,
			tours: false,
			platformOwnership: false,
			monopoly: false,
			prestige: false,
			gpu: false
		},
		lastUpdate: Date.now(),
		createdAt: Date.now(),
		version: '1.0.0',
		...overrides
	};
}

// Helper function to create a test song
function createTestSong(overrides: Partial<Song> = {}): Song {
	return {
		id: 'test-song-1',
		name: 'Test Song',
		genre: 'pop',
		createdAt: Date.now(),
		incomePerSecond: 1.0,
		fanGenerationRate: 10,
		isTrending: false,
		...overrides
	};
}

// Helper function to create a test boost
function createTestBoost(overrides: Partial<ActiveBoost> = {}): ActiveBoost {
	return {
		id: 'test-boost-1',
		type: 'bot_streams',
		name: 'Test Boost',
		activatedAt: Date.now(),
		duration: 30000,
		incomeMultiplier: 2.0,
		fanMultiplier: 1.5,
		...overrides
	};
}

describe('Income System', () => {
	describe('generateIncome', () => {
		it('should add income to money based on deltaTime', () => {
			const state = createTestState({
				money: 100,
				songs: [createTestSong({ incomePerSecond: 10 })]
			});

			// 1 second elapsed = 10 income
			generateIncome(state, 1000);
			expect(state.money).toBe(110);
		});

		it('should be frame-independent', () => {
			const state1 = createTestState({
				money: 100,
				songs: [createTestSong({ incomePerSecond: 10 })]
			});
			const state2 = createTestState({
				money: 100,
				songs: [createTestSong({ incomePerSecond: 10 })]
			});

			// 1 second in one tick
			generateIncome(state1, 1000);

			// 1 second in ten ticks (0.1s each)
			for (let i = 0; i < 10; i++) {
				generateIncome(state2, 100);
			}

			expect(state1.money).toBeCloseTo(state2.money, 5);
		});

		it('should handle fractional deltaTime correctly', () => {
			const state = createTestState({
				money: 0,
				songs: [createTestSong({ incomePerSecond: 10 })]
			});

			// 0.5 seconds = 5 income
			generateIncome(state, 500);
			expect(state.money).toBe(5);
		});
	});

	describe('calculateTotalIncome', () => {
		it('should return 0 for empty state', () => {
			const state = createTestState();
			expect(calculateTotalIncome(state)).toBe(0);
		});

		it('should calculate income from single song', () => {
			const state = createTestState({
				songs: [createTestSong({ incomePerSecond: 5 })]
			});
			expect(calculateTotalIncome(state)).toBe(5);
		});

		it('should calculate income from multiple songs', () => {
			const state = createTestState({
				songs: [
					createTestSong({ incomePerSecond: 5 }),
					createTestSong({ incomePerSecond: 10 }),
					createTestSong({ incomePerSecond: 15 })
				]
			});
			expect(calculateTotalIncome(state)).toBe(30);
		});

		it('should NOT apply trending multiplier (already in songs)', () => {
			const state = createTestState({
				currentTrendingGenre: 'pop',
				trendDiscoveredAt: null,
				songs: [
					// Songs already have trending multiplier baked into their incomePerSecond
					createTestSong({ incomePerSecond: 20, genre: 'pop', isTrending: true }),
					createTestSong({ incomePerSecond: 10, genre: 'rock', isTrending: false })
				]
			});
			// Pop song: 20 (already includes trending), Rock song: 10, Total: 30
			expect(calculateTotalIncome(state)).toBe(30);
		});

		it('should calculate income from legacy artists', () => {
			const legacyArtist: LegacyArtist = {
				name: 'Legacy Artist',
				peakFans: 1000000,
				songs: 100,
				incomeRate: 50,
				createdAt: Date.now() - 100000,
				prestigedAt: Date.now() - 50000
			};

			const state = createTestState({
				legacyArtists: [legacyArtist]
			});

			expect(calculateTotalIncome(state)).toBe(50);
		});

		it('should calculate income from platforms', () => {
			const platform: Platform = {
				id: 'platform-1',
				type: 'streaming',
				name: 'Test Streaming Service',
				cost: 10000000,
				acquiredAt: Date.now(),
				incomePerSecond: 100,
				controlContribution: 15
			};

			const state = createTestState({
				ownedPlatforms: [platform]
			});

			expect(calculateTotalIncome(state)).toBe(100);
		});

		it('should calculate income from active tours', () => {
			const tour: Tour = {
				id: 'tour-1',
				name: 'Test Tour',
				startedAt: Date.now() - 10000,
				completedAt: null,
				incomePerSecond: 50,
				usesScarcity: false
			};

			const state = createTestState({
				tours: [tour]
			});

			expect(calculateTotalIncome(state)).toBe(50);
		});

		it('should not count completed tours', () => {
			const tour: Tour = {
				id: 'tour-1',
				name: 'Test Tour',
				startedAt: Date.now() - 10000,
				completedAt: Date.now() - 5000,
				incomePerSecond: 50,
				usesScarcity: false
			};

			const state = createTestState({
				tours: [tour]
			});

			expect(calculateTotalIncome(state)).toBe(0);
		});

		it('should sum income from all sources', () => {
			const state = createTestState({
				songs: [createTestSong({ incomePerSecond: 10 })],
				legacyArtists: [
					{
						name: 'Legacy',
						peakFans: 1000,
						songs: 10,
						incomeRate: 20,
						createdAt: Date.now(),
						prestigedAt: Date.now()
					}
				],
				ownedPlatforms: [
					{
						id: 'p1',
						type: 'streaming',
						name: 'Platform',
						cost: 1000,
						acquiredAt: Date.now(),
						incomePerSecond: 30,
						controlContribution: 10
					}
				],
				tours: [
					{
						id: 't1',
						name: 'Tour',
						startedAt: Date.now(),
						completedAt: null,
						incomePerSecond: 40,
						usesScarcity: false
					}
				]
			});

			// 10 + 20 + 30 + 40 = 100
			expect(calculateTotalIncome(state)).toBe(100);
		});
	});

	describe('applyIncomeMultipliers', () => {
		it('should return base income when no multipliers active', () => {
			const state = createTestState();
			expect(applyIncomeMultipliers(state, 100)).toBe(100);
		});

		it('should NOT apply prestige multiplier (already in songs)', () => {
			const state = createTestState({
				experienceMultiplier: 1.5
			});
			// Prestige is baked into song values, not applied here
			expect(applyIncomeMultipliers(state, 100)).toBe(100);
		});

		it('should apply active boost multipliers', () => {
			const boost = createTestBoost({
				activatedAt: Date.now() - 1000,
				duration: 30000,
				incomeMultiplier: 2.0
			});

			const state = createTestState({
				activeBoosts: [boost]
			});

			expect(applyIncomeMultipliers(state, 100)).toBe(200);
		});

		it('should stack multiple boost multipliers multiplicatively', () => {
			const boost1 = createTestBoost({
				activatedAt: Date.now() - 1000,
				duration: 30000,
				incomeMultiplier: 2.0
			});

			const boost2 = createTestBoost({
				id: 'boost-2',
				activatedAt: Date.now() - 1000,
				duration: 30000,
				incomeMultiplier: 1.5
			});

			const state = createTestState({
				activeBoosts: [boost1, boost2]
			});

			// 100 * 2.0 * 1.5 = 300
			expect(applyIncomeMultipliers(state, 100)).toBe(300);
		});

		it('should not apply expired boost multipliers', () => {
			const expiredBoost = createTestBoost({
				activatedAt: Date.now() - 40000,
				duration: 30000,
				incomeMultiplier: 2.0
			});

			const state = createTestState({
				activeBoosts: [expiredBoost]
			});

			expect(applyIncomeMultipliers(state, 100)).toBe(100);
		});

		it('should apply only boost multipliers (prestige already in base)', () => {
			const boost = createTestBoost({
				activatedAt: Date.now() - 1000,
				duration: 30000,
				incomeMultiplier: 2.0
			});

			const state = createTestState({
				experienceMultiplier: 1.5,
				activeBoosts: [boost]
			});

			// 100 * 2.0 (boost only) = 200
			// Prestige is already baked into the base value
			expect(applyIncomeMultipliers(state, 100)).toBe(200);
		});
	});
});
