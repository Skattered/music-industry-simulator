/**
 * Game Loop Integration Tests
 *
 * Tests full game loop with multiple systems interacting:
 * - Song generation → income → fans → upgrades → phase progression
 * - Multiple systems running together (songs, legacy artists, tours, platforms)
 * - Boost multipliers affecting all income sources
 * - Cross-system interactions and dependencies
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GameEngine } from '../game/engine';
import type { GameState } from '../game/types';
import { GAME_VERSION, INITIAL_UNLOCKED_SYSTEMS } from '../game/config';
import { queueSongs } from '../systems/songs';
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

describe('Game Loop Integration', () => {
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

	describe('Basic Song → Income → Fan Loop', () => {
		it('should generate income and fans from completed songs', () => {
			// Set up initial state
			gameState.money = 100;

			// Queue a song
			queueSongs(gameState, 1);
			expect(gameState.songQueue.length).toBe(1);
			expect(gameState.money).toBeLessThan(100);

			const initialMoney = gameState.money;
			const initialFans = gameState.fans;

			// Start engine and complete song generation
			engine.start();
			vi.advanceTimersByTime(35000); // Wait for song to complete
			engine.stop();

			// Song should be complete and generating income/fans
			expect(gameState.songQueue.length).toBe(0);
			expect(gameState.songs.length).toBe(1);
			expect(gameState.money).toBeGreaterThan(initialMoney);
			expect(gameState.fans).toBeGreaterThan(initialFans);
		});

		it('should accumulate income and fans over time', () => {
			// Create a completed song
			gameState.songs = [
				{
					id: 'song1',
					name: 'Test Song',
					genre: 'pop',
					createdAt: Date.now(),
					incomePerSecond: 100,
					fanGenerationRate: 10,
					isTrending: false
				}
			];

			const initialMoney = gameState.money;
			const initialFans = gameState.fans;

			engine.start();
			vi.advanceTimersByTime(5000); // 5 seconds
			engine.stop();

			// Should have earned ~500 money and ~50 fans
			expect(gameState.money).toBeCloseTo(initialMoney + 500, 50);
			expect(gameState.fans).toBeCloseTo(initialFans + 50, 10);
		});

		it('should scale with multiple songs', () => {
			// Create 3 completed songs
			for (let i = 0; i < 3; i++) {
				gameState.songs.push({
					id: `song${i}`,
					name: `Song ${i}`,
					genre: 'pop',
					createdAt: Date.now(),
					incomePerSecond: 100,
					fanGenerationRate: 10,
					isTrending: false
				});
			}

			const initialMoney = gameState.money;

			engine.start();
			vi.advanceTimersByTime(1000); // 1 second
			engine.stop();

			// Should have earned 300 money (3 songs * 100/sec)
			expect(gameState.money).toBeCloseTo(initialMoney + 300, 30);
		});
	});

	describe('Multi-System Income Integration', () => {
		it('should combine income from songs, legacy artists, tours, and platforms', () => {
			const now = Date.now();

			// Set up all income sources
			gameState.songs = [
				{
					id: 'song1',
					name: 'Song',
					genre: 'pop',
					createdAt: now,
					incomePerSecond: 100,
					fanGenerationRate: 10,
					isTrending: false
				}
			];

			gameState.legacyArtists = [
				{
					name: 'Legacy Artist',
					peakFans: 1000000,
					songs: 50,
					incomeRate: 50,
					createdAt: now - 100000,
					prestigedAt: now - 50000
				}
			];

			gameState.tours = [
				{
					id: 'tour1',
					name: 'Active Tour',
					startedAt: now,
					completedAt: null,
					incomePerSecond: 500,
					usesScarcity: false
				}
			];

			gameState.ownedPlatforms = [
				{
					id: 'platform1',
					type: 'streaming',
					name: 'Platform',
					cost: 10000000,
					acquiredAt: now,
					incomePerSecond: 1000,
					controlContribution: 15
				}
			];

			const initialMoney = gameState.money;

			engine.start();
			vi.advanceTimersByTime(1000); // 1 second
			engine.stop();

			// Total income: 100 + 50 + 500 + 1000 = 1650/sec
			expect(gameState.money).toBeCloseTo(initialMoney + 1650, 50);
		});

		it('should apply boost multipliers to all income sources', () => {
			const now = Date.now();

			gameState.songs = [
				{
					id: 'song1',
					name: 'Song',
					genre: 'pop',
					createdAt: now,
					incomePerSecond: 100,
					fanGenerationRate: 10,
					isTrending: false
				}
			];

			gameState.legacyArtists = [
				{
					name: 'Legacy Artist',
					peakFans: 1000000,
					songs: 50,
					incomeRate: 50,
					createdAt: now - 100000,
					prestigedAt: now - 50000
				}
			];

			// Active boost with 3x income multiplier
			gameState.activeBoosts = [
				{
					id: 'boost1',
					type: 'bot_streams',
					name: 'Bot Streams',
					activatedAt: now,
					duration: 30000,
					incomeMultiplier: 3.0,
					fanMultiplier: 1.5
				}
			];

			const initialMoney = gameState.money;

			engine.start();
			vi.advanceTimersByTime(1000); // 1 second
			engine.stop();

			// Income: (100 + 50) * 3.0 = 450/sec
			expect(gameState.money).toBeCloseTo(initialMoney + 450, 50);
		});

		it('should apply experience multiplier from prestige', () => {
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

			gameState.prestigeCount = 2;
			gameState.experienceMultiplier = 1.3; // 30% bonus

			const initialMoney = gameState.money;

			engine.start();
			vi.advanceTimersByTime(1000); // 1 second
			engine.stop();

			// Income: 100 * 1.3 = 130/sec
			expect(gameState.money).toBeCloseTo(initialMoney + 130, 20);
		});

		it('should apply both boost and experience multipliers', () => {
			const now = Date.now();

			gameState.songs = [
				{
					id: 'song1',
					name: 'Song',
					genre: 'pop',
					createdAt: now,
					incomePerSecond: 100,
					fanGenerationRate: 10,
					isTrending: false
				}
			];

			gameState.activeBoosts = [
				{
					id: 'boost1',
					type: 'bot_streams',
					name: 'Bot Streams',
					activatedAt: now,
					duration: 30000,
					incomeMultiplier: 2.0,
					fanMultiplier: 1.5
				}
			];

			gameState.experienceMultiplier = 1.5; // 50% bonus

			const initialMoney = gameState.money;

			engine.start();
			vi.advanceTimersByTime(1000); // 1 second
			engine.stop();

			// Income: 100 * 2.0 (boost) * 1.5 (experience) = 300/sec
			expect(gameState.money).toBeCloseTo(initialMoney + 300, 30);
		});
	});

	describe('Song Queue Processing', () => {
		it('should process multiple queued songs sequentially', () => {
			gameState.money = 1000;
			gameState.songGenerationSpeed = 5000; // 5 seconds per song

			// Queue 3 songs
			queueSongs(gameState, 3);
			expect(gameState.songQueue.length).toBe(3);

			engine.start();

			// After 5 seconds - first song should complete
			vi.advanceTimersByTime(5000);
			expect(gameState.songQueue.length).toBe(2);
			expect(gameState.songs.length).toBe(1);

			// After 10 seconds total - second song should complete
			vi.advanceTimersByTime(5000);
			expect(gameState.songQueue.length).toBe(1);
			expect(gameState.songs.length).toBe(2);

			// After 15 seconds total - third song should complete
			vi.advanceTimersByTime(5000);
			expect(gameState.songQueue.length).toBe(0);
			expect(gameState.songs.length).toBe(3);

			engine.stop();
		});

		it('should handle song generation while earning income', () => {
			gameState.money = 1000;
			gameState.songGenerationSpeed = 10000; // 10 seconds per song

			// Add an existing song that generates income
			gameState.songs = [
				{
					id: 'existing',
					name: 'Existing Song',
					genre: 'pop',
					createdAt: Date.now(),
					incomePerSecond: 100,
					fanGenerationRate: 10,
					isTrending: false
				}
			];

			const initialMoney = gameState.money;

			// Queue a new song
			queueSongs(gameState, 1);

			engine.start();

			// Run for 10 seconds (complete song generation)
			vi.advanceTimersByTime(10000);

			engine.stop();

			// Should have earned income from existing song
			expect(gameState.money).toBeGreaterThan(initialMoney);
			// New song should be complete
			expect(gameState.songs.length).toBe(2);
		});
	});

	describe('Boost Expiration', () => {
		it('should remove expired boosts', () => {
			const now = Date.now();

			gameState.activeBoosts = [
				{
					id: 'boost1',
					type: 'bot_streams',
					name: 'Bot Streams',
					activatedAt: now - 25000, // Started 25 seconds ago
					duration: 30000, // Lasts 30 seconds
					incomeMultiplier: 3.0,
					fanMultiplier: 1.5
				}
			];

			engine.start();

			// After 6 seconds (total 31 seconds), boost should expire
			vi.advanceTimersByTime(6000);

			expect(gameState.activeBoosts.length).toBe(0);

			engine.stop();
		});

		it('should apply multipliers while boost is active, then stop', () => {
			const now = Date.now();

			gameState.songs = [
				{
					id: 'song1',
					name: 'Song',
					genre: 'pop',
					createdAt: now,
					incomePerSecond: 100,
					fanGenerationRate: 10,
					isTrending: false
				}
			];

			gameState.activeBoosts = [
				{
					id: 'boost1',
					type: 'bot_streams',
					name: 'Bot Streams',
					activatedAt: now,
					duration: 2000, // 2 seconds
					incomeMultiplier: 3.0,
					fanMultiplier: 1.5
				}
			];

			const initialMoney = gameState.money;

			engine.start();

			// First 2 seconds with boost (within 60)
			vi.advanceTimersByTime(2000);
			const moneyAfterBoost = gameState.money;
			expect(moneyAfterBoost).toBeGreaterThanOrEqual(initialMoney + 540);
			expect(moneyAfterBoost).toBeLessThanOrEqual(initialMoney + 660); // 100 * 3.0 * 2 seconds

			// Next 2 seconds without boost (within 60)
			vi.advanceTimersByTime(2000);
			const moneyAfterExpiration = gameState.money;
			expect(moneyAfterExpiration).toBeGreaterThanOrEqual(moneyAfterBoost + 140);
			expect(moneyAfterExpiration).toBeLessThanOrEqual(moneyAfterBoost + 260); // 100 * 2 seconds

			engine.stop();
		});
	});

	describe('Tour Processing', () => {
		it('should mark tours as completed after duration', () => {
			const now = Date.now();

			gameState.tours = [
				{
					id: 'tour1',
					name: 'Test Tour',
					startedAt: now - 110000, // Started 110 seconds ago
					completedAt: null,
					incomePerSecond: 1000,
					usesScarcity: false
				}
			];

			engine.start();

			// Advance 11 seconds (total 121 seconds, tour duration is 120 seconds)
			vi.advanceTimersByTime(11000);

			expect(gameState.tours[0].completedAt).not.toBeNull();

			engine.stop();
		});

		it('should stop generating income when tour completes', () => {
			const now = Date.now();

			gameState.tours = [
				{
					id: 'tour1',
					name: 'Test Tour',
					startedAt: now,
					completedAt: null,
					incomePerSecond: 1000,
					usesScarcity: false
				}
			];

			const initialMoney = gameState.money;

			engine.start();

			// Run for 5 seconds
			vi.advanceTimersByTime(5000);
			const moneyMidTour = gameState.money;

			// Should have earned ~5000 (within 500)
			expect(moneyMidTour).toBeGreaterThanOrEqual(initialMoney + 4500);
			expect(moneyMidTour).toBeLessThanOrEqual(initialMoney + 5500);

			// Complete the tour manually
			gameState.tours[0].completedAt = Date.now();

			// Run for 5 more seconds
			vi.advanceTimersByTime(5000);
			const moneyAfterTour = gameState.money;

			// Should not have earned additional money from tour
			expect(moneyAfterTour).toBeCloseTo(moneyMidTour, 100);

			engine.stop();
		});
	});

	describe('Cross-Promotion from Legacy Artists', () => {
		it('should transfer fans from legacy artists to current artist', () => {
			gameState.legacyArtists = [
				{
					name: 'Legacy Artist',
					peakFans: 10000000, // 10M peak fans
					songs: 100,
					incomeRate: 1000,
					createdAt: Date.now() - 100000,
					prestigedAt: Date.now() - 50000
				}
			];

			const initialFans = gameState.fans;
			const initialArtistFans = gameState.currentArtist.fans;

			engine.start();
			vi.advanceTimersByTime(5000); // 5 seconds
			engine.stop();

			// Should have gained fans from cross-promotion
			expect(gameState.fans).toBeGreaterThan(initialFans);
			expect(gameState.currentArtist.fans).toBeGreaterThan(initialArtistFans);
			expect(gameState.currentArtist.peakFans).toBeGreaterThanOrEqual(
				gameState.currentArtist.fans
			);
		});
	});

	describe('Full Game Progression Simulation', () => {
		it('should simulate early game progression (tier 1 → tier 2)', () => {
			gameState.money = 100;
			gameState.upgrades = {}; // Start with no upgrades

			engine.start();

			// Generate some initial income
			vi.advanceTimersByTime(10000);

			// Player can now afford and purchase first upgrade
			if (gameState.money >= 15) {
				purchaseTechUpgrade(gameState, 'tier1_basic');
				expect(gameState.upgrades['tier1_basic']).toBeDefined();
			}

			// Continue playing
			vi.advanceTimersByTime(20000);

			// Songs should now generate faster and cheaper
			expect(gameState.songGenerationSpeed).toBeLessThan(20000);

			engine.stop();
		});

		it('should handle rapid progression with multiple systems', () => {
			// Set up mid-game state
			gameState.money = 1_000_000;
			gameState.fans = 500_000;
			gameState.unlockedSystems.physicalAlbums = true;
			gameState.unlockedSystems.tours = true;
			gameState.unlockedSystems.prestige = true;

			// Add some songs
			for (let i = 0; i < 10; i++) {
				gameState.songs.push({
					id: `song${i}`,
					name: `Song ${i}`,
					genre: 'pop',
					createdAt: Date.now(),
					incomePerSecond: 100,
					fanGenerationRate: 20,
					isTrending: false
				});
			}
			gameState.currentArtist.songs = 10; // Match the songs added

			// Add some albums (auto-released)
			for (let i = 0; i < 5; i++) {
				gameState.physicalAlbums.push({
					id: `album${i}`,
					name: `Album ${i}`,
					songCount: 10,
					releasedAt: Date.now() - 10000,
					payout: 100000,
					variantCount: 1,
					isRerelease: false
				});
			}

			const initialMoney = gameState.money;
			const initialFans = gameState.fans;

			engine.start();
			vi.advanceTimersByTime(30000); // 30 seconds of gameplay
			engine.stop();

			// Should have significant progress
			expect(gameState.money).toBeGreaterThan(initialMoney);
			expect(gameState.fans).toBeGreaterThan(initialFans);
			expect(gameState.currentArtist.songs).toBeGreaterThan(0);
		});
	});

	describe('Platform Industry Control', () => {
		it('should update industry control based on owned platforms', () => {
			const now = Date.now();

			gameState.ownedPlatforms = [
				{
					id: 'streaming',
					type: 'streaming',
					name: 'Streaming Service',
					cost: 10000000,
					acquiredAt: now,
					incomePerSecond: 10000,
					controlContribution: 15
				},
				{
					id: 'ticketing',
					type: 'ticketing',
					name: 'Ticketing Platform',
					cost: 25000000,
					acquiredAt: now,
					incomePerSecond: 25000,
					controlContribution: 20
				}
			];

			engine.start();
			vi.advanceTimersByTime(100); // Single tick
			engine.stop();

			// Industry control should be sum of contributions
			expect(gameState.industryControl).toBe(35);
		});
	});

	describe('Memory and Performance', () => {
		it('should handle long running sessions without memory leaks', () => {
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

			const initialArrayLengths = {
				songs: gameState.songs.length,
				songQueue: gameState.songQueue.length,
				activeBoosts: gameState.activeBoosts.length,
				tours: gameState.tours.length,
				legacyArtists: gameState.legacyArtists.length
			};

			engine.start();

			// Simulate 10 minutes of gameplay (6000 ticks)
			vi.advanceTimersByTime(600000);

			engine.stop();

			// Arrays should not have grown unexpectedly
			expect(gameState.songs.length).toBeLessThanOrEqual(initialArrayLengths.songs + 100);
			expect(gameState.songQueue.length).toBe(0);
			expect(gameState.activeBoosts.length).toBe(0);
		});

		it('should maintain consistent tick rate under load', () => {
			// Create a complex state
			for (let i = 0; i < 100; i++) {
				gameState.songs.push({
					id: `song${i}`,
					name: `Song ${i}`,
					genre: 'pop',
					createdAt: Date.now(),
					incomePerSecond: 10,
					fanGenerationRate: 1,
					isTrending: false
				});
			}

			const tickCallback = vi.fn();
			engine.onTick(tickCallback);

			engine.start();

			// Run for 10 seconds
			vi.advanceTimersByTime(10000);

			engine.stop();

			// Should have executed 100 ticks (10 TPS)
			expect(tickCallback).toHaveBeenCalledTimes(100);
		});
	});
});
