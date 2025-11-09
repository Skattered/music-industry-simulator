/**
 * Game State Initialization
 *
 * Creates a new game state with all default values
 */

import type { GameState } from './types';
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
	BASE_SONG_GENERATION_TIME,
	GAME_VERSION
} from './config';

/**
 * Generate a random artist name for a new game
 * TODO: Replace with proper name generation once names.ts is implemented
 */
function generateDefaultArtistName(): string {
	const adjectives = ['Rising', 'New', 'Fresh', 'Young', 'Emerging'];
	const nouns = ['Artist', 'Talent', 'Star', 'Voice', 'Sound'];
	const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
	const noun = nouns[Math.floor(Math.random() * nouns.length)];
	return `${adj} ${noun}`;
}

/**
 * Creates a new game state with all default values
 *
 * @returns A new GameState object ready to use
 */
export function createNewGameState(): GameState {
	const now = Date.now();

	return {
		// Primary Resources
		money: INITIAL_MONEY,
		songs: [],
		fans: INITIAL_FANS,
		gpu: INITIAL_GPU,

		// Progression
		phase: INITIAL_PHASE,
		industryControl: INITIAL_INDUSTRY_CONTROL,

		// Artist Management
		currentArtist: {
			name: generateDefaultArtistName(),
			songs: 0,
			fans: 0,
			peakFans: 0,
			createdAt: now
		},
		legacyArtists: [],

		// Song Generation
		songQueue: [],
		songGenerationSpeed: BASE_SONG_GENERATION_TIME,
		currentTrendingGenre: null,
		trendDiscoveredAt: null,

		// Tech Progression
		techTier: INITIAL_TECH_TIER,
		techSubTier: INITIAL_TECH_SUB_TIER,
		upgrades: {},

		// Exploitation & Boosts
		activeBoosts: [],

		// Physical & Concerts
		physicalAlbums: [],
		tours: [],

		// Platform Ownership
		ownedPlatforms: [],

		// Prestige System
		prestigeCount: INITIAL_PRESTIGE_COUNT,
		experienceMultiplier: INITIAL_EXPERIENCE_MULTIPLIER,

		// Unlocks
		unlockedSystems: { ...INITIAL_UNLOCKED_SYSTEMS },

		// Metadata
		lastUpdate: now,
		createdAt: now,
		version: GAME_VERSION
	};
}
