/**
 * Unit tests for Physical Album System
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	unlockPhysicalAlbums,
	releaseAlbum,
	processPhysicalAlbums,
	calculateAlbumPayout,
	generateVariants,
	rereleaseAlbum,
	PHYSICAL_UNLOCK_SONGS,
	PHYSICAL_UNLOCK_FANS,
	PHYSICAL_UNLOCK_MONEY,
	SONGS_PER_ALBUM
} from './physical';
import type { GameState, Artist, UnlockedSystems } from '../game/types';
import {
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
	GAME_VERSION,
	MIN_SONGS_FOR_ALBUM,
	ALBUM_PAYOUT_PER_SONG,
	ALBUM_FAN_MULTIPLIER
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
// UNLOCK TESTS
// ============================================================================

describe('unlockPhysicalAlbums', () => {
	beforeEach(() => {
		mockUuidCounter = 0;
	});

	it('should return false if already unlocked', () => {
		const state = createTestGameState({
			songs: new Array(100).fill({ id: 'test' }),
			fans: 10_000,
			money: 5_000,
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, physicalAlbums: true }
		});

		expect(unlockPhysicalAlbums(state)).toBe(false);
	});

	it('should return false if not enough songs', () => {
		const state = createTestGameState({
			songs: new Array(99).fill({ id: 'test' }),
			fans: 10_000,
			money: 5_000
		});

		expect(unlockPhysicalAlbums(state)).toBe(false);
	});

	it('should return false if not enough fans', () => {
		const state = createTestGameState({
			songs: new Array(100).fill({ id: 'test' }),
			fans: 9_999,
			money: 5_000
		});

		expect(unlockPhysicalAlbums(state)).toBe(false);
	});

	it('should return false if not enough money', () => {
		const state = createTestGameState({
			songs: new Array(100).fill({ id: 'test' }),
			fans: 10_000,
			money: 4_999
		});

		expect(unlockPhysicalAlbums(state)).toBe(false);
	});

	it('should return true when all requirements are met', () => {
		const state = createTestGameState({
			songs: new Array(100).fill({ id: 'test' }),
			fans: 10_000,
			money: 5_000
		});

		expect(unlockPhysicalAlbums(state)).toBe(true);
	});

	it('should return true when requirements are exceeded', () => {
		const state = createTestGameState({
			songs: new Array(150).fill({ id: 'test' }),
			fans: 20_000,
			money: 10_000
		});

		expect(unlockPhysicalAlbums(state)).toBe(true);
	});
});

// ============================================================================
// VARIANT GENERATION TESTS
// ============================================================================

describe('generateVariants', () => {
	it('should return 1 variant for low fan counts', () => {
		const state = createTestGameState({ fans: 0 });
		expect(generateVariants(state)).toBe(1);

		const state2 = createTestGameState({ fans: 49_999 });
		expect(generateVariants(state2)).toBe(1);
	});

	it('should return 2 variants at 50k fans', () => {
		const state = createTestGameState({ fans: 50_000 });
		expect(generateVariants(state)).toBe(2);

		const state2 = createTestGameState({ fans: 100_000 });
		expect(generateVariants(state2)).toBe(2);
	});

	it('should return 3 variants at 200k fans', () => {
		const state = createTestGameState({ fans: 200_000 });
		expect(generateVariants(state)).toBe(3);

		const state2 = createTestGameState({ fans: 500_000 });
		expect(generateVariants(state2)).toBe(3);
	});

	it('should return 4 variants at 1M fans', () => {
		const state = createTestGameState({ fans: 1_000_000 });
		expect(generateVariants(state)).toBe(4);

		const state2 = createTestGameState({ fans: 5_000_000 });
		expect(generateVariants(state2)).toBe(4);
	});
});

// ============================================================================
// PAYOUT CALCULATION TESTS
// ============================================================================

describe('calculateAlbumPayout', () => {
	it('should calculate base payout with no fans and 1 variant', () => {
		const state = createTestGameState({ fans: 0 });
		const payout = calculateAlbumPayout(state, MIN_SONGS_FOR_ALBUM, 1);

		// Base: 5 songs * $50k per song = $250k
		const expectedBase = MIN_SONGS_FOR_ALBUM * ALBUM_PAYOUT_PER_SONG;
		expect(payout).toBe(expectedBase);
	});

	it('should include fan bonus in payout', () => {
		const state = createTestGameState({ fans: 10_000 });
		const payout = calculateAlbumPayout(state, MIN_SONGS_FOR_ALBUM, 1);

		// Base: 5 songs * $50k = $250k
		// Fan bonus: 10k fans * $0.50 = $5k
		// Total: $255k
		const expectedBase = MIN_SONGS_FOR_ALBUM * ALBUM_PAYOUT_PER_SONG;
		const expectedFanBonus = 10_000 * ALBUM_FAN_MULTIPLIER;
		const expected = expectedBase + expectedFanBonus;

		expect(payout).toBe(expected);
	});

	it('should multiply total by variant count', () => {
		const state = createTestGameState({ fans: 10_000 });
		const payout = calculateAlbumPayout(state, MIN_SONGS_FOR_ALBUM, 2);

		// Base: 5 songs * $50k = $250k
		// Fan bonus: 10k fans * $0.50 = $5k
		// Subtotal: $255k
		// With 2 variants: $255k * 2 = $510k
		const expectedBase = MIN_SONGS_FOR_ALBUM * ALBUM_PAYOUT_PER_SONG;
		const expectedFanBonus = 10_000 * ALBUM_FAN_MULTIPLIER;
		const expected = (expectedBase + expectedFanBonus) * 2;

		expect(payout).toBe(expected);
	});

	it('should scale with more songs', () => {
		const state = createTestGameState({ fans: 10_000 });
		const payout = calculateAlbumPayout(state, 10, 1);

		// Base: 10 songs * $50k = $500k
		// Fan bonus: 10k fans * $0.50 = $5k
		// Total: $505k
		const expectedBase = 10 * ALBUM_PAYOUT_PER_SONG;
		const expectedFanBonus = 10_000 * ALBUM_FAN_MULTIPLIER;
		const expected = expectedBase + expectedFanBonus;

		expect(payout).toBe(expected);
	});

	it('should scale with large fan counts', () => {
		const state = createTestGameState({ fans: 1_000_000 });
		const payout = calculateAlbumPayout(state, MIN_SONGS_FOR_ALBUM, 4);

		// Base: 5 songs * $50k = $250k
		// Fan bonus: 1M fans * $0.50 = $500k
		// Subtotal: $750k
		// With 4 variants: $750k * 4 = $3M
		const expectedBase = MIN_SONGS_FOR_ALBUM * ALBUM_PAYOUT_PER_SONG;
		const expectedFanBonus = 1_000_000 * ALBUM_FAN_MULTIPLIER;
		const expected = (expectedBase + expectedFanBonus) * 4;

		expect(payout).toBe(expected);
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
		const state = createTestGameState({ fans: 10_000 });
		const album = releaseAlbum(state, false);

		expect(album.id).toBe('test-uuid-0');
		expect(album.name).toBeTruthy();
		expect(typeof album.name).toBe('string');
		expect(album.songCount).toBe(MIN_SONGS_FOR_ALBUM);
		expect(album.releasedAt).toBeGreaterThan(0);
		expect(album.payout).toBeGreaterThan(0);
		expect(album.variantCount).toBeGreaterThan(0);
		expect(album.isRerelease).toBe(false);
	});

	it('should mark re-releases correctly', () => {
		const state = createTestGameState({ fans: 10_000 });
		const album = releaseAlbum(state, true);

		expect(album.isRerelease).toBe(true);
	});

	it('should generate appropriate variants based on fan count', () => {
		const state1 = createTestGameState({ fans: 0 });
		const album1 = releaseAlbum(state1, false);
		expect(album1.variantCount).toBe(1);

		const state2 = createTestGameState({ fans: 50_000 });
		const album2 = releaseAlbum(state2, false);
		expect(album2.variantCount).toBe(2);

		const state3 = createTestGameState({ fans: 1_000_000 });
		const album3 = releaseAlbum(state3, false);
		expect(album3.variantCount).toBe(4);
	});

	it('should calculate correct payout', () => {
		const state = createTestGameState({ fans: 10_000 });
		const album = releaseAlbum(state, false);

		const expectedPayout = calculateAlbumPayout(state, MIN_SONGS_FOR_ALBUM, 1);
		expect(album.payout).toBe(expectedPayout);
	});
});

// ============================================================================
// ALBUM PROCESSING TESTS
// ============================================================================

describe('processPhysicalAlbums', () => {
	beforeEach(() => {
		mockUuidCounter = 0;
		vi.stubGlobal('crypto', { randomUUID: mockUuid });
	});

	it('should do nothing if physical albums not unlocked', () => {
		const state = createTestGameState({
			songs: new Array(20).fill({ id: 'test' }),
			fans: 10_000,
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, physicalAlbums: false }
		});

		const initialMoney = state.money;
		processPhysicalAlbums(state, 100);

		expect(state.physicalAlbums.length).toBe(0);
		expect(state.money).toBe(initialMoney);
	});

	it('should not release album with fewer than SONGS_PER_ALBUM songs', () => {
		const state = createTestGameState({
			songs: new Array(9).fill({ id: 'test' }),
			fans: 10_000,
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, physicalAlbums: true }
		});

		processPhysicalAlbums(state, 100);

		expect(state.physicalAlbums.length).toBe(0);
	});

	it('should release first album at 10 songs', () => {
		const state = createTestGameState({
			songs: new Array(10).fill({ id: 'test' }),
			fans: 10_000,
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, physicalAlbums: true }
		});

		const initialMoney = state.money;
		processPhysicalAlbums(state, 100);

		expect(state.physicalAlbums.length).toBe(1);
		expect(state.physicalAlbums[0].id).toBe('test-uuid-0');
		expect(state.physicalAlbums[0].isRerelease).toBe(false);
		expect(state.money).toBeGreaterThan(initialMoney);
	});

	it('should release second album at 20 songs', () => {
		const state = createTestGameState({
			songs: new Array(20).fill({ id: 'test' }),
			fans: 10_000,
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, physicalAlbums: true }
		});

		processPhysicalAlbums(state, 100);

		expect(state.physicalAlbums.length).toBe(2);
		expect(state.physicalAlbums[0].id).toBe('test-uuid-0');
		expect(state.physicalAlbums[1].id).toBe('test-uuid-1');
	});

	it('should release multiple albums if far behind', () => {
		const state = createTestGameState({
			songs: new Array(35).fill({ id: 'test' }),
			fans: 10_000,
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, physicalAlbums: true }
		});

		processPhysicalAlbums(state, 100);

		// 35 songs / 10 = 3 albums
		expect(state.physicalAlbums.length).toBe(3);
	});

	it('should not release duplicate albums on subsequent calls', () => {
		const state = createTestGameState({
			songs: new Array(20).fill({ id: 'test' }),
			fans: 10_000,
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, physicalAlbums: true }
		});

		processPhysicalAlbums(state, 100);
		const firstCallCount = state.physicalAlbums.length;

		processPhysicalAlbums(state, 100);
		const secondCallCount = state.physicalAlbums.length;

		expect(firstCallCount).toBe(2);
		expect(secondCallCount).toBe(2); // Should not increase
	});

	it('should add payout to player money', () => {
		const state = createTestGameState({
			songs: new Array(10).fill({ id: 'test' }),
			fans: 10_000,
			money: 1000,
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, physicalAlbums: true }
		});

		const initialMoney = state.money;
		processPhysicalAlbums(state, 100);

		expect(state.money).toBeGreaterThan(initialMoney);
		expect(state.money).toBe(initialMoney + state.physicalAlbums[0].payout);
	});

	it('should handle progressive releases as songs increase', () => {
		const state = createTestGameState({
			songs: new Array(10).fill({ id: 'test' }),
			fans: 10_000,
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, physicalAlbums: true }
		});

		// First milestone - 10 songs
		processPhysicalAlbums(state, 100);
		expect(state.physicalAlbums.length).toBe(1);

		// Add more songs to reach next milestone
		state.songs = new Array(20).fill({ id: 'test' });
		processPhysicalAlbums(state, 100);
		expect(state.physicalAlbums.length).toBe(2);

		// Add more songs to reach next milestone
		state.songs = new Array(30).fill({ id: 'test' });
		processPhysicalAlbums(state, 100);
		expect(state.physicalAlbums.length).toBe(3);
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

	it('should return null if physical albums not unlocked', () => {
		const state = createTestGameState({
			fans: 10_000,
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, physicalAlbums: false }
		});

		const result = rereleaseAlbum(state);
		expect(result).toBeNull();
		expect(state.physicalAlbums.length).toBe(0);
	});

	it('should create a re-release album when unlocked', () => {
		const state = createTestGameState({
			fans: 10_000,
			money: 1000,
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, physicalAlbums: true }
		});

		const album = rereleaseAlbum(state);

		expect(album).not.toBeNull();
		expect(album!.isRerelease).toBe(true);
		expect(state.physicalAlbums.length).toBe(1);
		expect(state.physicalAlbums[0]).toBe(album);
	});

	it('should add payout to player money', () => {
		const state = createTestGameState({
			fans: 10_000,
			money: 1000,
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, physicalAlbums: true }
		});

		const initialMoney = state.money;
		const album = rereleaseAlbum(state);

		expect(state.money).toBeGreaterThan(initialMoney);
		expect(state.money).toBe(initialMoney + album!.payout);
	});

	it('should allow multiple re-releases', () => {
		const state = createTestGameState({
			fans: 10_000,
			money: 1000,
			unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, physicalAlbums: true }
		});

		const album1 = rereleaseAlbum(state);
		const album2 = rereleaseAlbum(state);

		expect(state.physicalAlbums.length).toBe(2);
		expect(album1!.id).not.toBe(album2!.id);
		expect(album1!.isRerelease).toBe(true);
		expect(album2!.isRerelease).toBe(true);
	});
});
