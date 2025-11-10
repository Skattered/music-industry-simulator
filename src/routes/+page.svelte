<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	// Import game components
	import ResourceBar from '$lib/components/ResourceBar.svelte';
	import SongGenerator from '$lib/components/SongGenerator.svelte';
	import PhysicalAlbums from '$lib/components/PhysicalAlbums.svelte';
	import Tours from '$lib/components/Tours.svelte';
	import TechTree from '$lib/components/TechTree.svelte';
	import UpgradePanel from '$lib/components/UpgradePanel.svelte';
	import PrestigePanel from '$lib/components/PrestigePanel.svelte';
	import ToastContainer from '$lib/components/ToastContainer.svelte';
	import VictoryModal from '$lib/components/VictoryModal.svelte';
	import SettingsModal from '$lib/components/SettingsModal.svelte';

	// Import game engine and state management
	import { GameEngine } from '$lib/game/engine';
	import { createNewGameState } from '$lib/game/state';
	import { saveGame, loadGame } from '$lib/game/save';
	import type { GameState } from '$lib/game/types';

	// Import exploitation system for boost activation
	import { activateAbility } from '$lib/systems/exploitation';

	// Local reactive state using Svelte 5 $state rune
	let gameState = $state<GameState>(createNewGameState());
	let gameEngine: GameEngine | null = null;
	let isLoading = $state(true);
	let showVictoryModal = $state(false);
	let showSettingsModal = $state(false);

	// Derived state for UI
	const artistName = $derived(gameState.currentArtist.name);
	const toursUnlocked = $derived(gameState.unlockedSystems.tours);
	const prestigeUnlocked = $derived(gameState.unlockedSystems.prestige);
	const hasWon = $derived(gameState.industryControl >= 100);

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

	// Watch for victory condition
	$effect(() => {
		if (hasWon && !showVictoryModal) {
			showVictoryModal = true;
			console.log('Victory achieved! Industry control at 100%');
		}
	});

	// Open settings modal
	function handleOpenSettings() {
		showSettingsModal = true;
	}

	// Close settings modal
	function handleCloseSettings() {
		showSettingsModal = false;
	}

	// Handle starting a new game after victory or hard reset
	function handleNewGame() {
		if (gameEngine) {
			gameEngine.stop();
		}

		// Clear saved game
		localStorage.removeItem('music_empire_save');
		localStorage.removeItem('music_empire_backup');

		// Create new game state
		gameState = createNewGameState();
		showVictoryModal = false;
		showSettingsModal = false;

		// Restart engine with new state
		gameEngine = new GameEngine(gameState);
		gameEngine.onSave((state: GameState) => {
			saveGame(state);
		});
		gameEngine.start();

		console.log('New game started');
	}

	// Handle boost activation for UpgradePanel
	function handleActivateBoost(boostId: string) {
		activateAbility(gameState, boostId);
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

	<!-- Victory Modal (shown when player reaches 100% control) -->
	{#if showVictoryModal}
		<VictoryModal gameState={gameState} onNewGame={handleNewGame} />
	{/if}

	<!-- Settings Modal -->
	{#if showSettingsModal}
		<SettingsModal
			{gameState}
			onClose={handleCloseSettings}
			onHardReset={handleNewGame}
		/>
	{/if}

	<div class="min-h-screen bg-gray-900 text-white">
		<!-- Header -->
		<header class="bg-gray-800 border-b border-gray-700 p-4">
			<div class="max-w-7xl mx-auto flex justify-between items-center">
				<h1 class="text-2xl font-bold">Music Industry Simulator</h1>
				<div class="flex items-center gap-4">
					<span class="text-gray-300">Artist: {artistName}</span>
					<button
						onclick={handleOpenSettings}
						class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
					>
						Settings
					</button>
				</div>
			</div>
		</header>

		<!-- Resource Bar (full width) -->
		<div class="max-w-7xl mx-auto px-4 py-4">
			<ResourceBar bind:gameState />
		</div>

		<!-- Main Content Grid -->
		<main class="max-w-7xl mx-auto px-4 py-4">
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<!-- Left Column -->
				<div class="space-y-4">
					<!-- Song Generator Component -->
					<div class="bg-gray-800 border border-gray-700 rounded-lg p-6">
						<h2 class="text-xl font-bold mb-4">Song Generator</h2>
						<SongGenerator bind:gameState />
					</div>

					<!-- Physical Albums Component -->
					{#if gameState.unlockedSystems.physicalAlbums}
						<PhysicalAlbums bind:gameState />
					{/if}

					<!-- Tours Component (conditionally rendered) -->
					{#if toursUnlocked}
						<Tours bind:gameState />
					{/if}
				</div>

				<!-- Right Column -->
				<div class="space-y-4">
					<!-- Tech Tree Component -->
					<TechTree bind:gameState />

					<!-- Upgrade Panel Component -->
					<div class="bg-gray-800 border border-gray-700 rounded-lg p-6">
						<UpgradePanel {gameState} onActivateBoost={handleActivateBoost} />
					</div>
				</div>
			</div>

			<!-- Prestige Panel (full width at bottom, conditionally rendered) -->
			{#if prestigeUnlocked}
				<div class="mt-4">
					<PrestigePanel bind:gameState />
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
