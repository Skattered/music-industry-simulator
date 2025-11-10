<script lang="ts">
	import type { GameState, PhysicalAlbum } from '$lib/game/types';
	import { releaseAlbum, rereleaseAlbum } from '$lib/systems/physical';
	import { formatMoney, formatNumber } from '$lib/game/utils';
	import { MIN_SONGS_FOR_ALBUM } from '$lib/game/config';

	// Props
	let { gameState = $bindable() }: { gameState: GameState } = $props();

	// Derived state
	const canRelease = $derived(gameState.songs.length >= MIN_SONGS_FOR_ALBUM);
	const songsNeeded = $derived(Math.max(0, MIN_SONGS_FOR_ALBUM - gameState.songs.length));
	const totalAlbums = $derived(gameState.physicalAlbums.length);
	const totalEarnings = $derived(
		gameState.physicalAlbums.reduce((sum, album) => sum + album.payout, 0)
	);

	// Sort albums by release date (newest first)
	const sortedAlbums = $derived(
		[...gameState.physicalAlbums].sort((a, b) => b.releasedAt - a.releasedAt)
	);

	// Release new album
	function handleRelease() {
		if (canRelease) {
			releaseAlbum(gameState);
		}
	}

	// Re-release an album
	function handleRerelease(albumId: string) {
		rereleaseAlbum(gameState, albumId);
	}

	// Format date
	function formatDate(timestamp: number): string {
		const date = new Date(timestamp);
		return date.toLocaleDateString();
	}
</script>

<div class="physical-albums bg-game-panel rounded-lg p-6 shadow-lg">
	<h2 class="text-2xl font-bold mb-4 text-white">Physical Albums</h2>

	<!-- Stats Summary -->
	<div class="stats-grid grid grid-cols-2 gap-4 mb-6">
		<div class="stat-card bg-gray-700 rounded-lg p-4">
			<div class="text-gray-400 text-sm mb-1">Total Albums</div>
			<div class="text-white text-2xl font-bold">{totalAlbums}</div>
		</div>
		<div class="stat-card bg-gray-700 rounded-lg p-4">
			<div class="text-gray-400 text-sm mb-1">Total Earnings</div>
			<div class="text-white text-2xl font-bold">{formatMoney(totalEarnings)}</div>
		</div>
	</div>

	<!-- Release New Album -->
	<div class="release-section mb-6 bg-gray-700 rounded-lg p-4">
		<h3 class="text-lg font-semibold text-white mb-3">Release New Album</h3>
		<div class="mb-3">
			<p class="text-sm text-gray-300">
				Songs available: {formatNumber(gameState.songs.length)} / {MIN_SONGS_FOR_ALBUM} required
			</p>
			{#if !canRelease}
				<p class="text-sm text-yellow-400 mt-1">Need {songsNeeded} more songs to release an album</p>
			{/if}
		</div>
		<button
			onclick={handleRelease}
			disabled={!canRelease}
			class="w-full px-4 py-3 rounded-lg font-semibold transition-colors"
			class:bg-blue-600={canRelease}
			class:hover:bg-blue-500={canRelease}
			class:bg-gray-600={!canRelease}
			class:cursor-not-allowed={!canRelease}
			class:opacity-50={!canRelease}
		>
			{canRelease ? 'Release Album' : `Need ${songsNeeded} More Songs`}
		</button>
	</div>

	<!-- Album List -->
	{#if sortedAlbums.length > 0}
		<div class="albums-list">
			<h3 class="text-lg font-semibold text-white mb-3">Released Albums</h3>
			<div class="space-y-3 max-h-96 overflow-y-auto">
				{#each sortedAlbums as album (album.id)}
					<div class="album-card bg-gray-700 rounded-lg p-4">
						<div class="flex justify-between items-start mb-2">
							<div>
								<h4 class="font-bold text-white">
									{album.name}
									{#if album.isRerelease}
										<span class="text-xs text-purple-400 ml-2">(Re-release)</span>
									{/if}
								</h4>
								<p class="text-sm text-gray-400">{formatDate(album.releasedAt)}</p>
							</div>
							<div class="text-right">
								<div class="text-green-400 font-bold">{formatMoney(album.payout)}</div>
							</div>
						</div>
						<div class="flex justify-between items-center text-sm text-gray-300">
							<span>{album.songCount} songs</span>
							<span>{album.variantCount} variant{album.variantCount !== 1 ? 's' : ''}</span>
						</div>
						{#if !album.isRerelease}
							<button
								onclick={() => handleRerelease(album.id)}
								class="mt-3 w-full px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded transition-colors"
							>
								Re-release (50% payout)
							</button>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<div class="text-center text-gray-400 py-8">
			<p>No albums released yet.</p>
			<p class="text-sm mt-2">Create {MIN_SONGS_FOR_ALBUM} songs to release your first album!</p>
		</div>
	{/if}
</div>

<style>
	.physical-albums {
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.albums-list::-webkit-scrollbar {
		width: 8px;
	}

	.albums-list::-webkit-scrollbar-track {
		background: #374151;
		border-radius: 4px;
	}

	.albums-list::-webkit-scrollbar-thumb {
		background: #6b7280;
		border-radius: 4px;
	}

	.albums-list::-webkit-scrollbar-thumb:hover {
		background: #9ca3af;
	}
</style>
