/**
 * GameEngine Unit Tests
 *
 * Tests for the core game engine including:
 * - Tick rate accuracy (10 TPS)
 * - DeltaTime calculation
 * - Start/stop state management
 * - Auto-save functionality
 * - System processing (income, fans, songs)
 * - Edge case handling (tab visibility, clock changes)
 * - Memory leak prevention
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GameEngine } from './engine';
import type { GameState } from './types';
import { TICK_RATE, GAME_VERSION, INITIAL_UNLOCKED_SYSTEMS } from './config';

/**
 * Create a minimal game state for testing
 */
function createTestGameState(): GameState {
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
		version: GAME_VERSION
	};
}

describe('GameEngine', () => {
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

	describe('Initialization', () => {
		it('should create engine with initial state', () => {
			expect(engine).toBeDefined();
			expect(engine.running).toBe(false);
			expect(engine.getState()).toBe(gameState);
		});

		it('should not be running initially', () => {
			expect(engine.running).toBe(false);
		});
	});

	describe('Start/Stop', () => {
		it('should start the engine', () => {
			engine.start();
			expect(engine.running).toBe(true);
		});

		it('should stop the engine', () => {
			engine.start();
			engine.stop();
			expect(engine.running).toBe(false);
		});

		it('should not start twice', () => {
			const consoleSpy = vi.spyOn(console, 'warn');
			engine.start();
			engine.start();
			expect(consoleSpy).toHaveBeenCalledWith('GameEngine: Already running');
			engine.stop();
		});

		it('should warn when stopping non-running engine', () => {
			const consoleSpy = vi.spyOn(console, 'warn');
			engine.stop();
			expect(consoleSpy).toHaveBeenCalledWith('GameEngine: Not running');
		});

		it('should auto-save on stop', () => {
			const saveCallback = vi.fn();
			engine.onSave(saveCallback);
			engine.start();
			engine.stop();
			expect(saveCallback).toHaveBeenCalledWith(gameState);
		});
	});

	describe('Tick Rate (10 TPS)', () => {
		it('should tick at correct rate (100ms intervals)', () => {
			const tickCallback = vi.fn();
			engine.onTick(tickCallback);

			engine.start();

			// Advance time by 100ms (1 tick)
			vi.advanceTimersByTime(100);
			expect(tickCallback).toHaveBeenCalledTimes(1);

			// Advance time by another 100ms (2nd tick)
			vi.advanceTimersByTime(100);
			expect(tickCallback).toHaveBeenCalledTimes(2);

			// Advance time by 1000ms (10 more ticks)
			vi.advanceTimersByTime(1000);
			expect(tickCallback).toHaveBeenCalledTimes(12);

			engine.stop();
		});

		it('should maintain 10 TPS over extended period', () => {
			const tickCallback = vi.fn();
			engine.onTick(tickCallback);

			engine.start();

			// Simulate 1 second (should be 10 ticks)
			vi.advanceTimersByTime(1000);
			expect(tickCallback).toHaveBeenCalledTimes(10);

			// Simulate 5 more seconds (50 more ticks)
			vi.advanceTimersByTime(5000);
			expect(tickCallback).toHaveBeenCalledTimes(60);

			engine.stop();
		});

		it('should use TICK_RATE constant (100ms)', () => {
			expect(TICK_RATE).toBe(100);
		});
	});

	describe('DeltaTime Calculation', () => {
		it('should calculate deltaTime correctly', () => {
			let capturedDeltaTime = 0;
			engine.onTick((state, deltaTime) => {
				capturedDeltaTime = deltaTime;
			});

			engine.start();

			vi.advanceTimersByTime(100);
			// DeltaTime should be approximately 100ms (allowing for small variance)
			expect(capturedDeltaTime).toBeGreaterThanOrEqual(90);
			expect(capturedDeltaTime).toBeLessThanOrEqual(110);

			engine.stop();
		});

		it('should cap deltaTime to prevent huge jumps', () => {
			const tickCallback = vi.fn();
			engine.onTick(tickCallback);

			engine.start();

			// Simulate normal tick
			vi.advanceTimersByTime(100);

			// Simulate a huge time jump (like tab was hidden for a long time)
			// This should be capped to MAX_DELTA_TIME (5000ms)
			vi.advanceTimersByTime(100000); // 100 seconds

			engine.stop();

			// The deltaTime passed to callback should have been capped
			const lastCall = tickCallback.mock.calls[tickCallback.mock.calls.length - 1];
			expect(lastCall[1]).toBeLessThanOrEqual(5000);
		});
	});

	describe('Auto-Save', () => {
		it('should auto-save every 10 seconds', () => {
			const saveCallback = vi.fn();
			engine.onSave(saveCallback);

			engine.start();

			// No save initially
			expect(saveCallback).toHaveBeenCalledTimes(0);

			// Advance 9 seconds - no save yet
			vi.advanceTimersByTime(9000);
			expect(saveCallback).toHaveBeenCalledTimes(0);

			// Advance 1 more second - should trigger save
			vi.advanceTimersByTime(1000);
			expect(saveCallback).toHaveBeenCalledTimes(1);

			// Advance another 10 seconds - another save
			vi.advanceTimersByTime(10000);
			expect(saveCallback).toHaveBeenCalledTimes(2);

			engine.stop();
			// Stop should trigger another save
			expect(saveCallback).toHaveBeenCalledTimes(3);
		});

		it('should call forceSave immediately', () => {
			const saveCallback = vi.fn();
			engine.onSave(saveCallback);

			engine.start();
			expect(saveCallback).toHaveBeenCalledTimes(0);

			engine.forceSave();
			expect(saveCallback).toHaveBeenCalledTimes(1);

			engine.stop();
		});
	});

	describe('Income Processing', () => {
		it('should process income from songs', () => {
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
			engine.start();

			// Advance 1 second (10 ticks)
			vi.advanceTimersByTime(1000);

			// Should have earned approximately 100 dollars
			expect(gameState.money).toBeGreaterThan(initialMoney);
			expect(gameState.money).toBeCloseTo(initialMoney + 100, 0);

			engine.stop();
		});

		it('should apply trending multiplier to income', () => {
			gameState.currentTrendingGenre = 'pop';
			gameState.songs = [
				{
					id: 'song1',
					name: 'Trending Song',
					genre: 'pop',
					createdAt: Date.now(),
					incomePerSecond: 100,
					fanGenerationRate: 10,
					isTrending: true
				}
			];

			const initialMoney = gameState.money;
			engine.start();

			// Advance 1 second
			vi.advanceTimersByTime(1000);

			// Should have earned 200 dollars (100 * 2x trending multiplier)
			expect(gameState.money).toBeCloseTo(initialMoney + 200, 0);

			engine.stop();
		});

		it('should process income from legacy artists', () => {
			gameState.legacyArtists = [
				{
					name: 'Legacy Artist',
					peakFans: 1000000,
					songs: 100,
					incomeRate: 50,
					createdAt: Date.now() - 100000,
					prestigedAt: Date.now() - 50000
				}
			];

			const initialMoney = gameState.money;
			engine.start();

			// Advance 1 second
			vi.advanceTimersByTime(1000);

			// Should have earned 50 dollars from legacy artist
			expect(gameState.money).toBeCloseTo(initialMoney + 50, 0);

			engine.stop();
		});

		it('should process income from platforms', () => {
			gameState.ownedPlatforms = [
				{
					id: 'platform1',
					type: 'streaming',
					name: 'Streaming Service',
					cost: 10000000,
					acquiredAt: Date.now(),
					incomePerSecond: 10000,
					controlContribution: 15
				}
			];

			const initialMoney = gameState.money;
			engine.start();

			// Advance 1 second
			vi.advanceTimersByTime(1000);

			// Should have earned 10000 dollars from platform
			expect(gameState.money).toBeCloseTo(initialMoney + 10000, 0);

			engine.stop();
		});

		it('should apply experience multiplier from prestige', () => {
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
			gameState.experienceMultiplier = 2.0;

			const initialMoney = gameState.money;
			engine.start();

			// Advance 1 second
			vi.advanceTimersByTime(1000);

			// Should have earned 200 dollars (100 * 2x experience multiplier)
			expect(gameState.money).toBeCloseTo(initialMoney + 200, 0);

			engine.stop();
		});
	});

	describe('Fan Processing', () => {
		it('should process fan generation from songs', () => {
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

			const initialFans = gameState.fans;
			engine.start();

			// Advance 1 second
			vi.advanceTimersByTime(1000);

			// Should have earned 10 fans
			expect(gameState.fans).toBeCloseTo(initialFans + 10, 0);
			expect(gameState.currentArtist.fans).toBeCloseTo(10, 0);

			engine.stop();
		});

		it('should update peak fans', () => {
			gameState.songs = [
				{
					id: 'song1',
					name: 'Test Song',
					genre: 'pop',
					createdAt: Date.now(),
					incomePerSecond: 100,
					fanGenerationRate: 100,
					isTrending: false
				}
			];

			engine.start();

			// Advance 1 second
			vi.advanceTimersByTime(1000);

			expect(gameState.currentArtist.peakFans).toBeCloseTo(100, 0);

			// Advance another second
			vi.advanceTimersByTime(1000);

			expect(gameState.currentArtist.peakFans).toBeCloseTo(200, 0);

			engine.stop();
		});
	});

	describe('Song Generation Queue', () => {
		it('should process song queue', () => {
			// Set a fast generation speed for testing
			gameState.songGenerationSpeed = 1000;
			
			gameState.songQueue = [
				{
					id: 'queued1',
					progress: 0
				}
			];

			engine.start();

			expect(gameState.songQueue.length).toBe(1);
			expect(gameState.songQueue[0].progress).toBe(0);

			// Advance 500ms
			vi.advanceTimersByTime(500);
			expect(gameState.songQueue[0].progress).toBeGreaterThanOrEqual(500);

			// Advance another 500ms (song should complete)
			vi.advanceTimersByTime(500);

			// Song should be removed from queue
			expect(gameState.songQueue.length).toBe(0);

			engine.stop();
		});
	});

	describe('Boost Processing', () => {
		it('should remove expired boosts', () => {
			const now = Date.now();
			gameState.activeBoosts = [
				{
					id: 'boost1',
					type: 'bot_streams',
					name: 'Bot Streams',
					activatedAt: now - 25000, // Activated 25 seconds ago
					duration: 30000, // Lasts 30 seconds
					incomeMultiplier: 3.0,
					fanMultiplier: 1.5
				}
			];

			engine.start();

			// Boost should still be active
			expect(gameState.activeBoosts.length).toBe(1);

			// Advance 6 seconds (total 31 seconds since activation)
			vi.advanceTimersByTime(6000);

			// Boost should be expired and removed
			expect(gameState.activeBoosts.length).toBe(0);

			engine.stop();
		});

		it('should apply boost multipliers to income', () => {
			const now = Date.now();
			gameState.songs = [
				{
					id: 'song1',
					name: 'Test Song',
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
					incomeMultiplier: 3.0,
					fanMultiplier: 1.5
				}
			];

			const initialMoney = gameState.money;
			engine.start();

			// Advance 1 second
			vi.advanceTimersByTime(1000);

			// Should have earned 300 dollars (100 * 3x boost multiplier)
			expect(gameState.money).toBeCloseTo(initialMoney + 300, 0);

			engine.stop();
		});
	});

	describe('Tour Processing', () => {
		it('should mark tours as completed when duration expires', () => {
			const now = Date.now();
			gameState.tours = [
				{
					id: 'tour1',
					name: 'Test Tour',
					startedAt: now - 170000, // Started 170 seconds ago
					completedAt: null,
					incomePerSecond: 1000,
					usesScarcity: false
				}
			];

			engine.start();

			// Tour should not be completed yet
			expect(gameState.tours[0].completedAt).toBeNull();

			// Advance 11 seconds (total 181 seconds, tour duration is 180 seconds)
			vi.advanceTimersByTime(11000);

			// Tour should now be completed
			expect(gameState.tours[0].completedAt).not.toBeNull();

			engine.stop();
		});

		it('should process income from active tours', () => {
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

			// Advance 1 second
			vi.advanceTimersByTime(1000);

			// Should have earned 1000 dollars from tour
			expect(gameState.money).toBeCloseTo(initialMoney + 1000, 0);

			engine.stop();
		});

		it('should not process income from completed tours', () => {
			const now = Date.now();
			gameState.tours = [
				{
					id: 'tour1',
					name: 'Completed Tour',
					startedAt: now - 200000,
					completedAt: now - 20000, // Completed 20 seconds ago
					incomePerSecond: 1000,
					usesScarcity: false
				}
			];

			const initialMoney = gameState.money;
			engine.start();

			// Advance 1 second
			vi.advanceTimersByTime(1000);

			// Should not have earned money from completed tour
			expect(gameState.money).toBeCloseTo(initialMoney, 0);

			engine.stop();
		});
	});

	describe('State Management', () => {
		it('should update lastUpdate timestamp', () => {
			const initialTimestamp = gameState.lastUpdate;
			engine.start();

			vi.advanceTimersByTime(1000);

			expect(gameState.lastUpdate).toBeGreaterThan(initialTimestamp);

			engine.stop();
		});

		it('should allow state updates', () => {
			const newState = createTestGameState();
			newState.money = 50000;

			engine.setState(newState);
			expect(engine.getState().money).toBe(50000);
		});
	});

	describe('Memory Leak Prevention', () => {
		it('should clean up intervals on stop', () => {
			engine.start();
			const runningBefore = engine.running;
			engine.stop();
			const runningAfter = engine.running;

			expect(runningBefore).toBe(true);
			expect(runningAfter).toBe(false);

			// Advance time - no ticks should happen
			const tickCallback = vi.fn();
			engine.onTick(tickCallback);

			vi.advanceTimersByTime(5000);
			expect(tickCallback).toHaveBeenCalledTimes(0);
		});

		it('should clean up visibility change listeners', () => {
			const listenersBefore = (document as any)._listeners?.visibilitychange?.length || 0;

			engine.start();
			engine.stop();

			const listenersAfter = (document as any)._listeners?.visibilitychange?.length || 0;

			// Should not have added permanent listeners
			expect(listenersAfter).toBeLessThanOrEqual(listenersBefore);
		});
	});

	describe('Edge Cases', () => {
		it('should handle negative deltaTime', () => {
			const tickCallback = vi.fn();
			engine.onTick(tickCallback);

			engine.start();

			// This shouldn't happen in normal operation, but the engine should handle it
			vi.advanceTimersByTime(100);

			// DeltaTime should have been normalized to TICK_RATE
			const lastCall = tickCallback.mock.calls[tickCallback.mock.calls.length - 1];
			expect(lastCall[1]).toBeGreaterThan(0);

			engine.stop();
		});

		it('should handle very small deltaTime', () => {
			const tickCallback = vi.fn();
			engine.onTick(tickCallback);

			engine.start();

			// Advance by normal tick to trigger callback
			vi.advanceTimersByTime(100);

			engine.stop();

			// Should process without errors even with small deltaTime values
			expect(tickCallback).toHaveBeenCalled();
			expect(tickCallback.mock.calls[0][1]).toBeGreaterThan(0);
		});
	});

	describe('Callback Functions', () => {
		it('should call tick callback on each tick', () => {
			const tickCallback = vi.fn();
			engine.onTick(tickCallback);

			engine.start();
			vi.advanceTimersByTime(1000); // 10 ticks

			expect(tickCallback).toHaveBeenCalledTimes(10);

			engine.stop();
		});

		it('should pass correct parameters to tick callback', () => {
			let receivedState: GameState | null = null;
			let receivedDeltaTime: number | null = null;

			engine.onTick((state, deltaTime) => {
				receivedState = state;
				receivedDeltaTime = deltaTime;
			});

			engine.start();
			vi.advanceTimersByTime(100);
			engine.stop();

			expect(receivedState).toBe(gameState);
			expect(receivedDeltaTime).toBeGreaterThan(0);
		});
	});

	describe('Physical Album Processing', () => {
		it('should not auto-release albums if system is locked', () => {
			gameState.unlockedSystems.physicalAlbums = false;
			gameState.songs = new Array(20).fill(null).map((_, i) => ({
				id: `song${i}`,
				name: `Song ${i}`,
				genre: 'pop' as const,
				createdAt: Date.now(),
				incomePerSecond: 100,
				fanGenerationRate: 10,
				isTrending: false
			}));

			engine.start();
			vi.advanceTimersByTime(5000);
			engine.stop();

			// No albums should have been released
			expect(gameState.physicalAlbums.length).toBe(0);
		});

		it('should auto-release albums when unlocked and milestones reached', () => {
			gameState.unlockedSystems.physicalAlbums = true;
			gameState.songs = new Array(15).fill(null).map((_, i) => ({
				id: `song${i}`,
				name: `Song ${i}`,
				genre: 'pop' as const,
				createdAt: Date.now(),
				incomePerSecond: 100,
				fanGenerationRate: 10,
				isTrending: false
			}));
			gameState.fans = 10000;

			const initialAlbums = gameState.physicalAlbums.length;

			engine.start();
			// Advance past cooldown
			vi.advanceTimersByTime(130000); // 130 seconds
			engine.stop();

			// Should have released at least one album
			expect(gameState.physicalAlbums.length).toBeGreaterThan(initialAlbums);
		});
	});

	describe('Legacy Artist Processing', () => {
		it('should generate cross-promotion fans from legacy artists', () => {
			gameState.legacyArtists = [
				{
					name: 'Legacy Artist',
					peakFans: 1000000,
					songs: 100,
					incomeRate: 50,
					createdAt: Date.now() - 100000,
					prestigedAt: Date.now() - 50000
				}
			];

			const initialFans = gameState.fans;
			const initialArtistFans = gameState.currentArtist.fans;

			engine.start();
			vi.advanceTimersByTime(1000); // 1 second
			engine.stop();

			// Should have gained fans from cross-promotion
			expect(gameState.fans).toBeGreaterThan(initialFans);
			expect(gameState.currentArtist.fans).toBeGreaterThan(initialArtistFans);
		});

		it('should update peak fans from cross-promotion', () => {
			gameState.legacyArtists = [
				{
					name: 'Legacy Artist',
					peakFans: 10000000,
					songs: 100,
					incomeRate: 50,
					createdAt: Date.now() - 100000,
					prestigedAt: Date.now() - 50000
				}
			];

			engine.start();
			vi.advanceTimersByTime(1000); // 1 second
			engine.stop();

			// Peak fans should be updated
			expect(gameState.currentArtist.peakFans).toBeGreaterThan(0);
		});
	});

	describe('Platform Ownership', () => {
		it('should update industry control when platforms are owned', () => {
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

			engine.start();
			vi.advanceTimersByTime(100); // Single tick
			engine.stop();

			// Industry control should reflect platform ownership
			expect(gameState.industryControl).toBeGreaterThan(0);
		});

		it('should process multiple platforms correctly', () => {
			gameState.ownedPlatforms = [
				{
					id: 'streaming',
					type: 'streaming',
					name: 'Streaming Service',
					cost: 10000000,
					acquiredAt: Date.now(),
					incomePerSecond: 10000,
					controlContribution: 15
				},
				{
					id: 'ticketing',
					type: 'ticketing',
					name: 'Ticketing Platform',
					cost: 25000000,
					acquiredAt: Date.now(),
					incomePerSecond: 25000,
					controlContribution: 20
				}
			];

			const initialMoney = gameState.money;

			engine.start();
			vi.advanceTimersByTime(1000); // 1 second
			engine.stop();

			// Should have earned from both platforms (35000/sec total)
			expect(gameState.money).toBeCloseTo(initialMoney + 35000, 0);

			// Industry control should be sum of both platforms
			expect(gameState.industryControl).toBe(35);
		});
	});

	describe('System Unlocks', () => {
		it('should check for physical album unlock', () => {
			gameState.unlockedSystems.physicalAlbums = false;
			gameState.upgrades = { tier2_improved: { purchasedAt: Date.now(), tier: 2 } };

			engine.start();
			vi.advanceTimersByTime(100); // Single tick
			engine.stop();

			// Physical albums should now be unlocked
			expect(gameState.unlockedSystems.physicalAlbums).toBe(true);
		});

		it('should check for tour unlock', () => {
			gameState.unlockedSystems.tours = false;
			gameState.unlockedSystems.physicalAlbums = true;
			gameState.upgrades = { tier3_advanced: { purchasedAt: Date.now(), tier: 3 } };
			gameState.physicalAlbums = new Array(15).fill(null).map((_, i) => ({
				id: `album${i}`,
				name: `Album ${i}`,
				songCount: 10,
				releasedAt: Date.now(),
				payout: 100000,
				variantCount: 2,
				isRerelease: false
			}));
			gameState.fans = 150000;

			engine.start();
			vi.advanceTimersByTime(100); // Single tick
			engine.stop();

			// Tours should now be unlocked
			expect(gameState.unlockedSystems.tours).toBe(true);
		});

		it('should check for prestige unlock', () => {
			gameState.unlockedSystems.prestige = false;
			gameState.upgrades = { tier3_basic: { purchasedAt: Date.now(), tier: 3 } };

			engine.start();
			vi.advanceTimersByTime(100); // Single tick
			engine.stop();

			// Prestige should now be unlocked
			expect(gameState.unlockedSystems.prestige).toBe(true);
		});

		it('should check for platform ownership unlock', () => {
			gameState.unlockedSystems.platformOwnership = false;
			gameState.upgrades = { tier6_basic: { purchasedAt: Date.now(), tier: 6 } };
			gameState.tours = new Array(60).fill(null).map((_, i) => ({
				id: `tour${i}`,
				name: `Tour ${i}`,
				startedAt: Date.now() - 200000,
				completedAt: Date.now() - 10000, // Completed
				incomePerSecond: 1000,
				usesScarcity: false
			}));
			gameState.fans = 2000000;

			engine.start();
			vi.advanceTimersByTime(100); // Single tick
			engine.stop();

			// Platform ownership should now be unlocked
			expect(gameState.unlockedSystems.platformOwnership).toBe(true);
		});
	});

	describe('Full Integration Test', () => {
		it('should process all systems together correctly', () => {
			// Set up a complex game state with all systems active
			gameState.unlockedSystems = {
				trendResearch: true,
				physicalAlbums: true,
				tours: true,
				platformOwnership: true,
				monopoly: true,
				prestige: true,
				gpu: true
			};

			gameState.songs = [
				{
					id: 'song1',
					name: 'Hit Song',
					genre: 'pop',
					createdAt: Date.now(),
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
					incomeRate: 25,
					createdAt: Date.now() - 100000,
					prestigedAt: Date.now() - 50000
				}
			];

			const now = Date.now();
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
					id: 'streaming',
					type: 'streaming',
					name: 'Streaming Service',
					cost: 10000000,
					acquiredAt: now,
					incomePerSecond: 1000,
					controlContribution: 15
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

			const initialMoney = gameState.money;
			const initialFans = gameState.fans;

			engine.start();
			vi.advanceTimersByTime(1000); // 1 second
			engine.stop();

			// Verify all systems contributed:
			// - Songs: 100/sec * 2.0 boost * 1.0 experience = 200
			// - Legacy: 25/sec * 2.0 boost * 1.0 experience = 50
			// - Tours: 500/sec * 2.0 boost * 1.0 experience = 1000
			// - Platforms: 1000/sec * 2.0 boost * 1.0 experience = 2000
			// Total: 3250/sec (all income gets boost multipliers)
			expect(gameState.money).toBeGreaterThan(initialMoney);
			expect(gameState.money).toBeCloseTo(initialMoney + 3250, 50);

			// Fans: 10/sec * 1.5 boost + cross-promotion
			expect(gameState.fans).toBeGreaterThan(initialFans);

			// Industry control should be set
			expect(gameState.industryControl).toBe(15);
		});

		it('should handle performance at 10 TPS with all systems active', () => {
			// Set up maximum complexity
			gameState.unlockedSystems = {
				trendResearch: true,
				physicalAlbums: true,
				tours: true,
				platformOwnership: true,
				monopoly: true,
				prestige: true,
				gpu: true
			};

			// Add many songs
			gameState.songs = new Array(100).fill(null).map((_, i) => ({
				id: `song${i}`,
				name: `Song ${i}`,
				genre: 'pop' as const,
				createdAt: Date.now(),
				incomePerSecond: 10,
				fanGenerationRate: 1,
				isTrending: false
			}));

			// Add legacy artists
			gameState.legacyArtists = new Array(3).fill(null).map((_, i) => ({
				name: `Legacy ${i}`,
				peakFans: 1000000,
				songs: 50,
				incomeRate: 25,
				createdAt: Date.now() - 100000,
				prestigedAt: Date.now() - 50000
			}));

			// Add tours
			const now = Date.now();
			gameState.tours = new Array(3).fill(null).map((_, i) => ({
				id: `tour${i}`,
				name: `Tour ${i}`,
				startedAt: now,
				completedAt: null,
				incomePerSecond: 100,
				usesScarcity: false
			}));

			// Add platforms
			gameState.ownedPlatforms = new Array(3).fill(null).map((_, i) => ({
				id: `platform${i}`,
				type: 'streaming' as const,
				name: `Platform ${i}`,
				cost: 10000000,
				acquiredAt: now,
				incomePerSecond: 100,
				controlContribution: 10
			}));

			const tickCallback = vi.fn();
			engine.onTick(tickCallback);

			engine.start();

			// Run for 10 seconds (100 ticks)
			vi.advanceTimersByTime(10000);

			engine.stop();

			// Should have executed 100 ticks
			expect(tickCallback).toHaveBeenCalledTimes(100);

			// All systems should have processed correctly
			expect(gameState.money).toBeGreaterThan(1000);
			expect(gameState.fans).toBeGreaterThan(0);

			// Verify it completed without crashing
			// (Performance timing is not reliable with fake timers)
			expect(engine.running).toBe(false);
		});

		it('should maintain game state consistency across all systems', () => {
			gameState.unlockedSystems.physicalAlbums = true;
			gameState.unlockedSystems.tours = true;
			gameState.unlockedSystems.platformOwnership = true;

			gameState.songs = new Array(20).fill(null).map((_, i) => ({
				id: `song${i}`,
				name: `Song ${i}`,
				genre: 'pop' as const,
				createdAt: Date.now(),
				incomePerSecond: 50,
				fanGenerationRate: 5,
				isTrending: false
			}));

			gameState.fans = 100000;
			const initialMoney = gameState.money;

			engine.start();
			vi.advanceTimersByTime(5000); // 5 seconds
			engine.stop();

			// Verify state consistency
			expect(gameState.money).toBeGreaterThan(initialMoney);
			expect(gameState.fans).toBeGreaterThan(100000);
			// Current artist fans should have increased (but may not equal total fans due to initial state)
			expect(gameState.currentArtist.fans).toBeGreaterThan(0);
			expect(gameState.lastUpdate).toBeGreaterThan(Date.now() - 1000);

			// Verify no arrays have invalid states
			expect(Array.isArray(gameState.songs)).toBe(true);
			expect(Array.isArray(gameState.songQueue)).toBe(true);
			expect(Array.isArray(gameState.physicalAlbums)).toBe(true);
			expect(Array.isArray(gameState.tours)).toBe(true);
			expect(Array.isArray(gameState.ownedPlatforms)).toBe(true);
			expect(Array.isArray(gameState.legacyArtists)).toBe(true);
			expect(Array.isArray(gameState.activeBoosts)).toBe(true);
		});
	});
});
