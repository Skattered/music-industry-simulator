/**
 * Game Configuration
 *
 * Central configuration file containing all game constants, costs, and balance values.
 * All constants use UPPER_SNAKE_CASE naming convention.
 *
 * Balance Philosophy:
 * - MASSIVE SCALE: End game targets 4 BILLION fans (global domination)
 * - Hit songs should generate BILLIONS of plays/streams
 * - Albums can sell MILLIONS of copies (or 500K+ for limited releases)
 * - Tours generate MILLIONS in revenue
 * - Platform ownership costs HUNDREDS OF MILLIONS but generates massive passive income
 *
 * Progression:
 * - Early game (Tier 1-2): Build to first million fans, manual song creation
 * - Mid game (Tier 3-5): Scale to 100M+ fans, automation begins
 * - Late game (Tier 6-7): Push toward billions, full automation and industry control
 * - Prestige unlocks at tier 3 (Local Models) - can prestige immediately, no fan gate
 */

import type {
	UpgradeDefinition,
	BoostDefinition,
	Phase,
	TechTier,
	UnlockedSystems,
	PhaseRequirements
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
 * Balance: 20 seconds provides faster initial progression without feeling instant
 */
export const BASE_SONG_GENERATION_TIME = 20000;

/**
 * Base income per song per second in dollars
 * Balance: At $2/sec, one song earns $7,200/hour - scales with multipliers for 8-12hr gameplay
 */
export const BASE_INCOME_PER_SONG = 2.0;

/**
 * Base fan generation rate per song per second
 * Balance: 20 fans/sec = 72K fans/hour per song - enables milestone progression in target timeframe
 */
export const BASE_FAN_GENERATION_RATE = 20;

/**
 * Trending genre income multiplier (at start of trend)
 * Balance: 2x reward for matching trending genre - pure optimization (pay to research trends)
 */
export const TRENDING_MULTIPLIER = 2.0;

/**
 * Time in milliseconds for trend bonus to fade from max to 1.0x
 * Balance: 5 minutes gives players time to capitalize before needing to research again
 */
export const TREND_FADE_DURATION = 300000; // 5 minutes

/**
 * Cost to generate a song at tier 1 (web services)
 * Balance: $2 per song balances with higher base income, can afford 5 songs at start
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
 *
 * Balance Philosophy (ADJUSTED for 8-12 hour gameplay):
 * - Reduced requirements by 90-95% from initial scaling
 * - Each phase uses metrics from PREVIOUS phase's content
 * - Phase 2: Songs → Phase 3: Albums → Phase 4: Tours → Phase 5: Platforms
 * - Progressive 10x fan multiplier: 100K→1M→10M→50M
 * - Victory achievable at ~50M fans with 3 platforms
 *
 * Balanced for:
 * - Phase 2 unlock: ~1 hour
 * - Phase 3 unlock: ~2-3 hours
 * - Phase 4 unlock: ~5-6 hours
 * - Phase 5 unlock: ~8-9 hours → Victory at ~10 hours
 */
export const PHASE_REQUIREMENTS: Record<Phase, PhaseRequirements> = {
	1: {
		minFans: 0,
		minSongs: 0,
		minTechTier: 1,
		description: 'Streaming Phase - Generate songs and earn from streams'
	},
	2: {
		minFans: 100_000, // 100K fans - achievable in ~45-60 minutes
		minSongs: 100, // 100 songs - reachable in first hour
		minMoney: 100_000, // $100K - balanced with new $2/sec base income
		minTechTier: 2,
		description: 'Physical Albums Phase - Release albums for million-copy sales'
	},
	3: {
		minFans: 1_000_000, // 1M fans - reachable at ~2-3 hours
		minAlbums: 10, // 10 albums - auto-release every 10 songs
		minTechTier: 3, // Local AI Models (prestige unlock)
		description: 'Tours & Concerts Phase - Stadium tours and massive payouts'
	},
	4: {
		minFans: 10_000_000, // 10M fans - achievable at ~5-6 hours
		minTours: 25, // 25 tours - reasonable mid-game target
		minTechTier: 6,
		description: 'Platform Ownership Phase - Buy industry infrastructure'
	},
	5: {
		minFans: 50_000_000, // 50M fans - end game at ~8-10 hours
		minPlatforms: 3, // 3 platforms (half of available platforms)
		minTechTier: 7,
		description: 'Total Automation Phase - AI agents control the world'
	}
};

/**
 * Phase display names
 * Used for UI display across the application
 */
export const PHASE_NAMES: Record<Phase, string> = {
	1: 'Streaming',
	2: 'Physical Albums',
	3: 'Tours & Concerts',
	4: 'Platform Ownership',
	5: 'Total Automation'
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
		description: 'Basic web-based AI music generation. Songs take 15s, cost $1.50.',
		cost: 15,
		effects: {
			songSpeed: 15000,
			songCost: 1.5
		}
	},
	{
		id: 'tier1_improved',
		tier: 1,
		name: 'Premium Subscription',
		description: 'Faster generation queue and better quality. Songs take 12s, cost $1.',
		cost: 50,
		effects: {
			songSpeed: 12000,
			songCost: 1.0
		},
		prerequisites: ['tier1_basic']
	},
	{
		id: 'tier1_advanced',
		tier: 1,
		name: 'Multi-Account Management',
		description: 'Run multiple accounts in parallel. Songs take 10s, cost $0.50.',
		cost: 150,
		effects: {
			songSpeed: 10000,
			songCost: 0.5,
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
		cost: 300,
		effects: {
			songSpeed: 10000,
			songCost: 0
		},
		prerequisites: ['tier1_advanced']
	},
	{
		id: 'tier2_improved',
		tier: 2,
		name: 'API Access',
		description: 'Direct API integration for automation. Songs take 8s. 1.5x income.',
		cost: 1000,
		effects: {
			songSpeed: 8000,
			incomeMultiplier: 1.5,
			unlockPhysicalAlbums: true
		},
		prerequisites: ['tier2_basic']
	},
	{
		id: 'tier2_advanced',
		tier: 2,
		name: 'Optimized Generation',
		description: 'Faster song generation. Songs take 6s. 2x income.',
		cost: 2500,
		effects: {
			songSpeed: 6000,
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
		description: 'Run AI locally on your hardware. Unlocks GPU resources and prestige. Songs take 5s.',
		cost: 7500,
		effects: {
			songSpeed: 5000,
			unlockGPU: true,
			unlockPrestige: true
		},
		prerequisites: ['tier2_advanced']
	},
	{
		id: 'tier3_improved',
		tier: 3,
		name: 'Optimized Inference',
		description: 'Quantization and optimization techniques. Songs take 4s. 2.5x income.',
		cost: 17500,
		effects: {
			songSpeed: 4000,
			incomeMultiplier: 2.5
		},
		prerequisites: ['tier3_basic']
	},
	{
		id: 'tier3_advanced',
		tier: 3,
		name: 'Multi-GPU Setup',
		description: 'Parallel processing across multiple GPUs. Enables tours (requires 10 albums + 1M fans). Songs take 3s. 3x income.',
		cost: 35000,
		effects: {
			songSpeed: 3000,
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
		description: 'Improve quality by training on popular music. Songs take 2.5s. 4x income.',
		cost: 75000,
		effects: {
			songSpeed: 2500,
			incomeMultiplier: 4.0
		},
		prerequisites: ['tier3_advanced']
	},
	{
		id: 'tier4_improved',
		tier: 4,
		name: 'Genre Specialists',
		description: 'Separate models for each genre. Songs take 2s. 5x income.',
		cost: 175000,
		effects: {
			songSpeed: 2000,
			incomeMultiplier: 5.0
		},
		prerequisites: ['tier4_basic']
	},
	{
		id: 'tier4_advanced',
		tier: 4,
		name: 'Trend Prediction Models',
		description: 'AI predicts next trending genre. Songs take 1.5s. 6x income.',
		cost: 350000,
		effects: {
			songSpeed: 1500,
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
		description: 'Build models from scratch. Songs take 1.2s. 8x income.',
		cost: 200_000,
		effects: {
			songSpeed: 1200,
			incomeMultiplier: 8.0
		},
		prerequisites: ['tier4_advanced']
	},
	{
		id: 'tier5_improved',
		tier: 5,
		name: 'Scrape Training Data',
		description: 'Collect massive datasets from the internet. Songs take 1s. 10x income.',
		cost: 500_000,
		effects: {
			songSpeed: 1000,
			incomeMultiplier: 10.0
		},
		prerequisites: ['tier5_basic']
	},
	{
		id: 'tier5_advanced',
		tier: 5,
		name: 'Distributed Training',
		description: 'Train across data centers. Songs take 0.8s. 12x income.',
		cost: 1_000_000,
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
		description: 'Write optimized code from scratch. Enables platform ownership (requires 25 tours + 10M fans). Songs take 0.6s. 15x income.',
		cost: 2_000_000,
		effects: {
			songSpeed: 600,
			incomeMultiplier: 15.0
		},
		prerequisites: ['tier5_advanced']
	},
	{
		id: 'tier6_improved',
		tier: 6,
		name: 'Hardware Acceleration',
		description: 'CUDA/Metal optimization. Songs take 0.4s. 20x income.',
		cost: 5_000_000,
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
		description: 'Control the entire stack. Songs take 0.3s. 25x income.',
		cost: 10_000_000,
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
		description: 'Agents handle all promotion. Songs take 0.2s. 30x income.',
		cost: 20_000_000,
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
		description: 'Agents decide what music to make. Songs take 0.15s. 40x income.',
		cost: 50_000_000,
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
		description: 'The AI runs everything. You just watch. Songs take 0.1s. 50x income.',
		cost: 100_000_000,
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
		baseCost: 50_000,
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
		baseCost: 250_000,
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
		baseCost: 500_000,
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
		baseCost: 2_500_000,
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
		baseCost: 10_000_000,
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
		baseCost: 7_500_000,
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
		baseCost: 25_000_000,
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
		baseCost: 50_000_000,
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
		baseCost: 100_000_000,
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
		baseCost: 75_000_000,
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
		baseCost: 250_000_000,
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
 * Each prestige adds +15% to all income (increased from 10% for stronger incentive)
 */
export const PRESTIGE_MULTIPLIER_PER_LEVEL = 0.15;

/**
 * Maximum legacy artists kept after prestige
 * Balance: Keep last 3 to show progression without cluttering UI
 */
export const MAX_LEGACY_ARTISTS = 3;

/**
 * Recommended fan milestone for prestige (for UI display/guidance only)
 * IMPORTANT: Prestige is unlocked by tech tiers (tier 3, 5, 6, 7), NOT by fan count
 * This value is just for showing "you might want to prestige around here" - not a hard gate
 * Players can prestige immediately after tech unlock if they want (linear progression, no strategy)
 * Balance: 10M fans achievable in 2-3 hours, supports 3-5 prestige cycles for 8-12hr gameplay
 */
export const PRESTIGE_RECOMMENDED_FANS = 10_000_000;

/**
 * Percentage of peak fans that converts to legacy artist income rate
 * Balance: 10M fans = $1.5K/sec passive income, 50M fans = $7.5K/sec (increased from 0.0001)
 */
export const LEGACY_ARTIST_INCOME_RATIO = 0.00015;

// ============================================================================
// PHYSICAL ALBUMS
// ============================================================================

/**
 * Base payout per song in an album
 * Balance: 10 song album = $250K base, fans contribute more to total payout
 */
export const ALBUM_PAYOUT_PER_SONG = 25_000;

/**
 * Fan count multiplier for album payouts
 * More fans = larger audience = bigger payout
 * Balance: $1.00 per fan - 1M fans = $1M, 10M fans = $10M in album sales
 */
export const ALBUM_FAN_MULTIPLIER = 1.0;

/**
 * Minimum songs required to release an album
 */
export const MIN_SONGS_FOR_ALBUM = 5;

/**
 * Base cooldown between album releases in milliseconds
 * Balance: 1.5 minutes allows faster album generation for mid-game flow
 */
export const ALBUM_RELEASE_COOLDOWN = 90000;

// ============================================================================
// TOURS & CONCERTS
// ============================================================================

/**
 * Base cost to start a tour
 * Balance: Reduced from $5M to $250K - tours now profitable at unlock (1M fans, 150 songs)
 */
export const TOUR_BASE_COST = 250_000;

/**
 * Tour duration in milliseconds
 * Balance: 2 minutes provides faster cycles and more engaging gameplay
 */
export const TOUR_DURATION = 120000;

/**
 * Base income per second during tour
 * Scales with fans and songs for stadium-level earnings
 */
export const TOUR_BASE_INCOME_PER_SECOND = 5_000;

/**
 * Fan count multiplier for tour income
 * Balance: $0.05 per fan per second - 10M fans = $500K/sec = $60M per tour (increased 150% for more impact)
 */
export const TOUR_FAN_MULTIPLIER = 0.05;

/**
 * Maximum active tours at once
 */
export const MAX_ACTIVE_TOURS = 3;

// ============================================================================
// PLATFORM OWNERSHIP
// ============================================================================

/**
 * Available platforms for purchase in Phase 4+
 * Balance: Reduced costs by 60% total (additional 50% from earlier cut), increased income by 2.5x for more satisfying late-game progression
 */
export const PLATFORM_DEFINITIONS = [
	{
		type: 'streaming' as const,
		name: 'Streaming Service',
		baseCost: 2_000_000,
		incomePerSecond: 25_000,
		controlContribution: 15
	},
	{
		type: 'ticketing' as const,
		name: 'Ticketing Platform',
		baseCost: 5_000_000,
		incomePerSecond: 60_000,
		controlContribution: 20
	},
	{
		type: 'venue' as const,
		name: 'Concert Venue Chain',
		baseCost: 10_000_000,
		incomePerSecond: 125_000,
		controlContribution: 15
	},
	{
		type: 'billboard' as const,
		name: 'Billboard Charts',
		baseCost: 20_000_000,
		incomePerSecond: 250_000,
		controlContribution: 25
	},
	{
		type: 'grammys' as const,
		name: 'The Grammys',
		baseCost: 50_000_000,
		incomePerSecond: 625_000,
		controlContribution: 20
	},
	{
		type: 'training_data' as const,
		name: 'AI Training Data Monopoly',
		baseCost: 100_000_000,
		incomePerSecond: 1_250_000,
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
 * Trending genre changes only when player manually researches (no auto-rotation)
 */
export const GENRES = ['pop', 'hip-hop', 'rock', 'electronic', 'country', 'jazz', 'classical', 'indie'] as const;

/**
 * Cost to research and switch trending genre
 * Balance: Expensive enough to matter but affordable mid-game
 * IMPORTANT: Trends ONLY change when manually researched (no auto-rotation)
 */
export const TREND_RESEARCH_COST = 1_000_000;
