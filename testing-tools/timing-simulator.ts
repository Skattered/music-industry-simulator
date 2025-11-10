/**
 * Timing & Numbers Testing Tool
 *
 * Standalone system to test how different game states affect time-to-purchase
 * for all purchasables in the game.
 *
 * Usage:
 *   const simulator = new TimingSimulator();
 *   simulator.setFans(1_000_000);
 *   simulator.setSongs(100);
 *   simulator.addUpgrade('tier3_basic');
 *   const report = simulator.analyze();
 *   console.log(report.formatReport());
 */

import type { GameState, TechTier, Genre, Tour } from '../src/lib/game/types';
import {
	GAME_VERSION,
	INITIAL_MONEY,
	INITIAL_FANS,
	INITIAL_GPU,
	INITIAL_TECH_TIER,
	INITIAL_TECH_SUB_TIER,
	INITIAL_PHASE,
	INITIAL_INDUSTRY_CONTROL,
	INITIAL_PRESTIGE_COUNT,
	INITIAL_EXPERIENCE_MULTIPLIER,
	BASE_SONG_GENERATION_TIME,
	INITIAL_UNLOCKED_SYSTEMS,
	UPGRADES,
	BOOSTS,
	PLATFORM_DEFINITIONS,
	PRESTIGE_MULTIPLIER_PER_LEVEL,
	BASE_INCOME_PER_SONG,
	BASE_FAN_GENERATION_RATE,
	TRENDING_MULTIPLIER,
	TOUR_BASE_COST,
	TOUR_DURATION,
	TOUR_BASE_INCOME_PER_SECOND,
	TOUR_FAN_MULTIPLIER,
	TREND_RESEARCH_COST
} from '../src/lib/game/config';
import { calculateTotalIncome } from '../src/lib/systems/income';
import { getCurrentSongCost, calculateSongCost } from '../src/lib/systems/songs';
import { getTechIncomeMultiplier } from '../src/lib/systems/tech';
import { calculateTourIncomePerSecond, getTourCost } from '../src/lib/systems/tours';

// ============================================================================
// SIMULATOR CONFIGURATION
// ============================================================================

/**
 * Configuration for the timing simulator
 */
export interface SimulatorConfig {
	/** Current money balance */
	money: number;
	/** Number of fans */
	fans: number;
	/** Number of completed songs */
	songCount: number;
	/** Number of released albums */
	albumCount: number;
	/** Number of completed tours */
	completedTourCount: number;
	/** Number of active tours */
	activeTourCount: number;
	/** Prestige count */
	prestigeCount: number;
	/** List of purchased upgrade IDs */
	purchasedUpgrades: string[];
	/** List of owned platform IDs */
	ownedPlatforms: string[];
	/** Current trending genre (if unlocked) */
	trendingGenre: Genre | null;
	/** Whether trend research is unlocked */
	hasTrendResearch: boolean;
}

/**
 * Default simulator configuration
 */
export const DEFAULT_CONFIG: SimulatorConfig = {
	money: INITIAL_MONEY,
	fans: INITIAL_FANS,
	songCount: 0,
	albumCount: 0,
	completedTourCount: 0,
	activeTourCount: 0,
	prestigeCount: INITIAL_PRESTIGE_COUNT,
	purchasedUpgrades: [],
	ownedPlatforms: [],
	trendingGenre: null,
	hasTrendResearch: false
};

// ============================================================================
// PURCHASABLE TYPES
// ============================================================================

/**
 * Represents a purchasable item in the game
 */
export interface Purchasable {
	/** Unique identifier */
	id: string;
	/** Display name */
	name: string;
	/** Category (upgrade, tour, platform, boost, etc.) */
	category: 'song' | 'upgrade' | 'tour' | 'platform' | 'boost' | 'trend_research';
	/** Cost in dollars */
	cost: number;
	/** Whether this item can currently be purchased */
	available: boolean;
	/** Reason why item is not available (if applicable) */
	unavailableReason?: string;
	/** Time to purchase in seconds (null if cannot afford with current income) */
	timeToAfford: number | null;
}

/**
 * Analysis report containing all timing data
 */
export interface AnalysisReport {
	/** Current game state snapshot */
	state: SimulatorConfig;
	/** Current income per second */
	incomePerSecond: number;
	/** Breakdown of income by source */
	incomeBreakdown: {
		songs: number;
		tours: number;
		platforms: number;
		legacyArtists: number;
	};
	/** All purchasables with timing data */
	purchasables: Purchasable[];
	/** Timestamp of analysis */
	timestamp: number;
}

// ============================================================================
// TIMING SIMULATOR CLASS
// ============================================================================

/**
 * Main timing simulator for testing game progression
 */
export class TimingSimulator {
	private config: SimulatorConfig;
	private gameState: GameState;

	constructor(config: SimulatorConfig = DEFAULT_CONFIG) {
		this.config = { ...config };
		this.gameState = this.buildGameState();
	}

	// ============================================================================
	// CONFIGURATION METHODS
	// ============================================================================

	/**
	 * Set current money balance
	 */
	setMoney(amount: number): this {
		this.config.money = amount;
		this.gameState = this.buildGameState();
		return this;
	}

	/**
	 * Set number of fans
	 */
	setFans(count: number): this {
		this.config.fans = count;
		this.gameState = this.buildGameState();
		return this;
	}

	/**
	 * Set number of completed songs
	 */
	setSongs(count: number): this {
		this.config.songCount = count;
		this.gameState = this.buildGameState();
		return this;
	}

	/**
	 * Set number of released albums
	 */
	setAlbums(count: number): this {
		this.config.albumCount = count;
		this.gameState = this.buildGameState();
		return this;
	}

	/**
	 * Set number of completed tours
	 */
	setCompletedTours(count: number): this {
		this.config.completedTourCount = count;
		this.gameState = this.buildGameState();
		return this;
	}

	/**
	 * Set number of active tours
	 */
	setActiveTours(count: number): this {
		this.config.activeTourCount = count;
		this.gameState = this.buildGameState();
		return this;
	}

	/**
	 * Set prestige count
	 */
	setPrestigeCount(count: number): this {
		this.config.prestigeCount = count;
		this.gameState = this.buildGameState();
		return this;
	}

	/**
	 * Add a purchased upgrade by ID
	 */
	addUpgrade(upgradeId: string): this {
		if (!this.config.purchasedUpgrades.includes(upgradeId)) {
			this.config.purchasedUpgrades.push(upgradeId);
			this.gameState = this.buildGameState();
		}
		return this;
	}

	/**
	 * Add multiple purchased upgrades by ID
	 */
	addUpgrades(upgradeIds: string[]): this {
		for (const id of upgradeIds) {
			if (!this.config.purchasedUpgrades.includes(id)) {
				this.config.purchasedUpgrades.push(id);
			}
		}
		this.gameState = this.buildGameState();
		return this;
	}

	/**
	 * Add an owned platform by ID
	 */
	addPlatform(platformId: string): this {
		if (!this.config.ownedPlatforms.includes(platformId)) {
			this.config.ownedPlatforms.push(platformId);
			this.gameState = this.buildGameState();
		}
		return this;
	}

	/**
	 * Set trending genre (requires trend research unlocked)
	 */
	setTrendingGenre(genre: Genre | null): this {
		this.config.trendingGenre = genre;
		this.gameState = this.buildGameState();
		return this;
	}

	/**
	 * Reset to default configuration
	 */
	reset(): this {
		this.config = { ...DEFAULT_CONFIG };
		this.gameState = this.buildGameState();
		return this;
	}

	/**
	 * Load a configuration
	 */
	loadConfig(config: SimulatorConfig): this {
		this.config = { ...config };
		this.gameState = this.buildGameState();
		return this;
	}

	/**
	 * Get current configuration
	 */
	getConfig(): SimulatorConfig {
		return { ...this.config };
	}

	// ============================================================================
	// GAME STATE BUILDING
	// ============================================================================

	/**
	 * Build a GameState object from current configuration
	 */
	private buildGameState(): GameState {
		const now = Date.now();

		// Calculate tech tier from upgrades
		const { tier, subTier } = this.calculateTechTier();

		// Calculate experience multiplier from prestige
		const experienceMultiplier = 1.0 + (this.config.prestigeCount * PRESTIGE_MULTIPLIER_PER_LEVEL);

		// Build songs array
		const songs = this.buildSongs();

		// Build tours array
		const tours = this.buildTours();

		// Build platforms array
		const platforms = this.buildPlatforms();

		// Build upgrades record
		const upgrades: Record<string, { purchasedAt: number; tier: TechTier }> = {};
		for (const upgradeId of this.config.purchasedUpgrades) {
			const upgrade = UPGRADES.find(u => u.id === upgradeId);
			if (upgrade) {
				upgrades[upgradeId] = {
					purchasedAt: now,
					tier: upgrade.tier
				};
			}
		}

		// Determine unlocked systems
		const unlockedSystems = this.determineUnlockedSystems();

		// Calculate song generation speed
		const songGenerationSpeed = this.calculateSongGenerationSpeed();

		const state: GameState = {
			money: this.config.money,
			songs,
			fans: this.config.fans,
			gpu: INITIAL_GPU,
			phase: INITIAL_PHASE,
			industryControl: INITIAL_INDUSTRY_CONTROL,
			currentArtist: {
				name: 'Test Artist',
				songs: this.config.songCount,
				fans: this.config.fans,
				peakFans: this.config.fans,
				createdAt: now
			},
			legacyArtists: [],
			songQueue: [],
			songGenerationSpeed,
			currentTrendingGenre: this.config.trendingGenre,
			trendDiscoveredAt: this.config.trendingGenre ? now : null,
			techTier: tier,
			techSubTier: subTier,
			upgrades,
			activeBoosts: [],
			boostUsageCounts: {},
			physicalAlbums: [],
			tours,
			ownedPlatforms: platforms,
			prestigeCount: this.config.prestigeCount,
			experienceMultiplier,
			unlockedSystems,
			lastUpdate: now,
			createdAt: now,
			version: GAME_VERSION
		};

		return state;
	}

	/**
	 * Build songs array based on configuration
	 */
	private buildSongs() {
		const songs = [];
		const incomeMultiplier = getTechIncomeMultiplier(this.gameState || this.buildMockState());
		const experienceMultiplier = 1.0 + (this.config.prestigeCount * PRESTIGE_MULTIPLIER_PER_LEVEL);

		for (let i = 0; i < this.config.songCount; i++) {
			const isTrending = this.config.trendingGenre !== null;
			let incomePerSecond = BASE_INCOME_PER_SONG * incomeMultiplier * experienceMultiplier;

			if (isTrending) {
				incomePerSecond *= TRENDING_MULTIPLIER;
			}

			songs.push({
				id: `song-${i}`,
				name: `Test Song ${i + 1}`,
				genre: this.config.trendingGenre || 'pop' as Genre,
				createdAt: Date.now(),
				incomePerSecond,
				fanGenerationRate: BASE_FAN_GENERATION_RATE,
				isTrending
			});
		}

		return songs;
	}

	/**
	 * Build tours array based on configuration
	 */
	private buildTours(): Tour[] {
		const tours: Tour[] = [];
		const now = Date.now();

		// Add completed tours
		for (let i = 0; i < this.config.completedTourCount; i++) {
			tours.push({
				id: `tour-completed-${i}`,
				name: `Completed Tour ${i + 1}`,
				startedAt: now - TOUR_DURATION - 1000,
				completedAt: now - 1000,
				incomePerSecond: 0,
				usesScarcity: false
			});
		}

		// Add active tours
		const experienceMultiplier = 1.0 + (this.config.prestigeCount * PRESTIGE_MULTIPLIER_PER_LEVEL);
		let incomePerSecond = TOUR_BASE_INCOME_PER_SECOND;
		incomePerSecond += this.config.fans * TOUR_FAN_MULTIPLIER;
		incomePerSecond += this.config.songCount * 100;
		incomePerSecond *= experienceMultiplier;

		for (let i = 0; i < this.config.activeTourCount; i++) {
			tours.push({
				id: `tour-active-${i}`,
				name: `Active Tour ${i + 1}`,
				startedAt: now - 30000, // Started 30 seconds ago
				completedAt: null,
				incomePerSecond,
				usesScarcity: false
			});
		}

		return tours;
	}

	/**
	 * Build platforms array based on configuration
	 */
	private buildPlatforms() {
		const platforms = [];
		const now = Date.now();

		for (const platformId of this.config.ownedPlatforms) {
			const def = PLATFORM_DEFINITIONS.find(p => p.type === platformId);
			if (def) {
				platforms.push({
					id: platformId,
					type: def.type,
					name: def.name,
					cost: def.baseCost,
					acquiredAt: now,
					incomePerSecond: def.incomePerSecond,
					controlContribution: def.controlContribution
				});
			}
		}

		return platforms;
	}

	/**
	 * Build a minimal mock state for calculations that need a state object
	 */
	private buildMockState(): GameState {
		const now = Date.now();
		const upgrades: Record<string, { purchasedAt: number; tier: TechTier }> = {};

		for (const upgradeId of this.config.purchasedUpgrades) {
			const upgrade = UPGRADES.find(u => u.id === upgradeId);
			if (upgrade) {
				upgrades[upgradeId] = {
					purchasedAt: now,
					tier: upgrade.tier
				};
			}
		}

		return {
			money: 0,
			songs: [],
			fans: 0,
			gpu: 0,
			phase: 1,
			industryControl: 0,
			currentArtist: {
				name: 'Test',
				songs: 0,
				fans: 0,
				peakFans: 0,
				createdAt: now
			},
			legacyArtists: [],
			songQueue: [],
			songGenerationSpeed: BASE_SONG_GENERATION_TIME,
			currentTrendingGenre: null,
			trendDiscoveredAt: null,
			techTier: 1,
			techSubTier: 0,
			upgrades,
			activeBoosts: [],
			boostUsageCounts: {},
			physicalAlbums: [],
			tours: [],
			ownedPlatforms: [],
			prestigeCount: 0,
			experienceMultiplier: 1.0,
			unlockedSystems: INITIAL_UNLOCKED_SYSTEMS,
			lastUpdate: now,
			createdAt: now,
			version: GAME_VERSION
		};
	}

	/**
	 * Calculate tech tier from purchased upgrades
	 */
	private calculateTechTier(): { tier: TechTier; subTier: 0 | 1 | 2 } {
		let highestTier: TechTier = 1;
		let subTier: 0 | 1 | 2 = 0;

		// Count upgrades per tier
		const tierCounts = new Map<TechTier, number>();

		for (const upgradeId of this.config.purchasedUpgrades) {
			const upgrade = UPGRADES.find(u => u.id === upgradeId);
			if (upgrade) {
				const count = tierCounts.get(upgrade.tier) || 0;
				tierCounts.set(upgrade.tier, count + 1);
				highestTier = Math.max(highestTier, upgrade.tier) as TechTier;
			}
		}

		// Determine sub-tier for highest tier
		const highestTierCount = tierCounts.get(highestTier) || 0;
		if (highestTierCount >= 3) {
			subTier = 2;
		} else if (highestTierCount >= 2) {
			subTier = 1;
		} else if (highestTierCount >= 1) {
			subTier = 0;
		}

		return { tier: highestTier, subTier };
	}

	/**
	 * Calculate song generation speed from upgrades
	 */
	private calculateSongGenerationSpeed(): number {
		let speed = BASE_SONG_GENERATION_TIME;

		for (const upgradeId of this.config.purchasedUpgrades) {
			const upgrade = UPGRADES.find(u => u.id === upgradeId);
			if (upgrade?.effects.songSpeed !== undefined) {
				speed = Math.min(speed, upgrade.effects.songSpeed);
			}
		}

		return speed;
	}

	/**
	 * Determine which systems are unlocked based on upgrades
	 */
	private determineUnlockedSystems() {
		const systems = { ...INITIAL_UNLOCKED_SYSTEMS };

		for (const upgradeId of this.config.purchasedUpgrades) {
			const upgrade = UPGRADES.find(u => u.id === upgradeId);
			if (upgrade) {
				if (upgrade.effects.unlockGPU) systems.gpu = true;
				if (upgrade.effects.unlockPrestige) systems.prestige = true;
				if (upgrade.effects.unlockPhysicalAlbums) systems.physicalAlbums = true;
				if (upgrade.effects.unlockTours) systems.tours = true;
				if (upgrade.effects.unlockPlatformOwnership) systems.platformOwnership = true;
				if (upgrade.effects.unlockMonopoly) systems.monopoly = true;
				if (upgrade.effects.unlockTrendResearch) systems.trendResearch = true;
			}
		}

		return systems;
	}

	// ============================================================================
	// ANALYSIS METHODS
	// ============================================================================

	/**
	 * Analyze current configuration and generate timing report
	 */
	analyze(): AnalysisReport {
		// Calculate income per second
		const incomePerSecond = calculateTotalIncome(this.gameState);

		// Calculate income breakdown
		const incomeBreakdown = this.calculateIncomeBreakdown();

		// Get all purchasables
		const purchasables = this.getAllPurchasables(incomePerSecond);

		return {
			state: this.getConfig(),
			incomePerSecond,
			incomeBreakdown,
			purchasables,
			timestamp: Date.now()
		};
	}

	/**
	 * Calculate breakdown of income by source
	 */
	private calculateIncomeBreakdown() {
		// Song income
		let songIncome = 0;
		for (const song of this.gameState.songs) {
			songIncome += song.incomePerSecond;
		}

		// Apply multipliers to song income
		const upgradeMultiplier = getTechIncomeMultiplier(this.gameState);
		songIncome *= upgradeMultiplier * this.gameState.experienceMultiplier;

		// Tour income
		let tourIncome = 0;
		for (const tour of this.gameState.tours) {
			if (tour.completedAt === null) {
				tourIncome += tour.incomePerSecond;
			}
		}

		// Platform income
		let platformIncome = 0;
		for (const platform of this.gameState.ownedPlatforms) {
			platformIncome += platform.incomePerSecond;
		}

		// Legacy artist income
		let legacyIncome = 0;
		for (const artist of this.gameState.legacyArtists) {
			legacyIncome += artist.incomeRate;
		}

		return {
			songs: songIncome,
			tours: tourIncome,
			platforms: platformIncome,
			legacyArtists: legacyIncome
		};
	}

	/**
	 * Get all purchasables with timing data
	 */
	private getAllPurchasables(incomePerSecond: number): Purchasable[] {
		const purchasables: Purchasable[] = [];

		// Add song purchases
		purchasables.push(...this.getSongPurchasables(incomePerSecond));

		// Add tech upgrades
		purchasables.push(...this.getUpgradePurchasables(incomePerSecond));

		// Add tours
		purchasables.push(...this.getTourPurchasables(incomePerSecond));

		// Add platforms
		purchasables.push(...this.getPlatformPurchasables(incomePerSecond));

		// Add boosts
		purchasables.push(...this.getBoostPurchasables(incomePerSecond));

		// Add trend research
		if (this.gameState.unlockedSystems.trendResearch) {
			purchasables.push(...this.getTrendResearchPurchasables(incomePerSecond));
		}

		return purchasables;
	}

	/**
	 * Get song purchasables (1x, 10x, 100x)
	 */
	private getSongPurchasables(incomePerSecond: number): Purchasable[] {
		const songCost = getCurrentSongCost(this.gameState);
		const purchasables: Purchasable[] = [];

		for (const quantity of [1, 10, 100]) {
			const totalCost = songCost * quantity;
			const timeToAfford = this.calculateTimeToAfford(totalCost, incomePerSecond);

			purchasables.push({
				id: `song-${quantity}x`,
				name: `${quantity}x Song${quantity > 1 ? 's' : ''}`,
				category: 'song',
				cost: totalCost,
				available: true,
				timeToAfford
			});
		}

		return purchasables;
	}

	/**
	 * Get tech upgrade purchasables
	 */
	private getUpgradePurchasables(incomePerSecond: number): Purchasable[] {
		const purchasables: Purchasable[] = [];

		for (const upgrade of UPGRADES) {
			const alreadyPurchased = this.config.purchasedUpgrades.includes(upgrade.id);

			if (alreadyPurchased) {
				continue;
			}

			// Check prerequisites
			let available = true;
			let unavailableReason: string | undefined;

			if (upgrade.prerequisites && upgrade.prerequisites.length > 0) {
				const missingPrereqs = upgrade.prerequisites.filter(
					prereq => !this.config.purchasedUpgrades.includes(prereq)
				);

				if (missingPrereqs.length > 0) {
					available = false;
					unavailableReason = `Requires: ${missingPrereqs.join(', ')}`;
				}
			}

			const timeToAfford = available
				? this.calculateTimeToAfford(upgrade.cost, incomePerSecond)
				: null;

			purchasables.push({
				id: upgrade.id,
				name: upgrade.name,
				category: 'upgrade',
				cost: upgrade.cost,
				available,
				unavailableReason,
				timeToAfford
			});
		}

		return purchasables;
	}

	/**
	 * Get tour purchasables
	 */
	private getTourPurchasables(incomePerSecond: number): Purchasable[] {
		const tourCost = getTourCost(this.gameState);
		const available = this.gameState.unlockedSystems.tours;
		const timeToAfford = available
			? this.calculateTimeToAfford(tourCost, incomePerSecond)
			: null;

		return [{
			id: 'tour',
			name: 'Start Tour',
			category: 'tour',
			cost: tourCost,
			available,
			unavailableReason: available ? undefined : 'Tours not unlocked',
			timeToAfford
		}];
	}

	/**
	 * Get platform purchasables
	 */
	private getPlatformPurchasables(incomePerSecond: number): Purchasable[] {
		const purchasables: Purchasable[] = [];

		for (const platform of PLATFORM_DEFINITIONS) {
			const alreadyOwned = this.config.ownedPlatforms.includes(platform.type);

			if (alreadyOwned) {
				continue;
			}

			const available = this.gameState.unlockedSystems.platformOwnership;
			const timeToAfford = available
				? this.calculateTimeToAfford(platform.baseCost, incomePerSecond)
				: null;

			purchasables.push({
				id: platform.type,
				name: platform.name,
				category: 'platform',
				cost: platform.baseCost,
				available,
				unavailableReason: available ? undefined : 'Platform ownership not unlocked',
				timeToAfford
			});
		}

		return purchasables;
	}

	/**
	 * Get boost purchasables
	 */
	private getBoostPurchasables(incomePerSecond: number): Purchasable[] {
		const purchasables: Purchasable[] = [];

		for (const boost of BOOSTS) {
			// Calculate cost based on usage count (scaling)
			const usageCount = this.gameState.boostUsageCounts[boost.id] || 0;
			const cost = boost.baseCost * Math.pow(boost.costScaling, usageCount);

			const timeToAfford = this.calculateTimeToAfford(cost, incomePerSecond);

			purchasables.push({
				id: boost.id,
				name: boost.name,
				category: 'boost',
				cost,
				available: true,
				timeToAfford
			});
		}

		return purchasables;
	}

	/**
	 * Get trend research purchasables
	 */
	private getTrendResearchPurchasables(incomePerSecond: number): Purchasable[] {
		const timeToAfford = this.calculateTimeToAfford(TREND_RESEARCH_COST, incomePerSecond);

		return [{
			id: 'trend_research',
			name: 'Research Trending Genre',
			category: 'trend_research',
			cost: TREND_RESEARCH_COST,
			available: true,
			timeToAfford
		}];
	}

	/**
	 * Calculate time to afford a purchase
	 */
	private calculateTimeToAfford(cost: number, incomePerSecond: number): number | null {
		const currentMoney = this.config.money;

		// Already can afford
		if (currentMoney >= cost) {
			return 0;
		}

		// No income - cannot afford
		if (incomePerSecond <= 0) {
			return null;
		}

		// Calculate time needed
		const moneyNeeded = cost - currentMoney;
		const timeInSeconds = moneyNeeded / incomePerSecond;

		return timeInSeconds;
	}

	// ============================================================================
	// REPORT FORMATTING
	// ============================================================================

	/**
	 * Format analysis report as readable text
	 */
	formatReport(report: AnalysisReport): string {
		const lines: string[] = [];

		lines.push('='.repeat(80));
		lines.push('TIMING & NUMBERS ANALYSIS REPORT');
		lines.push('='.repeat(80));
		lines.push('');

		// Current state
		lines.push('CURRENT STATE:');
		lines.push(`  Money: $${this.formatMoney(report.state.money)}`);
		lines.push(`  Fans: ${this.formatNumber(report.state.fans)}`);
		lines.push(`  Songs: ${report.state.songCount}`);
		lines.push(`  Albums: ${report.state.albumCount}`);
		lines.push(`  Tours (Completed): ${report.state.completedTourCount}`);
		lines.push(`  Tours (Active): ${report.state.activeTourCount}`);
		lines.push(`  Prestige Count: ${report.state.prestigeCount}`);
		lines.push(`  Upgrades: ${report.state.purchasedUpgrades.length}`);
		lines.push(`  Platforms: ${report.state.ownedPlatforms.length}`);
		lines.push('');

		// Income breakdown
		lines.push('INCOME PER SECOND:');
		lines.push(`  Songs:          $${this.formatMoney(report.incomeBreakdown.songs)}/sec`);
		lines.push(`  Tours:          $${this.formatMoney(report.incomeBreakdown.tours)}/sec`);
		lines.push(`  Platforms:      $${this.formatMoney(report.incomeBreakdown.platforms)}/sec`);
		lines.push(`  Legacy Artists: $${this.formatMoney(report.incomeBreakdown.legacyArtists)}/sec`);
		lines.push(`  TOTAL:          $${this.formatMoney(report.incomePerSecond)}/sec`);
		lines.push('');

		// Time to purchase tables
		lines.push('TIME TO PURCHASE:');
		lines.push('');

		// Group by category
		const byCategory = new Map<string, Purchasable[]>();
		for (const p of report.purchasables) {
			const items = byCategory.get(p.category) || [];
			items.push(p);
			byCategory.set(p.category, items);
		}

		// Sort categories
		const categoryOrder = ['song', 'upgrade', 'tour', 'platform', 'boost', 'trend_research'];
		const categoryNames = {
			song: 'SONGS',
			upgrade: 'TECH UPGRADES',
			tour: 'TOURS',
			platform: 'PLATFORMS',
			boost: 'BOOSTS',
			trend_research: 'TREND RESEARCH'
		};

		for (const category of categoryOrder) {
			const items = byCategory.get(category);
			if (!items || items.length === 0) continue;

			lines.push(`${categoryNames[category as keyof typeof categoryNames]}:`);

			// Sort by time to afford (null at end)
			items.sort((a, b) => {
				if (a.timeToAfford === null) return 1;
				if (b.timeToAfford === null) return -1;
				return a.timeToAfford - b.timeToAfford;
			});

			for (const item of items) {
				const name = item.name.padEnd(40);
				const cost = `$${this.formatMoney(item.cost)}`.padStart(20);
				let time = '';

				if (!item.available) {
					time = `[LOCKED: ${item.unavailableReason}]`;
				} else if (item.timeToAfford === null) {
					time = '[NEVER - No income]';
				} else if (item.timeToAfford === 0) {
					time = '[NOW]';
				} else {
					time = this.formatTime(item.timeToAfford);
				}

				lines.push(`  ${name}  ${cost}  ${time}`);
			}

			lines.push('');
		}

		lines.push('='.repeat(80));

		return lines.join('\n');
	}

	/**
	 * Format money amount
	 */
	private formatMoney(amount: number): string {
		if (amount >= 1_000_000_000) {
			return `${(amount / 1_000_000_000).toFixed(2)}B`;
		} else if (amount >= 1_000_000) {
			return `${(amount / 1_000_000).toFixed(2)}M`;
		} else if (amount >= 1_000) {
			return `${(amount / 1_000).toFixed(2)}K`;
		}
		return amount.toFixed(2);
	}

	/**
	 * Format large number
	 */
	private formatNumber(num: number): string {
		if (num >= 1_000_000_000) {
			return `${(num / 1_000_000_000).toFixed(2)}B`;
		} else if (num >= 1_000_000) {
			return `${(num / 1_000_000).toFixed(2)}M`;
		} else if (num >= 1_000) {
			return `${(num / 1_000).toFixed(2)}K`;
		}
		return num.toString();
	}

	/**
	 * Format time duration
	 */
	private formatTime(seconds: number): string {
		if (seconds < 60) {
			return `${seconds.toFixed(1)}s`;
		} else if (seconds < 3600) {
			const minutes = seconds / 60;
			return `${minutes.toFixed(1)}m`;
		} else if (seconds < 86400) {
			const hours = seconds / 3600;
			return `${hours.toFixed(1)}h`;
		} else {
			const days = seconds / 86400;
			return `${days.toFixed(1)}d`;
		}
	}
}
