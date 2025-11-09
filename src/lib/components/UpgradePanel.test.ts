import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import UpgradePanel from './UpgradePanel.svelte';
import type { GameState, UnlockedSystems, Artist } from '$lib/game/types';
import { BOOSTS } from '$lib/game/config';

/**
 * Helper function to create a minimal GameState for testing
 */
function createTestGameState(overrides?: Partial<GameState>): GameState {
	const defaultUnlockedSystems: UnlockedSystems = {
		trendResearch: false,
		physicalAlbums: false,
		tours: false,
		platformOwnership: false,
		monopoly: false,
		prestige: false,
		gpu: false
	};

	const defaultArtist: Artist = {
		name: 'Test Artist',
		songs: 0,
		fans: 0,
		peakFans: 0,
		createdAt: Date.now()
	};

	return {
		money: 1_000_000,
		songs: [],
		fans: 1_000,
		gpu: 0,
		phase: 1,
		industryControl: 0,
		currentArtist: defaultArtist,
		legacyArtists: [],
		songQueue: [],
		songGenerationSpeed: 30000,
		currentTrendingGenre: null,
		trendDiscoveredAt: null,
		techTier: 1,
		techSubTier: 0,
		upgrades: {},
		activeBoosts: [],
		boostUsageCounts: {},
		physicalAlbums: [],
		tours: [],
		ownedPlatforms: [],
		prestigeCount: 0,
		experienceMultiplier: 1.0,
		unlockedSystems: defaultUnlockedSystems,
		lastUpdate: Date.now(),
		createdAt: Date.now(),
		version: '1.0.0',
		...overrides
	};
}

describe('UpgradePanel', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('renders the component with correct title', () => {
		const gameState = createTestGameState();
		const mockCallback = vi.fn();

		render(UpgradePanel, {
			props: {
				gameState,
				onActivateBoost: mockCallback
			}
		});

		expect(screen.getByText('Exploitation Abilities')).toBeTruthy();
		expect(screen.getByText('Morally questionable but profitable tactics')).toBeTruthy();
	});

	it('renders all category tabs', () => {
		const gameState = createTestGameState();
		const mockCallback = vi.fn();

		render(UpgradePanel, {
			props: {
				gameState,
				onActivateBoost: mockCallback
			}
		});

		expect(screen.getByText('Streaming')).toBeTruthy();
		expect(screen.getByText('Physical')).toBeTruthy();
		expect(screen.getByText('Concerts')).toBeTruthy();
		expect(screen.getByText('Platform')).toBeTruthy();
	});

	it('renders available boosts in streaming category by default', () => {
		const gameState = createTestGameState();
		const mockCallback = vi.fn();

		render(UpgradePanel, {
			props: {
				gameState,
				onActivateBoost: mockCallback
			}
		});

		// Should show streaming boosts
		expect(screen.getByText('Bot Streams')).toBeTruthy();
		expect(screen.getByText('Playlist Payola')).toBeTruthy();
		expect(screen.getByText('Viral Marketing Campaign')).toBeTruthy();
	});

	it('shows correct base cost for boosts', () => {
		const gameState = createTestGameState({
			money: 10_000_000,
			boostUsageCounts: {}
		});
		const mockCallback = vi.fn();

		const { container } = render(UpgradePanel, {
			props: {
				gameState,
				onActivateBoost: mockCallback
			}
		});

		// Bot Streams base cost is $100,000
		expect(container.textContent).toContain('$100K');
	});

	it('shows scaled cost for previously used boosts', () => {
		const gameState = createTestGameState({
			money: 10_000_000,
			boostUsageCounts: {
				bot_streams: 2 // Used twice, so cost = 100000 * 1.5^2 = 225000
			}
		});
		const mockCallback = vi.fn();

		const { container } = render(UpgradePanel, {
			props: {
				gameState,
				onActivateBoost: mockCallback
			}
		});

		// Should show scaled cost: $100K * 1.5^2 = $225K
		expect(container.textContent).toContain('$225K');
	});

	it('displays usage count badge when boost has been used', () => {
		const gameState = createTestGameState({
			money: 10_000_000,
			boostUsageCounts: {
				bot_streams: 3
			}
		});
		const mockCallback = vi.fn();

		render(UpgradePanel, {
			props: {
				gameState,
				onActivateBoost: mockCallback
			}
		});

		expect(screen.getByText('3x used')).toBeTruthy();
	});

	it('shows "Can\'t Afford" when player has insufficient money', async () => {
		const gameState = createTestGameState({
			money: 50_000, // Less than bot_streams cost of 100,000
			boostUsageCounts: {}
		});
		const mockCallback = vi.fn();

		render(UpgradePanel, {
			props: {
				gameState,
				onActivateBoost: mockCallback
			}
		});

		await tick();
		expect(screen.getAllByText("Can't Afford").length).toBeGreaterThan(0);
	});

	it('calls onActivateBoost callback when button clicked', async () => {
		const gameState = createTestGameState({
			money: 10_000_000, // Enough money
			boostUsageCounts: {}
		});
		const mockCallback = vi.fn();

		const { container } = render(UpgradePanel, {
			props: {
				gameState,
				onActivateBoost: mockCallback
			}
		});

		await tick();

		// Find and click the activate button for bot_streams
		const activateButtons = container.querySelectorAll('.activate-button');
		const botStreamsButton = Array.from(activateButtons).find((btn) =>
			btn.textContent?.includes('$100K')
		);

		expect(botStreamsButton).toBeTruthy();
		if (botStreamsButton) {
			(botStreamsButton as HTMLButtonElement).click();
			await tick();
			expect(mockCallback).toHaveBeenCalledWith('bot_streams');
		}
	});

	it('disables button when boost is already active', async () => {
		const now = Date.now();
		vi.setSystemTime(now);

		const gameState = createTestGameState({
			money: 10_000_000,
			activeBoosts: [
				{
					id: 'bot_streams',
					type: 'bot_streams',
					name: 'Bot Streams',
					activatedAt: now,
					duration: 30000,
					incomeMultiplier: 3.0,
					fanMultiplier: 1.5
				}
			],
			boostUsageCounts: {}
		});
		const mockCallback = vi.fn();

		render(UpgradePanel, {
			props: {
				gameState,
				onActivateBoost: mockCallback
			}
		});

		await tick();
		expect(screen.getByText('Active')).toBeTruthy();
	});

	it('displays active boosts section when boosts are active', async () => {
		const now = Date.now();
		vi.setSystemTime(now);

		const gameState = createTestGameState({
			money: 10_000_000,
			activeBoosts: [
				{
					id: 'bot_streams',
					type: 'bot_streams',
					name: 'Bot Streams',
					activatedAt: now,
					duration: 30000, // 30 seconds
					incomeMultiplier: 3.0,
					fanMultiplier: 1.5
				}
			],
			boostUsageCounts: {}
		});
		const mockCallback = vi.fn();

		render(UpgradePanel, {
			props: {
				gameState,
				onActivateBoost: mockCallback
			}
		});

		await tick();
		expect(screen.getByText('Active Boosts')).toBeTruthy();
	});

	it('displays countdown timer for active boost', async () => {
		const now = Date.now();
		vi.setSystemTime(now);

		const gameState = createTestGameState({
			money: 10_000_000,
			activeBoosts: [
				{
					id: 'bot_streams',
					type: 'bot_streams',
					name: 'Bot Streams',
					activatedAt: now,
					duration: 30000, // 30 seconds
					incomeMultiplier: 3.0,
					fanMultiplier: 1.5
				}
			],
			boostUsageCounts: {}
		});
		const mockCallback = vi.fn();

		const { container } = render(UpgradePanel, {
			props: {
				gameState,
				onActivateBoost: mockCallback
			}
		});

		await tick();

		// Should show initial time of 30s
		expect(container.textContent).toContain('30s');
	});

	it('updates countdown timer as time passes', async () => {
		const now = Date.now();
		vi.setSystemTime(now);

		const gameState = createTestGameState({
			money: 10_000_000,
			activeBoosts: [
				{
					id: 'bot_streams',
					type: 'bot_streams',
					name: 'Bot Streams',
					activatedAt: now,
					duration: 30000, // 30 seconds
					incomeMultiplier: 3.0,
					fanMultiplier: 1.5
				}
			],
			boostUsageCounts: {}
		});
		const mockCallback = vi.fn();

		const { container } = render(UpgradePanel, {
			props: {
				gameState,
				onActivateBoost: mockCallback
			}
		});

		await tick();

		// Advance time by 10 seconds
		vi.advanceTimersByTime(10000);
		await tick();

		// Should show remaining time of ~20s
		expect(container.textContent).toContain('20s');
	});

	it('displays boost effects in active boost card', async () => {
		const now = Date.now();
		vi.setSystemTime(now);

		const gameState = createTestGameState({
			money: 10_000_000,
			activeBoosts: [
				{
					id: 'bot_streams',
					type: 'bot_streams',
					name: 'Bot Streams',
					activatedAt: now,
					duration: 30000,
					incomeMultiplier: 3.0, // +200% income
					fanMultiplier: 1.5 // +50% fans
				}
			],
			boostUsageCounts: {}
		});
		const mockCallback = vi.fn();

		const { container } = render(UpgradePanel, {
			props: {
				gameState,
				onActivateBoost: mockCallback
			}
		});

		await tick();

		// Should show effect percentages
		expect(container.textContent).toContain('+200% Income');
		expect(container.textContent).toContain('+50% Fans');
	});

	it('shows correct multipliers in boost stats', async () => {
		const gameState = createTestGameState({
			money: 10_000_000,
			boostUsageCounts: {}
		});
		const mockCallback = vi.fn();

		const { container } = render(UpgradePanel, {
			props: {
				gameState,
				onActivateBoost: mockCallback
			}
		});

		await tick();

		// Bot Streams has 3.0x income (200% increase) and 1.5x fans (50% increase)
		// Check for percentage values (may have whitespace)
		expect(container.textContent).toMatch(/\+\s*200%/);
		expect(container.textContent).toMatch(/\+\s*50%/);
	});

	it('switches categories when tab is clicked', async () => {
		const gameState = createTestGameState({
			money: 100_000_000, // Enough for all boosts
			boostUsageCounts: {}
		});
		const mockCallback = vi.fn();

		render(UpgradePanel, {
			props: {
				gameState,
				onActivateBoost: mockCallback
			}
		});

		await tick();

		// Initially shows streaming boosts
		expect(screen.getByText('Bot Streams')).toBeTruthy();

		// Click Physical tab
		const physicalTab = screen.getByText('Physical');
		physicalTab.click();
		await tick();

		// Should now show physical boosts
		expect(screen.getByText('Limited Edition Variants')).toBeTruthy();
		expect(screen.getByText('Shut Down Competitors')).toBeTruthy();
	});

	it('shows duration for each boost', async () => {
		const gameState = createTestGameState({
			money: 10_000_000,
			boostUsageCounts: {}
		});
		const mockCallback = vi.fn();

		const { container } = render(UpgradePanel, {
			props: {
				gameState,
				onActivateBoost: mockCallback
			}
		});

		await tick();

		// Bot Streams has 30s duration
		expect(container.textContent).toContain('Duration:');
		expect(container.textContent).toContain('30s');
	});

	it('does not show active boosts section when no boosts are active', async () => {
		const gameState = createTestGameState({
			money: 10_000_000,
			activeBoosts: [],
			boostUsageCounts: {}
		});
		const mockCallback = vi.fn();

		const { container } = render(UpgradePanel, {
			props: {
				gameState,
				onActivateBoost: mockCallback
			}
		});

		await tick();

		expect(container.textContent).not.toContain('Active Boosts');
	});

	it('calculates cost correctly for multiple usage counts', () => {
		const gameState = createTestGameState({
			money: 10_000_000,
			boostUsageCounts: {
				bot_streams: 0, // Base cost: 100,000
				playlist_placement: 1, // 500,000 * 1.5^1 = 750,000
				social_media: 2 // 1,000,000 * 1.5^2 = 2,250,000
			}
		});
		const mockCallback = vi.fn();

		const { container } = render(UpgradePanel, {
			props: {
				gameState,
				onActivateBoost: mockCallback
			}
		});

		// Bot Streams: base cost
		expect(container.textContent).toContain('$100K');

		// Playlist Payola: 750K
		expect(container.textContent).toContain('$750K');

		// Social Media: 2.25M
		expect(container.textContent).toContain('$2.25M');
	});

	it('shows all boosts in concerts category', async () => {
		const gameState = createTestGameState({
			money: 1_000_000_000, // Enough for expensive boosts
			boostUsageCounts: {}
		});
		const mockCallback = vi.fn();

		render(UpgradePanel, {
			props: {
				gameState,
				onActivateBoost: mockCallback
			}
		});

		await tick();

		// Click Concerts tab
		const concertsTab = screen.getByText('Concerts');
		concertsTab.click();
		await tick();

		// Should show all concert-related boosts
		expect(screen.getByText('Scalp Your Own Records')).toBeTruthy();
		expect(screen.getByText('Artificial Ticket Scarcity')).toBeTruthy();
		expect(screen.getByText('Scalp Your Own Tickets')).toBeTruthy();
		expect(screen.getByText('FOMO Marketing')).toBeTruthy();
	});

	it('shows platform boost in platform category', async () => {
		const gameState = createTestGameState({
			money: 1_000_000_000, // Enough for expensive boost
			boostUsageCounts: {}
		});
		const mockCallback = vi.fn();

		render(UpgradePanel, {
			props: {
				gameState,
				onActivateBoost: mockCallback
			}
		});

		await tick();

		// Click Platform tab
		const platformTab = screen.getByText('Platform');
		platformTab.click();
		await tick();

		// Should show dynamic pricing
		expect(screen.getByText('Dynamic Pricing')).toBeTruthy();
	});

	it('handles multiple active boosts correctly', async () => {
		const now = Date.now();
		vi.setSystemTime(now);

		const gameState = createTestGameState({
			money: 10_000_000,
			activeBoosts: [
				{
					id: 'bot_streams',
					type: 'bot_streams',
					name: 'Bot Streams',
					activatedAt: now,
					duration: 30000,
					incomeMultiplier: 3.0,
					fanMultiplier: 1.5
				},
				{
					id: 'playlist_placement',
					type: 'playlist_placement',
					name: 'Playlist Payola',
					activatedAt: now - 10000, // Started 10 seconds ago
					duration: 60000,
					incomeMultiplier: 2.5,
					fanMultiplier: 3.0
				}
			],
			boostUsageCounts: {}
		});
		const mockCallback = vi.fn();

		const { container } = render(UpgradePanel, {
			props: {
				gameState,
				onActivateBoost: mockCallback
			}
		});

		await tick();

		// Should show both active boosts
		expect(screen.getAllByText('Bot Streams').length).toBeGreaterThan(0);
		expect(screen.getAllByText('Playlist Payola').length).toBeGreaterThan(0);

		// Should show different remaining times
		expect(container.textContent).toContain('30s');
		expect(container.textContent).toContain('50s');
	});

	it('shows boost description in card', async () => {
		const gameState = createTestGameState({
			money: 10_000_000,
			boostUsageCounts: {}
		});
		const mockCallback = vi.fn();

		render(UpgradePanel, {
			props: {
				gameState,
				onActivateBoost: mockCallback
			}
		});

		await tick();

		// Should show bot streams description
		expect(
			screen.getByText('Deploy streaming bots to inflate play counts. Ethically dubious but effective.')
		).toBeTruthy();
	});

	it('disables button correctly based on affordability and active state', async () => {
		const gameState = createTestGameState({
			money: 200_000, // Can afford bot_streams (100K) but not playlist_placement (500K)
			boostUsageCounts: {}
		});
		const mockCallback = vi.fn();

		const { container } = render(UpgradePanel, {
			props: {
				gameState,
				onActivateBoost: mockCallback
			}
		});

		await tick();

		// Find the boost cards
		const boostCards = container.querySelectorAll('.boost-card');

		// Find Bot Streams card (should be affordable)
		const botStreamsCard = Array.from(boostCards).find((card) =>
			card.textContent?.includes('Bot Streams')
		);
		const botStreamsButton = botStreamsCard?.querySelector('.activate-button') as HTMLButtonElement;

		// Find Playlist Payola card (should not be affordable)
		const playlistCard = Array.from(boostCards).find((card) =>
			card.textContent?.includes('Playlist Payola')
		);
		const playlistButton = playlistCard?.querySelector('.activate-button') as HTMLButtonElement;

		// Bot Streams should be enabled (affordable)
		expect(botStreamsButton?.disabled).toBe(false);

		// Playlist Payola should be disabled (can't afford)
		expect(playlistButton?.disabled).toBe(true);
	});
});
