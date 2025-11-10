/**
 * Toast Store Unit Tests
 *
 * Tests for the toast notification store including:
 * - Add, success, info, warning, error, unlock methods
 * - Auto-dismiss timers
 * - Reactive toasts getter
 * - Timeout cleanup on dismiss
 * - Clear all toasts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { toastStore } from './toasts.svelte';
import type { Toast } from './toasts.svelte';

describe('Toast Store', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		// Clear all toasts before each test
		toastStore.clear();
	});

	afterEach(() => {
		toastStore.clear();
		vi.restoreAllMocks();
		vi.useRealTimers();
	});

	describe('add()', () => {
		it('should add a toast with auto-generated ID', () => {
			toastStore.add({
				message: 'Test message',
				type: 'info',
				duration: 3000
			});

			expect(toastStore.toasts.length).toBe(1);
			expect(toastStore.toasts[0].message).toBe('Test message');
			expect(toastStore.toasts[0].type).toBe('info');
			expect(toastStore.toasts[0].duration).toBe(3000);
			expect(toastStore.toasts[0].id).toBeDefined();
		});

		it('should add a toast with custom ID', () => {
			toastStore.add({
				id: 'custom-id',
				message: 'Test message',
				type: 'success',
				duration: 4000
			});

			expect(toastStore.toasts.length).toBe(1);
			expect(toastStore.toasts[0].id).toBe('custom-id');
		});

		it('should add toast with optional title', () => {
			toastStore.add({
				message: 'Test message',
				title: 'Test Title',
				type: 'warning',
				duration: 2000
			});

			expect(toastStore.toasts[0].title).toBe('Test Title');
		});

		it('should add toast with optional icon', () => {
			toastStore.add({
				message: 'Test message',
				type: 'error',
				icon: '🔥',
				duration: 5000
			});

			expect(toastStore.toasts[0].icon).toBe('🔥');
		});

		it('should add multiple toasts', () => {
			toastStore.add({
				message: 'First toast',
				type: 'info',
				duration: 3000
			});

			toastStore.add({
				message: 'Second toast',
				type: 'success',
				duration: 4000
			});

			expect(toastStore.toasts.length).toBe(2);
			expect(toastStore.toasts[0].message).toBe('First toast');
			expect(toastStore.toasts[1].message).toBe('Second toast');
		});

		it('should auto-dismiss toast after duration', () => {
			toastStore.add({
				message: 'Auto-dismiss toast',
				type: 'info',
				duration: 3000
			});

			expect(toastStore.toasts.length).toBe(1);

			// Advance time by 2999ms - should still be there
			vi.advanceTimersByTime(2999);
			expect(toastStore.toasts.length).toBe(1);

			// Advance time by 1ms more (total 3000ms) - should be dismissed
			vi.advanceTimersByTime(1);
			expect(toastStore.toasts.length).toBe(0);
		});

		it('should not auto-dismiss toast with duration 0', () => {
			toastStore.add({
				message: 'Persistent toast',
				type: 'info',
				duration: 0
			});

			expect(toastStore.toasts.length).toBe(1);

			// Advance time - toast should still be there
			vi.advanceTimersByTime(10000);
			expect(toastStore.toasts.length).toBe(1);
		});

		it('should not auto-dismiss toast with negative duration', () => {
			toastStore.add({
				message: 'Persistent toast',
				type: 'info',
				duration: -1000
			});

			expect(toastStore.toasts.length).toBe(1);

			// Advance time - toast should still be there
			vi.advanceTimersByTime(10000);
			expect(toastStore.toasts.length).toBe(1);
		});
	});

	describe('success()', () => {
		it('should add success toast with default parameters', () => {
			toastStore.success('Success message');

			expect(toastStore.toasts.length).toBe(1);
			expect(toastStore.toasts[0].message).toBe('Success message');
			expect(toastStore.toasts[0].type).toBe('success');
			expect(toastStore.toasts[0].icon).toBe('✅');
			expect(toastStore.toasts[0].duration).toBe(4000);
			expect(toastStore.toasts[0].title).toBeUndefined();
		});

		it('should add success toast with title', () => {
			toastStore.success('Success message', 'Success Title');

			expect(toastStore.toasts[0].title).toBe('Success Title');
		});

		it('should add success toast with custom duration', () => {
			toastStore.success('Success message', undefined, 6000);

			expect(toastStore.toasts[0].duration).toBe(6000);
		});

		it('should add success toast with title and custom duration', () => {
			toastStore.success('Success message', 'Title', 7000);

			expect(toastStore.toasts[0].title).toBe('Title');
			expect(toastStore.toasts[0].duration).toBe(7000);
		});

		it('should auto-dismiss success toast after duration', () => {
			toastStore.success('Success message');

			expect(toastStore.toasts.length).toBe(1);

			vi.advanceTimersByTime(4000);
			expect(toastStore.toasts.length).toBe(0);
		});
	});

	describe('info()', () => {
		it('should add info toast with default parameters', () => {
			toastStore.info('Info message');

			expect(toastStore.toasts.length).toBe(1);
			expect(toastStore.toasts[0].message).toBe('Info message');
			expect(toastStore.toasts[0].type).toBe('info');
			expect(toastStore.toasts[0].icon).toBe('ℹ️');
			expect(toastStore.toasts[0].duration).toBe(4000);
		});

		it('should add info toast with title', () => {
			toastStore.info('Info message', 'Info Title');

			expect(toastStore.toasts[0].title).toBe('Info Title');
		});

		it('should add info toast with custom duration', () => {
			toastStore.info('Info message', undefined, 5000);

			expect(toastStore.toasts[0].duration).toBe(5000);
		});

		it('should auto-dismiss info toast after duration', () => {
			toastStore.info('Info message', undefined, 3000);

			expect(toastStore.toasts.length).toBe(1);

			vi.advanceTimersByTime(3000);
			expect(toastStore.toasts.length).toBe(0);
		});
	});

	describe('warning()', () => {
		it('should add warning toast with default parameters', () => {
			toastStore.warning('Warning message');

			expect(toastStore.toasts.length).toBe(1);
			expect(toastStore.toasts[0].message).toBe('Warning message');
			expect(toastStore.toasts[0].type).toBe('warning');
			expect(toastStore.toasts[0].icon).toBe('⚠️');
			expect(toastStore.toasts[0].duration).toBe(4000);
		});

		it('should add warning toast with title', () => {
			toastStore.warning('Warning message', 'Warning Title');

			expect(toastStore.toasts[0].title).toBe('Warning Title');
		});

		it('should add warning toast with custom duration', () => {
			toastStore.warning('Warning message', undefined, 8000);

			expect(toastStore.toasts[0].duration).toBe(8000);
		});

		it('should auto-dismiss warning toast after duration', () => {
			toastStore.warning('Warning message');

			expect(toastStore.toasts.length).toBe(1);

			vi.advanceTimersByTime(4000);
			expect(toastStore.toasts.length).toBe(0);
		});
	});

	describe('error()', () => {
		it('should add error toast with default parameters', () => {
			toastStore.error('Error message');

			expect(toastStore.toasts.length).toBe(1);
			expect(toastStore.toasts[0].message).toBe('Error message');
			expect(toastStore.toasts[0].type).toBe('error');
			expect(toastStore.toasts[0].icon).toBe('❌');
			expect(toastStore.toasts[0].duration).toBe(4000);
		});

		it('should add error toast with title', () => {
			toastStore.error('Error message', 'Error Title');

			expect(toastStore.toasts[0].title).toBe('Error Title');
		});

		it('should add error toast with custom duration', () => {
			toastStore.error('Error message', undefined, 10000);

			expect(toastStore.toasts[0].duration).toBe(10000);
		});

		it('should auto-dismiss error toast after duration', () => {
			toastStore.error('Error message');

			expect(toastStore.toasts.length).toBe(1);

			vi.advanceTimersByTime(4000);
			expect(toastStore.toasts.length).toBe(0);
		});
	});

	describe('unlock()', () => {
		it('should add unlock toast with default parameters', () => {
			toastStore.unlock('Feature Unlocked', 'You unlocked a new feature!');

			expect(toastStore.toasts.length).toBe(1);
			expect(toastStore.toasts[0].title).toBe('Feature Unlocked');
			expect(toastStore.toasts[0].message).toBe('You unlocked a new feature!');
			expect(toastStore.toasts[0].type).toBe('success');
			expect(toastStore.toasts[0].icon).toBe('🎉');
			expect(toastStore.toasts[0].duration).toBe(6000);
		});

		it('should add unlock toast with custom icon', () => {
			toastStore.unlock('Achievement', 'Great job!', '🏆');

			expect(toastStore.toasts[0].icon).toBe('🏆');
		});

		it('should add unlock toast with custom duration', () => {
			toastStore.unlock('Milestone', 'You reached a milestone!', '🎯', 8000);

			expect(toastStore.toasts[0].duration).toBe(8000);
		});

		it('should auto-dismiss unlock toast after duration', () => {
			toastStore.unlock('Test', 'Test message');

			expect(toastStore.toasts.length).toBe(1);

			vi.advanceTimersByTime(6000);
			expect(toastStore.toasts.length).toBe(0);
		});
	});

	describe('dismiss()', () => {
		it('should dismiss toast by ID', () => {
			toastStore.add({
				id: 'toast-1',
				message: 'First',
				type: 'info',
				duration: 5000
			});

			toastStore.add({
				id: 'toast-2',
				message: 'Second',
				type: 'info',
				duration: 5000
			});

			expect(toastStore.toasts.length).toBe(2);

			toastStore.dismiss('toast-1');
			expect(toastStore.toasts.length).toBe(1);
			expect(toastStore.toasts[0].id).toBe('toast-2');
		});

		it('should clear timeout when dismissing toast early', () => {
			toastStore.add({
				id: 'early-dismiss',
				message: 'Test',
				type: 'info',
				duration: 10000
			});

			expect(toastStore.toasts.length).toBe(1);

			// Dismiss early (before timeout)
			toastStore.dismiss('early-dismiss');
			expect(toastStore.toasts.length).toBe(0);

			// Advance past original duration - nothing should happen
			vi.advanceTimersByTime(10000);
			expect(toastStore.toasts.length).toBe(0);
		});

		it('should handle dismissing non-existent toast', () => {
			toastStore.add({
				id: 'existing-toast',
				message: 'Test',
				type: 'info',
				duration: 5000
			});

			expect(toastStore.toasts.length).toBe(1);

			// Try to dismiss non-existent toast
			toastStore.dismiss('non-existent-id');

			// Original toast should still be there
			expect(toastStore.toasts.length).toBe(1);
			expect(toastStore.toasts[0].id).toBe('existing-toast');
		});

		it('should handle dismissing toast without timeout', () => {
			toastStore.add({
				id: 'no-timeout-toast',
				message: 'Test',
				type: 'info',
				duration: 0
			});

			expect(toastStore.toasts.length).toBe(1);

			// Dismiss toast that has no timeout
			toastStore.dismiss('no-timeout-toast');
			expect(toastStore.toasts.length).toBe(0);
		});
	});

	describe('clear()', () => {
		it('should clear all toasts', () => {
			toastStore.success('Toast 1');
			toastStore.info('Toast 2');
			toastStore.warning('Toast 3');
			toastStore.error('Toast 4');

			expect(toastStore.toasts.length).toBe(4);

			toastStore.clear();
			expect(toastStore.toasts.length).toBe(0);
		});

		it('should clear all pending timeouts', () => {
			toastStore.add({
				id: 'toast-1',
				message: 'First',
				type: 'info',
				duration: 5000
			});

			toastStore.add({
				id: 'toast-2',
				message: 'Second',
				type: 'info',
				duration: 10000
			});

			expect(toastStore.toasts.length).toBe(2);

			toastStore.clear();
			expect(toastStore.toasts.length).toBe(0);

			// Advance time past all durations - nothing should happen
			vi.advanceTimersByTime(15000);
			expect(toastStore.toasts.length).toBe(0);
		});

		it('should handle clearing when no toasts exist', () => {
			expect(toastStore.toasts.length).toBe(0);

			toastStore.clear();
			expect(toastStore.toasts.length).toBe(0);
		});
	});

	describe('toasts getter', () => {
		it('should return empty array initially', () => {
			expect(toastStore.toasts).toEqual([]);
		});

		it('should return current toasts', () => {
			toastStore.success('Toast 1');
			toastStore.info('Toast 2');

			expect(toastStore.toasts.length).toBe(2);
			expect(toastStore.toasts[0].message).toBe('Toast 1');
			expect(toastStore.toasts[1].message).toBe('Toast 2');
		});

		it('should reflect updates to toast array', () => {
			toastStore.success('Toast 1');
			expect(toastStore.toasts.length).toBe(1);

			toastStore.success('Toast 2');
			expect(toastStore.toasts.length).toBe(2);

			toastStore.dismiss(toastStore.toasts[0].id);
			expect(toastStore.toasts.length).toBe(1);
		});
	});

	describe('Multiple toasts with different durations', () => {
		it('should handle multiple toasts dismissing at different times', () => {
			toastStore.add({
				id: 'short',
				message: 'Short',
				type: 'info',
				duration: 2000
			});

			toastStore.add({
				id: 'medium',
				message: 'Medium',
				type: 'info',
				duration: 4000
			});

			toastStore.add({
				id: 'long',
				message: 'Long',
				type: 'info',
				duration: 6000
			});

			expect(toastStore.toasts.length).toBe(3);

			// After 2000ms - short should be dismissed
			vi.advanceTimersByTime(2000);
			expect(toastStore.toasts.length).toBe(2);
			expect(toastStore.toasts.find((t) => t.id === 'short')).toBeUndefined();

			// After 2000ms more (4000ms total) - medium should be dismissed
			vi.advanceTimersByTime(2000);
			expect(toastStore.toasts.length).toBe(1);
			expect(toastStore.toasts.find((t) => t.id === 'medium')).toBeUndefined();
			expect(toastStore.toasts[0].id).toBe('long');

			// After 2000ms more (6000ms total) - long should be dismissed
			vi.advanceTimersByTime(2000);
			expect(toastStore.toasts.length).toBe(0);
		});
	});

	describe('Edge cases', () => {
		it('should handle empty message', () => {
			toastStore.success('');

			expect(toastStore.toasts.length).toBe(1);
			expect(toastStore.toasts[0].message).toBe('');
		});

		it('should handle very long message', () => {
			const longMessage = 'a'.repeat(1000);
			toastStore.success(longMessage);

			expect(toastStore.toasts[0].message).toBe(longMessage);
		});

		it('should handle special characters in message', () => {
			const specialMessage = '!@#$%^&*()_+-={}[]|\\:";\'<>?,./';
			toastStore.success(specialMessage);

			expect(toastStore.toasts[0].message).toBe(specialMessage);
		});

		it('should handle unicode characters and emojis in message', () => {
			const unicodeMessage = '你好世界 🌍 مرحبا العالم';
			toastStore.success(unicodeMessage);

			expect(toastStore.toasts[0].message).toBe(unicodeMessage);
		});

		it('should generate unique IDs for multiple toasts', () => {
			toastStore.success('Toast 1');
			toastStore.success('Toast 2');
			toastStore.success('Toast 3');

			const ids = toastStore.toasts.map((t) => t.id);
			const uniqueIds = new Set(ids);

			expect(uniqueIds.size).toBe(3);
		});

		it('should handle rapid successive additions', () => {
			for (let i = 0; i < 10; i++) {
				toastStore.success(`Toast ${i}`);
			}

			expect(toastStore.toasts.length).toBe(10);
		});

		it('should handle rapid dismissals', () => {
			const ids: string[] = [];
			for (let i = 0; i < 5; i++) {
				toastStore.add({
					id: `toast-${i}`,
					message: `Toast ${i}`,
					type: 'info',
					duration: 10000
				});
				ids.push(`toast-${i}`);
			}

			expect(toastStore.toasts.length).toBe(5);

			// Dismiss all rapidly
			ids.forEach((id) => toastStore.dismiss(id));

			expect(toastStore.toasts.length).toBe(0);
		});
	});
});
