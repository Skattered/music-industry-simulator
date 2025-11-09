/**
 * Game Configuration
 *
 * Central configuration file containing all game constants, costs, and balance values.
 * All constants use UPPER_SNAKE_CASE naming convention.
 *
 * Balance Philosophy:
 * - Early game (Tier 1-2): Focus on manual song creation and discovery
 * - Mid game (Tier 3-5): Automation and scaling begin
 * - Late game (Tier 6-7): Full automation and industry control
 * - Prestige is encouraged around 30-60 minutes of gameplay
 */

import type {
	UpgradeDefinition,
	BoostDefinition,
	Phase,
	TechTier,
	UnlockedSystems
} from './types';

// ============================================================================
// CORE GAME CONSTANTS
// ============================================================================

/** Game tick rate in milliseconds (10 ticks per second) */
export const TICK_RATE = 100;

/** LocalStorage key for primary save file */
export const SAVE_KEY = 'music_empire_save';

/** LocalStorage key for backup save file */
export const BACKUP_KEY = 'music_empire_backup';

/** Current game version for save compatibility */
export const GAME_VERSION = '1.0.0';

// ============================================================================
// INITIAL RESOURCE VALUES
// ============================================================================

/** Starting money balance in dollars */
export const INITIAL_MONEY = 10;

/** Starting fan count */
export const INITIAL_FANS = 0;

/** Starting GPU resources (locked until tier 3) */
export const INITIAL_GPU = 0;

/** Starting tech tier */
export const INITIAL_TECH_TIER: TechTier = 1;

/** Starting tech sub-tier */
export const INITIAL_TECH_SUB_TIER: 0 | 1 | 2 = 0;

/** Starting phase */
export const INITIAL_PHASE: Phase = 1;

/** Starting industry control percentage */
export const INITIAL_INDUSTRY_CONTROL = 0;

/** Starting prestige count */
export const INITIAL_PRESTIGE_COUNT = 0;

/** Starting experience multiplier */
export const INITIAL_EXPERIENCE_MULTIPLIER = 1.0;

// ============================================================================
// BASE RATES & GENERATION
// ============================================================================

/**
 * Base song generation time in milliseconds
 * Balance: 30 seconds feels meaningful but not tedious for first songs
 */
export const BASE_SONG_GENERATION_TIME = 30000;

/**
 * Base income per song per second in dollars
 * Balance: At $0.001/sec, one song earns $3.60/hour - realistic streaming rates
 */
export const BASE_INCOME_PER_SONG = 0.001;

/**
 * Base fan generation rate per song per second
 * Balance: Slow organic growth, needs multiple songs to scale
 */
export const BASE_FAN_GENERATION_RATE = 0.1;

/**
 * Trending genre income multiplier
 * Balance: 2x reward encourages strategic genre switching
 */
export const TRENDING_MULTIPLIER = 2.0;

/**
 * Cost to generate a song at tier 1 (web services)
 * Balance: First song is free ($10 starting), second costs $2, creating early tension
 */
export const BASE_SONG_COST = 2;

/**
 * Offline progress cap in hours
 * Balance: 4 hours max prevents excessive gains but rewards checking in
 */
export const OFFLINE_PROGRESS_CAP_HOURS = 4;

// ============================================================================
// PHASE UNLOCK REQUIREMENTS
// ============================================================================

/**
 * Requirements to unlock each game phase
 * Each phase introduces new mechanics and revenue streams
 */
export const PHASE_REQUIREMENTS: Record<Phase, {
	minFans: number;
	minSongs: number;
	minTechTier: TechTier;
	description: string;
}> = {
	1: {
		minFans: 0,
		minSongs: 0,
		minTechTier: 1,
		description: 'Streaming Phase - Generate songs and earn from streams'
	},
	2: {
		minFans: 1000,
		minSongs: 10,
		minTechTier: 2,
		description: 'Physical Albums Phase - Release albums for one-time payouts'
	},
	3: {
		minFans: 10000,
		minSongs: 50,
		minTechTier: 4,
		description: 'Tours & Concerts Phase - Organize tours for massive income'
	},
	4: {
		minFans: 100000,
		minSongs: 200,
		minTechTier: 6,
		description: 'Platform Ownership Phase - Buy industry infrastructure'
	},
	5: {
		minFans: 1000000,
		minSongs: 1000,
		minTechTier: 7,
		description: 'Total Automation Phase - AI agents run everything'
	}
};

// ============================================================================
// TECH TIER UPGRADE DEFINITIONS
// ============================================================================

/**
 * All available upgrades organized by tech tier
 *
 * Balance Notes:
 * - Each tier has 3 sub-tiers representing progression
 * - Costs scale exponentially (roughly 10x per tier)
 * - Speed improvements are incremental (not exponential) to maintain pacing
 * - Free songs unlock at tier 2 to transition from manual to automated gameplay
 */
export const UPGRADES: UpgradeDefinition[] = [
	// ========================================
	// TIER 1: Third-party Web Services
	// ========================================
	{
		id: 'tier1_basic',
		tier: 1,
		name: 'Suno/Udio Account',
		description: 'Basic web-based AI music generation. Songs take 30s to generate.',
		cost: 10,
		effects: {
			songSpeed: 30000,
			songCost: 2
		}
	},
	{
		id: 'tier1_improved',
		tier: 1,
		name: 'Premium Subscription',
		description: 'Faster generation queue and better quality. Songs take 20s.',
		cost: 50,
		effects: {
			songSpeed: 20000,
			songCost: 1.5
		},
		prerequisites: ['tier1_basic']
	},
	{
		id: 'tier1_advanced',
		tier: 1,
		name: 'Multi-Account Management',
		description: 'Run multiple accounts in parallel. Songs take 15s.',
		cost: 200,
		effects: {
			songSpeed: 15000,
			songCost: 1,
			unlockTrendResearch: true
		},
		prerequisites: ['tier1_improved']
	},

	// ========================================
	// TIER 2: Lifetime Licenses/Subscriptions
	// ========================================
	{
		id: 'tier2_basic',
		tier: 2,
		name: 'Lifetime License',
		description: 'One-time payment for unlimited generation. Songs are now FREE!',
		cost: 500,
		effects: {
			songSpeed: 12000,
			songCost: 0
		},
		prerequisites: ['tier1_advanced']
	},
	{
		id: 'tier2_improved',
		tier: 2,
		name: 'API Access',
		description: 'Direct API integration for automation. Songs take 10s.',
		cost: 2000,
		effects: {
			songSpeed: 10000,
			incomeMultiplier: 1.5,
			unlockPhysicalAlbums: true
		},
		prerequisites: ['tier2_basic']
	},
	{
		id: 'tier2_advanced',
		tier: 2,
		name: 'Batch Processing',
		description: 'Generate songs in batches. Songs take 8s.',
		cost: 5000,
		effects: {
			songSpeed: 8000,
			incomeMultiplier: 2.0
		},
		prerequisites: ['tier2_improved']
	},

	// ========================================
	// TIER 3: Local AI Models
	// ========================================
	{
		id: 'tier3_basic',
		tier: 3,
		name: 'Download Open Models',
		description: 'Run AI locally on your hardware. Unlocks GPU resources. Songs take 6s.',
		cost: 10000,
		effects: {
			songSpeed: 6000,
			unlockGPU: true
		},
		prerequisites: ['tier2_advanced']
	},
	{
		id: 'tier3_improved',
		tier: 3,
		name: 'Optimized Inference',
		description: 'Quantization and optimization techniques. Songs take 5s.',
		cost: 25000,
		effects: {
			songSpeed: 5000,
			incomeMultiplier: 2.5
		},
		prerequisites: ['tier3_basic']
	},
	{
		id: 'tier3_advanced',
		tier: 3,
		name: 'Multi-GPU Setup',
		description: 'Parallel processing across multiple GPUs. Songs take 4s.',
		cost: 50000,
		effects: {
			songSpeed: 4000,
			incomeMultiplier: 3.0
		},
		prerequisites: ['tier3_improved']
	},

	// ========================================
	// TIER 4: Fine-tuned Models
	// ========================================
	{
		id: 'tier4_basic',
		tier: 4,
		name: 'Fine-tune on Hit Songs',
		description: 'Improve quality by training on popular music. Songs take 3s.',
		cost: 100000,
		effects: {
			songSpeed: 3000,
			incomeMultiplier: 4.0,
			unlockTours: true
		},
		prerequisites: ['tier3_advanced']
	},
	{
		id: 'tier4_improved',
		tier: 4,
		name: 'Genre Specialists',
		description: 'Separate models for each genre. Songs take 2.5s.',
		cost: 250000,
		effects: {
			songSpeed: 2500,
			incomeMultiplier: 5.0
		},
		prerequisites: ['tier4_basic']
	},
	{
		id: 'tier4_advanced',
		tier: 4,
		name: 'Trend Prediction Models',
		description: 'AI predicts next trending genre. Songs take 2s.',
		cost: 500000,
		effects: {
			songSpeed: 2000,
			incomeMultiplier: 6.0
		},
		prerequisites: ['tier4_improved']
	},

	// ========================================
	// TIER 5: Train Your Own Models
	// ========================================
	{
		id: 'tier5_basic',
		tier: 5,
		name: 'Custom Architecture',
		description: 'Build models from scratch. Songs take 1.5s.',
		cost: 1000000,
		effects: {
			songSpeed: 1500,
			incomeMultiplier: 8.0
		},
		prerequisites: ['tier4_advanced']
	},
	{
		id: 'tier5_improved',
		tier: 5,
		name: 'Scrape Training Data',
		description: 'Collect massive datasets from the internet. Songs take 1s.',
		cost: 2500000,
		effects: {
			songSpeed: 1000,
			incomeMultiplier: 10.0,
			unlockPrestige: true
		},
		prerequisites: ['tier5_basic']
	},
	{
		id: 'tier5_advanced',
		tier: 5,
		name: 'Distributed Training',
		description: 'Train across data centers. Songs take 0.8s.',
		cost: 5000000,
		effects: {
			songSpeed: 800,
			incomeMultiplier: 12.0
		},
		prerequisites: ['tier5_improved']
	},

	// ========================================
	// TIER 6: Build Your Own Software
	// ========================================
	{
		id: 'tier6_basic',
		tier: 6,
		name: 'Custom Inference Engine',
		description: 'Write optimized code from scratch. Songs take 0.6s.',
		cost: 10000000,
		effects: {
			songSpeed: 600,
			incomeMultiplier: 15.0,
			unlockPlatformOwnership: true
		},
		prerequisites: ['tier5_advanced']
	},
	{
		id: 'tier6_improved',
		tier: 6,
		name: 'Hardware Acceleration',
		description: 'CUDA/Metal optimization. Songs take 0.4s.',
		cost: 25000000,
		effects: {
			songSpeed: 400,
			incomeMultiplier: 20.0
		},
		prerequisites: ['tier6_basic']
	},
	{
		id: 'tier6_advanced',
		tier: 6,
		name: 'Proprietary Format',
		description: 'Control the entire stack. Songs take 0.3s.',
		cost: 50000000,
		effects: {
			songSpeed: 300,
			incomeMultiplier: 25.0,
			unlockMonopoly: true
		},
		prerequisites: ['tier6_improved']
	},

	// ========================================
	// TIER 7: AI Agent Automation
	// ========================================
	{
		id: 'tier7_basic',
		tier: 7,
		name: 'AI Marketing Agent',
		description: 'Agents handle all promotion. Songs take 0.2s.',
		cost: 100000000,
		effects: {
			songSpeed: 200,
			incomeMultiplier: 30.0
		},
		prerequisites: ['tier6_advanced']
	},
	{
		id: 'tier7_improved',
		tier: 7,
		name: 'AI A&R Agent',
		description: 'Agents decide what music to make. Songs take 0.15s.',
		cost: 250000000,
		effects: {
			songSpeed: 150,
			incomeMultiplier: 40.0
		},
		prerequisites: ['tier7_basic']
	},
	{
		id: 'tier7_advanced',
		tier: 7,
		name: 'Full Automation',
		description: 'The AI runs everything. You just watch. Songs take 0.1s.',
		cost: 500000000,
		effects: {
			songSpeed: 100,
			incomeMultiplier: 50.0
		},
		prerequisites: ['tier7_improved']
	}
];

// ============================================================================
// EXPLOITATION ABILITIES / BOOSTS
// ============================================================================

/**
 * Exploitation mechanics - morally questionable but profitable tactics
 *
 * Balance Notes:
 * - Costs scale with each use to prevent spam (1.5x multiplier)
 * - Short durations (30-60s) create active gameplay moments
 * - Powerful effects but expensive - creates interesting cost/benefit decisions
 * - Later phases unlock more egregious tactics
 */
export const BOOSTS: BoostDefinition[] = [
	// ========================================
	// PHASE 1: Streaming Exploitation
	// ========================================
	{
		id: 'bot_streams',
		type: 'bot_streams',
		name: 'Bot Streams',
		description: 'Deploy streaming bots to inflate play counts. Ethically dubious but effective.',
		baseCost: 100,
		duration: 30000, // 30 seconds
		incomeMultiplier: 3.0,
		fanMultiplier: 1.5,
		costScaling: 1.5
	},
	{
		id: 'playlist_placement',
		type: 'playlist_placement',
		name: 'Playlist Payola',
		description: 'Pay playlist curators for placement. Modern payola.',
		baseCost: 500,
		duration: 60000, // 60 seconds
		incomeMultiplier: 2.5,
		fanMultiplier: 3.0,
		costScaling: 1.5
	},
	{
		id: 'social_media',
		type: 'social_media_campaign',
		name: 'Viral Marketing Campaign',
		description: 'Astroturfing and fake engagement for artificial virality.',
		baseCost: 1000,
		duration: 45000, // 45 seconds
		incomeMultiplier: 2.0,
		fanMultiplier: 5.0,
		costScaling: 1.5
	},

	// ========================================
	// PHASE 2: Physical Album Exploitation
	// ========================================
	{
		id: 'limited_variants',
		type: 'limited_edition_variants',
		name: 'Limited Edition Variants',
		description: 'Release 47 different vinyl colors. Collectors must buy them all.',
		baseCost: 5000,
		duration: 60000,
		incomeMultiplier: 4.0,
		fanMultiplier: 1.2,
		costScaling: 1.5
	},
	{
		id: 'shut_down_competitors',
		type: 'shut_down_competitors',
		name: 'Shut Down Competitors',
		description: 'DMCA takedowns and frivolous lawsuits against other artists.',
		baseCost: 10000,
		duration: 90000, // 90 seconds
		incomeMultiplier: 3.5,
		fanMultiplier: 0.8, // Fans don\'t like this
		costScaling: 1.5
	},
	{
		id: 'exclusive_deals',
		type: 'exclusive_retailer_deals',
		name: 'Exclusive Retailer Deals',
		description: 'Force fans to shop at specific stores for different bonus tracks.',
		baseCost: 7500,
		duration: 60000,
		incomeMultiplier: 3.0,
		fanMultiplier: 1.5,
		costScaling: 1.5
	},

	// ========================================
	// PHASE 3: Concert/Tour Exploitation
	// ========================================
	{
		id: 'scalp_records',
		type: 'scalp_records',
		name: 'Scalp Your Own Records',
		description: 'Buy your own limited releases and resell at markup. Peak capitalism.',
		baseCost: 25000,
		duration: 120000, // 2 minutes
		incomeMultiplier: 5.0,
		fanMultiplier: 0.5, // Fans really don\'t like this
		costScaling: 1.5
	},
	{
		id: 'limit_tickets',
		type: 'limit_tickets',
		name: 'Artificial Ticket Scarcity',
		description: 'Hold back tickets to create false demand and urgency.',
		baseCost: 50000,
		duration: 90000,
		incomeMultiplier: 4.5,
		fanMultiplier: 1.1,
		costScaling: 1.5
	},
	{
		id: 'scalp_tickets',
		type: 'scalp_tickets',
		name: 'Scalp Your Own Tickets',
		description: 'Partner with scalpers to resell your own tickets at 10x markup.',
		baseCost: 100000,
		duration: 120000,
		incomeMultiplier: 6.0,
		fanMultiplier: 0.3, // Fans hate this but keep buying
		costScaling: 1.5
	},
	{
		id: 'fomo_marketing',
		type: 'fomo_marketing',
		name: 'FOMO Marketing',
		description: '"Last chance ever" claims and countdown timers. Repeat monthly.',
		baseCost: 75000,
		duration: 60000,
		incomeMultiplier: 3.5,
		fanMultiplier: 2.5,
		costScaling: 1.5
	},

	// ========================================
	// PHASE 4+: Platform Ownership Exploitation
	// ========================================
	{
		id: 'dynamic_pricing',
		type: 'dynamic_pricing',
		name: 'Dynamic Pricing',
		description: 'Surge pricing for your own shows on your own platform. Beautiful synergy.',
		baseCost: 250000,
		duration: 180000, // 3 minutes
		incomeMultiplier: 8.0,
		fanMultiplier: 0.2, // Maximum exploitation
		costScaling: 1.5
	}
];

// ============================================================================
// PRESTIGE SYSTEM
// ============================================================================

/**
 * Experience multiplier gained per prestige level
 * Each prestige adds +10% to all income
 */
export const PRESTIGE_MULTIPLIER_PER_LEVEL = 0.1;

/**
 * Maximum legacy artists kept after prestige
 * Balance: Keep last 3 to show progression without cluttering UI
 */
export const MAX_LEGACY_ARTISTS = 3;

/**
 * Minimum fans required to unlock prestige option
 * Balance: Should take 30-60 minutes on first run
 */
export const PRESTIGE_MIN_FANS = 50000;

/**
 * Percentage of peak fans that converts to legacy artist income rate
 * Balance: 1% means 100k fans = $1/sec passive income
 */
export const LEGACY_ARTIST_INCOME_RATIO = 0.00001;

// ============================================================================
// PHYSICAL ALBUMS
// ============================================================================

/**
 * Base payout per song in an album
 * Balance: 10 song album = $1000 base, scales with fans
 */
export const ALBUM_PAYOUT_PER_SONG = 100;

/**
 * Fan count multiplier for album payouts
 * More fans = larger audience = bigger payout
 */
export const ALBUM_FAN_MULTIPLIER = 0.01;

/**
 * Minimum songs required to release an album
 */
export const MIN_SONGS_FOR_ALBUM = 5;

/**
 * Base cooldown between album releases in milliseconds
 * Balance: 2 minutes prevents spam while allowing active play
 */
export const ALBUM_RELEASE_COOLDOWN = 120000;

// ============================================================================
// TOURS & CONCERTS
// ============================================================================

/**
 * Base cost to start a tour
 */
export const TOUR_BASE_COST = 50000;

/**
 * Tour duration in milliseconds
 * Balance: 3 minutes is long enough to be meaningful
 */
export const TOUR_DURATION = 180000;

/**
 * Base income per second during tour
 * Scales with fans and songs
 */
export const TOUR_BASE_INCOME_PER_SECOND = 10;

/**
 * Fan count multiplier for tour income
 */
export const TOUR_FAN_MULTIPLIER = 0.001;

/**
 * Maximum active tours at once
 */
export const MAX_ACTIVE_TOURS = 3;

// ============================================================================
// PLATFORM OWNERSHIP
// ============================================================================

/**
 * Available platforms for purchase in Phase 4+
 */
export const PLATFORM_DEFINITIONS = [
	{
		type: 'streaming' as const,
		name: 'Streaming Service',
		baseCost: 10000000,
		incomePerSecond: 1000,
		controlContribution: 15
	},
	{
		type: 'ticketing' as const,
		name: 'Ticketing Platform',
		baseCost: 25000000,
		incomePerSecond: 2500,
		controlContribution: 20
	},
	{
		type: 'venue' as const,
		name: 'Concert Venue Chain',
		baseCost: 50000000,
		incomePerSecond: 5000,
		controlContribution: 15
	},
	{
		type: 'billboard' as const,
		name: 'Billboard Charts',
		baseCost: 100000000,
		incomePerSecond: 10000,
		controlContribution: 25
	},
	{
		type: 'grammys' as const,
		name: 'The Grammys',
		baseCost: 250000000,
		incomePerSecond: 25000,
		controlContribution: 20
	},
	{
		type: 'training_data' as const,
		name: 'AI Training Data Monopoly',
		baseCost: 500000000,
		incomePerSecond: 50000,
		controlContribution: 30
	}
] as const;

/**
 * Industry control percentage needed to "win" the game
 */
export const INDUSTRY_CONTROL_WIN_THRESHOLD = 100;

// ============================================================================
// INITIAL UNLOCKED SYSTEMS
// ============================================================================

/**
 * Default unlocked systems for new game
 */
export const INITIAL_UNLOCKED_SYSTEMS: UnlockedSystems = {
	trendResearch: false,
	physicalAlbums: false,
	tours: false,
	platformOwnership: false,
	monopoly: false,
	prestige: false,
	gpu: false
};

// ============================================================================
// GENRE DEFINITIONS
// ============================================================================

/**
 * All available music genres
 * Trending genre rotates randomly
 */
export const GENRES = ['pop', 'hip-hop', 'rock', 'electronic', 'country', 'jazz', 'classical', 'indie'] as const;

/**
 * Cost to research and switch trending genre
 * Balance: Expensive enough to matter but affordable mid-game
 */
export const TREND_RESEARCH_COST = 10000;

/**
 * How often trending genre changes automatically (milliseconds)
 * Balance: 5 minutes gives time to capitalize on trends
 */
export const TREND_ROTATION_INTERVAL = 300000;
