/**
 * Example Usage of Timing Simulator
 *
 * This file demonstrates various ways to use the timing simulator
 * for custom testing scenarios.
 *
 * Run with: npx tsx testing-tools/example-usage.ts
 */

import { TimingSimulator } from './timing-simulator';

console.log('='.repeat(80));
console.log('TIMING SIMULATOR - EXAMPLE USAGE');
console.log('='.repeat(80));
console.log('');

// ============================================================================
// Example 1: Basic Usage
// ============================================================================

console.log('Example 1: Basic scenario - early game with first few upgrades');
console.log('-'.repeat(80));

const simulator1 = new TimingSimulator();
simulator1
	.setFans(50_000)
	.setSongs(30)
	.addUpgrades(['tier1_basic', 'tier1_improved']);

const report1 = simulator1.analyze();
console.log(simulator1.formatReport(report1));

// ============================================================================
// Example 2: Testing Prestige Impact
// ============================================================================

console.log('\n\nExample 2: Comparing no prestige vs 2 prestiges');
console.log('-'.repeat(80));

// Without prestige
const noPrestigeSimulator = new TimingSimulator();
noPrestigeSimulator
	.setFans(1_000_000)
	.setSongs(200)
	.addUpgrades(['tier1_basic', 'tier1_improved', 'tier1_advanced', 'tier2_basic', 'tier2_improved'])
	.setPrestigeCount(0);

const noPrestigeReport = noPrestigeSimulator.analyze();
console.log('WITHOUT PRESTIGE:');
console.log(`  Income/sec: $${noPrestigeReport.incomePerSecond.toFixed(2)}`);

// With 2 prestiges
const withPrestigeSimulator = new TimingSimulator();
withPrestigeSimulator
	.setFans(1_000_000)
	.setSongs(200)
	.addUpgrades(['tier1_basic', 'tier1_improved', 'tier1_advanced', 'tier2_basic', 'tier2_improved'])
	.setPrestigeCount(2);

const withPrestigeReport = withPrestigeSimulator.analyze();
console.log('WITH 2 PRESTIGES:');
console.log(`  Income/sec: $${withPrestigeReport.incomePerSecond.toFixed(2)}`);
console.log(
	`  Multiplier: ${(withPrestigeReport.incomePerSecond / noPrestigeReport.incomePerSecond).toFixed(2)}x`
);

// ============================================================================
// Example 3: Finding Next Affordable Upgrade
// ============================================================================

console.log('\n\nExample 3: Finding the next affordable upgrade');
console.log('-'.repeat(80));

const simulator3 = new TimingSimulator();
simulator3
	.setMoney(5000)
	.setFans(500_000)
	.setSongs(150)
	.addUpgrades([
		'tier1_basic',
		'tier1_improved',
		'tier1_advanced',
		'tier2_basic',
		'tier2_improved',
		'tier2_advanced',
		'tier3_basic'
	]);

const report3 = simulator3.analyze();

// Filter to available upgrades only
const availableUpgrades = report3.purchasables
	.filter((p) => p.category === 'upgrade' && p.available && p.timeToAfford !== null)
	.sort((a, b) => a.timeToAfford! - b.timeToAfford!);

console.log('Next 5 affordable upgrades:');
for (let i = 0; i < Math.min(5, availableUpgrades.length); i++) {
	const upgrade = availableUpgrades[i];
	const time =
		upgrade.timeToAfford === 0
			? 'NOW'
			: `${(upgrade.timeToAfford! / 60).toFixed(1)} minutes`;
	console.log(`  ${i + 1}. ${upgrade.name} - $${upgrade.cost.toLocaleString()} - ${time}`);
}

// ============================================================================
// Example 4: Tour Income Analysis
// ============================================================================

console.log('\n\nExample 4: Analyzing tour income contribution');
console.log('-'.repeat(80));

const simulator4 = new TimingSimulator();
simulator4
	.setFans(3_000_000)
	.setSongs(400)
	.setActiveTours(2)
	.setCompletedTours(15)
	.setPrestigeCount(1)
	.addUpgrades([
		'tier1_basic',
		'tier1_improved',
		'tier1_advanced',
		'tier2_basic',
		'tier2_improved',
		'tier2_advanced',
		'tier3_basic',
		'tier3_improved',
		'tier3_advanced',
		'tier4_basic'
	]);

const report4 = simulator4.analyze();

console.log('Income Breakdown:');
console.log(`  Songs:  $${report4.incomeBreakdown.songs.toFixed(2)}/sec`);
console.log(`  Tours:  $${report4.incomeBreakdown.tours.toFixed(2)}/sec`);
console.log(`  TOTAL:  $${report4.incomePerSecond.toFixed(2)}/sec`);
console.log('');
console.log(
	`Tour contribution: ${((report4.incomeBreakdown.tours / report4.incomePerSecond) * 100).toFixed(1)}%`
);

// ============================================================================
// Example 5: Platform Ownership Timeline
// ============================================================================

console.log('\n\nExample 5: Time to afford each platform');
console.log('-'.repeat(80));

const simulator5 = new TimingSimulator();
simulator5
	.setMoney(10_000_000)
	.setFans(15_000_000)
	.setSongs(800)
	.setActiveTours(3)
	.setPrestigeCount(3)
	.addUpgrades([
		'tier1_basic',
		'tier1_improved',
		'tier1_advanced',
		'tier2_basic',
		'tier2_improved',
		'tier2_advanced',
		'tier3_basic',
		'tier3_improved',
		'tier3_advanced',
		'tier4_basic',
		'tier4_improved',
		'tier4_advanced',
		'tier5_basic',
		'tier5_improved',
		'tier5_advanced',
		'tier6_basic',
		'tier6_improved'
	]);

const report5 = simulator5.analyze();

const platforms = report5.purchasables.filter((p) => p.category === 'platform');

console.log(`Current income: $${report5.incomePerSecond.toFixed(2)}/sec`);
console.log('');
console.log('Platform Purchase Timeline:');

for (const platform of platforms) {
	if (platform.timeToAfford !== null) {
		const hours = platform.timeToAfford / 3600;
		console.log(`  ${platform.name.padEnd(30)} - ${hours.toFixed(1)} hours`);
	}
}

// ============================================================================
// Example 6: Custom Configuration
// ============================================================================

console.log('\n\nExample 6: Using custom configuration object');
console.log('-'.repeat(80));

import type { SimulatorConfig } from './timing-simulator';

const customConfig: SimulatorConfig = {
	money: 50_000,
	fans: 750_000,
	songCount: 175,
	albumCount: 17,
	completedTourCount: 3,
	activeTourCount: 1,
	prestigeCount: 0,
	purchasedUpgrades: [
		'tier1_basic',
		'tier1_improved',
		'tier1_advanced',
		'tier2_basic',
		'tier2_improved',
		'tier2_advanced',
		'tier3_basic',
		'tier3_improved'
	],
	ownedPlatforms: [],
	trendingGenre: 'hip-hop',
	hasTrendResearch: true
};

const simulator6 = new TimingSimulator(customConfig);
const report6 = simulator6.analyze();

console.log('Custom configuration loaded:');
console.log(`  Fans: ${report6.state.fans.toLocaleString()}`);
console.log(`  Songs: ${report6.state.songCount}`);
console.log(`  Income: $${report6.incomePerSecond.toFixed(2)}/sec`);
console.log(`  Trending Genre: ${report6.state.trendingGenre || 'None'}`);

console.log('\n' + '='.repeat(80));
console.log('Examples complete!');
console.log('='.repeat(80));
