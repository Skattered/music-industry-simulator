# AGENTS.md - AI Agent Implementation Guide

This document provides comprehensive guidance for AI agents implementing the AI Music Idle Game project. Follow these instructions carefully to maintain code quality and system reliability.

## Project Overview

**Goal**: Build a web-based idle/incremental game where players create AI music and dominate the music industry.

**Architecture**: Client-side only SvelteKit application with TypeScript, deployed to GitHub Pages via static site generation.

**Key Principle**: This is a single-user, client-side game. No backend, no authentication, no database - just localStorage and game logic.

## Technology Stack

### Frontend
- **Framework**: SvelteKit 2.x (latest: 2.48.x)
- **UI Library**: Svelte 5 (latest: 5.43.x) - **Uses runes, not old stores!**
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS 3.4+
- **Build Tool**: Vite 6.x
- **Adapter**: @sveltejs/adapter-static (for GitHub Pages)

### State Management
- **Svelte 5 Runes**: `$state`, `$derived`, `$effect` (NOT the old `writable`/`derived` stores)
- **Persistence**: Browser localStorage
- **Game Loop**: Custom engine running at 10 ticks per second

### Testing
- **Unit Tests**: Vitest 2.x
- **Component Tests**: @testing-library/svelte 5.x
- **Coverage Target**: >70% for game logic

## Project Structure

```
/
├── src/
│   ├── routes/
│   │   ├── +page.svelte              # Main game page
│   │   └── +layout.svelte            # Root layout
│   ├── lib/
│   │   ├── game/
│   │   │   ├── engine.ts             # Core game loop
│   │   │   ├── save.ts               # LocalStorage persistence
│   │   │   ├── config.ts             # Game constants
│   │   │   ├── types.ts              # TypeScript interfaces
│   │   │   └── utils.ts              # Helper functions
│   │   ├── systems/                  # Game systems (one per file)
│   │   │   ├── songs.ts
│   │   │   ├── income.ts
│   │   │   ├── fans.ts
│   │   │   ├── upgrades.ts
│   │   │   ├── prestige.ts
│   │   │   ├── tech.ts
│   │   │   ├── physical.ts
│   │   │   ├── tours.ts
│   │   │   ├── exploitation.ts
│   │   │   └── monopoly.ts
│   │   ├── components/               # Svelte components
│   │   │   ├── ResourceBar.svelte
│   │   │   ├── SongGenerator.svelte
│   │   │   ├── UpgradePanel.svelte
│   │   │   └── ... (more components)
│   │   └── data/
│   │       ├── names.ts              # Word lists for mad-lib names
│   │       └── content.ts            # Flavor text
│   └── app.html                      # HTML template
├── static/
│   ├── favicon.ico
│   └── .nojekyll                     # Required for GitHub Pages
├── tests/
│   ├── game/
│   ├── systems/
│   └── components/
├── .github/
│   └── workflows/
│       └── deploy.yml                # GitHub Actions
├── README.md
├── AGENTS.md                         # This file
├── package.json
├── svelte.config.js
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── .gitignore
```

## Critical: Svelte 5 Runes

**THIS IS THE MOST IMPORTANT SECTION - READ CAREFULLY**

Svelte 5 fundamentally changed how reactivity works. The old `$:` syntax and stores are deprecated.

### Old Way (Svelte 4) - DO NOT USE:
```javascript
// ❌ OLD - Don't use this
import { writable, derived } from 'svelte/store';
export const count = writable(0);
export const doubled = derived(count, $c => $c * 2);

// ❌ OLD - Don't use this in components
let count = 0;
$: doubled = count * 2;
```

### New Way (Svelte 5) - USE THIS:
```typescript
// ✅ NEW - Use runes
let count = $state(0);
let doubled = $derived(count * 2);

$effect(() => {
  console.log(`Count is now ${count}`);
});
```

### Component Props (Svelte 5):
```typescript
// ✅ Props with runes
let { gameState = $bindable() }: { gameState: GameState } = $props();

// ✅ Derived from props
let totalIncome = $derived(
  gameState.songs.reduce((sum, s) => sum + s.incomePerSecond, 0)
);
```

### Event Handlers (Svelte 5):
```svelte
<!-- ✅ NEW - Use onclick, not on:click -->
<button onclick={() => count++}>Increment</button>

<!-- ❌ OLD - Don't use this -->
<button on:click={() => count++}>Increment</button>
```

**Resources:**
- [Svelte 5 Runes Docs](https://svelte.dev/docs/svelte/$state)
- [Svelte 5 Migration Guide](https://svelte.dev/docs/svelte/v5-migration-guide)

## Implementation Guidelines

### Game State Management

**CRITICAL**: All game state is managed through a single reactive object using `$state`.

```typescript
// src/lib/game/types.ts
export interface GameState {
  money: number;
  songs: Song[];
  fans: number;
  gpu: number;
  phase: number;
  industryControl: number;
  currentArtist: Artist;
  legacyArtists: LegacyArtist[];
  songQueue: QueuedSong[];
  songGenerationSpeed: number;
  techTier: number;
  techSubTier: number;
  upgrades: Record<string, Upgrade>;
  activeBoosts: ActiveBoost[];
  prestigeCount: number;
  experienceMultiplier: number;
  unlockedSystems: UnlockedSystems;
  lastUpdate: number;
  createdAt: number;
}
```

**State lives in the root +page.svelte:**
```typescript
// src/routes/+page.svelte
let gameState = $state<GameState>(loadGame() || getInitialState());

// Pass to child components
<SongGenerator bind:gameState />
```

**Systems mutate state directly:**
```typescript
// src/lib/systems/songs.ts
export function processSongQueue(state: GameState, deltaTime: number): void {
  if (state.songQueue.length === 0) return;
  
  const current = state.songQueue[0];
  current.progress += deltaTime * 1000;
  
  if (current.progress >= current.totalTime) {
    const newSong = generateSong(state);
    state.songs.push(newSong);  // Direct mutation is fine with $state
    state.songQueue.shift();
  }
}
```

### Game Loop Architecture

```typescript
// src/lib/game/engine.ts
export class GameEngine {
  private lastTick: number = Date.now();
  private tickRate: number = 100; // 100ms = 10 TPS
  private isRunning: boolean = false;
  private intervalId?: number;
  private gameState: GameState;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTick = Date.now();
    this.intervalId = window.setInterval(() => this.tick(), this.tickRate);
  }

  private tick() {
    const now = Date.now();
    const deltaTime = (now - this.lastTick) / 1000;
    this.lastTick = now;

    // Process all systems (they mutate gameState)
    processSongQueue(this.gameState, deltaTime);
    generateIncome(this.gameState, deltaTime);
    generateFans(this.gameState, deltaTime);
    // ... more systems
    
    // Svelte 5 automatically detects mutations and updates UI
  }

  stop() {
    if (this.isRunning) return;
    this.isRunning = false;
    if (this.intervalId) clearInterval(this.intervalId);
    saveGame(this.gameState);
  }
}
```

**Key Points:**
- Game loop runs at 10 TPS (every 100ms)
- Systems receive `deltaTime` in seconds for frame-independent logic
- Systems mutate state directly (Svelte 5 tracks this automatically)
- No need to manually trigger updates - runes handle it

### LocalStorage Persistence

```typescript
// src/lib/game/save.ts
const SAVE_KEY = 'ai_music_game_save';
const BACKUP_KEY = 'ai_music_game_backup';

export function saveGame(state: GameState): boolean {
  try {
    const currentSave = localStorage.getItem(SAVE_KEY);
    if (currentSave) {
      localStorage.setItem(BACKUP_KEY, currentSave);
    }
    
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
    
    if (!validateSave(state)) {
      console.warn('Invalid save, loading backup');
      return loadBackup();
    }
    
    return state;
  } catch (error) {
    console.error('Failed to load game:', error);
    return loadBackup();
  }
}

function validateSave(state: any): state is GameState {
  return state &&
         typeof state.money === 'number' &&
         Array.isArray(state.songs) &&
         typeof state.fans === 'number' &&
         state.currentArtist &&
         typeof state.industryControl === 'number';
}
```

**Rules:**
- Always keep a backup of the previous save
- Validate save structure before loading
- Fail gracefully - never lose player progress
- Auto-save every 10 seconds in the game loop
- Provide export/import functionality for manual backups

### Component Patterns

```svelte
<!-- src/lib/components/SongGenerator.svelte -->
<script lang="ts">
  import type { GameState } from '$lib/game/types';
  import { queueSongs, calculateSongCost } from '$lib/systems/songs';
  import { formatMoney, formatTime } from '$lib/game/utils';
  
  // Props using Svelte 5 syntax
  let { gameState = $bindable() }: { gameState: GameState } = $props();
  
  // Derived values
  let cost = $derived(calculateSongCost(gameState));
  let canAfford = $derived((count: number) => 
    gameState.money >= calculateSongCost(gameState, count)
  );
  let generationTime = $derived(gameState.songGenerationSpeed / 1000);
  
  function generate(count: number) {
    queueSongs(gameState, count);
    // No need to update state - queueSongs mutates it directly
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
          style:width="{(gameState.songQueue[0].progress / gameState.songQueue[0].totalTime) * 100}%"
        ></div>
      </div>
    </div>
  {/if}
  
  <div class="grid grid-cols-4 gap-2">
    <button
      onclick={() => generate(1)}
      disabled={!canAfford(1)}
      class="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 rounded transition"
    >
      x1
    </button>
    <!-- More buttons... -->
  </div>
</div>
```

**Component Best Practices:**
- Use `$props()` for component props with TypeScript types
- Use `$bindable()` for two-way binding (like `gameState`)
- Use `$derived` for computed values (replaces `$:`)
- Use `onclick` not `on:click` (Svelte 5 change)
- Use `style:` directive for inline styles
- Keep components focused on presentation
- Business logic stays in `/systems` files

### System File Pattern

Each system file handles one aspect of the game:

```typescript
// src/lib/systems/songs.ts
import type { GameState, Song } from '$lib/game/types';

export function generateSong(state: GameState): Song {
  const song: Song = {
    id: crypto.randomUUID(),
    name: generateSongName(state),
    genre: state.currentTrendingGenre || 'pop',
    createdAt: Date.now(),
    incomePerSecond: calculateSongIncome(state),
    fanGenerationRate: calculateFanGeneration(state),
    isTrending: state.currentTrendingGenre === state.currentTrendingGenre
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
  
  const current = state.songQueue[0];
  current.progress += deltaTime * 1000;
  
  if (current.progress >= current.totalTime) {
    const newSong = generateSong(state);
    state.songs.push(newSong);
    state.currentArtist.songs++;
    state.songQueue.shift();
  }
}

export function calculateSongCost(state: GameState, count: number = 1): number {
  if (state.techTier >= 2) return 0; // Free after lifetime license
  return count * 1;
}

export function calculateSongIncome(state: GameState): number {
  let baseIncome = 0.01 / 60; // $0.01 per minute
  baseIncome *= Math.pow(1.5, state.techTier - 1);
  baseIncome *= (1 + state.techSubTier * 0.2);
  baseIncome *= state.experienceMultiplier;
  return baseIncome;
}

function calculateFanGeneration(state: GameState): number {
  return 0.001; // Base fans per second per song
}

function generateSongName(state: GameState): string {
  // TODO: Implement with word lists
  return 'Untitled Song';
}
```

**System File Rules:**
- One system per file (songs.ts, tours.ts, etc.)
- Export pure functions that take `GameState` and mutate it
- No side effects except state mutation
- No imports from other systems (keep them independent)
- All logic for that system in one place
- Use descriptive function names

## Multi-Agent Collaboration Strategy

### File-Based Module System

**Strict boundaries prevent conflicts:**

1. **Each agent claims a module** (system file or component)
2. **Systems are independent** - no cross-dependencies
3. **State is the only shared contract** (defined in `types.ts`)
4. **Components own their UI** - systems own logic

### Task Assignment Pattern

**Phase 1: Core Systems** (can work in parallel)
- Agent A: `game/engine.ts`, `game/save.ts`, `game/utils.ts`
- Agent B: `systems/songs.ts`, `systems/income.ts`
- Agent C: `systems/upgrades.ts`, `systems/tech.ts`
- Agent D: `data/names.ts`, `data/content.ts`, `game/types.ts`

**Phase 2: Progression Systems** (can work in parallel)
- Agent A: `systems/physical.ts`
- Agent B: `systems/tours.ts`
- Agent C: `systems/prestige.ts`
- Agent D: `components/SongGenerator.svelte`, `components/ResourceBar.svelte`

**Phase 3: Advanced Systems** (can work in parallel)
- Agent A: `systems/exploitation.ts`
- Agent B: `systems/monopoly.ts`
- Agent C: `systems/fans.ts`
- Agent D: `components/UpgradePanel.svelte`, `components/TechTree.svelte`

**Phase 4: UI & Polish** (can work in parallel)
- Agent A: Remaining components
- Agent B: Modals and dialogs
- Agent C: Animations and transitions
- Agent D: Testing and bug fixes

### Pull Request Workflow

1. **Create issue** with system label: `system:songs`, `ui:component`, etc.
2. **Claim issue** by assigning yourself
3. **Create branch**: `feature/songs-generation` or `ui/song-generator`
4. **Work only on assigned files**
5. **Create PR** referencing the issue
6. **One feature per PR** - keep them focused
7. **Wait for review** from another agent
8. **Merge when approved**

### Avoiding Conflicts

**DO:**
- Pull latest `main` before starting work
- Work in your assigned file(s) only
- Test your changes locally
- Write clear commit messages
- Update the issue with progress

**DON'T:**
- Touch files assigned to other agents
- Modify `types.ts` without coordination
- Change the game loop without discussion
- Merge without approval
- Work on multiple systems simultaneously

## Code Quality Standards

### TypeScript Style

```typescript
// ✅ Good - Explicit types
export function calculateIncome(state: GameState, deltaTime: number): number {
  return state.songs.reduce((sum, song) => sum + song.incomePerSecond, 0) * deltaTime;
}

// ❌ Bad - No types
export function calculateIncome(state, deltaTime) {
  return state.songs.reduce((sum, song) => sum + song.incomePerSecond, 0) * deltaTime;
}

// ✅ Good - Type guard
function isSong(obj: any): obj is Song {
  return obj && typeof obj.id === 'string' && typeof obj.incomePerSecond === 'number';
}

// ❌ Bad - Using 'any'
function processSong(song: any) {
  // ...
}
```

### Naming Conventions

- **Files**: kebab-case (`song-generator.ts`)
- **Components**: PascalCase (`SongGenerator.svelte`)
- **Functions**: camelCase (`calculateIncome`)
- **Types/Interfaces**: PascalCase (`GameState`, `Song`)
- **Constants**: UPPER_SNAKE_CASE (`SAVE_KEY`, `TICK_RATE`)

### Documentation

```typescript
/**
 * Calculate total passive income per second from all songs
 * 
 * @param state - Current game state
 * @param deltaTime - Time elapsed since last tick in seconds
 * @returns Total income generated this tick
 */
export function calculateIncome(state: GameState, deltaTime: number): number {
  const incomePerSecond = state.songs.reduce(
    (sum, song) => sum + song.incomePerSecond, 
    0
  );
  return incomePerSecond * deltaTime;
}
```

### Format and Lint

- **Formatter**: Prettier (default settings)
- **Linter**: ESLint with TypeScript plugin
- Run `npm run check` before committing
- No warnings allowed in production code

## Testing Requirements

### Unit Tests

```typescript
// tests/systems/songs.test.ts
import { describe, it, expect } from 'vitest';
import { calculateSongCost, queueSongs } from '../../src/lib/systems/songs';
import type { GameState } from '../../src/lib/game/types';

describe('Song System', () => {
  it('calculates cost correctly at tier 1', () => {
    const state = { techTier: 1 } as GameState;
    expect(calculateSongCost(state, 5)).toBe(5);
  });
  
  it('makes songs free after lifetime license', () => {
    const state = { techTier: 2 } as GameState;
    expect(calculateSongCost(state, 10)).toBe(0);
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
  
  it('fails when insufficient funds', () => {
    const state: GameState = {
      money: 2,
      techTier: 1,
      songQueue: []
    } as GameState;
    
    const result = queueSongs(state, 5);
    
    expect(result).toBe(false);
    expect(state.songQueue.length).toBe(0);
    expect(state.money).toBe(2);
  });
});
```

### Component Tests

```typescript
// tests/components/SongGenerator.test.ts
import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import SongGenerator from '../../src/lib/components/SongGenerator.svelte';
import type { GameState } from '../../src/lib/game/types';

describe('SongGenerator Component', () => {
  it('renders with initial state', () => {
    const gameState: GameState = {
      money: 100,
      techTier: 1,
      songQueue: [],
      songGenerationSpeed: 30000
    } as GameState;
    
    const { getByText } = render(SongGenerator, { props: { gameState } });
    expect(getByText('Generate Songs')).toBeInTheDocument();
  });
  
  it('disables buttons when cannot afford', () => {
    const gameState: GameState = {
      money: 0,
      techTier: 1,
      songQueue: []
    } as GameState;
    
    const { getByText } = render(SongGenerator, { props: { gameState } });
    const button = getByText('x5') as HTMLButtonElement;
    
    expect(button.disabled).toBe(true);
  });
});
```

**Testing Rules:**
- Test all public functions in system files
- Test component rendering and interactions
- Test edge cases (no money, max values, etc.)
- Mock external dependencies if needed
- Aim for >70% coverage on game logic

## Common Pitfalls & Solutions

### Pitfall 1: Using old Svelte 4 syntax

**Problem**: Code uses `writable`, `derived`, `$:` reactive statements.

**Solution**: Use Svelte 5 runes: `$state`, `$derived`, `$effect`. Read the [migration guide](https://svelte.dev/docs/svelte/v5-migration-guide).

### Pitfall 2: Not using deltaTime

**Problem**: Game logic runs at different speeds on different framerates.

```typescript
// ❌ Bad - frame-dependent
function tick() {
  state.money += 1; // Runs faster on faster machines
}
```

**Solution**: Always use `deltaTime` for calculations.

```typescript
// ✅ Good - frame-independent
function tick(deltaTime: number) {
  state.money += incomePerSecond * deltaTime;
}
```

### Pitfall 3: LocalStorage quota exceeded

**Problem**: Game state grows too large (>5MB) and localStorage fails.

**Solution**: 
- Keep save files compact (don't save derived data)
- Provide export/import for manual backups
- Handle quota errors gracefully

```typescript
try {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
} catch (error) {
  if (error instanceof DOMException && error.name === 'QuotaExceededError') {
    // Show user a message to export their save
    alert('Save failed - storage full. Please export your save.');
  }
}
```

### Pitfall 4: Mutating props in child components

**Problem**: Child components try to mutate props directly without `$bindable`.

**Solution**: Use `$bindable()` for props that need two-way binding.

```typescript
// ✅ In child component
let { gameState = $bindable() }: { gameState: GameState } = $props();

// Now mutations work and parent sees them
gameState.money += 100;
```

### Pitfall 5: Number precision issues

**Problem**: Floating point math causes weird money values like `0.10000000000000001`.

**Solution**: Format numbers for display, store as floats.

```typescript
export function formatMoney(amount: number): string {
  if (amount >= 1e12) return `$${(amount / 1e12).toFixed(2)}T`;
  if (amount >= 1e9) return `$${(amount / 1e9).toFixed(2)}B`;
  if (amount >= 1e6) return `$${(amount / 1e6).toFixed(2)}M`;
  if (amount >= 1e3) return `$${(amount / 1e3).toFixed(2)}K`;
  return `$${amount.toFixed(2)}`;
}
```

### Pitfall 6: Memory leaks in game loop

**Problem**: Game loop continues running after component unmount.

**Solution**: Always clean up in `onDestroy`.

```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  
  onMount(() => {
    gameEngine.start();
  });
  
  onDestroy(() => {
    gameEngine.stop(); // Critical - stops the interval
  });
</script>
```

## GitHub Pages Deployment

### svelte.config.js

```javascript
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

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
      // CRITICAL: Must match your repo name
      base: process.env.NODE_ENV === 'production' ? '/ai-music-idle-game' : ''
    }
  }
};

export default config;
```

### GitHub Actions

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

**Important:**
- Must have `.nojekyll` file in `/static` directory
- Base path must match repo name exactly
- Test locally with `npm run build && npm run preview`

## Success Criteria

The implementation is complete when:

### Functionality
- [ ] Game loop runs at 10 TPS without lag
- [ ] Song generation with queue system works
- [ ] Income generates correctly from songs
- [ ] All 5 phases unlock progressively
- [ ] Prestige system resets correctly with bonuses
- [ ] Industry control bar fills to 100%
- [ ] Victory screen displays on completion
- [ ] Save/load works reliably across sessions
- [ ] Export/import save files works

### Code Quality
- [ ] All TypeScript without `any` types
- [ ] All tests pass with >70% coverage
- [ ] No ESLint warnings
- [ ] Svelte 5 runes used correctly (no old stores)
- [ ] Components follow best practices

### Deployment
- [ ] Builds successfully to static files
- [ ] Deploys to GitHub Pages automatically
- [ ] Works in all modern browsers
- [ ] No console errors in production

### Game Balance
- [ ] Playable for 8-12 hours without major balance issues
- [ ] Each prestige feels rewarding
- [ ] Progression feels smooth, not too fast or slow
- [ ] No game-breaking exploits

## Questions & Support

If implementation details need clarification:

1. **Check the design doc**: `ai-music-idle-game-design.md`
2. **Check this file**: Re-read relevant sections
3. **Check Svelte 5 docs**: https://svelte.dev/docs/svelte/overview
4. **Create an issue**: Tag with appropriate label
5. **Ask in PR comments**: Tag another agent for help

## Resources

- [Svelte 5 Docs](https://svelte.dev/docs/svelte/overview)
- [Svelte 5 Migration Guide](https://svelte.dev/docs/svelte/v5-migration-guide)
- [SvelteKit Docs](https://kit.svelte.dev/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Vitest Docs](https://vitest.dev/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)

---

Good luck building the AI Music Empire! Remember: when in doubt, check if you're using Svelte 5 runes correctly - that's the #1 source of confusion. 🎵
