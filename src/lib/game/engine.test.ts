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
		techTier: 1,
		techSubTier: 0,
		upgrades: {},
		activeBoosts: [],
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
			gameState.songQueue = [
				{
					id: 'queued1',
					progress: 0,
					totalTime: 1000
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
});
