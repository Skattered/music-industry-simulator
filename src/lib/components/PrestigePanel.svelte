<script lang="ts">
	import type { GameState, LegacyArtist } from '$lib/game/types';
	import { performPrestige, canPrestige, calculateExperienceBonus } from '$lib/systems/prestige';
	import { formatMoney, formatNumber } from '$lib/game/utils';

	// Props
	let { gameState = $bindable() }: { gameState: GameState } = $props();

	// State for confirmation
	let showConfirmation = $state(false);

	// Derived state
	const canDoPrestige = $derived(canPrestige(gameState));
	const experienceBonus = $derived(calculateExperienceBonus(gameState));
	const nextExperienceBonus = $derived(
		calculateExperienceBonus({ ...gameState, prestigeCount: gameState.prestigeCount + 1 })
	);
	const totalLegacyIncome = $derived(
		gameState.legacyArtists.reduce((sum, artist) => sum + artist.incomeRate, 0)
	);

	// Sort legacy artists by prestige date (newest first)
	const sortedLegacyArtists = $derived(
		[...gameState.legacyArtists].sort((a, b) => b.prestigedAt - a.prestigedAt)
	);

	// Calculate what legacy income would be if we prestige now
	const potentialLegacyIncome = $derived(() => {
		const currentSongIncome = gameState.songs.reduce((sum, s) => sum + s.incomePerSecond, 0);
		return currentSongIncome * 0.8; // 80% conversion rate
	});

	// Handle prestige action
	function handlePrestige() {
		if (canDoPrestige && showConfirmation) {
			performPrestige(gameState);
			showConfirmation = false;
		} else {
			showConfirmation = true;
		}
	}

	// Cancel prestige
	function handleCancel() {
		showConfirmation = false;
	}

	// Format date
	function formatDate(timestamp: number): string {
		const date = new Date(timestamp);
		return date.toLocaleDateString();
	}
</script>

<div class="prestige-panel bg-game-panel rounded-lg p-6 shadow-lg border-2 border-purple-500">
	<h2 class="text-2xl font-bold mb-4 text-white">🌟 Prestige System</h2>

	{#if !canDoPrestige}
		<div class="unlock-requirements bg-purple-900 bg-opacity-30 border border-purple-600 rounded-lg p-4 mb-4">
			<h3 class="text-lg font-semibold text-purple-400 mb-2">Unlock Requirements</h3>
			<p class="text-sm text-gray-300">
				Prestige system unlocks at Tech Tier 3 (Local AI Models)
			</p>
		</div>
	{:else}
		<!-- Current Status -->
		<div class="status-grid grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
			<div class="stat-card bg-gray-700 rounded-lg p-4">
				<div class="text-gray-400 text-sm mb-1">Prestige Count</div>
				<div class="text-white text-2xl font-bold">{gameState.prestigeCount}</div>
			</div>
			<div class="stat-card bg-gray-700 rounded-lg p-4">
				<div class="text-gray-400 text-sm mb-1">Experience Bonus</div>
				<div class="text-green-400 text-2xl font-bold">{((experienceBonus - 1) * 100).toFixed(0)}%</div>
			</div>
			<div class="stat-card bg-gray-700 rounded-lg p-4">
				<div class="text-gray-400 text-sm mb-1">Legacy Artists</div>
				<div class="text-white text-2xl font-bold">{gameState.legacyArtists.length}</div>
			</div>
			<div class="stat-card bg-gray-700 rounded-lg p-4">
				<div class="text-gray-400 text-sm mb-1">Legacy Income</div>
				<div class="text-purple-400 text-lg font-bold">{formatMoney(totalLegacyIncome)}/s</div>
			</div>
		</div>

		<!-- Prestige Action -->
		<div class="prestige-action bg-gradient-to-r from-purple-900 to-purple-800 rounded-lg p-6 mb-6">
			<h3 class="text-xl font-bold text-white mb-4">Prestige Now?</h3>

			<div class="benefits mb-4 space-y-2 text-sm">
				<div class="flex items-start">
					<span class="text-green-400 mr-2">✓</span>
					<span class="text-gray-200">
						Current artist becomes legacy artist earning {formatMoney(potentialLegacyIncome())}/s
					</span>
				</div>
				<div class="flex items-start">
					<span class="text-green-400 mr-2">✓</span>
					<span class="text-gray-200">
						Experience bonus increases to {((nextExperienceBonus - 1) * 100).toFixed(0)}% (currently {((experienceBonus - 1) * 100).toFixed(0)}%)
					</span>
				</div>
				<div class="flex items-start">
					<span class="text-green-400 mr-2">✓</span>
					<span class="text-gray-200">Keep all tech upgrades and unlocked systems</span>
				</div>
			</div>

			<div class="costs mb-4 space-y-2 text-sm">
				<div class="flex items-start">
					<span class="text-red-400 mr-2">✗</span>
					<span class="text-gray-200">Reset money, songs, fans, and song queue</span>
				</div>
				<div class="flex items-start">
					<span class="text-red-400 mr-2">✗</span>
					<span class="text-gray-200">
						Current artist: {gameState.currentArtist.name} ({formatNumber(gameState.songs.length)} songs,
						{formatNumber(gameState.fans)} fans)
					</span>
				</div>
			</div>

			{#if !showConfirmation}
				<button
					onclick={handlePrestige}
					class="w-full px-6 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold text-lg rounded-lg transition-colors"
				>
					Prestige and Start Fresh
				</button>
			{:else}
				<div class="confirmation space-y-3">
					<p class="text-yellow-300 font-semibold text-center">Are you sure you want to prestige?</p>
					<div class="grid grid-cols-2 gap-3">
						<button
							onclick={handleCancel}
							class="px-4 py-3 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors"
						>
							Cancel
						</button>
						<button
							onclick={handlePrestige}
							class="px-4 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors"
						>
							Yes, Prestige!
						</button>
					</div>
				</div>
			{/if}
		</div>

		<!-- Legacy Artists -->
		{#if sortedLegacyArtists.length > 0}
			<div class="legacy-artists">
				<h3 class="text-lg font-semibold text-white mb-3">Legacy Artists</h3>
				<div class="space-y-3">
					{#each sortedLegacyArtists as artist (artist.name + artist.prestigedAt)}
						<div class="artist-card bg-gray-700 rounded-lg p-4">
							<div class="flex justify-between items-start">
								<div>
									<h4 class="font-bold text-white">{artist.name}</h4>
									<p class="text-sm text-gray-400">
										{formatNumber(artist.songs)} songs • {formatNumber(artist.peakFans)} peak fans
									</p>
									<p class="text-xs text-gray-500 mt-1">
										Prestiged: {formatDate(artist.prestigedAt)}
									</p>
								</div>
								<div class="text-right">
									<div class="text-purple-400 font-bold">{formatMoney(artist.incomeRate)}/s</div>
									<div class="text-xs text-gray-400">Passive Income</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{:else}
			<div class="text-center text-gray-400 py-4">
				<p class="text-sm">No legacy artists yet. Prestige to create your first one!</p>
			</div>
		{/if}
	{/if}
</div>

<style>
	.prestige-panel {
		border: 2px solid rgba(168, 85, 247, 0.5);
		box-shadow: 0 0 20px rgba(168, 85, 247, 0.2);
	}
</style>
