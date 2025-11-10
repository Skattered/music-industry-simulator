<script lang="ts">
	import type { GameState } from '../game/types';
	import { exportSave, importSave, deleteSave } from '../game/save';
	import { formatMoney, formatNumber } from '../game/utils';

	let {
		gameState,
		onClose,
		onHardReset
	}: {
		gameState: GameState;
		onClose: () => void;
		onHardReset: () => void;
	} = $props();

	let showResetConfirm = $state(false);
	let importError = $state<string | null>(null);
	let importSuccess = $state(false);

	// Calculate time played in hours
	const hoursPlayed = $derived(
		((Date.now() - gameState.createdAt) / (1000 * 60 * 60)).toFixed(1)
	);

	function handleExport() {
		const dataUrl = exportSave();
		if (dataUrl) {
			const link = document.createElement('a');
			link.href = dataUrl;
			link.download = `music-empire-save-${Date.now()}.json`;
			link.click();
		} else {
			console.error('Failed to export save');
		}
	}

	function handleImport() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json';
		input.onchange = async (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) return;

			try {
				const text = await file.text();
				const success = importSave(text);
				if (success) {
					importSuccess = true;
					importError = null;
					setTimeout(() => {
						window.location.reload();
					}, 1500);
				} else {
					importError = 'Invalid save file';
					importSuccess = false;
				}
			} catch (error) {
				importError = 'Failed to read file';
				importSuccess = false;
			}
		};
		input.click();
	}

	function handleResetClick() {
		showResetConfirm = true;
	}

	function handleResetConfirm() {
		deleteSave();
		onHardReset();
		showResetConfirm = false;
	}

	function handleResetCancel() {
		showResetConfirm = false;
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onClose();
		}
	}
</script>

<div
	class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
	role="dialog"
	aria-modal="true"
	aria-labelledby="settings-title"
	tabindex="-1"
	onclick={handleBackdropClick}
	onkeydown={handleKeyDown}
>
	<div class="bg-gray-800 rounded-lg shadow-2xl p-8 max-w-2xl w-full mx-4 border border-gray-700">
		<!-- Settings Header -->
		<div class="flex justify-between items-center mb-6">
			<h1 id="settings-title" class="text-3xl font-bold text-white">Settings</h1>
			<button
				onclick={onClose}
				class="text-gray-400 hover:text-white transition-colors text-2xl"
				aria-label="Close settings"
			>
				×
			</button>
		</div>

		<!-- Game Info -->
		<div class="bg-gray-900 rounded-lg p-4 mb-6">
			<h2 class="text-lg font-bold text-gray-300 mb-3">Game Information</h2>
			<div class="grid grid-cols-2 gap-3 text-sm">
				<div>
					<div class="text-gray-400">Version</div>
					<div class="text-white font-semibold">{gameState.version}</div>
				</div>
				<div>
					<div class="text-gray-400">Time Played</div>
					<div class="text-white font-semibold">{hoursPlayed} hours</div>
				</div>
				<div>
					<div class="text-gray-400">Current Money</div>
					<div class="text-white font-semibold">{formatMoney(gameState.money)}</div>
				</div>
				<div>
					<div class="text-gray-400">Total Fans</div>
					<div class="text-white font-semibold">{formatNumber(gameState.fans)}</div>
				</div>
				<div>
					<div class="text-gray-400">Phase</div>
					<div class="text-white font-semibold">{gameState.phase}</div>
				</div>
				<div>
					<div class="text-gray-400">Prestige Count</div>
					<div class="text-white font-semibold">{gameState.prestigeCount}</div>
				</div>
			</div>
		</div>

		<!-- Save Management -->
		<div class="bg-gray-900 rounded-lg p-4 mb-6">
			<h2 class="text-lg font-bold text-gray-300 mb-3">Save Management</h2>
			<div class="space-y-3">
				<button
					onclick={handleExport}
					class="w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors flex items-center justify-center gap-2"
				>
					<span>📥</span>
					<span>Export Save File</span>
				</button>
				<button
					onclick={handleImport}
					class="w-full px-4 py-3 bg-green-600 hover:bg-green-500 text-white rounded transition-colors flex items-center justify-center gap-2"
				>
					<span>📤</span>
					<span>Import Save File</span>
				</button>
				{#if importSuccess}
					<div class="text-green-400 text-sm text-center">
						Save imported successfully! Reloading...
					</div>
				{/if}
				{#if importError}
					<div class="text-red-400 text-sm text-center">{importError}</div>
				{/if}
			</div>
		</div>

		<!-- Danger Zone -->
		<div class="bg-red-900 bg-opacity-20 border border-red-800 rounded-lg p-4">
			<h2 class="text-lg font-bold text-red-400 mb-3">Danger Zone</h2>
			<p class="text-gray-300 text-sm mb-3">
				Warning: This will permanently delete all your progress and start a completely new game.
				This action cannot be undone!
			</p>
			{#if !showResetConfirm}
				<button
					onclick={handleResetClick}
					class="w-full px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded transition-colors font-semibold"
				>
					Hard Reset Game
				</button>
			{:else}
				<div class="bg-red-950 p-4 rounded border border-red-700">
					<p class="text-white font-bold mb-3 text-center">Are you absolutely sure?</p>
					<p class="text-gray-300 text-sm mb-4 text-center">
						All progress will be lost permanently!
					</p>
					<div class="flex gap-3">
						<button
							onclick={handleResetCancel}
							class="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
						>
							Cancel
						</button>
						<button
							onclick={handleResetConfirm}
							class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded transition-colors font-bold"
						>
							Yes, Delete Everything
						</button>
					</div>
				</div>
			{/if}
		</div>

		<!-- Close Button -->
		<div class="mt-6 flex justify-center">
			<button
				onclick={onClose}
				class="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
			>
				Close
			</button>
		</div>
	</div>
</div>
