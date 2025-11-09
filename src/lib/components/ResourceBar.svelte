<script lang="ts">
	import type { GameState } from '../game/types';
	import { formatMoney, formatNumber } from '../game/utils';

	let { gameState = $bindable() }: { gameState: GameState } = $props();

	// Calculate total income per second from all sources
	const incomePerSecond = $derived.by(() => {
		// Sum income from all songs
		const songIncome = gameState.songs.reduce((total, song) => total + song.incomePerSecond, 0);

		// Sum income from legacy artists
		const legacyIncome = gameState.legacyArtists.reduce(
			(total, artist) => total + artist.incomeRate,
			0
		);

		return songIncome + legacyIncome;
	});

	// Calculate progress bar width
	const progressWidth = $derived(`${Math.min(gameState.industryControl, 100)}%`);
</script>

<div class="resource-bar bg-game-panel rounded-lg p-4 shadow-lg">
	<div class="resources-grid grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
		<!-- Money -->
		<div class="resource-item">
			<div class="resource-label text-gray-400 text-sm mb-1">Money</div>
			<div class="resource-value text-white text-lg font-semibold">
				<span class="icon">💰</span>
				{formatMoney(gameState.money)}
				<span class="text-sm text-gray-400">({formatMoney(incomePerSecond)}/s)</span>
			</div>
		</div>

		<!-- Songs -->
		<div class="resource-item">
			<div class="resource-label text-gray-400 text-sm mb-1">Songs</div>
			<div class="resource-value text-white text-lg font-semibold">
				<span class="icon">🎵</span>
				{formatNumber(gameState.songs.length)}
			</div>
		</div>

		<!-- Fans -->
		<div class="resource-item">
			<div class="resource-label text-gray-400 text-sm mb-1">Fans</div>
			<div class="resource-value text-white text-lg font-semibold">
				<span class="icon">👥</span>
				{formatNumber(gameState.fans)}
			</div>
		</div>

		<!-- GPU (conditional) -->
		{#if gameState.unlockedSystems.gpu}
			<div class="resource-item">
				<div class="resource-label text-gray-400 text-sm mb-1">GPU</div>
				<div class="resource-value text-white text-lg font-semibold">
					<span class="icon">🖥️</span>
					{formatNumber(gameState.gpu)}
				</div>
			</div>
		{/if}
	</div>

	<!-- Industry Control Progress Bar -->
	<div class="industry-control">
		<div class="flex justify-between items-center mb-2">
			<span class="text-gray-400 text-sm">Industry Control</span>
			<span class="text-white text-sm font-semibold"
				>{gameState.industryControl.toFixed(0)}%</span
			>
		</div>
		<div class="progress-bar-container bg-gray-700 rounded-full h-3 overflow-hidden">
			<div
				class="progress-bar-fill bg-game-accent h-full transition-all duration-300"
				style="width: {progressWidth}"
			></div>
		</div>
	</div>
</div>

<style>
	.resource-bar {
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.icon {
		margin-right: 0.25rem;
	}

	@media (max-width: 640px) {
		.resources-grid {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
