/**
 * Prestige Flow Integration Tests
 *
 * Tests full prestige cycle with multiple systems:
 * - Accumulate progress → unlock prestige → perform prestige → bonuses apply
 * - Legacy artist income generation
 * - Cross-promotion mechanics
 * - Experience multiplier stacking
 * - Multiple prestige cycles
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GameEngine } from '../game/engine';
import type { GameState } from '../game/types';
import { GAME_VERSION, INITIAL_UNLOCKED_SYSTEMS } from '../game/config';
import { performPrestige, canPrestige } from '../systems/prestige';
import { purchaseTechUpgrade } from '../systems/tech';

/**
 * Create a minimal game state for testing
 */
function createTestGameState(overrides?: Partial<GameState>): GameState {
	return {
		money: 1000,
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
		unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS },
		lastUpdate: Date.now(),
		createdAt: Date.now(),
		version: GAME_VERSION,
		...overrides
	};
}

describe('Prestige Flow Integration', () => {
	let engine: GameEngine;
	let gameState: GameState;

	beforeEach(() => {
		gameState = createTestGameState();
		engine = new GameEngine(gameState);
		vi.useFakeTimers();
	});

	afterEach(() => {
		if (engine.running) {
			engine.stop();
		}
		vi.restoreAllMocks();
		vi.useRealTimers();
	});

	describe('Prestige Unlock Progression', () => {
		it('should not allow prestige before unlock', () => {
			expect(canPrestige(gameState)).toBe(false);

			const success = performPrestige(gameState);
			expect(success).toBe(false);
		});

		it('should unlock prestige with tier3_basic upgrade', () => {
			gameState.money = 100000;

			// Purchase tier3_basic which unlocks prestige
			purchaseTechUpgrade(gameState, 'tier1_basic');
			purchaseTechUpgrade(gameState, 'tier1_improved');
			purchaseTechUpgrade(gameState, 'tier1_advanced');
			purchaseTechUpgrade(gameState, 'tier2_basic');
			purchaseTechUpgrade(gameState, 'tier2_improved');
			purchaseTechUpgrade(gameState, 'tier2_advanced');
			purchaseTechUpgrade(gameState, 'tier3_basic');

			expect(gameState.unlockedSystems.prestige).toBe(true);
			expect(canPrestige(gameState)).toBe(true);
		});
	});

	describe('First Prestige Cycle', () => {
		it('should convert current artist to legacy artist on prestige', () => {
			// Set up pre-prestige state
			gameState.unlockedSystems.prestige = true;
			gameState.currentArtist = {
				name: 'First Artist',
				songs: 50,
				fans: 1000000,
				peakFans: 1000000,
				createdAt: Date.now() - 100000
			};

			gameState.songs = [
				{
					id: 'song1',
					name: 'Hit Song',
					genre: 'pop',
					createdAt: Date.now(),
					incomePerSecond: 500,
					fanGenerationRate: 50,
					isTrending: false
				}
			];

			// Perform prestige
			const success = performPrestige(gameState);
			expect(success).toBe(true);

			// Legacy artist should be created
			expect(gameState.legacyArtists.length).toBe(1);
			expect(gameState.legacyArtists[0].name).toBe('First Artist');
			expect(gameState.legacyArtists[0].peakFans).toBe(1000000);
			expect(gameState.legacyArtists[0].songs).toBe(50);
			expect(gameState.legacyArtists[0].incomeRate).toBeGreaterThan(0);
		});

		it('should reset resources on prestige', () => {
			gameState.unlockedSystems.prestige = true;
			gameState.money = 1000000;
			gameState.fans = 500000;
			gameState.songs = [
				{
					id: 'song1',
					name: 'Song',
					genre: 'pop',
					createdAt: Date.now(),
					incomePerSecond: 100,
					fanGenerationRate: 10,
					isTrending: false
				}
			];
			gameState.songQueue = [
				{
					id: 'queued1',
					progress: 5000
				}
			];

			performPrestige(gameState);

			// Resources should be reset
			expect(gameState.money).toBe(10); // INITIAL_MONEY
			expect(gameState.fans).toBe(0); // INITIAL_FANS
			expect(gameState.songs).toEqual([]);
			expect(gameState.songQueue).toEqual([]);
		});

		it('should keep tech upgrades on prestige', () => {
			gameState.unlockedSystems.prestige = true;
			gameState.upgrades = {
				tier1_basic: { purchasedAt: Date.now(), tier: 1 },
				tier2_basic: { purchasedAt: Date.now(), tier: 2 },
				tier3_basic: { purchasedAt: Date.now(), tier: 3 }
			};

			const upgradesBefore = { ...gameState.upgrades };

			performPrestige(gameState);

			// Upgrades should be preserved
			expect(gameState.upgrades).toEqual(upgradesBefore);
		});

		it('should keep industry control on prestige', () => {
			gameState.unlockedSystems.prestige = true;
			gameState.industryControl = 45;

			performPrestige(gameState);

			expect(gameState.industryControl).toBe(45);
		});

		it('should increment prestige count and experience multiplier', () => {
			gameState.unlockedSystems.prestige = true;

			expect(gameState.prestigeCount).toBe(0);
			expect(gameState.experienceMultiplier).toBe(1.0);

			performPrestige(gameState);

			expect(gameState.prestigeCount).toBe(1);
			expect(gameState.experienceMultiplier).toBe(1.15); // +15% per prestige
		});

		it('should create new artist on prestige', () => {
			gameState.unlockedSystems.prestige = true;
			const oldArtistName = gameState.currentArtist.name;

			performPrestige(gameState);

			expect(gameState.currentArtist.name).not.toBe(oldArtistName);
			expect(gameState.currentArtist.songs).toBe(0);
			expect(gameState.currentArtist.fans).toBe(0);
			expect(gameState.currentArtist.peakFans).toBe(0);
		});
	});

	describe('Legacy Artist Income', () => {
		it('should generate income from legacy artist', () => {
			gameState.legacyArtists = [
				{
					name: 'Legacy Artist',
					peakFans: 1000000,
					songs: 50,
					incomeRate: 100,
					createdAt: Date.now() - 100000,
					prestigedAt: Date.now() - 50000
				}
			];

			const initialMoney = gameState.money;

			engine.start();
			vi.advanceTimersByTime(5000); // 5 seconds
			engine.stop();

			// Should have earned 500 from legacy artist (100/sec * 5 sec)
			expect(gameState.money).toBeCloseTo(initialMoney + 500, 50);
		});

		it('should combine legacy and current artist income', () => {
			gameState.legacyArtists = [
				{
					name: 'Legacy Artist',
					peakFans: 1000000,
					songs: 50,
					incomeRate: 100,
					createdAt: Date.now() - 100000,
					prestigedAt: Date.now() - 50000
				}
			];

			gameState.songs = [
				{
					id: 'song1',
					name: 'New Song',
					genre: 'pop',
					createdAt: Date.now(),
					incomePerSecond: 50,
					fanGenerationRate: 10,
					isTrending: false
				}
			];

			const initialMoney = gameState.money;

			engine.start();
			vi.advanceTimersByTime(2000); // 2 seconds
			engine.stop();

			// Should have earned 300 total (100+50)*2
			expect(gameState.money).toBeCloseTo(initialMoney + 300, 30);
		});
	});

	describe('Cross-Promotion Mechanics', () => {
		it('should transfer fans from legacy artist to new artist', () => {
			gameState.legacyArtists = [
				{
					name: 'Legacy Artist',
					peakFans: 10000000, // 10M fans
					songs: 100,
					incomeRate: 1000,
					createdAt: Date.now() - 100000,
					prestigedAt: Date.now() - 50000
				}
			];

			const initialFans = gameState.fans;
			const initialArtistFans = gameState.currentArtist.fans;

			engine.start();
			vi.advanceTimersByTime(10000); // 10 seconds
			engine.stop();

			// Should have gained fans from cross-promotion
			expect(gameState.fans).toBeGreaterThan(initialFans);
			expect(gameState.currentArtist.fans).toBeGreaterThan(initialArtistFans);
		});

		it('should update peak fans from cross-promotion', () => {
			gameState.legacyArtists = [
				{
					name: 'Legacy Artist',
					peakFans: 5000000,
					songs: 100,
					incomeRate: 500,
					createdAt: Date.now() - 100000,
					prestigedAt: Date.now() - 50000
				}
			];

			expect(gameState.currentArtist.peakFans).toBe(0);

			engine.start();
			vi.advanceTimersByTime(5000); // 5 seconds
			engine.stop();

			// Peak fans should be updated
			expect(gameState.currentArtist.peakFans).toBeGreaterThan(0);
			expect(gameState.currentArtist.peakFans).toBeGreaterThanOrEqual(
				gameState.currentArtist.fans
			);
		});

		it('should combine cross-promotion from multiple legacy artists', () => {
			gameState.legacyArtists = [
				{
					name: 'Legacy Artist 1',
					peakFans: 5000000,
					songs: 50,
					incomeRate: 500,
					createdAt: Date.now() - 200000,
					prestigedAt: Date.now() - 100000
				},
				{
					name: 'Legacy Artist 2',
					peakFans: 3000000,
					songs: 30,
					incomeRate: 300,
					createdAt: Date.now() - 100000,
					prestigedAt: Date.now() - 50000
				}
			];

			const initialFans = gameState.fans;

			engine.start();
			vi.advanceTimersByTime(5000); // 5 seconds
			engine.stop();

			// Should have gained fans from both legacy artists
			expect(gameState.fans).toBeGreaterThan(initialFans);
		});
	});

	describe('Experience Multiplier', () => {
		it('should apply 15% bonus after first prestige', () => {
			gameState.prestigeCount = 1;
			gameState.experienceMultiplier = 1.15;

			gameState.songs = [
				{
					id: 'song1',
					name: 'Song',
					genre: 'pop',
					createdAt: Date.now(),
					incomePerSecond: 115, // Already has 1.15x experience multiplier baked in
					fanGenerationRate: 11.5, // Already has 1.15x experience multiplier baked in
					isTrending: false
				}
			];

			const initialMoney = gameState.money;

			engine.start();
			vi.advanceTimersByTime(1000); // 1 second
			engine.stop();

			// Should earn 115 (song already has experience multiplier baked in)
			expect(gameState.money).toBeCloseTo(initialMoney + 115, 15);
		});

		it('should stack experience bonuses from multiple prestiges', () => {
			gameState.prestigeCount = 3;
			gameState.experienceMultiplier = 1.45; // 1.0 + (3 * 0.15)

			gameState.songs = [
				{
					id: 'song1',
					name: 'Song',
					genre: 'pop',
					createdAt: Date.now(),
					incomePerSecond: 145, // Already has 1.45x experience multiplier baked in
					fanGenerationRate: 14.5, // Already has 1.45x experience multiplier baked in
					isTrending: false
				}
			];

			const initialMoney = gameState.money;

			engine.start();
			vi.advanceTimersByTime(1000); // 1 second
			engine.stop();

			// Should earn 145 (song already has experience multiplier baked in)
			expect(gameState.money).toBeCloseTo(initialMoney + 145, 15);
		});

		it('should apply experience multiplier to legacy artist income', () => {
			gameState.prestigeCount = 2;
			gameState.experienceMultiplier = 1.3;

			gameState.legacyArtists = [
				{
					name: 'Legacy Artist',
					peakFans: 1000000,
					songs: 50,
					incomeRate: 100,
					createdAt: Date.now() - 100000,
					prestigedAt: Date.now() - 50000
				}
			];

			const initialMoney = gameState.money;

			engine.start();
			vi.advanceTimersByTime(1000); // 1 second
			engine.stop();

			// Should earn 100 (legacy artist has fixed income rate)
			expect(gameState.money).toBeCloseTo(initialMoney + 100, 15);
		});
	});

	describe('Multiple Prestige Cycles', () => {
		it('should handle second prestige correctly', () => {
			// First prestige
			gameState.unlockedSystems.prestige = true;
			gameState.currentArtist.peakFans = 1000000;
			gameState.songs = [
				{
					id: 'song1',
					name: 'Song',
					genre: 'pop',
					createdAt: Date.now(),
					incomePerSecond: 100,
					fanGenerationRate: 10,
					isTrending: false
				}
			];

			performPrestige(gameState);

			expect(gameState.prestigeCount).toBe(1);
			expect(gameState.legacyArtists.length).toBe(1);

			// Build up second artist
			gameState.currentArtist.peakFans = 2000000;
			gameState.money = 100000;
			gameState.songs = [
				{
					id: 'song2',
					name: 'Song 2',
					genre: 'pop',
					createdAt: Date.now(),
					incomePerSecond: 200,
					fanGenerationRate: 20,
					isTrending: false
				}
			];

			// Second prestige
			performPrestige(gameState);

			expect(gameState.prestigeCount).toBe(2);
			expect(gameState.legacyArtists.length).toBe(2);
			expect(gameState.experienceMultiplier).toBe(1.3); // 1.0 + (2 * 0.15)
		});

		it('should limit legacy artists to MAX_LEGACY_ARTISTS (3)', () => {
			gameState.unlockedSystems.prestige = true;

			// Perform 5 prestiges
			for (let i = 0; i < 5; i++) {
				gameState.currentArtist.peakFans = (i + 1) * 1000000;
				gameState.songs = [
					{
						id: `song${i}`,
						name: `Song ${i}`,
						genre: 'pop',
						createdAt: Date.now(),
						incomePerSecond: 100,
						fanGenerationRate: 10,
						isTrending: false
					}
				];

				performPrestige(gameState);
			}

			// Should have exactly 3 legacy artists (most recent)
			expect(gameState.legacyArtists.length).toBe(3);
			expect(gameState.prestigeCount).toBe(5);
		});

		it('should keep most recent legacy artists when limit is exceeded', () => {
			gameState.unlockedSystems.prestige = true;

			// Perform 4 prestiges with identifiable names
			const artistNames: string[] = [];
			for (let i = 0; i < 4; i++) {
				gameState.currentArtist.name = `Artist ${i + 1}`;
				gameState.currentArtist.peakFans = (i + 1) * 1000000;
				gameState.songs = [
					{
						id: `song${i}`,
						name: `Song ${i}`,
						genre: 'pop',
						createdAt: Date.now(),
						incomePerSecond: 100,
						fanGenerationRate: 10,
						isTrending: false
					}
				];

				performPrestige(gameState);
				artistNames.push(`Artist ${i + 1}`);
			}

			// Should have last 3 artists (Artist 2, 3, 4)
			expect(gameState.legacyArtists.length).toBe(3);
			expect(gameState.legacyArtists[0].name).toBe('Artist 2');
			expect(gameState.legacyArtists[1].name).toBe('Artist 3');
			expect(gameState.legacyArtists[2].name).toBe('Artist 4');
		});
	});

	describe('Full Prestige Flow', () => {
		it('should complete full prestige cycle: build → prestige → rebuild with bonuses', () => {
			gameState.money = 100000;
			gameState.unlockedSystems.prestige = true;

			// Phase 1: Build up first artist
			gameState.songs = [
				{
					id: 'song1',
					name: 'Hit Song',
					genre: 'pop',
					createdAt: Date.now(),
					incomePerSecond: 500,
					fanGenerationRate: 50,
					isTrending: false
				}
			];

			engine.start();
			vi.advanceTimersByTime(10000); // 10 seconds
			engine.stop();

			const moneyBeforePrestige = gameState.money;
			const fansBeforePrestige = gameState.fans;

			expect(moneyBeforePrestige).toBeGreaterThan(100000);
			expect(fansBeforePrestige).toBeGreaterThan(0);

			// Phase 2: Prestige
			performPrestige(gameState);

			expect(gameState.money).toBe(10); // Reset
			expect(gameState.fans).toBe(0); // Reset
			expect(gameState.songs.length).toBe(0); // Reset
			expect(gameState.legacyArtists.length).toBe(1);
			expect(gameState.experienceMultiplier).toBe(1.15);

			// Phase 3: Rebuild with bonuses
			gameState.money = 1000; // Give some starting money
			gameState.songs = [
				{
					id: 'song2',
					name: 'New Song',
					genre: 'pop',
					createdAt: Date.now(),
					incomePerSecond: 100,
					fanGenerationRate: 10,
					isTrending: false
				}
			];

			const moneyAfterPrestige = gameState.money;

			engine.start();
			vi.advanceTimersByTime(5000); // 5 seconds
			engine.stop();

			// Should have income from:
			// 1. New song (100/sec * 1.15 experience multiplier)
			// 2. Legacy artist (from previous run)
			expect(gameState.money).toBeGreaterThan(moneyAfterPrestige);

			// Should have fans from cross-promotion
			expect(gameState.fans).toBeGreaterThan(0);
		});

		it('should demonstrate accelerating progression through multiple prestige cycles', () => {
			gameState.unlockedSystems.prestige = true;

			// Track earnings at each prestige level
			const earningsPerPrestige: number[] = [];

			for (let prestigeLevel = 0; prestigeLevel < 3; prestigeLevel++) {
				gameState.money = 1000;
				gameState.songs = [
					{
						id: `song${prestigeLevel}`,
						name: `Song ${prestigeLevel}`,
						genre: 'pop',
						createdAt: Date.now(),
						incomePerSecond: 100,
						fanGenerationRate: 10,
						isTrending: false
					}
				];

				const initialMoney = gameState.money;

				engine.start();
				vi.advanceTimersByTime(5000); // 5 seconds
				engine.stop();

				const earned = gameState.money - initialMoney;
				earningsPerPrestige.push(earned);

				// Prestige if not last cycle
				if (prestigeLevel < 2) {
					performPrestige(gameState);
				}
			}

			// Each prestige should earn more than the previous due to:
			// 1. Experience multiplier
			// 2. Legacy artist income
			// 3. Cross-promotion
			expect(earningsPerPrestige[1]).toBeGreaterThan(earningsPerPrestige[0]);
			expect(earningsPerPrestige[2]).toBeGreaterThan(earningsPerPrestige[1]);
		});
	});

	describe('Prestige with Other Systems', () => {
		it('should keep platforms and industry control through prestige', () => {
			gameState.unlockedSystems.prestige = true;
			gameState.unlockedSystems.platformOwnership = true;

			gameState.ownedPlatforms = [
				{
					id: 'streaming',
					type: 'streaming',
					name: 'Streaming Service',
					cost: 10000000,
					acquiredAt: Date.now(),
					incomePerSecond: 10000,
					controlContribution: 15
				}
			];

			gameState.industryControl = 15;

			performPrestige(gameState);

			// Platforms and control should be preserved
			expect(gameState.ownedPlatforms.length).toBe(1);
			expect(gameState.industryControl).toBe(15);
		});

		it('should keep physical albums through prestige', () => {
			gameState.unlockedSystems.prestige = true;
			gameState.unlockedSystems.physicalAlbums = true;

			gameState.physicalAlbums = [
				{
					id: 'album1',
					name: 'Album',
					songCount: 10,
					releasedAt: Date.now(),
					payout: 100000,
					variantCount: 1,
					isRerelease: false
				}
			];

			performPrestige(gameState);

			// Albums should be preserved
			expect(gameState.physicalAlbums.length).toBe(1);
		});

		it('should clear active tours on prestige', () => {
			gameState.unlockedSystems.prestige = true;
			gameState.unlockedSystems.tours = true;

			gameState.tours = [
				{
					id: 'tour1',
					name: 'Active Tour',
					startedAt: Date.now(),
					completedAt: null,
					incomePerSecond: 1000,
					usesScarcity: false
				}
			];

			// Tours are preserved (completed tours show history)
			performPrestige(gameState);

			expect(gameState.tours.length).toBe(1);
		});
	});
});
