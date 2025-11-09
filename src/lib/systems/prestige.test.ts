import { describe, it, expect } from 'vitest';
import {
	canPrestige,
	performPrestige,
	calculateExperienceBonus,
	calculateLegacyIncome,
	processLegacyArtists
} from './prestige';
import type { GameState, LegacyArtist, Song } from '../game/types';
import {
	PRESTIGE_MULTIPLIER_PER_LEVEL,
	MAX_LEGACY_ARTISTS,
	LEGACY_ARTIST_INCOME_RATIO,
	INITIAL_MONEY,
	INITIAL_FANS
} from '../game/config';

// Helper function to create a minimal game state for testing
function createTestState(overrides: Partial<GameState> = {}): GameState {
	return {
		money: 1000,
		songs: [],
		fans: 100000,
		gpu: 0,
		phase: 1,
		industryControl: 0,
		currentArtist: {
			name: 'Test Artist',
			songs: 50,
			fans: 100000,
			peakFans: 150000,
			createdAt: Date.now() - 100000
		},
		legacyArtists: [],
		songQueue: [],
		songGenerationSpeed: 30000,
		currentTrendingGenre: null,
		trendDiscoveredAt: null,
		techTier: 3,
		techSubTier: 0,
		upgrades: {},
		activeBoosts: [],
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
			prestige: true,
			gpu: true
		},
		lastUpdate: Date.now(),
		createdAt: Date.now() - 100000,
		version: '1.0.0',
		...overrides
	};
}

// Helper function to create a test legacy artist
function createTestLegacyArtist(overrides: Partial<LegacyArtist> = {}): LegacyArtist {
	return {
		name: 'Legacy Artist',
		peakFans: 1000000,
		songs: 100,
		incomeRate: 100,
		createdAt: Date.now() - 200000,
		prestigedAt: Date.now() - 100000,
		...overrides
	};
}

describe('Prestige System', () => {
	describe('canPrestige', () => {
		it('should return false if prestige is not unlocked', () => {
			const state = createTestState({
				techTier: 3,
				unlockedSystems: {
					trendResearch: false,
					physicalAlbums: false,
					tours: false,
					platformOwnership: false,
					monopoly: false,
					prestige: false,
					gpu: true
				}
			});

			expect(canPrestige(state)).toBe(false);
		});

		it('should return false if tech tier is below 3', () => {
			const state = createTestState({
				techTier: 2,
				unlockedSystems: {
					trendResearch: false,
					physicalAlbums: false,
					tours: false,
					platformOwnership: false,
					monopoly: false,
					prestige: true,
					gpu: false
				}
			});

			expect(canPrestige(state)).toBe(false);
		});

		it('should return true at tech tier 3 with prestige unlocked', () => {
			const state = createTestState({
				techTier: 3,
				unlockedSystems: {
					trendResearch: false,
					physicalAlbums: false,
					tours: false,
					platformOwnership: false,
					monopoly: false,
					prestige: true,
					gpu: true
				}
			});

			expect(canPrestige(state)).toBe(true);
		});

		it('should return false at tech tier 4 (not a prestige milestone)', () => {
			const state = createTestState({
				techTier: 4,
				unlockedSystems: {
					trendResearch: false,
					physicalAlbums: false,
					tours: false,
					platformOwnership: false,
					monopoly: false,
					prestige: true,
					gpu: true
				}
			});

			expect(canPrestige(state)).toBe(false);
		});

		it('should return true at tech tier 5 (second prestige milestone)', () => {
			const state = createTestState({
				techTier: 5,
				prestigeCount: 1
			});

			expect(canPrestige(state)).toBe(true);
		});

		it('should return true at tech tier 6 (third prestige milestone)', () => {
			const state = createTestState({
				techTier: 6,
				prestigeCount: 2
			});

			expect(canPrestige(state)).toBe(true);
		});

		it('should return true at tech tier 7 (can prestige any time)', () => {
			const state = createTestState({
				techTier: 7,
				prestigeCount: 3
			});

			expect(canPrestige(state)).toBe(true);
		});
	});

	describe('calculateExperienceBonus', () => {
		it('should return 1.1x multiplier for first prestige', () => {
			const state = createTestState({
				prestigeCount: 0
			});

			const bonus = calculateExperienceBonus(state);
			expect(bonus).toBe(1.0 + PRESTIGE_MULTIPLIER_PER_LEVEL);
			expect(bonus).toBe(1.1);
		});

		it('should return 1.2x multiplier for second prestige', () => {
			const state = createTestState({
				prestigeCount: 1,
				experienceMultiplier: 1.1
			});

			const bonus = calculateExperienceBonus(state);
			expect(bonus).toBe(1.2);
		});

		it('should return 1.3x multiplier for third prestige', () => {
			const state = createTestState({
				prestigeCount: 2,
				experienceMultiplier: 1.2
			});

			const bonus = calculateExperienceBonus(state);
			expect(bonus).toBe(1.3);
		});

		it('should scale linearly with prestige count', () => {
			const state = createTestState({
				prestigeCount: 9,
				experienceMultiplier: 1.9
			});

			const bonus = calculateExperienceBonus(state);
			expect(bonus).toBe(2.0); // 10th prestige = 1.0 + 10 * 0.1 = 2.0x
		});
	});

	describe('calculateLegacyIncome', () => {
		it('should calculate income based on peak fans', () => {
			const state = createTestState({
				currentArtist: {
					name: 'Artist',
					songs: 100,
					fans: 100000000,
					peakFans: 100000000,
					createdAt: Date.now()
				}
			});

			const income = calculateLegacyIncome(state);
			// 100M fans * 0.0001 = $10,000/sec
			expect(income).toBe(100000000 * LEGACY_ARTIST_INCOME_RATIO);
			expect(income).toBe(10000);
		});

		it('should calculate income for 1 billion peak fans', () => {
			const state = createTestState({
				currentArtist: {
					name: 'Artist',
					songs: 1000,
					fans: 1000000000,
					peakFans: 1000000000,
					createdAt: Date.now()
				}
			});

			const income = calculateLegacyIncome(state);
			// 1B fans * 0.0001 = $100,000/sec
			expect(income).toBe(1000000000 * LEGACY_ARTIST_INCOME_RATIO);
			expect(income).toBe(100000);
		});

		it('should return 0 for artist with no fans', () => {
			const state = createTestState({
				currentArtist: {
					name: 'New Artist',
					songs: 0,
					fans: 0,
					peakFans: 0,
					createdAt: Date.now()
				}
			});

			const income = calculateLegacyIncome(state);
			expect(income).toBe(0);
		});
	});

	describe('processLegacyArtists', () => {
		it('should do nothing with no legacy artists', () => {
			const state = createTestState({
				legacyArtists: [],
				fans: 1000,
				currentArtist: {
					name: 'Artist',
					songs: 10,
					fans: 1000,
					peakFans: 1000,
					createdAt: Date.now()
				}
			});

			processLegacyArtists(state, 1000);

			expect(state.fans).toBe(1000);
			expect(state.currentArtist.fans).toBe(1000);
		});

		it('should funnel fans from legacy artists to current artist', () => {
			const legacyArtist = createTestLegacyArtist({
				peakFans: 1000000 // 1M fans
			});

			const state = createTestState({
				legacyArtists: [legacyArtist],
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

			// 1M fans * 0.0001 (CROSS_PROMOTION_RATE) * 1 second = 100 fans
			expect(state.fans).toBe(100);
			expect(state.currentArtist.fans).toBe(100);
			expect(state.currentArtist.peakFans).toBe(100);
		});

		it('should sum cross-promotion from multiple legacy artists', () => {
			const legacy1 = createTestLegacyArtist({
				name: 'Legacy 1',
				peakFans: 1000000 // 1M fans -> 100 fans/sec
			});

			const legacy2 = createTestLegacyArtist({
				name: 'Legacy 2',
				peakFans: 2000000 // 2M fans -> 200 fans/sec
			});

			const state = createTestState({
				legacyArtists: [legacy1, legacy2],
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

			// (1M + 2M) * 0.0001 * 1 sec = 300 fans
			expect(state.fans).toBe(300);
			expect(state.currentArtist.fans).toBe(300);
		});

		it('should update peak fans when cross-promotion surpasses it', () => {
			const legacyArtist = createTestLegacyArtist({
				peakFans: 10000000 // 10M fans
			});

			const state = createTestState({
				legacyArtists: [legacyArtist],
				fans: 500,
				currentArtist: {
					name: 'New Artist',
					songs: 0,
					fans: 500,
					peakFans: 500,
					createdAt: Date.now()
				}
			});

			// Process 1 second
			processLegacyArtists(state, 1000);

			// 10M * 0.0001 * 1 sec = 1000 fans added
			expect(state.currentArtist.fans).toBe(1500);
			expect(state.currentArtist.peakFans).toBe(1500);
		});

		it('should be frame-independent', () => {
			const legacyArtist = createTestLegacyArtist({
				peakFans: 1000000
			});

			const state1 = createTestState({
				legacyArtists: [legacyArtist],
				fans: 0,
				currentArtist: {
					name: 'Artist',
					songs: 0,
					fans: 0,
					peakFans: 0,
					createdAt: Date.now()
				}
			});

			const state2 = createTestState({
				legacyArtists: [legacyArtist],
				fans: 0,
				currentArtist: {
					name: 'Artist',
					songs: 0,
					fans: 0,
					peakFans: 0,
					createdAt: Date.now()
				}
			});

			// 1 second in one tick
			processLegacyArtists(state1, 1000);

			// 1 second in ten ticks
			for (let i = 0; i < 10; i++) {
				processLegacyArtists(state2, 100);
			}

			expect(state1.fans).toBeCloseTo(state2.fans, 2);
		});
	});

	describe('performPrestige', () => {
		it('should return false if cannot prestige', () => {
			const state = createTestState({
				techTier: 2,
				unlockedSystems: {
					trendResearch: false,
					physicalAlbums: false,
					tours: false,
					platformOwnership: false,
					monopoly: false,
					prestige: false,
					gpu: false
				}
			});

			const result = performPrestige(state);
			expect(result).toBe(false);
		});

		it('should create legacy artist from current artist', () => {
			const state = createTestState({
				techTier: 3,
				currentArtist: {
					name: 'First Artist',
					songs: 100,
					fans: 50000000,
					peakFans: 100000000,
					createdAt: Date.now() - 100000
				}
			});

			performPrestige(state);

			expect(state.legacyArtists.length).toBe(1);
			expect(state.legacyArtists[0].name).toBe('First Artist');
			expect(state.legacyArtists[0].peakFans).toBe(100000000);
			expect(state.legacyArtists[0].songs).toBe(100);
			expect(state.legacyArtists[0].incomeRate).toBe(100000000 * LEGACY_ARTIST_INCOME_RATIO);
		});

		it('should reset money to initial amount', () => {
			const state = createTestState({
				money: 5000000,
				techTier: 3
			});

			performPrestige(state);

			expect(state.money).toBe(INITIAL_MONEY);
		});

		it('should reset fans to initial amount', () => {
			const state = createTestState({
				fans: 100000000,
				techTier: 3
			});

			performPrestige(state);

			expect(state.fans).toBe(INITIAL_FANS);
		});

		it('should clear all songs', () => {
			const songs: Song[] = [
				{
					id: '1',
					name: 'Song 1',
					genre: 'pop',
					createdAt: Date.now(),
					incomePerSecond: 10,
					fanGenerationRate: 100,
					isTrending: false
				},
				{
					id: '2',
					name: 'Song 2',
					genre: 'rock',
					createdAt: Date.now(),
					incomePerSecond: 10,
					fanGenerationRate: 100,
					isTrending: false
				}
			];

			const state = createTestState({
				songs,
				techTier: 3
			});

			performPrestige(state);

			expect(state.songs).toEqual([]);
		});

		it('should clear song queue', () => {
			const state = createTestState({
				songQueue: [
					{ id: '1', progress: 5000, totalTime: 10000 },
					{ id: '2', progress: 0, totalTime: 10000 }
				],
				techTier: 3
			});

			performPrestige(state);

			expect(state.songQueue).toEqual([]);
		});

		it('should create new current artist with reset stats', () => {
			const state = createTestState({
				techTier: 3,
				currentArtist: {
					name: 'Old Artist',
					songs: 500,
					fans: 100000000,
					peakFans: 200000000,
					createdAt: Date.now() - 500000
				}
			});

			performPrestige(state);

			expect(state.currentArtist.name).not.toBe('Old Artist');
			expect(state.currentArtist.songs).toBe(0);
			expect(state.currentArtist.fans).toBe(0);
			expect(state.currentArtist.peakFans).toBe(0);
			expect(state.currentArtist.createdAt).toBeGreaterThan(Date.now() - 1000);
		});

		it('should increment prestige count', () => {
			const state = createTestState({
				prestigeCount: 0,
				techTier: 3
			});

			performPrestige(state);

			expect(state.prestigeCount).toBe(1);
		});

		it('should increase experience multiplier', () => {
			const state = createTestState({
				prestigeCount: 0,
				experienceMultiplier: 1.0,
				techTier: 3
			});

			performPrestige(state);

			expect(state.experienceMultiplier).toBe(1.1);
		});

		it('should keep tech tier and upgrades', () => {
			const state = createTestState({
				techTier: 5,
				techSubTier: 2,
				upgrades: {
					tier3_basic: { purchasedAt: Date.now(), tier: 3 },
					tier4_improved: { purchasedAt: Date.now(), tier: 4 }
				}
			});

			const originalTechTier = state.techTier;
			const originalTechSubTier = state.techSubTier;
			const originalUpgrades = { ...state.upgrades };

			performPrestige(state);

			expect(state.techTier).toBe(originalTechTier);
			expect(state.techSubTier).toBe(originalTechSubTier);
			expect(state.upgrades).toEqual(originalUpgrades);
		});

		it('should keep industry control', () => {
			const state = createTestState({
				industryControl: 75,
				techTier: 6
			});

			performPrestige(state);

			expect(state.industryControl).toBe(75);
		});

		it('should keep owned platforms', () => {
			const platforms = [
				{
					id: 'p1',
					type: 'streaming' as const,
					name: 'Streaming Service',
					cost: 10000000,
					acquiredAt: Date.now(),
					incomePerSecond: 10000,
					controlContribution: 15
				}
			];

			const state = createTestState({
				ownedPlatforms: platforms,
				techTier: 6
			});

			performPrestige(state);

			expect(state.ownedPlatforms).toEqual(platforms);
		});

		it('should keep max 3 legacy artists (fading mechanic)', () => {
			const legacy1 = createTestLegacyArtist({ name: 'Oldest Artist', peakFans: 10000000 });
			const legacy2 = createTestLegacyArtist({ name: 'Middle Artist', peakFans: 50000000 });
			const legacy3 = createTestLegacyArtist({ name: 'Recent Artist', peakFans: 100000000 });

			const state = createTestState({
				legacyArtists: [legacy1, legacy2, legacy3],
				techTier: 7,
				prestigeCount: 3,
				currentArtist: {
					name: 'Current Artist',
					songs: 200,
					fans: 200000000,
					peakFans: 200000000,
					createdAt: Date.now()
				}
			});

			performPrestige(state);

			// Should have MAX_LEGACY_ARTISTS (3) artists
			expect(state.legacyArtists.length).toBe(MAX_LEGACY_ARTISTS);

			// Oldest artist should be removed
			expect(state.legacyArtists.find((a) => a.name === 'Oldest Artist')).toBeUndefined();

			// Recent artists should remain
			expect(state.legacyArtists.find((a) => a.name === 'Middle Artist')).toBeDefined();
			expect(state.legacyArtists.find((a) => a.name === 'Recent Artist')).toBeDefined();
			expect(state.legacyArtists.find((a) => a.name === 'Current Artist')).toBeDefined();
		});

		it('should allow multiple prestiges in sequence', () => {
			const state = createTestState({
				techTier: 7,
				prestigeCount: 0
			});

			// First prestige
			performPrestige(state);
			expect(state.prestigeCount).toBe(1);
			expect(state.experienceMultiplier).toBe(1.1);
			expect(state.legacyArtists.length).toBe(1);

			// Add some progress
			state.currentArtist.peakFans = 50000000;

			// Second prestige
			performPrestige(state);
			expect(state.prestigeCount).toBe(2);
			expect(state.experienceMultiplier).toBe(1.2);
			expect(state.legacyArtists.length).toBe(2);

			// Third prestige
			state.currentArtist.peakFans = 100000000;
			performPrestige(state);
			expect(state.prestigeCount).toBe(3);
			expect(state.experienceMultiplier).toBe(1.3);
			expect(state.legacyArtists.length).toBe(3);

			// Fourth prestige - should trigger fading
			state.currentArtist.peakFans = 150000000;
			performPrestige(state);
			expect(state.prestigeCount).toBe(4);
			expect(state.experienceMultiplier).toBe(1.4);
			expect(state.legacyArtists.length).toBe(3); // Still max 3
		});
	});
});
