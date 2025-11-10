/**
 * Toast Notification Store
 *
 * Manages toast notifications for unlock events and other game messages.
 * Uses Svelte 5 runes for reactive state management.
 */

export interface Toast {
	/** Unique identifier for this toast */
	id: string;
	/** Toast message text */
	message: string;
	/** Optional title for the toast */
	title?: string;
	/** Toast type affects styling */
	type: 'success' | 'info' | 'warning' | 'error';
	/** Duration in milliseconds before auto-dismiss */
	duration: number;
	/** Icon emoji to display */
	icon?: string;
}

/**
 * Create a reactive toast store
 * Uses Svelte 5 $state rune for reactivity
 */
function createToastStore() {
	let toasts = $state<Toast[]>([]);

	return {
		// Expose toasts array as getter for reactive subscriptions
		get toasts() {
			return toasts;
		},

		/**
		 * Add a new toast notification
		 * @param toast - Toast configuration (id will be auto-generated if not provided)
		 */
		add(toast: Omit<Toast, 'id'> & { id?: string }): void {
			const id = toast.id || crypto.randomUUID();
			const newToast: Toast = {
				id,
				message: toast.message,
				title: toast.title,
				type: toast.type,
				duration: toast.duration,
				icon: toast.icon
			};

			toasts = [...toasts, newToast];

			// Auto-dismiss after duration
			if (newToast.duration > 0) {
				setTimeout(() => {
					this.dismiss(id);
				}, newToast.duration);
			}
		},

		/**
		 * Show a success toast (green, checkmark icon)
		 */
		success(message: string, title?: string, duration: number = 4000): void {
			this.add({
				message,
				title,
				type: 'success',
				icon: '✅',
				duration
			});
		},

		/**
		 * Show an info toast (blue, info icon)
		 */
		info(message: string, title?: string, duration: number = 4000): void {
			this.add({
				message,
				title,
				type: 'info',
				icon: 'ℹ️',
				duration
			});
		},

		/**
		 * Show a warning toast (yellow, warning icon)
		 */
		warning(message: string, title?: string, duration: number = 4000): void {
			this.add({
				message,
				title,
				type: 'warning',
				icon: '⚠️',
				duration
			});
		},

		/**
		 * Show an error toast (red, error icon)
		 */
		error(message: string, title?: string, duration: number = 4000): void {
			this.add({
				message,
				title,
				type: 'error',
				icon: '❌',
				duration
			});
		},

		/**
		 * Show an unlock notification (special styling for game unlocks)
		 */
		unlock(title: string, message: string, icon: string = '🎉', duration: number = 6000): void {
			this.add({
				message,
				title,
				type: 'success',
				icon,
				duration
			});
		},

		/**
		 * Dismiss a toast by ID
		 */
		dismiss(id: string): void {
			toasts = toasts.filter((toast) => toast.id !== id);
		},

		/**
		 * Clear all toasts
		 */
		clear(): void {
			toasts = [];
		}
	};
}

// Export singleton instance
export const toastStore = createToastStore();
