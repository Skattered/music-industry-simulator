/**
 * Unit tests for System Unlocks and Phase Progression
 */

import { describe, it, expect, vi } from 'vitest';
import {
	checkPhaseProgression,
	checkPhaseUnlocks,
	checkPhysicalAlbumUnlock,
	checkTourUnlock,
	checkPrestigeUnlock,
	checkPlatformUnlock,
	checkGPUUnlock,
	checkTrendResearchUnlock
} from './unlocks';
import type { GameState, Artist, UnlockedSystems, Phase } from '../game/types';
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
	GAME_VERSION
} from '../game/config';

// Mock the toast store to prevent errors during tests
vi.mock('../stores/toasts.svelte', () => ({
	toastStore: {
		unlock: vi.fn(),
		success: vi.fn(),
		info: vi.fn(),
		warning: vi.fn(),
		error: vi.fn()
	}
}));

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

// ============================================================================
// PHASE PROGRESSION TESTS
// ============================================================================

describe('checkPhaseProgression', () => {
	it('should not advance from phase 1 without meeting requirements', () => {
		const state = createTestGameState({
			phase: 1,
			fans: 100_000, // Not enough (need 1M)
			songs: [],
			money: 1000,
			techTier: 1
		});

		const unlocked = checkPhaseProgression(state);

		expect(unlocked).toBe(false);
		expect(state.phase).toBe(1);
	});

	it('should advance from phase 1 to phase 2 when all requirements met', () => {
		// Create 1000 songs
		const songs = Array.from({ length: 1000 }, (_, i) => ({
			id: `song-${i}`,
			name: `Song ${i}`,
			genre: 'pop' as const,
			createdAt: Date.now(),
			incomePerSecond: 1,
			fanGenerationRate: 10,
			isTrending: false
		}));

		const state = createTestGameState({
			phase: 1,
			fans: 1_000_000, // 1M fans
			songs,
			money: 5_000_000, // $5M
			techTier: 2
		});

		const unlocked = checkPhaseProgression(state);

		expect(unlocked).toBe(true);
		expect(state.phase).toBe(2);
	});

	it('should not advance to phase 2 without enough fans', () => {
		const songs = Array.from({ length: 1000 }, (_, i) => ({
			id: `song-${i}`,
			name: `Song ${i}`,
			genre: 'pop' as const,
			createdAt: Date.now(),
			incomePerSecond: 1,
			fanGenerationRate: 10,
			isTrending: false
		}));

		const state = createTestGameState({
			phase: 1,
			fans: 500_000, // Not enough (need 1M)
			songs,
			money: 5_000_000,
			techTier: 2
		});

		const unlocked = checkPhaseProgression(state);

		expect(unlocked).toBe(false);
		expect(state.phase).toBe(1);
	});

	it('should not advance to phase 2 without enough songs', () => {
		const state = createTestGameState({
			phase: 1,
			fans: 1_000_000,
			songs: [], // Not enough (need 1000)
			money: 5_000_000,
			techTier: 2
		});

		const unlocked = checkPhaseProgression(state);

		expect(unlocked).toBe(false);
		expect(state.phase).toBe(1);
	});

	it('should not advance to phase 2 without enough money', () => {
		const songs = Array.from({ length: 1000 }, (_, i) => ({
			id: `song-${i}`,
			name: `Song ${i}`,
			genre: 'pop' as const,
			createdAt: Date.now(),
			incomePerSecond: 1,
			fanGenerationRate: 10,
			isTrending: false
		}));

		const state = createTestGameState({
			phase: 1,
			fans: 1_000_000,
			songs,
			money: 1_000_000, // Not enough (need $5M)
			techTier: 2
		});

		const unlocked = checkPhaseProgression(state);

		expect(unlocked).toBe(false);
		expect(state.phase).toBe(1);
	});

	it('should not advance to phase 2 without correct tech tier', () => {
		const songs = Array.from({ length: 1000 }, (_, i) => ({
			id: `song-${i}`,
			name: `Song ${i}`,
			genre: 'pop' as const,
			createdAt: Date.now(),
			incomePerSecond: 1,
			fanGenerationRate: 10,
			isTrending: false
		}));

		const state = createTestGameState({
			phase: 1,
			fans: 1_000_000,
			songs,
			money: 5_000_000,
			techTier: 1 // Not enough (need tier 2)
		});

		const unlocked = checkPhaseProgression(state);

		expect(unlocked).toBe(false);
		expect(state.phase).toBe(1);
	});

	it('should advance from phase 2 to phase 3 when requirements met', () => {
		// Create 50 albums
		const albums = Array.from({ length: 50 }, (_, i) => ({
			id: `album-${i}`,
			name: `Album ${i}`,
			songCount: 10,
			releasedAt: Date.now(),
			payout: 100000,
			variantCount: 1,
			isRerelease: false
		}));

		const state = createTestGameState({
			phase: 2,
			fans: 10_000_000, // 10M fans
			physicalAlbums: albums,
			techTier: 3
		});

		const unlocked = checkPhaseProgression(state);

		expect(unlocked).toBe(true);
		expect(state.phase).toBe(3);
	});

	it('should advance from phase 3 to phase 4 when requirements met', () => {
		// Create 200 completed tours
		const tours = Array.from({ length: 200 }, (_, i) => ({
			id: `tour-${i}`,
			name: `Tour ${i}`,
			startedAt: Date.now() - 200000,
			completedAt: Date.now() - 10000,
			incomePerSecond: 10000,
			usesScarcity: false
		}));

		const state = createTestGameState({
			phase: 3,
			fans: 100_000_000, // 100M fans
			tours,
			techTier: 6
		});

		const unlocked = checkPhaseProgression(state);

		expect(unlocked).toBe(true);
		expect(state.phase).toBe(4);
	});

	it('should not count incomplete tours for phase 4 requirements', () => {
		// Create 200 tours but only 100 are completed
		const tours = [
			...Array.from({ length: 100 }, (_, i) => ({
				id: `tour-complete-${i}`,
				name: `Tour ${i}`,
				startedAt: Date.now() - 200000,
				completedAt: Date.now() - 10000,
				incomePerSecond: 10000,
				usesScarcity: false
			})),
			...Array.from({ length: 100 }, (_, i) => ({
				id: `tour-incomplete-${i}`,
				name: `Tour ${i + 100}`,
				startedAt: Date.now(),
				completedAt: null,
				incomePerSecond: 10000,
				usesScarcity: false
			}))
		];

		const state = createTestGameState({
			phase: 3,
			fans: 100_000_000,
			tours,
			techTier: 6
		});

		const unlocked = checkPhaseProgression(state);

		expect(unlocked).toBe(false);
		expect(state.phase).toBe(3);
	});

	it('should advance from phase 4 to phase 5 when requirements met', () => {
		// Create 3 platforms
		const platforms = Array.from({ length: 3 }, (_, i) => ({
			id: `platform-${i}`,
			type: 'streaming' as const,
			name: `Platform ${i}`,
			cost: 10_000_000,
			acquiredAt: Date.now(),
			incomePerSecond: 10000,
			controlContribution: 15
		}));

		const state = createTestGameState({
			phase: 4,
			fans: 1_000_000_000, // 1B fans
			ownedPlatforms: platforms,
			techTier: 7
		});

		const unlocked = checkPhaseProgression(state);

		expect(unlocked).toBe(true);
		expect(state.phase).toBe(5);
	});

	it('should not advance past phase 5', () => {
		const platforms = Array.from({ length: 6 }, (_, i) => ({
			id: `platform-${i}`,
			type: 'streaming' as const,
			name: `Platform ${i}`,
			cost: 10_000_000,
			acquiredAt: Date.now(),
			incomePerSecond: 10000,
			controlContribution: 15
		}));

		const state = createTestGameState({
			phase: 5 as Phase,
			fans: 10_000_000_000, // 10B fans
			ownedPlatforms: platforms,
			techTier: 7
		});

		const unlocked = checkPhaseProgression(state);

		expect(unlocked).toBe(false);
		expect(state.phase).toBe(5);
	});
});

// ============================================================================
// SYSTEM UNLOCK TESTS
// ============================================================================

describe('checkPhysicalAlbumUnlock', () => {
	it('should not unlock without tier2_improved upgrade', () => {
		const state = createTestGameState({
			upgrades: {}
		});

		const unlocked = checkPhysicalAlbumUnlock(state);

		expect(unlocked).toBe(false);
		expect(state.unlockedSystems.physicalAlbums).toBe(false);
	});

	it('should unlock with tier2_improved upgrade', () => {
		const state = createTestGameState({
			upgrades: {
				tier2_improved: { purchasedAt: Date.now(), tier: 2 }
			}
		});

		const unlocked = checkPhysicalAlbumUnlock(state);

		expect(unlocked).toBe(true);
		expect(state.unlockedSystems.physicalAlbums).toBe(true);
	});

	it('should not trigger unlock twice', () => {
		const state = createTestGameState({
			upgrades: {
				tier2_improved: { purchasedAt: Date.now(), tier: 2 }
			},
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				physicalAlbums: true
			}
		});

		const unlocked = checkPhysicalAlbumUnlock(state);

		expect(unlocked).toBe(false);
	});
});

describe('checkTourUnlock', () => {
	it('should not unlock without all requirements', () => {
		const state = createTestGameState({
			upgrades: {
				tier3_advanced: { purchasedAt: Date.now(), tier: 3 }
			},
			fans: 50_000, // Not enough
			physicalAlbums: []
		});

		const unlocked = checkTourUnlock(state);

		expect(unlocked).toBe(false);
		expect(state.unlockedSystems.tours).toBe(false);
	});

	it('should unlock with all requirements met', () => {
		const albums = Array.from({ length: 10 }, (_, i) => ({
			id: `album-${i}`,
			name: `Album ${i}`,
			songCount: 10,
			releasedAt: Date.now(),
			payout: 100000,
			variantCount: 1,
			isRerelease: false
		}));

		const state = createTestGameState({
			upgrades: {
				tier3_advanced: { purchasedAt: Date.now(), tier: 3 }
			},
			fans: 100_000,
			physicalAlbums: albums
		});

		const unlocked = checkTourUnlock(state);

		expect(unlocked).toBe(true);
		expect(state.unlockedSystems.tours).toBe(true);
	});
});

describe('checkPrestigeUnlock', () => {
	it('should unlock with tier3_basic upgrade', () => {
		const state = createTestGameState({
			upgrades: {
				tier3_basic: { purchasedAt: Date.now(), tier: 3 }
			}
		});

		const unlocked = checkPrestigeUnlock(state);

		expect(unlocked).toBe(true);
		expect(state.unlockedSystems.prestige).toBe(true);
	});
});

describe('checkGPUUnlock', () => {
	it('should unlock with tier3_basic upgrade', () => {
		const state = createTestGameState({
			upgrades: {
				tier3_basic: { purchasedAt: Date.now(), tier: 3 }
			}
		});

		const unlocked = checkGPUUnlock(state);

		expect(unlocked).toBe(true);
		expect(state.unlockedSystems.gpu).toBe(true);
	});
});

describe('checkTrendResearchUnlock', () => {
	it('should unlock with tier1_advanced upgrade', () => {
		const state = createTestGameState({
			upgrades: {
				tier1_advanced: { purchasedAt: Date.now(), tier: 1 }
			}
		});

		const unlocked = checkTrendResearchUnlock(state);

		expect(unlocked).toBe(true);
		expect(state.unlockedSystems.trendResearch).toBe(true);
	});
});

describe('checkPlatformUnlock', () => {
	it('should not unlock without all requirements', () => {
		const state = createTestGameState({
			upgrades: {
				tier6_basic: { purchasedAt: Date.now(), tier: 6 }
			},
			fans: 500_000, // Not enough
			tours: []
		});

		const unlocked = checkPlatformUnlock(state);

		expect(unlocked).toBe(false);
		expect(state.unlockedSystems.platformOwnership).toBe(false);
	});

	it('should unlock with all requirements met', () => {
		const tours = Array.from({ length: 50 }, (_, i) => ({
			id: `tour-${i}`,
			name: `Tour ${i}`,
			startedAt: Date.now() - 200000,
			completedAt: Date.now() - 10000,
			incomePerSecond: 10000,
			usesScarcity: false
		}));

		const state = createTestGameState({
			upgrades: {
				tier6_basic: { purchasedAt: Date.now(), tier: 6 }
			},
			fans: 1_000_000,
			tours
		});

		const unlocked = checkPlatformUnlock(state);

		expect(unlocked).toBe(true);
		expect(state.unlockedSystems.platformOwnership).toBe(true);
	});
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('checkPhaseUnlocks (integration)', () => {
	it('should check both phase progression and system unlocks', () => {
		const songs = Array.from({ length: 1000 }, (_, i) => ({
			id: `song-${i}`,
			name: `Song ${i}`,
			genre: 'pop' as const,
			createdAt: Date.now(),
			incomePerSecond: 1,
			fanGenerationRate: 10,
			isTrending: false
		}));

		const state = createTestGameState({
			phase: 1,
			fans: 1_000_000,
			songs,
			money: 5_000_000,
			techTier: 2,
			upgrades: {
				tier2_improved: { purchasedAt: Date.now(), tier: 2 }
			}
		});

		checkPhaseUnlocks(state);

		// Should have advanced to phase 2
		expect(state.phase).toBe(2);

		// Should have unlocked physical albums
		expect(state.unlockedSystems.physicalAlbums).toBe(true);
	});
});
