<script lang="ts">
	import type { GameState } from '$lib/game/types';
	import {
		queueSongs,
		getCurrentSongCost,
		getSongGenerationSpeed,
		calculateSongCost
	} from '$lib/systems/songs';

	// Props
	let { gameState = $bindable() }: { gameState: GameState } = $props();

	// Computed values
	const costPerSong = $derived(getCurrentSongCost(gameState));
	const generationTimeSeconds = $derived(getSongGenerationSpeed(gameState) / 1000);
	const queueLength = $derived(gameState.songQueue.length);

	// Calculate costs for each button
	const cost1x = $derived(calculateSongCost(gameState, 1));
	const cost5x = $derived(calculateSongCost(gameState, 5));
	const cost10x = $derived(calculateSongCost(gameState, 10));

	// Check affordability
	const canAfford1 = $derived(gameState.money >= cost1x);
	const canAfford5 = $derived(gameState.money >= cost5x);
	const canAfford10 = $derived(gameState.money >= cost10x);

	// Calculate max affordable
	const maxAffordable = $derived(
		(() => {
			const cost = getCurrentSongCost(gameState);
			if (cost === 0) return 10; // Default to 10 for free songs
			return Math.floor(gameState.money / cost);
		})()
	);

	// Progress bar for first song
	const currentSong = $derived(gameState.songQueue[0] || null);
	const progressPercent = $derived(
		(() => {
			if (!currentSong) return 0;
			return (currentSong.progress / currentSong.totalTime) * 100;
		})()
	);

	// Button handlers
	function handleQueue(count: number) {
		queueSongs(gameState, count);
	}

	// Format cost display
	function formatCost(cost: number): string {
		if (cost === 0) return 'FREE';
		return `$${cost}`;
	}
</script>

<div class="song-generator">
	<div class="stats">
		<div class="stat">
			<span class="label">Money:</span>
			<span class="value">${gameState.money.toFixed(2)}</span>
		</div>
		<div class="stat">
			<span class="label">Cost per song:</span>
			<span class="value">{formatCost(costPerSong)}</span>
		</div>
		<div class="stat">
			<span class="label">Generation time:</span>
			<span class="value">{generationTimeSeconds}s per song</span>
		</div>
		<div class="stat">
			<span class="label">Queue:</span>
			<span class="value">{queueLength} songs queued</span>
		</div>
	</div>

	{#if currentSong}
		<div class="progress-container">
			<div class="progress-label">
				Generating song... {progressPercent.toFixed(0)}%
			</div>
			<progress class="progress-bar" value={progressPercent} max="100"></progress>
		</div>
	{/if}

	<div class="buttons">
		<button
			class="queue-button"
			onclick={() => handleQueue(1)}
			disabled={!canAfford1}
			data-testid="queue-1x"
		>
			1x ({formatCost(cost1x)})
		</button>
		<button
			class="queue-button"
			onclick={() => handleQueue(5)}
			disabled={!canAfford5}
			data-testid="queue-5x"
		>
			5x ({formatCost(cost5x)})
		</button>
		<button
			class="queue-button"
			onclick={() => handleQueue(10)}
			disabled={!canAfford10}
			data-testid="queue-10x"
		>
			10x ({formatCost(cost10x)})
		</button>
		<button
			class="queue-button"
			onclick={() => handleQueue(maxAffordable)}
			disabled={maxAffordable === 0}
			data-testid="queue-max"
		>
			Max ({maxAffordable})
		</button>
	</div>
</div>

<style>
	.song-generator {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding: 1.5rem;
		background: #f5f5f5;
		border-radius: 8px;
		max-width: 600px;
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	.stat {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.label {
		font-size: 0.875rem;
		color: #666;
		font-weight: 500;
	}

	.value {
		font-size: 1.125rem;
		font-weight: 600;
		color: #333;
	}

	.progress-container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.progress-label {
		font-size: 0.875rem;
		color: #666;
		font-weight: 500;
	}

	.progress-bar {
		width: 100%;
		height: 24px;
		border-radius: 4px;
		appearance: none;
	}

	.progress-bar::-webkit-progress-bar {
		background-color: #e0e0e0;
		border-radius: 4px;
	}

	.progress-bar::-webkit-progress-value {
		background: linear-gradient(90deg, #4caf50, #45a049);
		border-radius: 4px;
		transition: width 0.3s ease;
	}

	.progress-bar::-moz-progress-bar {
		background: linear-gradient(90deg, #4caf50, #45a049);
		border-radius: 4px;
		transition: width 0.3s ease;
	}

	.buttons {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.75rem;
	}

	.queue-button {
		padding: 0.75rem 0.5rem;
		font-size: 0.875rem;
		font-weight: 600;
		background: #2196f3;
		color: white;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s ease;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
	}

	.queue-button:hover:not(:disabled) {
		background: #1976d2;
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	}

	.queue-button:active:not(:disabled) {
		transform: translateY(0);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.queue-button:disabled {
		background: #ccc;
		color: #888;
		cursor: not-allowed;
		opacity: 0.6;
	}

	@media (max-width: 600px) {
		.stats {
			grid-template-columns: 1fr;
		}

		.buttons {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
