# AI Music Idle Game - Technical Implementation Specification

## Project Overview

**Goal**: Build a web-based idle/incremental game about AI music creation and industry domination.

**Architecture**: Single-page web application built with SvelteKit and TypeScript, deployed to GitHub Pages.

**Key Principle**: This is a client-side only game with no backend - all state persists in browser localStorage.

---

## Technology Stack

### Frontend
- **Framework**: SvelteKit 2.x (latest: 2.48.x as of November 2025)
- **Language**: TypeScript
- **UI Library**: Svelte 5 (latest: 5.43.x as of November 2025)
- **Styling**: TailwindCSS
- **Build Tool**: Vite (integrated with SvelteKit)
- **State Management**: Svelte 5 runes ($state, $derived, $effect) + custom game engine
- **Adapter**: @sveltejs/adapter-static (for GitHub Pages)

### Deployment
- **Platform**: GitHub Pages
- **Build**: GitHub Actions workflow
- **URL**: `https://[username].github.io/music-industry-simulator/`

### Testing
- **Unit Tests**: Vitest
- **Component Tests**: @testing-library/svelte
- **Coverage Target**: >70% for game logic

---

## Project Structure

```
/
├── src/
│   ├── routes/
│   │   ├── +page.svelte         # Main game page
│   │   └── +layout.svelte       # Root layout
│   ├── lib/
│   │   ├── game/
│   │   │   ├── engine.ts        # Core game loop and state management
│   │   │   ├── save.ts          # LocalStorage save/load system
│   │   │   ├── config.ts        # Game constants and configuration
│   │   │   ├── types.ts         # TypeScript interfaces
│   │   │   └── utils.ts         # Helper functions
│   │   ├── systems/
│   │   │   ├── songs.ts         # Song generation system
│   │   │   ├── income.ts        # Income calculation
│   │   │   ├── fans.ts          # Fan generation
│   │   │   ├── upgrades.ts      # Upgrade system
│   │   │   ├── prestige.ts      # Prestige/reset system
│   │   │   ├── tech.ts          # Tech stack progression
│   │   │   ├── physical.ts      # Physical album system
│   │   │   ├── tours.ts         # Concert tour system
│   │   │   ├── exploitation.ts  # Activated abilities
│   │   │   └── monopoly.ts      # Platform ownership
│   │   ├── components/
│   │   │   ├── ResourceBar.svelte
│   │   │   ├── SongGenerator.svelte
│   │   │   ├── UpgradePanel.svelte
│   │   │   ├── TechTree.svelte
│   │   │   ├── PhysicalAlbums.svelte
│   │   │   ├── TourManager.svelte
│   │   │   ├── PrestigeModal.svelte
│   │   │   ├── SettingsModal.svelte
│   │   │   └── Toast.svelte
│   │   └── data/
│   │       ├── names.ts         # Word lists for song/artist names
│   │       └── content.ts       # Flavor text and descriptions
│   └── app.html                 # HTML template
├── static/
│   ├── favicon.ico
│   └── .nojekyll               # Required for GitHub Pages
├── tests/
│   ├── game/
│   ├── systems/
│   ├── components/
│   └── vitest.config.ts
├── .github/
│   └── workflows/
│       └── deploy.yml           # Build and deploy to GitHub Pages
├── README.md
├── AGENTS.md                    # This file
├── package.json
├── svelte.config.js
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── .gitignore
```

---

## Game Architecture

**IMPORTANT: Svelte 5 Runes**

This project uses Svelte 5, which introduced a major change in reactivity with **runes**. The old `$:` reactive statements and stores (writable/derived) are being phased out in favor of:
- `$state` - declares reactive state
- `$derived` - computed values (replaces `$:` and `derived` stores)
- `$effect` - side effects (replaces `$:` for side effects)
- `$props` - component props
- `$bindable` - two-way binding

All code examples below use pseudocode patterns. Actual implementation should use Svelte 5 runes syntax. See [Svelte 5 docs](https://svelte.dev/docs/svelte/overview) for complete runes documentation.

### TypeScript Interfaces

```typescript
// src/lib/game/types.ts
// [Interfaces remain the same - they're valid TypeScript]
```

### Svelte 5 Runes State Management

```typescript
// src/lib/game/state.svelte.ts
// Svelte 5 uses runes ($state, $derived, $effect) for reactivity
// State is defined in .svelte.ts files or component <script> blocks

// Example pattern for game state management:
// This would typically be in the root +page.svelte or a shared .svelte.ts file

let gameState = $state<GameState>(loadGame() || getInitialState());

// Derived values use $derived
let totalIncome = $derived(
  gameState.songs.reduce((sum, song) => sum + song.incomePerSecond, 0)
);

let canPrestige = $derived(
  gameState.unlockedSystems.prestige && gameState.techTier >= 3
);

// Effects use $effect for side effects like auto-saving
$effect(() => {
  // Auto-save when state changes
  saveGame(gameState);
});

function getInitialState(): GameState {
  return {
    money: 10,
    songs: [],
    fans: 0,
    gpu: 0,
    phase: 1,
    industryControl: 0,
    currentArtist: {
      name: generateArtistName(),
      songs: 0,
      fans: 0,
      peakFans: 0,
      createdAt: Date.now()
    },
    legacyArtists: [],
    songQueue: [],
    songGenerationSpeed: 30000,
    techTier: 1,
    techSubTier: 0,
    upgrades: {},
    activeBoosts: [],
    prestigeCount: 0,
    experienceMultiplier: 1.0,
    unlockedSystems: {
      trendResearch: false,
      physicalAlbums: false,
      tours: false,
      platformOwnership: false,
      monopoly: false,
      prestige: false,
      gpu: false
    },
    lastUpdate: Date.now(),
    createdAt: Date.now()
  };
}
```

### Core Game Loop

```typescript
// src/lib/game/engine.ts
// Pseudocode showing game engine pattern

export class GameEngine {
  private lastTick: number = Date.now();
  private tickRate: number = 100; // 100ms = 10 ticks per second
  private isRunning: boolean = false;
  private intervalId?: number;
  private gameState: GameState; // Passed in from component

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTick = Date.now();
    this.intervalId = window.setInterval(() => this.tick(), this.tickRate);
  }

  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    saveGame(this.gameState);
  }

  private tick() {
    const now = Date.now();
    const deltaTime = (now - this.lastTick) / 1000;
    this.lastTick = now;

    // Process all game systems (mutate gameState directly)
    processSongQueue(this.gameState, deltaTime);
    generateIncome(this.gameState, deltaTime);
    generateFans(this.gameState, deltaTime);
    processActiveBoosts(this.gameState, deltaTime);
    processPhysicalAlbums(this.gameState, deltaTime);
    processTours(this.gameState, deltaTime);
    processLegacyArtists(this.gameState, deltaTime);
    checkPhaseUnlocks(this.gameState);
    
    // Auto-save periodically
    if (now - this.gameState.lastUpdate > 10000) {
      this.gameState.lastUpdate = now;
      saveGame(this.gameState);
    }
    
    // Svelte 5 reactivity automatically updates UI when state changes
  }
}
```

### Save System

```typescript
// src/lib/game/save.ts

import type { GameState } from './types';

const SAVE_KEY = 'ai_music_game_save';
const BACKUP_KEY = 'ai_music_game_backup';

export function saveGame(state: GameState): boolean {
  try {
    // Keep a backup of previous save
    const currentSave = localStorage.getItem(SAVE_KEY);
    if (currentSave) {
      localStorage.setItem(BACKUP_KEY, currentSave);
    }
    
    // Save current state
    const serialized = JSON.stringify(state);
    localStorage.setItem(SAVE_KEY, serialized);
    return true;
  } catch (error) {
    console.error('Failed to save game:', error);
    return false;
  }
}

export function loadGame(): GameState | null {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) return null;
    
    const state = JSON.parse(saved) as GameState;
    
    // Validate save structure
    if (!validateSave(state)) {
      console.warn('Invalid save detected, attempting backup');
      return loadBackup();
    }
    
    return state;
  } catch (error) {
    console.error('Failed to load game:', error);
    return loadBackup();
  }
}

export function loadBackup(): GameState | null {
  try {
    const backup = localStorage.getItem(BACKUP_KEY);
    if (!backup) return null;
    return JSON.parse(backup) as GameState;
  } catch (error) {
    console.error('Failed to load backup:', error);
    return null;
  }
}

export function deleteSave(): void {
  localStorage.removeItem(SAVE_KEY);
  localStorage.removeItem(BACKUP_KEY);
}

export function exportSave(): string | null {
  const saved = localStorage.getItem(SAVE_KEY);
  if (!saved) return null;
  
  // Create downloadable file
  const blob = new Blob([saved], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  return url;
}

export function importSave(fileContent: string): boolean {
  try {
    const state = JSON.parse(fileContent) as GameState;
    if (!validateSave(state)) {
      throw new Error('Invalid save file');
    }
    localStorage.setItem(SAVE_KEY, fileContent);
    return true;
  } catch (error) {
    console.error('Failed to import save:', error);
    return false;
  }
}

function validateSave(state: any): state is GameState {
  // Check for required fields
  return state &&
         typeof state.money === 'number' &&
         Array.isArray(state.songs) &&
         typeof state.fans === 'number' &&
         state.currentArtist &&
         typeof state.industryControl === 'number';
}
```

### Song Generation System

```typescript
// src/lib/systems/songs.ts

import type { GameState, Song, QueuedSong } from '$lib/game/types';
import { generateSongName } from '$lib/data/names';

export function generateSong(state: GameState): Song {
  const songName = generateSongName(state);
  const genre = state.currentTrendingGenre || 'pop';
  
  const song: Song = {
    id: crypto.randomUUID(),
    name: songName,
    genre: genre,
    createdAt: Date.now(),
    incomePerSecond: calculateSongIncome(state),
    fanGenerationRate: calculateFanGeneration(state),
    isTrending: genre === state.currentTrendingGenre
  };
  
  return song;
}

export function queueSongs(state: GameState, count: number): boolean {
  const cost = calculateSongCost(state, count);
  if (state.money < cost) return false;
  
  state.money -= cost;
  
  for (let i = 0; i < count; i++) {
    state.songQueue.push({
      id: crypto.randomUUID(),
      progress: 0,
      totalTime: state.songGenerationSpeed
    });
  }
  
  return true;
}

export function processSongQueue(state: GameState, deltaTime: number): void {
  if (state.songQueue.length === 0) return;
  
  // Process first song in queue
  const current = state.songQueue[0];
  current.progress += deltaTime * 1000; // Convert to ms
  
  if (current.progress >= current.totalTime) {
    // Song completed
    const newSong = generateSong(state);
    state.songs.push(newSong);
    state.currentArtist.songs++;
    state.songQueue.shift();
  }
}

export function calculateSongCost(state: GameState, count: number = 1): number {
  // Free after lifetime license
  if (state.techTier >= 2) return 0;
  
  // $1 per song at start
  return count * 1;
}

export function calculateSongIncome(state: GameState): number {
  let baseIncome = 0.01 / 60; // $0.01 per minute = $0.01/60 per second
  
  // Tech upgrades increase income per song
  baseIncome *= Math.pow(1.5, state.techTier - 1);
  
  // Sub-tier upgrades
  baseIncome *= (1 + state.techSubTier * 0.2);
  
  // Experience multiplier from prestige
  baseIncome *= state.experienceMultiplier;
  
  return baseIncome;
}

export function calculateFanGeneration(state: GameState): number {
  let baseFans = 0.001; // Base fans per second per song
  
  // Marketing upgrades increase fan generation
  // Applied by other systems
  
  return baseFans;
}
```

### Upgrade System

```javascript
// src/systems/upgrades.js

export const TECH_UPGRADES = [
  {
    id: 'lifetime_license',
    tier: 2,
    name: 'Lifetime License',
    description: 'Songs become FREE to generate',
    cost: 500,
    effects: {
      songCost: 0,
      songSpeed: 15000 // 15 seconds
    }
  },
  {
    id: 'local_models',
    tier: 3,
    name: 'Local AI Models',
    description: 'Run models locally, unlock automation',
    cost: 5000,
    effects: {
      songSpeed: 5000, // 5 seconds
      incomeMultiplier: 1.5,
      unlockGPU: true,
      unlockPrestige: true
    }
  },
  // ... more upgrades
];

export function purchaseUpgrade(state, upgradeId) {
  const upgrade = TECH_UPGRADES.find(u => u.id === upgradeId);
  if (!upgrade) return false;
  
  if (state.money < upgrade.cost) return false;
  if (state.upgrades[upgradeId]) return false; // Already purchased
  
  state.money -= upgrade.cost;
  state.upgrades[upgradeId] = {
    purchasedAt: Date.now(),
    tier: upgrade.tier
  };
  
  // Apply upgrade effects
  applyUpgradeEffects(state, upgrade);
  
  return true;
}

export function applyUpgradeEffects(state, upgrade) {
  if (upgrade.effects.songCost !== undefined) {
    // Handled in calculateSongCost
  }
  
  if (upgrade.effects.songSpeed) {
    state.songGenerationSpeed = upgrade.effects.songSpeed;
  }
  
  if (upgrade.effects.unlockGPU) {
    state.unlockedSystems.gpu = true;
  }
  
  if (upgrade.effects.unlockPrestige) {
    state.unlockedSystems.prestige = true;
  }
  
  // ... handle other effects
}
```

### Prestige System

```javascript
// src/systems/prestige.js

export function canPrestige(state) {
  // Check if player has reached a prestige milestone
  return state.unlockedSystems.prestige &&
         !hasActivePrestigeOnCooldown(state);
}

export function performPrestige(state) {
  if (!canPrestige(state)) return false;
  
  // Save current artist as legacy
  const legacyArtist = {
    name: state.currentArtist.name,
    peakFans: state.currentArtist.peakFans,
    songs: state.currentArtist.songs,
    incomeRate: calculateLegacyIncome(state),
    createdAt: state.currentArtist.createdAt,
    prestigedAt: Date.now()
  };
  
  state.legacyArtists.push(legacyArtist);
  
  // Keep only last 2-3 legacy artists
  if (state.legacyArtists.length > 3) {
    state.legacyArtists.shift();
  }
  
  // Calculate prestige bonuses
  const experienceBonus = calculateExperienceBonus(state);
  state.experienceMultiplier += experienceBonus;
  
  // Reset current artist
  state.currentArtist = {
    name: generateArtistName(),
    songs: 0,
    fans: 0,
    peakFans: 0
  };
  
  // Reset resources
  state.money = 10;
  state.songs = [];
  state.fans = 0;
  state.songQueue = [];
  
  // Keep tech upgrades and unlocked systems
  // Industry control persists
  
  state.prestigeCount++;
  
  return true;
}

function calculateLegacyIncome(state) {
  // Legacy artists earn at current rate (or slightly reduced)
  const totalIncome = state.songs.reduce((sum, song) => 
    sum + song.incomePerSecond, 0);
  
  return totalIncome * 0.8; // 80% of current rate
}

function calculateExperienceBonus(state) {
  // Bonus based on peak fans achieved
  return Math.log10(state.currentArtist.peakFans + 1) * 0.1;
}
```

---

## UI Implementation

### Main Page Component

```svelte
<!-- src/routes/+page.svelte -->
<!-- Note: Svelte 5 uses runes ($state, $derived, $effect) instead of stores -->
<!-- This is pseudocode showing the pattern -->

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { gameEngine } from '$lib/game/engine';
  import type { GameState } from '$lib/game/types';
  
  import ResourceBar from '$lib/components/ResourceBar.svelte';
  import SongGenerator from '$lib/components/SongGenerator.svelte';
  import UpgradePanel from '$lib/components/UpgradePanel.svelte';
  // ... other imports
  
  // In Svelte 5, state is defined with $state rune
  let gameState = $state<GameState>(/* initialized state */);
  let showSettings = $state(false);
  let showPrestige = $state(false);
  
  // Derived values use $derived
  let totalIncome = $derived(
    gameState.songs.reduce((sum, song) => sum + song.incomePerSecond, 0)
  );
  
  onMount(() => {
    gameEngine.start();
  });
  
  onDestroy(() => {
    gameEngine.stop();
  });
</script>

<div class="min-h-screen bg-game-bg text-white">
  <header class="flex justify-between items-center p-4 bg-gray-900">
    <div>
      <h1 class="text-2xl font-bold">AI Music Empire</h1>
      <p class="text-sm text-gray-400">{gameState.currentArtist.name}</p>
    </div>
    <div class="flex gap-4">
      <button 
        onclick={() => showSettings = true}
        class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition"
      >
        Settings
      </button>
      {#if gameState.unlockedSystems.prestige}
        <button 
          onclick={() => showPrestige = true}
          class="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded transition"
        >
          New Artist
        </button>
      {/if}
    </div>
  </header>

  <ResourceBar state={gameState} income={totalIncome} />

  <main class="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
    <!-- Components receive state as props -->
    <div class="lg:col-span-2 space-y-4">
      <SongGenerator bind:gameState />
      
      {#if gameState.unlockedSystems.physicalAlbums}
        <PhysicalAlbums bind:gameState />
      {/if}
      
      {#if gameState.unlockedSystems.tours}
        <TourManager bind:gameState />
      {/if}
    </div>

    <div class="space-y-4">
      <TechTree bind:gameState />
      <UpgradePanel bind:gameState />
    </div>
  </main>
</div>

{#if showSettings}
  <SettingsModal onclose={() => showSettings = false} />
{/if}

{#if showPrestige}
  <PrestigeModal onclose={() => showPrestige = false} />
{/if}
```

### Component Example (Svelte 5 Syntax)

```svelte
<!-- src/lib/components/SongGenerator.svelte -->
<script lang="ts">
  import type { GameState } from '$lib/game/types';
  import { queueSongs, calculateSongCost } from '$lib/systems/songs';
  import { formatMoney, formatTime } from '$lib/game/utils';
  
  // Props in Svelte 5 use destructuring
  let { gameState = $bindable() }: { gameState: GameState } = $props();
  
  // Derived values
  let cost = $derived(calculateSongCost(gameState));
  let canAfford = $derived((count: number) => 
    gameState.money >= calculateSongCost(gameState, count)
  );
  let generationTime = $derived(gameState.songGenerationSpeed / 1000);
  
  function generate(count: number) {
    queueSongs(gameState, count);
  }
</script>

<div class="bg-game-panel p-6 rounded-lg">
  <h2 class="text-xl font-bold mb-4">Generate Songs</h2>
  
  <div class="mb-4">
    <p class="text-sm text-gray-400">
      Cost: {cost === 0 ? 'FREE' : formatMoney(cost)} per song
    </p>
    <p class="text-sm text-gray-400">
      Generation time: {formatTime(generationTime)}
    </p>
  </div>
  
  {#if gameState.songQueue.length > 0}
    <div class="mb-4 p-3 bg-gray-800 rounded">
      <p class="text-sm mb-2">Queue: {gameState.songQueue.length} songs</p>
      <div class="w-full bg-gray-700 rounded-full h-2">
        <div 
          class="bg-blue-500 h-2 rounded-full transition-all"
          style="width: {(gameState.songQueue[0].progress / gameState.songQueue[0].totalTime) * 100}%"
        >
        </div>
      </div>
    </div>
  {/if}
  
  <div class="grid grid-cols-4 gap-2">
    <button
      onclick={() => generate(1)}
      disabled={!canAfford(1)}
      class="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded transition"
    >
      x1
    </button>
    <!-- ... more buttons -->
  </div>
</div>
```

### Format Utilities

```typescript
// src/lib/game/utils.ts

export function formatMoney(amount: number): string {
  if (amount >= 1e12) return `$${(amount / 1e12).toFixed(2)}T`;
  if (amount >= 1e9) return `$${(amount / 1e9).toFixed(2)}B`;
  if (amount >= 1e6) return `$${(amount / 1e6).toFixed(2)}M`;
  if (amount >= 1e3) return `$${(amount / 1e3).toFixed(2)}K`;
  return `$${amount.toFixed(2)}`;
}

export function formatNumber(num: number): string {
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return Math.floor(num).toString();
}

export function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}m ${secs}s`;
}
```

---

## Multi-Agent Collaboration Strategy

### File-Based Module System

To allow multiple agents to work simultaneously without conflicts:

**1. Strict Module Boundaries**
- Each system file (`songs.js`, `tours.js`, etc.) is independent
- Systems only modify state, never depend on other systems
- All inter-system communication through game engine

**2. Task Assignment by Module**
- Agent A: Work on `src/systems/songs.js` + `src/systems/income.js`
- Agent B: Work on `src/systems/upgrades.js` + `src/systems/tech.js`
- Agent C: Work on `src/ui/components.js` + `src/ui/modals.js`
- Agent D: Work on `src/data/names.js` + `src/data/content.js`

**3. Shared State Contract**
- State structure defined in `src/game/config.js`
- All agents read this contract first
- No agent modifies the state structure without coordination

**4. Pull Request Guidelines**
- One feature per PR
- PR titles: `[SYSTEM] Feature name` (e.g., `[SONGS] Implement generation queue`)
- No PRs that touch multiple systems unless coordinating
- Always pull latest `main` before starting work

**5. Communication Protocol**
- Use GitHub Issues for coordination
- Tag issues with system labels: `system:songs`, `system:ui`, etc.
- Claim issues before starting work
- Update issue when PR is ready

**Example Workflow:**
```
1. Agent creates issue: "Implement song generation system"
2. Agent assigns self to issue
3. Agent creates branch: feature/songs-generation
4. Agent works only on src/systems/songs.js
5. Agent creates PR, references issue
6. Another agent reviews PR
7. Merge when approved
```

---

## GitHub Actions Deployment

```yaml
# .github/workflows/deploy.yml

name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
        env:
          NODE_ENV: production
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: 'build'
      
      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
```

---

## Configuration Files

### package.json

```json
{
  "name": "music-industry-simulator",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "devDependencies": {
    "@sveltejs/adapter-static": "^3.0.0",
    "@sveltejs/kit": "^2.0.0",
    "@sveltejs/vite-plugin-svelte": "^4.0.0",
    "@testing-library/svelte": "^5.0.0",
    "@types/node": "^22.0.0",
    "@vitest/ui": "^2.0.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "svelte": "^5.0.0",
    "svelte-check": "^4.0.0",
    "tailwindcss": "^3.4.0",
    "tslib": "^2.7.0",
    "typescript": "^5.6.0",
    "vite": "^6.0.0",
    "vitest": "^2.0.0"
  }
}
```

### svelte.config.js

```javascript
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html',
      precompress: false,
      strict: true
    }),
    paths: {
      base: process.env.NODE_ENV === 'production' ? '/music-industry-simulator' : ''
    }
  }
};

export default config;
```

### vite.config.ts

```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    environment: 'jsdom',
    globals: true
  }
});
```

### tsconfig.json

```json
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true,
    "moduleResolution": "bundler"
  }
}
```

### tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'game-bg': '#0a0a0a',
        'game-panel': '#1a1a1a',
        'game-accent': '#3b82f6'
      }
    },
  },
  plugins: [],
}
```

### postcss.config.js

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

## Code Quality Standards

### TypeScript Style
- **Formatter**: Prettier (default settings)
- **Linter**: ESLint with TypeScript plugin
- **Style**: 2-space indent, single quotes
- **Strict mode**: Enabled in tsconfig.json

### Type Safety
- Use explicit types for function parameters and returns
- Avoid `any` type - use `unknown` if type is truly unknown
- Use type guards for runtime type checking
- Leverage TypeScript's utility types (Partial, Pick, Omit, etc.)

### Naming Conventions
- Functions: camelCase (`calculateIncome`)
- Types/Interfaces: PascalCase (`GameState`, `Song`)
- Constants: UPPER_SNAKE_CASE (`TECH_UPGRADES`)
- Files: kebab-case (`song-generator.ts`)
- Components: PascalCase (`SongGenerator.svelte`)

### Documentation
```typescript
/**
 * Calculate total income per second from all songs
 * @param state - Current game state
 * @returns Total income per second in dollars
 */
export function calculateTotalIncome(state: GameState): number {
  return state.songs.reduce((sum, song) => 
    sum + song.incomePerSecond, 0);
}
```

### Svelte Component Best Practices
- Use TypeScript in `<script lang="ts">` blocks
- Export props with explicit types
- Use reactive statements (`$:`) for computed values
- Keep components focused and single-purpose
- Use Svelte stores for cross-component state

---

## Testing Requirements

### Unit Tests Example

```typescript
// tests/systems/songs.test.ts
import { describe, it, expect } from 'vitest';
import { calculateSongCost, queueSongs } from '../../src/lib/systems/songs';
import type { GameState } from '../../src/lib/game/types';

describe('Song System', () => {
  it('calculates song cost correctly', () => {
    const state: Partial<GameState> = { techTier: 1 };
    expect(calculateSongCost(state as GameState, 5)).toBe(5);
  });
  
  it('makes songs free after lifetime license', () => {
    const state: Partial<GameState> = { techTier: 2 };
    expect(calculateSongCost(state as GameState, 10)).toBe(0);
  });
  
  it('queues songs when player has money', () => {
    const state: GameState = {
      money: 100,
      techTier: 1,
      songQueue: [],
      songGenerationSpeed: 30000
    } as GameState;
    
    const result = queueSongs(state, 5);
    expect(result).toBe(true);
    expect(state.songQueue.length).toBe(5);
    expect(state.money).toBe(95);
  });
  
  it('fails to queue when insufficient funds', () => {
    const state: GameState = {
      money: 2,
      techTier: 1,
      songQueue: []
    } as GameState;
    
    const result = queueSongs(state, 5);
    expect(result).toBe(false);
    expect(state.songQueue.length).toBe(0);
  });
});
```

### Component Tests Example

```typescript
// tests/components/SongGenerator.test.ts
import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import SongGenerator from '../../src/lib/components/SongGenerator.svelte';
import type { GameState } from '../../src/lib/game/types';

describe('SongGenerator Component', () => {
  it('renders correctly with initial state', () => {
    const gameState: GameState = {
      money: 100,
      techTier: 1,
      songQueue: [],
      songGenerationSpeed: 30000
    } as GameState;
    
    const { getByText } = render(SongGenerator, { props: { gameState } });
    expect(getByText('Generate Songs')).toBeInTheDocument();
  });
  
  it('disables buttons when player cannot afford', () => {
    const gameState: GameState = {
      money: 0,
      techTier: 1,
      songQueue: []
    } as GameState;
    
    const { getByText } = render(SongGenerator, { props: { gameState } });
    const button = getByText('x5') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
  
  it('enables buttons when player can afford', () => {
    const gameState: GameState = {
      money: 100,
      techTier: 1,
      songQueue: []
    } as GameState;
    
    const { getByText } = render(SongGenerator, { props: { gameState } });
    const button = getByText('x5') as HTMLButtonElement;
    expect(button.disabled).toBe(false);
  });
});
```

---

## Security & Best Practices

### LocalStorage Safety
- **No sensitive data**: Game state only, no personal info
- **Validate on load**: Check save file structure
- **Backup saves**: Keep last good save
- **Export/import**: Allow manual backup

### Performance
- **Tick rate**: 100ms (10 FPS) for game loop
- **Batch updates**: Update UI at most 10 times per second
- **Lazy rendering**: Only render visible elements
- **Number formatting**: Cache formatted strings

### Browser Compatibility
- Target: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- ES6+ features: Use freely, Vite transpiles
- No IE support needed

---

## Development Workflow

### Initial Setup
```bash
# Create new SvelteKit project with Svelte 5
# Use the new 'sv' CLI (announced with Svelte 5)
npx sv create music-industry-simulator
# Choose: SvelteKit, TypeScript, Tailwind CSS, Vitest

# Or clone existing repository
git clone https://github.com/[username]/music-industry-simulator.git
cd music-industry-simulator

# Install dependencies
npm install

# Start dev server
npm run dev
# Opens at http://localhost:5173
```

### Building
```bash
# Type check
npm run check

# Build for production
npm run build
# Outputs to ./build directory

# Preview production build
npm run preview
```

### Testing
```bash
# Run tests once
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

---

## Agent Task Assignment

### Phase 1: Core Systems (Parallel)
- **Agent A**: Game engine, save system, main loop
- **Agent B**: Song system, income calculation
- **Agent C**: Tech upgrade system
- **Agent D**: Name generation, word lists

### Phase 2: Progression (Parallel)
- **Agent A**: Physical album system
- **Agent B**: Tour system
- **Agent C**: Prestige system
- **Agent D**: UI components for phases 1-2

### Phase 3: Advanced (Parallel)
- **Agent A**: Exploitation abilities
- **Agent B**: Monopoly system
- **Agent C**: Industry control progress
- **Agent D**: UI components for phases 3-5

### Phase 4: Polish (Parallel)
- **Agent A**: Animations and transitions
- **Agent B**: Notifications and modals
- **Agent C**: Testing and bug fixes
- **Agent D**: Documentation and README

---

## Success Criteria

The implementation is complete when:
- [ ] Game loop runs at 10 TPS
- [ ] Song generation with queue system works
- [ ] Income generates correctly from songs
- [ ] All 5 phases unlock progressively
- [ ] Prestige system resets correctly
- [ ] Industry control bar fills to 100%
- [ ] Victory screen displays
- [ ] Save/load works reliably
- [ ] Export/import saves works
- [ ] All tests pass with >70% coverage
- [ ] Builds successfully to static files
- [ ] Deploys to GitHub Pages
- [ ] Playable for 8-12 hours without bugs

---

## Questions & Support

If implementation details need clarification:
1. Reference the game design doc: `ai-music-idle-game-design.md`
2. Check this file for technical details
3. Create GitHub issue with questions
4. Tag appropriate system label

Good luck building the AI Music Empire! 🎵
