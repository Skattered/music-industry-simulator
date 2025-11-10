<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	// Import game components (will be created in Phase 3)
	// Commenting out for now since components don't exist yet
	// import ResourceBar from '$lib/components/ResourceBar.svelte';
	// import SongGenerator from '$lib/components/SongGenerator.svelte';
	// import PhysicalAlbums from '$lib/components/PhysicalAlbums.svelte';
	// import Tours from '$lib/components/Tours.svelte';
	// import TechTree from '$lib/components/TechTree.svelte';
	// import UpgradePanel from '$lib/components/UpgradePanel.svelte';
	// import PrestigePanel from '$lib/components/PrestigePanel.svelte';

	// Import game engine and state management
	import { GameEngine } from '$lib/game/engine';
	import { createNewGameState } from '$lib/game/state';
	import { saveGame, loadGame } from '$lib/game/save';
	import type { GameState } from '$lib/game/types';

	// Import components
	import ToastContainer from '$lib/components/ToastContainer.svelte';

	// Local reactive state using Svelte 5 $state rune
	let gameState = $state<GameState>(createNewGameState());
	let gameEngine: GameEngine | null = null;
	let isLoading = $state(true);

	// Derived state for UI
	const artistName = $derived(gameState.currentArtist.name);
	const toursUnlocked = $derived(gameState.unlockedSystems.tours);
	const prestigeUnlocked = $derived(gameState.unlockedSystems.prestige);

	onMount(() => {
		// Try to load saved game
		const savedState = loadGame();
		if (savedState) {
			gameState = savedState;
			console.log('Game loaded from save');
		} else {
			console.log('Starting new game');
		}

		// Initialize and start the game engine
		gameEngine = new GameEngine(gameState);

		// Set up save callback
		gameEngine.onSave((state: GameState) => {
			saveGame(state);
		});

		// Start the game loop
		gameEngine.start();
		isLoading = false;

		console.log('Game initialized and running');
	});

	onDestroy(() => {
		// Stop the game engine and save
		if (gameEngine) {
			gameEngine.stop();
			console.log('Game engine stopped and saved');
		}
	});

	// Manual save function for settings button (future)
	function handleSave() {
		if (gameEngine) {
			gameEngine.forceSave();
		}
	}
</script>

{#if isLoading}
	<div class="min-h-screen bg-gray-900 text-white flex items-center justify-center">
		<div class="text-center">
			<h1 class="text-3xl font-bold mb-4">Loading...</h1>
			<p class="text-gray-400">Initializing Music Industry Simulator</p>
		</div>
	</div>
{:else}
	<!-- Toast Notifications (always visible) -->
	<ToastContainer />

	<div class="min-h-screen bg-gray-900 text-white">
		<!-- Header -->
		<header class="bg-gray-800 border-b border-gray-700 p-4">
			<div class="max-w-7xl mx-auto flex justify-between items-center">
				<h1 class="text-2xl font-bold">Music Industry Simulator</h1>
				<div class="flex items-center gap-4">
					<span class="text-gray-300">Artist: {artistName}</span>
					<button
						onclick={handleSave}
						class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
					>
						Settings
					</button>
				</div>
			</div>
		</header>

		<!-- Resource Bar (full width) -->
		<div class="max-w-7xl mx-auto px-4 py-4">
			<!-- Placeholder for ResourceBar component -->
			<div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
				<div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
					<div>
						<div class="text-gray-400 text-sm">Money</div>
						<div class="text-xl font-bold text-green-400">${gameState.money.toFixed(2)}</div>
					</div>
					<div>
						<div class="text-gray-400 text-sm">Songs</div>
						<div class="text-xl font-bold text-blue-400">{gameState.songs.length}</div>
					</div>
					<div>
						<div class="text-gray-400 text-sm">Fans</div>
						<div class="text-xl font-bold text-purple-400">{Math.floor(gameState.fans)}</div>
					</div>
					<div>
						<div class="text-gray-400 text-sm">Industry Control</div>
						<div class="text-xl font-bold text-yellow-400">{gameState.industryControl.toFixed(1)}%</div>
					</div>
				</div>
			</div>
			<!-- Will be replaced with: <ResourceBar bind:gameState={gameState} /> -->
		</div>

		<!-- Main Content Grid -->
		<main class="max-w-7xl mx-auto px-4 py-4">
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<!-- Left Column -->
				<div class="space-y-4">
					<!-- Song Generator Component Placeholder -->
					<div class="bg-gray-800 border border-gray-700 rounded-lg p-6">
						<h2 class="text-xl font-bold mb-4">Song Generator</h2>
						<p class="text-gray-400">SongGenerator component will be placed here</p>
						<p class="text-sm text-gray-500 mt-2">Queue: {gameState.songQueue.length} songs</p>
					</div>
					<!-- Will be replaced with: <SongGenerator bind:gameState={gameState} /> -->

					<!-- Physical Albums Component Placeholder -->
					<div class="bg-gray-800 border border-gray-700 rounded-lg p-6">
						<h2 class="text-xl font-bold mb-4">Physical Albums</h2>
						<p class="text-gray-400">PhysicalAlbums component will be placed here</p>
						<p class="text-sm text-gray-500 mt-2">Albums: {gameState.physicalAlbums.length}</p>
					</div>
					<!-- Will be replaced with: <PhysicalAlbums bind:gameState={gameState} /> -->

					<!-- Tours Component (conditionally rendered) -->
					{#if toursUnlocked}
						<div class="bg-gray-800 border border-gray-700 rounded-lg p-6">
							<h2 class="text-xl font-bold mb-4">Tours</h2>
							<p class="text-gray-400">Tours component will be placed here</p>
							<p class="text-sm text-gray-500 mt-2">Active Tours: {gameState.tours.filter(t => !t.completedAt).length}</p>
						</div>
						<!-- Will be replaced with: <Tours bind:gameState={gameState} /> -->
					{/if}
				</div>

				<!-- Right Column -->
				<div class="space-y-4">
					<!-- Tech Tree Component Placeholder -->
					<div class="bg-gray-800 border border-gray-700 rounded-lg p-6">
						<h2 class="text-xl font-bold mb-4">Tech Tree</h2>
						<p class="text-gray-400">TechTree component will be placed here</p>
						<p class="text-sm text-gray-500 mt-2">Current Tier: {gameState.techTier}</p>
					</div>
					<!-- Will be replaced with: <TechTree bind:gameState={gameState} /> -->

					<!-- Upgrade Panel Component Placeholder -->
					<div class="bg-gray-800 border border-gray-700 rounded-lg p-6">
						<h2 class="text-xl font-bold mb-4">Upgrades</h2>
						<p class="text-gray-400">UpgradePanel component will be placed here</p>
						<p class="text-sm text-gray-500 mt-2">Active Boosts: {gameState.activeBoosts.length}</p>
					</div>
					<!-- Will be replaced with: <UpgradePanel bind:gameState={gameState} /> -->
				</div>
			</div>

			<!-- Prestige Panel (full width at bottom, conditionally rendered) -->
			{#if prestigeUnlocked}
				<div class="mt-4">
					<div class="bg-gray-800 border border-gray-700 rounded-lg p-6">
						<h2 class="text-xl font-bold mb-4">Prestige</h2>
						<p class="text-gray-400">PrestigePanel component will be placed here</p>
						<p class="text-sm text-gray-500 mt-2">Prestige Count: {gameState.prestigeCount}</p>
					</div>
					<!-- Will be replaced with: <PrestigePanel bind:gameState={gameState} /> -->
				</div>
			{/if}
		</main>

		<!-- Footer -->
		<footer class="mt-8 py-4 text-center text-gray-500 text-sm">
			<p>Music Industry Simulator v{gameState.version}</p>
			<p class="mt-1">Phase {gameState.phase} • Tech Tier {gameState.techTier}</p>
		</footer>
	</div>
{/if}
