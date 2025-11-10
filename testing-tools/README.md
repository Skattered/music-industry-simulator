# Timing & Numbers Testing Tool

A standalone testing system for analyzing game progression and time-to-purchase calculations in the Music Industry Simulator.

## Overview

This tool allows you to simulate different game states and see how long it takes to afford various purchasables (songs, upgrades, tours, platforms, boosts) based on current income rates.

## Quick Start

```bash
# Run all test scenarios
npm run test:timing

# Run a specific scenario
npm run test:timing early-game
npm run test:timing mid-game-tours
npm run test:timing end-game

# List available scenarios
npm run test:timing list
```

## Test Scenarios

The tool includes several predefined scenarios representing different stages of gameplay:

- **early-game**: Just started, no upgrades
- **tier1-basic**: First upgrade purchased
- **tier1-complete**: All tier 1 upgrades complete
- **tier2-complete**: All tier 2 upgrades complete (free songs unlocked)
- **tier3-complete**: All tier 3 upgrades complete (prestige + tours unlockable)
- **mid-game-tours**: Mid-game with active tours and 1 prestige
- **late-game-platforms**: Late game approaching platform ownership (2 prestiges)
- **end-game**: End game with some platforms owned (4 prestiges)
- **victory**: Victory condition with most platforms owned (5 prestiges)

## Programmatic Usage

You can also use the simulator programmatically:

```typescript
import { TimingSimulator } from './testing-tools/timing-simulator';

// Create a simulator with custom configuration
const simulator = new TimingSimulator();

// Configure the game state
simulator
  .setFans(1_000_000)
  .setSongs(100)
  .setCompletedTours(10)
  .setActiveTours(2)
  .setPrestigeCount(1)
  .addUpgrades(['tier1_basic', 'tier1_improved', 'tier1_advanced'])
  .addPlatform('streaming');

// Run analysis
const report = simulator.analyze();

// Print formatted report
console.log(simulator.formatReport(report));

// Or access data programmatically
console.log(`Income per second: $${report.incomePerSecond}`);
console.log(`Song income: $${report.incomeBreakdown.songs}/sec`);

// Check specific purchasables
const nextUpgrade = report.purchasables.find(p => p.category === 'upgrade' && p.available);
if (nextUpgrade) {
  console.log(`Next upgrade: ${nextUpgrade.name}`);
  console.log(`Cost: $${nextUpgrade.cost}`);
  console.log(`Time to afford: ${nextUpgrade.timeToAfford} seconds`);
}
```

## API Reference

### TimingSimulator Class

#### Configuration Methods

```typescript
// Set basic resources
setMoney(amount: number): this
setFans(count: number): this
setSongs(count: number): this
setAlbums(count: number): this
setCompletedTours(count: number): this
setActiveTours(count: number): this
setPrestigeCount(count: number): this

// Add purchased items
addUpgrade(upgradeId: string): this
addUpgrades(upgradeIds: string[]): this
addPlatform(platformId: string): this

// Other configuration
setTrendingGenre(genre: Genre | null): this
reset(): this
loadConfig(config: SimulatorConfig): this
getConfig(): SimulatorConfig
```

#### Analysis Methods

```typescript
// Run analysis and get report
analyze(): AnalysisReport

// Format report as readable text
formatReport(report: AnalysisReport): string
```

### Data Structures

#### SimulatorConfig

```typescript
interface SimulatorConfig {
  money: number;
  fans: number;
  songCount: number;
  albumCount: number;
  completedTourCount: number;
  activeTourCount: number;
  prestigeCount: number;
  purchasedUpgrades: string[];
  ownedPlatforms: string[];
  trendingGenre: Genre | null;
  hasTrendResearch: boolean;
}
```

#### AnalysisReport

```typescript
interface AnalysisReport {
  state: SimulatorConfig;
  incomePerSecond: number;
  incomeBreakdown: {
    songs: number;
    tours: number;
    platforms: number;
    legacyArtists: number;
  };
  purchasables: Purchasable[];
  timestamp: number;
}
```

#### Purchasable

```typescript
interface Purchasable {
  id: string;
  name: string;
  category: 'song' | 'upgrade' | 'tour' | 'platform' | 'boost' | 'trend_research';
  cost: number;
  available: boolean;
  unavailableReason?: string;
  timeToAfford: number | null; // null if cannot afford with current income
}
```

## Upgrade IDs

Tech upgrades follow the pattern `tierX_level`:

**Tier 1 (Web Services):**
- `tier1_basic` - Suno/Udio Account
- `tier1_improved` - Premium Subscription
- `tier1_advanced` - Multi-Account Management

**Tier 2 (Lifetime Licenses):**
- `tier2_basic` - Lifetime License (FREE SONGS)
- `tier2_improved` - API Access
- `tier2_advanced` - Batch Processing

**Tier 3 (Local Models):**
- `tier3_basic` - Download Open Models (GPU + Prestige unlock)
- `tier3_improved` - Optimized Inference
- `tier3_advanced` - Multi-GPU Setup

**Tier 4 (Fine-tuned Models):**
- `tier4_basic` - Fine-tune on Hit Songs
- `tier4_improved` - Genre Specialists
- `tier4_advanced` - Trend Prediction Models

**Tier 5 (Train Your Own):**
- `tier5_basic` - Custom Architecture
- `tier5_improved` - Scrape Training Data
- `tier5_advanced` - Distributed Training

**Tier 6 (Own Your Software):**
- `tier6_basic` - Custom Inference Engine (Platform ownership unlockable)
- `tier6_improved` - Hardware Acceleration
- `tier6_advanced` - Proprietary Format

**Tier 7 (AI Agents):**
- `tier7_basic` - AI Marketing Agent
- `tier7_improved` - AI A&R Agent
- `tier7_advanced` - Full Automation

## Platform IDs

- `streaming` - Streaming Service ($5M)
- `ticketing` - Ticketing Platform ($12.5M)
- `venue` - Concert Venue Chain ($25M)
- `billboard` - Billboard Charts ($50M)
- `grammys` - The Grammys ($125M)
- `training_data` - AI Training Data Monopoly ($250M)

## Example Custom Scenario

```typescript
import { TimingSimulator } from './testing-tools/timing-simulator';

// Test a specific progression point
const simulator = new TimingSimulator();

simulator
  .setMoney(100_000)
  .setFans(2_000_000)
  .setSongs(250)
  .setAlbums(25)
  .setCompletedTours(5)
  .setActiveTours(1)
  .setPrestigeCount(1)
  .addUpgrades([
    'tier1_basic', 'tier1_improved', 'tier1_advanced',
    'tier2_basic', 'tier2_improved', 'tier2_advanced',
    'tier3_basic', 'tier3_improved'
  ])
  .setTrendingGenre('pop');

const report = simulator.analyze();
console.log(simulator.formatReport(report));

// Find the fastest affordable upgrade
const affordableUpgrades = report.purchasables
  .filter(p => p.category === 'upgrade' && p.available && p.timeToAfford !== null)
  .sort((a, b) => a.timeToAfford! - b.timeToAfford!);

if (affordableUpgrades.length > 0) {
  const next = affordableUpgrades[0];
  console.log(`\nNext recommended upgrade: ${next.name}`);
  console.log(`Can afford in: ${next.timeToAfford} seconds`);
}
```

## Output Format

The tool generates a comprehensive report including:

1. **Current State**: Money, fans, songs, albums, tours, prestige, upgrades, platforms
2. **Income Breakdown**: Income per second from each source (songs, tours, platforms, legacy artists)
3. **Time to Purchase**: For each purchasable:
   - Name and cost
   - Time to afford (in seconds, minutes, hours, or days)
   - Locked status with reason (if applicable)

Example output:

```
================================================================================
TIMING & NUMBERS ANALYSIS REPORT
================================================================================

CURRENT STATE:
  Money: $100.00K
  Fans: 2.00M
  Songs: 250
  Albums: 25
  Tours (Completed): 5
  Tours (Active): 1
  Prestige Count: 1
  Upgrades: 8
  Platforms: 0

INCOME PER SECOND:
  Songs:          $3.45K/sec
  Tours:          $45.20K/sec
  Platforms:      $0.00/sec
  Legacy Artists: $0.00/sec
  TOTAL:          $48.65K/sec

TIME TO PURCHASE:

SONGS:
  1x Song                                    $0.00               [NOW]
  10x Songs                                  $0.00               [NOW]
  100x Songs                                 $0.00               [NOW]

TECH UPGRADES:
  Multi-GPU Setup                            $35.00K             12.3m
  Fine-tune on Hit Songs                     $75.00K             25.7m
  Genre Specialists                          $175.00K            1.0h
  ...

TOURS:
  Start Tour                                 $250.00K            51.4m

PLATFORMS:
  Streaming Service                          $5.00M              [LOCKED: Platform ownership not unlocked]
  ...
```

## Use Cases

1. **Balance Testing**: Test if progression pacing feels right at different stages
2. **Prestige Planning**: See how prestige affects time-to-purchase
3. **Build Optimization**: Compare different upgrade paths
4. **Income Analysis**: Understand which sources contribute most to income
5. **Milestone Validation**: Verify unlock conditions are achievable

## Notes

- The simulator uses the same calculation logic as the main game
- All game constants are imported from the actual game configuration
- Income calculations include all multipliers (upgrades, prestige, boosts, trending)
- Time estimates assume constant income (no new songs/tours added during wait)
- "NEVER" means income is zero or negative and the item cannot be afforded
