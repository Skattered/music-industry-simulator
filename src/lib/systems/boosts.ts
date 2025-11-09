/**
 * Boost Utility Functions
 *
 * Shared utilities for calculating boost multipliers.
 * Reduces code duplication across income and fan systems.
 */

import type { GameState, ActiveBoost } from '../game/types';

/**
 * Calculate boost multiplier for a specific multiplier property
 * Stacks multiplicatively (multiply all active boost multipliers)
 *
 * @param state - The current game state
 * @param multiplierKey - The property name to use ('incomeMultiplier' or 'fanMultiplier')
 * @returns The total multiplier from all active boosts
 */
export function calculateBoostMultiplier(
	state: GameState,
	multiplierKey: 'incomeMultiplier' | 'fanMultiplier'
): number {
	let multiplier = 1.0;
	const currentTime = Date.now();

	for (const boost of state.activeBoosts) {
		// Check if boost is still active
		const elapsedTime = currentTime - boost.activatedAt;
		if (elapsedTime < boost.duration) {
			multiplier *= boost[multiplierKey];
		}
	}

	return multiplier;
}
