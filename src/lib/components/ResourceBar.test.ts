/**
 * ResourceBar Component Unit Tests
 *
 * Comprehensive tests for the ResourceBar component including:
 * - Rendering with default game state
 * - Money display with formatMoney
 * - Income per second calculation and display
 * - Songs, fans, GPU display
 * - GPU conditional visibility
 * - Industry control progress bar
 * - Number formatting for large numbers
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ResourceBar from './ResourceBar.svelte';
import type { GameState, Song, LegacyArtist } from '../game/types';
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
} from '../game/config';

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

// Helper to create a test song
function createTestSong(overrides?: Partial<Song>): Song {
	return {
		id: 'test-song-1',
		name: 'Test Song',
		genre: 'pop',
		createdAt: Date.now(),
		incomePerSecond: 10,
		fanGenerationRate: 5,
		isTrending: false,
		...overrides
	};
}

// Helper to create a test legacy artist
function createTestLegacyArtist(overrides?: Partial<LegacyArtist>): LegacyArtist {
	return {
		name: 'Legacy Artist',
		peakFans: 1000000,
		songs: 50,
		incomeRate: 100,
		createdAt: Date.now() - 1000000,
		prestigedAt: Date.now() - 500000,
		...overrides
	};
}

describe('ResourceBar Component', () => {
	describe('Basic Rendering', () => {
		it('should render without errors', () => {
			const gameState = createTestGameState();
			const { container } = render(ResourceBar, { props: { gameState } });
			expect(container).toBeTruthy();
		});

		it('should display all core resources (money, songs, fans)', () => {
			const gameState = createTestGameState();
			render(ResourceBar, { props: { gameState } });

			expect(screen.getByText('Money')).toBeTruthy();
			expect(screen.getByText('Songs')).toBeTruthy();
			expect(screen.getByText('Fans')).toBeTruthy();
		});

		it('should display industry control label', () => {
			const gameState = createTestGameState();
			render(ResourceBar, { props: { gameState } });

			expect(screen.getByText('Industry Control')).toBeTruthy();
		});
	});

	describe('Money Display', () => {
		it('should display money using formatMoney', () => {
			const gameState = createTestGameState({ money: 100 });
			const { container } = render(ResourceBar, { props: { gameState } });

			expect(container.textContent).toContain('$100');
		});

		it('should format large money amounts with K suffix', () => {
			const gameState = createTestGameState({ money: 5000 });
			const { container } = render(ResourceBar, { props: { gameState } });

			expect(container.textContent).toContain('$5K');
		});

		it('should format money amounts with M suffix', () => {
			const gameState = createTestGameState({ money: 2500000 });
			const { container } = render(ResourceBar, { props: { gameState } });

			expect(container.textContent).toContain('$2.5M');
		});

		it('should format money amounts with B suffix', () => {
			const gameState = createTestGameState({ money: 3200000000 });
			const { container } = render(ResourceBar, { props: { gameState } });

			expect(container.textContent).toContain('$3.2B');
		});
	});

	describe('Income Per Second Calculation', () => {
		it('should display zero income when no songs or legacy artists', () => {
			const gameState = createTestGameState();
			const { container } = render(ResourceBar, { props: { gameState } });

			expect(container.textContent).toContain('($0/s)');
		});

		it('should calculate income from single song', () => {
			const song = createTestSong({ incomePerSecond: 50 });
			const gameState = createTestGameState({ songs: [song] });
			const { container } = render(ResourceBar, { props: { gameState } });

			expect(container.textContent).toContain('($50/s)');
		});

		it('should calculate income from multiple songs', () => {
			const songs = [
				createTestSong({ id: 'song1', incomePerSecond: 50 }),
				createTestSong({ id: 'song2', incomePerSecond: 75 }),
				createTestSong({ id: 'song3', incomePerSecond: 25 })
			];
			const gameState = createTestGameState({ songs });
			const { container } = render(ResourceBar, { props: { gameState } });

			expect(container.textContent).toContain('($150/s)');
		});

		it('should calculate income from legacy artist', () => {
			const legacyArtist = createTestLegacyArtist({ incomeRate: 200 });
			const gameState = createTestGameState({ legacyArtists: [legacyArtist] });
			const { container } = render(ResourceBar, { props: { gameState } });

			expect(container.textContent).toContain('($200/s)');
		});

		it('should calculate combined income from songs and legacy artists', () => {
			const songs = [
				createTestSong({ id: 'song1', incomePerSecond: 50 }),
				createTestSong({ id: 'song2', incomePerSecond: 100 })
			];
			const legacyArtists = [
				createTestLegacyArtist({ name: 'Artist 1', incomeRate: 200 }),
				createTestLegacyArtist({ name: 'Artist 2', incomeRate: 150 })
			];
			const gameState = createTestGameState({ songs, legacyArtists });
			const { container } = render(ResourceBar, { props: { gameState } });

			// Total: 50 + 100 + 200 + 150 = 500
			expect(container.textContent).toContain('($500/s)');
		});

		it('should format large income values with K suffix', () => {
			const song = createTestSong({ incomePerSecond: 5000 });
			const gameState = createTestGameState({ songs: [song] });
			const { container } = render(ResourceBar, { props: { gameState } });

			expect(container.textContent).toContain('($5K/s)');
		});

		it('should format large income values with M suffix', () => {
			const legacyArtist = createTestLegacyArtist({ incomeRate: 2500000 });
			const gameState = createTestGameState({ legacyArtists: [legacyArtist] });
			const { container } = render(ResourceBar, { props: { gameState } });

			expect(container.textContent).toContain('($2.5M/s)');
		});
	});

	describe('Songs Display', () => {
		it('should display zero songs initially', () => {
			const gameState = createTestGameState();
			const { container } = render(ResourceBar, { props: { gameState } });

			expect(container.textContent).toContain('🎵');
			expect(container.textContent).toContain('0');
		});

		it('should display correct song count', () => {
			const songs = [
				createTestSong({ id: 'song1' }),
				createTestSong({ id: 'song2' }),
				createTestSong({ id: 'song3' })
			];
			const gameState = createTestGameState({ songs });
			const { container } = render(ResourceBar, { props: { gameState } });

			expect(container.textContent).toContain('🎵');
			// The component shows songs.length which is 3
			expect(container.textContent).toMatch(/Songs.*3/);
		});

		it('should format large song counts', () => {
			// Create 1500 songs
			const songs = Array.from({ length: 1500 }, (_, i) =>
				createTestSong({ id: `song${i}` })
			);
			const gameState = createTestGameState({ songs });
			const { container } = render(ResourceBar, { props: { gameState } });

			expect(container.textContent).toContain('1.5K');
		});
	});

	describe('Fans Display', () => {
		it('should display zero fans initially', () => {
			const gameState = createTestGameState({ fans: 0 });
			const { container } = render(ResourceBar, { props: { gameState } });

			expect(container.textContent).toContain('👥');
			expect(container.textContent).toContain('0');
		});

		it('should display correct fan count', () => {
			const gameState = createTestGameState({ fans: 1234 });
			const { container } = render(ResourceBar, { props: { gameState } });

			expect(container.textContent).toContain('👥');
			// formatNumber converts 1234 to "1.23K", not "1,234"
			expect(container.textContent).toContain('1.23K');
		});

		it('should format large fan counts with K suffix', () => {
			const gameState = createTestGameState({ fans: 50000 });
			const { container } = render(ResourceBar, { props: { gameState } });

			expect(container.textContent).toContain('50K');
		});

		it('should format fan counts with M suffix', () => {
			const gameState = createTestGameState({ fans: 15000000 });
			const { container } = render(ResourceBar, { props: { gameState } });

			expect(container.textContent).toContain('15M');
		});

		it('should format fan counts with B suffix', () => {
			const gameState = createTestGameState({ fans: 2500000000 });
			const { container } = render(ResourceBar, { props: { gameState } });

			expect(container.textContent).toContain('2.5B');
		});
	});

	describe('GPU Display', () => {
		it('should NOT display GPU when system is locked', () => {
			const gameState = createTestGameState({
				gpu: 100,
				unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, gpu: false }
			});
			const { container } = render(ResourceBar, { props: { gameState } });

			expect(container.textContent).not.toContain('GPU');
			expect(container.textContent).not.toContain('🖥️');
		});

		it('should display GPU when system is unlocked', () => {
			const gameState = createTestGameState({
				gpu: 100,
				unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, gpu: true }
			});
			render(ResourceBar, { props: { gameState } });

			expect(screen.getByText('GPU')).toBeTruthy();
		});

		it('should display correct GPU count', () => {
			const gameState = createTestGameState({
				gpu: 250,
				unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, gpu: true }
			});
			const { container } = render(ResourceBar, { props: { gameState } });

			expect(container.textContent).toContain('🖥️');
			expect(container.textContent).toContain('250');
		});

		it('should format large GPU counts', () => {
			const gameState = createTestGameState({
				gpu: 50000,
				unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, gpu: true }
			});
			const { container } = render(ResourceBar, { props: { gameState } });

			expect(container.textContent).toContain('50K');
		});
	});

	describe('Industry Control Progress Bar', () => {
		it('should display 0% industry control initially', () => {
			const gameState = createTestGameState({ industryControl: 0 });
			const { container } = render(ResourceBar, { props: { gameState } });

			expect(container.textContent).toContain('0%');
		});

		it('should display correct percentage at 50%', () => {
			const gameState = createTestGameState({ industryControl: 50 });
			const { container } = render(ResourceBar, { props: { gameState } });

			expect(container.textContent).toContain('50%');
		});

		it('should display correct percentage at 100%', () => {
			const gameState = createTestGameState({ industryControl: 100 });
			const { container } = render(ResourceBar, { props: { gameState } });

			expect(container.textContent).toContain('100%');
		});

		it('should display correct percentage at intermediate value', () => {
			const gameState = createTestGameState({ industryControl: 37.5 });
			const { container } = render(ResourceBar, { props: { gameState } });

			expect(container.textContent).toContain('38%'); // Should round to nearest integer
		});

		it('should have progress bar element', () => {
			const gameState = createTestGameState({ industryControl: 50 });
			const { container } = render(ResourceBar, { props: { gameState } });

			const progressBar = container.querySelector('.progress-bar-fill');
			expect(progressBar).toBeTruthy();
		});

		it('should set progress bar width to 0% when control is 0', () => {
			const gameState = createTestGameState({ industryControl: 0 });
			const { container } = render(ResourceBar, { props: { gameState } });

			const progressBar = container.querySelector('.progress-bar-fill') as HTMLElement;
			expect(progressBar?.style.width).toBe('0%');
		});

		it('should set progress bar width to 50% when control is 50', () => {
			const gameState = createTestGameState({ industryControl: 50 });
			const { container } = render(ResourceBar, { props: { gameState } });

			const progressBar = container.querySelector('.progress-bar-fill') as HTMLElement;
			expect(progressBar?.style.width).toBe('50%');
		});

		it('should set progress bar width to 100% when control is 100', () => {
			const gameState = createTestGameState({ industryControl: 100 });
			const { container } = render(ResourceBar, { props: { gameState } });

			const progressBar = container.querySelector('.progress-bar-fill') as HTMLElement;
			expect(progressBar?.style.width).toBe('100%');
		});

		it('should cap progress bar width at 100% even if control exceeds 100', () => {
			const gameState = createTestGameState({ industryControl: 150 });
			const { container } = render(ResourceBar, { props: { gameState } });

			const progressBar = container.querySelector('.progress-bar-fill') as HTMLElement;
			expect(progressBar?.style.width).toBe('100%');
		});
	});

	describe('Number Formatting', () => {
		it('should format thousands with K suffix', () => {
			const gameState = createTestGameState({
				money: 5000,
				fans: 10000
			});
			const { container } = render(ResourceBar, { props: { gameState } });

			expect(container.textContent).toContain('$5K');
			expect(container.textContent).toContain('10K');
		});

		it('should format millions with M suffix', () => {
			const gameState = createTestGameState({
				money: 7500000,
				fans: 25000000
			});
			const { container } = render(ResourceBar, { props: { gameState } });

			expect(container.textContent).toContain('$7.5M');
			expect(container.textContent).toContain('25M');
		});

		it('should format billions with B suffix', () => {
			const gameState = createTestGameState({
				money: 4200000000,
				fans: 1800000000
			});
			const { container } = render(ResourceBar, { props: { gameState } });

			expect(container.textContent).toContain('$4.2B');
			expect(container.textContent).toContain('1.8B');
		});

		it('should handle decimal values correctly', () => {
			const gameState = createTestGameState({
				money: 1234.56
			});
			const { container } = render(ResourceBar, { props: { gameState } });

			expect(container.textContent).toContain('$1.23K');
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty songs array', () => {
			const gameState = createTestGameState({ songs: [] });
			const { container } = render(ResourceBar, { props: { gameState } });

			expect(container.textContent).toContain('0');
			expect(container.textContent).toContain('($0/s)');
		});

		it('should handle empty legacy artists array', () => {
			const gameState = createTestGameState({ legacyArtists: [] });
			const { container } = render(ResourceBar, { props: { gameState } });

			expect(container.textContent).toContain('($0/s)');
		});

		it('should handle negative industry control gracefully', () => {
			const gameState = createTestGameState({ industryControl: -10 });
			const { container } = render(ResourceBar, { props: { gameState } });

			expect(container.textContent).toContain('-10%');
		});

		it('should handle very large numbers', () => {
			const gameState = createTestGameState({
				money: 1_000_000_000_000, // 1 trillion
				fans: 5_000_000_000 // 5 billion
			});
			const { container } = render(ResourceBar, { props: { gameState } });

			expect(container.textContent).toContain('$1T');
			expect(container.textContent).toContain('5B');
		});
	});

	describe('Reactive Updates', () => {
		it('should update when money changes', () => {
			const gameState = createTestGameState({ money: 100 });
			const { container, unmount } = render(ResourceBar, { props: { gameState } });

			expect(container.textContent).toContain('$100');

			unmount();

			// Update game state and re-render
			gameState.money = 5000;
			const { container: newContainer } = render(ResourceBar, { props: { gameState } });

			expect(newContainer.textContent).toContain('$5K');
		});

		it('should update income when songs are added', () => {
			const gameState = createTestGameState({ songs: [] });
			const { container, unmount } = render(ResourceBar, { props: { gameState } });

			expect(container.textContent).toContain('($0/s)');

			unmount();

			// Add songs and re-render
			gameState.songs = [createTestSong({ incomePerSecond: 100 })];
			const { container: newContainer } = render(ResourceBar, { props: { gameState } });

			expect(newContainer.textContent).toContain('($100/s)');
		});

		it('should show GPU after unlocking', () => {
			const gameState = createTestGameState({
				gpu: 50,
				unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS, gpu: false }
			});
			const { container, unmount } = render(ResourceBar, { props: { gameState } });

			expect(container.textContent).not.toContain('GPU');

			unmount();

			// Unlock GPU and re-render
			gameState.unlockedSystems.gpu = true;
			render(ResourceBar, { props: { gameState } });

			expect(screen.getByText('GPU')).toBeTruthy();
		});
	});
});
