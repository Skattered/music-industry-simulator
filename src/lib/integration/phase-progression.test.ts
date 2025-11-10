/**
 * Phase Progression Integration Tests
 *
 * Tests complete phase unlock flow across all phases:
 * - Phase 1 (Streaming) → Phase 2 (Physical Albums)
 * - Phase 2 → Phase 3 (Tours & Concerts)
 * - Phase 3 → Phase 4 (Platform Ownership)
 * - Phase 4 → Phase 5 (Total Automation)
 * - System unlocks at appropriate phases
 * - Cross-phase interactions
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GameEngine } from '../game/engine';
import type { GameState, Phase } from '../game/types';
import { GAME_VERSION, INITIAL_UNLOCKED_SYSTEMS, PHASE_REQUIREMENTS } from '../game/config';
import { purchaseTechUpgrade } from '../systems/tech';
import { performPrestige } from '../systems/prestige';

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

describe('Phase Progression Integration', () => {
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

	describe('Phase Requirements', () => {
		it('should have requirements defined for all 5 phases', () => {
			expect(PHASE_REQUIREMENTS[1]).toBeDefined();
			expect(PHASE_REQUIREMENTS[2]).toBeDefined();
			expect(PHASE_REQUIREMENTS[3]).toBeDefined();
			expect(PHASE_REQUIREMENTS[4]).toBeDefined();
			expect(PHASE_REQUIREMENTS[5]).toBeDefined();
		});

		it('should have increasing fan requirements across phases', () => {
			expect(PHASE_REQUIREMENTS[2].minFans).toBeGreaterThan(PHASE_REQUIREMENTS[1].minFans);
			expect(PHASE_REQUIREMENTS[3].minFans).toBeGreaterThan(PHASE_REQUIREMENTS[2].minFans);
			expect(PHASE_REQUIREMENTS[4].minFans).toBeGreaterThan(PHASE_REQUIREMENTS[3].minFans);
			expect(PHASE_REQUIREMENTS[5].minFans).toBeGreaterThan(PHASE_REQUIREMENTS[4].minFans);
		});

		it('should have increasing tech tier requirements across phases', () => {
			expect(PHASE_REQUIREMENTS[2].minTechTier).toBeGreaterThanOrEqual(
				PHASE_REQUIREMENTS[1].minTechTier
			);
			expect(PHASE_REQUIREMENTS[3].minTechTier).toBeGreaterThanOrEqual(
				PHASE_REQUIREMENTS[2].minTechTier
			);
			expect(PHASE_REQUIREMENTS[4].minTechTier).toBeGreaterThanOrEqual(
				PHASE_REQUIREMENTS[3].minTechTier
			);
			expect(PHASE_REQUIREMENTS[5].minTechTier).toBeGreaterThanOrEqual(
				PHASE_REQUIREMENTS[4].minTechTier
			);
		});
	});

	describe('Phase 1: Streaming Phase', () => {
		it('should start in Phase 1', () => {
			expect(gameState.phase).toBe(1);
		});

		it('should allow basic song generation in Phase 1', () => {
			gameState.money = 100;
			gameState.songs = [
				{
					id: 'song1',
					name: 'First Song',
					genre: 'pop',
					createdAt: Date.now(),
					incomePerSecond: 2,
					fanGenerationRate: 20,
					isTrending: false
				}
			];

			const initialMoney = gameState.money;

			engine.start();
			vi.advanceTimersByTime(5000); // 5 seconds
			engine.stop();

			// Should generate income
			expect(gameState.money).toBeGreaterThan(initialMoney);
			expect(gameState.fans).toBeGreaterThan(0);
		});

		it('should not have physical albums unlocked in Phase 1', () => {
			expect(gameState.unlockedSystems.physicalAlbums).toBe(false);
		});

		it('should not have tours unlocked in Phase 1', () => {
			expect(gameState.unlockedSystems.tours).toBe(false);
		});
	});

	describe('Phase 2: Physical Albums Phase', () => {
		it('should unlock Phase 2 with sufficient progress', () => {
			// Meet Phase 2 requirements
			gameState.fans = 100_000;
			gameState.money = 100_000;
			gameState.techTier = 2;

			// Add 100 songs
			for (let i = 0; i < 100; i++) {
				gameState.songs.push({
					id: `song${i}`,
					name: `Song ${i}`,
					genre: 'pop',
					createdAt: Date.now(),
					incomePerSecond: 2,
					fanGenerationRate: 20,
					isTrending: false
				});
			}

			engine.start();
			vi.advanceTimersByTime(100); // Single tick to check unlocks
			engine.stop();

			expect(gameState.phase).toBe(2);
		});

		it('should unlock physical albums system in Phase 2', () => {
			gameState.money = 100000;

			// Purchase upgrades to reach tier 2 and unlock physical albums
			purchaseTechUpgrade(gameState, 'tier1_basic');
			purchaseTechUpgrade(gameState, 'tier1_improved');
			purchaseTechUpgrade(gameState, 'tier1_advanced');
			purchaseTechUpgrade(gameState, 'tier2_basic');
			purchaseTechUpgrade(gameState, 'tier2_improved'); // Unlocks physical albums

			engine.start();
			vi.advanceTimersByTime(100);
			engine.stop();

			expect(gameState.unlockedSystems.physicalAlbums).toBe(true);
		});

		it('should not unlock Phase 2 without sufficient fans', () => {
			gameState.fans = 50_000; // Below 100K requirement
			gameState.money = 100_000;
			gameState.techTier = 2;

			for (let i = 0; i < 100; i++) {
				gameState.songs.push({
					id: `song${i}`,
					name: `Song ${i}`,
					genre: 'pop',
					createdAt: Date.now(),
					incomePerSecond: 2,
					fanGenerationRate: 20,
					isTrending: false
				});
			}

			engine.start();
			vi.advanceTimersByTime(100);
			engine.stop();

			expect(gameState.phase).toBe(1);
		});

		it('should not unlock Phase 2 without sufficient songs', () => {
			gameState.fans = 100_000;
			gameState.money = 100_000;
			gameState.techTier = 2;

			// Only 50 songs (need 100)
			for (let i = 0; i < 50; i++) {
				gameState.songs.push({
					id: `song${i}`,
					name: `Song ${i}`,
					genre: 'pop',
					createdAt: Date.now(),
					incomePerSecond: 2,
					fanGenerationRate: 20,
					isTrending: false
				});
			}

			engine.start();
			vi.advanceTimersByTime(100);
			engine.stop();

			expect(gameState.phase).toBe(1);
		});

		it('should not unlock Phase 2 without sufficient tech tier', () => {
			gameState.fans = 100_000;
			gameState.money = 100_000;
			gameState.techTier = 1; // Below tier 2 requirement

			for (let i = 0; i < 100; i++) {
				gameState.songs.push({
					id: `song${i}`,
					name: `Song ${i}`,
					genre: 'pop',
					createdAt: Date.now(),
					incomePerSecond: 2,
					fanGenerationRate: 20,
					isTrending: false
				});
			}

			engine.start();
			vi.advanceTimersByTime(100);
			engine.stop();

			expect(gameState.phase).toBe(1);
		});
	});

	describe('Phase 3: Tours & Concerts Phase', () => {
		it('should unlock Phase 3 with sufficient progress', () => {
			// First advance to Phase 2
			gameState.phase = 2;

			// Meet Phase 3 requirements
			gameState.fans = 1_000_000;
			gameState.techTier = 3;
			gameState.unlockedSystems.physicalAlbums = true;

			// Add 10 albums
			for (let i = 0; i < 10; i++) {
				gameState.physicalAlbums.push({
					id: `album${i}`,
					name: `Album ${i}`,
					songCount: 10,
					releasedAt: Date.now(),
					payout: 100000,
					variantCount: 1,
					isRerelease: false
				});
			}

			engine.start();
			vi.advanceTimersByTime(100);
			engine.stop();

			expect(gameState.phase).toBe(3);
		});

		it('should unlock tours system in Phase 3', () => {
			gameState.money = 100000;
			gameState.fans = 100_000;
			gameState.unlockedSystems.physicalAlbums = true;

			// Add 10 albums
			for (let i = 0; i < 10; i++) {
				gameState.physicalAlbums.push({
					id: `album${i}`,
					name: `Album ${i}`,
					songCount: 10,
					releasedAt: Date.now(),
					payout: 100000,
					variantCount: 1,
					isRerelease: false
				});
			}

			// Purchase upgrades to unlock tours (tier3_advanced)
			gameState.upgrades = {
				tier1_basic: { purchasedAt: Date.now(), tier: 1 },
				tier1_improved: { purchasedAt: Date.now(), tier: 1 },
				tier1_advanced: { purchasedAt: Date.now(), tier: 1 },
				tier2_basic: { purchasedAt: Date.now(), tier: 2 },
				tier2_improved: { purchasedAt: Date.now(), tier: 2 },
				tier2_advanced: { purchasedAt: Date.now(), tier: 2 },
				tier3_basic: { purchasedAt: Date.now(), tier: 3 },
				tier3_improved: { purchasedAt: Date.now(), tier: 3 },
				tier3_advanced: { purchasedAt: Date.now(), tier: 3 }
			};

			engine.start();
			vi.advanceTimersByTime(100);
			engine.stop();

			expect(gameState.unlockedSystems.tours).toBe(true);
		});

		it('should not unlock Phase 3 without sufficient albums', () => {
			gameState.fans = 1_000_000;
			gameState.techTier = 3;

			// Only 5 albums (need 10)
			for (let i = 0; i < 5; i++) {
				gameState.physicalAlbums.push({
					id: `album${i}`,
					name: `Album ${i}`,
					songCount: 10,
					releasedAt: Date.now(),
					payout: 100000,
					variantCount: 1,
					isRerelease: false
				});
			}

			engine.start();
			vi.advanceTimersByTime(100);
			engine.stop();

			expect(gameState.phase).toBe(1);
		});
	});

	describe('Phase 4: Platform Ownership Phase', () => {
		it('should unlock Phase 4 with sufficient progress', () => {
			// First advance to Phase 3
			gameState.phase = 3;

			// Meet Phase 4 requirements
			gameState.fans = 10_000_000;
			gameState.techTier = 6;
			gameState.unlockedSystems.tours = true;

			// Add 25 tours
			for (let i = 0; i < 25; i++) {
				gameState.tours.push({
					id: `tour${i}`,
					name: `Tour ${i}`,
					startedAt: Date.now() - 200000,
					completedAt: Date.now() - 10000, // Completed
					incomePerSecond: 1000,
					usesScarcity: false
				});
			}

			engine.start();
			vi.advanceTimersByTime(100);
			engine.stop();

			expect(gameState.phase).toBe(4);
		});

		it('should unlock platform ownership system in Phase 4', () => {
			gameState.money = 100_000_000;
			gameState.fans = 2_000_000;
			gameState.unlockedSystems.tours = true;

			// Add 60 tours (completed)
			for (let i = 0; i < 60; i++) {
				gameState.tours.push({
					id: `tour${i}`,
					name: `Tour ${i}`,
					startedAt: Date.now() - 200000,
					completedAt: Date.now() - 10000,
					incomePerSecond: 1000,
					usesScarcity: false
				});
			}

			// Have tier6_basic upgrade
			gameState.upgrades = {
				tier6_basic: { purchasedAt: Date.now(), tier: 6 }
			};

			engine.start();
			vi.advanceTimersByTime(100);
			engine.stop();

			expect(gameState.unlockedSystems.platformOwnership).toBe(true);
		});

		it('should not unlock Phase 4 without sufficient tours', () => {
			gameState.fans = 10_000_000;
			gameState.techTier = 6;

			// Only 10 tours (need 25)
			for (let i = 0; i < 10; i++) {
				gameState.tours.push({
					id: `tour${i}`,
					name: `Tour ${i}`,
					startedAt: Date.now() - 200000,
					completedAt: Date.now() - 10000,
					incomePerSecond: 1000,
					usesScarcity: false
				});
			}

			engine.start();
			vi.advanceTimersByTime(100);
			engine.stop();

			expect(gameState.phase).toBe(1);
		});
	});

	describe('Phase 5: Total Automation Phase', () => {
		it('should unlock Phase 5 with sufficient progress', () => {
			// First advance to Phase 4
			gameState.phase = 4;

			// Meet Phase 5 requirements
			gameState.fans = 50_000_000;
			gameState.techTier = 7;
			gameState.unlockedSystems.platformOwnership = true;

			// Add 3 platforms
			for (let i = 0; i < 3; i++) {
				gameState.ownedPlatforms.push({
					id: `platform${i}`,
					type: 'streaming',
					name: `Platform ${i}`,
					cost: 10000000,
					acquiredAt: Date.now(),
					incomePerSecond: 10000,
					controlContribution: 15
				});
			}

			engine.start();
			vi.advanceTimersByTime(100);
			engine.stop();

			expect(gameState.phase).toBe(5);
		});

		it('should not unlock Phase 5 without sufficient platforms', () => {
			gameState.fans = 50_000_000;
			gameState.techTier = 7;

			// Only 2 platforms (need 3)
			for (let i = 0; i < 2; i++) {
				gameState.ownedPlatforms.push({
					id: `platform${i}`,
					type: 'streaming',
					name: `Platform ${i}`,
					cost: 10000000,
					acquiredAt: Date.now(),
					incomePerSecond: 10000,
					controlContribution: 15
				});
			}

			engine.start();
			vi.advanceTimersByTime(100);
			engine.stop();

			expect(gameState.phase).toBe(1);
		});

		it('should not unlock Phase 5 without tech tier 7', () => {
			gameState.fans = 50_000_000;
			gameState.techTier = 6; // Below tier 7 requirement

			for (let i = 0; i < 3; i++) {
				gameState.ownedPlatforms.push({
					id: `platform${i}`,
					type: 'streaming',
					name: `Platform ${i}`,
					cost: 10000000,
					acquiredAt: Date.now(),
					incomePerSecond: 10000,
					controlContribution: 15
				});
			}

			engine.start();
			vi.advanceTimersByTime(100);
			engine.stop();

			expect(gameState.phase).toBe(1);
		});
	});

	describe('Cross-Phase System Interactions', () => {
		it('should allow all systems to work together in late game', () => {
			// Set up Phase 5 state with all systems active
			gameState.phase = 5;
			gameState.fans = 50_000_000;
			gameState.techTier = 7;
			gameState.unlockedSystems = {
				trendResearch: true,
				physicalAlbums: true,
				tours: true,
				platformOwnership: true,
				monopoly: true,
				prestige: true,
				gpu: true
			};

			// Songs
			gameState.songs = [
				{
					id: 'song1',
					name: 'Song',
					genre: 'pop',
					createdAt: Date.now(),
					incomePerSecond: 1000,
					fanGenerationRate: 100,
					isTrending: false
				}
			];

			// Legacy artists (from prestige)
			gameState.legacyArtists = [
				{
					name: 'Legacy Artist',
					peakFans: 10000000,
					songs: 100,
					incomeRate: 500,
					createdAt: Date.now() - 100000,
					prestigedAt: Date.now() - 50000
				}
			];

			// Active tour
			gameState.tours = [
				{
					id: 'tour1',
					name: 'Tour',
					startedAt: Date.now(),
					completedAt: null,
					incomePerSecond: 5000,
					usesScarcity: false
				}
			];

			// Owned platform
			gameState.ownedPlatforms = [
				{
					id: 'platform1',
					type: 'streaming',
					name: 'Platform',
					cost: 10000000,
					acquiredAt: Date.now(),
					incomePerSecond: 10000,
					controlContribution: 15
				}
			];

			const initialMoney = gameState.money;

			engine.start();
			vi.advanceTimersByTime(1000); // 1 second
			engine.stop();

			// Should have earned from all sources (within 500)
			// Total: 1000 (songs) + 500 (legacy) + 5000 (tour) + 10000 (platform) = 16500/sec
			expect(gameState.money).toBeGreaterThanOrEqual(initialMoney + 16000);
			expect(gameState.money).toBeLessThanOrEqual(initialMoney + 17000);
		});

		it('should maintain phase progress through prestige', () => {
			gameState.phase = 4;
			gameState.unlockedSystems.prestige = true;
			gameState.unlockedSystems.platformOwnership = true;

			// Add some songs so prestige has income to convert
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

			const phaseBefore = gameState.phase;

			// Prestige shouldn't reset phase
			performPrestige(gameState);

			expect(gameState.phase).toBe(phaseBefore);
		});
	});

	describe('Phase Unlock Order', () => {
		it('should unlock phases in correct order', () => {
			const phases: Phase[] = [];

			// Simulate Phase 2 unlock
			gameState.fans = 100_000;
			gameState.money = 100_000;
			gameState.techTier = 2;
			for (let i = 0; i < 100; i++) {
				gameState.songs.push({
					id: `song${i}`,
					name: `Song ${i}`,
					genre: 'pop',
					createdAt: Date.now(),
					incomePerSecond: 2,
					fanGenerationRate: 20,
					isTrending: false
				});
			}

			engine.start();
			vi.advanceTimersByTime(100);
			engine.stop();

			phases.push(gameState.phase);

			// Simulate Phase 3 unlock
			gameState.fans = 1_000_000;
			gameState.techTier = 3;
			for (let i = 0; i < 10; i++) {
				gameState.physicalAlbums.push({
					id: `album${i}`,
					name: `Album ${i}`,
					songCount: 10,
					releasedAt: Date.now(),
					payout: 100000,
					variantCount: 1,
					isRerelease: false
				});
			}

			engine.start();
			vi.advanceTimersByTime(100);
			engine.stop();

			phases.push(gameState.phase);

			// Should have unlocked Phase 2, then Phase 3
			expect(phases).toEqual([2, 3]);
		});

		it('should not skip phases', () => {
			// Try to meet Phase 3 requirements without meeting Phase 2
			gameState.phase = 1;
			gameState.fans = 1_000_000; // Phase 3 requirement
			gameState.techTier = 3;
			gameState.unlockedSystems.physicalAlbums = true;

			// Add albums for Phase 3
			for (let i = 0; i < 10; i++) {
				gameState.physicalAlbums.push({
					id: `album${i}`,
					name: `Album ${i}`,
					songCount: 10,
					releasedAt: Date.now(),
					payout: 100000,
					variantCount: 1,
					isRerelease: false
				});
			}

			// But don't meet Phase 2 song requirement (need 100 songs)
			gameState.songs = [];

			engine.start();
			vi.advanceTimersByTime(100);
			engine.stop();

			// Should still be in Phase 1 (can't skip to Phase 3)
			expect(gameState.phase).toBe(1);
		});
	});

	describe('Complete Progression Path', () => {
		it('should demonstrate full progression from Phase 1 to Phase 5', () => {
			const progressionLog: Phase[] = [];

			// Start in Phase 1
			expect(gameState.phase).toBe(1);
			progressionLog.push(gameState.phase);

			// Progress to Phase 2
			gameState.fans = 100_000;
			gameState.money = 100_000;
			gameState.techTier = 2;
			for (let i = 0; i < 100; i++) {
				gameState.songs.push({
					id: `song${i}`,
					name: `Song ${i}`,
					genre: 'pop',
					createdAt: Date.now(),
					incomePerSecond: 2,
					fanGenerationRate: 20,
					isTrending: false
				});
			}
			engine.start();
			vi.advanceTimersByTime(100);
			engine.stop();
			progressionLog.push(gameState.phase);

			// Progress to Phase 3
			gameState.fans = 1_000_000;
			gameState.techTier = 3;
			for (let i = 0; i < 10; i++) {
				gameState.physicalAlbums.push({
					id: `album${i}`,
					name: `Album ${i}`,
					songCount: 10,
					releasedAt: Date.now(),
					payout: 100000,
					variantCount: 1,
					isRerelease: false
				});
			}
			engine.start();
			vi.advanceTimersByTime(100);
			engine.stop();
			progressionLog.push(gameState.phase);

			// Progress to Phase 4
			gameState.fans = 10_000_000;
			gameState.techTier = 6;
			gameState.unlockedSystems.tours = true;
			for (let i = 0; i < 25; i++) {
				gameState.tours.push({
					id: `tour${i}`,
					name: `Tour ${i}`,
					startedAt: Date.now() - 200000,
					completedAt: Date.now() - 10000,
					incomePerSecond: 1000,
					usesScarcity: false
				});
			}
			engine.start();
			vi.advanceTimersByTime(100);
			engine.stop();
			progressionLog.push(gameState.phase);

			// Progress to Phase 5
			gameState.fans = 50_000_000;
			gameState.techTier = 7;
			gameState.unlockedSystems.platformOwnership = true;
			for (let i = 0; i < 3; i++) {
				gameState.ownedPlatforms.push({
					id: `platform${i}`,
					type: 'streaming',
					name: `Platform ${i}`,
					cost: 10000000,
					acquiredAt: Date.now(),
					incomePerSecond: 10000,
					controlContribution: 15
				});
			}
			engine.start();
			vi.advanceTimersByTime(100);
			engine.stop();
			progressionLog.push(gameState.phase);

			// Should have progressed through all phases in order
			expect(progressionLog).toEqual([1, 2, 3, 4, 5]);
		});
	});
});
