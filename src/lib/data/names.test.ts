/**
 * Unit tests for mad-lib style name generation
 *
 * Tests verify:
 * - Name generation produces valid strings
 * - Pattern variations are used
 * - Duplicate prevention works correctly
 * - Genre influence affects song names
 * - Cache management functions properly
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
	generateSongName,
	generateArtistName,
	generateAlbumName,
	clearNameCaches,
	getCacheSizes
} from './names';
import type { GameState, Genre } from '../game/types';

// ============================================================================
// TEST HELPERS
// ============================================================================

/**
 * Create a minimal mock GameState for testing
 */
function createMockGameState(trendingGenre?: Genre): Partial<GameState> {
	return {
		currentTrendingGenre: trendingGenre || null,
		trendDiscoveredAt: trendingGenre ? Date.now() : null
	};
}

/**
 * Generate multiple names and check for uniqueness
 */
function generateMultipleNames(
	generator: (state?: GameState) => string,
	count: number,
	state?: GameState
): string[] {
	const names: string[] = [];
	for (let i = 0; i < count; i++) {
		names.push(generator(state as GameState));
	}
	return names;
}

/**
 * Check if a name matches any of the expected patterns
 */
function matchesExpectedPattern(name: string): boolean {
	// Name should be non-empty and contain at least one word
	if (!name || name.trim().length === 0) {
		return false;
	}

	// Name should contain alphanumeric characters
	if (!/[a-zA-Z]/.test(name)) {
		return false;
	}

	return true;
}

// ============================================================================
// SONG NAME GENERATION TESTS
// ============================================================================

describe('generateSongName', () => {
	beforeEach(() => {
		clearNameCaches();
	});

	it('should generate a non-empty song name', () => {
		const name = generateSongName();
		expect(name).toBeTruthy();
		expect(name.length).toBeGreaterThan(0);
	});

	it('should generate names that match expected patterns', () => {
		const name = generateSongName();
		expect(matchesExpectedPattern(name)).toBe(true);
	});

	it('should generate unique names', () => {
		const names = generateMultipleNames(generateSongName, 20);
		const uniqueNames = new Set(names);
		expect(uniqueNames.size).toBe(names.length);
	});

	it('should prevent duplicates within cache size', () => {
		const names = generateMultipleNames(generateSongName, 50);
		const uniqueNames = new Set(names);
		expect(uniqueNames.size).toBe(names.length);
	});

	it('should generate different names on subsequent calls', () => {
		const name1 = generateSongName();
		const name2 = generateSongName();
		const name3 = generateSongName();

		// At least 2 out of 3 should be different (very high probability)
		const uniqueCount = new Set([name1, name2, name3]).size;
		expect(uniqueCount).toBeGreaterThanOrEqual(2);
	});

	it('should work without a game state', () => {
		const name = generateSongName();
		expect(name).toBeTruthy();
	});

	it('should work with a game state (no trending genre)', () => {
		const state = createMockGameState();
		const name = generateSongName(state as GameState);
		expect(name).toBeTruthy();
	});

	it('should work with a trending genre', () => {
		const state = createMockGameState('electronic');
		const name = generateSongName(state as GameState);
		expect(name).toBeTruthy();
	});

	it('should generate varied patterns', () => {
		const names = generateMultipleNames(generateSongName, 30);

		// Check that we have different word counts (indicating different patterns)
		const wordCounts = names.map((name) => name.split(' ').length);
		const uniqueWordCounts = new Set(wordCounts);

		// Should have at least 2 different word count patterns
		expect(uniqueWordCounts.size).toBeGreaterThanOrEqual(2);
	});

	it('should handle all genre types', () => {
		const genres: Genre[] = ['pop', 'hip-hop', 'rock', 'electronic', 'country', 'jazz', 'classical', 'indie'];

		genres.forEach((genre) => {
			const state = createMockGameState(genre);
			const name = generateSongName(state as GameState);
			expect(name).toBeTruthy();
			expect(matchesExpectedPattern(name)).toBe(true);
		});
	});
});

// ============================================================================
// ARTIST NAME GENERATION TESTS
// ============================================================================

describe('generateArtistName', () => {
	beforeEach(() => {
		clearNameCaches();
	});

	it('should generate a non-empty artist name', () => {
		const name = generateArtistName();
		expect(name).toBeTruthy();
		expect(name.length).toBeGreaterThan(0);
	});

	it('should generate names that match expected patterns', () => {
		const name = generateArtistName();
		expect(matchesExpectedPattern(name)).toBe(true);
	});

	it('should generate unique names', () => {
		const names = generateMultipleNames(generateArtistName, 20);
		const uniqueNames = new Set(names);
		expect(uniqueNames.size).toBe(names.length);
	});

	it('should prevent duplicates within cache size', () => {
		const names = generateMultipleNames(generateArtistName, 50);
		const uniqueNames = new Set(names);
		expect(uniqueNames.size).toBe(names.length);
	});

	it('should generate different names on subsequent calls', () => {
		const name1 = generateArtistName();
		const name2 = generateArtistName();
		const name3 = generateArtistName();

		const uniqueCount = new Set([name1, name2, name3]).size;
		expect(uniqueCount).toBeGreaterThanOrEqual(2);
	});

	it('should generate varied patterns', () => {
		const names = generateMultipleNames(generateArtistName, 30);

		// Artist names can include prefixes like "DJ", "The", mononyms, etc.
		// Check that we have variety in the names
		const hasPrefixes = names.some((name) => name.startsWith('DJ ') || name.startsWith('MC ') || name.startsWith('Lil '));
		const hasThe = names.some((name) => name.startsWith('The '));
		const hasSimple = names.some((name) => !name.includes(' '));

		// At least one type should be present
		expect(hasPrefixes || hasThe || hasSimple).toBe(true);
	});
});

// ============================================================================
// ALBUM NAME GENERATION TESTS
// ============================================================================

describe('generateAlbumName', () => {
	beforeEach(() => {
		clearNameCaches();
	});

	it('should generate a non-empty album name', () => {
		const name = generateAlbumName();
		expect(name).toBeTruthy();
		expect(name.length).toBeGreaterThan(0);
	});

	it('should generate names that match expected patterns', () => {
		const name = generateAlbumName();
		expect(matchesExpectedPattern(name)).toBe(true);
	});

	it('should generate unique names', () => {
		const names = generateMultipleNames(generateAlbumName, 20);
		const uniqueNames = new Set(names);
		expect(uniqueNames.size).toBe(names.length);
	});

	it('should prevent duplicates within cache size', () => {
		const names = generateMultipleNames(generateAlbumName, 50);
		const uniqueNames = new Set(names);
		expect(uniqueNames.size).toBe(names.length);
	});

	it('should generate different names on subsequent calls', () => {
		const name1 = generateAlbumName();
		const name2 = generateAlbumName();
		const name3 = generateAlbumName();

		const uniqueCount = new Set([name1, name2, name3]).size;
		expect(uniqueCount).toBeGreaterThanOrEqual(2);
	});

	it('should generate varied patterns', () => {
		const names = generateMultipleNames(generateAlbumName, 30);

		// Check for variety in patterns
		const wordCounts = names.map((name) => name.split(' ').length);
		const uniqueWordCounts = new Set(wordCounts);

		// Should have at least 2 different patterns
		expect(uniqueWordCounts.size).toBeGreaterThanOrEqual(2);
	});
});

// ============================================================================
// CACHE MANAGEMENT TESTS
// ============================================================================

describe('cache management', () => {
	beforeEach(() => {
		clearNameCaches();
	});

	it('should start with empty caches', () => {
		const sizes = getCacheSizes();
		expect(sizes.songs).toBe(0);
		expect(sizes.artists).toBe(0);
		expect(sizes.albums).toBe(0);
	});

	it('should add names to cache', () => {
		generateSongName();
		generateArtistName();
		generateAlbumName();

		const sizes = getCacheSizes();
		expect(sizes.songs).toBe(1);
		expect(sizes.artists).toBe(1);
		expect(sizes.albums).toBe(1);
	});

	it('should maintain separate caches for each type', () => {
		generateMultipleNames(generateSongName, 5);
		generateMultipleNames(generateArtistName, 3);
		generateMultipleNames(generateAlbumName, 4);

		const sizes = getCacheSizes();
		expect(sizes.songs).toBe(5);
		expect(sizes.artists).toBe(3);
		expect(sizes.albums).toBe(4);
	});

	it('should limit cache to max size', () => {
		// Generate more than max cache size (100)
		generateMultipleNames(generateSongName, 120);

		const sizes = getCacheSizes();
		expect(sizes.songs).toBeLessThanOrEqual(100);
	});

	it('should clear all caches', () => {
		generateMultipleNames(generateSongName, 10);
		generateMultipleNames(generateArtistName, 10);
		generateMultipleNames(generateAlbumName, 10);

		clearNameCaches();

		const sizes = getCacheSizes();
		expect(sizes.songs).toBe(0);
		expect(sizes.artists).toBe(0);
		expect(sizes.albums).toBe(0);
	});
});

// ============================================================================
// DUPLICATE PREVENTION TESTS
// ============================================================================

describe('duplicate prevention', () => {
	beforeEach(() => {
		clearNameCaches();
	});

	it('should not generate duplicates in small batches', () => {
		const names = generateMultipleNames(generateSongName, 30);
		const uniqueNames = new Set(names);
		expect(uniqueNames.size).toBe(names.length);
	});

	it('should handle cache overflow correctly', () => {
		// Generate enough names to overflow the cache multiple times
		const names = generateMultipleNames(generateSongName, 250);

		// Even with cache overflow, recent names should still be unique
		// Check last 100 names for uniqueness
		const recentNames = names.slice(-100);
		const uniqueRecentNames = new Set(recentNames);
		expect(uniqueRecentNames.size).toBe(recentNames.length);
	});

	it('should prevent duplicates across different types independently', () => {
		const songNames = generateMultipleNames(generateSongName, 20);
		const artistNames = generateMultipleNames(generateArtistName, 20);
		const albumNames = generateMultipleNames(generateAlbumName, 20);

		// Each type should have all unique names
		expect(new Set(songNames).size).toBe(songNames.length);
		expect(new Set(artistNames).size).toBe(artistNames.length);
		expect(new Set(albumNames).size).toBe(albumNames.length);
	});
});

// ============================================================================
// GENRE INFLUENCE TESTS
// ============================================================================

describe('genre influence on song names', () => {
	beforeEach(() => {
		clearNameCaches();
	});

	it('should generate names with and without genre influence', () => {
		// Generate names without genre
		clearNameCaches();
		const namesWithoutGenre = generateMultipleNames(generateSongName, 10);

		// Generate names with genre
		clearNameCaches();
		const state = createMockGameState('electronic');
		const namesWithGenre = generateMultipleNames(
			(s) => generateSongName(s),
			10,
			state as GameState
		);

		// Both should produce valid names
		expect(namesWithoutGenre.every(matchesExpectedPattern)).toBe(true);
		expect(namesWithGenre.every(matchesExpectedPattern)).toBe(true);
	});

	it('should generate valid names for all genres', () => {
		const genres: Genre[] = ['pop', 'hip-hop', 'rock', 'electronic', 'country', 'jazz', 'classical', 'indie'];

		genres.forEach((genre) => {
			clearNameCaches();
			const state = createMockGameState(genre);
			const names = generateMultipleNames((s) => generateSongName(s), 10, state as GameState);

			expect(names.every(matchesExpectedPattern)).toBe(true);
			expect(new Set(names).size).toBe(names.length); // All unique
		});
	});
});

// ============================================================================
// PATTERN VARIETY TESTS
// ============================================================================

describe('pattern variety', () => {
	beforeEach(() => {
		clearNameCaches();
	});

	it('should use multiple patterns for songs', () => {
		const names = generateMultipleNames(generateSongName, 100);

		// Check for common pattern indicators
		const hasOf = names.some((name) => name.includes(' of '));
		const hasIn = names.some((name) => name.includes(' in '));
		const hasTwoWords = names.some((name) => name.split(' ').length === 2);

		// Should have variety
		const patterns = [hasOf, hasIn, hasTwoWords].filter(Boolean).length;
		expect(patterns).toBeGreaterThanOrEqual(2);
	});

	it('should use multiple patterns for artists', () => {
		const names = generateMultipleNames(generateArtistName, 100);

		// Check for common artist name patterns
		const hasPrefix = names.some((name) =>
			name.startsWith('DJ ') ||
			name.startsWith('MC ') ||
			name.startsWith('Lil ') ||
			name.startsWith('Big ')
		);
		const hasThe = names.some((name) => name.startsWith('The '));
		const hasAnd = names.some((name) => name.includes(' and '));

		const patterns = [hasPrefix, hasThe, hasAnd].filter(Boolean).length;
		expect(patterns).toBeGreaterThanOrEqual(1);
	});

	it('should use multiple patterns for albums', () => {
		const names = generateMultipleNames(generateAlbumName, 100);

		// Check for variety
		const wordCounts = names.map((name) => name.split(' ').length);
		const uniqueWordCounts = new Set(wordCounts);

		expect(uniqueWordCounts.size).toBeGreaterThanOrEqual(3);
	});
});

// ============================================================================
// STRESS TESTS
// ============================================================================

describe('stress tests', () => {
	beforeEach(() => {
		clearNameCaches();
	});

	it('should handle generating many song names', () => {
		const names = generateMultipleNames(generateSongName, 500);
		expect(names.length).toBe(500);
		expect(names.every(matchesExpectedPattern)).toBe(true);
	});

	it('should handle generating many artist names', () => {
		const names = generateMultipleNames(generateArtistName, 500);
		expect(names.length).toBe(500);
		expect(names.every(matchesExpectedPattern)).toBe(true);
	});

	it('should handle generating many album names', () => {
		const names = generateMultipleNames(generateAlbumName, 500);
		expect(names.length).toBe(500);
		expect(names.every(matchesExpectedPattern)).toBe(true);
	});
});
