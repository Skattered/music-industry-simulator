/**
 * Physical Album System
 *
 * Handles physical album releases, variant generation, and payout calculation.
 * Albums auto-release at song milestones and provide one-time payouts.
 * Unlocks at Phase 2 after reaching specific milestones.
 */

import type { GameState, PhysicalAlbum } from '../game/types';
import {
	ALBUM_PAYOUT_PER_SONG,
	ALBUM_FAN_MULTIPLIER,
	MIN_SONGS_FOR_ALBUM
} from '../game/config';

// ============================================================================
// UNLOCK REQUIREMENTS
// ============================================================================

/** Minimum songs required to unlock physical albums */
export const PHYSICAL_UNLOCK_SONGS = 100;

/** Minimum fans required to unlock physical albums */
export const PHYSICAL_UNLOCK_FANS = 10_000;

/** Minimum money required to unlock physical albums */
export const PHYSICAL_UNLOCK_MONEY = 5_000;

// ============================================================================
// ALBUM RELEASE CONSTANTS
// ============================================================================

/** Number of songs between automatic album releases */
export const SONGS_PER_ALBUM = 10;

/** Fan thresholds for increasing variant counts */
const VARIANT_THRESHOLDS = [
	{ fans: 0, variants: 1, name: 'Standard' }, // 0-50k: Standard only
	{ fans: 50_000, variants: 2, name: 'Deluxe' }, // 50k+: Standard + Deluxe
	{ fans: 200_000, variants: 3, name: 'Vinyl' }, // 200k+: + Vinyl
	{ fans: 1_000_000, variants: 4, name: 'Limited Edition' } // 1M+: All variants
];

// ============================================================================
// NAME GENERATION
// ============================================================================

const ALBUM_ADJECTIVES = [
	'Greatest',
	'Ultimate',
	'Complete',
	'Essential',
	'Definitive',
	'Best',
	'Premium',
	'Deluxe',
	'Legendary',
	'Epic',
	'Golden',
	'Platinum',
	'Diamond',
	'Exclusive',
	'Limited',
	'Special',
	'Collector\'s',
	'Anniversary',
	'Masterpiece',
	'Classic'
];

const ALBUM_NOUNS = [
	'Collection',
	'Anthology',
	'Hits',
	'Works',
	'Sessions',
	'Chronicles',
	'Experience',
	'Journey',
	'Story',
	'Legacy',
	'Archive',
	'Vault',
	'Treasury',
	'Portfolio',
	'Catalog',
	'Mixtape',
	'Album',
	'Record',
	'Release',
	'Edition'
];

/**
 * Generate a random album name using mad-lib style
 */
function generateAlbumName(): string {
	const adj = ALBUM_ADJECTIVES[Math.floor(Math.random() * ALBUM_ADJECTIVES.length)];
	const noun = ALBUM_NOUNS[Math.floor(Math.random() * ALBUM_NOUNS.length)];
	return `${adj} ${noun}`;
}

// ============================================================================
// UNLOCK SYSTEM
// ============================================================================

/**
 * Check if physical albums should be unlocked
 *
 * @param state - Current game state
 * @returns true if physical albums should unlock, false otherwise
 */
export function unlockPhysicalAlbums(state: GameState): boolean {
	// Check if already unlocked
	if (state.unlockedSystems.physicalAlbums) {
		return false;
	}

	// Check all unlock requirements
	const hasSongs = state.songs.length >= PHYSICAL_UNLOCK_SONGS;
	const hasFans = state.fans >= PHYSICAL_UNLOCK_FANS;
	const hasMoney = state.money >= PHYSICAL_UNLOCK_MONEY;

	return hasSongs && hasFans && hasMoney;
}

// ============================================================================
// VARIANT GENERATION
// ============================================================================

/**
 * Calculate number of album variants based on current fan count
 * More fans = more variants (standard, deluxe, vinyl, limited edition)
 *
 * @param state - Current game state
 * @returns Number of variants to release
 */
export function generateVariants(state: GameState): number {
	const fans = state.fans;

	// Find the highest threshold met
	let variantCount = 1; // Default to standard only

	for (const threshold of VARIANT_THRESHOLDS) {
		if (fans >= threshold.fans) {
			variantCount = threshold.variants;
		}
	}

	return variantCount;
}

// ============================================================================
// PAYOUT CALCULATION
// ============================================================================

/**
 * Calculate one-time payout for an album release
 * Payout scales with:
 * - Number of songs in the album
 * - Current fan count (bigger audience = bigger sales)
 * - Number of variants released
 *
 * @param state - Current game state
 * @param songCount - Number of songs in the album
 * @param variantCount - Number of variants being released
 * @returns Payout amount in dollars
 */
export function calculateAlbumPayout(
	state: GameState,
	songCount: number = MIN_SONGS_FOR_ALBUM,
	variantCount: number = 1
): number {
	// Base payout from songs
	const basePayout = songCount * ALBUM_PAYOUT_PER_SONG;

	// Fan multiplier (more fans = bigger audience = more sales)
	const fanBonus = state.fans * ALBUM_FAN_MULTIPLIER;

	// Each variant multiplies the total payout
	const totalPayout = (basePayout + fanBonus) * variantCount;

	return totalPayout;
}

// ============================================================================
// ALBUM RELEASE
// ============================================================================

/**
 * Release a new physical album
 * Generates album with automatic variant selection and payout calculation
 *
 * @param state - Current game state
 * @param isRerelease - Whether this is a re-release of an older album
 * @returns New PhysicalAlbum object
 */
export function releaseAlbum(state: GameState, isRerelease: boolean = false): PhysicalAlbum {
	// Determine song count for album (minimum required)
	const songCount = MIN_SONGS_FOR_ALBUM;

	// Generate variants based on fan count
	const variantCount = generateVariants(state);

	// Calculate payout
	const payout = calculateAlbumPayout(state, songCount, variantCount);

	// Create album
	const album: PhysicalAlbum = {
		id: crypto.randomUUID(),
		name: generateAlbumName(),
		songCount,
		releasedAt: Date.now(),
		payout,
		variantCount,
		isRerelease
	};

	return album;
}

// ============================================================================
// ALBUM PROCESSING
// ============================================================================

/**
 * Process physical album system
 * Automatically releases albums at song milestones
 *
 * This function should be called each game tick to check if new albums should be released.
 * Albums auto-release when the total song count crosses certain milestones.
 *
 * @param state - Current game state (will be modified)
 * @param deltaTime - Time elapsed since last update (currently unused, for future features)
 */
export function processPhysicalAlbums(state: GameState, deltaTime: number): void {
	// Only process if physical albums are unlocked
	if (!state.unlockedSystems.physicalAlbums) {
		return;
	}

	// Check if we should release a new album based on song milestones
	const totalSongs = state.songs.length;
	const totalAlbums = state.physicalAlbums.length;

	// Calculate how many albums we should have based on song count
	// Every SONGS_PER_ALBUM songs = 1 album
	const expectedAlbums = Math.floor(totalSongs / SONGS_PER_ALBUM);

	// Release any missing albums
	if (expectedAlbums > totalAlbums) {
		const albumsToRelease = expectedAlbums - totalAlbums;

		for (let i = 0; i < albumsToRelease; i++) {
			const album = releaseAlbum(state, false);
			state.physicalAlbums.push(album);

			// Add payout to player's money
			state.money += album.payout;
		}
	}
}

// ============================================================================
// RE-RELEASE MECHANICS
// ============================================================================

/**
 * Re-release an old album for an additional payout
 * Can be called manually to release an album at any time
 *
 * @param state - Current game state (will be modified)
 * @returns The new re-released album, or null if physical albums not unlocked
 */
export function rereleaseAlbum(state: GameState): PhysicalAlbum | null {
	// Only allow if physical albums are unlocked
	if (!state.unlockedSystems.physicalAlbums) {
		return null;
	}

	// Create and add the re-release
	const album = releaseAlbum(state, true);
	state.physicalAlbums.push(album);

	// Add payout to player's money
	state.money += album.payout;

	return album;
}
