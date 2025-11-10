/**
 * TechTree Component Tests
 *
 * Comprehensive tests for the TechTree Svelte component including:
 * - Tier display logic
 * - Purchase button states
 * - Sub-tier visibility
 * - Visual states
 * - User interactions
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import TechTree from './TechTree.svelte';
import type { GameState } from '$lib/game/types';
import {
	INITIAL_MONEY,
	INITIAL_FANS,
	INITIAL_GPU,
	INITIAL_TECH_TIER,
	INITIAL_TECH_SUB_TIER,
	INITIAL_PHASE,
	INITIAL_INDUSTRY_CONTROL,
	INITIAL_PRESTIGE_COUNT,
	INITIAL_EXPERIENCE_MULTIPLIER,
	INITIAL_UNLOCKED_SYSTEMS,
	BASE_SONG_GENERATION_TIME
} from '$lib/game/config';
import { getUpgradeById } from '$lib/data/tech-upgrades';

// Helper to create a minimal game state for testing
function createTestGameState(overrides?: Partial<GameState>): GameState {
	return {
		money: INITIAL_MONEY,
		songs: [],
		fans: INITIAL_FANS,
		gpu: INITIAL_GPU,
		phase: INITIAL_PHASE,
		industryControl: INITIAL_INDUSTRY_CONTROL,
		currentArtist: {
			name: 'Test Artist',
			songs: 0,
			fans: 0,
			peakFans: 0,
			createdAt: Date.now()
		},
		legacyArtists: [],
		songQueue: [],
		songGenerationSpeed: BASE_SONG_GENERATION_TIME,
		currentTrendingGenre: null,
		trendDiscoveredAt: null,
		techTier: INITIAL_TECH_TIER,
		techSubTier: INITIAL_TECH_SUB_TIER,
		upgrades: {},
		activeBoosts: [],
		boostUsageCounts: {},
		physicalAlbums: [],
		tours: [],
		ownedPlatforms: [],
		prestigeCount: INITIAL_PRESTIGE_COUNT,
		experienceMultiplier: INITIAL_EXPERIENCE_MULTIPLIER,
		unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS },
		lastUpdate: Date.now(),
		createdAt: Date.now(),
		version: '1.0.0',
		...overrides
	};
}

describe('TechTree Component', () => {
	describe('Tier Display Logic', () => {
		it('should render all 7 tiers', () => {
			const gameState = createTestGameState();
			render(TechTree, { props: { gameState } });

			// Check for all 7 tier headers
			for (let tier = 1; tier <= 7; tier++) {
				const tierElement = screen.getByText(`Tier ${tier}:`, { exact: false });
				expect(tierElement).toBeTruthy();
			}
		});

		it('should show tier names correctly', () => {
			const gameState = createTestGameState();
			render(TechTree, { props: { gameState } });

			// Verify tier names
			expect(screen.getByText(/Third-party Web Services/)).toBeTruthy();
			expect(screen.getByText(/Lifetime Licenses\/Subscriptions/)).toBeTruthy();
			expect(screen.getByText(/Local AI Models/)).toBeTruthy();
			expect(screen.getByText(/Fine-tuned Models/)).toBeTruthy();
			expect(screen.getByText(/Train Your Own Models/)).toBeTruthy();
			expect(screen.getByText(/Build Your Own Software/)).toBeTruthy();
			expect(screen.getByText(/AI Agent Automation/)).toBeTruthy();
		});

		it('should show 3 upgrades per tier', () => {
			const gameState = createTestGameState();
			const { container } = render(TechTree, { props: { gameState } });

			// Check each tier section has 3 upgrade cards
			for (let tier = 1; tier <= 7; tier++) {
				const tierSection = container.querySelector(`[data-tier="${tier}"]`);
				expect(tierSection).toBeTruthy();

				const upgradeCards = tierSection!.querySelectorAll('.upgrade-card');
				expect(upgradeCards.length).toBe(3);
			}
		});

		it('should highlight current tier', () => {
			const gameState = createTestGameState({ techTier: 3 });
			const { container } = render(TechTree, { props: { gameState } });

			// Check tier 3 is highlighted
			const tier3Section = container.querySelector('[data-tier="3"]');
			expect(tier3Section?.classList.contains('border-blue-500')).toBe(true);
			expect(tier3Section?.classList.contains('bg-blue-50')).toBe(true);

			// Check tier 1 is not highlighted
			const tier1Section = container.querySelector('[data-tier="1"]');
			expect(tier1Section?.classList.contains('border-blue-500')).toBe(false);
		});

		it('should show "Current Tier" label on current tier only', () => {
			const gameState = createTestGameState({ techTier: 2 });
			render(TechTree, { props: { gameState } });

			const currentTierLabels = screen.getAllByText('Current Tier');
			expect(currentTierLabels.length).toBe(1);
		});
	});

	describe('Purchase Button States', () => {
		it('should disable button when cannot afford (money < cost)', () => {
			const gameState = createTestGameState({ money: 5 });
			const { container } = render(TechTree, { props: { gameState } });

			const tier1BasicCard = container.querySelector('[data-upgrade-id="tier1_basic"]');
			const button = tier1BasicCard?.querySelector('.purchase-button') as HTMLButtonElement;

			expect(button?.disabled).toBe(true);
			expect(button?.textContent?.trim()).toBe('Cannot Afford');
		});

		it('should disable button when prerequisites not met', () => {
			const gameState = createTestGameState({ money: 1000 });
			const { container } = render(TechTree, { props: { gameState } });

			// tier1_improved requires tier1_basic
			const tier1ImprovedCard = container.querySelector('[data-upgrade-id="tier1_improved"]');
			const button = tier1ImprovedCard?.querySelector('.purchase-button') as HTMLButtonElement;

			expect(button?.disabled).toBe(true);
			expect(button?.textContent?.trim()).toBe('Locked');
		});

		it('should disable button when already purchased', () => {
			const gameState = createTestGameState({
				money: 100,
				upgrades: {
					tier1_basic: { purchasedAt: Date.now(), tier: 1 }
				}
			});
			const { container } = render(TechTree, { props: { gameState } });

			const tier1BasicCard = container.querySelector('[data-upgrade-id="tier1_basic"]');
			const button = tier1BasicCard?.querySelector('.purchase-button') as HTMLButtonElement;

			expect(button?.disabled).toBe(true);
			expect(button?.textContent?.trim()).toBe('Purchased');
		});

		it('should enable button when affordable and prerequisites met', () => {
			const gameState = createTestGameState({ money: 100 });
			const { container } = render(TechTree, { props: { gameState } });

			const tier1BasicCard = container.querySelector('[data-upgrade-id="tier1_basic"]');
			const button = tier1BasicCard?.querySelector('.purchase-button') as HTMLButtonElement;

			expect(button?.disabled).toBe(false);
			expect(button?.textContent?.trim()).toBe('Purchase');
		});

		it('should purchase upgrade when clicking enabled button', async () => {
			const gameState = createTestGameState({ money: 100 });
			const { container } = render(TechTree, { props: { gameState } });

			const tier1BasicCard = container.querySelector('[data-upgrade-id="tier1_basic"]');
			const button = tier1BasicCard?.querySelector('.purchase-button') as HTMLButtonElement;

			await fireEvent.click(button);

			// Verify purchase occurred by checking the DOM (the button should now say "Purchased")
			expect(button?.textContent?.trim()).toBe('Purchased');
			expect(button?.disabled).toBe(true);

			// Check that the checkmark appears
			const badge = tier1BasicCard?.querySelector('.purchased-badge');
			expect(badge).toBeTruthy();
		});

		it('should update button state after purchase', async () => {
			const gameState = createTestGameState({ money: 100 });
			const { container } = render(TechTree, { props: { gameState } });

			const tier1BasicCard = container.querySelector('[data-upgrade-id="tier1_basic"]');
			const button = tier1BasicCard?.querySelector('.purchase-button') as HTMLButtonElement;

			expect(button?.textContent?.trim()).toBe('Purchase');

			await fireEvent.click(button);

			expect(button?.disabled).toBe(true);
			expect(button?.textContent?.trim()).toBe('Purchased');
		});
	});

	describe('Sub-tier Visibility', () => {
		it('should show all upgrades in current tier', () => {
			const gameState = createTestGameState({ money: 100, techTier: 1 });
			const { container } = render(TechTree, { props: { gameState } });

			const tier1Section = container.querySelector('[data-tier="1"]');
			const upgradeCards = tier1Section?.querySelectorAll('.upgrade-card');

			expect(upgradeCards?.length).toBe(3);
			expect(container.querySelector('[data-upgrade-id="tier1_basic"]')).toBeTruthy();
			expect(container.querySelector('[data-upgrade-id="tier1_improved"]')).toBeTruthy();
			expect(container.querySelector('[data-upgrade-id="tier1_advanced"]')).toBeTruthy();
		});

		it('should show future tier upgrades as locked', () => {
			const gameState = createTestGameState({ money: 1000000, techTier: 1 });
			const { container } = render(TechTree, { props: { gameState } });

			// tier2_basic should be locked because tier1_advanced is not purchased
			const tier2BasicCard = container.querySelector('[data-upgrade-id="tier2_basic"]');
			const button = tier2BasicCard?.querySelector('.purchase-button') as HTMLButtonElement;

			expect(button?.textContent?.trim()).toBe('Locked');
		});

		it('should show past tier upgrades as purchased if purchased', () => {
			const gameState = createTestGameState({
				money: 100000,
				techTier: 2,
				techSubTier: 0,
				upgrades: {
					tier1_basic: { purchasedAt: Date.now(), tier: 1 },
					tier1_improved: { purchasedAt: Date.now(), tier: 1 },
					tier1_advanced: { purchasedAt: Date.now(), tier: 1 },
					tier2_basic: { purchasedAt: Date.now(), tier: 2 }
				}
			});
			const { container } = render(TechTree, { props: { gameState } });

			// All tier 1 upgrades should show as purchased
			const tier1Basic = container.querySelector('[data-upgrade-id="tier1_basic"]');
			const tier1Improved = container.querySelector('[data-upgrade-id="tier1_improved"]');
			const tier1Advanced = container.querySelector('[data-upgrade-id="tier1_advanced"]');

			expect(tier1Basic?.querySelector('.purchased-badge')).toBeTruthy();
			expect(tier1Improved?.querySelector('.purchased-badge')).toBeTruthy();
			expect(tier1Advanced?.querySelector('.purchased-badge')).toBeTruthy();
		});
	});

	describe('Visual States', () => {
		it('should show checkmark for purchased upgrades', () => {
			const gameState = createTestGameState({
				money: 100,
				upgrades: {
					tier1_basic: { purchasedAt: Date.now(), tier: 1 }
				}
			});
			const { container } = render(TechTree, { props: { gameState } });

			const tier1BasicCard = container.querySelector('[data-upgrade-id="tier1_basic"]');
			const badge = tier1BasicCard?.querySelector('.purchased-badge');

			expect(badge).toBeTruthy();
			expect(badge?.textContent?.trim()).toBe('✓');
		});

		it('should show locked upgrades with requirements', () => {
			const gameState = createTestGameState({ money: 1000 });
			const { container } = render(TechTree, { props: { gameState } });

			// tier1_improved requires tier1_basic
			const tier1ImprovedCard = container.querySelector('[data-upgrade-id="tier1_improved"]');
			const lockedMessage = tier1ImprovedCard?.querySelector('.locked-message');

			expect(lockedMessage).toBeTruthy();
			expect(lockedMessage?.textContent).toContain('Prerequisites required');
		});

		it('should apply green border to purchased upgrades', () => {
			const gameState = createTestGameState({
				money: 100,
				upgrades: {
					tier1_basic: { purchasedAt: Date.now(), tier: 1 }
				}
			});
			const { container } = render(TechTree, { props: { gameState } });

			const tier1BasicCard = container.querySelector('[data-upgrade-id="tier1_basic"]');
			expect(tier1BasicCard?.classList.contains('border-green-500')).toBe(true);
		});

		it('should apply opacity to locked upgrades', () => {
			const gameState = createTestGameState({ money: 1000 });
			const { container } = render(TechTree, { props: { gameState } });

			const tier1ImprovedCard = container.querySelector('[data-upgrade-id="tier1_improved"]');
			expect(tier1ImprovedCard?.classList.contains('opacity-50')).toBe(true);
		});

		it('should show upgrade cost', () => {
			const gameState = createTestGameState({ money: 100 });
			const { container } = render(TechTree, { props: { gameState } });

			const tier1BasicCard = container.querySelector('[data-upgrade-id="tier1_basic"]');
			const costText = tier1BasicCard?.querySelector('.cost')?.textContent;

			expect(costText).toContain('$15');
		});

		it('should format large costs correctly', () => {
			const gameState = createTestGameState({ money: 10000000000 });
			const { container } = render(TechTree, { props: { gameState } });

			// tier7_basic costs $125M
			const tier7BasicCard = container.querySelector('[data-upgrade-id="tier7_basic"]');
			const costText = tier7BasicCard?.querySelector('.cost')?.textContent;

			expect(costText).toContain('$125.00M');
		});
	});

	describe('Upgrade Details', () => {
		it('should display upgrade name', () => {
			const gameState = createTestGameState();
			const { container } = render(TechTree, { props: { gameState } });

			// Use container to find the upgrade card heading specifically
			const tier1BasicCard = container.querySelector('[data-upgrade-id="tier1_basic"]');
			const heading = tier1BasicCard?.querySelector('h3');
			expect(heading?.textContent?.trim()).toBe('Suno/Udio Account');
		});

		it('should display upgrade description', () => {
			const gameState = createTestGameState();
			render(TechTree, { props: { gameState } });

			expect(
				screen.getByText(/Basic web-based AI music generation. Songs take 25s/)
			).toBeTruthy();
		});

		it('should display upgrade effects', () => {
			const gameState = createTestGameState();
			const { container } = render(TechTree, { props: { gameState } });

			const tier1BasicCard = container.querySelector('[data-upgrade-id="tier1_basic"]');
			const effectsText = tier1BasicCard?.textContent;

			expect(effectsText).toContain('Song speed: 25s');
			expect(effectsText).toContain('Song cost: $1.50');
		});

		it('should show unlock effects', () => {
			const gameState = createTestGameState({ money: 100000 });
			const { container } = render(TechTree, { props: { gameState } });

			const tier1AdvancedCard = container.querySelector('[data-upgrade-id="tier1_advanced"]');
			const effectsText = tier1AdvancedCard?.textContent;

			expect(effectsText).toContain('Unlocks Trend Research');
		});

		it('should show income multiplier in effects', () => {
			const gameState = createTestGameState({ money: 100000 });
			const { container } = render(TechTree, { props: { gameState } });

			const tier2ImprovedCard = container.querySelector('[data-upgrade-id="tier2_improved"]');
			const effectsText = tier2ImprovedCard?.textContent;

			expect(effectsText).toContain('Income: 1.5x');
		});
	});

	describe('Prerequisites Display', () => {
		it('should show missing prerequisite names for locked upgrades', () => {
			const gameState = createTestGameState({ money: 1000 });
			const { container } = render(TechTree, { props: { gameState } });

			const tier1ImprovedCard = container.querySelector('[data-upgrade-id="tier1_improved"]');
			const lockedMessage = tier1ImprovedCard?.querySelector('.locked-message');

			expect(lockedMessage?.textContent).toContain('Suno/Udio Account');
		});

		it('should not show locked message when all prerequisites are met', () => {
			const gameState = createTestGameState({
				money: 1000,
				upgrades: {
					tier1_basic: { purchasedAt: Date.now(), tier: 1 }
				}
			});
			const { container } = render(TechTree, { props: { gameState } });

			const tier1ImprovedCard = container.querySelector('[data-upgrade-id="tier1_improved"]');
			const lockedMessage = tier1ImprovedCard?.querySelector('.locked-message');

			expect(lockedMessage).toBeFalsy();
		});
	});

	describe('Progressive Unlocking', () => {
		it('should allow purchasing all upgrades in sequence', async () => {
			const gameState = createTestGameState({ money: 1000000 });
			const { container } = render(TechTree, { props: { gameState } });

			// Purchase tier1_basic
			let card = container.querySelector('[data-upgrade-id="tier1_basic"]');
			let button = card?.querySelector('.purchase-button') as HTMLButtonElement;
			await fireEvent.click(button);

			// Verify by checking button state
			expect(button?.textContent?.trim()).toBe('Purchased');

			// Purchase tier1_improved
			card = container.querySelector('[data-upgrade-id="tier1_improved"]');
			button = card?.querySelector('.purchase-button') as HTMLButtonElement;
			await fireEvent.click(button);
			expect(button?.textContent?.trim()).toBe('Purchased');

			// Purchase tier1_advanced
			card = container.querySelector('[data-upgrade-id="tier1_advanced"]');
			button = card?.querySelector('.purchase-button') as HTMLButtonElement;
			await fireEvent.click(button);
			expect(button?.textContent?.trim()).toBe('Purchased');

			// Purchase tier2_basic (should unlock tier 2)
			card = container.querySelector('[data-upgrade-id="tier2_basic"]');
			button = card?.querySelector('.purchase-button') as HTMLButtonElement;
			await fireEvent.click(button);
			expect(button?.textContent?.trim()).toBe('Purchased');

			// Verify tier 2 is now current
			const tier2Section = container.querySelector('[data-tier="2"]');
			expect(tier2Section?.classList.contains('border-blue-500')).toBe(true);
		});
	});

	describe('Component Reactivity', () => {
		it('should update UI when gameState changes', async () => {
			const gameState = createTestGameState({ money: 5 });
			const { container } = render(TechTree, { props: { gameState } });

			// Initially cannot afford
			let button = container.querySelector(
				'[data-upgrade-id="tier1_basic"] .purchase-button'
			) as HTMLButtonElement;
			expect(button?.textContent?.trim()).toBe('Cannot Afford');

			// Update money and re-render with new props
			const updatedGameState = createTestGameState({ money: 100 });
			const { container: newContainer } = render(TechTree, { props: { gameState: updatedGameState } });

			// Should now be able to purchase
			button = newContainer.querySelector(
				'[data-upgrade-id="tier1_basic"] .purchase-button'
			) as HTMLButtonElement;
			expect(button?.textContent?.trim()).toBe('Purchase');
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty upgrades object', () => {
			const gameState = createTestGameState({ upgrades: {} });
			const { container } = render(TechTree, { props: { gameState } });

			expect(container.querySelector('.tech-tree')).toBeTruthy();
		});

		it('should handle zero money', () => {
			const gameState = createTestGameState({ money: 0 });
			const { container } = render(TechTree, { props: { gameState } });

			const button = container.querySelector(
				'[data-upgrade-id="tier1_basic"] .purchase-button'
			) as HTMLButtonElement;
			expect(button?.disabled).toBe(true);
		});

		it('should handle max tier reached', () => {
			const gameState = createTestGameState({ techTier: 7, techSubTier: 2 });
			const { container } = render(TechTree, { props: { gameState } });

			const tier7Section = container.querySelector('[data-tier="7"]');
			expect(tier7Section?.classList.contains('border-blue-500')).toBe(true);
		});
	});
});
