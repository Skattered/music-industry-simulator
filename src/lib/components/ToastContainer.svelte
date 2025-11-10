<script lang="ts">
	import { toastStore } from '../stores/toasts.svelte';

	// Access reactive toasts from store
	const toasts = $derived(toastStore.toasts);

	function handleDismiss(id: string) {
		toastStore.dismiss(id);
	}
</script>

<div class="toast-container fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
	{#each toasts as toast (toast.id)}
		<div
			class="toast pointer-events-auto bg-game-panel border rounded-lg shadow-lg p-4 min-w-[300px] max-w-[400px] animate-slide-in"
			class:toast-success={toast.type === 'success'}
			class:toast-info={toast.type === 'info'}
			class:toast-warning={toast.type === 'warning'}
			class:toast-error={toast.type === 'error'}
		>
			<div class="flex items-start gap-3">
				{#if toast.icon}
					<div class="text-2xl flex-shrink-0">
						{toast.icon}
					</div>
				{/if}

				<div class="flex-1 min-w-0">
					{#if toast.title}
						<div class="font-bold text-white mb-1">
							{toast.title}
						</div>
					{/if}
					<div class="text-gray-300 text-sm">
						{toast.message}
					</div>
				</div>

				<button
					onclick={() => handleDismiss(toast.id)}
					class="text-gray-400 hover:text-white transition-colors flex-shrink-0"
					aria-label="Dismiss"
				>
					✕
				</button>
			</div>
		</div>
	{/each}
</div>

<style>
	.toast {
		border-width: 1px;
		backdrop-filter: blur(8px);
	}

	.toast-success {
		border-color: rgb(34, 197, 94);
		background: rgba(22, 101, 52, 0.9);
	}

	.toast-info {
		border-color: rgb(59, 130, 246);
		background: rgba(30, 58, 138, 0.9);
	}

	.toast-warning {
		border-color: rgb(234, 179, 8);
		background: rgba(113, 63, 18, 0.9);
	}

	.toast-error {
		border-color: rgb(239, 68, 68);
		background: rgba(127, 29, 29, 0.9);
	}

	@keyframes slide-in {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	.animate-slide-in {
		animation: slide-in 0.3s ease-out;
	}

	@media (max-width: 640px) {
		.toast-container {
			left: 1rem;
			right: 1rem;
			top: 1rem;
		}

		.toast {
			min-width: auto;
			max-width: 100%;
		}
	}
</style>
