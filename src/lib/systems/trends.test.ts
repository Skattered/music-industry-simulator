/**
 * Unit tests for Trend Research System
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	researchTrend,
	changeTrendingGenre,
	getTrendingGenre,
	getTrendBonus
} from './trends';
import type { GameState, Genre, Artist, UnlockedSystems } from '../game/types';
import {
	TREND_RESEARCH_COST,
	TRENDING_MULTIPLIER,
	TREND_FADE_DURATION,
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
// RESEARCH TREND TESTS
// ============================================================================

describe('researchTrend', () => {
	beforeEach(() => {
		// Mock Math.random for deterministic genre selection
		vi.spyOn(Math, 'random').mockReturnValue(0.5);
		// Mock Date.now for timestamp verification
		vi.spyOn(Date, 'now').mockReturnValue(1000000);
	});

	it('should return false if trend research is not unlocked', () => {
		const state = createTestGameState({
			money: TREND_RESEARCH_COST + 1000,
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				trendResearch: false
			}
		});

		const result = researchTrend(state);

		expect(result).toBe(false);
		expect(state.money).toBe(TREND_RESEARCH_COST + 1000); // Money unchanged
		expect(state.currentTrendingGenre).toBeNull();
	});

	it('should cost money when GPU is not unlocked', () => {
		const initialMoney = TREND_RESEARCH_COST + 500;
		const state = createTestGameState({
			money: initialMoney,
			gpu: 0,
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				trendResearch: true,
				gpu: false
			}
		});

		const result = researchTrend(state);

		expect(result).toBe(true);
		expect(state.money).toBe(500); // TREND_RESEARCH_COST deducted
		expect(state.gpu).toBe(0); // GPU unchanged
		expect(state.currentTrendingGenre).not.toBeNull();
	});

	it('should cost GPU when GPU is unlocked', () => {
		const initialGPU = TREND_RESEARCH_COST + 500;
		const initialMoney = 10000;
		const state = createTestGameState({
			money: initialMoney,
			gpu: initialGPU,
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				trendResearch: true,
				gpu: true
			}
		});

		const result = researchTrend(state);

		expect(result).toBe(true);
		expect(state.gpu).toBe(500); // TREND_RESEARCH_COST deducted from GPU
		expect(state.money).toBe(initialMoney); // Money unchanged
		expect(state.currentTrendingGenre).not.toBeNull();
	});

	it('should return false if insufficient money (GPU not unlocked)', () => {
		const state = createTestGameState({
			money: TREND_RESEARCH_COST - 100,
			gpu: 0,
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				trendResearch: true,
				gpu: false
			}
		});

		const result = researchTrend(state);

		expect(result).toBe(false);
		expect(state.money).toBe(TREND_RESEARCH_COST - 100); // Unchanged
		expect(state.currentTrendingGenre).toBeNull();
	});

	it('should return false if insufficient GPU (GPU unlocked)', () => {
		const state = createTestGameState({
			money: 10000000,
			gpu: TREND_RESEARCH_COST - 100,
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				trendResearch: true,
				gpu: true
			}
		});

		const result = researchTrend(state);

		expect(result).toBe(false);
		expect(state.gpu).toBe(TREND_RESEARCH_COST - 100); // Unchanged
		expect(state.currentTrendingGenre).toBeNull();
	});

	it('should change the trending genre when successful', () => {
		const state = createTestGameState({
			money: TREND_RESEARCH_COST + 1000,
			currentTrendingGenre: null,
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				trendResearch: true
			}
		});

		const result = researchTrend(state);

		expect(result).toBe(true);
		expect(state.currentTrendingGenre).not.toBeNull();
		expect(typeof state.currentTrendingGenre).toBe('string');
	});

	it('should set trendDiscoveredAt timestamp', () => {
		const mockNow = 1234567890;
		vi.spyOn(Date, 'now').mockReturnValue(mockNow);

		const state = createTestGameState({
			money: TREND_RESEARCH_COST + 1000,
			unlockedSystems: {
				...INITIAL_UNLOCKED_SYSTEMS,
				trendResearch: true
			}
		});

		researchTrend(state);

		expect(state.trendDiscoveredAt).toBe(mockNow);
	});
});

// ============================================================================
// CHANGE TRENDING GENRE TESTS
// ============================================================================

describe('changeTrendingGenre', () => {
	beforeEach(() => {
		vi.spyOn(Math, 'random').mockReturnValue(0.5);
		vi.spyOn(Date, 'now').mockReturnValue(1000000);
	});

	it('should set a trending genre when none exists', () => {
		const state = createTestGameState({
			currentTrendingGenre: null,
			trendDiscoveredAt: null
		});

		changeTrendingGenre(state);

		expect(state.currentTrendingGenre).not.toBeNull();
		expect(state.trendDiscoveredAt).toBe(1000000);
	});

	it('should change to a different genre when one already exists', () => {
		const state = createTestGameState({
			currentTrendingGenre: 'pop',
			trendDiscoveredAt: null
		});

		// Test multiple times to ensure it changes
		let changedAtLeastOnce = false;
		for (let i = 0; i < 50; i++) {
			vi.spyOn(Math, 'random').mockReturnValue(Math.random());
			changeTrendingGenre(state);
			if (state.currentTrendingGenre !== 'pop') {
				changedAtLeastOnce = true;
				break;
			}
		}

		expect(changedAtLeastOnce).toBe(true);
	});

	it('should update trendDiscoveredAt to current timestamp', () => {
		const mockNow = 9876543210;
		vi.spyOn(Date, 'now').mockReturnValue(mockNow);

		const state = createTestGameState({
			currentTrendingGenre: null,
			trendDiscoveredAt: null
		});

		changeTrendingGenre(state);

		expect(state.trendDiscoveredAt).toBe(mockNow);
	});

	it('should select from available genres', () => {
		const state = createTestGameState({
			currentTrendingGenre: null
		});

		const validGenres: Genre[] = ['pop', 'hip-hop', 'rock', 'electronic', 'country', 'jazz', 'classical', 'indie'];

		changeTrendingGenre(state);

		expect(validGenres).toContain(state.currentTrendingGenre);
	});
});

// ============================================================================
// GET TRENDING GENRE TESTS
// ============================================================================

describe('getTrendingGenre', () => {
	it('should return current trending genre when set', () => {
		const state = createTestGameState({
			currentTrendingGenre: 'electronic'
		});

		const genre = getTrendingGenre(state);

		expect(genre).toBe('electronic');
	});

	it('should return empty string when no trend is active', () => {
		const state = createTestGameState({
			currentTrendingGenre: null
		});

		const genre = getTrendingGenre(state);

		expect(genre).toBe('');
	});
});

// ============================================================================
// GET TREND BONUS TESTS
// ============================================================================

describe('getTrendBonus', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it('should return 1.0 when no trend is active', () => {
		const state = createTestGameState({
			currentTrendingGenre: null,
			trendDiscoveredAt: null
		});

		const bonus = getTrendBonus(state);

		expect(bonus).toBe(1.0);
	});

	it('should return TRENDING_MULTIPLIER at start of trend', () => {
		const now = Date.now();
		const state = createTestGameState({
			currentTrendingGenre: 'pop',
			trendDiscoveredAt: now
		});

		vi.spyOn(Date, 'now').mockReturnValue(now);

		const bonus = getTrendBonus(state);

		expect(bonus).toBe(TRENDING_MULTIPLIER);
	});

	it('should return 1.0 after trend has fully faded', () => {
		const discoveryTime = 1000000;
		const afterFadeTime = discoveryTime + TREND_FADE_DURATION + 1000;

		const state = createTestGameState({
			currentTrendingGenre: 'rock',
			trendDiscoveredAt: discoveryTime
		});

		vi.spyOn(Date, 'now').mockReturnValue(afterFadeTime);

		const bonus = getTrendBonus(state);

		expect(bonus).toBe(1.0);
	});

	it('should fade linearly over TREND_FADE_DURATION', () => {
		const discoveryTime = 1000000;
		const halfwayTime = discoveryTime + (TREND_FADE_DURATION / 2);

		const state = createTestGameState({
			currentTrendingGenre: 'hip-hop',
			trendDiscoveredAt: discoveryTime
		});

		vi.spyOn(Date, 'now').mockReturnValue(halfwayTime);

		const bonus = getTrendBonus(state);

		// At halfway point, should be midway between TRENDING_MULTIPLIER and 1.0
		const expectedBonus = TRENDING_MULTIPLIER - ((TRENDING_MULTIPLIER - 1.0) * 0.5);
		expect(bonus).toBeCloseTo(expectedBonus, 5);
	});

	it('should gradually decrease over time', () => {
		const discoveryTime = 1000000;
		const state = createTestGameState({
			currentTrendingGenre: 'jazz',
			trendDiscoveredAt: discoveryTime
		});

		// Test at 25%, 50%, 75%, and 100% of fade duration
		const timePoints = [0.25, 0.5, 0.75, 1.0];
		const bonuses: number[] = [];

		for (const fraction of timePoints) {
			const time = discoveryTime + (TREND_FADE_DURATION * fraction);
			vi.spyOn(Date, 'now').mockReturnValue(time);
			bonuses.push(getTrendBonus(state));
		}

		// Verify bonuses are decreasing
		expect(bonuses[0]).toBeGreaterThan(bonuses[1]);
		expect(bonuses[1]).toBeGreaterThan(bonuses[2]);
		expect(bonuses[2]).toBeGreaterThan(bonuses[3]);

		// Verify first is close to max, last is 1.0
		expect(bonuses[0]).toBeCloseTo((TRENDING_MULTIPLIER + 1.0) / 2 + 0.25, 1);
		expect(bonuses[3]).toBe(1.0);
	});
});
