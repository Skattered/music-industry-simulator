<script lang="ts">
	import type { GameState } from '../game/types';
	import { formatMoney, formatNumber } from '../game/utils';

	let { gameState, onNewGame }: { gameState: GameState; onNewGame: () => void } = $props();

	// Calculate total songs across all artists
	const totalSongs = $derived(
		gameState.songs.length +
			gameState.legacyArtists.reduce((sum, artist) => sum + artist.songs, 0)
	);

	// Calculate time played in hours
	const hoursPlayed = $derived(
		((Date.now() - gameState.createdAt) / (1000 * 60 * 60)).toFixed(1)
	);
</script>

<div
	class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
	role="dialog"
	aria-modal="true"
	aria-labelledby="victory-title"
>
	<div class="bg-gradient-to-br from-yellow-900 to-purple-900 rounded-lg shadow-2xl p-8 max-w-2xl w-full mx-4 border-4 border-yellow-500">
		<!-- Victory Header -->
		<div class="text-center mb-8">
			<h1 id="victory-title" class="text-5xl font-bold text-yellow-300 mb-2">
				TOTAL DOMINATION!
			</h1>
			<p class="text-2xl text-white">You Control the Music Industry</p>
			<div class="mt-4 text-yellow-400 text-lg">
				<span class="text-6xl">🏆</span>
			</div>
		</div>

		<!-- Victory Stats -->
		<div class="bg-black bg-opacity-40 rounded-lg p-6 mb-6">
			<h2 class="text-xl font-bold text-yellow-300 mb-4 text-center">Your Empire</h2>
			<div class="grid grid-cols-2 gap-4 text-white">
				<div class="text-center p-3 bg-white bg-opacity-10 rounded">
					<div class="text-gray-300 text-sm mb-1">Total Money Earned</div>
					<div class="text-2xl font-bold text-green-400">{formatMoney(gameState.money)}</div>
				</div>
				<div class="text-center p-3 bg-white bg-opacity-10 rounded">
					<div class="text-gray-300 text-sm mb-1">Total Fans</div>
					<div class="text-2xl font-bold text-purple-400">{formatNumber(gameState.fans)}</div>
				</div>
				<div class="text-center p-3 bg-white bg-opacity-10 rounded">
					<div class="text-gray-300 text-sm mb-1">Songs Created</div>
					<div class="text-2xl font-bold text-blue-400">{formatNumber(totalSongs)}</div>
				</div>
				<div class="text-center p-3 bg-white bg-opacity-10 rounded">
					<div class="text-gray-300 text-sm mb-1">Prestiges</div>
					<div class="text-2xl font-bold text-yellow-400">{gameState.prestigeCount}</div>
				</div>
				<div class="text-center p-3 bg-white bg-opacity-10 rounded">
					<div class="text-gray-300 text-sm mb-1">Platforms Owned</div>
					<div class="text-2xl font-bold text-red-400">{gameState.ownedPlatforms.length}</div>
				</div>
				<div class="text-center p-3 bg-white bg-opacity-10 rounded">
					<div class="text-gray-300 text-sm mb-1">Time Played</div>
					<div class="text-2xl font-bold text-cyan-400">{hoursPlayed}h</div>
				</div>
			</div>
		</div>

		<!-- Victory Message -->
		<div class="text-center mb-6">
			<p class="text-white text-lg mb-2">
				You've achieved 100% industry control through {gameState.prestigeCount === 0 ? 'sheer determination' : `${gameState.prestigeCount} prestige${gameState.prestigeCount === 1 ? '' : 's'}`}!
			</p>
			<p class="text-gray-300">
				Every song, every stream, every award - they all flow through your empire.
			</p>
			<p class="text-gray-300 mt-2">The music industry is yours.</p>
		</div>

		<!-- Actions -->
		<div class="flex gap-4 justify-center">
			<button
				onclick={onNewGame}
				class="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition-colors text-lg shadow-lg"
			>
				Start New Empire
			</button>
		</div>

		<!-- Easter Egg -->
		<div class="mt-6 text-center text-gray-400 text-sm italic">
			"Congratulations on becoming everything you once mocked."
		</div>
	</div>
</div>

<style>
	/* Victory animation */
	@keyframes pulse-glow {
		0%,
		100% {
			box-shadow: 0 0 20px rgba(234, 179, 8, 0.5);
		}
		50% {
			box-shadow: 0 0 40px rgba(234, 179, 8, 0.8);
		}
	}

	.bg-gradient-to-br {
		animation: pulse-glow 2s ease-in-out infinite;
	}
</style>
