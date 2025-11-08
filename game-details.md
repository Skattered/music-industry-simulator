# AI Music Idle Game - Design Document

## Core Concept
An idle/incremental game where you're an AI music creator progressing from zero to total music industry domination. The game is a reflection on capitalism vs art in music, focusing on content volume over quality and industry exploitation mechanics.

**Target Play Time:** 2-12 hours
**Complexity:** Easy to understand, linear progression (no strategic choices)
**Theme:** Building an AI music empire through increasingly gross capitalist tactics

---

## Core Game Loop

### Initial Gameplay (First 5 Minutes)
1. Start with enough money to click "Generate Song" once
2. Song earns ~$0.01/minute from streams
3. Use earnings to make more songs (1x/5x/10x/Max purchase buttons)
4. More songs = more passive income
5. Unlock fan generation and multipliers

### Primary Resources
- **Money** - Used to create songs and purchase upgrades
- **Songs** - Generate passive income from streams
- **Streams/Plays** - Convert to money over time
- **Fans** - Multiply income from all songs

---

## Progression Systems

### Tech Stack Progression
Players upgrade their music creation capabilities through these tiers:

1. **Third-party Web Services** (Starting point)
   - Pay per song generation ($1 per song initially)
   - Manual creation, ~30 second generation time

2. **Lifetime Licenses/Subscriptions** ($500)
   - **Songs become FREE to generate**
   - Reduced generation time (~15 seconds)
   - Still manual queueing

3. **Local AI Models** ($5,000) - **PRESTIGE UNLOCK #1**
   - **Automation begins** - AI agents start managing production
   - Further reduced generation time (~5 seconds)
   - Unlocks GPU resource system
   - Songs earn more per stream (better quality)
   - Sub-tiers: Local Model v1 → v2 → v3 (incremental improvements)

4. **Fine-tuned Models** ($50,000)
   - Continued automation improvements
   - Generation time ~2 seconds
   - Songs earn significantly more per stream
   - Sub-tiers: Fine-tune v1 → v2 → v3

5. **Train Your Own Models** ($500,000) - **PRESTIGE UNLOCK #2**
   - Near-instant generation (~1 second)
   - Major income boost per song
   - Custom AI trained on your style
   - Sub-tiers: Training iterations v1 → v2 → v3

6. **Build Your Own Software** ($5,000,000) - **PRESTIGE UNLOCK #3**
   - Instant generation
   - Maximum income per song
   - Complete control over the stack
   - Sub-tiers: Software v1 → v2 → v3

7. **AI Agent Automation** ($50,000,000) - **PRESTIGE UNLOCK #4**
   - Deploy AI agents to manage production, marketing, releases
   - Agents handle playlist submissions, social media, optimization
   - Automate marketing, releases, and all operations
   - Ultimate "hands-off" tier
   - Sub-tiers: Agent capabilities v1 → v2 → v3

**Sub-Tier Design Philosophy:**
- Each sub-tier unlocks new capabilities rather than just stat boosts
- Examples:
  - Local Model v1: Basic automation of song generation
  - Local Model v2: Automatically handles album variants
  - Local Model v3: Optimizes release timing for maximum engagement
- Provides meaningful progression between major tech tiers
- Costs increase with each sub-tier

Each tier makes songs faster and/or generates more income per stream.

### Scale Progression
1. **Streaming Plays** - Base income generation
2. **Physical Sales** - CDs, vinyl, merch
3. **Concerts** - Live performances (fake/virtual)
4. **Industry Domination** - Absurd late-game scale

---

## Exploitation/Capitalism Mechanics

### Early Game - Algorithm Gaming (Streaming Phase)
- **Buy Bot Streams** - Fake plays to boost algorithm ranking
- **Pay for Playlist Placement** - Premium spots on curated playlists
- **Social Media Promo Campaigns** - Buy followers and engagement

**Exploitation Mechanic Structure:**
- These are **activated abilities** - spend money to activate, gives temporary boost
- Each activation costs money and provides income/fan boost for X duration
- Can activate multiple simultaneously
- Costs scale up with each use, but so do benefits
- No cooldowns - just escalating costs (balances spending vs saving for upgrades)
- Creates active "spend money to make more money" gameplay layer

### Mid Game - Manufactured Scarcity (Physical & Concert Phase)

**Physical Sales Exploitation:**
- **Limited Edition Variants** - Create artificial scarcity for higher payouts
- **Shut Down Etsy Competitors** - Lower manufacturing costs by eliminating competition
- **Exclusive Retailer Deals** - Lock content behind specific stores
- **Collector's Editions** - Milk superfans with premium versions
- **Scalp Your Own Limited Records/Merch** - Resell at markup
- **Re-releases** - Package old songs again for new payouts
- **Deluxe Albums + Bonus Tracks** - Milk existing fans harder
- **Exclusive Merch Bundles** - Tie music to physical goods

**Concert Exploitation:**
- **Limit Ticket Release** - Only release X% of capacity for higher prices
- **Scalp Your Own Tickets** - Resell held-back tickets at markup
- **Create Resale Market** - Build secondary market you control, take cuts
- **FOMO Marketing** - "Instant sellouts" drive demand
- **Dynamic Pricing** - Surge pricing based on artificial demand
- **Own Ticketing Platform** - Control all ticketing, take platform fees
- **Venue Ownership** - Reduce costs, increase profits
- **Mandatory Merch Bundles** - Force ticket buyers to purchase merch

### Late Game - Industry Monopoly
- **Own the Streaming Platform** - Control distribution
- **Control the Algorithm** - Decide what people hear
- **Own Training Data/Models** - Other artists pay YOU to use AI tools
- **Manipulate Charts** - Pay to manipulate Billboard rankings
- **Acquire Billboard** - Own the charts, decide what's #1
- **Buy the Grammys** - Control awards and recognition
- **Algorithm Priority Purchases** - Pay streaming services for better placement (early), then own them (late)

---

## Prestige System: "New Artist"

### How It Works
When you create a new artist:
- Previous artist becomes a "legacy artist"
  - Frozen in time at current stats
  - Continues earning at same rate (or slightly reduced)
  - **Legacy artist fading mechanic:**
    - Keep the 2-3 most recent legacy artists active
    - When a 4th prestige occurs, the oldest legacy artist "retires"
    - Retired artists stop generating income (array.shift() implementation)
    - This prevents infinite exponential growth while maintaining progression feel
- New artist starts with:
  - 0 songs
  - 0 fans
  - All tech/tools KEPT from previous playthrough

### Prestige Bonuses
- **"Experience" Multiplier** - Based on previous artist's peak fans, songs earn more or gain fans faster
- **"Cross-Promotion"** - Legacy artists slowly funnel fans to new artist over time
- **Speed Boost** - Same tech with fresh start = much faster rebuild

### Unlock Condition
Available after reaching major tech tier milestones:
- **First Prestige:** Unlock Local Models
- **Second Prestige:** Train Your Own Model
- **Third Prestige:** Build Your Own Software
- **Fourth+ Prestige:** Deploy AI Agents (or subsequent major tech achievements)

Creates narrative of "starting a new band with better tools/experience."

---

## Early Game Progression (First 30-60 minutes)

### Phase 1: Manual Generation (0-5 minutes)
1. **Start:** Click "Generate Song" with starting money
2. **Song creation takes time** - maybe 10-30 seconds per song initially
3. Completed songs generate passive income (~$0.01/min from streams)
4. Songs automatically attract fans just by existing
5. Buy more songs with queue buttons:
   - 1x - Generate one song
   - 5x - Queue 5 songs (they generate sequentially)
   - 10x - Queue 10 songs
   - Max - Queue as many as you can afford
6. Income scales linearly with number of COMPLETED songs

### Phase 2: First Exploitation (5-15 minutes)
1. **Unlock: Buy Bot Streams**
   - Can't afford many at first, just a small boost
   - Slightly increases income from existing songs
   - First taste of "gaming the system"

2. **Unlock: Pay for Playlist Placement**
   - Bigger investment, bigger fan growth
   - Songs on playlists attract fans faster

### Phase 3: Marketing & Optimization (15-30 minutes)
1. **Unlock: Trend Research**
   - Costs money initially (later costs GPU resources)
   - Research to change current trending genre (pop, hip-hop, etc.)
   - Next songs you generate follow trending genre
   - Trending songs attract more fans
   - Focus on SELLING music, not making it better
   - Trends only change when you manually research

2. **Unlock: Social Media Campaigns**
   - Buy followers/engagement
   - Accelerates fan growth across all songs

### GPU Resources (Mid-Game Currency)
- **Unlocks with local model tier**
- More abstract resource representing computational power
- Primary use: **Speeds up song generation**
  - Spend GPU to reduce generation time
  - Higher GPU investment = faster song output
- Also used for trend research in mid-game
- Player buys GPU resources with money
- Creates a resource loop: More GPU → Faster songs → More money → Buy more GPU resources

### Phase 4: First Tech Upgrade (30-60 minutes)
1. **Unlock: Lifetime License/Subscription**
   - Reduces cost per song significantly
   - **Reduces generation time** - songs complete faster
   - Can generate songs much faster now
   - Sets up transition to automation unlocks

### Song Generation Mechanics
- **Early game:** Songs take 10-30 seconds to generate
- **Queue system:** Can queue multiple songs with 5x/10x/Max buttons, they generate sequentially
- **Progress bar:** Shows current song being generated
- **Queue display:** Shows "X songs queued"
- **Tech upgrades reduce generation time:**
  - Better services = faster generation
  - Local models = even faster
  - Eventually near-instant with high-tier tech
- **Keeps player clicking/queueing** for a significant portion of the game
- Prevents exponential song count in first 10 minutes

### Naming System
- **Songs and artists use procedural mad-lib style generation**
- Generated from curated word lists
- Examples: "[Adjective] [Noun]" or "[Word] in [Place]"
- Adds personality and humor to the game
- **Implementation Note:** Word lists should be defined in `src/lib/data/names.ts`
  - Suggested categories: adjectives, nouns, verbs, places, emotions, colors
  - Song titles: Combine 2-3 words from different lists
  - Artist names: Use similar mad-lib approach or single memorable words
  - Aim for 50-100 words per category for variety

---

## Mid-Late Game Progression (Progression Through Automation)

### Core Philosophy
Each phase starts as the **active focus**, then becomes **passive/automated** as the next phase unlocks. Player always has one primary active system, with previous systems running automatically in the background.

**Automation Mechanics:**
- No explicit "automate" buttons - happens naturally through tech upgrades
- As generation time decreases (30s → 5s → 1s → instant), systems feel automated
- Flavor text: AI agents working for you (managing releases, bookings, etc.)
- Previous phase becomes background passive income when new phase unlocks

**Phase Unlock Discovery:**
- Milestone requirements hidden from player
- Natural discovery as you hit thresholds
- Creates surprise "new system unlocked!" moments

**Prestige Unlock Conditions:**
- Tied to major tech tier achievements
- Available once you reach: Local Models, Trained Models, Own Software, etc.
- Encourages pushing tech progression to unlock prestige

### Phase 2: Physical Albums (Hour 1-3)

**Unlock Requirements:**
- 100 songs completed
- 10,000 fans
- $5,000
- Reasoning: Proven catalog + audience + capital to manufacture

**When Songs Become Semi-Passive:**
- Songs still generating but much faster (lifetime licenses, better tech)
- Player focus shifts to physical releases

**Physical Album Mechanics:**
- Albums automatically release at song milestones (every X songs completed)
- Generate big one-time payouts
- **Variant System:** More fans = more variants release simultaneously (standard, deluxe, vinyl, limited edition)
- Can re-release old albums later for additional payouts
- Upgrades increase payout size and add exploitation mechanics

**Physical Exploitation Unlocks:**
- Limited edition variants (artificial scarcity)
- Shut down competitors (lower costs)
- Exclusive retailer deals
- Scalp your own limited records/merch
- Collector's editions

### Phase 3: Tours & Concerts (Hour 3-6)

**Unlock Requirements:**
- 10 physical albums released
- 100,000 fans
- Own Local Models (tech tier)
- Reasoning: Established physical presence + big fanbase + tech to scale

**When Physical Becomes Fully Passive:**
- Albums release automatically at milestones
- Player focus shifts to tours

**Tour Mechanics:**
- Tours run automatically once unlocked
- Generate passive income scaling with total song catalog
- Income increases through scarcity manipulation (abstract - no ticket counting)
- Can run multiple tours simultaneously (AI performer advantage)
- Upgrades increase profitability through exploitation

**Concert Exploitation Unlocks:**
- Limit ticket releases (artificial scarcity)
- Scalp own tickets
- Create/own resale market
- FOMO marketing
- Dynamic pricing
- Own ticketing platforms
- Venue ownership
- Mandatory merch bundles

### Phase 4: Platform Ownership (Hour 6-9)

**Unlock Requirements:**
- 50 tours completed
- 1,000,000 fans
- Own Your Software (tech tier)
- Reasoning: Proven live revenue + massive influence + infrastructure to compete

**When Tours Become Fully Passive:**
- Tours run automatically
- Songs near-instant or fully automated
- Player focus shifts to monopoly acquisitions

**Platform Mechanics:**
- Buy major industry infrastructure
- Each acquisition increases passive income and control bar progress
- Other artists now generate income for YOU
- Control distribution, algorithms, and industry standards

**Monopoly Unlocks:**
- Own streaming platforms
- Control algorithms
- Manipulate charts (pay to influence)
- Acquire Billboard (own the charts)
- Buy the Grammys
- Own training data/models

### Phase 5: Total Automation (Hour 9-12)

**Unlock Requirements:**
- Own at least 3 major platforms
- 10,000,000 fans
- AI Agents deployed (tech tier)
- Reasoning: Already dominant, now consolidating total control

**When Everything is Passive:**
- All systems fully automated with AI agents
- Player just watches empire grow
- Focuses on final monopoly purchases
- Industry control bar approaches 100%

**Final Unlocks:**
- AI agent full automation
- Complete industry domination
- Training data monopolies
- Victory condition reached

---

## Primary Resources

### Money (Primary Currency)
- Earned from song streams
- **Used throughout entire game** for songs, upgrades, and buying GPU resources
- Primary driver of progression

### GPU Resources (Mid-Game Boost)
- Unlocks with local model tier
- Abstract resource representing computational power
- Purchased with money
- Used to: Speed up song generation, trend research
- **Creates resource loop:** GPU → Faster songs → More money → More GPU

### Songs
- Created by player (costs money/time)
- Generate passive income from streams
- Also generate fans passively

### Streams/Plays
- Generated passively by songs
- Convert to money over time

### Fans
- Generated passively by songs
- Growth accelerated by exploitation mechanics
- **Reserved for prestige multiplier system**
- Visible stat but doesn't affect income until prestige

### Music "Quality" vs Marketing Philosophy
- **Tech upgrades** (better models, local processing) = songs earn more per stream (technical improvement)
- **Marketing/trend research** = songs attract fans faster (better at selling)
- Game emphasizes that selling > creating in terms of unlocks and progression

---

## Open Questions / To Be Determined (For Implementation Agent)
- Exact income rates and scaling curves
- Specific costs for individual upgrades and exploitation abilities
- Balance between different currency earn rates
- Visual design/UI approach and layout
- Specific sub-tier upgrade capabilities and costs
- **Word lists for song title and artist name generation**
- GPU resource costs and usage rates
- Offline progression mechanics (if any)
- Save system implementation
- Exact duration and cost scaling for activated abilities
- Victory screen and end game presentation
- Audio/visual feedback and animations

**Note on resolved items:**
- ✅ Legacy artist count: Keep 2-3 most recent (see Prestige System section)
- ✅ Word list implementation: See Naming System section for guidance

---

## End Game & Win Condition

### Industry Control Progress Bar
- Visible throughout entire game
- Fills up as you hit major accomplishments across ALL playthroughs (persists through prestige)
- Reaches 100% = "You Control the Music Industry" ending
- Expected completion: 3-5 prestige runs, 8-12 hours total

**Implementation Notes:**
- Store `industryControl` as 0-100 number in GameState
- Progress bar component shows visual fill percentage
- Persist through prestige (never reset this value)
- Victory modal triggers when reaching 100%
- Victory screen should celebrate player's achievement with stats summary

### What Fills the Progress Bar
- Reaching major fan thresholds (10k, 100k, 1M, etc.) - suggest 2-5% each
- Unlocking major tech tiers (local models, own software, AI agents) - suggest 5-10% each
- Hitting scale milestones (streaming → physical → concerts → platform ownership) - suggest 5-8% each
- Each prestige adds a chunk - suggest 5-10% per prestige
- Owning monopoly upgrades (streaming platform, algorithm control, Billboard, Grammys, etc.) - suggest 3-7% each

### Expected Progression Arc (3-5 Prestiges)

**Prestige 1: Streaming Dominance** (0-2 hours)
- Build from zero to streaming success
- Unlock exploitation mechanics
- End: First prestige (unlock local models milestone)

**Prestige 2: Physical & Merch** (2-4 hours)
- Scale into physical sales, merch, variants
- More aggressive manipulation tactics
- End: Second prestige (trained your own model milestone)

**Prestige 3: Live Performance Empire** (4-7 hours)
- Concerts, tours, artificial scarcity
- Starting to control distribution
- End: Third prestige (built your own software milestone)

**Prestige 4: Platform Ownership** (7-10 hours)
- Own the streaming platform
- Control the algorithm
- Other artists pay you

**Prestige 5: Total Monopoly** (10-12 hours)
- Own the training data
- Control all distribution
- Acquire Billboard and Grammys
- Hit 100% industry control

---

## Design Notes
- Game should be playable without strategic decisions - just optimization
- Thematic focus on quantity over quality reflects real industry trends
- Progression should feel absurd at high levels (taking over the entire music industry)
- Not designed as endless game - has a natural conclusion point
- **Player is an invisible puppet master** - not a public figure, manipulating industry from behind the scenes
- **Progression through automation** - each phase starts active, becomes passive as next phase unlocks
