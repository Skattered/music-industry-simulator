/**
 * Game utility functions for formatting, calculations, and common operations.
 * Optimized for frequent calls and consistent formatting across the game.
 */

/**
 * Format a number as money with appropriate suffixes (K, M, B, T).
 * Examples: $1.23K, $4.56M, $7.89B, $10.1T
 *
 * @param amount - The amount to format
 * @returns Formatted money string with $ prefix and suffix
 */
export function formatMoney(amount: number): string {
	// Handle edge cases
	if (!isFinite(amount)) return '$0';
	if (amount === 0) return '$0';

	const isNegative = amount < 0;
	const absAmount = Math.abs(amount);

	// Define thresholds and suffixes
	const tiers = [
		{ threshold: 1_000_000_000_000, suffix: 'T' }, // Trillion
		{ threshold: 1_000_000_000, suffix: 'B' }, // Billion
		{ threshold: 1_000_000, suffix: 'M' }, // Million
		{ threshold: 1_000, suffix: 'K' } // Thousand
	];

	// Find the appropriate tier
	for (const tier of tiers) {
		if (absAmount >= tier.threshold) {
			const value = absAmount / tier.threshold;
			// Format with up to 2 decimal places, removing trailing zeros
			const formatted = value.toFixed(2).replace(/\.?0+$/, '');
			return `${isNegative ? '-' : ''}$${formatted}${tier.suffix}`;
		}
	}

	// For amounts less than 1000, show with up to 2 decimal places, removing trailing zeros
	const formatted = absAmount.toFixed(2).replace(/\.?0+$/, '');
	return `${isNegative ? '-' : ''}$${formatted}`;
}

/**
 * Format a number with appropriate suffixes and commas.
 * Examples: 1,234 or 1.23K or 4.56M
 *
 * @param num - The number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number): string {
	// Handle edge cases
	if (!isFinite(num)) return '0';
	if (num === 0) return '0';

	const isNegative = num < 0;
	const absNum = Math.abs(num);

	// For numbers >= 1 million, use suffixes
	const tiers = [
		{ threshold: 1_000_000_000_000, suffix: 'T' }, // Trillion
		{ threshold: 1_000_000_000, suffix: 'B' }, // Billion
		{ threshold: 1_000_000, suffix: 'M' }, // Million
		{ threshold: 1_000, suffix: 'K' } // Thousand
	];

	for (const tier of tiers) {
		if (absNum >= tier.threshold) {
			const value = absNum / tier.threshold;
			const formatted = value.toFixed(2).replace(/\.?0+$/, '');
			return `${isNegative ? '-' : ''}${formatted}${tier.suffix}`;
		}
	}

	// For smaller numbers, use comma separation
	const formatted = absNum.toLocaleString('en-US', {
		maximumFractionDigits: 0
	});
	return `${isNegative ? '-' : ''}${formatted}`;
}

/**
 * Format seconds into a human-readable time string.
 * Examples: "0:05", "1:23", "12:34", "1:02:30"
 *
 * @param seconds - The number of seconds
 * @returns Formatted time string (M:SS or H:MM:SS)
 */
export function formatTime(seconds: number): string {
	// Handle edge cases
	if (!isFinite(seconds) || seconds < 0) return '0:00';

	const totalSeconds = Math.floor(seconds);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const secs = totalSeconds % 60;

	// Pad with leading zeros
	const padZero = (num: number): string => num.toString().padStart(2, '0');

	if (hours > 0) {
		return `${hours}:${padZero(minutes)}:${padZero(secs)}`;
	}
	return `${minutes}:${padZero(secs)}`;
}

/**
 * Format milliseconds into a human-readable duration string.
 * Examples: "2.5s", "1.2m", "3.5h", "2.1d"
 *
 * @param ms - The number of milliseconds
 * @returns Formatted duration string
 */
export function formatDuration(ms: number): string {
	// Handle edge cases
	if (!isFinite(ms) || ms < 0) return '0s';
	if (ms === 0) return '0s';

	const seconds = ms / 1000;
	const minutes = seconds / 60;
	const hours = minutes / 60;
	const days = hours / 24;

	// Choose the most appropriate unit
	if (days >= 1) {
		return `${days.toFixed(1).replace(/\.0$/, '')}d`;
	}
	if (hours >= 1) {
		return `${hours.toFixed(1).replace(/\.0$/, '')}h`;
	}
	if (minutes >= 1) {
		return `${minutes.toFixed(1).replace(/\.0$/, '')}m`;
	}
	return `${seconds.toFixed(1).replace(/\.0$/, '')}s`;
}

/**
 * Clamp a value between a minimum and maximum.
 *
 * @param value - The value to clamp
 * @param min - The minimum value
 * @param max - The maximum value
 * @returns The clamped value
 */
export function clamp(value: number, min: number, max: number): number {
	// Handle edge cases
	if (!isFinite(value)) return min;
	if (!isFinite(min) || !isFinite(max)) return value;
	if (min > max) [min, max] = [max, min]; // Swap if min > max

	return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values.
 *
 * @param a - The start value
 * @param b - The end value
 * @param t - The interpolation factor (0-1)
 * @returns The interpolated value
 */
export function lerp(a: number, b: number, t: number): number {
	// Handle edge cases
	if (!isFinite(a) || !isFinite(b)) return a;
	if (!isFinite(t)) return a;

	// Clamp t between 0 and 1
	const clampedT = clamp(t, 0, 1);
	return a + (b - a) * clampedT;
}

/**
 * Generate a random integer between min (inclusive) and max (inclusive).
 *
 * @param min - The minimum value (inclusive)
 * @param max - The maximum value (inclusive)
 * @returns A random integer
 */
export function getRandomInt(min: number, max: number): number {
	// Handle edge cases
	if (!isFinite(min) || !isFinite(max)) return 0;

	// Ensure min and max are integers
	const minInt = Math.ceil(min);
	const maxInt = Math.floor(max);

	// Swap if min > max
	if (minInt > maxInt) return getRandomInt(maxInt, minInt);

	// Generate random integer (inclusive of both min and max)
	return Math.floor(Math.random() * (maxInt - minInt + 1)) + minInt;
}
