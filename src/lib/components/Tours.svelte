<script lang="ts">
	import type { GameState, Tour } from '$lib/game/types';
	import {
		startTour,
		canStartTour,
		getActiveTourCount,
		getMaxActiveTours,
		shouldUnlockTours
	} from '$lib/systems/tours';
	import { formatMoney, formatNumber, formatDuration } from '$lib/game/utils';
	import { TOUR_BASE_COST, TOUR_DURATION } from '$lib/game/config';

	// Props
	let { gameState = $bindable() }: { gameState: GameState } = $props();

	// Current time for progress tracking
	let currentTime = $state(Date.now());

	// Update current time periodically
	$effect(() => {
		const interval = setInterval(() => {
			currentTime = Date.now();
		}, 100);

		return () => clearInterval(interval);
	});

	// Derived state
	const canStart = $derived(canStartTour(gameState));
	const activeTourCount = $derived(getActiveTourCount(gameState));
	const maxTours = $derived(getMaxActiveTours(gameState));
	const isUnlocked = $derived(shouldUnlockTours(gameState));

	// Active and completed tours
	const activeTours = $derived(gameState.tours.filter((t) => t.completedAt === null));
	const completedTours = $derived(
		[...gameState.tours]
			.filter((t) => t.completedAt !== null)
			.sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0))
			.slice(0, 10) // Show last 10 completed tours
	);

	// Calculate progress for active tours
	function getTourProgress(tour: Tour): number {
		if (tour.completedAt !== null) return 100;
		const elapsed = currentTime - tour.startedAt;
		return Math.min(100, (elapsed / TOUR_DURATION) * 100);
	}

	function getRemainingTime(tour: Tour): number {
		if (tour.completedAt !== null) return 0;
		const elapsed = currentTime - tour.startedAt;
		return Math.max(0, TOUR_DURATION - elapsed);
	}

	// Start new tour
	function handleStartTour() {
		if (canStart) {
			startTour(gameState);
		}
	}

	// Format date
	function formatDate(timestamp: number): string {
		const date = new Date(timestamp);
		return date.toLocaleDateString();
	}
</script>

<div class="tours bg-game-panel rounded-lg p-6 shadow-lg">
	<h2 class="text-2xl font-bold mb-4 text-white">Tours & Concerts</h2>

	{#if !isUnlocked}
		<div class="unlock-requirements bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg p-4 mb-4">
			<h3 class="text-lg font-semibold text-yellow-400 mb-2">Unlock Requirements</h3>
			<ul class="text-sm text-gray-300 space-y-1">
				<li>✓ Tours system unlocked via tech upgrade</li>
				<li class:text-green-400={gameState.physicalAlbums.length >= 10}>
					{gameState.physicalAlbums.length >= 10 ? '✓' : '✗'} 10 physical albums ({gameState.physicalAlbums.length}/10)
				</li>
				<li class:text-green-400={gameState.fans >= 100_000}>
					{gameState.fans >= 100_000 ? '✓' : '✗'} 100,000 fans ({formatNumber(gameState.fans)}/100,000)
				</li>
			</ul>
		</div>
	{:else}
		<!-- Tour Stats -->
		<div class="stats-grid grid grid-cols-3 gap-4 mb-6">
			<div class="stat-card bg-gray-700 rounded-lg p-4">
				<div class="text-gray-400 text-sm mb-1">Active Tours</div>
				<div class="text-white text-2xl font-bold">{activeTourCount} / {maxTours}</div>
			</div>
			<div class="stat-card bg-gray-700 rounded-lg p-4">
				<div class="text-gray-400 text-sm mb-1">Total Tours</div>
				<div class="text-white text-2xl font-bold">{gameState.tours.length}</div>
			</div>
			<div class="stat-card bg-gray-700 rounded-lg p-4">
				<div class="text-gray-400 text-sm mb-1">Tour Cost</div>
				<div class="text-white text-2xl font-bold">{formatMoney(TOUR_BASE_COST)}</div>
			</div>
		</div>

		<!-- Start New Tour -->
		<div class="start-tour mb-6 bg-gray-700 rounded-lg p-4">
			<h3 class="text-lg font-semibold text-white mb-3">Start New Tour</h3>
			<div class="mb-3">
				<p class="text-sm text-gray-300">
					Duration: {formatDuration(TOUR_DURATION)} • Cost: {formatMoney(TOUR_BASE_COST)}
				</p>
				{#if !canStart && activeTourCount >= maxTours}
					<p class="text-sm text-yellow-400 mt-1">
						Maximum active tours reached ({activeTourCount}/{maxTours})
					</p>
				{:else if !canStart && gameState.money < TOUR_BASE_COST}
					<p class="text-sm text-yellow-400 mt-1">Not enough money</p>
				{/if}
			</div>
			<button
				onclick={handleStartTour}
				disabled={!canStart}
				class="w-full px-4 py-3 rounded-lg font-semibold transition-colors"
				class:bg-blue-600={canStart}
				class:hover:bg-blue-500={canStart}
				class:bg-gray-600={!canStart}
				class:cursor-not-allowed={!canStart}
				class:opacity-50={!canStart}
			>
				{canStart ? 'Start Tour' : 'Cannot Start Tour'}
			</button>
		</div>

		<!-- Active Tours -->
		{#if activeTours.length > 0}
			<div class="active-tours mb-6">
				<h3 class="text-lg font-semibold text-white mb-3">Active Tours</h3>
				<div class="space-y-3">
					{#each activeTours as tour (tour.id)}
						{@const progress = getTourProgress(tour)}
						{@const remaining = getRemainingTime(tour)}
						<div class="tour-card bg-gray-700 rounded-lg p-4">
							<div class="flex justify-between items-start mb-2">
								<div>
									<h4 class="font-bold text-white">{tour.name}</h4>
									<p class="text-sm text-gray-400">Started: {formatDate(tour.startedAt)}</p>
								</div>
								<div class="text-right">
									<div class="text-green-400 font-bold">{formatMoney(tour.incomePerSecond)}/s</div>
									<div class="text-sm text-gray-400">{formatDuration(remaining)} left</div>
								</div>
							</div>
							<div class="progress-container">
								<div class="w-full bg-gray-600 rounded-full h-2">
									<div
										class="bg-blue-500 h-2 rounded-full transition-all"
										style="width: {progress}%"
									></div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Completed Tours -->
		{#if completedTours.length > 0}
			<div class="completed-tours">
				<h3 class="text-lg font-semibold text-white mb-3">Recent Completed Tours</h3>
				<div class="space-y-2 max-h-64 overflow-y-auto">
					{#each completedTours as tour (tour.id)}
						<div class="tour-card bg-gray-800 bg-opacity-50 rounded-lg p-3">
							<div class="flex justify-between items-center">
								<div>
									<h4 class="font-semibold text-gray-300 text-sm">{tour.name}</h4>
									<p class="text-xs text-gray-500">Completed: {formatDate(tour.completedAt || 0)}</p>
								</div>
								<div class="text-right">
									<div class="text-green-400 text-sm font-semibold">
										{formatMoney(tour.incomePerSecond)}/s
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.tours {
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.completed-tours::-webkit-scrollbar {
		width: 8px;
	}

	.completed-tours::-webkit-scrollbar-track {
		background: #374151;
		border-radius: 4px;
	}

	.completed-tours::-webkit-scrollbar-thumb {
		background: #6b7280;
		border-radius: 4px;
	}

	.completed-tours::-webkit-scrollbar-thumb:hover {
		background: #9ca3af;
	}
</style>
