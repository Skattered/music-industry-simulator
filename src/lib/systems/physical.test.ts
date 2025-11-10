/**
 * Unit tests for Physical Album System
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
	unlockPhysicalAlbums,
	calculateAlbumPayout,
	generateVariants,
	releaseAlbum,
	rereleaseAlbum,
	processPhysicalAlbums,
	resetAlbumTracking
} from './physical';
import type { GameState, Artist, UnlockedSystems, Song } from '../game/types';
import {
	ALBUM_PAYOUT_PER_SONG,
	ALBUM_FAN_MULTIPLIER,
	MIN_SONGS_FOR_ALBUM,
	ALBUM_RELEASE_COOLDOWN,
	BASE_INCOME_PER_SONG,
	BASE_FAN_GENERATION_RATE,
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
 * Create test songs for album testing
 */
function createTestSongs(count: number): Song[] {
	const songs: Song[] = [];
	const now = Date.now();

	for (let i = 0; i < count; i++) {
		songs.push({
			id: `song-${i}`,
			name: `Test Song ${i}`,
			genre: 'pop',
			createdAt: now,
			incomePerSecond: BASE_INCOME_PER_SONG,
			fanGenerationRate: BASE_FAN_GENERATION_RATE,
			isTrending: false
		});
	}

	return songs;
}

/**
 * Mock crypto.randomUUID for deterministic tests
 */
let mockUuidCounter = 0;
function mockUuid(): string {
	return `test-uuid-${mockUuidCounter++}`;
}

// ============================================================================
// UNLOCK SYSTEM TESTS
// ============================================================================

describe('unlockPhysicalAlbums', () => {
	it('should return false when physical albums are not unlocked', () => {
		const state = createTestGameState({
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				physicalAlbums: false
			}
		});

		expect(unlockPhysicalAlbums(state)).toBe(false);
	});

	it('should return true when physical albums are unlocked', () => {
		const state = createTestGameState({
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				physicalAlbums: true
			}
		});

		expect(unlockPhysicalAlbums(state)).toBe(true);
	});
});

// ============================================================================
// VARIANT GENERATION TESTS
// ============================================================================

describe('generateVariants', () => {
	it('should return 1 variant for less than 10K fans', () => {
		const state = createTestGameState({ fans: 5_000 });
		expect(generateVariants(state)).toBe(1);
	});

	it('should return 1 variant for exactly 0 fans', () => {
		const state = createTestGameState({ fans: 0 });
		expect(generateVariants(state)).toBe(1);
	});

	it('should return 2 variants for 10K-100K fans', () => {
		const state1 = createTestGameState({ fans: 10_000 });
		expect(generateVariants(state1)).toBe(2);

		const state2 = createTestGameState({ fans: 50_000 });
		expect(generateVariants(state2)).toBe(2);

		const state3 = createTestGameState({ fans: 99_999 });
		expect(generateVariants(state3)).toBe(2);
	});

	it('should return 3 variants for 100K-1M fans', () => {
		const state1 = createTestGameState({ fans: 100_000 });
		expect(generateVariants(state1)).toBe(3);

		const state2 = createTestGameState({ fans: 500_000 });
		expect(generateVariants(state2)).toBe(3);

		const state3 = createTestGameState({ fans: 999_999 });
		expect(generateVariants(state3)).toBe(3);
	});

	it('should return 4 variants for 1M+ fans', () => {
		const state1 = createTestGameState({ fans: 1_000_000 });
		expect(generateVariants(state1)).toBe(4);

		const state2 = createTestGameState({ fans: 10_000_000 });
		expect(generateVariants(state2)).toBe(4);
	});
});

// ============================================================================
// PAYOUT CALCULATION TESTS
// ============================================================================

describe('calculateAlbumPayout', () => {
	it('should calculate base payout with no fans', () => {
		const state = createTestGameState({
			songs: createTestSongs(10),
			fans: 0
		});

		// (10 songs * 50,000) + (0 fans * 0.5) = 500,000
		// 1 variant (< 10K fans)
		const expected = (10 * ALBUM_PAYOUT_PER_SONG) * 1;
		expect(calculateAlbumPayout(state)).toBe(expected);
	});

	it('should calculate payout with fans', () => {
		const state = createTestGameState({
			songs: createTestSongs(10),
			fans: 10_000
		});

		// (10 songs * 50,000) + (10,000 fans * 0.5) = 500,000 + 5,000 = 505,000
		// 2 variants (10K fans)
		const basePayout = (10 * ALBUM_PAYOUT_PER_SONG) + (10_000 * ALBUM_FAN_MULTIPLIER);
		const expected = basePayout * 2;
		expect(calculateAlbumPayout(state)).toBe(expected);
	});

	it('should scale payout by variant count', () => {
		const songs = createTestSongs(10);

		// Test with 1 variant (< 10K fans)
		const state1 = createTestGameState({ songs, fans: 5_000 });
		const basePayout = (10 * ALBUM_PAYOUT_PER_SONG) + (5_000 * ALBUM_FAN_MULTIPLIER);
		expect(calculateAlbumPayout(state1)).toBe(basePayout * 1);

		// Test with 2 variants (10K fans)
		const state2 = createTestGameState({ songs, fans: 10_000 });
		const basePayout2 = (10 * ALBUM_PAYOUT_PER_SONG) + (10_000 * ALBUM_FAN_MULTIPLIER);
		expect(calculateAlbumPayout(state2)).toBe(basePayout2 * 2);

		// Test with 4 variants (1M fans)
		const state3 = createTestGameState({ songs, fans: 1_000_000 });
		const basePayout3 = (10 * ALBUM_PAYOUT_PER_SONG) + (1_000_000 * ALBUM_FAN_MULTIPLIER);
		expect(calculateAlbumPayout(state3)).toBe(basePayout3 * 4);
	});

	it('should cap song count at 15 songs per album', () => {
		const state = createTestGameState({
			songs: createTestSongs(50), // Many songs
			fans: 0
		});

		// Should cap at 15 songs (MIN_SONGS_FOR_ALBUM + 10 = 5 + 10)
		const expected = (15 * ALBUM_PAYOUT_PER_SONG) * 1;
		expect(calculateAlbumPayout(state)).toBe(expected);
	});

	it('should handle large fan counts', () => {
		const state = createTestGameState({
			songs: createTestSongs(10),
			fans: 10_000_000 // 10 million fans
		});

		// (10 * 50,000) + (10,000,000 * 0.5) = 500,000 + 5,000,000 = 5,500,000
		// 4 variants (1M+ fans)
		const basePayout = (10 * ALBUM_PAYOUT_PER_SONG) + (10_000_000 * ALBUM_FAN_MULTIPLIER);
		const expected = basePayout * 4;
		expect(calculateAlbumPayout(state)).toBe(expected);
	});
});

// ============================================================================
// ALBUM RELEASE TESTS
// ============================================================================

describe('releaseAlbum', () => {
	beforeEach(() => {
		mockUuidCounter = 0;
		vi.stubGlobal('crypto', { randomUUID: mockUuid });
	});

	it('should create an album with correct properties', () => {
		const state = createTestGameState({
			money: 1000,
			songs: createTestSongs(10),
			fans: 10_000
		});

		const album = releaseAlbum(state);

		expect(album.id).toBe('test-uuid-0');
		expect(album.name).toBeTruthy();
		expect(album.songCount).toBe(10);
		expect(album.releasedAt).toBeGreaterThan(0);
		expect(album.variantCount).toBe(2); // 10K fans = 2 variants
		expect(album.isRerelease).toBe(false);
	});

	it('should add album to state', () => {
		const state = createTestGameState({
			songs: createTestSongs(10),
			fans: 10_000
		});

		expect(state.physicalAlbums.length).toBe(0);

		releaseAlbum(state);

		expect(state.physicalAlbums.length).toBe(1);
		expect(state.physicalAlbums[0].id).toBe('test-uuid-0');
	});

	it('should add payout to player money', () => {
		const initialMoney = 1000;
		const state = createTestGameState({
			money: initialMoney,
			songs: createTestSongs(10),
			fans: 10_000
		});

		const expectedPayout = calculateAlbumPayout(state);
		releaseAlbum(state);

		expect(state.money).toBe(initialMoney + expectedPayout);
	});

	it('should calculate correct payout for album', () => {
		const state = createTestGameState({
			money: 0,
			songs: createTestSongs(10),
			fans: 10_000
		});

		const album = releaseAlbum(state);

		// (10 * 50,000) + (10,000 * 0.5) = 505,000
		// 2 variants = 1,010,000
		const basePayout = (10 * ALBUM_PAYOUT_PER_SONG) + (10_000 * ALBUM_FAN_MULTIPLIER);
		const expectedPayout = basePayout * 2;

		expect(album.payout).toBe(expectedPayout);
		expect(state.money).toBe(expectedPayout);
	});

	it('should release multiple albums independently', () => {
		const state = createTestGameState({
			money: 0,
			songs: createTestSongs(10),
			fans: 10_000
		});

		releaseAlbum(state);
		releaseAlbum(state);

		expect(state.physicalAlbums.length).toBe(2);
		expect(state.physicalAlbums[0].id).not.toBe(state.physicalAlbums[1].id);
	});
});

// ============================================================================
// RE-RELEASE TESTS
// ============================================================================

describe('rereleaseAlbum', () => {
	beforeEach(() => {
		mockUuidCounter = 0;
		vi.stubGlobal('crypto', { randomUUID: mockUuid });
	});

	it('should re-release an existing album with reduced payout', () => {
		const state = createTestGameState({
			money: 0,
			songs: createTestSongs(10),
			fans: 10_000
		});

		// Release original album
		const original = releaseAlbum(state);
		const moneyAfterOriginal = state.money;

		// Re-release the album
		const rerelease = rereleaseAlbum(state, original.id);

		expect(rerelease).not.toBeNull();
		expect(rerelease!.isRerelease).toBe(true);
		expect(rerelease!.name).toContain('Remastered');
		expect(rerelease!.songCount).toBe(original.songCount);

		// Re-release payout should be 50% of current potential
		const currentBasePayout = (10 * ALBUM_PAYOUT_PER_SONG) + (10_000 * ALBUM_FAN_MULTIPLIER);
		const expectedRereleasePayout = (currentBasePayout * 2) * 0.5;

		expect(rerelease!.payout).toBe(expectedRereleasePayout);
		expect(state.money).toBe(moneyAfterOriginal + expectedRereleasePayout);
	});

	it('should return null for non-existent album ID', () => {
		const state = createTestGameState({
			songs: createTestSongs(10),
			fans: 10_000
		});

		const result = rereleaseAlbum(state, 'non-existent-id');
		expect(result).toBeNull();
	});

	it('should benefit from increased fan count on re-release', () => {
		const state = createTestGameState({
			money: 0,
			songs: createTestSongs(10),
			fans: 10_000 // 2 variants
		});

		// Release original
		const original = releaseAlbum(state);
		const originalPayout = original.payout;

		// Increase fans significantly
		state.fans = 1_000_000; // 4 variants now

		// Re-release should use new fan count
		const rerelease = rereleaseAlbum(state, original.id);

		// New payout calculation with 1M fans and 4 variants
		const newBasePayout = (10 * ALBUM_PAYOUT_PER_SONG) + (1_000_000 * ALBUM_FAN_MULTIPLIER);
		const expectedRereleasePayout = (newBasePayout * 4) * 0.5;

		expect(rerelease!.payout).toBe(expectedRereleasePayout);
		expect(rerelease!.payout).toBeGreaterThan(originalPayout); // Should be much higher
	});

	it('should add re-release to albums list', () => {
		const state = createTestGameState({
			songs: createTestSongs(10),
			fans: 10_000
		});

		const original = releaseAlbum(state);
		expect(state.physicalAlbums.length).toBe(1);

		rereleaseAlbum(state, original.id);
		expect(state.physicalAlbums.length).toBe(2);
	});
});

// ============================================================================
// AUTO-RELEASE SYSTEM TESTS
// ============================================================================

describe('processPhysicalAlbums', () => {
	beforeEach(() => {
		mockUuidCounter = 0;
		vi.stubGlobal('crypto', { randomUUID: mockUuid });
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('should not release albums when system is locked', () => {
		const state = createTestGameState({
			songs: createTestSongs(20),
			fans: 10_000,
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				physicalAlbums: false
			}
		});

		processPhysicalAlbums(state, 1000);

		expect(state.physicalAlbums.length).toBe(0);
	});

	it('should not release albums when below minimum song count', () => {
		const state = createTestGameState({
			songs: createTestSongs(3), // Less than MIN_SONGS_FOR_ALBUM (5)
			fans: 10_000,
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				physicalAlbums: true
			}
		});

		processPhysicalAlbums(state, 1000);

		expect(state.physicalAlbums.length).toBe(0);
	});

	it('should release album when song milestone is reached', () => {
		const state = createTestGameState({
			songs: createTestSongs(10), // Exactly 10 songs (1st milestone)
			fans: 10_000,
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				physicalAlbums: true
			}
		});

		// Reset tracking to ensure clean state
		resetAlbumTracking(state);

		processPhysicalAlbums(state, 1000);

		expect(state.physicalAlbums.length).toBe(1);
	});

	it('should release albums at every 10 song milestone', () => {
		const state = createTestGameState({
			songs: createTestSongs(5), // Start with 5 songs
			fans: 10_000,
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				physicalAlbums: true
			}
		});

		resetAlbumTracking(state);
		processPhysicalAlbums(state, 1000);
		expect(state.physicalAlbums.length).toBe(0); // No milestone yet

		// Add songs to reach 10 (first milestone)
		state.songs = createTestSongs(10);
		vi.advanceTimersByTime(ALBUM_RELEASE_COOLDOWN + 1000);
		processPhysicalAlbums(state, ALBUM_RELEASE_COOLDOWN + 1000);
		expect(state.physicalAlbums.length).toBe(1);

		// Add songs to reach 20 (second milestone)
		state.songs = createTestSongs(20);
		vi.advanceTimersByTime(ALBUM_RELEASE_COOLDOWN + 1000);
		processPhysicalAlbums(state, ALBUM_RELEASE_COOLDOWN + 1000);
		expect(state.physicalAlbums.length).toBe(2);

		// Add songs to reach 30 (third milestone)
		state.songs = createTestSongs(30);
		vi.advanceTimersByTime(ALBUM_RELEASE_COOLDOWN + 1000);
		processPhysicalAlbums(state, ALBUM_RELEASE_COOLDOWN + 1000);
		expect(state.physicalAlbums.length).toBe(3);
	});

	it('should respect cooldown between releases', () => {
		const state = createTestGameState({
			songs: createTestSongs(10),
			fans: 10_000,
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				physicalAlbums: true
			}
		});

		resetAlbumTracking(state);

		// First release
		processPhysicalAlbums(state, 1000);
		expect(state.physicalAlbums.length).toBe(1);

		// Try to release again immediately (within cooldown)
		state.songs = createTestSongs(20);
		vi.advanceTimersByTime(1000);
		processPhysicalAlbums(state, 1000);
		expect(state.physicalAlbums.length).toBe(1); // Should not release

		// Wait for cooldown to elapse
		vi.advanceTimersByTime(ALBUM_RELEASE_COOLDOWN);
		processPhysicalAlbums(state, ALBUM_RELEASE_COOLDOWN + 1000);
		expect(state.physicalAlbums.length).toBe(2); // Should release now
	});

	it('should not release multiple albums for intermediate song counts', () => {
		const state = createTestGameState({
			songs: createTestSongs(15), // Between milestones (10 and 20)
			fans: 10_000,
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				physicalAlbums: true
			}
		});

		resetAlbumTracking(state);
		processPhysicalAlbums(state, 1000);

		// Should only release 1 album (for the 10 song milestone)
		expect(state.physicalAlbums.length).toBe(1);
	});

	it('should handle reset tracking correctly', () => {
		const state = createTestGameState({
			songs: createTestSongs(10),
			fans: 10_000,
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				physicalAlbums: true
			}
		});

		// Release an album
		resetAlbumTracking(state);
		processPhysicalAlbums(state, 1000);
		expect(state.physicalAlbums.length).toBe(1);

		// Reset tracking
		resetAlbumTracking(state);

		// Should be able to release again immediately after reset
		processPhysicalAlbums(state, 1000);
		expect(state.physicalAlbums.length).toBe(2);
	});
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Physical Album System Integration', () => {
	beforeEach(() => {
		mockUuidCounter = 0;
		vi.stubGlobal('crypto', { randomUUID: mockUuid });
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('should handle complete album lifecycle', () => {
		const state = createTestGameState({
			money: 0,
			songs: createTestSongs(10),
			fans: 50_000, // 2 variants
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				physicalAlbums: true
			}
		});

		// Initial state
		expect(state.physicalAlbums.length).toBe(0);
		expect(state.money).toBe(0);

		// Trigger auto-release
		resetAlbumTracking(state);
		processPhysicalAlbums(state, 1000);

		// Verify album was released
		expect(state.physicalAlbums.length).toBe(1);
		expect(state.money).toBeGreaterThan(0);

		const firstAlbum = state.physicalAlbums[0];
		expect(firstAlbum.songCount).toBe(10);
		expect(firstAlbum.variantCount).toBe(2);
		expect(firstAlbum.isRerelease).toBe(false);

		// Add more songs and fans
		state.songs = createTestSongs(20);
		state.fans = 1_000_000; // 4 variants now

		// Wait for cooldown and trigger next release
		vi.advanceTimersByTime(ALBUM_RELEASE_COOLDOWN + 1000);
		processPhysicalAlbums(state, ALBUM_RELEASE_COOLDOWN + 1000);

		// Verify second album with updated stats
		expect(state.physicalAlbums.length).toBe(2);
		const secondAlbum = state.physicalAlbums[1];
		expect(secondAlbum.variantCount).toBe(4); // Should use new fan count
		expect(secondAlbum.payout).toBeGreaterThan(firstAlbum.payout);
	});

	it('should calculate realistic payouts at different scales', () => {
		// Small indie release (5K fans, 5 songs)
		const indie = createTestGameState({
			songs: createTestSongs(5),
			fans: 5_000
		});
		const indiePayout = calculateAlbumPayout(indie);
		// (5 * 50,000) + (5,000 * 0.5) = 252,500 * 1 variant = 252,500
		expect(indiePayout).toBe(252_500);

		// Medium artist (100K fans, 10 songs)
		const medium = createTestGameState({
			songs: createTestSongs(10),
			fans: 100_000
		});
		const mediumPayout = calculateAlbumPayout(medium);
		// (10 * 50,000) + (100,000 * 0.5) = 550,000 * 3 variants = 1,650,000
		expect(mediumPayout).toBe(1_650_000);

		// Superstar (10M fans, 15 songs)
		const superstar = createTestGameState({
			songs: createTestSongs(50), // Will cap at 15
			fans: 10_000_000
		});
		const superstarPayout = calculateAlbumPayout(superstar);
		// (15 * 50,000) + (10,000,000 * 0.5) = 5,750,000 * 4 variants = 23,000,000
		expect(superstarPayout).toBe(23_000_000);
	});
});
