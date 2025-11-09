/**
 * Comprehensive type definitions for the AI Music Empire game
 *
 * This file contains all TypeScript interfaces and types used throughout the game.
 * All types use strict typing with no 'any' types.
 */

/**
 * Tech tier levels representing AI model progression
 * 1: Third-party Web Services
 * 2: Lifetime Licenses/Subscriptions
 * 3: Local AI Models
 * 4: Fine-tuned Models
 * 5: Train Your Own Models
 * 6: Build Your Own Software
 * 7: AI Agent Automation
 */
export type TechTier = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * Music genres available in the game
 */
export type Genre = 'pop' | 'hip-hop' | 'rock' | 'electronic' | 'country' | 'jazz' | 'classical' | 'indie';

/**
 * Game progression phases
 * 1: Streaming Phase
 * 2: Physical Albums Phase
 * 3: Tours & Concerts Phase
 * 4: Platform Ownership Phase
 * 5: Total Automation Phase
 */
export type Phase = 1 | 2 | 3 | 4 | 5;

/**
 * Individual song that generates passive income
 */
export interface Song {
  /** Unique identifier for the song */
  id: string;
  /** Generated song name */
  name: string;
  /** Music genre of this song */
  genre: Genre;
  /** Timestamp when song was created (ms) */
  createdAt: number;
  /** Income generated per second from streams (in dollars) */
  incomePerSecond: number;
  /** Number of fans generated per second by this song */
  fanGenerationRate: number;
  /** Whether this song matches the current trending genre */
  isTrending: boolean;
}

/**
 * Song currently being generated in the queue
 */
export interface QueuedSong {
  /** Unique identifier for the queued song */
  id: string;
  /** Current generation progress (ms) */
  progress: number;
  /** Total time required to complete generation (ms) */
  totalTime: number;
}

/**
 * Current active artist information
 */
export interface Artist {
  /** Generated artist name */
  name: string;
  /** Total number of songs created by this artist */
  songs: number;
  /** Current fan count for this artist */
  fans: number;
  /** Peak fan count achieved (used for prestige bonuses) */
  peakFans: number;
  /** Timestamp when artist was created (ms) */
  createdAt: number;
}

/**
 * Legacy artist from previous prestige run
 * Continues generating passive income after prestige
 */
export interface LegacyArtist {
  /** Artist name */
  name: string;
  /** Peak fans achieved before prestige */
  peakFans: number;
  /** Total songs created before prestige */
  songs: number;
  /** Passive income rate per second (in dollars) */
  incomeRate: number;
  /** Timestamp when artist was originally created (ms) */
  createdAt: number;
  /** Timestamp when artist was prestiged (ms) */
  prestigedAt: number;
}

/**
 * Purchased upgrade record
 */
export interface Upgrade {
  /** Timestamp when upgrade was purchased (ms) */
  purchasedAt: number;
  /** Tech tier this upgrade belongs to */
  tier: TechTier;
}

/**
 * Types of exploitation/boost abilities
 */
export type BoostType =
  | 'bot_streams'
  | 'playlist_placement'
  | 'social_media_campaign'
  | 'limited_edition_variants'
  | 'shut_down_competitors'
  | 'exclusive_retailer_deals'
  | 'scalp_records'
  | 'limit_tickets'
  | 'scalp_tickets'
  | 'fomo_marketing'
  | 'dynamic_pricing';

/**
 * Active temporary boost from exploitation mechanics
 * These are activated abilities that cost money and provide temporary benefits
 */
export interface ActiveBoost {
  /** Unique identifier for this boost instance */
  id: string;
  /** Type of boost */
  type: BoostType;
  /** Display name */
  name: string;
  /** Timestamp when boost was activated (ms) */
  activatedAt: number;
  /** How long the boost lasts (ms) */
  duration: number;
  /** Income multiplier (1.0 = no change, 1.5 = 50% increase) */
  incomeMultiplier: number;
  /** Fan generation multiplier (1.0 = no change, 2.0 = 100% increase) */
  fanMultiplier: number;
}

/**
 * Physical album release information
 */
export interface PhysicalAlbum {
  /** Unique identifier */
  id: string;
  /** Album name */
  name: string;
  /** Number of songs included in the album */
  songCount: number;
  /** Timestamp when album was released (ms) */
  releasedAt: number;
  /** One-time payout received from this album (in dollars) */
  payout: number;
  /** Number of variants released (standard, deluxe, vinyl, limited edition, etc.) */
  variantCount: number;
  /** Whether this was a re-release of an older album */
  isRerelease: boolean;
}

/**
 * Concert tour information
 */
export interface Tour {
  /** Unique identifier */
  id: string;
  /** Tour name */
  name: string;
  /** Timestamp when tour started (ms) */
  startedAt: number;
  /** Timestamp when tour completed (ms), null if still running */
  completedAt: number | null;
  /** Income generated per second during tour (in dollars) */
  incomePerSecond: number;
  /** Whether this tour uses artificial scarcity tactics */
  usesScarcity: boolean;
}

/**
 * Industry platform/infrastructure ownership
 */
export interface Platform {
  /** Unique identifier */
  id: string;
  /** Platform type */
  type: 'streaming' | 'ticketing' | 'venue' | 'billboard' | 'grammys' | 'training_data';
  /** Platform name */
  name: string;
  /** Purchase price (in dollars) */
  cost: number;
  /** Timestamp when platform was acquired (ms) */
  acquiredAt: number;
  /** Passive income generated per second (in dollars) */
  incomePerSecond: number;
  /** How much this contributes to industry control (0-100) */
  controlContribution: number;
}

/**
 * Feature flags for unlocked game systems
 */
export interface UnlockedSystems {
  /** Can research and switch trending genres */
  trendResearch: boolean;
  /** Physical album releases unlocked */
  physicalAlbums: boolean;
  /** Concert tours unlocked */
  tours: boolean;
  /** Can purchase platform ownership */
  platformOwnership: boolean;
  /** Monopoly mechanics unlocked */
  monopoly: boolean;
  /** Can prestige to create new artist */
  prestige: boolean;
  /** GPU resources system unlocked */
  gpu: boolean;
}

/**
 * Main game state container
 * This is the single source of truth for all game data
 */
export interface GameState {
  // Primary Resources
  /** Current money balance (in dollars) */
  money: number;
  /** All completed songs generating income */
  songs: Song[];
  /** Total fan count across all artists */
  fans: number;
  /** GPU resources available (unlocked at tech tier 3) */
  gpu: number;

  // Progression
  /** Current game phase (1-5) */
  phase: Phase;
  /** Industry control progress (0-100), persists through prestige */
  industryControl: number;

  // Artist Management
  /** Current active artist */
  currentArtist: Artist;
  /** Previous artists from prestige runs (max 2-3 kept) */
  legacyArtists: LegacyArtist[];

  // Song Generation
  /** Songs currently being generated */
  songQueue: QueuedSong[];
  /** Time to generate one song (ms) */
  songGenerationSpeed: number;
  /** Current trending genre (null if trend research not unlocked) */
  currentTrendingGenre: Genre | null;
  /** Timestamp when the current trend was discovered (for calculating fade) */
  trendDiscoveredAt: number | null;

  // Tech Progression
  /** Current tech tier (1-7) */
  techTier: TechTier;
  /** Sub-tier progress within current tech tier (0-2) */
  techSubTier: 0 | 1 | 2;
  /** All purchased upgrades, keyed by upgrade ID */
  upgrades: Record<string, Upgrade>;

  // Exploitation & Boosts
  /** Currently active temporary boosts */
  activeBoosts: ActiveBoost[];

  // Physical & Concerts
  /** All released physical albums */
  physicalAlbums: PhysicalAlbum[];
  /** All tours (completed and in-progress) */
  tours: Tour[];

  // Platform Ownership
  /** Owned platforms and infrastructure */
  ownedPlatforms: Platform[];

  // Prestige System
  /** Number of times player has prestiged */
  prestigeCount: number;
  /** Experience multiplier from prestige (1.0 = no bonus) */
  experienceMultiplier: number;

  // Unlocks
  /** Feature flags for unlocked systems */
  unlockedSystems: UnlockedSystems;

  // Metadata
  /** Last update timestamp for offline progress calculation (ms) */
  lastUpdate: number;
  /** Timestamp when game was first created (ms) */
  createdAt: number;
  /** Game version for save compatibility */
  version: string;
}

/**
 * Upgrade definition from configuration
 * Used to define available upgrades in the game
 */
export interface UpgradeDefinition {
  /** Unique upgrade identifier */
  id: string;
  /** Tech tier this upgrade belongs to */
  tier: TechTier;
  /** Display name */
  name: string;
  /** Description of what this upgrade does */
  description: string;
  /** Purchase cost (in dollars) */
  cost: number;
  /** Effects applied when purchased */
  effects: UpgradeEffects;
  /** Prerequisites that must be met before purchase */
  prerequisites?: string[];
}

/**
 * Effects that an upgrade can apply
 */
export interface UpgradeEffects {
  /** Set song generation cost (0 = free) */
  songCost?: number;
  /** Set song generation speed (ms) */
  songSpeed?: number;
  /** Multiply income by this amount */
  incomeMultiplier?: number;
  /** Unlock GPU resource system */
  unlockGPU?: boolean;
  /** Unlock prestige system */
  unlockPrestige?: boolean;
  /** Unlock physical albums */
  unlockPhysicalAlbums?: boolean;
  /** Unlock tours */
  unlockTours?: boolean;
  /** Unlock platform ownership */
  unlockPlatformOwnership?: boolean;
  /** Unlock monopoly mechanics */
  unlockMonopoly?: boolean;
  /** Unlock trend research */
  unlockTrendResearch?: boolean;
}

/**
 * Boost ability definition from configuration
 */
export interface BoostDefinition {
  /** Unique boost identifier */
  id: string;
  /** Boost type */
  type: BoostType;
  /** Display name */
  name: string;
  /** Description of what this boost does */
  description: string;
  /** Base cost to activate (scales with usage) */
  baseCost: number;
  /** How long the boost lasts (ms) */
  duration: number;
  /** Income multiplier applied */
  incomeMultiplier: number;
  /** Fan generation multiplier applied */
  fanMultiplier: number;
  /** Cost multiplier for each subsequent use */
  costScaling: number;
}

/**
 * Milestone that contributes to industry control
 */
export interface Milestone {
  /** Unique milestone identifier */
  id: string;
  /** Display name */
  name: string;
  /** Description */
  description: string;
  /** How much this contributes to industry control (0-100) */
  controlContribution: number;
  /** Whether this milestone has been achieved */
  achieved: boolean;
}

/**
 * Requirements to unlock a game phase
 * Each phase uses different metrics based on its focus
 */
export interface PhaseRequirements {
  /** Minimum fan count required */
  minFans: number;
  /** Minimum songs completed (used in Phase 1-2) */
  minSongs?: number;
  /** Minimum money balance (used in Phase 2) */
  minMoney?: number;
  /** Minimum physical albums released (used in Phase 3) */
  minAlbums?: number;
  /** Minimum tours completed (used in Phase 4) */
  minTours?: number;
  /** Minimum platforms owned (used in Phase 5) */
  minPlatforms?: number;
  /** Minimum tech tier required */
  minTechTier: TechTier;
  /** Phase description */
  description: string;
}

/**
 * Save file structure for localStorage
 */
export interface SaveFile {
  /** Game state data */
  state: GameState;
  /** Save timestamp (ms) */
  savedAt: number;
  /** Save file version */
  version: string;
}
