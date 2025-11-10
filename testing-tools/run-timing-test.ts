/**
 * CLI Runner for Timing Simulator
 *
 * Run this script to test timing/numbers for different game scenarios
 *
 * Usage:
 *   npx tsx testing-tools/run-timing-test.ts
 *   npx tsx testing-tools/run-timing-test.ts [scenario-name]
 */

import { TimingSimulator, type SimulatorConfig } from './timing-simulator';

// ============================================================================
// TEST SCENARIOS
// ============================================================================

/**
 * Predefined test scenarios
 */
export const SCENARIOS: Record<string, SimulatorConfig> = {
	// Starting state - just began the game
	'early-game': {
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
	},

	// Early game with first upgrade
	'tier1-basic': {
		money: 50,
		fans: 1000,
		songCount: 5,
		albumCount: 0,
		completedTourCount: 0,
		activeTourCount: 0,
		prestigeCount: 0,
		purchasedUpgrades: ['tier1_basic'],
		ownedPlatforms: [],
		trendingGenre: null,
		hasTrendResearch: false
	},

	// Mid tier 1 - building up
	'tier1-complete': {
		money: 200,
		fans: 10_000,
		songCount: 20,
		albumCount: 0,
		completedTourCount: 0,
		activeTourCount: 0,
		prestigeCount: 0,
		purchasedUpgrades: ['tier1_basic', 'tier1_improved', 'tier1_advanced'],
		ownedPlatforms: [],
		trendingGenre: 'pop',
		hasTrendResearch: true
	},

	// Tier 2 - free songs unlocked
	'tier2-complete': {
		money: 5000,
		fans: 100_000,
		songCount: 100,
		albumCount: 10,
		completedTourCount: 0,
		activeTourCount: 0,
		prestigeCount: 0,
		purchasedUpgrades: [
			'tier1_basic',
			'tier1_improved',
			'tier1_advanced',
			'tier2_basic',
			'tier2_improved',
			'tier2_advanced'
		],
		ownedPlatforms: [],
		trendingGenre: 'pop',
		hasTrendResearch: true
	},

	// Tier 3 - prestige available, tours unlockable
	'tier3-complete': {
		money: 50_000,
		fans: 1_000_000,
		songCount: 300,
		albumCount: 30,
		completedTourCount: 0,
		activeTourCount: 0,
		prestigeCount: 0,
		purchasedUpgrades: [
			'tier1_basic',
			'tier1_improved',
			'tier1_advanced',
			'tier2_basic',
			'tier2_improved',
			'tier2_advanced',
			'tier3_basic',
			'tier3_improved',
			'tier3_advanced'
		],
		ownedPlatforms: [],
		trendingGenre: 'pop',
		hasTrendResearch: true
	},

	// Mid-game with tours
	'mid-game-tours': {
		money: 500_000,
		fans: 5_000_000,
		songCount: 500,
		albumCount: 50,
		completedTourCount: 10,
		activeTourCount: 2,
		prestigeCount: 1,
		purchasedUpgrades: [
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
			'tier4_improved'
		],
		ownedPlatforms: [],
		trendingGenre: 'pop',
		hasTrendResearch: true
	},

	// Late game - platforms unlockable
	'late-game-platforms': {
		money: 20_000_000,
		fans: 10_000_000,
		songCount: 800,
		albumCount: 80,
		completedTourCount: 50,
		activeTourCount: 3,
		prestigeCount: 2,
		purchasedUpgrades: [
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
			'tier6_basic'
		],
		ownedPlatforms: [],
		trendingGenre: 'hip-hop',
		hasTrendResearch: true
	},

	// End game - full automation
	'end-game': {
		money: 100_000_000,
		fans: 50_000_000,
		songCount: 1500,
		albumCount: 150,
		completedTourCount: 100,
		activeTourCount: 3,
		prestigeCount: 4,
		purchasedUpgrades: [
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
			'tier6_improved',
			'tier6_advanced',
			'tier7_basic',
			'tier7_improved'
		],
		ownedPlatforms: ['streaming', 'ticketing', 'venue'],
		trendingGenre: 'electronic',
		hasTrendResearch: true
	},

	// Victory lap - all platforms owned
	'victory': {
		money: 500_000_000,
		fans: 100_000_000,
		songCount: 2000,
		albumCount: 200,
		completedTourCount: 150,
		activeTourCount: 3,
		prestigeCount: 5,
		purchasedUpgrades: [
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
			'tier6_improved',
			'tier6_advanced',
			'tier7_basic',
			'tier7_improved',
			'tier7_advanced'
		],
		ownedPlatforms: ['streaming', 'ticketing', 'venue', 'billboard', 'grammys'],
		trendingGenre: 'pop',
		hasTrendResearch: true
	}
};

// ============================================================================
// MAIN
// ============================================================================

function main() {
	const args = process.argv.slice(2);
	const scenarioName = args[0] || 'all';

	console.log('Music Industry Simulator - Timing & Numbers Testing Tool');
	console.log('');

	if (scenarioName === 'all') {
		// Run all scenarios
		console.log('Running all test scenarios...');
		console.log('');

		for (const [name, config] of Object.entries(SCENARIOS)) {
			runScenario(name, config);
		}
	} else if (scenarioName === 'list') {
		// List available scenarios
		console.log('Available scenarios:');
		for (const name of Object.keys(SCENARIOS)) {
			console.log(`  - ${name}`);
		}
		console.log('');
		console.log('Usage:');
		console.log('  npx tsx testing-tools/run-timing-test.ts [scenario-name]');
		console.log('  npx tsx testing-tools/run-timing-test.ts all');
		console.log('  npx tsx testing-tools/run-timing-test.ts list');
	} else if (SCENARIOS[scenarioName]) {
		// Run specific scenario
		runScenario(scenarioName, SCENARIOS[scenarioName]);
	} else {
		console.error(`Unknown scenario: ${scenarioName}`);
		console.log('');
		console.log('Available scenarios:');
		for (const name of Object.keys(SCENARIOS)) {
			console.log(`  - ${name}`);
		}
		process.exit(1);
	}
}

function runScenario(name: string, config: SimulatorConfig) {
	console.log(`\n${'='.repeat(80)}`);
	console.log(`SCENARIO: ${name.toUpperCase()}`);
	console.log('='.repeat(80));

	const simulator = new TimingSimulator(config);
	const report = simulator.analyze();
	console.log(simulator.formatReport(report));
}

// Run if executed directly
// In ES modules, check if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
	main();
}

export { main };
