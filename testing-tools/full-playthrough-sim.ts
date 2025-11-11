/**
 * Full Playthrough Simulator
 *
 * This script simulates a complete playthrough from 0 to victory,
 * tracking time-to-milestone and identifying balance issues.
 *
 * Run with: npx tsx testing-tools/full-playthrough-sim.ts
 */

import { TimingSimulator, type SimulatorConfig } from './timing-simulator';
import { PHASE_REQUIREMENTS, UPGRADES, PLATFORM_DEFINITIONS } from '../src/lib/game/config';

interface Milestone {
	name: string;
	timeSeconds: number;
	money: number;
	fans: number;
	songs: number;
	income: number;
	description: string;
}

class PlaythroughSimulator {
	private config: SimulatorConfig;
	private currentTime: number = 0; // in seconds
	private milestones: Milestone[] = [];
	private targetPlaytimeHours: number = 10;

	constructor() {
		this.config = {
			money: 10,
			fans: 0,
			songCount: 0,
			albumCount: 0,
			completedTourCount: 0,
			activeTourCount: 0,
			prestigeCount: 0,
			purchasedUpgrades: [],
			ownedPlatforms: [],
			trendingGenre: null,
			hasTrendResearch: false
		};
	}

	/**
	 * Simulate time passing - update money and fans based on income
	 */
	private simulateTime(seconds: number): void {
		const sim = new TimingSimulator(this.config);
		const report = sim.analyze();
		const incomePerSecond = report.incomePerSecond;

		// Update time
		this.currentTime += seconds;

		// Update resources
		this.config.money += incomePerSecond * seconds;
		
		// Fan generation (20 fans/sec per song at base, with multipliers)
		const fanGenPerSecond = this.config.songCount * 20;  // Simplified
		this.config.fans += fanGenPerSecond * seconds;
	}

	/**
	 * Record a milestone
	 */
	private recordMilestone(name: string, description: string): void {
		const sim = new TimingSimulator(this.config);
		const report = sim.analyze();

		this.milestones.push({
			name,
			timeSeconds: this.currentTime,
			money: this.config.money,
			fans: this.config.fans,
			songs: this.config.songCount,
			income: report.incomePerSecond,
			description
		});

		console.log(`\n[${this.formatTime(this.currentTime)}] ${name}`);
		console.log(`  ${description}`);
		console.log(`  Money: $${this.formatMoney(this.config.money)}, Fans: ${this.formatNumber(this.config.fans)}, Songs: ${this.config.songCount}`);
		console.log(`  Income: $${this.formatMoney(report.incomePerSecond)}/sec`);
	}

	/**
	 * Wait until we can afford something
	 */
	private async waitUntilCanAfford(cost: number, description: string): Promise<void> {
		const sim = new TimingSimulator(this.config);
		const report = sim.analyze();

		if (this.config.money >= cost) {
			return; // Already can afford
		}

		const incomePerSecond = report.incomePerSecond;
		if (incomePerSecond <= 0) {
			throw new Error(`Cannot afford ${description} - no income!`);
		}

		const timeNeeded = (cost - this.config.money) / incomePerSecond;
		console.log(`  Waiting ${this.formatTime(timeNeeded)} to afford ${description}...`);
		this.simulateTime(timeNeeded);
	}

	/**
	 * Generate songs
	 */
	private generateSongs(count: number): void {
		// Songs cost money initially, then become free at tier 2
		const hasTier2 = this.config.purchasedUpgrades.some(id => id.startsWith('tier2_'));
		const songCost = hasTier2 ? 0 : 2; // Simplified
		
		this.config.money -= songCost * count;
		this.config.songCount += count;

		// Assume sequential generation takes some time (simplified - ignore generation time for now)
		// In real game this would be more complex
		this.simulateTime(count * 2); // Assume 2 seconds avg per song
	}

	/**
	 * Buy upgrade
	 */
	private async buyUpgrade(upgradeId: string): Promise<void> {
		const upgrade = UPGRADES.find(u => u.id === upgradeId);
		if (!upgrade) {
			throw new Error(`Unknown upgrade: ${upgradeId}`);
		}

		await this.waitUntilCanAfford(upgrade.cost, upgrade.name);
		this.config.money -= upgrade.cost;
		this.config.purchasedUpgrades.push(upgradeId);
		
		console.log(`  ✓ Purchased: ${upgrade.name} for $${this.formatMoney(upgrade.cost)}`);
	}

	/**
	 * Run a tour
	 */
	private runTour(): void {
		// Simplified - in real game tours take time
		this.config.completedTourCount++;
		this.simulateTime(120); // 2 minutes
	}

	/**
	 * Buy platform
	 */
	private async buyPlatform(platformId: string): Promise<void> {
		const platform = PLATFORM_DEFINITIONS.find(p => p.type === platformId);
		if (!platform) {
			throw new Error(`Unknown platform: ${platformId}`);
		}

		await this.waitUntilCanAfford(platform.baseCost, platform.name);
		this.config.money -= platform.baseCost;
		this.config.ownedPlatforms.push(platformId);
		
		console.log(`  ✓ Acquired: ${platform.name} for $${this.formatMoney(platform.baseCost)}`);
	}

	/**
	 * Perform prestige
	 */
	private prestige(reason: string): void {
		console.log(`\n  >>> PRESTIGE ${this.config.prestigeCount + 1} <<<`);
		console.log(`  Reason: ${reason}`);
		console.log(`  Current: ${this.formatNumber(this.config.fans)} fans, ${this.config.songCount} songs`);
		
		this.config.prestigeCount++;
		this.config.songCount = 0;
		this.config.albumCount = 0;
		this.config.money = 10; // Reset to starting money
		this.config.fans = 0;
		this.config.completedTourCount = 0;
		this.config.activeTourCount = 0;
		// Keep upgrades and platforms

		this.recordMilestone(`Prestige ${this.config.prestigeCount}`, `Reset to build faster with ${15 * this.config.prestigeCount}% income bonus`);
	}

	/**
	 * Main simulation
	 */
	async simulate(): Promise<void> {
		console.log('='.repeat(80));
		console.log('FULL PLAYTHROUGH SIMULATION');
		console.log('='.repeat(80));
		console.log('Target: 10-12 hours to victory');
		console.log('');

		this.recordMilestone('Game Start', 'Begin with $10');

		// =====================================================================
		// EARLY GAME: 0-1 hour - Build to Phase 2
		// =====================================================================
		console.log('\n' + '='.repeat(80));
		console.log('EARLY GAME: Building to Phase 2');
		console.log('='.repeat(80));

		// Generate initial songs
		this.generateSongs(5);
		this.recordMilestone('First 5 Songs', 'Manual song generation');

		// Wait a bit for income to build
		this.simulateTime(300); // 5 minutes
		this.generateSongs(10);

		// Buy tier 1 upgrades
		await this.buyUpgrade('tier1_basic');
		await this.buyUpgrade('tier1_improved');
		await this.buyUpgrade('tier1_advanced');
		this.recordMilestone('Tier 1 Complete', 'Unlocked trend research');

		// Build up to tier 2
		this.simulateTime(600); // 10 more minutes
		this.generateSongs(20);
		
		await this.buyUpgrade('tier2_basic');
		this.recordMilestone('FREE SONGS', 'Songs now cost $0');

		// Build more songs quickly since they\'re free
		this.generateSongs(30);
		this.simulateTime(300);
		
		await this.buyUpgrade('tier2_improved');
		await this.buyUpgrade('tier2_advanced');
		this.recordMilestone('Tier 2 Complete', 'Income multiplier 2.0x');

		// Generate songs to reach Phase 2 requirements
		while (this.config.songCount < 100 || this.config.fans < 100_000 || this.config.money < 100_000) {
			this.generateSongs(20);
			this.simulateTime(300);
		}

		this.recordMilestone('Phase 2 Unlocked', 'Physical Albums now available!');

		// Simulate album releases
		this.config.albumCount = Math.floor(this.config.songCount / 10);

		// =====================================================================
		// MID GAME PART 1: 1-3 hours - Build to Prestige & Phase 3
		// =====================================================================
		console.log('\n' + '='.repeat(80));
		console.log('MID GAME PART 1: Scaling up, Prestige preparation');
		console.log('='.repeat(80));

		// Push toward tier 3
		this.simulateTime(600);
		this.generateSongs(50);
		
		await this.buyUpgrade('tier3_basic');
		this.recordMilestone('Prestige Unlocked', 'Can now prestige - but should we?');

		// Build up more before prestiging
		await this.buyUpgrade('tier3_improved');
		await this.buyUpgrade('tier3_advanced');
		
		// Generate until we hit recommended prestige fans
		while (this.config.fans < 10_000_000) {
			this.generateSongs(50);
			this.simulateTime(600);
			this.config.albumCount = Math.floor(this.config.songCount / 10);
		}

		// PRESTIGE #1
		this.prestige('Reached 10M fans recommendation');

		// Rebuild faster with prestige bonus
		this.generateSongs(20);
		this.simulateTime(300);
		
		await this.buyUpgrade('tier1_basic');
		await this.buyUpgrade('tier1_improved');
		await this.buyUpgrade('tier1_advanced');
		await this.buyUpgrade('tier2_basic');
		await this.buyUpgrade('tier2_improved');
		await this.buyUpgrade('tier2_advanced');
		await this.buyUpgrade('tier3_basic');
		await this.buyUpgrade('tier3_improved');
		await this.buyUpgrade('tier3_advanced');

		// Build to Phase 3 requirements
		while (this.config.fans < 1_000_000 || this.config.albumCount < 10) {
			this.generateSongs(30);
			this.simulateTime(300);
			this.config.albumCount = Math.floor(this.config.songCount / 10);
		}

		this.recordMilestone('Phase 3 Unlocked', 'Tours now available!');

		// =====================================================================
		// MID GAME PART 2: 3-6 hours - Tours and Tier 4-5
		// =====================================================================
		console.log('\n' + '='.repeat(80));
		console.log('MID GAME PART 2: Tours and continued scaling');
		console.log('='.repeat(80));

		// Start running tours
		for (let i = 0; i < 10; i++) {
			this.runTour();
		}

		// Progress through tier 4
		await this.buyUpgrade('tier4_basic');
		await this.buyUpgrade('tier4_improved');
		await this.buyUpgrade('tier4_advanced');
		this.recordMilestone('Tier 4 Complete', 'Income scaling rapidly');

		// Build up for second prestige
		while (this.config.fans < 10_000_000) {
			this.generateSongs(50);
			this.simulateTime(300);
			for (let i = 0; i < 3; i++) this.runTour();
		}

		// PRESTIGE #2
		this.prestige('Second cycle at 10M fans');

		// Rapid rebuild with 2x prestige bonus
		this.generateSongs(50);
		await this.buyUpgrade('tier1_basic');
		await this.buyUpgrade('tier1_improved');
		await this.buyUpgrade('tier1_advanced');
		await this.buyUpgrade('tier2_basic');
		await this.buyUpgrade('tier2_improved');
		await this.buyUpgrade('tier2_advanced');
		await this.buyUpgrade('tier3_basic');
		await this.buyUpgrade('tier3_improved');
		await this.buyUpgrade('tier3_advanced');
		await this.buyUpgrade('tier4_basic');
		await this.buyUpgrade('tier4_improved');
		await this.buyUpgrade('tier4_advanced');

		// Push to tier 5
		await this.buyUpgrade('tier5_basic');
		await this.buyUpgrade('tier5_improved');
		await this.buyUpgrade('tier5_advanced');
		this.recordMilestone('Tier 5 Complete', 'Massive income scaling');

		// Build to Phase 4 requirements
		while (this.config.fans < 10_000_000 || this.config.completedTourCount < 25) {
			this.generateSongs(50);
			this.simulateTime(200);
			for (let i = 0; i < 5; i++) this.runTour();
		}

		this.recordMilestone('Phase 4 Unlocked', 'Platform ownership now available!');

		// =====================================================================
		// LATE GAME: 6-10 hours - Platforms and Victory
		// =====================================================================
		console.log('\n' + '='.repeat(80));
		console.log('LATE GAME: Platform ownership and industry control');
		console.log('='.repeat(80));

		// Push to tier 6
		await this.buyUpgrade('tier6_basic');
		await this.buyUpgrade('tier6_improved');
		await this.buyUpgrade('tier6_advanced');
		this.recordMilestone('Tier 6 Complete', 'Ready for platforms');

		// Buy first platform
		await this.buyPlatform('streaming');
		this.recordMilestone('First Platform', 'Streaming Service acquired!');

		// Continue building
		while (this.config.fans < 50_000_000 || this.config.ownedPlatforms.length < 3) {
			this.simulateTime(600);
			this.generateSongs(50);
			
			// Try to buy more platforms
			if (!this.config.ownedPlatforms.includes('ticketing') && this.config.money >= 12_500_000) {
				await this.buyPlatform('ticketing');
			}
			if (!this.config.ownedPlatforms.includes('venue') && this.config.money >= 25_000_000) {
				await this.buyPlatform('venue');
			}
		}

		this.recordMilestone('Phase 5 Requirements Met', 'Final phase unlocked!');

		// Push for tier 7
		await this.buyUpgrade('tier7_basic');
		await this.buyUpgrade('tier7_improved');
		await this.buyUpgrade('tier7_advanced');
		this.recordMilestone('Tier 7 Complete', 'Full automation achieved');

		// Buy remaining platforms
		const platformOrder = ['billboard', 'grammys', 'training_data'];
		for (const platformId of platformOrder) {
			if (!this.config.ownedPlatforms.includes(platformId)) {
				await this.buyPlatform(platformId);
			}
		}

		this.recordMilestone('VICTORY', '100% Industry Control Achieved!');

		// =====================================================================
		// FINAL REPORT
		// =====================================================================
		this.printFinalReport();
	}

	/**
	 * Print final analysis
	 */
	private printFinalReport(): void {
		console.log('\n\n');
		console.log('='.repeat(80));
		console.log('PLAYTHROUGH COMPLETE - FINAL ANALYSIS');
		console.log('='.repeat(80));
		console.log('');

		const totalHours = this.currentTime / 3600;
		const targetHours = this.targetPlaytimeHours;
		const deviation = ((totalHours - targetHours) / targetHours) * 100;

		console.log(`Total Time: ${this.formatTime(this.currentTime)} (${totalHours.toFixed(1)} hours)`);
		console.log(`Target Time: ${targetHours} hours`);
		console.log(`Deviation: ${deviation > 0 ? '+' : ''}${deviation.toFixed(1)}%`);
		console.log('');

		if (Math.abs(deviation) < 20) {
			console.log('✅ BALANCE GOOD - Within 20% of target');
		} else {
			console.log('❌ BALANCE ISSUE - More than 20% off target');
		}

		console.log('');
		console.log('Key Milestones:');
		console.log('-'.repeat(80));
		
		for (const milestone of this.milestones) {
			const hours = milestone.timeSeconds / 3600;
			console.log(`[${hours.toFixed(2)}h] ${milestone.name}`);
			console.log(`       ${milestone.description}`);
		}

		console.log('');
		console.log('Prestige Count: ' + this.config.prestigeCount);
		console.log('Final Income: $' + this.formatMoney(this.milestones[this.milestones.length - 1].income) + '/sec');
		console.log('');
	}

	// Formatting helpers
	private formatTime(seconds: number): string {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = Math.floor(seconds % 60);
		
		if (hours > 0) {
			return `${hours}h ${minutes}m`;
		} else if (minutes > 0) {
			return `${minutes}m ${secs}s`;
		} else {
			return `${secs}s`;
		}
	}

	private formatMoney(amount: number): string {
		if (amount >= 1e9) return `${(amount / 1e9).toFixed(2)}B`;
		if (amount >= 1e6) return `${(amount / 1e6).toFixed(2)}M`;
		if (amount >= 1e3) return `${(amount / 1e3).toFixed(2)}K`;
		return amount.toFixed(2);
	}

	private formatNumber(num: number): string {
		if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
		if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
		if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
		return num.toString();
	}
}

// Run simulation
async function main() {
	const sim = new PlaythroughSimulator();
	await sim.simulate();
}

main().catch(console.error);
