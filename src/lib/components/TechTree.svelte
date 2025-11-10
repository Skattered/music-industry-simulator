<script lang="ts">
	import type { GameState, TechTier, UpgradeDefinition } from '$lib/game/types';
	import { purchaseTechUpgrade, canAffordUpgrade } from '$lib/systems/tech';
	import { TECH_TIER_NAMES, getUpgradesByTier, getUpgradeById } from '$lib/data/tech-upgrades';

	// Props
	let { gameState = $bindable() }: { gameState: GameState } = $props();

	// Get current tier upgrades
	let currentTierUpgrades = $derived(getUpgradesByTier(gameState.techTier));
	
	// Check if all current tier upgrades are purchased
	let allCurrentTierPurchased = $derived(
		currentTierUpgrades.every(upgrade => Boolean(gameState.upgrades[upgrade.id]))
	);
	
	// Get next tier upgrades if current tier is complete and not at max tier
	let nextTierUpgrades = $derived(
		allCurrentTierPurchased && gameState.techTier < 7 
			? getUpgradesByTier((gameState.techTier + 1) as TechTier)
			: []
	);

	// Purchase upgrade handler
	function handlePurchase(upgradeId: string) {
		purchaseTechUpgrade(gameState, upgradeId);
	}

	// Check if upgrade is purchased
	function isPurchased(upgradeId: string): boolean {
		return Boolean(gameState.upgrades[upgradeId]);
	}

	// Check if upgrade is locked (prerequisites not met)
	function isLocked(upgrade: UpgradeDefinition): boolean {
		if (isPurchased(upgrade.id)) return false;
		if (!upgrade.prerequisites || upgrade.prerequisites.length === 0) return false;

		return !upgrade.prerequisites.every((prereqId) => Boolean(gameState.upgrades[prereqId]));
	}

	// Format money
	function formatMoney(amount: number): string {
		if (amount >= 1_000_000_000) {
			return `$${(amount / 1_000_000_000).toFixed(2)}B`;
		} else if (amount >= 1_000_000) {
			return `$${(amount / 1_000_000).toFixed(2)}M`;
		} else if (amount >= 1_000) {
			return `$${(amount / 1_000).toFixed(2)}K`;
		}
		return `$${amount.toFixed(2)}`;
	}

	// Get missing prerequisites
	function getMissingPrerequisites(upgrade: UpgradeDefinition): UpgradeDefinition[] {
		if (!upgrade.prerequisites) return [];

		return upgrade.prerequisites
			.filter((prereqId) => !gameState.upgrades[prereqId])
			.map((prereqId) => getUpgradeById(prereqId))
			.filter((u): u is UpgradeDefinition => u !== null);
	}

	// Format effects for tooltip
	function formatEffects(upgrade: UpgradeDefinition): string[] {
		const effects: string[] = [];

		if (upgrade.effects.songCost !== undefined) {
			if (upgrade.effects.songCost === 0) {
				effects.push('Songs are FREE');
			} else {
				effects.push(`Song cost: ${formatMoney(upgrade.effects.songCost)}`);
			}
		}

		if (upgrade.effects.songSpeed !== undefined) {
			const seconds = upgrade.effects.songSpeed / 1000;
			effects.push(`Song speed: ${seconds}s`);
		}

		if (upgrade.effects.incomeMultiplier !== undefined) {
			effects.push(`Income: ${upgrade.effects.incomeMultiplier}x`);
		}

		if (upgrade.effects.unlockGPU) {
			effects.push('Unlocks GPU resources');
		}

		if (upgrade.effects.unlockPrestige) {
			effects.push('Unlocks Prestige system');
		}

		if (upgrade.effects.unlockPhysicalAlbums) {
			effects.push('Unlocks Physical Albums');
		}

		if (upgrade.effects.unlockTours) {
			effects.push('Unlocks Tours');
		}

		if (upgrade.effects.unlockPlatformOwnership) {
			effects.push('Unlocks Platform Ownership');
		}

		if (upgrade.effects.unlockMonopoly) {
			effects.push('Unlocks Monopoly mechanics');
		}

		if (upgrade.effects.unlockTrendResearch) {
			effects.push('Unlocks Trend Research');
		}

		return effects;
	}
</script>

<div class="tech-tree max-w-6xl mx-auto p-6">
	<h1 class="text-3xl font-bold mb-8 text-center">
		Tech Tree - Tier {gameState.techTier}: {TECH_TIER_NAMES[gameState.techTier]}
	</h1>

	<!-- Current Tier -->
	<div class="tier-section border-2 border-blue-500 bg-blue-50 rounded-lg p-6 mb-6">
		<div class="upgrades grid grid-cols-1 md:grid-cols-3 gap-4">
			{#each currentTierUpgrades as upgrade (upgrade.id)}
				{@const purchased = isPurchased(upgrade.id)}
				{@const locked = isLocked(upgrade)}
				{@const affordable = canAffordUpgrade(gameState, upgrade.id)}
				{@const effects = formatEffects(upgrade)}
				<div
					class="upgrade-card border rounded-lg p-4 transition-all"
					class:bg-gray-100={purchased}
					class:opacity-50={locked}
					class:border-green-500={purchased}
					class:border-gray-300={!purchased && !locked}
					class:border-red-300={locked}
					data-upgrade-id={upgrade.id}
				>
					<div class="flex justify-between items-start mb-2">
						<h3 class="font-semibold text-lg text-gray-900">{upgrade.name}</h3>
						{#if purchased}
							<span class="purchased-badge text-green-600 text-xl" title="Purchased">✓</span>
						{/if}
					</div>

					<p class="text-sm text-gray-600 mb-3">{upgrade.description}</p>

					<div class="cost mb-3 font-medium text-blue-600">
						Cost: {formatMoney(upgrade.cost)}
					</div>

					{#if effects.length > 0}
						<div class="effects mb-3 text-xs text-gray-700">
							<div class="font-semibold mb-1">Effects:</div>
							<ul class="list-disc list-inside">
								{#each effects as effect}
									<li>{effect}</li>
								{/each}
							</ul>
						</div>
					{/if}

					{#if locked}
						<div class="locked-message text-xs text-red-600 mb-2">
							<div class="font-semibold">Locked - Prerequisites required:</div>
							<ul class="list-disc list-inside">
								{#each getMissingPrerequisites(upgrade) as prereq}
									<li>{prereq.name}</li>
								{/each}
							</ul>
						</div>
					{/if}

					<button
						class="purchase-button w-full py-2 px-4 rounded transition-colors"
						class:bg-blue-500={!purchased && !locked && affordable}
						class:hover:bg-blue-600={!purchased && !locked && affordable}
						class:text-white={!purchased && !locked && affordable}
						class:bg-gray-300={purchased || locked || !affordable}
						class:text-gray-500={purchased || locked || !affordable}
						class:cursor-not-allowed={purchased || locked || !affordable}
						disabled={purchased || locked || !affordable}
						onclick={() => handlePurchase(upgrade.id)}
					>
						{#if purchased}
							Purchased
						{:else if locked}
							Locked
						{:else if !affordable}
							Cannot Afford
						{:else}
							Purchase
						{/if}
					</button>
				</div>
			{/each}
		</div>
	</div>

	<!-- Next Tier (shown when current tier is complete) -->
	{#if nextTierUpgrades.length > 0}
		<div class="tier-section border-2 border-gray-300 rounded-lg p-6">
			<h2 class="text-2xl font-semibold mb-4 text-gray-700">
				Next Tier {gameState.techTier + 1}: {TECH_TIER_NAMES[(gameState.techTier + 1) as TechTier]}
			</h2>
			<div class="upgrades grid grid-cols-1 md:grid-cols-3 gap-4">
				{#each nextTierUpgrades as upgrade (upgrade.id)}
					{@const purchased = isPurchased(upgrade.id)}
					{@const locked = isLocked(upgrade)}
					{@const affordable = canAffordUpgrade(gameState, upgrade.id)}
					{@const effects = formatEffects(upgrade)}
					<div
						class="upgrade-card border rounded-lg p-4 transition-all"
						class:bg-gray-100={purchased}
						class:opacity-50={locked}
						class:border-green-500={purchased}
						class:border-gray-300={!purchased && !locked}
						class:border-red-300={locked}
						data-upgrade-id={upgrade.id}
					>
						<div class="flex justify-between items-start mb-2">
							<h3 class="font-semibold text-lg text-gray-900">{upgrade.name}</h3>
							{#if purchased}
								<span class="purchased-badge text-green-600 text-xl" title="Purchased">✓</span>
							{/if}
						</div>

						<p class="text-sm text-gray-600 mb-3">{upgrade.description}</p>

						<div class="cost mb-3 font-medium text-blue-600">
							Cost: {formatMoney(upgrade.cost)}
						</div>

						{#if effects.length > 0}
							<div class="effects mb-3 text-xs text-gray-700">
								<div class="font-semibold mb-1">Effects:</div>
								<ul class="list-disc list-inside">
									{#each effects as effect}
										<li>{effect}</li>
									{/each}
								</ul>
							</div>
						{/if}

						{#if locked}
							<div class="locked-message text-xs text-red-600 mb-2">
								<div class="font-semibold">Locked - Prerequisites required:</div>
								<ul class="list-disc list-inside">
									{#each getMissingPrerequisites(upgrade) as prereq}
										<li>{prereq.name}</li>
									{/each}
								</ul>
							</div>
						{/if}

						<button
							class="purchase-button w-full py-2 px-4 rounded transition-colors"
							class:bg-blue-500={!purchased && !locked && affordable}
							class:hover:bg-blue-600={!purchased && !locked && affordable}
							class:text-white={!purchased && !locked && affordable}
							class:bg-gray-300={purchased || locked || !affordable}
							class:text-gray-500={purchased || locked || !affordable}
							class:cursor-not-allowed={purchased || locked || !affordable}
							disabled={purchased || locked || !affordable}
							onclick={() => handlePurchase(upgrade.id)}
						>
							{#if purchased}
								Purchased
							{:else if locked}
								Locked
							{:else if !affordable}
								Cannot Afford
							{:else}
								Purchase
							{/if}
						</button>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
