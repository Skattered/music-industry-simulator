/**
 * Mad-lib Style Name Generation
 *
 * Generates unique, coherent names for songs, artists, and albums using
 * multiple pattern variations and genre-specific word lists.
 *
 * Features:
 * - Multiple name patterns with random selection
 * - Genre-based name influence for songs
 * - Duplicate prevention (caches last 100 names)
 * - Reusable helper functions for random selection
 */

import type { GameState, Genre } from '../game/types';
import {
	ADJECTIVES,
	NOUNS,
	VERBS,
	EMOTIONS,
	PLACES,
	ARTIST_PREFIXES,
	ARTIST_NOUNS,
	ARTIST_ADJECTIVES,
	ALBUM_ADJECTIVES,
	ALBUM_NOUNS,
	GENRE_WORDS
} from './words';

// ============================================================================
// DUPLICATE PREVENTION
// ============================================================================

/** Cache to prevent duplicate names (stores last 100 names) */
const recentNames = {
	songs: [] as string[],
	artists: [] as string[],
	albums: [] as string[]
};

const MAX_CACHE_SIZE = 100;
const MAX_GENERATION_ATTEMPTS = 50;

/**
 * Add a name to the cache and maintain size limit
 */
function addToCache(cache: string[], name: string): void {
	cache.push(name);
	if (cache.length > MAX_CACHE_SIZE) {
		cache.shift(); // Remove oldest entry
	}
}

/**
 * Check if a name exists in the cache
 */
function isNameInCache(cache: string[], name: string): boolean {
	return cache.includes(name);
}

// ============================================================================
// RANDOM SELECTION HELPERS
// ============================================================================

/**
 * Select a random element from an array
 */
function randomElement<T>(array: T[]): T {
	return array[Math.floor(Math.random() * array.length)];
}

/**
 * Select a random element from an array, with optional genre-specific override
 */
function randomElementWithGenre<T>(
	baseArray: T[],
	genreArray: T[] | undefined,
	genreInfluence: number = 0.7
): T {
	// If genre array exists and we hit the genre influence probability, use genre array
	if (genreArray && genreArray.length > 0 && Math.random() < genreInfluence) {
		return randomElement(genreArray);
	}
	// Otherwise use base array
	return randomElement(baseArray);
}

// ============================================================================
// SONG NAME GENERATION
// ============================================================================

/**
 * Song name patterns with weights (higher = more likely)
 * Total weight: 40
 */
const SONG_PATTERNS: Array<{ weight: number; generate: (genre?: Genre) => string }> = [
	{
		weight: 10,
		generate: (genre) => {
			// Pattern: "[Adjective] [Noun]"
			const adj = randomElementWithGenre(ADJECTIVES, genre ? GENRE_WORDS[genre]?.adjectives : undefined);
			const noun = randomElementWithGenre(NOUNS, genre ? GENRE_WORDS[genre]?.nouns : undefined);
			return `${adj} ${noun}`;
		}
	},
	{
		weight: 10,
		generate: (genre) => {
			// Pattern: "[Verb] in [Place]"
			const verb = randomElementWithGenre(VERBS, genre ? GENRE_WORDS[genre]?.verbs : undefined);
			const place = randomElement(PLACES);
			return `${verb} in ${place}`;
		}
	},
	{
		weight: 8,
		generate: (genre) => {
			// Pattern: "[Emotion] [Noun]"
			const emotion = randomElement(EMOTIONS);
			const noun = randomElementWithGenre(NOUNS, genre ? GENRE_WORDS[genre]?.nouns : undefined);
			return `${emotion} ${noun}`;
		}
	},
	{
		weight: 8,
		generate: (genre) => {
			// Pattern: "[Noun] of [Place]"
			const noun = randomElementWithGenre(NOUNS, genre ? GENRE_WORDS[genre]?.nouns : undefined);
			const place = randomElement(PLACES);
			return `${noun} of ${place}`;
		}
	},
	{
		weight: 4,
		generate: () => {
			// Pattern: "[Verb] [Adverb]" (using place as adverb context)
			const verb = randomElement(VERBS);
			const place = randomElement(PLACES);
			return `${verb} ${place}`;
		}
	}
];

// Calculate total weight for weighted random selection
const TOTAL_SONG_PATTERN_WEIGHT = SONG_PATTERNS.reduce((sum, p) => sum + p.weight, 0);

/**
 * Select a random song pattern using weighted probabilities
 */
function selectSongPattern(): (genre?: Genre) => string {
	const rand = Math.random() * TOTAL_SONG_PATTERN_WEIGHT;
	let accumulated = 0;

	for (const pattern of SONG_PATTERNS) {
		accumulated += pattern.weight;
		if (rand < accumulated) {
			return pattern.generate;
		}
	}

	// Fallback (should never reach here)
	return SONG_PATTERNS[0].generate;
}

/**
 * Generate a unique song name using mad-lib style patterns
 *
 * @param state - Optional game state to influence name based on trending genre
 * @returns A unique song name
 */
export function generateSongName(state?: GameState): string {
	const genre = state?.currentTrendingGenre || undefined;
	let attempts = 0;

	while (attempts < MAX_GENERATION_ATTEMPTS) {
		const pattern = selectSongPattern();
		const name = pattern(genre);

		if (!isNameInCache(recentNames.songs, name)) {
			addToCache(recentNames.songs, name);
			return name;
		}

		attempts++;
	}

	// If we couldn't generate a unique name after max attempts,
	// append a number to ensure uniqueness
	const pattern = selectSongPattern();
	const baseName = pattern(genre);
	const name = `${baseName} ${attempts}`;
	addToCache(recentNames.songs, name);
	return name;
}

// ============================================================================
// ARTIST NAME GENERATION
// ============================================================================

/**
 * Artist name patterns
 */
const ARTIST_PATTERNS: Array<{ weight: number; generate: () => string }> = [
	{
		weight: 8,
		generate: () => {
			// Pattern: "[Prefix] [Noun]"
			const prefix = randomElement(ARTIST_PREFIXES);
			const noun = randomElement(ARTIST_NOUNS);
			return `${prefix} ${noun}`;
		}
	},
	{
		weight: 7,
		generate: () => {
			// Pattern: "[Adjective] [Noun]"
			const adj = randomElement(ARTIST_ADJECTIVES);
			const noun = randomElement(ARTIST_NOUNS);
			return `${adj} ${noun}`;
		}
	},
	{
		weight: 5,
		generate: () => {
			// Pattern: "The [Adjective] [Noun]s"
			const adj = randomElement(ARTIST_ADJECTIVES);
			const noun = randomElement(ARTIST_NOUNS);
			return `The ${adj} ${noun}s`;
		}
	},
	{
		weight: 5,
		generate: () => {
			// Pattern: "The [Noun]s"
			const noun = randomElement(ARTIST_NOUNS);
			return `The ${noun}s`;
		}
	},
	{
		weight: 3,
		generate: () => {
			// Pattern: "[Noun] and the [Noun]s"
			const noun1 = randomElement(ARTIST_NOUNS);
			const noun2 = randomElement(ARTIST_NOUNS);
			return `${noun1} and the ${noun2}s`;
		}
	},
	{
		weight: 2,
		generate: () => {
			// Pattern: "[Single Noun]" (mononym)
			const noun = randomElement(ARTIST_NOUNS);
			return noun;
		}
	}
];

const TOTAL_ARTIST_PATTERN_WEIGHT = ARTIST_PATTERNS.reduce((sum, p) => sum + p.weight, 0);

/**
 * Select a random artist pattern using weighted probabilities
 */
function selectArtistPattern(): () => string {
	const rand = Math.random() * TOTAL_ARTIST_PATTERN_WEIGHT;
	let accumulated = 0;

	for (const pattern of ARTIST_PATTERNS) {
		accumulated += pattern.weight;
		if (rand < accumulated) {
			return pattern.generate;
		}
	}

	// Fallback
	return ARTIST_PATTERNS[0].generate;
}

/**
 * Generate a unique artist name using mad-lib style patterns
 *
 * @returns A unique artist name
 */
export function generateArtistName(): string {
	let attempts = 0;

	while (attempts < MAX_GENERATION_ATTEMPTS) {
		const pattern = selectArtistPattern();
		const name = pattern();

		if (!isNameInCache(recentNames.artists, name)) {
			addToCache(recentNames.artists, name);
			return name;
		}

		attempts++;
	}

	// Fallback with number
	const pattern = selectArtistPattern();
	const baseName = pattern();
	const name = `${baseName} ${attempts}`;
	addToCache(recentNames.artists, name);
	return name;
}

// ============================================================================
// ALBUM NAME GENERATION
// ============================================================================

/**
 * Album name patterns
 */
const ALBUM_PATTERNS: Array<{ weight: number; generate: () => string }> = [
	{
		weight: 10,
		generate: () => {
			// Pattern: "[Adjective] [Noun]"
			const adj = randomElement(ADJECTIVES);
			const noun = randomElement(NOUNS);
			return `${adj} ${noun}`;
		}
	},
	{
		weight: 8,
		generate: () => {
			// Pattern: "[Album Adjective] [Album Noun]"
			const adj = randomElement(ALBUM_ADJECTIVES);
			const noun = randomElement(ALBUM_NOUNS);
			return `${adj} ${noun}`;
		}
	},
	{
		weight: 6,
		generate: () => {
			// Pattern: "[Noun] of [Place]"
			const noun = randomElement(NOUNS);
			const place = randomElement(PLACES);
			return `${noun} of ${place}`;
		}
	},
	{
		weight: 5,
		generate: () => {
			// Pattern: "The [Adjective] [Noun]"
			const adj = randomElement(ADJECTIVES);
			const noun = randomElement(NOUNS);
			return `The ${adj} ${noun}`;
		}
	},
	{
		weight: 4,
		generate: () => {
			// Pattern: "[Place]" (self-titled location)
			const place = randomElement(PLACES);
			return place;
		}
	},
	{
		weight: 3,
		generate: () => {
			// Pattern: "[Single Noun]" (simple album title)
			const noun = randomElement(NOUNS);
			return noun;
		}
	},
	{
		weight: 4,
		generate: () => {
			// Pattern: "[Verb] in [Place]"
			const verb = randomElement(VERBS);
			const place = randomElement(PLACES);
			return `${verb} in ${place}`;
		}
	}
];

const TOTAL_ALBUM_PATTERN_WEIGHT = ALBUM_PATTERNS.reduce((sum, p) => sum + p.weight, 0);

/**
 * Select a random album pattern using weighted probabilities
 */
function selectAlbumPattern(): () => string {
	const rand = Math.random() * TOTAL_ALBUM_PATTERN_WEIGHT;
	let accumulated = 0;

	for (const pattern of ALBUM_PATTERNS) {
		accumulated += pattern.weight;
		if (rand < accumulated) {
			return pattern.generate;
		}
	}

	// Fallback
	return ALBUM_PATTERNS[0].generate;
}

/**
 * Generate a unique album name using mad-lib style patterns
 *
 * @returns A unique album name
 */
export function generateAlbumName(): string {
	let attempts = 0;

	while (attempts < MAX_GENERATION_ATTEMPTS) {
		const pattern = selectAlbumPattern();
		const name = pattern();

		if (!isNameInCache(recentNames.albums, name)) {
			addToCache(recentNames.albums, name);
			return name;
		}

		attempts++;
	}

	// Fallback with number
	const pattern = selectAlbumPattern();
	const baseName = pattern();
	const name = `${baseName} ${attempts}`;
	addToCache(recentNames.albums, name);
	return name;
}

// ============================================================================
// CACHE MANAGEMENT (for testing and utilities)
// ============================================================================

/**
 * Clear all name caches (useful for testing)
 */
export function clearNameCaches(): void {
	recentNames.songs = [];
	recentNames.artists = [];
	recentNames.albums = [];
}

/**
 * Get current cache sizes (useful for testing)
 */
export function getCacheSizes(): { songs: number; artists: number; albums: number } {
	return {
		songs: recentNames.songs.length,
		artists: recentNames.artists.length,
		albums: recentNames.albums.length
	};
}
