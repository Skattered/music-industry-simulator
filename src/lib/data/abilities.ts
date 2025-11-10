/**
 * Exploitation Ability Definitions
 *
 * Re-exports boost definitions from config for use in the exploitation system.
 * These are temporary activated abilities that provide income/fan boosts at escalating costs.
 *
 * Design:
 * - No cooldowns, just escalating costs
 * - Multiple abilities can be active simultaneously
 * - Costs scale up with each use (costScaling multiplier)
 * - Duration-based, not permanent
 */

export { BOOSTS as ABILITIES } from '../game/config';
export type { BoostDefinition as AbilityDefinition } from '../game/types';
