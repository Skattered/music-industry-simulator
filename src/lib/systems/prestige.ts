/**
 * Prestige System
 *
 * Handles artist reset and legacy income mechanics.
 * Allows players to reset their progress while gaining permanent bonuses.
 *
 * Prestige Features:
 * - Reset current artist while saving as legacy artist
 * - Legacy artists generate passive income (based on peak fans)
 * - Experience multiplier increases with each prestige
 * - Cross-promotion: Legacy artists funnel fans to new artist
 * - Keep tech upgrades and industry control
 * - Legacy artist fading: Only keep 2-3 most recent legacy artists
 *
 * Prestige Unlocks:
 * - Tech Tier 3: Local AI Models (first prestige)
 * - Tech Tier 5: Train Your Own Models (second prestige)
 * - Tech Tier 6: Build Your Own Software (third prestige)
 * - Tech Tier 7: AI Agent Automation (fourth+ prestige)
 */

import type { GameState, LegacyArtist, TechTier } from '../game/types';
import {
	PRESTIGE_MULTIPLIER_PER_LEVEL,
	MAX_LEGACY_ARTISTS,
	LEGACY_ARTIST_INCOME_RATIO,
	INITIAL_MONEY,
	INITIAL_FANS
} from '../game/config';
import { calculateTotalIncome } from './income';

/**
 * Tech tiers where prestige becomes available
 * Prestige unlocks at tier 3, 5, 6, 7
 */
const PRESTIGE_UNLOCK_TIERS: TechTier[] = [3, 5, 6, 7];

/**
 * Percentage of legacy artist peak fans that funnel to new artist per second
 * Balance: 0.01% per second = 1% per 100 seconds, slow but meaningful
 */
const CROSS_PROMOTION_RATE = 0.0001;

/**
 * Check if player can prestige
 * Requirements:
 * - Prestige system must be unlocked (tier 3+)
 * - Must be at a prestige unlock tier (3, 5, 6, 7)
 *
 * @param state - Current game state
 * @returns true if player can prestige, false otherwise
 */
export function canPrestige(state: GameState): boolean {
	// Check if prestige system is unlocked
	if (!state.unlockedSystems.prestige) {
		return false;
	}

	// Check if at a prestige unlock tier
	// First prestige at tier 3, additional prestiges at tiers 5, 6, 7
	// After tier 7, can prestige at any time
	if (state.techTier < 3) {
		return false;
	}

	// For tiers 3-6, only allow prestige at specific milestones
	if (state.techTier < 7) {
		return PRESTIGE_UNLOCK_TIERS.includes(state.techTier);
	}

	// At tier 7+, can prestige any time
	return true;
}

/**
 * Calculate experience multiplier for next prestige
 * Each prestige adds +10% to all income and fan generation
 *
 * @param state - Current game state
 * @returns New experience multiplier after prestige
 */
export function calculateExperienceBonus(state: GameState): number {
	// Start at 1.0, add 0.1 for each prestige
	// After 1st prestige: 1.1x, after 2nd: 1.2x, etc.
	const newPrestigeCount = state.prestigeCount + 1;
	return 1.0 + newPrestigeCount * PRESTIGE_MULTIPLIER_PER_LEVEL;
}

/**
 * Calculate legacy income rate for current artist
 * Based on peak fans achieved before prestige
 *
 * Formula: peakFans * LEGACY_ARTIST_INCOME_RATIO
 * Example: 100M fans = $10K/sec, 1B fans = $100K/sec
 *
 * @param state - Current game state
 * @returns Legacy income rate in dollars per second
 */
export function calculateLegacyIncome(state: GameState): number {
	const peakFans = state.currentArtist.peakFans;
	return peakFans * LEGACY_ARTIST_INCOME_RATIO;
}

/**
 * Process cross-promotion from legacy artists to new artist
 * Legacy artists slowly funnel fans to the current artist over time
 *
 * @param state - Current game state (will be mutated)
 * @param deltaTime - Time elapsed since last update in milliseconds
 */
export function processLegacyArtists(state: GameState, deltaTime: number): void {
	if (state.legacyArtists.length === 0) {
		return;
	}

	const deltaSeconds = deltaTime / 1000;
	let totalFansGained = 0;

	// Each legacy artist funnels a small percentage of their peak fans per second
	for (const legacyArtist of state.legacyArtists) {
		const fansPerSecond = legacyArtist.peakFans * CROSS_PROMOTION_RATE;
		totalFansGained += fansPerSecond * deltaSeconds;
	}

	// Add cross-promotion fans to current artist
	state.fans += totalFansGained;
	state.currentArtist.fans += totalFansGained;

	// Update peak fans if needed
	if (state.currentArtist.fans > state.currentArtist.peakFans) {
		state.currentArtist.peakFans = state.currentArtist.fans;
	}
}

/**
 * Perform prestige - reset artist and gain legacy bonuses
 *
 * What gets saved:
 * - Current artist becomes legacy artist
 * - Legacy artist generates passive income
 * - Experience multiplier increases
 * - Tech upgrades and industry control persist
 * - Platforms persist
 *
 * What gets reset:
 * - Money (back to starting amount)
 * - Songs (cleared)
 * - Fans (back to 0)
 * - Song queue (cleared)
 * - Current artist (new artist with 0 stats)
 *
 * Legacy Artist Fading:
 * - Keep max 3 legacy artists
 * - When 4th prestige occurs, oldest legacy artist retires (shift)
 * - Prevents infinite exponential growth
 *
 * @param state - Current game state (will be mutated)
 * @returns true if prestige was successful, false if cannot prestige
 */
export function performPrestige(state: GameState): boolean {
	// Check if can prestige
	if (!canPrestige(state)) {
		return false;
	}

	// Create legacy artist from current artist
	const legacyArtist: LegacyArtist = {
		name: state.currentArtist.name,
		peakFans: state.currentArtist.peakFans,
		songs: state.currentArtist.songs,
		incomeRate: calculateLegacyIncome(state),
		createdAt: state.currentArtist.createdAt,
		prestigedAt: Date.now()
	};

	// Add to legacy artists array
	state.legacyArtists.push(legacyArtist);

	// Legacy artist fading: Keep only MAX_LEGACY_ARTISTS (3) most recent
	// When 4th prestige happens, shift() removes the oldest
	if (state.legacyArtists.length > MAX_LEGACY_ARTISTS) {
		state.legacyArtists.shift();
	}

	// Calculate new experience multiplier
	const newExperienceMultiplier = calculateExperienceBonus(state);
	state.experienceMultiplier = newExperienceMultiplier;

	// Increment prestige count
	state.prestigeCount += 1;

	// Reset resources
	state.money = INITIAL_MONEY;
	state.fans = INITIAL_FANS;
	state.songs = [];
	state.songQueue = [];

	// Reset current artist with new name (will be generated by game initialization)
	// Keep it simple - just reset to default stats
	state.currentArtist = {
		name: generateArtistName(),
		songs: 0,
		fans: 0,
		peakFans: 0,
		createdAt: Date.now()
	};

	// Tech upgrades, industry control, platforms, tours (completed), and unlocked systems persist
	// Active boosts are NOT reset (they continue through prestige)

	return true;
}

/**
 * Generate a random artist name
 * Uses simple mad-lib style generation
 */
function generateArtistName(): string {
	const adjectives = [
		'Digital',
		'Electric',
		'Neon',
		'Crystal',
		'Cosmic',
		'Velvet',
		'Golden',
		'Silver',
		'Midnight',
		'Echo',
		'Shadow',
		'Phoenix',
		'Nova',
		'Stellar',
		'Lunar'
	];

	const nouns = [
		'Dreams',
		'Beats',
		'Waves',
		'Pulse',
		'Rhythm',
		'Harmony',
		'Melody',
		'Symphony',
		'Echo',
		'Vibe',
		'Soul',
		'Heart',
		'Sound',
		'Voice',
		'Spirit'
	];

	const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
	const noun = nouns[Math.floor(Math.random() * nouns.length)];

	// 50% chance to use "The" prefix
	if (Math.random() < 0.5) {
		return `The ${adj} ${noun}`;
	}

	return `${adj} ${noun}`;
}
