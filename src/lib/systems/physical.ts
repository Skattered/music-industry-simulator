/**
 * Physical Album System
 *
 * Handles physical album releases, payouts, and variant generation.
 * Albums auto-release at song milestones and provide one-time payouts.
 */

import type { GameState, PhysicalAlbum } from '../game/types';
import {
	ALBUM_PAYOUT_PER_SONG,
	ALBUM_FAN_MULTIPLIER,
	MIN_SONGS_FOR_ALBUM,
	ALBUM_RELEASE_COOLDOWN
} from '../game/config';

// ============================================================================
// UNLOCK SYSTEM
// ============================================================================

/**
 * Check if physical albums system is unlocked
 *
 * Physical albums unlock via the tier2_improved upgrade (unlockPhysicalAlbums effect)
 *
 * @param state - Current game state
 * @returns true if physical albums are unlocked
 */
export function unlockPhysicalAlbums(state: GameState): boolean {
	return state.unlockedSystems.physicalAlbums;
}

// ============================================================================
// VARIANT GENERATION
// ============================================================================

/**
 * Generate number of album variants based on fan count
 *
 * More fans = more variants (standard, deluxe, vinyl, limited edition, etc.)
 * Fans < 10K: 1 variant (standard only)
 * Fans 10K-100K: 2 variants (standard + deluxe)
 * Fans 100K-1M: 3 variants (+ vinyl)
 * Fans 1M+: 4 variants (+ limited edition)
 *
 * @param state - Current game state
 * @returns Number of variants to release
 */
export function generateVariants(state: GameState): number {
	const fans = state.fans;

	if (fans >= 1_000_000) {
		return 4; // Standard, Deluxe, Vinyl, Limited Edition
	} else if (fans >= 100_000) {
		return 3; // Standard, Deluxe, Vinyl
	} else if (fans >= 10_000) {
		return 2; // Standard, Deluxe
	} else {
		return 1; // Standard only
	}
}

// ============================================================================
// PAYOUT CALCULATION
// ============================================================================

/**
 * Calculate album payout based on songs and fan count
 *
 * Formula: (songCount * ALBUM_PAYOUT_PER_SONG) + (fans * ALBUM_FAN_MULTIPLIER)
 * Scaled by variant count (more variants = more sales)
 *
 * @param state - Current game state
 * @returns Total album payout in dollars
 */
export function calculateAlbumPayout(state: GameState): number {
	const songCount = Math.min(state.songs.length, MIN_SONGS_FOR_ALBUM + 10); // Cap at 15 songs per album
	const variantCount = generateVariants(state);

	// Base payout from songs
	const basePayout = songCount * ALBUM_PAYOUT_PER_SONG;

	// Fan-based payout (more fans = more sales)
	const fanPayout = state.fans * ALBUM_FAN_MULTIPLIER;

	// Total payout scaled by variants
	const totalPayout = (basePayout + fanPayout) * variantCount;

	return totalPayout;
}

// ============================================================================
// NAME GENERATION
// ============================================================================

const ALBUM_ADJECTIVES = [
	'Greatest',
	'Ultimate',
	'Essential',
	'Complete',
	'Definitive',
	'Best Of',
	'Collected',
	'Anthology',
	'Legendary',
	'Timeless',
	'Classic',
	'Golden',
	'Platinum',
	'Deluxe',
	'Limited'
];

const ALBUM_NOUNS = [
	'Hits',
	'Works',
	'Tracks',
	'Sessions',
	'Collection',
	'Archive',
	'Vault',
	'Classics',
	'Essentials',
	'Selection',
	'Masterpieces',
	'Recordings',
	'Anthology',
	'Legacy',
	'Chronicles'
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
// ALBUM RELEASE
// ============================================================================

/**
 * Release a new physical album
 *
 * Creates a new album with a one-time payout and adds it to the game state.
 * Deducts songs from the catalog and adds money to the player's balance.
 *
 * @param state - Current game state (will be modified)
 * @returns The newly created PhysicalAlbum
 */
export function releaseAlbum(state: GameState): PhysicalAlbum {
	// Calculate album properties
	const songCount = Math.min(state.songs.length, MIN_SONGS_FOR_ALBUM + 10);
	const variantCount = generateVariants(state);
	const payout = calculateAlbumPayout(state);

	// Create album object
	const album: PhysicalAlbum = {
		id: crypto.randomUUID(),
		name: generateAlbumName(),
		songCount,
		releasedAt: Date.now(),
		payout,
		variantCount,
		isRerelease: false
	};

	// Add album to state
	state.physicalAlbums.push(album);

	// Add payout to player's money
	state.money += payout;

	return album;
}

/**
 * Re-release an existing album for additional payout
 *
 * Creates a new album entry marked as a re-release with reduced payout (50%)
 *
 * @param state - Current game state (will be modified)
 * @param originalAlbumId - ID of the album to re-release
 * @returns The newly created re-release album, or null if original not found
 */
export function rereleaseAlbum(state: GameState, originalAlbumId: string): PhysicalAlbum | null {
	// Find original album
	const original = state.physicalAlbums.find((a) => a.id === originalAlbumId);
	if (!original) {
		return null;
	}

	// Calculate re-release payout (50% of current payout potential)
	const variantCount = generateVariants(state);
	const basePayout = original.songCount * ALBUM_PAYOUT_PER_SONG;
	const fanPayout = state.fans * ALBUM_FAN_MULTIPLIER;
	const rereleasePayout = ((basePayout + fanPayout) * variantCount) * 0.5;

	// Create re-release album
	const rerelease: PhysicalAlbum = {
		id: crypto.randomUUID(),
		name: `${original.name} (Remastered)`,
		songCount: original.songCount,
		releasedAt: Date.now(),
		payout: rereleasePayout,
		variantCount,
		isRerelease: true
	};

	// Add album to state
	state.physicalAlbums.push(rerelease);

	// Add payout to player's money
	state.money += rereleasePayout;

	return rerelease;
}

// ============================================================================
// AUTO-RELEASE SYSTEM
// ============================================================================

/**
 * Track when the last album was released
 * Stored in a WeakMap to avoid polluting GameState
 */
const lastAlbumReleaseTime = new WeakMap<GameState, number>();

/**
 * Track how many songs triggered the last album release
 * Used to determine when to trigger the next auto-release
 */
const lastAlbumSongCount = new WeakMap<GameState, number>();

/**
 * Process physical album auto-releases
 *
 * Albums auto-release when:
 * 1. Physical albums are unlocked
 * 2. Player has minimum songs for an album
 * 3. Cooldown period has elapsed
 * 4. Song milestone reached (every 10 songs)
 *
 * @param state - Current game state (will be modified)
 * @param deltaTime - Time elapsed since last update in milliseconds
 */
export function processPhysicalAlbums(state: GameState, deltaTime: number): void {
	// Check if system is unlocked
	if (!unlockPhysicalAlbums(state)) {
		return;
	}

	// Check if player has minimum songs
	if (state.songs.length < MIN_SONGS_FOR_ALBUM) {
		return;
	}

	// Check cooldown
	const now = Date.now();
	const lastRelease = lastAlbumReleaseTime.get(state) || 0;
	const timeSinceLastRelease = now - lastRelease;

	if (timeSinceLastRelease < ALBUM_RELEASE_COOLDOWN) {
		return;
	}

	// Check if song milestone reached (every 10 songs)
	const lastSongCount = lastAlbumSongCount.get(state) || 0;
	const currentSongCount = state.songs.length;
	const songMilestone = 10; // Release album every 10 songs

	// Calculate how many milestones have been passed
	const lastMilestone = Math.floor(lastSongCount / songMilestone);
	const currentMilestone = Math.floor(currentSongCount / songMilestone);

	if (currentMilestone > lastMilestone) {
		// Milestone reached! Release album
		releaseAlbum(state);

		// Update tracking
		lastAlbumReleaseTime.set(state, now);
		lastAlbumSongCount.set(state, currentSongCount);
	}
}

/**
 * Reset album release tracking for a game state
 * Useful for testing or when loading a save
 *
 * @param state - Game state to reset tracking for
 */
export function resetAlbumTracking(state: GameState): void {
	lastAlbumReleaseTime.delete(state);
	lastAlbumSongCount.delete(state);
}
