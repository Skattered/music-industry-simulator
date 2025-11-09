import { describe, it, expect } from 'vitest';
import {
	formatMoney,
	formatNumber,
	formatTime,
	formatDuration,
	clamp,
	lerp,
	getRandomInt
} from './utils';

describe('formatMoney', () => {
	it('should format zero correctly', () => {
		expect(formatMoney(0)).toBe('$0');
	});

	it('should format small amounts with cents', () => {
		expect(formatMoney(0.5)).toBe('$0.5');
		expect(formatMoney(1.23)).toBe('$1.23');
		expect(formatMoney(99.99)).toBe('$99.99');
		expect(formatMoney(999.99)).toBe('$999.99');
	});

	it('should format thousands with K suffix', () => {
		expect(formatMoney(1000)).toBe('$1K');
		expect(formatMoney(1234)).toBe('$1.23K');
		expect(formatMoney(9999)).toBe('$10K');
		expect(formatMoney(50000)).toBe('$50K');
		expect(formatMoney(999999)).toBe('$1000K');
	});

	it('should format millions with M suffix', () => {
		expect(formatMoney(1_000_000)).toBe('$1M');
		expect(formatMoney(1_234_567)).toBe('$1.23M');
		expect(formatMoney(50_000_000)).toBe('$50M');
		expect(formatMoney(999_999_999)).toBe('$1000M');
	});

	it('should format billions with B suffix', () => {
		expect(formatMoney(1_000_000_000)).toBe('$1B');
		expect(formatMoney(1_234_567_890)).toBe('$1.23B');
		expect(formatMoney(50_000_000_000)).toBe('$50B');
		expect(formatMoney(999_999_999_999)).toBe('$1000B');
	});

	it('should format trillions with T suffix', () => {
		expect(formatMoney(1_000_000_000_000)).toBe('$1T');
		expect(formatMoney(1_234_567_890_123)).toBe('$1.23T');
		expect(formatMoney(50_000_000_000_000)).toBe('$50T');
	});

	it('should handle negative amounts', () => {
		expect(formatMoney(-100)).toBe('-$100');
		expect(formatMoney(-1234)).toBe('-$1.23K');
		expect(formatMoney(-1_000_000)).toBe('-$1M');
		expect(formatMoney(-1_000_000_000)).toBe('-$1B');
	});

	it('should handle edge cases', () => {
		expect(formatMoney(Infinity)).toBe('$0');
		expect(formatMoney(-Infinity)).toBe('$0');
		expect(formatMoney(NaN)).toBe('$0');
	});

	it('should remove trailing zeros', () => {
		expect(formatMoney(1_500_000)).toBe('$1.5M');
		expect(formatMoney(2_000_000)).toBe('$2M');
		expect(formatMoney(1_100_000)).toBe('$1.1M');
	});
});

describe('formatNumber', () => {
	it('should format zero correctly', () => {
		expect(formatNumber(0)).toBe('0');
	});

	it('should format small numbers with commas', () => {
		expect(formatNumber(100)).toBe('100');
		expect(formatNumber(1000)).toBe('1K');
		expect(formatNumber(999)).toBe('999');
	});

	it('should format thousands with K suffix', () => {
		expect(formatNumber(1000)).toBe('1K');
		expect(formatNumber(1234)).toBe('1.23K');
		expect(formatNumber(9999)).toBe('10K');
		expect(formatNumber(50000)).toBe('50K');
	});

	it('should format millions with M suffix', () => {
		expect(formatNumber(1_000_000)).toBe('1M');
		expect(formatNumber(1_234_567)).toBe('1.23M');
		expect(formatNumber(50_000_000)).toBe('50M');
	});

	it('should format billions with B suffix', () => {
		expect(formatNumber(1_000_000_000)).toBe('1B');
		expect(formatNumber(1_234_567_890)).toBe('1.23B');
		expect(formatNumber(50_000_000_000)).toBe('50B');
	});

	it('should format trillions with T suffix', () => {
		expect(formatNumber(1_000_000_000_000)).toBe('1T');
		expect(formatNumber(1_234_567_890_123)).toBe('1.23T');
	});

	it('should handle negative numbers', () => {
		expect(formatNumber(-100)).toBe('-100');
		expect(formatNumber(-1234)).toBe('-1.23K');
		expect(formatNumber(-1_000_000)).toBe('-1M');
	});

	it('should handle edge cases', () => {
		expect(formatNumber(Infinity)).toBe('0');
		expect(formatNumber(-Infinity)).toBe('0');
		expect(formatNumber(NaN)).toBe('0');
	});

	it('should remove trailing zeros', () => {
		expect(formatNumber(1_500_000)).toBe('1.5M');
		expect(formatNumber(2_000_000)).toBe('2M');
	});
});

describe('formatTime', () => {
	it('should format zero seconds', () => {
		expect(formatTime(0)).toBe('0:00');
	});

	it('should format seconds only', () => {
		expect(formatTime(5)).toBe('0:05');
		expect(formatTime(30)).toBe('0:30');
		expect(formatTime(59)).toBe('0:59');
	});

	it('should format minutes and seconds', () => {
		expect(formatTime(60)).toBe('1:00');
		expect(formatTime(83)).toBe('1:23');
		expect(formatTime(754)).toBe('12:34');
		expect(formatTime(3599)).toBe('59:59');
	});

	it('should format hours, minutes, and seconds', () => {
		expect(formatTime(3600)).toBe('1:00:00');
		expect(formatTime(3750)).toBe('1:02:30');
		expect(formatTime(45296)).toBe('12:34:56');
	});

	it('should handle edge cases', () => {
		expect(formatTime(-10)).toBe('0:00');
		expect(formatTime(Infinity)).toBe('0:00');
		expect(formatTime(NaN)).toBe('0:00');
	});

	it('should handle decimal seconds', () => {
		expect(formatTime(5.7)).toBe('0:05');
		expect(formatTime(83.9)).toBe('1:23');
	});
});

describe('formatDuration', () => {
	it('should format zero duration', () => {
		expect(formatDuration(0)).toBe('0s');
	});

	it('should format seconds', () => {
		expect(formatDuration(1000)).toBe('1s');
		expect(formatDuration(2500)).toBe('2.5s');
		expect(formatDuration(30000)).toBe('30s');
		expect(formatDuration(59000)).toBe('59s');
	});

	it('should format minutes', () => {
		expect(formatDuration(60000)).toBe('1m');
		expect(formatDuration(90000)).toBe('1.5m');
		expect(formatDuration(120000)).toBe('2m');
		expect(formatDuration(3540000)).toBe('59m');
	});

	it('should format hours', () => {
		expect(formatDuration(3600000)).toBe('1h');
		expect(formatDuration(5400000)).toBe('1.5h');
		expect(formatDuration(7200000)).toBe('2h');
		expect(formatDuration(82800000)).toBe('23h');
	});

	it('should format days', () => {
		expect(formatDuration(86400000)).toBe('1d');
		expect(formatDuration(129600000)).toBe('1.5d');
		expect(formatDuration(172800000)).toBe('2d');
		expect(formatDuration(604800000)).toBe('7d');
	});

	it('should handle edge cases', () => {
		expect(formatDuration(-1000)).toBe('0s');
		expect(formatDuration(Infinity)).toBe('0s');
		expect(formatDuration(NaN)).toBe('0s');
	});

	it('should remove trailing .0', () => {
		expect(formatDuration(60000)).toBe('1m');
		expect(formatDuration(3600000)).toBe('1h');
		expect(formatDuration(86400000)).toBe('1d');
	});
});

describe('clamp', () => {
	it('should return value when within range', () => {
		expect(clamp(5, 0, 10)).toBe(5);
		expect(clamp(0, 0, 10)).toBe(0);
		expect(clamp(10, 0, 10)).toBe(10);
	});

	it('should clamp to min when value is below', () => {
		expect(clamp(-5, 0, 10)).toBe(0);
		expect(clamp(-100, -50, 50)).toBe(-50);
	});

	it('should clamp to max when value is above', () => {
		expect(clamp(15, 0, 10)).toBe(10);
		expect(clamp(100, -50, 50)).toBe(50);
	});

	it('should handle negative ranges', () => {
		expect(clamp(-3, -10, -1)).toBe(-3);
		expect(clamp(-15, -10, -1)).toBe(-10);
		expect(clamp(0, -10, -1)).toBe(-1);
	});

	it('should handle inverted min/max (swaps them)', () => {
		expect(clamp(5, 10, 0)).toBe(5);
		expect(clamp(-5, 10, 0)).toBe(0);
		expect(clamp(15, 10, 0)).toBe(10);
	});

	it('should handle edge cases', () => {
		expect(clamp(Infinity, 0, 10)).toBe(0);
		expect(clamp(NaN, 0, 10)).toBe(0);
		expect(clamp(5, Infinity, 10)).toBe(5);
		expect(clamp(5, 0, Infinity)).toBe(5);
	});

	it('should handle same min and max', () => {
		expect(clamp(5, 10, 10)).toBe(10);
		expect(clamp(15, 10, 10)).toBe(10);
	});
});

describe('lerp', () => {
	it('should return start value at t=0', () => {
		expect(lerp(0, 100, 0)).toBe(0);
		expect(lerp(10, 20, 0)).toBe(10);
	});

	it('should return end value at t=1', () => {
		expect(lerp(0, 100, 1)).toBe(100);
		expect(lerp(10, 20, 1)).toBe(20);
	});

	it('should interpolate correctly', () => {
		expect(lerp(0, 100, 0.5)).toBe(50);
		expect(lerp(0, 100, 0.25)).toBe(25);
		expect(lerp(0, 100, 0.75)).toBe(75);
		expect(lerp(10, 20, 0.5)).toBe(15);
	});

	it('should handle negative values', () => {
		expect(lerp(-100, 100, 0.5)).toBe(0);
		expect(lerp(-10, -5, 0.5)).toBe(-7.5);
	});

	it('should clamp t to [0, 1]', () => {
		expect(lerp(0, 100, 1.5)).toBe(100);
		expect(lerp(0, 100, -0.5)).toBe(0);
	});

	it('should handle edge cases', () => {
		expect(lerp(Infinity, 100, 0.5)).toBe(Infinity);
		expect(lerp(0, Infinity, 0.5)).toBe(0);
		expect(lerp(0, 100, NaN)).toBe(0);
		expect(lerp(NaN, 100, 0.5)).toBe(NaN);
	});

	it('should work with same start and end values', () => {
		expect(lerp(50, 50, 0.5)).toBe(50);
	});
});

describe('getRandomInt', () => {
	it('should return value within range', () => {
		for (let i = 0; i < 100; i++) {
			const result = getRandomInt(0, 10);
			expect(result).toBeGreaterThanOrEqual(0);
			expect(result).toBeLessThanOrEqual(10);
			expect(Number.isInteger(result)).toBe(true);
		}
	});

	it('should include both min and max', () => {
		const results = new Set<number>();
		// Run enough times to likely get both endpoints
		for (let i = 0; i < 1000; i++) {
			results.add(getRandomInt(0, 1));
		}
		expect(results.has(0)).toBe(true);
		expect(results.has(1)).toBe(true);
	});

	it('should handle negative ranges', () => {
		for (let i = 0; i < 100; i++) {
			const result = getRandomInt(-10, -5);
			expect(result).toBeGreaterThanOrEqual(-10);
			expect(result).toBeLessThanOrEqual(-5);
		}
	});

	it('should handle inverted min/max', () => {
		for (let i = 0; i < 100; i++) {
			const result = getRandomInt(10, 0);
			expect(result).toBeGreaterThanOrEqual(0);
			expect(result).toBeLessThanOrEqual(10);
		}
	});

	it('should return same value when min equals max', () => {
		expect(getRandomInt(5, 5)).toBe(5);
		expect(getRandomInt(-3, -3)).toBe(-3);
	});

	it('should handle decimal inputs (rounds to integers)', () => {
		for (let i = 0; i < 100; i++) {
			const result = getRandomInt(1.7, 5.9);
			expect(result).toBeGreaterThanOrEqual(2);
			expect(result).toBeLessThanOrEqual(5);
		}
	});

	it('should handle edge cases', () => {
		expect(getRandomInt(Infinity, 10)).toBe(0);
		expect(getRandomInt(0, Infinity)).toBe(0);
		expect(getRandomInt(NaN, 10)).toBe(0);
	});

	it('should produce relatively uniform distribution', () => {
		const counts = new Map<number, number>();
		const iterations = 10000;
		const min = 1;
		const max = 5;

		for (let i = 0; i < iterations; i++) {
			const result = getRandomInt(min, max);
			counts.set(result, (counts.get(result) || 0) + 1);
		}

		// Each value should appear roughly 20% of the time (with some variance)
		// We'll use a generous tolerance for randomness
		const expectedProbability = 1 / (max - min + 1);
		for (let i = min; i <= max; i++) {
			const probability = (counts.get(i) || 0) / iterations;
			expect(probability).toBeGreaterThan(expectedProbability * 0.7);
			expect(probability).toBeLessThan(expectedProbability * 1.3);
		}
	});
});
