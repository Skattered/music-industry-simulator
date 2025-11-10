/**
 * System Unlock Tracking
 *
 * Handles checking and triggering unlock conditions for game systems.
 * Shows notifications when new systems become available.
 *
 * Unlock progression:
 * - Physical Albums: Tech tier 2 (API Access upgrade)
 * - Tours: Tech tier 3 (Multi-GPU Setup upgrade) + 10 albums + 100K fans
 * - Prestige: Tech tier 3 (Download Open Models upgrade)
 * - Platform Ownership: Tech tier 6 (Custom Inference Engine upgrade) + 50 tours + 1M fans
 * - GPU: Tech tier 3 (Download Open Models upgrade)
 * - Trend Research: Tech tier 1 (Multi-Account Management upgrade)
 */

import type { GameState } from '../game/types';

/**
 * Check if physical albums should be unlocked
 *
 * Requirements:
 * - tier2_improved upgrade purchased (unlockPhysicalAlbums effect)
 *
 * @param state - Current game state (will be mutated if unlock conditions met)
 * @returns true if system was just unlocked, false if already unlocked or conditions not met
 */
export function checkPhysicalAlbumUnlock(state: GameState): boolean {
	// Already unlocked
	if (state.unlockedSystems.physicalAlbums) {
		return false;
	}

	// Check if tier2_improved upgrade is purchased (has unlockPhysicalAlbums effect)
	const hasUpgrade = 'tier2_improved' in state.upgrades;

	if (hasUpgrade) {
		state.unlockedSystems.physicalAlbums = true;
		console.log('🎵 System Unlocked: Physical Albums! Release albums for massive one-time payouts.');
		return true;
	}

	return false;
}

/**
 * Check if tour system should be unlocked
 *
 * Requirements:
 * - tier3_advanced upgrade purchased (unlockTours effect)
 * - At least 10 physical albums released
 * - At least 100,000 fans
 *
 * @param state - Current game state (will be mutated if unlock conditions met)
 * @returns true if system was just unlocked, false if already unlocked or conditions not met
 */
export function checkTourUnlock(state: GameState): boolean {
	// Already unlocked
	if (state.unlockedSystems.tours) {
		return false;
	}

	// Check if tier3_advanced upgrade is purchased (has unlockTours effect)
	const hasUpgrade = 'tier3_advanced' in state.upgrades;

	// Check album and fan requirements
	const hasEnoughAlbums = state.physicalAlbums.length >= 10;
	const hasEnoughFans = state.fans >= 100_000;

	if (hasUpgrade && hasEnoughAlbums && hasEnoughFans) {
		state.unlockedSystems.tours = true;
		console.log('🎸 System Unlocked: Tours & Concerts! Run multiple stadium tours simultaneously.');
		return true;
	}

	return false;
}

/**
 * Check if prestige system should be unlocked
 *
 * Requirements:
 * - tier3_basic upgrade purchased (unlockPrestige effect)
 *
 * @param state - Current game state (will be mutated if unlock conditions met)
 * @returns true if system was just unlocked, false if already unlocked or conditions not met
 */
export function checkPrestigeUnlock(state: GameState): boolean {
	// Already unlocked
	if (state.unlockedSystems.prestige) {
		return false;
	}

	// Check if tier3_basic upgrade is purchased (has unlockPrestige effect)
	const hasUpgrade = 'tier3_basic' in state.upgrades;

	if (hasUpgrade) {
		state.unlockedSystems.prestige = true;
		console.log('⭐ System Unlocked: Prestige! Reset your progress to gain permanent bonuses.');
		return true;
	}

	return false;
}

/**
 * Check if platform ownership should be unlocked
 *
 * Requirements:
 * - tier6_basic upgrade purchased (unlockPlatformOwnership effect)
 * - At least 50 tours completed
 * - At least 1,000,000 fans
 *
 * @param state - Current game state (will be mutated if unlock conditions met)
 * @returns true if system was just unlocked, false if already unlocked or conditions not met
 */
export function checkPlatformUnlock(state: GameState): boolean {
	// Already unlocked
	if (state.unlockedSystems.platformOwnership) {
		return false;
	}

	// Check if tier6_basic upgrade is purchased (has unlockPlatformOwnership effect)
	const hasUpgrade = 'tier6_basic' in state.upgrades;

	// Check tour and fan requirements
	const completedTours = state.tours.filter((tour) => tour.completedAt !== null).length;
	const hasEnoughTours = completedTours >= 50;
	const hasEnoughFans = state.fans >= 1_000_000;

	if (hasUpgrade && hasEnoughTours && hasEnoughFans) {
		state.unlockedSystems.platformOwnership = true;
		console.log('🏢 System Unlocked: Platform Ownership! Buy music industry infrastructure for massive income.');
		return true;
	}

	return false;
}

/**
 * Check if GPU system should be unlocked
 *
 * Requirements:
 * - tier3_basic upgrade purchased (unlockGPU effect)
 *
 * @param state - Current game state (will be mutated if unlock conditions met)
 * @returns true if system was just unlocked, false if already unlocked or conditions not met
 */
export function checkGPUUnlock(state: GameState): boolean {
	// Already unlocked
	if (state.unlockedSystems.gpu) {
		return false;
	}

	// Check if tier3_basic upgrade is purchased (has unlockGPU effect)
	const hasUpgrade = 'tier3_basic' in state.upgrades;

	if (hasUpgrade) {
		state.unlockedSystems.gpu = true;
		console.log('💻 System Unlocked: GPU Resources! Run AI models locally on your hardware.');
		return true;
	}

	return false;
}

/**
 * Check if trend research should be unlocked
 *
 * Requirements:
 * - tier1_advanced upgrade purchased (unlockTrendResearch effect)
 *
 * @param state - Current game state (will be mutated if unlock conditions met)
 * @returns true if system was just unlocked, false if already unlocked or conditions not met
 */
export function checkTrendResearchUnlock(state: GameState): boolean {
	// Already unlocked
	if (state.unlockedSystems.trendResearch) {
		return false;
	}

	// Check if tier1_advanced upgrade is purchased (has unlockTrendResearch effect)
	const hasUpgrade = 'tier1_advanced' in state.upgrades;

	if (hasUpgrade) {
		state.unlockedSystems.trendResearch = true;
		console.log('🔍 System Unlocked: Trend Research! Discover trending genres for 2x income and fans.');
		return true;
	}

	return false;
}

/**
 * Check all phase unlock conditions and unlock systems as appropriate
 * This should be called each game tick to detect when unlock conditions are met
 *
 * @param state - Current game state (will be mutated if unlock conditions met)
 */
export function checkPhaseUnlocks(state: GameState): void {
	// Check all unlock conditions
	// Order matters: Check dependencies first (e.g., physical albums before tours)

	// Phase 1 unlocks
	checkTrendResearchUnlock(state);
	checkPhysicalAlbumUnlock(state);

	// Phase 2 unlocks
	checkGPUUnlock(state);
	checkPrestigeUnlock(state);
	checkTourUnlock(state);

	// Phase 3+ unlocks
	checkPlatformUnlock(state);
}
