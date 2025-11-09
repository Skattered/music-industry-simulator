import { describe, it, expect } from 'vitest';
import { generateFans, calculateFanGeneration, updatePeakFans } from './fans';
import type { GameState, Song, ActiveBoost } from '../game/types';

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

describe('Fan System', () => {
	describe('generateFans', () => {
		it('should add fans to both total and current artist based on deltaTime', () => {
			const state = createTestState({
				fans: 100,
				currentArtist: {
					name: 'Test',
					songs: 1,
					fans: 100,
					peakFans: 100,
					createdAt: Date.now()
				},
				songs: [createTestSong({ fanGenerationRate: 10 })]
			});

			// 1 second elapsed = 10 fans
			generateFans(state, 1000);
			expect(state.fans).toBe(110);
			expect(state.currentArtist.fans).toBe(110);
		});

		it('should be frame-independent', () => {
			const state1 = createTestState({
				fans: 100,
				currentArtist: {
					name: 'Test',
					songs: 1,
					fans: 100,
					peakFans: 100,
					createdAt: Date.now()
				},
				songs: [createTestSong({ fanGenerationRate: 10 })]
			});
			const state2 = createTestState({
				fans: 100,
				currentArtist: {
					name: 'Test',
					songs: 1,
					fans: 100,
					peakFans: 100,
					createdAt: Date.now()
				},
				songs: [createTestSong({ fanGenerationRate: 10 })]
			});

			// 1 second in one tick
			generateFans(state1, 1000);

			// 1 second in ten ticks (0.1s each)
			for (let i = 0; i < 10; i++) {
				generateFans(state2, 100);
			}

			expect(state1.fans).toBeCloseTo(state2.fans, 5);
			expect(state1.currentArtist.fans).toBeCloseTo(state2.currentArtist.fans, 5);
		});

		it('should handle fractional deltaTime correctly', () => {
			const state = createTestState({
				fans: 0,
				songs: [createTestSong({ fanGenerationRate: 10 })]
			});

			// 0.5 seconds = 5 fans
			generateFans(state, 500);
			expect(state.fans).toBe(5);
		});

		it('should update peak fans automatically', () => {
			const state = createTestState({
				fans: 0,
				currentArtist: {
					name: 'Test',
					songs: 1,
					fans: 0,
					peakFans: 0,
					createdAt: Date.now()
				},
				songs: [createTestSong({ fanGenerationRate: 100 })]
			});

			generateFans(state, 1000);
			expect(state.currentArtist.peakFans).toBe(100);

			generateFans(state, 1000);
			expect(state.currentArtist.peakFans).toBe(200);
		});
	});

	describe('calculateFanGeneration', () => {
		it('should return 0 for empty state', () => {
			const state = createTestState();
			expect(calculateFanGeneration(state)).toBe(0);
		});

		it('should calculate fan generation from single song', () => {
			const state = createTestState({
				songs: [createTestSong({ fanGenerationRate: 15 })]
			});
			expect(calculateFanGeneration(state)).toBe(15);
		});

		it('should calculate fan generation from multiple songs', () => {
			const state = createTestState({
				songs: [
					createTestSong({ fanGenerationRate: 10 }),
					createTestSong({ fanGenerationRate: 20 }),
					createTestSong({ fanGenerationRate: 30 })
				]
			});
			expect(calculateFanGeneration(state)).toBe(60);
		});

		it('should apply trending multiplier to matching songs', () => {
			const state = createTestState({
				currentTrendingGenre: 'pop',
				songs: [
					createTestSong({ fanGenerationRate: 10, genre: 'pop', isTrending: true }),
					createTestSong({ fanGenerationRate: 10, genre: 'rock', isTrending: false })
				]
			});
			// Pop song: 10 * 2 (trending) = 20, Rock song: 10, Total: 30
			expect(calculateFanGeneration(state)).toBe(30);
		});

		it('should only apply trending to songs marked as trending', () => {
			const state = createTestState({
				currentTrendingGenre: 'pop',
				songs: [
					createTestSong({ fanGenerationRate: 10, genre: 'pop', isTrending: false })
				]
			});
			// Not marked as trending, so no multiplier
			expect(calculateFanGeneration(state)).toBe(10);
		});

		it('should apply prestige experience multiplier', () => {
			const state = createTestState({
				experienceMultiplier: 1.5,
				songs: [createTestSong({ fanGenerationRate: 10 })]
			});
			expect(calculateFanGeneration(state)).toBe(15);
		});

		it('should apply active boost multipliers', () => {
			const boost = createTestBoost({
				activatedAt: Date.now() - 1000,
				duration: 30000,
				fanMultiplier: 2.0
			});

			const state = createTestState({
				songs: [createTestSong({ fanGenerationRate: 10 })],
				activeBoosts: [boost]
			});

			expect(calculateFanGeneration(state)).toBe(20);
		});

		it('should stack multiple boost multipliers multiplicatively', () => {
			const boost1 = createTestBoost({
				activatedAt: Date.now() - 1000,
				duration: 30000,
				fanMultiplier: 2.0
			});

			const boost2 = createTestBoost({
				id: 'boost-2',
				activatedAt: Date.now() - 1000,
				duration: 30000,
				fanMultiplier: 1.5
			});

			const state = createTestState({
				songs: [createTestSong({ fanGenerationRate: 10 })],
				activeBoosts: [boost1, boost2]
			});

			// 10 * 2.0 * 1.5 = 30
			expect(calculateFanGeneration(state)).toBe(30);
		});

		it('should not apply expired boost multipliers', () => {
			const expiredBoost = createTestBoost({
				activatedAt: Date.now() - 40000,
				duration: 30000,
				fanMultiplier: 2.0
			});

			const state = createTestState({
				songs: [createTestSong({ fanGenerationRate: 10 })],
				activeBoosts: [expiredBoost]
			});

			expect(calculateFanGeneration(state)).toBe(10);
		});

		it('should apply both prestige and boost multipliers', () => {
			const boost = createTestBoost({
				activatedAt: Date.now() - 1000,
				duration: 30000,
				fanMultiplier: 2.0
			});

			const state = createTestState({
				experienceMultiplier: 1.5,
				songs: [createTestSong({ fanGenerationRate: 10 })],
				activeBoosts: [boost]
			});

			// 10 * 1.5 (prestige) * 2.0 (boost) = 30
			expect(calculateFanGeneration(state)).toBe(30);
		});

		it('should apply trending, prestige, and boost multipliers together', () => {
			const boost = createTestBoost({
				activatedAt: Date.now() - 1000,
				duration: 30000,
				fanMultiplier: 2.0
			});

			const state = createTestState({
				currentTrendingGenre: 'pop',
				experienceMultiplier: 1.5,
				songs: [
					createTestSong({ fanGenerationRate: 10, genre: 'pop', isTrending: true })
				],
				activeBoosts: [boost]
			});

			// 10 * 2 (trending) * 1.5 (prestige) * 2.0 (boost) = 60
			expect(calculateFanGeneration(state)).toBe(60);
		});
	});

	describe('updatePeakFans', () => {
		it('should update peak fans when current fans exceed peak', () => {
			const state = createTestState({
				currentArtist: {
					name: 'Test',
					songs: 1,
					fans: 150,
					peakFans: 100,
					createdAt: Date.now()
				}
			});

			updatePeakFans(state);
			expect(state.currentArtist.peakFans).toBe(150);
		});

		it('should not decrease peak fans when current fans drop', () => {
			const state = createTestState({
				currentArtist: {
					name: 'Test',
					songs: 1,
					fans: 50,
					peakFans: 100,
					createdAt: Date.now()
				}
			});

			updatePeakFans(state);
			expect(state.currentArtist.peakFans).toBe(100);
		});

		it('should not change peak fans when equal to current fans', () => {
			const state = createTestState({
				currentArtist: {
					name: 'Test',
					songs: 1,
					fans: 100,
					peakFans: 100,
					createdAt: Date.now()
				}
			});

			updatePeakFans(state);
			expect(state.currentArtist.peakFans).toBe(100);
		});

		it('should handle zero fans correctly', () => {
			const state = createTestState({
				currentArtist: {
					name: 'Test',
					songs: 0,
					fans: 0,
					peakFans: 0,
					createdAt: Date.now()
				}
			});

			updatePeakFans(state);
			expect(state.currentArtist.peakFans).toBe(0);
		});

		it('should work with large fan numbers', () => {
			const state = createTestState({
				currentArtist: {
					name: 'Test',
					songs: 1000,
					fans: 1_000_000_000,
					peakFans: 500_000_000,
					createdAt: Date.now()
				}
			});

			updatePeakFans(state);
			expect(state.currentArtist.peakFans).toBe(1_000_000_000);
		});
	});
});
