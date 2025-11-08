# Music Industry Simulator - Implementation Plan

## Overview

This implementation plan breaks down the Music Industry Simulator (AI Music Idle Game) into discrete, parallelizable tasks that can be executed as individual Claude Code prompts. Each section is designed to be copy-pasted directly into Claude Code.

**Status Update (after rebase):**
- ✅ README.md is already written (see Task 7.2 - marked as complete)
- ✅ Documentation has been enhanced with implementation notes
- ✅ Project name standardized to "music-industry-simulator"

**Key Principles:**
- Tasks within each phase can be worked on in parallel
- Use subagents for test creation and UI components when specified
- Each task is self-contained with clear success criteria
- Tasks build on the foundation established in previous phases

---

## Phase 0: Project Setup & Foundation

### Task 0.1: Initialize SvelteKit Project (MUST DO FIRST)

```
Initialize a new SvelteKit project with Svelte 5, TypeScript, and TailwindCSS for the Music Industry Simulator.

Requirements:
1. Use `npx sv create .` to initialize in current directory
2. Select: SvelteKit minimal template, TypeScript, Prettier, Tailwind CSS, Vitest
3. Install these additional dependencies:
   - @sveltejs/adapter-static
   - @testing-library/svelte
   - @vitest/ui
4. Configure svelte.config.js:
   - Use adapter-static
   - Set base path to '/music-industry-simulator' for GitHub Pages
   - Set fallback to 'index.html'
5. Create static/.nojekyll file (required for GitHub Pages)
6. Update vite.config.ts to include Vitest configuration
7. Configure TailwindCSS with custom game theme colors:
   - game-bg: #0a0a0a
   - game-panel: #1a1a1a
   - game-accent: #3b82f6
8. Create .gitignore with node_modules, build, .svelte-kit, etc.
9. Update package.json scripts to include test commands

NOTE: README.md is already written - skip that step!

Success criteria:
- npm run dev starts development server
- npm run build creates static files
- npm test runs (even with no tests yet)
- TypeScript strict mode enabled
```

### Task 0.2: Create TypeScript Type Definitions

```
Create comprehensive TypeScript type definitions for the game state in src/lib/game/types.ts.

Requirements:
1. Define all interfaces based on tech-details.md and game-details.md:
   - GameState (main state container)
   - Song (individual song with income/fan generation)
   - QueuedSong (songs being generated)
   - Artist (current artist info)
   - LegacyArtist (prestige legacy artists)
   - Upgrade (purchased upgrades)
   - ActiveBoost (temporary exploitation abilities)
   - UnlockedSystems (feature flags)
   - TechTier, PhysicalAlbum, Tour, Platform types
2. Use strict typing - no 'any' types
3. Include JSDoc comments for complex types
4. Export all types for use across the codebase

Files to create:
- src/lib/game/types.ts

Success criteria:
- All interfaces compile without errors
- Types match the game design specification
- Can be imported from other files
```

### Task 0.3: Create Game Configuration Constants

```
Create game configuration file with all constants, costs, and balance values.

Requirements:
1. Create src/lib/game/config.ts with:
   - TICK_RATE (100ms)
   - SAVE_KEY and BACKUP_KEY constants
   - Initial resource values (starting money: $10)
   - Tech tier definitions (costs, effects, generation speeds)
   - Phase unlock requirements
   - Base income/fan rates
   - Exploitation ability costs and effects
2. Use UPPER_SNAKE_CASE for constants
3. Export all configuration objects
4. Add comments explaining balance decisions

Files to create:
- src/lib/game/config.ts

Success criteria:
- All game constants in one place
- Easy to adjust balance values
- Typed configuration objects
- No magic numbers in other files
```

---

## Phase 1: Core Game Systems (PARALLEL TASKS)

**All tasks in Phase 1 can be worked on simultaneously.**

### Task 1.1: Implement Game Engine & Loop

```
Create the core game engine with tick-based loop running at 10 TPS.

Requirements:
1. Create src/lib/game/engine.ts with GameEngine class:
   - Constructor takes GameState parameter
   - start() method initializes interval at 100ms
   - stop() method clears interval and auto-saves
   - tick() method calculates deltaTime and calls all system processors
   - Handle edge cases: tab visibility, clock changes
2. Implement frame-independent logic using deltaTime
3. Add auto-save every 10 seconds
4. Include start/stop state management
5. Use TypeScript strict mode

Files to create:
- src/lib/game/engine.ts

Files to reference:
- src/lib/game/types.ts
- src/lib/game/config.ts

Success criteria:
- Engine runs at consistent 10 TPS
- DeltaTime calculated correctly
- Can start and stop cleanly
- No memory leaks
- Write unit tests to verify tick rate accuracy
```

### Task 1.2: Implement Save/Load System

```
Create localStorage-based save/load system with backup and validation.

Requirements:
1. Create src/lib/game/save.ts with functions:
   - saveGame(state: GameState): boolean
   - loadGame(): GameState | null
   - loadBackup(): GameState | null
   - validateSave(state: any): state is GameState
   - deleteSave(): void
   - exportSave(): string | null (returns data URL for download)
   - importSave(fileContent: string): boolean
2. Always keep a backup of the previous save
3. Validate save structure before loading
4. Handle localStorage quota errors gracefully
5. Support export/import for manual backups

Files to create:
- src/lib/game/save.ts

Success criteria:
- Saves persist across page reloads
- Invalid saves fall back to backup
- Export creates downloadable JSON file
- Import validates before accepting
- Write unit tests for validation logic
- Handle quota exceeded errors
```

### Task 1.3: Implement Song Generation System

```
Create the song generation system with queue, cost calculation, and income.

Requirements:
1. Create src/lib/systems/songs.ts with functions:
   - generateSong(state: GameState): Song
   - queueSongs(state: GameState, count: number): boolean
   - processSongQueue(state: GameState, deltaTime: number): void
   - calculateSongCost(state: GameState, count: number): number
   - calculateSongIncome(state: GameState): number
   - calculateFanGeneration(state: GameState): number
2. Queue system processes songs sequentially
3. Generation time based on tech tier
4. Songs become free at tech tier 2+
5. Income scales with tech tier and experience multiplier
6. Use crypto.randomUUID() for song IDs

Files to create:
- src/lib/systems/songs.ts

Reference design doc sections:
- Song Generation Mechanics (game-details.md)
- Tech Stack Progression (game-details.md)

Success criteria:
- Songs queue correctly
- Cost calculation matches tech tier
- Income scales properly
- Queue processes sequentially
- Write comprehensive unit tests (>80% coverage)
```

### Task 1.4: Implement Income & Fan Systems

```
Create income generation and fan accumulation systems.

Requirements:
1. Create src/lib/systems/income.ts:
   - generateIncome(state: GameState, deltaTime: number): void
   - calculateTotalIncome(state: GameState): number
   - applyIncomeMultipliers(state: GameState, baseIncome: number): number
2. Create src/lib/systems/fans.ts:
   - generateFans(state: GameState, deltaTime: number): void
   - calculateFanGeneration(state: GameState): number
   - updatePeakFans(state: GameState): void
3. Income from songs accumulates each tick
4. Fans grow passively from songs
5. Track peak fans for prestige bonuses
6. Apply active boost multipliers

Files to create:
- src/lib/systems/income.ts
- src/lib/systems/fans.ts

Success criteria:
- Income accumulates correctly over time
- Fan count increases passively
- Peak fans tracked accurately
- Frame-independent calculations
- Unit tests verify calculations
```

### Task 1.5: Implement Tech Upgrade System

```
Create the tech tier upgrade system with 7 tiers and sub-tiers.

Requirements:
1. Create src/lib/systems/tech.ts:
   - purchaseTechUpgrade(state: GameState, upgradeId: string): boolean
   - canAffordUpgrade(state: GameState, upgradeId: string): boolean
   - applyTechEffects(state: GameState, upgrade: TechUpgrade): void
   - getTechUpgrades(): TechUpgrade[]
   - unlockPrestigePoints(state: GameState): void
2. Define all 7 tech tiers from game-details.md:
   - Third-party services ($1/song, 30s)
   - Lifetime licenses ($500, free songs, 15s)
   - Local models ($5k, 5s, unlock GPU + prestige)
   - Fine-tuned models ($50k, 2s)
   - Train your own ($500k, 1s, prestige unlock)
   - Build your software ($5M, instant, prestige unlock)
   - AI agents ($50M, automation, prestige unlock)
3. Each tier has 3 sub-tiers with incremental improvements
4. Apply effects: generation speed, income multiplier, unlock systems

Files to create:
- src/lib/systems/tech.ts
- src/lib/data/tech-upgrades.ts (upgrade definitions)

Success criteria:
- All 7 tiers purchasable
- Effects apply correctly
- Sub-tiers unlock progressively
- Prestige unlocks at correct tiers
- Unit tests verify purchase logic
```

### Task 1.6: Create Utility Functions

```
Create helper utilities for formatting, calculations, and common operations.

Requirements:
1. Create src/lib/game/utils.ts:
   - formatMoney(amount: number): string (handles K, M, B, T)
   - formatNumber(num: number): string
   - formatTime(seconds: number): string
   - formatDuration(ms: number): string
   - clamp(value: number, min: number, max: number): number
   - lerp(a: number, b: number, t: number): number
   - getRandomInt(min: number, max: number): number
2. Handle edge cases (negative numbers, very large numbers, etc.)
3. Consistent formatting across the game
4. Performance optimized for frequent calls

Files to create:
- src/lib/game/utils.ts

Success criteria:
- All formatters handle edge cases
- Numbers display cleanly (e.g., "$1.23M" not "$1234567")
- Unit tests cover all formatting scenarios
```

---

## Phase 2: Name Generation & Content (PARALLEL TASKS)

**These tasks can be worked on simultaneously and in parallel with Phase 1.**

### Task 2.1: Create Word Lists for Mad-lib Names

```
Create comprehensive word lists for procedurally generating song and artist names.

Requirements:
1. Create src/lib/data/words.ts with arrays:
   - ADJECTIVES: 50-100 adjectives (e.g., "Electric", "Midnight", "Velvet")
   - NOUNS: 50-100 nouns (e.g., "Dreams", "Thunder", "Waves")
   - PLACES: 50+ places (e.g., "Tokyo", "Paradise", "Underground")
   - VERBS: 50+ verbs (e.g., "Running", "Dancing", "Falling")
   - EMOTIONS: 50+ emotions (e.g., "Lonely", "Euphoric", "Lost")
   - COLORS: 20-30 colors (e.g., "Crimson", "Azure", "Neon")
2. Include variety: abstract, concrete, edgy, commercial, artistic
3. Export all arrays as constants

Files to create:
- src/lib/data/words.ts

Reference:
- Naming System section in game-details.md (lines 237-246)
- Implementation notes specify: "Aim for 50-100 words per category for variety"

Success criteria:
- 50-100 words per major category (adjectives, nouns, verbs)
- At least 300 total words across all categories
- Mix of serious and humorous options
- All words appropriate for game theme
```

### Task 2.2: Implement Name Generation Logic

```
Create mad-lib style name generation for songs and artists using word lists.

Requirements:
1. Create src/lib/data/names.ts:
   - generateSongName(state?: GameState): string
   - generateArtistName(): string
   - generateAlbumName(): string
2. Multiple name patterns:
   - "[Adjective] [Noun]" (e.g., "Electric Dreams")
   - "[Verb] in [Place]" (e.g., "Dancing in Tokyo")
   - "[Emotion] [Noun]" (e.g., "Lonely Nights")
   - "[Noun] of [Place]" (e.g., "Thunder of Paradise")
3. Randomly select patterns and words
4. Ensure no duplicates in recent names (cache last 100)
5. Optional: influence names based on current trending genre

Files to create:
- src/lib/data/names.ts

Dependencies:
- src/lib/data/words.ts

Success criteria:
- Generates unique, coherent names
- Multiple pattern variations
- No duplicate names in short timeframe
- Unit tests verify pattern logic
```

### Task 2.3: Create Flavor Text & Content

```
Create flavor text for upgrades, achievements, and game events.

Requirements:
1. Create src/lib/data/content.ts:
   - Tech tier descriptions (thematic, satirical)
   - Exploitation ability descriptions
   - Phase unlock messages
   - Prestige flavor text
   - Victory screen text
   - Tutorial hints
2. Match game's satirical tone about capitalism vs art
3. Increasingly absurd at higher tiers
4. Export as typed objects

Files to create:
- src/lib/data/content.ts

Reference:
- Design Notes section in game-details.md

Success criteria:
- All major game events have flavor text
- Tone matches game theme (satirical/absurd)
- No spelling/grammar errors
```

---

## Phase 3: UI Components (PARALLEL TASKS - USE SUBAGENTS)

**All UI tasks can be worked on in parallel. Use subagents to build components.**

### Task 3.1: Create Resource Bar Component

```
Build the ResourceBar component to display money, songs, fans, and GPU resources.

IMPORTANT: Use a subagent (Task tool with subagent_type="general-purpose") to create this component and write component tests.

Requirements for the subagent:
1. Create src/lib/components/ResourceBar.svelte:
   - Props: gameState (bindable)
   - Display money, total songs, fans, GPU (if unlocked)
   - Show income per second next to money
   - Show industry control progress bar
   - Use Svelte 5 runes ($props, $derived)
   - Use TailwindCSS for styling
2. Create tests/components/ResourceBar.test.ts:
   - Test rendering with different game states
   - Test that industry control bar displays correctly
   - Test GPU display when unlocked vs locked
   - Use @testing-library/svelte

Styling guidelines:
- Dark theme (bg-game-bg, bg-game-panel)
- Use icons or emojis for resources (💰, 🎵, 👥)
- Responsive layout (stack on mobile)
- Smooth number transitions

Success criteria:
- Component renders correctly
- Numbers format properly (use formatMoney, formatNumber)
- Tests have >80% coverage
- Follows Svelte 5 best practices
```

### Task 3.2: Create Song Generator Component

```
Build the SongGenerator component for queuing songs with 1x/5x/10x/Max buttons.

IMPORTANT: Use a subagent to create this component and write tests.

Requirements for the subagent:
1. Create src/lib/components/SongGenerator.svelte:
   - Props: gameState (bindable)
   - Show current cost per song (or "FREE")
   - Show generation time
   - Display progress bar for current song being generated
   - Show queue length
   - Buttons: 1x, 5x, 10x, Max
   - Disable buttons when can't afford
   - Use Svelte 5 syntax (onclick not on:click)
2. Create tests/components/SongGenerator.test.ts:
   - Test button enable/disable logic
   - Test queue display updates
   - Test cost calculation display
   - Test Max button calculates correctly

UI features:
- Progress bar animated during generation
- Queue shows "X songs queued"
- Clear visual feedback when clicking
- Responsive button layout

Success criteria:
- All buttons functional
- Progress bar animates smoothly
- Tests cover user interactions
- Uses queueSongs from src/lib/systems/songs.ts
```

### Task 3.3: Create Tech Tree Component

```
Build the TechTree component to display and purchase tech tier upgrades.

IMPORTANT: Use a subagent to create this component and write tests.

Requirements for the subagent:
1. Create src/lib/components/TechTree.svelte:
   - Props: gameState (bindable)
   - Display all 7 tech tiers vertically
   - Show current tier highlighted
   - Show next tier cost and requirements
   - Show sub-tier upgrades for each tier
   - Purchase button (disabled if can't afford)
   - Visual progression (locked/unlocked/purchased states)
2. Create tests/components/TechTree.test.ts:
   - Test tier display logic
   - Test purchase button states
   - Test sub-tier visibility

Styling:
- Vertical timeline/tree layout
- Current tier highlighted
- Locked tiers grayed out
- Icons for each tier
- Show effects on hover

Success criteria:
- Clear visual progression
- Locked tiers show requirements
- Purchase flow works correctly
- Tests cover all states
```

### Task 3.4: Create Upgrade Panel Component

```
Build the UpgradePanel component for exploitation abilities and other upgrades.

IMPORTANT: Use a subagent to create this component and write tests.

Requirements for the subagent:
1. Create src/lib/components/UpgradePanel.svelte:
   - Props: gameState (bindable)
   - Display unlocked exploitation abilities
   - Show activated abilities with timers
   - Purchase/activate buttons
   - Show costs and effects
   - Tab system if needed (Streaming, Physical, Concerts, etc.)
2. Create tests/components/UpgradePanel.test.ts:
   - Test ability activation
   - Test timer display
   - Test tab switching if implemented

Features:
- Active abilities show countdown timer
- Costs scale up with use
- Visual feedback when activated
- Group by category (streaming, physical, concerts)

Success criteria:
- Abilities activate correctly
- Timers count down accurately
- Visual states clear (available/active/cooldown)
- Tests verify activation logic
```

### Task 3.5: Create Main Game Page Layout

```
Build the main +page.svelte with game layout and component composition.

IMPORTANT: Use a subagent to create the page layout.

Requirements for the subagent:
1. Create src/routes/+page.svelte:
   - Initialize gameState with $state rune
   - Load game on mount (or create new)
   - Start GameEngine on mount
   - Stop GameEngine on destroy
   - Layout: header, ResourceBar, main content grid, sidebar
   - Import all components created in Phase 3
   - Responsive layout (mobile-friendly)
2. Create src/routes/+layout.svelte:
   - Basic HTML structure
   - Import global Tailwind styles
   - Meta tags for SEO

Layout structure:
- Header: game title, artist name, settings button
- ResourceBar: full width below header
- Main grid: 2 columns on desktop, 1 on mobile
  - Left: SongGenerator, PhysicalAlbums, Tours (when unlocked)
  - Right: TechTree, UpgradePanel
- Prestige button (when unlocked)

Success criteria:
- Game initializes correctly
- All components render
- Game loop starts and stops properly
- Responsive design works on mobile
- State persists across reloads
```

---

## Phase 4: Advanced Systems (PARALLEL TASKS)

**All tasks in Phase 4 can be worked on simultaneously.**

### Task 4.1: Implement Prestige System

```
Create the prestige system with artist reset and legacy income.

Requirements:
1. Create src/lib/systems/prestige.ts:
   - canPrestige(state: GameState): boolean
   - performPrestige(state: GameState): boolean
   - calculateExperienceBonus(state: GameState): number
   - calculateLegacyIncome(state: GameState): number
   - processLegacyArtists(state: GameState, deltaTime: number): void
2. When prestiging:
   - Save current artist as legacy artist
   - IMPORTANT: Legacy artist fading mechanic (see game-details.md lines 149-153):
     * Keep the 2-3 most recent legacy artists active
     * When a 4th prestige occurs, the oldest legacy artist "retires"
     * Retired artists stop generating income (use array.shift())
     * This prevents infinite exponential growth while maintaining progression feel
   - Legacy artists generate passive income (80% of current rate)
   - Calculate experience multiplier from peak fans
   - Cross-promotion: legacy artists slowly funnel fans to new artist
   - Reset money, songs, fans, queue
   - Keep tech upgrades and industry control
3. Prestige unlocks at tech tier milestones (3, 5, 6, 7)

Files to create:
- src/lib/systems/prestige.ts

Reference:
- Prestige System section in game-details.md

Success criteria:
- Prestige resets correctly
- Legacy artists generate income
- Experience bonus calculates properly
- Old legacy artists fade after 3 prestiges
- Unit tests verify all calculations
```

### Task 4.2: Implement Physical Album System

```
Create the physical album system that unlocks at phase 2.

Requirements:
1. Create src/lib/systems/physical.ts:
   - unlockPhysicalAlbums(state: GameState): boolean
   - releaseAlbum(state: GameState): PhysicalAlbum
   - processPhysicalAlbums(state: GameState, deltaTime: number): void
   - calculateAlbumPayout(state: GameState): number
   - generateVariants(state: GameState): number
2. Albums auto-release at song milestones (every X songs)
3. More fans = more variants (standard, deluxe, vinyl, limited)
4. One-time payouts per album
5. Can re-release old albums later

Unlock requirements (from game-details.md):
- 100 songs completed
- 10,000 fans
- $5,000

Files to create:
- src/lib/systems/physical.ts

Success criteria:
- Unlocks at correct milestone
- Albums release automatically
- Variants scale with fan count
- Payouts calculated correctly
- Unit tests verify logic
```

### Task 4.3: Implement Tour & Concert System

```
Create the tour and concert system that unlocks at phase 3.

Requirements:
1. Create src/lib/systems/tours.ts:
   - unlockTours(state: GameState): boolean
   - startTour(state: GameState): Tour
   - processTours(state: GameState, deltaTime: number): void
   - calculateTourIncome(state: GameState): number
   - canRunMultipleTours(state: GameState): number
2. Tours run automatically once unlocked
3. Income scales with total song catalog
4. Can run multiple simultaneous tours (AI advantage)
5. Upgrade system for exploitation mechanics

Unlock requirements:
- 10 physical albums released
- 100,000 fans
- Own Local Models (tech tier 3)

Files to create:
- src/lib/systems/tours.ts

Success criteria:
- Unlocks at correct milestone
- Tours generate passive income
- Multiple tours can run simultaneously
- Unit tests verify calculations
```

### Task 4.4: Implement Exploitation Abilities System

```
Create activated exploitation abilities (bot streams, playlist placement, etc.).

Requirements:
1. Create src/lib/systems/exploitation.ts:
   - activateAbility(state: GameState, abilityId: string): boolean
   - processActiveBoosts(state: GameState, deltaTime: number): void
   - getAvailableAbilities(state: GameState): ExploitationAbility[]
   - calculateAbilityCost(state: GameState, abilityId: string): number
2. Define abilities from game-details.md:
   - Buy Bot Streams (income boost)
   - Pay for Playlist Placement (fan boost)
   - Social Media Campaigns (fan growth)
   - Limited Edition Variants (album payouts)
   - Scalp Own Tickets (tour income)
   - And more from Exploitation Mechanics section
3. Abilities are temporary boosts with costs that scale up
4. Multiple can be active simultaneously
5. No cooldowns, just escalating costs

Files to create:
- src/lib/systems/exploitation.ts
- src/lib/data/abilities.ts (ability definitions)

Success criteria:
- Abilities activate correctly
- Boosts apply properly
- Costs scale on repeated use
- Duration tracked accurately
- Unit tests verify boost calculations
```

### Task 4.5: Implement Monopoly & Platform Ownership

```
Create the late-game monopoly system for owning industry platforms.

Requirements:
1. Create src/lib/systems/monopoly.ts:
   - unlockPlatformOwnership(state: GameState): boolean
   - purchasePlatform(state: GameState, platformId: string): boolean
   - processPlatformIncome(state: GameState, deltaTime: number): void
   - calculateIndustryControl(state: GameState): number
   - updateControlProgress(state: GameState): void
2. Define platforms from game-details.md:
   - Own streaming platform
   - Control algorithm
   - Manipulate charts
   - Acquire Billboard
   - Buy the Grammys
   - Own training data/models
3. Each platform increases industry control %
4. Platforms generate massive passive income

Unlock requirements:
- 50 tours completed
- 1,000,000 fans
- Own Your Software (tech tier 6)

Files to create:
- src/lib/systems/monopoly.ts
- src/lib/data/platforms.ts (platform definitions)

Success criteria:
- Unlocks at correct milestone
- Platforms purchasable
- Industry control bar fills correctly
- Passive income scales massively
- Unit tests verify calculations
```

### Task 4.6: Implement Trend Research System

```
Create the trend research system for genre targeting.

Requirements:
1. Create src/lib/systems/trends.ts:
   - researchTrend(state: GameState): boolean
   - changeTrendingGenre(state: GameState): void
   - getTrendingGenre(state: GameState): string
   - getTrendBonus(state: GameState): number
2. Costs money early game, GPU later
3. Changes current trending genre
4. Next songs generated follow trending genre
5. Trending songs attract more fans
6. Genres: pop, hip-hop, rock, electronic, indie, jazz, classical, etc.

Files to create:
- src/lib/systems/trends.ts

Success criteria:
- Genre changes correctly
- Trending songs get bonus fan generation
- Cost switches to GPU after unlock
- Unit tests verify trend bonuses
```

---

## Phase 5: Additional UI Components (PARALLEL - USE SUBAGENTS)

**Use subagents for all UI tasks in this phase.**

### Task 5.1: Create Physical Albums UI Component

```
Build PhysicalAlbums component to display album releases and variants.

IMPORTANT: Use a subagent to create this component and tests.

Requirements for the subagent:
1. Create src/lib/components/PhysicalAlbums.svelte:
   - Props: gameState (bindable)
   - Display total albums released
   - Show recent album releases with names
   - Display variants (standard, deluxe, vinyl, limited)
   - Show next album progress (songs until next release)
   - Manual re-release button for old albums
2. Create tests/components/PhysicalAlbums.test.ts:
   - Test album display
   - Test variant display based on fans
   - Test re-release button

Only show when:
- gameState.unlockedSystems.physicalAlbums === true

Success criteria:
- Shows when unlocked
- Displays album history
- Variants display correctly
- Tests cover rendering logic
```

### Task 5.2: Create Tour Manager UI Component

```
Build TourManager component to display active tours and income.

IMPORTANT: Use a subagent to create this component and tests.

Requirements for the subagent:
1. Create src/lib/components/TourManager.svelte:
   - Props: gameState (bindable)
   - Display active tours
   - Show tour income per second
   - Button to start new tour (if capacity available)
   - List of exploitation upgrades for tours
2. Create tests/components/TourManager.test.ts:
   - Test tour display
   - Test start tour button logic
   - Test multiple tour display

Only show when:
- gameState.unlockedSystems.tours === true

Success criteria:
- Active tours displayed
- Can start new tours
- Income displayed accurately
- Tests verify interactions
```

### Task 5.3: Create Prestige Modal Component

```
Build PrestigeModal component for the "New Artist" prestige flow.

IMPORTANT: Use a subagent to create this component and tests.

Requirements for the subagent:
1. Create src/lib/components/PrestigeModal.svelte:
   - Props: open (boolean), onclose (function)
   - Show prestige benefits:
     - Current peak fans
     - Experience multiplier gain
     - Legacy artist income
   - Show what's kept (tech, industry control)
   - Show what's reset (money, songs, fans)
   - Confirm button (with confirmation step)
   - Cancel button
2. Create tests/components/PrestigeModal.test.ts:
   - Test modal open/close
   - Test prestige button logic
   - Test confirmation flow

Styling:
- Modal overlay with dark backdrop
- Clear warnings about reset
- Highlight bonuses in green
- Two-step confirmation to prevent accidents

Success criteria:
- Modal displays correctly
- Prestige executes on confirm
- Shows accurate bonus calculations
- Tests cover full flow
```

### Task 5.4: Create Settings Modal Component

```
Build SettingsModal with save management and game options.

IMPORTANT: Use a subagent to create this component and tests.

Requirements for the subagent:
1. Create src/lib/components/SettingsModal.svelte:
   - Props: open (boolean), onclose (function)
   - Export save button (triggers download)
   - Import save button (file picker)
   - Delete save button (with confirmation)
   - Show save timestamp
   - Show game version
   - Optional: Toggle settings (animations, etc.)
2. Create tests/components/SettingsModal.test.ts:
   - Test export functionality
   - Test import validation
   - Test delete confirmation

Features:
- Export creates .json file download
- Import validates before accepting
- Delete has confirmation dialog
- Show last save time

Success criteria:
- Export/import works correctly
- Delete requires confirmation
- Tests verify save operations
```

### Task 5.5: Create Toast Notification Component

```
Build Toast component for showing temporary notifications.

IMPORTANT: Use a subagent to create this component.

Requirements for the subagent:
1. Create src/lib/components/Toast.svelte:
   - Props: message (string), type (info/success/warning/error), duration
   - Auto-dismiss after duration (default 3s)
   - Animate in/out (slide from top or bottom)
   - Stack multiple toasts
   - Different colors for types
2. Create src/lib/stores/notifications.ts:
   - showToast(message, type, duration) function
   - Queue management for multiple toasts

Use cases:
- "Album released!"
- "Prestige available!"
- "New tech tier unlocked!"
- "Save exported successfully"
- "Error: Save file invalid"

Success criteria:
- Toasts display and auto-dismiss
- Multiple toasts stack correctly
- Colors match message type
- Smooth animations
```

### Task 5.6: Create Victory Screen Component

```
Build VictoryScreen component displayed when industry control reaches 100%.

IMPORTANT: Use a subagent to create this component.

Requirements for the subagent:
1. Create src/lib/components/VictoryScreen.svelte:
   - Props: gameState (readonly)
   - Display "You Control the Music Industry"
   - Show final stats:
     - Total prestiges
     - Total songs created
     - Peak fans achieved
     - Time played
   - Show legacy artists
   - Option to continue playing
   - Option to start completely fresh
2. Styling:
   - Full-screen overlay
   - Celebratory theme
   - Stats displayed prominently
   - Confetti animation (optional)

Success criteria:
- Displays when industryControl >= 100
- Stats accurate
- Can continue playing after victory
- Visually celebratory
```

---

## Phase 6: Integration & Polish (SEQUENTIAL TASKS)

**These tasks should be done in order after all previous phases are complete.**

### Task 6.1: Integrate All Systems into Game Loop

```
Connect all game systems to the main game engine tick() method.

Requirements:
1. Update src/lib/game/engine.ts tick() method to call:
   - processSongQueue (from songs.ts)
   - generateIncome (from income.ts)
   - generateFans (from fans.ts)
   - processActiveBoosts (from exploitation.ts)
   - processPhysicalAlbums (from physical.ts)
   - processTours (from tours.ts)
   - processLegacyArtists (from prestige.ts)
   - processPlatformIncome (from monopoly.ts)
   - updateControlProgress (from monopoly.ts)
   - checkPhaseUnlocks (new function to check unlock conditions)
2. Create src/lib/systems/unlocks.ts:
   - checkPhaseUnlocks(state: GameState): void
   - checkPhysicalAlbumUnlock(state: GameState): void
   - checkTourUnlock(state: GameState): void
   - checkPlatformUnlock(state: GameState): void
   - Show toast notifications when unlocking new systems
3. Ensure all systems run in correct order
4. Verify deltaTime passed correctly
5. Test full game loop with all systems active

Success criteria:
- All systems execute each tick
- Unlock notifications appear
- No performance issues at 10 TPS
- All systems integrated correctly
- Write integration tests
```

### Task 6.2: Implement Phase Unlock System

```
Create the phase progression system that unlocks features as milestones are reached.

Requirements:
1. Update src/lib/systems/unlocks.ts:
   - Track which phase player is in (1-5)
   - Check unlock conditions every tick
   - Set flags in state.unlockedSystems
   - Trigger toast notifications
   - Update UI to show newly unlocked features
2. Unlock conditions from game-details.md:
   - Phase 2 (Physical): 100 songs, 10k fans, $5k
   - Phase 3 (Tours): 10 albums, 100k fans, tech tier 3
   - Phase 4 (Platforms): 50 tours, 1M fans, tech tier 6
   - Phase 5 (Automation): 3+ platforms, 10M fans, tech tier 7
3. Track milestones in industry control bar

Success criteria:
- Phases unlock at correct milestones
- Notifications appear on unlock
- UI updates dynamically
- Industry control increases
```

### Task 6.3: Add Industry Control Progress Bar

```
Implement the persistent industry control progress bar that fills to 100% for victory.

Requirements:
1. Update src/lib/systems/monopoly.ts:
   - calculateIndustryControl(state: GameState): number
   - updateControlProgress(state: GameState): void
2. Progress fills based on (see game-details.md lines 442-447 for percentage suggestions):
   - Fan milestones (10k, 100k, 1M, 10M) - suggest 2-5% each
   - Tech tier achievements (local models, own software, AI agents) - suggest 5-10% each
   - Phase unlocks (streaming → physical → concerts → platform ownership) - suggest 5-8% each
   - Each prestige adds a chunk - suggest 5-10% per prestige
   - Platform ownership (streaming platform, algorithm control, Billboard, Grammys, etc.) - suggest 3-7% each
3. Implementation notes:
   - Store industryControl as 0-100 number in GameState
   - Progress persists through prestige (never reset this value)
   - Victory modal triggers when reaching 100%
4. Reaches 100% after 3-5 prestiges (as designed)
5. Trigger victory screen at 100%

Update ResourceBar component to show industry control prominently.

Success criteria:
- Progress bar visible throughout game
- Fills based on achievements
- Persists through prestige
- Victory screen at 100%
- Clear visual progression
```

### Task 6.4: Balance Tuning & Testing

```
Perform comprehensive balance testing and tune game progression.

IMPORTANT: Use a subagent to perform extensive testing and balance adjustments.

Requirements for the subagent:
1. Test full playthrough from start to prestige 1
2. Verify progression timing:
   - First 5 minutes: manual generation
   - 30-60 minutes: first tech upgrade
   - 1-2 hours: first prestige
3. Adjust values in src/lib/game/config.ts:
   - Income rates (base and scaling)
   - Costs (tech tiers, abilities, platforms)
   - Unlock thresholds
   - Generation speeds
   - Fan generation rates
4. Test all systems work together:
   - Songs generate correctly
   - Income accumulates
   - Fans grow
   - Upgrades apply effects
   - Prestige resets properly
   - Victory achievable in 8-12 hours
5. Create detailed balance report documenting:
   - Time to each milestone
   - Bottlenecks or pacing issues
   - Recommended adjustments

Success criteria:
- First prestige achievable in 1-2 hours
- Victory in 8-12 hours total
- No game-breaking exploits
- Progression feels smooth
- Document all balance changes
```

### Task 6.5: Write Comprehensive Test Suite

```
Create comprehensive test suite for all game systems.

IMPORTANT: Use a subagent to write extensive tests.

Requirements for the subagent:
1. Unit tests for all system files:
   - tests/systems/songs.test.ts
   - tests/systems/income.test.ts
   - tests/systems/fans.test.ts
   - tests/systems/tech.test.ts
   - tests/systems/prestige.test.ts
   - tests/systems/physical.test.ts
   - tests/systems/tours.test.ts
   - tests/systems/exploitation.test.ts
   - tests/systems/monopoly.test.ts
   - tests/systems/trends.test.ts
   - tests/game/engine.test.ts
   - tests/game/save.test.ts
   - tests/game/utils.test.ts
2. Component tests for all UI components (if not created yet)
3. Integration tests:
   - tests/integration/game-loop.test.ts
   - tests/integration/prestige-flow.test.ts
   - tests/integration/phase-progression.test.ts
4. Target >70% code coverage overall
5. Run tests with: npm test
6. Generate coverage report with: npm run test:coverage

Success criteria:
- >70% code coverage
- All tests pass
- No flaky tests
- Fast test execution (<30s)
```

---

## Phase 7: Deployment & Documentation (SEQUENTIAL TASKS)

### Task 7.1: Configure GitHub Pages Deployment

```
Set up GitHub Actions workflow to deploy to GitHub Pages.

Requirements:
1. Create .github/workflows/deploy.yml:
   - Trigger on push to main branch
   - Install dependencies with npm ci
   - Run tests
   - Build with npm run build
   - Deploy to GitHub Pages using actions/deploy-pages@v4
2. Verify svelte.config.js has correct base path
3. Ensure static/.nojekyll exists
4. Test deployment workflow
5. Update repository settings to enable GitHub Pages

Files to create:
- .github/workflows/deploy.yml

Reference:
- GitHub Pages Deployment section in AGENTS.md

Success criteria:
- Workflow runs on push to main
- Tests must pass before deploy
- Build succeeds
- Site deployed to https://[username].github.io/music-industry-simulator/
- Game loads and runs correctly on GitHub Pages
```

### Task 7.2: Create README Documentation ✅ ALREADY COMPLETE

```
✅ SKIP THIS TASK - README.md is already written!

The README has been completed and includes:
- ✅ Project title and description
- ✅ Game overview and gameplay
- ✅ Documentation links
- ✅ Tech stack
- ✅ Getting started instructions
- ✅ Testing commands
- ✅ Development notes
- ✅ Roadmap with checkboxes
- ✅ Feature breakdown by phase
- ✅ Contributing guidelines for multi-agent workflow
- ✅ License information

The README is comprehensive and professional. No action needed.
```

### Task 7.3: Create CHANGELOG

```
Document all major features and changes in CHANGELOG.md.

Requirements:
1. Create CHANGELOG.md following Keep a Changelog format:
   - Version 1.0.0 (initial release)
   - List all major features
   - Game systems implemented
   - UI components created
2. Note any known issues or future enhancements
3. Credit contributors if applicable

Files to create:
- CHANGELOG.md

Success criteria:
- Complete feature list
- Follows standard format
- Easy to read
```

---

## Phase 8: Final Polish (OPTIONAL ENHANCEMENTS)

**These tasks are optional improvements to enhance the game experience.**

### Task 8.1: Add Animations & Transitions

```
Add subtle animations and transitions to improve game feel.

OPTIONAL: Use a subagent to add polish.

Enhancements:
1. Number count-up animations when income increases
2. Smooth transitions when new sections unlock
3. Particle effects when generating songs
4. Pulse animation on purchase buttons
5. Fade in/out for modals
6. Progress bar fill animations
7. Celebration animations on prestige
8. Victory screen confetti

Use CSS transitions and Svelte transitions:
- svelte/transition (fade, fly, scale)
- svelte/animate (flip, crossfade)

Success criteria:
- Animations smooth (60fps)
- Not distracting or annoying
- Enhance game feel
- Can be disabled in settings (optional)
```

### Task 8.2: Add Sound Effects (Optional)

```
Add optional sound effects for key actions.

OPTIONAL: Use a subagent to implement audio.

Enhancements:
1. Song complete sound
2. Purchase/upgrade sound
3. Prestige sound
4. Phase unlock fanfare
5. Victory jingle
6. Income tick sound (soft, subtle)
7. Volume control in settings
8. Mute toggle

Use Web Audio API or HTML5 audio:
- Small, royalty-free sound effects
- Compressed audio files
- Lazy load audio assets

Success criteria:
- Sounds enhance experience
- Can be muted
- Small file sizes (<1MB total)
- No licensing issues
```

### Task 8.3: Add Keyboard Shortcuts

```
Implement keyboard shortcuts for common actions.

Enhancements:
1. Spacebar: Generate 1 song
2. 1-4: Generate 1x/5x/10x/Max songs
3. P: Open prestige modal (if available)
4. S: Open settings
5. Esc: Close modals
6. Show keyboard shortcut hints in UI

Success criteria:
- Shortcuts work correctly
- Don't interfere with typing in inputs
- Documented in settings or help
```

---

## Summary of Parallel Work Opportunities

**Phase 0**: Sequential (must complete Task 0.1 first, then others can be parallel)

**Phase 1**: All 6 tasks (1.1-1.6) can be done in parallel

**Phase 2**: All 3 tasks (2.1-2.3) can be done in parallel, and in parallel with Phase 1

**Phase 3**: All 5 UI tasks (3.1-3.5) can be done in parallel using subagents

**Phase 4**: All 6 tasks (4.1-4.6) can be done in parallel

**Phase 5**: All 6 UI tasks (5.1-5.6) can be done in parallel using subagents

**Phase 6**: Sequential tasks (must be done in order after Phase 1-5)

**Phase 7**: Sequential tasks (must be done after Phase 6)
- ✅ Task 7.2 already complete (README written)
- Still need: 7.1 (deployment), 7.3 (changelog)

**Phase 8**: Optional parallel tasks

---

## How to Use This Plan

1. **Copy-paste individual task descriptions** directly into Claude Code
2. **Start with Phase 0** - must complete Task 0.1 first
3. **Parallelize phases 1-5** - run multiple tasks simultaneously if working with multiple agents
4. **Use subagents for UI** - all Phase 3 and Phase 5 tasks specifically request subagent usage
5. **Use subagents for tests** - tasks explicitly note when to use subagents for test creation
6. **Complete Phase 6-7 sequentially** after all systems are built
7. **Phase 8 is optional** for extra polish

Each task is self-contained with:
- Clear requirements
- Files to create
- Success criteria
- References to design documents

Good luck building the AI Music Empire! 🎵
