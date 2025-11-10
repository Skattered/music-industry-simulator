/**
 * Unit tests for SongGenerator Svelte component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { tick } from 'svelte';
import SongGenerator from './SongGenerator.svelte';
import type { GameState, Artist, UnlockedSystems } from '$lib/game/types';
import {
	BASE_SONG_GENERATION_TIME,
	BASE_SONG_COST,
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
	GAME_VERSION
} from '$lib/game/config';

// ============================================================================
// TEST HELPERS
// ============================================================================

/**
 * Create a minimal valid GameState for testing
 */
function createTestGameState(overrides?: Partial<GameState>): GameState {
	const now = Date.now();

	const defaultArtist: Artist = {
		name: 'Test Artist',
		songs: 0,
		fans: 0,
		peakFans: 0,
		createdAt: now
	};

	const defaultUnlockedSystems: UnlockedSystems = { ...INITIAL_UNLOCKED_SYSTEMS };

	return {
		money: INITIAL_MONEY,
		songs: [],
		fans: INITIAL_FANS,
		gpu: INITIAL_GPU,
		phase: INITIAL_PHASE,
		industryControl: INITIAL_INDUSTRY_CONTROL,
		currentArtist: defaultArtist,
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
		unlockedSystems: defaultUnlockedSystems,
		lastUpdate: now,
		createdAt: now,
		version: GAME_VERSION,
		...overrides
	};
}

/**
 * Mock crypto.randomUUID for deterministic tests
 */
let mockUuidCounter = 0;
function mockUuid(): string {
	return `test-uuid-${mockUuidCounter++}`;
}

// ============================================================================
// RENDERING TESTS
// ============================================================================

describe('SongGenerator - Rendering', () => {
	beforeEach(() => {
		mockUuidCounter = 0;
		vi.stubGlobal('crypto', { randomUUID: mockUuid });
	});

	it('should render all UI elements', () => {
		const gameState = createTestGameState({ money: 100 });
		const { container } = render(SongGenerator, { props: { gameState } });

		// Check for stats labels
		expect(container.textContent).toContain('Money:');
		expect(container.textContent).toContain('Cost per song:');
		expect(container.textContent).toContain('Generation time:');
		expect(container.textContent).toContain('Queue:');

		// Check for buttons
		expect(container.querySelector('[data-testid="queue-1x"]')).toBeTruthy();
		expect(container.querySelector('[data-testid="queue-5x"]')).toBeTruthy();
		expect(container.querySelector('[data-testid="queue-10x"]')).toBeTruthy();
		expect(container.querySelector('[data-testid="queue-max"]')).toBeTruthy();
	});

	it('should display current money correctly', () => {
		const gameState = createTestGameState({ money: 123.45 });
		const { container } = render(SongGenerator, { props: { gameState } });

		expect(container.textContent).toContain('$123.45');
	});

	it('should display cost per song', () => {
		const gameState = createTestGameState();
		const { container } = render(SongGenerator, { props: { gameState } });

		expect(container.textContent).toContain(`$${BASE_SONG_COST}`);
	});

	it('should display FREE when cost is 0', () => {
		const gameState = createTestGameState({
			upgrades: {
				tier2_basic: {
					purchasedAt: Date.now(),
					tier: 2
				}
			}
		});
		const { container } = render(SongGenerator, { props: { gameState } });

		expect(container.textContent).toContain('FREE');
	});

	it('should display generation time in seconds', () => {
		const gameState = createTestGameState({ songGenerationSpeed: 15000 });
		const { container } = render(SongGenerator, { props: { gameState } });

		expect(container.textContent).toContain('15s per song');
	});

	it('should display queue count', () => {
		const gameState = createTestGameState({
			songQueue: [
				{ id: '1', progress: 0, totalTime: 10000 },
				{ id: '2', progress: 0, totalTime: 10000 },
				{ id: '3', progress: 0, totalTime: 10000 }
			]
		});
		const { container } = render(SongGenerator, { props: { gameState } });

		expect(container.textContent).toContain('3 songs queued');
	});

	it('should display 0 songs queued when queue is empty', () => {
		const gameState = createTestGameState();
		const { container } = render(SongGenerator, { props: { gameState } });

		expect(container.textContent).toContain('0 songs queued');
	});
});

// ============================================================================
// BUTTON ENABLE/DISABLE TESTS
// ============================================================================

describe('SongGenerator - Button States', () => {
	beforeEach(() => {
		mockUuidCounter = 0;
		vi.stubGlobal('crypto', { randomUUID: mockUuid });
	});

	it('should enable 1x button when can afford 1 song', () => {
		const gameState = createTestGameState({ money: 10 });
		const { getByTestId } = render(SongGenerator, { props: { gameState } });

		const button = getByTestId('queue-1x') as HTMLButtonElement;
		expect(button.disabled).toBe(false);
	});

	it('should disable 1x button when cannot afford', () => {
		const gameState = createTestGameState({ money: 0 });
		const { getByTestId } = render(SongGenerator, { props: { gameState } });

		const button = getByTestId('queue-1x') as HTMLButtonElement;
		expect(button.disabled).toBe(true);
	});

	it('should disable 5x button when can afford 3 but not 5', () => {
		const gameState = createTestGameState({ money: 3 }); // Can afford 3 songs at $1 each
		const { getByTestId } = render(SongGenerator, { props: { gameState } });

		const button = getByTestId('queue-5x') as HTMLButtonElement;
		expect(button.disabled).toBe(true);
	});

	it('should enable 5x button when can afford 5 songs', () => {
		const gameState = createTestGameState({ money: 10 }); // 5 songs * $2 = $10
		const { getByTestId } = render(SongGenerator, { props: { gameState } });

		const button = getByTestId('queue-5x') as HTMLButtonElement;
		expect(button.disabled).toBe(false);
	});

	it('should disable 10x button when insufficient funds', () => {
		const gameState = createTestGameState({ money: 8 });
		const { getByTestId } = render(SongGenerator, { props: { gameState } });

		const button = getByTestId('queue-10x') as HTMLButtonElement;
		expect(button.disabled).toBe(true);
	});

	it('should enable 10x button when can afford 10 songs', () => {
		const gameState = createTestGameState({ money: 20 }); // 10 songs * $2 = $20
		const { getByTestId } = render(SongGenerator, { props: { gameState } });

		const button = getByTestId('queue-10x') as HTMLButtonElement;
		expect(button.disabled).toBe(false);
	});

	it('should enable Max button and show correct count', () => {
		const gameState = createTestGameState({ money: 7 }); // 7 / 2 = 3.5 → 3 songs
		const { getByTestId } = render(SongGenerator, { props: { gameState } });

		const button = getByTestId('queue-max') as HTMLButtonElement;
		expect(button.disabled).toBe(false);
		expect(button.textContent).toContain('Max (3)');
	});

	it('should disable Max button when count would be 0', () => {
		const gameState = createTestGameState({ money: 0 });
		const { getByTestId } = render(SongGenerator, { props: { gameState } });

		const button = getByTestId('queue-max') as HTMLButtonElement;
		expect(button.disabled).toBe(true);
		expect(button.textContent).toContain('Max (0)');
	});

	it('should show Max (10) when songs are free', () => {
		const gameState = createTestGameState({
			money: 100,
			upgrades: {
				tier2_basic: {
					purchasedAt: Date.now(),
					tier: 2
				}
			}
		});
		const { getByTestId } = render(SongGenerator, { props: { gameState } });

		const button = getByTestId('queue-max') as HTMLButtonElement;
		expect(button.textContent).toContain('Max (10)');
	});
});

// ============================================================================
// COST DISPLAY TESTS
// ============================================================================

describe('SongGenerator - Cost Display', () => {
	beforeEach(() => {
		mockUuidCounter = 0;
		vi.stubGlobal('crypto', { randomUUID: mockUuid });
	});

	it('should display correct cost per song', () => {
		const gameState = createTestGameState();
		const { container } = render(SongGenerator, { props: { gameState } });

		expect(container.textContent).toContain(`$${BASE_SONG_COST}`);
	});

	it('should display FREE when cost is 0', () => {
		const gameState = createTestGameState({
			upgrades: {
				tier2_basic: {
					purchasedAt: Date.now(),
					tier: 2
				}
			}
		});
		const { container } = render(SongGenerator, { props: { gameState } });

		// Check "Cost per song" label shows FREE
		expect(container.textContent).toMatch(/Cost per song:.*FREE/);
	});

	it('should show correct button costs for paid songs', () => {
		const gameState = createTestGameState({ money: 100 });
		const { getByTestId } = render(SongGenerator, { props: { gameState } });

		expect(getByTestId('queue-1x').textContent).toContain('($2)');
		expect(getByTestId('queue-5x').textContent).toContain('($10)');
		expect(getByTestId('queue-10x').textContent).toContain('($20)');
	});

	it('should show FREE on buttons when songs are free', () => {
		const gameState = createTestGameState({
			money: 100,
			upgrades: {
				tier2_basic: {
					purchasedAt: Date.now(),
					tier: 2
				}
			}
		});
		const { getByTestId } = render(SongGenerator, { props: { gameState } });

		expect(getByTestId('queue-1x').textContent).toContain('(FREE)');
		expect(getByTestId('queue-5x').textContent).toContain('(FREE)');
		expect(getByTestId('queue-10x').textContent).toContain('(FREE)');
	});

	it('should calculate Max button correctly with various money amounts', () => {
		const testCases = [
			{ money: 0, expected: 0 },
			{ money: 1, expected: 0 }, // Can't afford $2 song
			{ money: 7, expected: 3 }, // 7 / 2 = 3.5 → 3
			{ money: 15, expected: 7 }, // 15 / 2 = 7.5 → 7
			{ money: 100, expected: 50 } // 100 / 2 = 50
		];

		testCases.forEach(({ money, expected }) => {
			const gameState = createTestGameState({ money });
			const { getByTestId, unmount } = render(SongGenerator, { props: { gameState } });

			expect(getByTestId('queue-max').textContent).toContain(`Max (${expected})`);
			unmount(); // Clean up after each iteration
		});
	});
});

// ============================================================================
// PROGRESS BAR TESTS
// ============================================================================

describe('SongGenerator - Progress Bar', () => {
	beforeEach(() => {
		mockUuidCounter = 0;
		vi.stubGlobal('crypto', { randomUUID: mockUuid });
	});

	it('should not show progress bar when queue is empty', () => {
		const gameState = createTestGameState();
		const { container } = render(SongGenerator, { props: { gameState } });

		const progressBar = container.querySelector('progress');
		expect(progressBar).toBeFalsy();
	});

	it('should show progress bar when song is in queue', () => {
		const gameState = createTestGameState({
			songQueue: [{ id: '1', progress: 5000, totalTime: 10000 }]
		});
		const { container } = render(SongGenerator, { props: { gameState } });

		const progressBar = container.querySelector('progress');
		expect(progressBar).toBeTruthy();
	});

	it('should calculate progress percentage correctly', () => {
		const gameState = createTestGameState({
			songQueue: [{ id: '1', progress: 5000, totalTime: 10000 }]
		});
		const { container } = render(SongGenerator, { props: { gameState } });

		const progressBar = container.querySelector('progress') as HTMLProgressElement;
		expect(progressBar.value).toBe(50); // 5000/10000 * 100
	});

	it('should show 0% progress for new song', () => {
		const gameState = createTestGameState({
			songQueue: [{ id: '1', progress: 0, totalTime: 10000 }]
		});
		const { container } = render(SongGenerator, { props: { gameState } });

		const progressBar = container.querySelector('progress') as HTMLProgressElement;
		expect(progressBar.value).toBe(0);
	});

	it('should show 100% progress for completed song', () => {
		const gameState = createTestGameState({
			songQueue: [{ id: '1', progress: 10000, totalTime: 10000 }]
		});
		const { container } = render(SongGenerator, { props: { gameState } });

		const progressBar = container.querySelector('progress') as HTMLProgressElement;
		expect(progressBar.value).toBe(100);
	});

	it('should display percentage text', () => {
		const gameState = createTestGameState({
			songQueue: [{ id: '1', progress: 7500, totalTime: 10000 }]
		});
		const { container } = render(SongGenerator, { props: { gameState } });

		expect(container.textContent).toContain('75%');
	});
});

// ============================================================================
// USER INTERACTION TESTS
// ============================================================================

describe('SongGenerator - User Interactions', () => {
	beforeEach(() => {
		mockUuidCounter = 0;
		vi.stubGlobal('crypto', { randomUUID: mockUuid });
	});

	it('should queue 1 song and deduct money when 1x button clicked', async () => {
		const gameState = createTestGameState({ money: 10 });
		const { getByTestId, container } = render(SongGenerator, { props: { gameState } });

		expect(container.textContent).toContain('$10.00');
		expect(container.textContent).toContain('0 songs queued');

		await fireEvent.click(getByTestId('queue-1x'));
		await tick();

		expect(container.textContent).toContain('$8.00'); // 10 - 2
		expect(container.textContent).toContain('1 songs queued');
	});

	it('should queue 5 songs and deduct correct money when 5x button clicked', async () => {
		const gameState = createTestGameState({ money: 20 });
		const { getByTestId, container } = render(SongGenerator, { props: { gameState } });

		expect(container.textContent).toContain('$20.00');
		expect(container.textContent).toContain('0 songs queued');

		await fireEvent.click(getByTestId('queue-5x'));
		await tick();

		expect(container.textContent).toContain('$10.00'); // 20 - 10 (5 songs * $2)
		expect(container.textContent).toContain('5 songs queued');
	});

	it('should queue 10 songs when 10x button clicked', async () => {
		const gameState = createTestGameState({ money: 50 });
		const { getByTestId, container } = render(SongGenerator, { props: { gameState } });

		expect(container.textContent).toContain('$50.00');
		expect(container.textContent).toContain('0 songs queued');

		await fireEvent.click(getByTestId('queue-10x'));
		await tick();

		expect(container.textContent).toContain('$30.00'); // 50 - 20 (10 songs * $2)
		expect(container.textContent).toContain('10 songs queued');
	});

	it('should queue max affordable songs when Max button clicked', async () => {
		const gameState = createTestGameState({ money: 7 });
		const { getByTestId, container } = render(SongGenerator, { props: { gameState } });

		expect(container.textContent).toContain('$7.00');
		expect(container.textContent).toContain('0 songs queued');

		await fireEvent.click(getByTestId('queue-max'));
		await tick();

		expect(container.textContent).toContain('$1.00'); // 7 - 6 (3 songs * $2)
		expect(container.textContent).toContain('3 songs queued');
	});

	it('should not queue songs when disabled button is clicked', async () => {
		const gameState = createTestGameState({ money: 0 });
		const { getByTestId } = render(SongGenerator, { props: { gameState } });

		const button = getByTestId('queue-1x') as HTMLButtonElement;
		expect(button.disabled).toBe(true);

		// Try to click (should not work)
		await fireEvent.click(button);

		expect(gameState.money).toBe(0);
		expect(gameState.songQueue.length).toBe(0);
	});

	it('should queue correct number when songs are free', async () => {
		const gameState = createTestGameState({
			money: 100,
			upgrades: {
				tier2_basic: {
					purchasedAt: Date.now(),
					tier: 2
				}
			}
		});
		const { getByTestId, container } = render(SongGenerator, { props: { gameState } });

		expect(container.textContent).toContain('$100.00');
		expect(container.textContent).toContain('0 songs queued');

		await fireEvent.click(getByTestId('queue-10x'));
		await tick();

		expect(container.textContent).toContain('$100.00'); // No cost deducted
		expect(container.textContent).toContain('10 songs queued');
	});

	it('should queue 10 songs when Max clicked with free songs', async () => {
		const gameState = createTestGameState({
			money: 100,
			upgrades: {
				tier2_basic: {
					purchasedAt: Date.now(),
					tier: 2
				}
			}
		});
		const { getByTestId, container } = render(SongGenerator, { props: { gameState } });

		expect(container.textContent).toContain('$100.00');
		expect(container.textContent).toContain('0 songs queued');

		await fireEvent.click(getByTestId('queue-max'));
		await tick();

		expect(container.textContent).toContain('$100.00'); // No cost deducted
		expect(container.textContent).toContain('10 songs queued');
	});

	it('should update queue count display after queuing songs', async () => {
		const gameState = createTestGameState({ money: 100 });
		const { getByTestId, container } = render(SongGenerator, { props: { gameState } });

		expect(container.textContent).toContain('0 songs queued');

		await fireEvent.click(getByTestId('queue-5x'));
		await tick();

		expect(container.textContent).toContain('5 songs queued');
	});

	it('should handle multiple queue actions correctly', async () => {
		const gameState = createTestGameState({ money: 20 });
		const { getByTestId, container } = render(SongGenerator, { props: { gameState } });

		// Initial state
		expect(container.textContent).toContain('$20.00');
		expect(container.textContent).toContain('0 songs queued');

		// First queue
		await fireEvent.click(getByTestId('queue-1x'));
		await tick();
		expect(container.textContent).toContain('$18.00'); // 20 - 2
		expect(container.textContent).toContain('1 songs queued');

		// Second queue
		await fireEvent.click(getByTestId('queue-5x'));
		await tick();
		expect(container.textContent).toContain('$8.00'); // 18 - 10
		expect(container.textContent).toContain('6 songs queued');

		// Third queue
		await fireEvent.click(getByTestId('queue-1x'));
		await tick();
		expect(container.textContent).toContain('$6.00'); // 8 - 2
		expect(container.textContent).toContain('7 songs queued');
	});

	it('should set correct generation speed on queued songs', async () => {
		const gameState = createTestGameState({
			money: 100,
			songGenerationSpeed: 15000
		});
		const { getByTestId, container } = render(SongGenerator, { props: { gameState } });

		// Check generation time is displayed
		expect(container.textContent).toContain('15s per song');

		await fireEvent.click(getByTestId('queue-1x'));
		await tick();

		// Verify song was queued
		expect(container.textContent).toContain('1 songs queued');
	});

	it('should use upgraded generation speed from upgrades', async () => {
		const gameState = createTestGameState({
			money: 100,
			upgrades: {
				tier1_improved: {
					purchasedAt: Date.now(),
					tier: 1
				}
			}
		});
		const { getByTestId, container } = render(SongGenerator, { props: { gameState } });

		// tier1_improved sets songSpeed to 12000 (12 seconds)
		expect(container.textContent).toContain('12s per song');

		await fireEvent.click(getByTestId('queue-1x'));
		await tick();

		// Verify song was queued
		expect(container.textContent).toContain('1 songs queued');
	});
});

// ============================================================================
// REACTIVITY TESTS
// ============================================================================
// Note: In Svelte 5, the $set API is deprecated. Reactivity tests are handled
// through the interaction tests above where gameState is mutated directly by
// the queueSongs function.
