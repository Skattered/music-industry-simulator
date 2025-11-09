<script lang="ts">
	import type { GameState, BoostDefinition } from '$lib/game/types';
	import { BOOSTS } from '$lib/game/config';
	import { formatMoney, formatDuration } from '$lib/game/utils';
	import { onMount, onDestroy } from 'svelte';

	interface Props {
		gameState: GameState;
		onActivateBoost: (boostId: string) => void;
	}

	let { gameState, onActivateBoost }: Props = $props();

	// Category definitions for organizing boosts
	const CATEGORIES = [
		{
			id: 'streaming',
			name: 'Streaming',
			boostIds: ['bot_streams', 'playlist_placement', 'social_media']
		},
		{
			id: 'physical',
			name: 'Physical',
			boostIds: ['limited_variants', 'shut_down_competitors', 'exclusive_deals']
		},
		{
			id: 'concerts',
			name: 'Concerts',
			boostIds: ['scalp_records', 'limit_tickets', 'scalp_tickets', 'fomo_marketing']
		},
		{
			id: 'platform',
			name: 'Platform',
			boostIds: ['dynamic_pricing']
		}
	] as const;

	let selectedCategory = $state<string>('streaming');
	let currentTime = $state(Date.now());
	let timerInterval: ReturnType<typeof setInterval> | null = null;

	// Update current time every 100ms for smooth countdown
	onMount(() => {
		timerInterval = setInterval(() => {
			currentTime = Date.now();
		}, 100);
	});

	onDestroy(() => {
		if (timerInterval) {
			clearInterval(timerInterval);
		}
	});

	// Calculate cost for a boost including scaling
	function calculateBoostCost(boost: BoostDefinition): number {
		const usageCount = gameState.boostUsageCounts[boost.id] || 0;
		return Math.floor(boost.baseCost * Math.pow(boost.costScaling, usageCount));
	}

	// Check if a boost is currently active
	function isBoostActive(boostId: string): boolean {
		return gameState.activeBoosts.some((ab) => ab.id === boostId);
	}

	// Get active boost instance if it exists
	function getActiveBoost(boostId: string) {
		return gameState.activeBoosts.find((ab) => ab.id === boostId);
	}

	// Calculate remaining time for an active boost
	function getRemainingTime(boostId: string): number {
		const activeBoost = getActiveBoost(boostId);
		if (!activeBoost) return 0;

		const elapsed = currentTime - activeBoost.activatedAt;
		const remaining = Math.max(0, activeBoost.duration - elapsed);
		return remaining;
	}

	// Check if player can afford a boost
	function canAfford(boost: BoostDefinition): boolean {
		return gameState.money >= calculateBoostCost(boost);
	}

	// Handle boost activation
	function handleActivateBoost(boostId: string) {
		onActivateBoost(boostId);
	}

	// Get boosts for the selected category
	let categoryBoosts = $derived(
		(() => {
			const category = CATEGORIES.find((c) => c.id === selectedCategory);
			if (!category) return [];
			return BOOSTS.filter((boost) => {
				const boostIds = category.boostIds as readonly string[];
				return boostIds.includes(boost.id);
			});
		})()
	);
</script>

<div class="upgrade-panel">
	<div class="panel-header">
		<h2 class="panel-title">Exploitation Abilities</h2>
		<p class="panel-subtitle">Morally questionable but profitable tactics</p>
	</div>

	<!-- Category Tabs -->
	<div class="category-tabs">
		{#each CATEGORIES as category}
			<button
				class="tab"
				class:active={selectedCategory === category.id}
				onclick={() => (selectedCategory = category.id)}
				type="button"
			>
				{category.name}
			</button>
		{/each}
	</div>

	<!-- Active Boosts Section -->
	{#if gameState.activeBoosts.length > 0}
		<div class="active-boosts-section">
			<h3 class="section-title">Active Boosts</h3>
			<div class="active-boosts-grid">
				{#each gameState.activeBoosts as activeBoost}
					{@const remaining = getRemainingTime(activeBoost.id)}
					<div class="active-boost-card">
						<div class="boost-name">{activeBoost.name}</div>
						<div class="boost-timer">
							<svg class="timer-icon" viewBox="0 0 20 20" fill="currentColor">
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
									clip-rule="evenodd"
								/>
							</svg>
							{formatDuration(remaining)}
						</div>
						<div class="boost-effects">
							{#if activeBoost.incomeMultiplier !== 1}
								<span class="effect">+{((activeBoost.incomeMultiplier - 1) * 100).toFixed(0)}% Income</span
								>
							{/if}
							{#if activeBoost.fanMultiplier !== 1}
								<span class="effect">+{((activeBoost.fanMultiplier - 1) * 100).toFixed(0)}% Fans</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Available Boosts Section -->
	<div class="available-boosts-section">
		<h3 class="section-title">Available Boosts</h3>
		<div class="boosts-grid">
			{#each categoryBoosts as boost}
				{@const cost = calculateBoostCost(boost)}
				{@const active = isBoostActive(boost.id)}
				{@const affordable = canAfford(boost)}
				{@const usageCount = gameState.boostUsageCounts[boost.id] || 0}

				<div class="boost-card" class:disabled={!affordable || active} class:active>
					<div class="boost-header">
						<h4 class="boost-name">{boost.name}</h4>
						{#if usageCount > 0}
							<span class="usage-badge">{usageCount}x used</span>
						{/if}
					</div>

					<p class="boost-description">{boost.description}</p>

					<div class="boost-stats">
						<div class="stat-row">
							<span class="stat-label">Duration:</span>
							<span class="stat-value">{formatDuration(boost.duration)}</span>
						</div>

						{#if boost.incomeMultiplier !== 1}
							<div class="stat-row">
								<span class="stat-label">Income:</span>
								<span class="stat-value positive">
									{boost.incomeMultiplier < 1 ? '' : '+'}
									{((boost.incomeMultiplier - 1) * 100).toFixed(0)}%
								</span>
							</div>
						{/if}

						{#if boost.fanMultiplier !== 1}
							<div class="stat-row">
								<span class="stat-label">Fans:</span>
								<span class="stat-value positive">
									{boost.fanMultiplier < 1 ? '' : '+'}
									{((boost.fanMultiplier - 1) * 100).toFixed(0)}%
								</span>
							</div>
						{/if}
					</div>

					<button
						class="activate-button"
						class:disabled={!affordable || active}
						onclick={() => handleActivateBoost(boost.id)}
						disabled={!affordable || active}
						type="button"
					>
						{#if active}
							Active
						{:else if !affordable}
							Can't Afford
						{:else}
							Activate - {formatMoney(cost)}
						{/if}
					</button>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.upgrade-panel {
		width: 100%;
		max-width: 1200px;
		margin: 0 auto;
		padding: 1.5rem;
	}

	.panel-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.panel-title {
		font-size: 2rem;
		font-weight: bold;
		color: #1f2937;
		margin-bottom: 0.5rem;
	}

	.panel-subtitle {
		font-size: 1rem;
		color: #6b7280;
	}

	/* Category Tabs */
	.category-tabs {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 2rem;
		border-bottom: 2px solid #e5e7eb;
		overflow-x: auto;
	}

	.tab {
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		font-weight: 500;
		color: #6b7280;
		background: transparent;
		border: none;
		border-bottom: 2px solid transparent;
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
		margin-bottom: -2px;
	}

	.tab:hover {
		color: #374151;
		background-color: #f9fafb;
	}

	.tab.active {
		color: #7c3aed;
		border-bottom-color: #7c3aed;
		background-color: #f5f3ff;
	}

	/* Section Titles */
	.section-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: #374151;
		margin-bottom: 1rem;
	}

	/* Active Boosts Section */
	.active-boosts-section {
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
		border-radius: 0.75rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.active-boosts-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1rem;
	}

	.active-boost-card {
		padding: 1rem;
		background: white;
		border-radius: 0.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.active-boost-card .boost-name {
		font-weight: 600;
		color: #92400e;
		margin-bottom: 0.5rem;
	}

	.boost-timer {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 1.125rem;
		font-weight: bold;
		color: #d97706;
		margin-bottom: 0.5rem;
	}

	.timer-icon {
		width: 1.25rem;
		height: 1.25rem;
	}

	.boost-effects {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.effect {
		display: inline-block;
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
		font-weight: 600;
		color: #065f46;
		background-color: #d1fae5;
		border-radius: 0.25rem;
	}

	/* Available Boosts Section */
	.available-boosts-section {
		margin-bottom: 2rem;
	}

	.boosts-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.boost-card {
		padding: 1.5rem;
		background: white;
		border: 2px solid #e5e7eb;
		border-radius: 0.75rem;
		transition: all 0.2s;
		display: flex;
		flex-direction: column;
	}

	.boost-card:hover:not(.disabled) {
		border-color: #7c3aed;
		box-shadow: 0 4px 12px rgba(124, 58, 237, 0.15);
		transform: translateY(-2px);
	}

	.boost-card.active {
		background: #fef3c7;
		border-color: #fbbf24;
	}

	.boost-card.disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.boost-header {
		display: flex;
		justify-content: space-between;
		align-items: start;
		margin-bottom: 0.75rem;
	}

	.boost-card .boost-name {
		font-size: 1.125rem;
		font-weight: 700;
		color: #1f2937;
	}

	.usage-badge {
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
		font-weight: 600;
		color: #7c3aed;
		background: #ede9fe;
		border-radius: 0.25rem;
		white-space: nowrap;
	}

	.boost-description {
		font-size: 0.875rem;
		color: #6b7280;
		margin-bottom: 1rem;
		flex-grow: 1;
	}

	.boost-stats {
		margin-bottom: 1rem;
		padding: 0.75rem;
		background: #f9fafb;
		border-radius: 0.5rem;
	}

	.stat-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.5rem;
	}

	.stat-row:last-child {
		margin-bottom: 0;
	}

	.stat-label {
		font-size: 0.875rem;
		color: #6b7280;
		font-weight: 500;
	}

	.stat-value {
		font-size: 0.875rem;
		font-weight: 700;
		color: #1f2937;
	}

	.stat-value.positive {
		color: #059669;
	}

	/* Activate Button */
	.activate-button {
		width: 100%;
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		font-weight: 600;
		color: white;
		background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
		border: none;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.activate-button:hover:not(.disabled) {
		background: linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%);
		box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
		transform: translateY(-1px);
	}

	.activate-button.disabled {
		background: #9ca3af;
		cursor: not-allowed;
		transform: none;
	}

	.activate-button:active:not(.disabled) {
		transform: translateY(0);
	}
</style>
