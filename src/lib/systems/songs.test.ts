/**
 * Unit tests for Song Generation System
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	generateSong,
	queueSongs,
	processSongQueue,
	calculateSongCost,
	calculateSongIncome,
	calculateFanGeneration,
	getSongGenerationSpeed
} from './songs';
import type { GameState, Genre, TechTier, Artist, UnlockedSystems, ActiveBoost } from '../game/types';
import {
	INCOME_PER_FAN_PER_SONG,
	BASE_FAN_GENERATION_RATE,
	BASE_SONG_COST,
	BASE_SONG_GENERATION_TIME,
	TRENDING_MULTIPLIER,
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
		songGenerationSpeed: BASE_SONG_GENERATION_TIME,
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
 * Mock crypto.randomUUID for deterministic tests
 */
let mockUuidCounter = 0;
function mockUuid(): string {
	return `test-uuid-${mockUuidCounter++}`;
}

// ============================================================================
// GENERATE SONG TESTS
// ============================================================================

describe('generateSong', () => {
	beforeEach(() => {
		mockUuidCounter = 0;
		vi.stubGlobal('crypto', { randomUUID: mockUuid });
	});

	it('should generate a song with basic properties', () => {
		const state = createTestGameState();
		const song = generateSong(state);

		expect(song.id).toBe('test-uuid-0');
		expect(song.name).toBeTruthy();
		expect(song.genre).toBeTruthy();
		expect(song.createdAt).toBeGreaterThan(0);
		// Income is now based on fans: 0 fans * 0.000001 = 0
		expect(song.incomePerSecond).toBe(0);
		expect(song.fanGenerationRate).toBe(BASE_FAN_GENERATION_RATE);
		expect(song.isTrending).toBe(false);
	});

	it('should mark song as trending when it matches currentTrendingGenre', () => {
		const state = createTestGameState({
			currentTrendingGenre: 'pop',
			trendDiscoveredAt: Date.now()
		});

		// When currentTrendingGenre is set, all songs are generated in that genre
		const song = generateSong(state);
		expect(song.genre).toBe('pop');
		expect(song.isTrending).toBe(true);
	});

	it('should apply trending multiplier to income and fan generation', () => {
		const state = createTestGameState({
			currentTrendingGenre: 'pop',
			trendDiscoveredAt: Date.now(), // Set to now for full multiplier strength
			fans: 1_000_000 // Add fans so income is non-zero
		});

		// When currentTrendingGenre is set, all songs are generated in that genre
		const song = generateSong(state);
		expect(song.genre).toBe('pop');
		expect(song.isTrending).toBe(true);
		// Income = fans * INCOME_PER_FAN_PER_SONG * TRENDING_MULTIPLIER
		// 1,000,000 * 0.000001 * 2.0 = 2.0
		expect(song.incomePerSecond).toBeCloseTo(1_000_000 * INCOME_PER_FAN_PER_SONG * TRENDING_MULTIPLIER);
		expect(song.fanGenerationRate).toBeCloseTo(BASE_FAN_GENERATION_RATE * TRENDING_MULTIPLIER);
	});

	it('should fade trending multiplier over time', () => {
		const now = Date.now();
		const testFans = 1_000_000; // Use 1M fans for consistent test values

		// Test at start of trend (full multiplier)
		const stateStart = createTestGameState({
			currentTrendingGenre: 'pop',
			trendDiscoveredAt: now,
			fans: testFans
		});
		const songStart = generateSong(stateStart);
		expect(songStart.incomePerSecond).toBeCloseTo(testFans * INCOME_PER_FAN_PER_SONG * TRENDING_MULTIPLIER);

		// Test at halfway through fade (1.5x multiplier: midpoint between 2.0 and 1.0)
		const stateHalf = createTestGameState({
			currentTrendingGenre: 'pop',
			trendDiscoveredAt: now - 150000, // 2.5 minutes ago (half of 5 minute fade)
			fans: testFans
		});
		const songHalf = generateSong(stateHalf);
		const expectedHalfMultiplier = 1.5; // Halfway between 2.0 and 1.0
		expect(songHalf.incomePerSecond).toBeCloseTo(testFans * INCOME_PER_FAN_PER_SONG * expectedHalfMultiplier);

		// Test after fade complete (1.0x multiplier - no bonus)
		const stateFaded = createTestGameState({
			currentTrendingGenre: 'pop',
			trendDiscoveredAt: now - 300000, // 5 minutes ago (fully faded)
			fans: testFans
		});
		const songFaded = generateSong(stateFaded);
		expect(songFaded.incomePerSecond).toBe(testFans * INCOME_PER_FAN_PER_SONG * 1.0);
	});

	it('should apply experience multiplier to income', () => {
		const experienceMultiplier = 1.5;
		const testFans = 1_000_000;
		const state = createTestGameState({
			experienceMultiplier,
			currentTrendingGenre: null,
			fans: testFans
		});

		const song = generateSong(state);
		expect(song.incomePerSecond).toBe(testFans * INCOME_PER_FAN_PER_SONG * experienceMultiplier);
	});

	it('should apply upgrade income multiplier', () => {
		const testFans = 1_000_000;
		const state = createTestGameState({
			fans: testFans,
			upgrades: {
				tier2_improved: {
					purchasedAt: Date.now(),
					tier: 2
				}
			}
		});

		const song = generateSong(state);
		// tier2_improved has incomeMultiplier: 1.5
		expect(song.incomePerSecond).toBe(testFans * INCOME_PER_FAN_PER_SONG * 1.5);
	});

	it('should stack experience and upgrade multipliers', () => {
		const testFans = 1_000_000;
		const state = createTestGameState({
			experienceMultiplier: 1.5,
			fans: testFans,
			upgrades: {
				tier2_improved: {
					purchasedAt: Date.now(),
					tier: 2
				}
			}
		});

		const song = generateSong(state);
		expect(song.incomePerSecond).toBe(testFans * INCOME_PER_FAN_PER_SONG * 1.5 * 1.5);
	});
});

// ============================================================================
// CALCULATE SONG COST TESTS
// ============================================================================

describe('calculateSongCost', () => {
	it('should calculate cost for tier 1 (base cost)', () => {
		const state = createTestGameState();
		const cost = calculateSongCost(state, 1);
		expect(cost).toBe(BASE_SONG_COST);
	});

	it('should calculate cost for multiple songs', () => {
		const state = createTestGameState();
		const cost = calculateSongCost(state, 5);
		expect(cost).toBe(BASE_SONG_COST * 5);
	});

	it('should return 0 cost for tier 2+ (free songs)', () => {
		const state = createTestGameState({
			techTier: 2,
			upgrades: {
				tier2_basic: {
					purchasedAt: Date.now(),
					tier: 2
				}
			}
		});

		const cost = calculateSongCost(state, 10);
		expect(cost).toBe(0);
	});

	it('should handle modified song cost from upgrades', () => {
		const state = createTestGameState({
			upgrades: {
				tier1_basic: {
					purchasedAt: Date.now(),
					tier: 1
				}
			}
		});

		const cost = calculateSongCost(state, 1);
		// tier1_basic sets songCost to 1.5
		expect(cost).toBe(1.5);
	});
});

// ============================================================================
// QUEUE SONGS TESTS
// ============================================================================

describe('queueSongs', () => {
	beforeEach(() => {
		mockUuidCounter = 0;
		vi.stubGlobal('crypto', { randomUUID: mockUuid });
	});

	it('should queue songs and deduct money', () => {
		const state = createTestGameState({
			money: 100
		});

		const result = queueSongs(state, 5);

		expect(result).toBe(true);
		expect(state.money).toBe(100 - BASE_SONG_COST * 5);
		expect(state.songQueue.length).toBe(5);
	});

	it('should return false when insufficient funds', () => {
		const state = createTestGameState({
			money: 0
		});

		const result = queueSongs(state, 5);

		expect(result).toBe(false);
		expect(state.songQueue.length).toBe(0);
	});

	it('should create queued songs with correct properties', () => {
		const state = createTestGameState({
			money: 100,
			songGenerationSpeed: 15000
		});

		queueSongs(state, 2);

		expect(state.songQueue[0].id).toBe('test-uuid-0');
		expect(state.songQueue[0].progress).toBe(0);

		expect(state.songQueue[1].id).toBe('test-uuid-1');
		expect(state.songQueue[1].progress).toBe(0);
	});

	it('should not deduct money when songs are free', () => {
		const state = createTestGameState({
			money: 100,
			upgrades: {
				tier2_basic: {
					purchasedAt: Date.now(),
					tier: 2
				}
			}
		});

		queueSongs(state, 10);

		expect(state.money).toBe(100);
		expect(state.songQueue.length).toBe(10);
	});

	it('should use updated generation speed from upgrades', () => {
		const state = createTestGameState({
			money: 100,
			upgrades: {
				tier1_improved: {
					purchasedAt: Date.now(),
					tier: 1
				}
			}
		});

		queueSongs(state, 1);

		// tier1_improved sets songSpeed to 12000
		const generationSpeed = getSongGenerationSpeed(state);
		expect(generationSpeed).toBe(12000);
		// Queue no longer stores totalTime, processes at current speed
		expect(state.songQueue[0].progress).toBe(0);
	});
});

// ============================================================================
// PROCESS SONG QUEUE TESTS
// ============================================================================

describe('processSongQueue', () => {
	beforeEach(() => {
		mockUuidCounter = 0;
		vi.stubGlobal('crypto', { randomUUID: mockUuid });
	});

	it('should do nothing when queue is empty', () => {
		const state = createTestGameState();
		processSongQueue(state, 1000);

		expect(state.songs.length).toBe(0);
		expect(state.songQueue.length).toBe(0);
	});

	it('should process only the first song in queue (sequential)', () => {
		const state = createTestGameState({
			money: 100,
			songGenerationSpeed: 10000
		});

		queueSongs(state, 3);
		processSongQueue(state, 5000);

		// First song should have progressed
		expect(state.songQueue[0].progress).toBe(5000);

		// Second and third songs should not have progressed
		expect(state.songQueue[1].progress).toBe(0);
		expect(state.songQueue[2].progress).toBe(0);

		// No songs completed yet
		expect(state.songs.length).toBe(0);
		expect(state.songQueue.length).toBe(3);
	});

	it('should complete a song when progress reaches current generation speed', () => {
		const state = createTestGameState({
			money: 100,
			songGenerationSpeed: 10000
		});

		queueSongs(state, 1);
		processSongQueue(state, 10000);

		expect(state.songs.length).toBe(1);
		expect(state.songQueue.length).toBe(0);
		expect(state.songs[0].id).toBeTruthy();
	});

	it('should process multiple songs sequentially with overflow time', () => {
		const state = createTestGameState({
			money: 100,
			songGenerationSpeed: 5000
		});

		queueSongs(state, 3);
		processSongQueue(state, 12000);

		// 12000ms should complete 2 songs (5000ms each) with 2000ms overflow
		expect(state.songs.length).toBe(2);
		expect(state.songQueue.length).toBe(1);
		expect(state.songQueue[0].progress).toBe(2000);
	});

	it('should handle exact completion time', () => {
		const state = createTestGameState({
			money: 100,
			songGenerationSpeed: 10000
		});

		queueSongs(state, 2);
		processSongQueue(state, 10000);

		expect(state.songs.length).toBe(1);
		expect(state.songQueue.length).toBe(1);
		expect(state.songQueue[0].progress).toBe(0);
	});

	it('should complete all songs when given sufficient time', () => {
		const state = createTestGameState({
			money: 100,
			songGenerationSpeed: 5000
		});

		queueSongs(state, 5);
		processSongQueue(state, 30000);

		expect(state.songs.length).toBe(5);
		expect(state.songQueue.length).toBe(0);
	});

	it('should handle incremental processing over multiple ticks', () => {
		const state = createTestGameState({
			money: 100,
			songGenerationSpeed: 10000
		});

		queueSongs(state, 2);

		// Process in small increments
		processSongQueue(state, 3000);
		expect(state.songs.length).toBe(0);
		expect(state.songQueue[0].progress).toBe(3000);

		processSongQueue(state, 4000);
		expect(state.songs.length).toBe(0);
		expect(state.songQueue[0].progress).toBe(7000);

		processSongQueue(state, 3000);
		expect(state.songs.length).toBe(1);
		expect(state.songQueue.length).toBe(1);
		expect(state.songQueue[0].progress).toBe(0);
	});
});

// ============================================================================
// CALCULATE SONG INCOME TESTS
// ============================================================================

describe('calculateSongIncome', () => {
	it('should return 0 when no songs exist', () => {
		const state = createTestGameState();
		const income = calculateSongIncome(state);
		expect(income).toBe(0);
	});

	it('should sum income from all songs', () => {
		const state = createTestGameState({
			songs: [
				{
					id: '1',
					name: 'Song 1',
					genre: 'pop',
					createdAt: Date.now(),
					incomePerSecond: 10,
					fanGenerationRate: 5,
					isTrending: false
				},
				{
					id: '2',
					name: 'Song 2',
					genre: 'rock',
					createdAt: Date.now(),
					incomePerSecond: 15,
					fanGenerationRate: 5,
					isTrending: false
				},
				{
					id: '3',
					name: 'Song 3',
					genre: 'jazz',
					createdAt: Date.now(),
					incomePerSecond: 20,
					fanGenerationRate: 5,
					isTrending: false
				}
			]
		});

		const income = calculateSongIncome(state);
		expect(income).toBe(45);
	});

	it('should apply active boost multipliers', () => {
		const now = Date.now();
		const boost: ActiveBoost = {
			id: 'boost-1',
			type: 'bot_streams',
			name: 'Bot Streams',
			activatedAt: now - 5000, // Activated 5 seconds ago
			duration: 30000, // 30 second duration
			incomeMultiplier: 2.0,
			fanMultiplier: 1.5
		};

		const state = createTestGameState({
			songs: [
				{
					id: '1',
					name: 'Song 1',
					genre: 'pop',
					createdAt: now,
					incomePerSecond: 10,
					fanGenerationRate: 5,
					isTrending: false
				}
			],
			activeBoosts: [boost]
		});

		const income = calculateSongIncome(state);
		expect(income).toBe(20); // 10 * 2.0
	});

	it('should stack multiple boost multipliers', () => {
		const now = Date.now();
		const boost1: ActiveBoost = {
			id: 'boost-1',
			type: 'bot_streams',
			name: 'Bot Streams',
			activatedAt: now - 5000,
			duration: 30000,
			incomeMultiplier: 2.0,
			fanMultiplier: 1.0
		};

		const boost2: ActiveBoost = {
			id: 'boost-2',
			type: 'playlist_placement',
			name: 'Playlist Placement',
			activatedAt: now - 3000,
			duration: 60000,
			incomeMultiplier: 1.5,
			fanMultiplier: 1.0
		};

		const state = createTestGameState({
			songs: [
				{
					id: '1',
					name: 'Song 1',
					genre: 'pop',
					createdAt: now,
					incomePerSecond: 10,
					fanGenerationRate: 5,
					isTrending: false
				}
			],
			activeBoosts: [boost1, boost2]
		});

		const income = calculateSongIncome(state);
		expect(income).toBe(30); // 10 * 2.0 * 1.5
	});

	it('should ignore expired boosts', () => {
		const now = Date.now();
		const expiredBoost: ActiveBoost = {
			id: 'boost-1',
			type: 'bot_streams',
			name: 'Bot Streams',
			activatedAt: now - 60000, // Activated 60 seconds ago
			duration: 30000, // 30 second duration (expired 30 seconds ago)
			incomeMultiplier: 2.0,
			fanMultiplier: 1.5
		};

		const state = createTestGameState({
			songs: [
				{
					id: '1',
					name: 'Song 1',
					genre: 'pop',
					createdAt: now,
					incomePerSecond: 10,
					fanGenerationRate: 5,
					isTrending: false
				}
			],
			activeBoosts: [expiredBoost]
		});

		const income = calculateSongIncome(state);
		expect(income).toBe(10); // No boost applied
	});
});

// ============================================================================
// CALCULATE FAN GENERATION TESTS
// ============================================================================

describe('calculateFanGeneration', () => {
	it('should return 0 when no songs exist', () => {
		const state = createTestGameState();
		const fans = calculateFanGeneration(state);
		expect(fans).toBe(0);
	});

	it('should sum fan generation from all songs', () => {
		const state = createTestGameState({
			songs: [
				{
					id: '1',
					name: 'Song 1',
					genre: 'pop',
					createdAt: Date.now(),
					incomePerSecond: 10,
					fanGenerationRate: 5,
					isTrending: false
				},
				{
					id: '2',
					name: 'Song 2',
					genre: 'rock',
					createdAt: Date.now(),
					incomePerSecond: 10,
					fanGenerationRate: 8,
					isTrending: false
				},
				{
					id: '3',
					name: 'Song 3',
					genre: 'jazz',
					createdAt: Date.now(),
					incomePerSecond: 10,
					fanGenerationRate: 12,
					isTrending: false
				}
			]
		});

		const fans = calculateFanGeneration(state);
		expect(fans).toBe(25);
	});

	it('should apply active boost multipliers', () => {
		const now = Date.now();
		const boost: ActiveBoost = {
			id: 'boost-1',
			type: 'playlist_placement',
			name: 'Playlist Placement',
			activatedAt: now - 5000,
			duration: 60000,
			incomeMultiplier: 1.0,
			fanMultiplier: 3.0
		};

		const state = createTestGameState({
			songs: [
				{
					id: '1',
					name: 'Song 1',
					genre: 'pop',
					createdAt: now,
					incomePerSecond: 10,
					fanGenerationRate: 10,
					isTrending: false
				}
			],
			activeBoosts: [boost]
		});

		const fans = calculateFanGeneration(state);
		expect(fans).toBe(30); // 10 * 3.0
	});

	it('should stack multiple boost multipliers', () => {
		const now = Date.now();
		const boost1: ActiveBoost = {
			id: 'boost-1',
			type: 'playlist_placement',
			name: 'Playlist Placement',
			activatedAt: now - 5000,
			duration: 60000,
			incomeMultiplier: 1.0,
			fanMultiplier: 2.0
		};

		const boost2: ActiveBoost = {
			id: 'boost-2',
			type: 'social_media_campaign',
			name: 'Social Media Campaign',
			activatedAt: now - 3000,
			duration: 45000,
			incomeMultiplier: 1.0,
			fanMultiplier: 1.5
		};

		const state = createTestGameState({
			songs: [
				{
					id: '1',
					name: 'Song 1',
					genre: 'pop',
					createdAt: now,
					incomePerSecond: 10,
					fanGenerationRate: 10,
					isTrending: false
				}
			],
			activeBoosts: [boost1, boost2]
		});

		const fans = calculateFanGeneration(state);
		expect(fans).toBe(30); // 10 * 2.0 * 1.5
	});

	it('should ignore expired boosts', () => {
		const now = Date.now();
		const expiredBoost: ActiveBoost = {
			id: 'boost-1',
			type: 'playlist_placement',
			name: 'Playlist Placement',
			activatedAt: now - 120000,
			duration: 60000,
			incomeMultiplier: 1.0,
			fanMultiplier: 3.0
		};

		const state = createTestGameState({
			songs: [
				{
					id: '1',
					name: 'Song 1',
					genre: 'pop',
					createdAt: now,
					incomePerSecond: 10,
					fanGenerationRate: 10,
					isTrending: false
				}
			],
			activeBoosts: [expiredBoost]
		});

		const fans = calculateFanGeneration(state);
		expect(fans).toBe(10); // No boost applied
	});
});
