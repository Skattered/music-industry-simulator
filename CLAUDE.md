# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Music Industry Simulator** - An idle/incremental game where you're an AI music creator progressing from zero to total music industry domination. This is a client-side only SvelteKit application using Svelte 5's runes system, with no backend required. All state persists in localStorage.

**Target Play Time**: 8-12 hours | **Theme**: Building an AI music empire through increasingly gross capitalist tactics

## Commands

### Development
```bash
npm run dev          # Start dev server at http://localhost:5173
npm run build        # Build static site for production
npm run preview      # Preview production build locally
npm run check        # Type check with svelte-check (run before committing)
npm run check:watch  # Type check in watch mode
```

### Testing
```bash
npm test             # Run all tests once
npm run test:watch   # Run tests in watch mode (for development)
npm run test:ui      # Open Vitest UI for interactive testing
npm run test:coverage # Generate coverage report (target: >70% for game logic)
```

### Code Quality
```bash
npm run format       # Format code with Prettier
npm run format:check # Check code formatting without changes
```

### Running Individual Tests
```bash
# Run a specific test file
npx vitest run src/lib/game/engine.test.ts

# Run tests matching a pattern
npx vitest run --grep "GameEngine"

# Watch a specific test file
npx vitest watch src/lib/systems/songs.test.ts
```

## Architecture

### Core Concepts

1. **Client-Side Only**: No server, no database, no authentication. All state in localStorage.
2. **Game Loop**: Runs at 10 TPS (ticks per second) using a tick-based engine with deltaTime for frame-independent logic.
3. **Immutable State Updates**: Systems receive GameState and return updated copies. Never mutate state directly.
4. **Svelte 5 Runes**: Use `$state`, `$derived`, `$effect` - NOT old Svelte 4 stores or `$:` reactive statements.

### Project Structure

```
src/lib/
├── game/              # Core game infrastructure
│   ├── engine.ts      # 10 TPS tick-based game loop with auto-save
│   ├── save.ts        # localStorage persistence with backup system
│   ├── config.ts      # All game constants (BASE_SONG_COST, TICK_RATE, etc.)
│   ├── types.ts       # All TypeScript interfaces (GameState, Song, etc.)
│   └── utils.ts       # Pure utility functions (formatMoney, clamp, etc.)
├── systems/           # Game mechanics (pure functions, immutable updates)
│   ├── songs.ts       # Song generation, queue, passive income
│   ├── income.ts      # Money calculations, stream income
│   ├── fans.ts        # Fan growth, trending genres
│   ├── tech.ts        # Tech tier upgrades, prerequisites
│   └── boosts.ts      # Temporary exploitation abilities
├── components/        # Svelte 5 UI components
│   ├── ResourceBar.svelte    # Money, fans, songs display
│   ├── SongGenerator.svelte  # Queue songs with 1x/5x/10x/Max buttons
│   ├── TechTree.svelte       # Tech upgrade visualization
│   └── UpgradePanel.svelte   # Exploitation abilities UI
└── data/              # Static game content
    ├── names.ts       # Mad-lib name generation for songs/artists
    ├── words.ts       # Word lists (ADJECTIVES, NOUNS, VERBS, etc.)
    └── tech-upgrades.ts # Tech tier upgrade definitions
```

### Key Systems

**Game Engine** (`src/lib/game/engine.ts`)
- Runs at 10 TPS (100ms intervals) using `setInterval`
- Calculates `deltaTime` for frame-independent logic
- Auto-saves every 10 seconds to localStorage
- Handles tab visibility changes and clock jumps
- Processes: song queue → income calculation → fan growth → boost expiration

**State Management**
- GameState is the single source of truth (see `src/lib/game/types.ts`)
- Systems are pure functions: `(gameState, ...args) => newGameState`
- Never mutate gameState directly - always return new objects
- Components use `$bindable()` for two-way binding: `let { gameState = $bindable() } = $props();`

**Song System** (`src/lib/systems/songs.ts`)
- Songs generate passive income based on tech tier multipliers
- Queue system: add songs → progress over time → complete → start earning
- Songs have genres that can match trending genres for 2x income
- Tech upgrades reduce cost and generation time

**Tech System** (`src/lib/systems/tech.ts`)
- 7 tech tiers, each with 3 sub-tier upgrades (21 total)
- Upgrades modify: songCost, songSpeed, incomeMultiplier
- Prerequisites enforce progression order
- Some upgrades unlock new game systems (GPU, prestige, albums, tours)

## Critical: Svelte 5 Runes

**This project uses Svelte 5, which fundamentally changed reactivity. DO NOT use old Svelte 4 patterns.**

### Component State - Use Runes

```typescript
// ✅ CORRECT - Svelte 5 runes
<script lang="ts">
  let { gameState = $bindable() }: { gameState: GameState } = $props();

  // Simple derived value
  const totalSongs = $derived(gameState.songs.length);

  // Complex derived value - use IIFE pattern
  const maxAffordable = $derived(
    (() => {
      const cost = getCurrentSongCost(gameState);
      if (cost === 0) return 10;
      return Math.floor(gameState.money / cost);
    })()
  );

  // Side effects
  $effect(() => {
    console.log('Songs changed:', totalSongs);
  });
</script>
```

```typescript
// ❌ WRONG - Svelte 4 stores (DO NOT USE)
import { writable, derived } from 'svelte/store';
export const count = writable(0);
let $: doubled = count * 2; // NO - $: is deprecated
```

### Common Derived Value Patterns

```typescript
// ✅ Simple expression
const doubled = $derived(count * 2);

// ✅ IIFE for complex logic (returns a value, not a function)
const result = $derived(
  (() => {
    if (condition) return valueA;
    return valueB;
  })()
);

// ✅ Use @const in templates to cache repeated calls
{#each upgrades as upgrade}
  {@const purchased = isPurchased(upgrade.id)}
  {@const locked = isLocked(upgrade)}
  {@const affordable = canAfford(upgrade.id)}

  <div class:purchased={purchased} class:locked={locked}>
    <button disabled={!affordable}>Purchase</button>
  </div>
{/each}

// ❌ WRONG - creates a function, not a value
const result = $derived(() => { /* logic */ });

// ❌ WRONG - calling it as function in template
<div>{result()}</div>
```

### Bindable Props

```typescript
// ✅ CORRECT - Component with bindable prop
<script lang="ts">
  let { gameState = $bindable() }: { gameState: GameState } = $props();

  function handlePurchase(upgradeId: string) {
    purchaseTechUpgrade(gameState, upgradeId);
    // $bindable() automatically tracks mutations - NO reassignment needed
  }
</script>

// ❌ WRONG - unnecessary reassignment
function handlePurchase(upgradeId: string) {
  purchaseTechUpgrade(gameState, upgradeId);
  gameState = gameState; // DON'T DO THIS
}
```

## Testing

### Test File Locations
- Game logic: `src/lib/game/*.test.ts` (co-located with source)
- Systems: `src/lib/systems/*.test.ts` (co-located with source)
- Components: `src/lib/components/*.test.ts` (co-located with component)

### Test Helpers
Create test GameState with `createTestGameState()` helper (see any `*.test.ts` file):

```typescript
function createTestGameState(overrides?: Partial<GameState>): GameState {
  return {
    money: INITIAL_MONEY,
    songs: [],
    fans: INITIAL_FANS,
    // ... all required fields
    ...overrides
  };
}

// Usage
const state = createTestGameState({
  money: 100,
  techTier: 2
});
```

### Component Testing
```typescript
import { render, fireEvent } from '@testing-library/svelte';
import MyComponent from './MyComponent.svelte';

it('should render correctly', () => {
  const gameState = createTestGameState();
  const { container, getByTestId } = render(MyComponent, {
    props: { gameState }
  });

  expect(container.textContent).toContain('Expected text');

  const button = getByTestId('my-button');
  await fireEvent.click(button);

  expect(gameState.money).toBe(90); // Verify state mutation
});
```

## Code Style & Patterns

### Immutable State Updates
```typescript
// ✅ CORRECT - Return new objects
export function queueSongs(state: GameState, count: number): GameState {
  const cost = calculateSongCost(state, count);

  return {
    ...state,
    money: state.money - cost,
    songQueue: [
      ...state.songQueue,
      ...newSongs
    ]
  };
}

// ❌ WRONG - Mutating state directly
export function queueSongs(state: GameState, count: number): void {
  state.money -= cost; // DON'T MUTATE
  state.songQueue.push(...newSongs); // DON'T MUTATE
}
```

### Type Safety
- All functions must have explicit return types
- No `any` types allowed (strict mode enabled)
- Use type guards for runtime checks: `if (typeof x === 'number')`
- Prefer `interface` over `type` for object shapes

### Naming Conventions
- Functions: camelCase (`calculateIncome`, `queueSongs`)
- Types/Interfaces: PascalCase (`GameState`, `Song`, `TechTier`)
- Constants: UPPER_SNAKE_CASE (`BASE_SONG_COST`, `TICK_RATE`)
- Components: PascalCase files (`SongGenerator.svelte`)
- Test files: `*.test.ts` (co-located with source)

## Common Pitfalls

1. **Svelte 5 Runes**: Don't use old `$:` or stores. Use `$derived`, `$state`, `$effect`.
2. **IIFE Pattern**: `$derived(() => {...})` creates a function. Use `$derived((() => {...})())` for complex logic.
3. **State Mutation**: Never mutate gameState. Always return new objects with spread syntax.
4. **Bindable Props**: Don't reassign after mutation - `$bindable()` auto-tracks changes.
5. **Test Isolation**: Each test should create its own GameState with `createTestGameState()`.

## Git Workflow

### Branch Naming
- Feature: `claude/feature-name-<id>`
- Fix: `claude/fix-description-<id>`

### Commit Messages
```
<type>: <subject>

<body>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

Types: `feat`, `fix`, `test`, `refactor`, `docs`, `style`

### Pull Requests
- PRs created automatically via GitHub CLI (`gh pr create`)
- Title: Descriptive summary of changes
- Body: Includes implementation details and test coverage
- All checks must pass (build, type check, tests)

## References

- **Game Design**: See `game-details.md` for complete mechanics and progression
- **Technical Spec**: See `tech-details.md` for implementation architecture
- **Implementation Plan**: See `implementation-plan.md` for phase-by-phase task breakdown
- **Agent Guide**: See `AGENTS.md` for AI agent collaboration workflow
