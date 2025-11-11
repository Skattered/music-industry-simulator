# Game Systems Breakdown

**Music Industry Simulator** - Technical reference for all game systems, income calculations, multipliers, and progression mechanics.

> **Note**: This document provides the technical implementation details. For gameplay mechanics and progression overview, see `game-details.md`. For architecture and code structure, see `tech-details.md`.

---

## Table of Contents

1. [Core Game Loop](#core-game-loop)
2. [Income System](#income-system)
3. [Multipliers Reference](#multipliers-reference)
4. [Song Generation & Passive Income](#song-generation--passive-income)
5. [Fan Growth System](#fan-growth-system)
6. [Tech Upgrade System](#tech-upgrade-system)
7. [Exploitation/Boost System](#exploitationboost-system)
8. [Physical Albums System](#physical-albums-system)
9. [Tour System](#tour-system)
10. [Prestige System](#prestige-system)
11. [Platform Ownership System](#platform-ownership-system)
12. [Industry Control System](#industry-control-system)
13. [Base Rates & Constants](#base-rates--constants)
14. [System Interactions](#system-interactions)

---

## Core Game Loop

**Tick Rate**: 10 TPS (ticks per second), 100ms intervals
**Engine**: `src/lib/game/engine.ts`

### Processing Order (Every Tick)

```typescript
1. processSongQueue(deltaTime)          // Progress queued songs, complete songs
2. generateIncome(deltaTime)             // Calculate and add all income sources
3. generateFans(deltaTime)               // Calculate and add fan growth
4. processActiveBoosts(deltaTime)        // Remove expired exploitation boosts
5. processPhysicalAlbums(deltaTime)      // Auto-release albums at milestones
6. processTours(deltaTime)               // Mark completed tours
7. processLegacyArtists(deltaTime)       // Cross-promotion from prestige artists
8. updateControlProgress()               // Recalculate industry control %
9. checkPhaseUnlocks()                   // Check phase unlock requirements
10. Auto-save (every 10 seconds)         // Persist to localStorage
```

**Delta Time**: Frame-independent calculation using actual elapsed time between ticks. All rates are "per second" and multiplied by `deltaTime / 1000`.

---

## Income System

**Location**: `src/lib/systems/income.ts`

### Total Income Formula

```typescript
totalIncome = (songIncome + legacyArtistIncome + platformIncome + tourIncome) * activeBoostMultipliers
```

### Income Sources

| Source | Base Rate | Details |
|--------|-----------|---------|
| **Songs** | $2.00/sec per song | Passive income from all completed songs |
| **Legacy Artists** | 80% of prestige artist's songs | Continues after prestige (max 3 artists) |
| **Platforms** | $50K - $500K/sec | Owned streaming infrastructure (7 platforms) |
| **Tours** | Variable | Active tours only (duration: 2 minutes) |
| **Boosts** | Multiplier only | Temporary exploitation abilities |

### Income Calculation Per Tick

```typescript
// 1. Calculate base income from all sources
songIncome = songs.reduce((sum, song) => sum + song.incomePerSecond, 0)
legacyIncome = legacyArtists.reduce((sum, artist) => sum + artist.incomeRate, 0)
platformIncome = platforms.reduce((sum, platform) => sum + platform.incomePerSecond, 0)
tourIncome = activeTours.reduce((sum, tour) => sum + tour.incomePerSecond, 0)

baseIncome = songIncome + legacyIncome + platformIncome + tourIncome

// 2. Apply active boost multipliers (multiplicative stacking)
boostMultiplier = activeBoosts.reduce((mult, boost) => mult * boost.incomeMultiplier, 1.0)

// 3. Calculate income for this tick
totalIncomePerSecond = baseIncome * boostMultiplier
incomeThisTick = totalIncomePerSecond * (deltaTime / 1000)

// 4. Add to money
gameState.money += incomeThisTick
```

**Critical Note**: Multipliers are **NOT** recalculated for existing songs. Income multipliers are baked into each song at creation time. Only boost multipliers apply to all income sources dynamically.

---

## Multipliers Reference

### A. Tech Tier Income Multipliers

**Location**: `src/lib/data/tech-upgrades.ts` → `src/lib/systems/tech.ts`

**Behavior**: Highest value replaces (non-stacking). Applied at song creation only.

| Tech Tier | Upgrade | Income Multiplier | Cumulative Increase |
|-----------|---------|-------------------|---------------------|
| **Tier 1** | Basic | 1.0x | - |
| **Tier 2** | Improved | 1.5x | +50% |
| **Tier 2** | Advanced | 2.0x | +100% |
| **Tier 3** | Improved | 2.5x | +150% |
| **Tier 3** | Advanced | 3.0x | +200% |
| **Tier 4** | Basic | 4.0x | +300% |
| **Tier 4** | Improved | 5.0x | +400% |
| **Tier 4** | Advanced | 6.0x | +500% |
| **Tier 5** | Basic | 8.0x | +700% |
| **Tier 5** | Improved | 10.0x | +900% |
| **Tier 5** | Advanced | 12.0x | +1100% |
| **Tier 6** | Basic | 15.0x | +1400% |
| **Tier 6** | Improved | 20.0x | +1900% |
| **Tier 6** | Advanced | 25.0x | +2400% |
| **Tier 7** | Basic | 30.0x | +2900% |
| **Tier 7** | Improved | 40.0x | +3900% |
| **Tier 7** | Advanced | 50.0x | +4900% |

**Usage**: `getHighestIncomeMultiplier(gameState)` returns the highest purchased upgrade's multiplier.

### B. Prestige Experience Multiplier

**Location**: `src/lib/systems/prestige.ts` → `src/lib/systems/songs.ts`

**Behavior**: Applied at song creation, tour income calculation. Persists across prestiges.

**Formula**:
```typescript
experienceMultiplier = 1.0 + (prestigeCount * 0.15)
```

**Examples**:
- 0 prestiges: **1.0x** (no bonus)
- 1 prestige: **1.15x** (+15%)
- 2 prestiges: **1.3x** (+30%)
- 3 prestiges: **1.45x** (+45%)
- 5 prestiges: **1.75x** (+75%)
- 10 prestiges: **2.5x** (+150%)

**Applies To**:
- Song income (baked in at creation)
- Tour income (calculated dynamically)
- Does NOT apply to: platforms, legacy artists, album payouts

### C. Trending Genre Multiplier

**Location**: `src/lib/systems/fans.ts` → `src/lib/systems/songs.ts`

**Behavior**: Applied at song creation if song's genre matches current trend. Fades linearly over 5 minutes.

**Base Multiplier**: 2.0x
**Fade Duration**: 300,000ms (5 minutes)
**Activation Cost**: $1,000,000 (trend research)

**Formula**:
```typescript
elapsedTime = currentTime - trendingGenre.startTime
fadeFactor = Math.min(elapsedTime / 300000, 1.0)
trendingMultiplier = 2.0 - (fadeFactor * 1.0)
// Result ranges from 2.0x (fresh) to 1.0x (expired)
```

**Examples**:
- **0 minutes elapsed**: 2.0x (full bonus)
- **2.5 minutes elapsed**: 1.5x (half faded)
- **5+ minutes elapsed**: 1.0x (no bonus)

**Applies To**:
- Song income (multiplied with tech and prestige)
- Fan generation rate (doubled for trending songs)

**Critical**: Songs created with trending bonus **keep their multiplier** even after trend expires. New songs created after 5 minutes get no bonus.

### D. Active Boost Multipliers

**Location**: `src/lib/systems/exploitation.ts`

**Behavior**: Temporary multipliers. Multiple boosts stack multiplicatively. Applied to ALL income/fan sources.

| Boost Name | Income Mult | Fan Mult | Duration | Base Cost | Unlock Req |
|------------|-------------|----------|----------|-----------|------------|
| **Bot Streams** | 3.0x | 1.5x | 30s | $50K | Always |
| **Playlist Payola** | 2.5x | 3.0x | 60s | $250K | Always |
| **Viral Marketing** | 2.0x | 5.0x | 45s | $500K | Always |
| **Limited Variants** | 4.0x | 1.2x | 60s | $2.5M | Phase 2 (Albums) |
| **Shut Down Competitors** | 3.5x | 0.8x | 90s | $10M | Phase 2 (Albums) |
| **Exclusive Deals** | 3.0x | 1.5x | 60s | $7.5M | Phase 2 (Albums) |
| **Scalp Records** | 5.0x | 0.5x | 120s | $25M | Phase 3 (Tours) |
| **Limit Tickets** | 4.5x | 1.1x | 90s | $50M | Phase 3 (Tours) |
| **Scalp Tickets** | 6.0x | 0.3x | 120s | $100M | Phase 3 (Tours) |
| **FOMO Marketing** | 3.5x | 2.5x | 60s | $75M | Phase 3 (Tours) |
| **Dynamic Pricing** | 8.0x | 0.2x | 180s | $250M | Phase 4 (Platforms) |

**Cost Scaling**:
```typescript
currentCost = baseCost * Math.pow(1.5, boost.usageCount)
```

Each use increases cost by 50%. No cooldowns.

**Stacking Example**:
```typescript
// Activate: Bot Streams (3.0x income) + Dynamic Pricing (8.0x income)
totalIncomeMultiplier = 3.0 * 8.0 = 24.0x income
totalFanMultiplier = 1.5 * 0.2 = 0.3x fans (some boosts hurt fans)

// Applied to all income sources
totalIncome = (songIncome + legacyIncome + platformIncome + tourIncome) * 24.0
```

### E. Tour Scarcity Multiplier

**Location**: `src/lib/systems/tours.ts`

**Behavior**: Applied when scarcity-based exploitation abilities are active (Limit Tickets, Scalp Tickets).

**Multiplier**: 1.5x to tour income
**Duration**: Matches the active boost's duration

---

## Song Generation & Passive Income

**Location**: `src/lib/systems/songs.ts`

### Base Values

```typescript
BASE_INCOME_PER_SONG = 2.00        // $/second per song
BASE_FAN_GENERATION_RATE = 2.0     // fans/second per song
BASE_SONG_GENERATION_TIME = 20000  // 20 seconds
BASE_SONG_COST = 5.00              // $5 per song
```

### Song Creation Formula

**At Queue Time**:
1. Deduct cost immediately: `money -= totalCost`
2. Add songs to queue: `songQueue.push(...newSongs)`

**At Completion Time** (when progress >= generationTime):
```typescript
// 1. Get current multipliers
techMultiplier = getHighestIncomeMultiplier(gameState)
experienceMultiplier = 1.0 + (prestigeCount * 0.15)
trendingMultiplier = calculateTrendingMultiplier(genre, trendingGenre)

// 2. Bake multipliers into song
song.incomePerSecond = BASE_INCOME_PER_SONG
                       * techMultiplier
                       * experienceMultiplier
                       * trendingMultiplier

song.fanGenerationRate = BASE_FAN_GENERATION_RATE * trendingMultiplier

// 3. Add to completed songs array
gameState.songs.push(song)
```

**Critical**: These values are **permanent** for each song. Buying new tech upgrades does NOT increase income from old songs.

### Queue System

- **Sequential Processing**: Only first song in queue progresses
- **Progress Tracking**: `progress += deltaTime` until `progress >= generationTime`
- **Completion**: Remove from queue, add to songs array
- **Multiple Songs**: Queued songs wait in line (FIFO)

### Cost Scaling by Tech Tier

| Tech Tier | Basic | Improved | Advanced |
|-----------|-------|----------|----------|
| **Tier 1** | $5.00 | $1.50 | $1.00 | $0.50 |
| **Tier 2+** | **FREE** ($0.00) | **FREE** ($0.00) | **FREE** ($0.00) |

**Usage**: `getCurrentSongCost(gameState)` returns cost based on highest upgrade.

### Generation Time Scaling by Tech Tier

| Tech Tier | Basic | Improved | Advanced |
|-----------|-------|----------|----------|
| **Tier 1** | 20s | 15s | 12s | 10s |
| **Tier 2** | 10s | 8s | 6s |
| **Tier 3** | 5s | 4s | 3s |
| **Tier 4** | 2.5s | 2s | 1.5s |
| **Tier 5** | 1.2s | 1s | 0.8s |
| **Tier 6** | 0.6s | 0.4s | 0.3s |
| **Tier 7** | 0.2s | 0.15s | 0.1s |

**At Tier 7 Advanced**: Generate 10 songs per second (each worth 50x base income from tech multiplier alone).

### Example Song Progression

**Scenario**: 3 prestiges, Tier 5 Advanced, trending genre match (2 min elapsed)

```typescript
// Multipliers
techMultiplier = 12.0              // Tier 5 Advanced
experienceMultiplier = 1.45        // 3 prestiges
trendingFade = 2.0 - (120/300) = 1.6  // 2 minutes elapsed
trendingMultiplier = 1.6

// Final song values
incomePerSecond = $2.00 * 12.0 * 1.45 * 1.6 = $55.68/sec
fanGenerationRate = 2.0 * 1.6 = 3.2 fans/sec
generationTime = 0.8s
cost = $0 (Tier 5 = free songs)
```

---

## Fan Growth System

**Location**: `src/lib/systems/fans.ts`

### Fan Sources

| Source | Rate Formula | Details |
|--------|--------------|---------|
| **Songs** | Sum of all `song.fanGenerationRate` | Baked in at song creation |
| **Legacy Artists** | `peakFans * 0.00001` per artist | Cross-promotion (max 3 artists) |
| **Active Boosts** | Temporary multiplier | Applied to total fan generation |

### Fan Calculation Per Tick

```typescript
// 1. Base fan generation from songs
baseFanGeneration = songs.reduce((sum, song) => sum + song.fanGenerationRate, 0)

// 2. Add cross-promotion from legacy artists
legacyArtists.forEach(artist => {
  baseFanGeneration += artist.peakFans * 0.00001
})

// 3. Apply active boost multipliers
boostMultiplier = activeBoosts.reduce((mult, boost) => mult * boost.fanMultiplier, 1.0)

// 4. Calculate fans for this tick
totalFansPerSecond = baseFanGeneration * boostMultiplier
fansThisTick = totalFansPerSecond * (deltaTime / 1000)

// 5. Update fan counts
gameState.fans += fansThisTick
gameState.currentArtist.fans += fansThisTick
gameState.peakFans = Math.max(gameState.peakFans, gameState.fans)
```

### Fan Tracking

- **Total Fans** (`gameState.fans`): Current active fans (never decreases except prestige)
- **Current Artist Fans** (`currentArtist.fans`): Individual artist progress (resets on prestige)
- **Peak Fans** (`gameState.peakFans`): Highest ever reached (never decreases, used for prestige bonuses)

### Cross-Promotion from Legacy Artists

**Formula**: `crossPromotionRate = legacyArtist.peakFans * 0.00001`

**Example**:
- Legacy Artist 1: 5,000,000 peak fans → 50 fans/sec
- Legacy Artist 2: 10,000,000 peak fans → 100 fans/sec
- Legacy Artist 3: 25,000,000 peak fans → 250 fans/sec
- **Total Cross-Promotion**: 400 fans/sec to current artist

**Critical**: Cross-promotion is a **constant** passive rate. It doesn't scale with active artist's progress.

---

## Tech Upgrade System

**Location**: `src/lib/systems/tech.ts`, `src/lib/data/tech-upgrades.ts`

### Tech Tier Structure

**7 Tiers × 3 Sub-tiers = 21 Total Upgrades**

Each upgrade modifies:
- **songCost**: Cost to queue a song (Tier 2+ = free)
- **songSpeed**: Time to generate a song (20s → 0.1s)
- **incomeMultiplier**: Multiplier for song income (1x → 50x)
- **unlocks**: New game systems (albums, tours, prestige, platforms)

### Tier 1: Third-party Web Services

**Theme**: Using external AI services (ChatGPT, Suno, etc.)

| Upgrade | Cost | Speed | Cost/Song | Income Mult | Unlocks |
|---------|------|-------|-----------|-------------|---------|
| **Basic** | $75 | 20s | $5.00 | 1.0x | - |
| **Improved** | $375 | 15s | $1.50 | 1.0x | - |
| **Advanced** | $750 | 12s | $1.00 | 1.0x | - |
| **Elite** | $1,500 | 10s | $0.50 | 1.0x | Trend Research |

**Prerequisites**: None (always unlocked)

### Tier 2: Lifetime Licenses

**Theme**: Owning perpetual licenses to AI tools

| Upgrade | Cost | Speed | Cost/Song | Income Mult | Unlocks |
|---------|------|-------|-----------|-------------|---------|
| **Basic** | $1,500 | 10s | **$0.00** | 1.5x | - |
| **Improved** | $7,500 | 8s | **$0.00** | 1.5x | Physical Albums |
| **Advanced** | $12,500 | 6s | **$0.00** | 2.0x | - |

**Prerequisites**: Tier 1 Elite
**Critical**: Songs become **FREE** at Tier 2 Basic!

### Tier 3: Local AI Models

**Theme**: Running AI models locally (Llama, Stable Diffusion)

| Upgrade | Cost | Speed | Cost/Song | Income Mult | Unlocks |
|---------|------|-------|-----------|-------------|---------|
| **Basic** | $37,500 | 5s | $0.00 | 2.5x | GPU Rental |
| **Improved** | $100,000 | 4s | $0.00 | 2.5x | Prestige |
| **Advanced** | $175,000 | 3s | $0.00 | 3.0x | Tours (with reqs) |

**Prerequisites**: Tier 2 Advanced
**Unlocks**: Prestige system (major milestone)

### Tier 4: Fine-tuned Models

**Theme**: Training custom AI models on specific data

| Upgrade | Cost | Speed | Cost/Song | Income Mult | Unlocks |
|---------|------|-------|-----------|-------------|---------|
| **Basic** | $375,000 | 2.5s | $0.00 | 4.0x | - |
| **Improved** | $875,000 | 2s | $0.00 | 5.0x | - |
| **Advanced** | $1,750,000 | 1.5s | $0.00 | 6.0x | - |

**Prerequisites**: Tier 3 Advanced

### Tier 5: Train Your Own

**Theme**: Building AI training infrastructure

| Upgrade | Cost | Speed | Cost/Song | Income Mult | Unlocks |
|---------|------|-------|-----------|-------------|---------|
| **Basic** | $1,000,000 | 1.2s | $0.00 | 8.0x | - |
| **Improved** | $2,500,000 | 1s | $0.00 | 10.0x | - |
| **Advanced** | $5,000,000 | 0.8s | $0.00 | 12.0x | - |

**Prerequisites**: Tier 4 Advanced

### Tier 6: Build Your Own Software

**Theme**: Creating proprietary AI frameworks

| Upgrade | Cost | Speed | Cost/Song | Income Mult | Unlocks |
|---------|------|-------|-----------|-------------|---------|
| **Basic** | $3,750,000 | 0.6s | $0.00 | 15.0x | Platform Ownership (with reqs) |
| **Improved** | $12,500,000 | 0.4s | $0.00 | 20.0x | Industry Monopoly mechanics |
| **Advanced** | $25,000,000 | 0.3s | $0.00 | 25.0x | - |

**Prerequisites**: Tier 5 Advanced
**Unlocks**: Platform ownership (late-game income source)

### Tier 7: AI Agent Automation

**Theme**: Fully autonomous AI agents running the empire

| Upgrade | Cost | Speed | Cost/Song | Income Mult | Unlocks |
|---------|------|-------|-----------|-------------|---------|
| **Basic** | $50,000,000 | 0.2s | $0.00 | 30.0x | - |
| **Improved** | $125,000,000 | 0.15s | $0.00 | 40.0x | - |
| **Advanced** | $250,000,000 | 0.1s | $0.00 | 50.0x | - |

**Prerequisites**: Tier 6 Advanced
**End Game**: At this tier, generating 10 songs/sec at 50x income

### Tech Progression Rules

1. **Prerequisites Enforced**: Must buy previous tier's elite/advanced before next tier unlocks
2. **Highest Value Wins**: Income multipliers don't stack (highest purchased applies)
3. **Speed Compounds**: Generation time uses the fastest purchased upgrade
4. **Tech Tier Calculation**: Based on highest purchased upgrade's tier

---

## Exploitation/Boost System

**Location**: `src/lib/systems/exploitation.ts`

### Design Philosophy

- **No Cooldowns**: Only escalating costs (spend money to make money)
- **Multiplicative Stacking**: Multiple boosts active = multiply all effects
- **Duration-Based**: Temporary buffs with countdown timers
- **Active Gameplay**: Optimal play requires timing and stacking boosts

### Boost Mechanics

**Activation**:
```typescript
// 1. Check affordability
currentCost = baseCost * Math.pow(1.5, boost.usageCount)
if (money < currentCost) return false

// 2. Deduct cost
money -= currentCost

// 3. Add to active boosts
activeBoosts.push({
  id: boostId,
  incomeMultiplier: boost.incomeMultiplier,
  fanMultiplier: boost.fanMultiplier,
  startTime: currentTime,
  duration: boost.duration
})

// 4. Increment usage count (for cost scaling)
boost.usageCount++
```

**Processing**:
```typescript
// Every tick: check for expiration
activeBoosts = activeBoosts.filter(boost => {
  const elapsed = currentTime - boost.startTime
  return elapsed < boost.duration
})
```

**Application**:
```typescript
// Calculate combined multipliers
incomeMultiplier = activeBoosts.reduce((m, b) => m * b.incomeMultiplier, 1.0)
fanMultiplier = activeBoosts.reduce((m, b) => m * b.fanMultiplier, 1.0)

// Apply to all income/fan sources
totalIncome = baseIncome * incomeMultiplier
totalFans = baseFans * fanMultiplier
```

### Boost Availability by Phase

**Phase 1** (Always Available):
- Bot Streams, Playlist Payola, Viral Marketing

**Phase 2** (Physical Albums Unlocked):
- Limited Variants, Shut Down Competitors, Exclusive Deals

**Phase 3** (Tours Unlocked):
- Scalp Records, Limit Tickets, Scalp Tickets, FOMO Marketing

**Phase 4** (Platforms Unlocked):
- Dynamic Pricing

### Cost Scaling Example

**Playlist Payola** (Base: $250,000)

| Usage # | Cost | Cumulative Spent |
|---------|------|------------------|
| 1 | $250,000 | $250,000 |
| 2 | $375,000 | $625,000 |
| 3 | $562,500 | $1,187,500 |
| 4 | $843,750 | $2,031,250 |
| 5 | $1,265,625 | $3,296,875 |
| 10 | $14,496,356 | $74,873,047 |

**Formula**: `cost = $250,000 * (1.5 ^ usage)`

### Optimal Boost Stacking Strategy

**Goal**: Maximize income during boost windows

**Example Combo** (Late Game):
```
1. Activate Dynamic Pricing (8.0x income, 180s)
2. Activate Scalp Tickets (6.0x income, 120s)
3. Generate max songs while both active

Combined: 8.0 * 6.0 = 48.0x total income
Duration: 120s overlap
Cost: ~$250M + $100M (usage-dependent)
ROI: Generates billions if income is already high
```

**Trade-off**: Some boosts hurt fans (0.2x - 0.8x fan multiplier). Balance income vs. fan growth.

---

## Physical Albums System

**Location**: `src/lib/systems/physical.ts`

### Unlock Requirements

- **Tier 2 Improved** upgrade purchased
- Unlocks Phase 2

### Album Release Mechanics

**Auto-Release Trigger**:
- Every **10 completed songs**
- After **90-second cooldown** (from last album release)

**Payout Formula**:
```typescript
basePayout = (songCount * 25000) + (fans * 1.00)
variantCount = calculateVariantCount(fans)
totalPayout = basePayout * variantCount
```

### Variant Count by Fan Milestones

| Fans | Variants | Multiplier |
|------|----------|------------|
| 0 - 9,999 | 1 | 1x |
| 10,000 - 99,999 | 2 | 2x |
| 100,000 - 999,999 | 3 | 3x |
| 1,000,000+ | 4 | 4x |

**Explanation**: More fans = more "limited edition" variants = higher payout multiplier.

### Re-Release Mechanics

- Can re-release any previous album
- **50% of original payout**
- No cooldown for re-releases
- Strategy: Re-release old albums as fans grow (more variants = higher payout)

### Payout Examples

**Scenario 1**: 10 songs, 5,000 fans
```
basePayout = (10 * $25,000) + (5,000 * $1.00) = $255,000
variants = 1
totalPayout = $255,000
```

**Scenario 2**: 10 songs, 500,000 fans
```
basePayout = (10 * $25,000) + (500,000 * $1.00) = $750,000
variants = 3
totalPayout = $2,250,000
```

**Scenario 3**: 10 songs, 5,000,000 fans
```
basePayout = (10 * $25,000) + (5,000,000 * $1.00) = $5,250,000
variants = 4
totalPayout = $21,000,000
```

**Critical**: Album payout scales with fan count. Re-releasing old albums after gaining fans = profit.

---

## Tour System

**Location**: `src/lib/systems/tours.ts`

### Unlock Requirements

- **Tier 3 Advanced** upgrade purchased
- **10 completed albums** released
- **100,000 fans** total

Unlocks Phase 3

### Tour Mechanics

**Cost**: $250,000 per tour
**Duration**: 120,000ms (2 minutes)
**Max Simultaneous**:
- Tier 3: 1 tour
- Tier 4: 2 tours
- Tier 5+: 3 tours

### Tour Income Formula

```typescript
// 1. Base income
baseIncome = 5000  // $5,000/sec

// 2. Fan multiplier
fanBonus = fans * 0.05  // $0.05 per fan per second

// 3. Song catalog bonus
catalogBonus = songCount * 100  // $100/sec per song

// 4. Prestige multiplier
experienceMultiplier = 1.0 + (prestigeCount * 0.15)

// 5. Scarcity multiplier (if Limit Tickets or Scalp Tickets active)
scarcityMultiplier = hasScarcityBoost ? 1.5 : 1.0

// Final income per second
tourIncome = (baseIncome + fanBonus + catalogBonus)
             * experienceMultiplier
             * scarcityMultiplier
```

### Tour Income Examples

**Scenario 1**: 100K fans, 50 songs, 0 prestiges
```
baseIncome = $5,000
fanBonus = 100,000 * $0.05 = $5,000
catalogBonus = 50 * $100 = $5,000
experienceMultiplier = 1.0
scarcityMultiplier = 1.0

tourIncome = ($5,000 + $5,000 + $5,000) * 1.0 * 1.0 = $15,000/sec
totalEarnings = $15,000/sec * 120sec = $1,800,000
ROI = $1,800,000 / $250,000 = 7.2x
```

**Scenario 2**: 5M fans, 500 songs, 3 prestiges, scarcity active
```
baseIncome = $5,000
fanBonus = 5,000,000 * $0.05 = $250,000
catalogBonus = 500 * $100 = $50,000
experienceMultiplier = 1.45
scarcityMultiplier = 1.5

tourIncome = ($5,000 + $250,000 + $50,000) * 1.45 * 1.5 = $661,125/sec
totalEarnings = $661,125/sec * 120sec = $79,335,000
ROI = $79,335,000 / $250,000 = 317.3x
```

**Critical**: Tour income scales exponentially with fans and song count. Late-game tours are extremely profitable.

### Tour Strategy

- **Wait for fans**: Tours are more valuable with high fan counts
- **Build catalog**: Each song adds $100/sec (with multipliers)
- **Stack scarcity boosts**: Use Limit Tickets or Scalp Tickets during tours for 1.5x
- **Multiple simultaneous**: Run 3 tours at once (Tier 5+) for 3x effective income
- **Prestige bonus**: Each prestige adds 15% to tour income (multiplicative)

---

## Prestige System

**Location**: `src/lib/systems/prestige.ts`

### Unlock Requirements

- **Tier 3 Improved** upgrade purchased
- **No fan gate** (can prestige immediately after tech unlock)

Unlocks Phase 3

### Prestige Mechanics

**What Resets**:
- Money → $10 (starting amount)
- Songs → [] (empty array)
- Fans → 0
- Current Artist → new artist
- Song Queue → [] (empty)
- Active Boosts → [] (cleared)

**What Persists**:
- Tech Upgrades (all purchased upgrades kept)
- Platforms (owned platforms kept)
- Industry Control % (from persistent sources)
- Prestige Count (incremented)
- Peak Fans (never decreases)

**What's Created**:
- **Legacy Artist** (previous artist becomes passive income source)

### Legacy Artist Mechanics

**Income Rate**: 80% of prestige artist's total song income

**Formula**:
```typescript
// At prestige time:
totalSongIncome = songs.reduce((sum, song) => sum + song.incomePerSecond, 0)
legacyArtist.incomeRate = totalSongIncome * 0.80

// Forever after (passive):
legacyIncome += legacyArtist.incomeRate * (deltaTime / 1000)
```

**Cross-Promotion**: Funnels fans to new artist
```typescript
crossPromotionRate = legacyArtist.peakFans * 0.00001  // fans/sec
```

**Max Legacy Artists**: 3
- When 4th prestige happens, oldest legacy artist is removed
- Strategy: Make last 3 prestiges as strong as possible

### Experience Multiplier

**Formula**: `1.0 + (prestigeCount * 0.15)`

**Applies To**:
- Song income (baked in at creation)
- Tour income (calculated dynamically)

**Does NOT Apply To**:
- Legacy artist income (fixed at prestige time)
- Platform income (fixed rates)
- Album payouts (no prestige scaling)

### Prestige Strategy

**When to Prestige**:
1. **Early Game**: After Tier 3 unlock, immediately prestige for 15% bonus
2. **Mid Game**: Prestige when song generation is fast (Tier 4-5) to build catalog quickly
3. **Late Game**: Prestige with max fans/songs to create powerful legacy artist

**Optimal Prestige Loop**:
```
1. Unlock Tier 3 → Prestige immediately (+15% bonus)
2. Rebuild with 15% bonus → Reach Tier 4
3. Prestige again (+30% bonus total)
4. Rebuild with 30% bonus → Reach Tier 5
5. Keep prestigious every tier unlock to stack experience
```

**Max Legacy Artist Strategy**:
- 3 legacy artist slots
- Remove oldest when 4th prestige
- Goal: Last 3 prestiges should have highest song income (peak tier, max songs)
- Late-game: 3 legacy artists with millions/sec income each

### Prestige ROI Example

**Scenario**: 100 songs at $100/sec each (Tier 5, 2 prestiges)

```
totalSongIncome = 100 * $100 = $10,000/sec
legacyArtistIncome = $10,000 * 0.80 = $8,000/sec (passive forever)
crossPromotion = 5,000,000 peakFans * 0.00001 = 50 fans/sec (to new artist)
experienceBonus = 1.45x (now 3 prestiges)

New artist songs: $2 * techMult * 1.45 = much faster progression
```

**Prestige is a core progression loop**: Trading temporary power for permanent passive income + growth multiplier.

---

## Platform Ownership System

**Location**: `src/lib/systems/monopoly.ts`

### Unlock Requirements

- **Tier 6 Basic** upgrade purchased
- **50 completed tours**
- **1,000,000 fans** total

Unlocks Phase 4

### Platform Mechanics

**7 Platforms Total**: Streaming services, music stores, video platforms, radio networks

**Original Costs**: $1 billion - $10 billion per platform
**Actual Costs**: 90% cheaper ($100M - $1B) after player feedback
**Income**: $50,000 - $500,000 per second (passive, constant)

### Platform List

| Platform | Original Cost | Actual Cost | Income/sec | Control % | Prereqs |
|----------|---------------|-------------|------------|-----------|---------|
| **Sputify** | $1B | $100M | $50K | 12% | None |
| **Snapple Music** | $1.5B | $150M | $75K | 15% | Sputify |
| **YouToob** | $2.5B | $250M | $100K | 18% | Sputify |
| **SoundFog** | $4B | $400M | $150K | 20% | Snapple Music, YouToob |
| **PanderA** | $5B | $500M | $200K | 22% | SoundFog |
| **aRadio** | $7.5B | $750M | $300K | 23% | PanderA |
| **The Platform** | $10B | $1B | $500K | 25% | All others |

**Total Platform Income**: $1,375,000/sec (if all owned)
**Total Control Contribution**: 125%

### Platform Strategy

**Prerequisites Enforced**: Must own earlier platforms before later ones (tech tree style)

**Income Scaling**:
- Platforms provide **constant** passive income (no multipliers)
- Not affected by tech upgrades, prestige, or boosts
- Pure "set it and forget it" income stream

**Industry Control**:
- Each platform contributes 12-25% control
- Total platforms = 125% control available
- **Can win game with platforms alone** (if you have 100% already from other sources)

**ROI Analysis**:

| Platform | Cost | Income/sec | Payback Time | Income/Day |
|----------|------|------------|--------------|------------|
| Sputify | $100M | $50K | 33 minutes | $4.32M |
| The Platform | $1B | $500K | 33 minutes | $43.2M |

All platforms pay for themselves in ~33 minutes. After that, pure profit forever.

### Late-Game Income Breakdown

**Scenario**: All platforms owned, 1000 songs at Tier 7 (50x), 3 prestiges

```
songIncome = 1000 songs * ($2 * 50 * 1.45) = $145,000/sec
platformIncome = $1,375,000/sec
legacyIncome = 3 artists * ~$100,000/sec = $300,000/sec
tourIncome = 3 tours * ~$500,000/sec = $1,500,000/sec

totalIncome = $3,320,000/sec (before boosts)
withBoosts = $3,320,000 * 48 (Dynamic Pricing + Scalp Tickets) = $159,360,000/sec
```

**Platforms provide stable income floor**. Even without songs/tours, platforms generate $1.4M/sec forever.

---

## Industry Control System

**Location**: `src/lib/systems/control.ts`

### Industry Control Sources

Industry control is the **victory condition**. Reach 100% to win.

#### A. Fan Milestones (14% Total)

| Fans | Control % | Cumulative |
|------|-----------|------------|
| 10,000 | +2% | 2% |
| 100,000 | +3% | 5% |
| 1,000,000 | +4% | 9% |
| 10,000,000 | +5% | 14% |

#### B. Tech Tier Milestones (23% Total)

| Tech Tier | Control % | Cumulative |
|-----------|-----------|------------|
| Tier 3 | +5% | 5% |
| Tier 6 | +8% | 13% |
| Tier 7 | +10% | 23% |

#### C. Phase Unlocks (26% Total)

| Phase | Name | Control % | Cumulative |
|-------|------|-----------|------------|
| Phase 2 | Physical Albums | +5% | 5% |
| Phase 3 | Tours | +6% | 11% |
| Phase 4 | Platform Ownership | +7% | 18% |
| Phase 5 | Industry Monopoly | +8% | 26% |

#### D. Prestige (8% per prestige, uncapped)

Each prestige: **+8% control**

- 1 prestige: 8%
- 2 prestiges: 16%
- 3 prestiges: 24%
- 5 prestiges: 40%
- 10 prestiges: 80%

**Critical**: Prestige control stacks additively. You can reach 100% with prestiges alone (13 prestiges = 104%).

#### E. Platform Ownership (125% Total Available)

See [Platform Ownership System](#platform-ownership-system) for breakdown.

Each platform: 12-25% control (7 platforms total)

### Total Control Calculation

```typescript
industryControl = fanControl
                  + techControl
                  + phaseControl
                  + prestigeControl
                  + platformControl

// Example:
fanControl = 14% (10M fans reached)
techControl = 23% (Tier 7 reached)
phaseControl = 26% (Phase 5 unlocked)
prestigeControl = 24% (3 prestiges)
platformControl = 125% (all 7 platforms)

total = 14 + 23 + 26 + 24 + 125 = 212%
// (Capped at 100% for victory display, but internal tracking allows overflow)
```

### Victory Condition

**Win Game**: Reach 100% industry control

**Display**: Control bar fills to 100%, victory screen shows

**Multiple Paths to Victory**:
1. **Prestige Path**: 13 prestiges = 104% (ignoring other sources)
2. **Platform Path**: Tier 6 (13%) + Phase 4 (18%) + Some fans (5%) + Platforms (125%) = 161%
3. **Balanced Path**: Mix of fans, tech, phases, prestiges, platforms

**Fastest Path** (Theoretical):
```
Tier 3 (5%) + Tier 6 (8%) + Tier 7 (10%) = 23% tech
Phase 2 (5%) + Phase 3 (6%) + Phase 4 (7%) = 18% phase
10M fans = 14%
3 prestiges = 24%
Sputify + Snapple Music = 27% platforms

Total = 23 + 18 + 14 + 24 + 27 = 106% (victory!)
```

**Note**: Game difficulty is balanced so most players reach 100% around 8-12 hours of play.

---

## Base Rates & Constants

**Location**: `src/lib/game/config.ts`

### Core Constants

```typescript
// Game Loop
TICK_RATE = 10                        // 10 ticks per second
TICK_INTERVAL = 100                   // 100ms between ticks
AUTO_SAVE_INTERVAL = 10000            // Auto-save every 10 seconds

// Initial State
INITIAL_MONEY = 10                    // $10 starting money
INITIAL_FANS = 0                      // 0 starting fans
INITIAL_TECH_TIER = 1                 // Start at Tier 1

// Song Generation
BASE_SONG_COST = 5.00                 // $5 per song (Tier 1)
BASE_SONG_GENERATION_TIME = 20000     // 20 seconds (Tier 1)
BASE_INCOME_PER_SONG = 2.00           // $2/sec per song
BASE_FAN_GENERATION_RATE = 2.0        // 2 fans/sec per song

// Trending
TRENDING_MULTIPLIER = 2.0             // 2x for matching genre
TRENDING_FADE_DURATION = 300000       // 5 minutes (300,000ms)
TREND_RESEARCH_COST = 1000000         // $1M to research trends

// Albums
ALBUM_SONG_REQUIREMENT = 10           // Release every 10 songs
ALBUM_COOLDOWN = 90000                // 90 seconds between releases
ALBUM_PAYOUT_PER_SONG = 25000         // $25K per song in album
ALBUM_PAYOUT_PER_FAN = 1.00           // $1 per fan
RE_RELEASE_MULTIPLIER = 0.5           // Re-releases pay 50%

// Tours
TOUR_COST = 250000                    // $250K per tour
TOUR_DURATION = 120000                // 2 minutes (120,000ms)
TOUR_BASE_INCOME = 5000               // $5K/sec base
TOUR_FAN_MULTIPLIER = 0.05            // $0.05 per fan per sec
TOUR_CATALOG_BONUS = 100              // $100/sec per song
TOUR_SCARCITY_MULTIPLIER = 1.5        // 1.5x with scarcity boosts

// Prestige
PRESTIGE_EXPERIENCE_BONUS = 0.15      // +15% per prestige
LEGACY_INCOME_RATIO = 0.80            // Legacy artists = 80% song income
CROSS_PROMOTION_RATE = 0.00001        // 0.001% of peak fans per sec
MAX_LEGACY_ARTISTS = 3                // Max 3 legacy artists

// Platforms
PLATFORM_COST_REDUCTION = 0.90        // 90% cheaper (from $1B-$10B to $100M-$1B)

// Industry Control
FAN_CONTROL_10K = 0.02                // 2% at 10K fans
FAN_CONTROL_100K = 0.03               // 3% at 100K fans
FAN_CONTROL_1M = 0.04                 // 4% at 1M fans
FAN_CONTROL_10M = 0.05                // 5% at 10M fans
TECH_CONTROL_T3 = 0.05                // 5% at Tier 3
TECH_CONTROL_T6 = 0.08                // 8% at Tier 6
TECH_CONTROL_T7 = 0.10                // 10% at Tier 7
PHASE_CONTROL_P2 = 0.05               // 5% at Phase 2
PHASE_CONTROL_P3 = 0.06               // 6% at Phase 3
PHASE_CONTROL_P4 = 0.07               // 7% at Phase 4
PHASE_CONTROL_P5 = 0.08               // 8% at Phase 5
PRESTIGE_CONTROL = 0.08               // 8% per prestige
```

### Derived Constants

```typescript
// Calculations
TICKS_PER_SECOND = 1000 / TICK_INTERVAL               // 10
SECONDS_PER_AUTO_SAVE = AUTO_SAVE_INTERVAL / 1000     // 10
MAX_DELTA_TIME = 5000                                 // Cap delta at 5 seconds

// Max Simultaneous
MAX_TOURS_TIER_3 = 1
MAX_TOURS_TIER_4 = 2
MAX_TOURS_TIER_5 = 3
```

---

## System Interactions

### Income Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        INCOME SOURCES                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────┐│
│  │   Songs     │  │   Legacy    │  │  Platforms  │  │ Tours  ││
│  │  (passive)  │  │   Artists   │  │  (passive)  │  │(active)││
│  │             │  │  (passive)  │  │             │  │        ││
│  │ sum(song.   │  │ sum(artist. │  │ sum(plat.   │  │sum(tour││
│  │  income)    │  │  income)    │  │  income)    │  │ income)││
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └───┬────┘│
│         │                │                │               │     │
│         └────────────────┴────────────────┴───────────────┘     │
│                              │                                  │
│                              ▼                                  │
│                      ┌──────────────┐                          │
│                      │  BASE INCOME │                          │
│                      │   (sum all)  │                          │
│                      └──────┬───────┘                          │
│                             │                                  │
│                             ▼                                  │
│                    ┌────────────────┐                         │
│                    │ APPLY BOOSTS   │                         │
│                    │ (multiplicative)│                         │
│                    └────────┬───────┘                         │
│                             │                                  │
│                             ▼                                  │
│                    ┌────────────────┐                         │
│                    │ TOTAL INCOME/  │                         │
│                    │    SECOND      │                         │
│                    └────────┬───────┘                         │
│                             │                                  │
│                             ▼                                  │
│                    ┌────────────────┐                         │
│                    │  * deltaTime   │                         │
│                    │     / 1000     │                         │
│                    └────────┬───────┘                         │
│                             │                                  │
│                             ▼                                  │
│                    ┌────────────────┐                         │
│                    │ money += income│                         │
│                    └────────────────┘                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Song Creation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     SONG CREATION FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Player clicks "Queue Song"                                     │
│           │                                                     │
│           ▼                                                     │
│  ┌──────────────────┐                                          │
│  │ Calculate Cost   │ = getCurrentSongCost(gameState)          │
│  │ (based on tech)  │   ($5 → $0 across tiers)                 │
│  └────────┬─────────┘                                          │
│           │                                                     │
│           ▼                                                     │
│  ┌──────────────────┐                                          │
│  │ Deduct Money     │ money -= totalCost                       │
│  └────────┬─────────┘                                          │
│           │                                                     │
│           ▼                                                     │
│  ┌──────────────────┐                                          │
│  │ Add to Queue     │ songQueue.push(...newSongs)              │
│  │ (with metadata)  │ (progress=0, genre, artistName)          │
│  └────────┬─────────┘                                          │
│           │                                                     │
│           ▼                                                     │
│  [Wait in queue until first position]                          │
│           │                                                     │
│           ▼                                                     │
│  ┌──────────────────┐                                          │
│  │ Progress Ticks   │ progress += deltaTime                    │
│  │ (every 100ms)    │ (until progress >= generationTime)       │
│  └────────┬─────────┘                                          │
│           │                                                     │
│           ▼                                                     │
│  ┌──────────────────┐                                          │
│  │ Song Completes   │ progress >= generationTime               │
│  └────────┬─────────┘                                          │
│           │                                                     │
│           ▼                                                     │
│  ┌──────────────────────────────────────┐                     │
│  │ Calculate Final Stats (BAKED IN):    │                     │
│  │                                       │                     │
│  │ techMult = getHighestIncomeMultiplier │                     │
│  │ expMult = 1.0 + (prestige * 0.15)    │                     │
│  │ trendMult = calculateTrendingMult()   │                     │
│  │                                       │                     │
│  │ income = $2 * techMult                │                     │
│  │          * expMult * trendMult        │                     │
│  │ fanRate = 2.0 * trendMult             │                     │
│  └────────┬──────────────────────────────┘                     │
│           │                                                     │
│           ▼                                                     │
│  ┌──────────────────┐                                          │
│  │ Add to Songs[]   │ songs.push(completedSong)                │
│  │ (starts earning) │                                          │
│  └──────────────────┘                                          │
│                                                                 │
│  Song now generates income/fans every tick forever             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Multiplier Interaction Matrix

| Multiplier Type | Applied When | Affects | Stacks With | Persists |
|-----------------|--------------|---------|-------------|----------|
| **Tech Income** | Song creation | Song income | Prestige, Trending | Forever (baked) |
| **Prestige Experience** | Song creation, Tours | Song income, Tour income | Tech, Trending | Forever (baked) |
| **Trending Genre** | Song creation | Song income, Fans | Tech, Prestige | Forever (baked) |
| **Active Boosts** | Every tick | ALL income, ALL fans | Other boosts | Duration only |
| **Tour Scarcity** | Tour active | Tour income only | Active boosts | Duration only |
| **Album Variants** | Album release | Album payout | None | One-time |

**Key Insight**: Song multipliers are **snapshot at creation**. Boost multipliers are **dynamic and temporary**.

### Progression Milestone Chart

```
TIME    TECH    MONEY           FANS        MILESTONES
────────────────────────────────────────────────────────────────
0:00    T1      $10             0           Start
0:05    T1      $100            10          First songs
0:15    T1      $1,500          100         Tier 1 Elite
0:30    T2      $15,000         1,000       FREE SONGS!
1:00    T2      $100,000        10,000      Albums unlock (+2% control)
1:30    T3      $500,000        50,000      Prestige unlock
2:00    T3      $2,000,000      100,000     Tours unlock (+3% control)
3:00    T4      $10,000,000     500,000     Fast generation
4:00    T4      $50,000,000     1,000,000   Platforms unlock (+4% control)
5:00    T5      $200,000,000    2,000,000   High multipliers
6:00    T5      $1,000,000,000  5,000,000   Platform purchases begin
7:00    T6      $5,000,000,000  10,000,000  Monopoly phase (+5% control)
8:00    T6      $25B+           25M+        First platform owned
9:00    T7      $100B+          50M+        Multiple platforms
10:00   T7      $500B+          100M+       Industry domination
11:00   T7      $1T+            500M+       Near victory
12:00   T7      $10T+           1B+         100% CONTROL - VICTORY
```

**Note**: Timeline varies by player strategy, prestige timing, and boost usage.

---

## Advanced Strategies & Interactions

### Optimal Early Game (0-30 minutes)

1. **Queue songs manually** until Tier 1 Elite ($1,500 total spent)
2. **Research trend** as soon as $1M available (2x income for 5 min)
3. **Buy Tier 2 Basic immediately** (songs become FREE)
4. **Generate mass songs** (no cost, builds passive income)
5. **Wait for albums** (auto-release at 10 songs for instant cash)

### Optimal Mid Game (30 min - 2 hours)

1. **Prestige at Tier 3** (get 15% bonus early)
2. **Rush to Tier 4** with prestige bonus (faster rebuild)
3. **Prestige again** (stack to 30% bonus)
4. **Build legacy artists** (3 prestiges = 24% control + passive income)
5. **Unlock tours** (Tier 3 + 10 albums + 100K fans)
6. **Stack boosts during tours** (48x income possible)

### Optimal Late Game (2-8 hours)

1. **Push to Tier 6-7** (15x-50x income multipliers)
2. **Buy platforms** (constant $1.4M/sec income floor)
3. **Maximize legacy artists** (prestige with peak songs/fans)
4. **Farm industry control** (fans + tech + phases + prestiges + platforms)
5. **Victory** (100% control)

### Prestige Timing Strategy

**Bad Prestige**: Reset early with few songs/fans
- Wastes time rebuilding
- Legacy artist income is low
- Minimal cross-promotion

**Good Prestige**: Reset at tier milestone with strong catalog
- +15% experience bonus
- Strong legacy artist income (80% of songs)
- Good cross-promotion (peak fans)

**Optimal Prestige**: Reset at Tier 3, 4, 5 milestones
- Each tier jump = good time to reset
- Rebuild faster with experience bonus
- Stack 3+ prestiges by mid-game (24%+ control)

### Boost Stacking Combos

**Max Income Combo**:
```
Dynamic Pricing (8x) + Scalp Tickets (6x) = 48x income
Cost: ~$250M + $100M (usage-dependent)
Duration: 120s overlap
Best Used: During 3 simultaneous tours (3 * 48 = 144x effective)
```

**Max Fans Combo**:
```
Viral Marketing (5x) + FOMO (2.5x) + Playlist Payola (3x) = 37.5x fans
Cost: ~$500K + $75M + $250K
Duration: 45s overlap
Best Used: Before album release (higher variant count)
```

**Balanced Combo**:
```
Limited Variants (4x income, 1.2x fans) + Exclusive Deals (3x income, 1.5x fans)
= 12x income, 1.8x fans
Cost: ~$2.5M + $7.5M
Duration: 60s
Best Used: General farming, affordable late-game
```

### Industry Control Speed-Run

**Fastest Path to 100%**:
```
1. Rush Tier 7 (23% control from tech milestones)
2. Unlock all phases (26% control from phase unlocks)
3. Reach 10M fans (14% control from fan milestones)
4. Prestige 3 times (24% control from prestige)
5. Buy 2-3 platforms (27-45% control)

Total: 23 + 26 + 14 + 24 + 27 = 114% (victory at 100%)
```

**Estimated Time**: 8-10 hours for experienced players

---

## Appendix: Common Calculations

### Calculate Current Song Income

```typescript
function calculateSongIncome(gameState: GameState): number {
  return gameState.songs.reduce((total, song) => {
    return total + song.incomePerSecond
  }, 0)
}
```

### Calculate Total Passive Income (No Boosts)

```typescript
function calculatePassiveIncome(gameState: GameState): number {
  const songIncome = calculateSongIncome(gameState)

  const legacyIncome = gameState.legacyArtists.reduce((total, artist) => {
    return total + artist.incomeRate
  }, 0)

  const platformIncome = gameState.platforms.reduce((total, platform) => {
    return total + platform.incomePerSecond
  }, 0)

  return songIncome + legacyIncome + platformIncome
}
```

### Calculate Max Affordable Songs

```typescript
function calculateMaxAffordable(gameState: GameState): number {
  const cost = getCurrentSongCost(gameState)
  if (cost === 0) return 10 // Free songs, cap at 10 for UI
  return Math.floor(gameState.money / cost)
}
```

### Calculate Time to Milestone

```typescript
function calculateTimeToMoney(
  gameState: GameState,
  targetMoney: number
): number {
  const currentIncome = calculateTotalIncome(gameState) // includes boosts
  if (currentIncome <= 0) return Infinity

  const moneyNeeded = targetMoney - gameState.money
  if (moneyNeeded <= 0) return 0

  return moneyNeeded / currentIncome // seconds
}
```

### Calculate Prestige Value

```typescript
function calculatePrestigeValue(gameState: GameState): {
  legacyIncome: number
  experienceMultiplier: number
  crossPromotion: number
} {
  const legacyIncome = calculateSongIncome(gameState) * 0.80
  const experienceMultiplier = 1.0 + ((gameState.prestigeCount + 1) * 0.15)
  const crossPromotion = gameState.peakFans * 0.00001

  return { legacyIncome, experienceMultiplier, crossPromotion }
}
```

---

## Changelog

**v1.0.0** (2025-11-11)
- Initial comprehensive system breakdown
- Documented all income sources, multipliers, and progression systems
- Includes base rates, formulas, and strategic insights
- Cross-referenced with actual codebase implementation

---

**For Developers**: This document reflects the implemented game systems as of the current codebase. For code architecture details, see `tech-details.md`. For gameplay experience design, see `game-details.md`.
