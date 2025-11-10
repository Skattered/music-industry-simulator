/**
 * Prestige System
 *
 * Handles artist reset and legacy income mechanics.
 *
 * Core Mechanics:
 * - When prestiging, current artist becomes a "legacy artist"
 * - Legacy artists generate passive income (80% of current song income rate)
 * - Experience multiplier increases based on prestige count (+10% per prestige)
 * - Cross-promotion: Legacy artists slowly funnel fans to new artist
 * - Legacy artist fading: Keep 2-3 most recent, retire oldest when 4th prestige occurs
 * - Reset: money, songs, fans, queue cleared; tech upgrades kept
 *
 * Unlock Conditions:
 * - Prestige system unlocks at tech tier 3 (Local AI Models)
 * - Can prestige immediately after unlock, no fan gate
 */

import type { GameState, LegacyArtist, Artist } from '../game/types';
import {
	MAX_LEGACY_ARTISTS,
	PRESTIGE_MULTIPLIER_PER_LEVEL,
	LEGACY_ARTIST_INCOME_RATIO,
	INITIAL_MONEY,
	INITIAL_FANS
} from '../game/config';
import { generateArtistName } from '../data/names';
import { calculateSongIncome } from './songs';

// ============================================================================
// PRESTIGE ELIGIBILITY
// ============================================================================

/**
 * Check if player can prestige
 *
 * Requirements:
 * - Prestige system must be unlocked (tech tier 3+)
 *
 * @param state - Current game state
 * @returns true if player can prestige
 */
export function canPrestige(state: GameState): boolean {
	return state.unlockedSystems.prestige;
}

// ============================================================================
// PRESTIGE EXECUTION
// ============================================================================

/**
 * Calculate income rate for legacy artist
 * Uses 80% of current total song income
 *
 * @param state - Current game state
 * @returns Income per second for the legacy artist
 */
function calculateLegacyArtistIncomeRate(state: GameState): number {
	const currentSongIncome = calculateSongIncome(state);
	return currentSongIncome * 0.8;
}

/**
 * Create a new artist for the player
 *
 * @returns New Artist object
 */
function createNewArtist(): Artist {
	const now = Date.now();
	return {
		name: generateArtistName(),
		songs: 0,
		fans: 0,
		peakFans: 0,
		createdAt: now
	};
}

/**
 * Perform prestige: save current artist as legacy, reset progress, gain bonuses
 *
 * What is saved:
 * - Current artist becomes legacy artist with passive income
 * - Tech upgrades and purchased systems
 * - Industry control progress
 * - Prestige count (incremented)
 *
 * What is reset:
 * - Money (back to INITIAL_MONEY)
 * - Songs (cleared)
 * - Fans (back to INITIAL_FANS)
 * - Song queue (cleared)
 * - Current artist (new artist created)
 *
 * Bonuses gained:
 * - Experience multiplier increased (+10% per prestige)
 * - Legacy artist generates passive income
 *
 * Legacy artist fading:
 * - If prestiging would exceed MAX_LEGACY_ARTISTS, oldest artist retires (stops earning)
 *
 * @param state - Current game state (will be mutated)
 * @returns true if prestige was successful
 */
export function performPrestige(state: GameState): boolean {
	// Check eligibility
	if (!canPrestige(state)) {
		return false;
	}

	// Create legacy artist from current artist
	const legacyArtist: LegacyArtist = {
		name: state.currentArtist.name,
		peakFans: state.currentArtist.peakFans,
		songs: state.currentArtist.songs,
		incomeRate: calculateLegacyArtistIncomeRate(state),
		createdAt: state.currentArtist.createdAt,
		prestigedAt: Date.now()
	};

	// Add legacy artist to array
	state.legacyArtists.push(legacyArtist);

	// Legacy artist fading: Keep only MAX_LEGACY_ARTISTS most recent
	// When 4th prestige occurs, oldest artist "retires" (stops generating income)
	while (state.legacyArtists.length > MAX_LEGACY_ARTISTS) {
		state.legacyArtists.shift(); // Remove oldest artist
	}

	// Increment prestige count
	state.prestigeCount += 1;

	// Calculate new experience multiplier
	state.experienceMultiplier = calculateExperienceBonus(state);

	// Reset resources
	state.money = INITIAL_MONEY;
	state.songs = [];
	state.fans = INITIAL_FANS;
	state.songQueue = [];

	// Create new artist
	state.currentArtist = createNewArtist();

	return true;
}

// ============================================================================
// EXPERIENCE BONUS CALCULATION
// ============================================================================

/**
 * Calculate experience multiplier from prestige count
 *
 * Each prestige adds +10% to all income (multiplicative)
 * Formula: 1.0 + (prestigeCount * PRESTIGE_MULTIPLIER_PER_LEVEL)
 *
 * Examples:
 * - 0 prestiges: 1.0x (no bonus)
 * - 1 prestige: 1.1x (+10%)
 * - 2 prestiges: 1.2x (+20%)
 * - 5 prestiges: 1.5x (+50%)
 *
 * @param state - Current game state
 * @returns Experience multiplier (minimum 1.0)
 */
export function calculateExperienceBonus(state: GameState): number {
	return 1.0 + (state.prestigeCount * PRESTIGE_MULTIPLIER_PER_LEVEL);
}

// ============================================================================
// LEGACY ARTIST INCOME
// ============================================================================

/**
 * Calculate total passive income from all legacy artists
 *
 * Each legacy artist has a fixed incomeRate set when they were prestiged.
 * This rate is 80% of the total song income at the moment of prestige.
 *
 * @param state - Current game state
 * @returns Total income per second from legacy artists
 */
export function calculateLegacyIncome(state: GameState): number {
	let totalIncome = 0;

	for (const artist of state.legacyArtists) {
		totalIncome += artist.incomeRate;
	}

	return totalIncome;
}

// ============================================================================
// CROSS-PROMOTION MECHANICS
// ============================================================================

/**
 * Cross-promotion rate: fans per second transferred from legacy artists to new artist
 * Balance: 0.001% of legacy artist peak fans per second
 * Example: 100M peak fans = 1,000 fans/sec to new artist
 */
const CROSS_PROMOTION_RATE = 0.00001;

/**
 * Process legacy artists: cross-promotion fans to new artist
 *
 * Cross-promotion mechanic:
 * - Legacy artists slowly funnel fans to the new artist over time
 * - Each legacy artist contributes based on their peak fan count
 * - This helps the new artist rebuild their fanbase faster
 *
 * @param state - Current game state (will be mutated)
 * @param deltaTime - Time elapsed since last update in milliseconds
 */
export function processLegacyArtists(state: GameState, deltaTime: number): void {
	if (state.legacyArtists.length === 0) {
		return;
	}

	const deltaSeconds = deltaTime / 1000;
	let fansToAdd = 0;

	// Calculate cross-promotion fans from all legacy artists
	for (const artist of state.legacyArtists) {
		const fansPerSecond = artist.peakFans * CROSS_PROMOTION_RATE;
		fansToAdd += fansPerSecond * deltaSeconds;
	}

	// Add fans to current artist and update totals
	if (fansToAdd > 0) {
		state.fans += fansToAdd;
		state.currentArtist.fans += fansToAdd;

		// Update peak fans if current exceeds it
		if (state.currentArtist.fans > state.currentArtist.peakFans) {
			state.currentArtist.peakFans = state.currentArtist.fans;
		}
	}
}
