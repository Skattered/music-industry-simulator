# Fix Strategy - Music Industry Simulator Bugs

## Overview
This document outlines the exact code changes needed to fix all 5 bugs discovered in the investigation.

---

## Bug #3 & #4: Double Multiplier Application (CRITICAL)

### Problem
Prestige and trending multipliers applied twice:
1. At song creation (baked into song values)
2. At income/fan calculation (applied to totals)

### Solution Architecture
**Keep multipliers baked into songs, remove from calculations**

This is the cleanest approach because:
- Songs are created once and have fixed values
- Easier to reason about (songs show actual income)
- No need to recalculate multipliers every tick
- Boosts still work (temporary, not baked in)

### File: `src/lib/systems/income.ts`

#### Change 1: Remove prestige multiplier from applyIncomeMultipliers
```typescript
// BEFORE (lines 67-82)
export function applyIncomeMultipliers(state: GameState, baseIncome: number): number {
	let income = baseIncome;

	// Apply upgrade multipliers (additive stacking)
	const upgradeMultiplier = calculateUpgradeMultiplier(state);
	income *= upgradeMultiplier;

	// Apply prestige experience multiplier
	income *= state.experienceMultiplier;  // ← REMOVE THIS

	// Apply active boost multipliers (multiplicative stacking)
	const boostMultiplier = calculateBoostMultiplier(state, 'incomeMultiplier');
	income *= boostMultiplier;

	return income;
}

// AFTER
export function applyIncomeMultipliers(state: GameState, baseIncome: number): number {
	let income = baseIncome;

	// NOTE: Upgrade and prestige multipliers are already baked into song values
	// Only apply temporary boost multipliers here

	// Apply active boost multipliers (multiplicative stacking)
	const boostMultiplier = calculateBoostMultiplier(state, 'incomeMultiplier');
	income *= boostMultiplier;

	return income;
}
```

#### Change 2: Remove trending multiplier from calculateSongIncome
```typescript
// BEFORE (lines 88-103)
function calculateSongIncome(state: GameState): number {
	let income = 0;

	for (const song of state.songs) {
		let songIncome = song.incomePerSecond;

		// Apply trending multiplier if song matches current trending genre and is marked as trending
		if (state.currentTrendingGenre === song.genre && song.isTrending) {
			songIncome *= TRENDING_MULTIPLIER;  // ← REMOVE THIS
		}

		income += songIncome;
	}

	return income;
}

// AFTER
function calculateSongIncome(state: GameState): number {
	let income = 0;

	for (const song of state.songs) {
		// Songs already have trending bonus baked in when created
		// song.incomePerSecond already includes trending multiplier if applicable
		income += song.incomePerSecond;
	}

	return income;
}
```

#### Change 3: Remove stub upgrade multiplier function
```typescript
// REMOVE THIS ENTIRE FUNCTION (lines 148-160)
function calculateUpgradeMultiplier(state: GameState): number {
	let multiplier = 1.0;
	
	// Note: In a full implementation, we would look up upgrade definitions
	// and sum their incomeMultiplier effects. For now, we return base multiplier.
	// This will be implemented when the upgrade system is added.
	
	return multiplier;
}
```

### File: `src/lib/systems/fans.ts`

#### Change 1: Remove prestige multiplier from applyFanMultipliers
```typescript
// BEFORE (lines 100-111)
function applyFanMultipliers(state: GameState, baseFanGeneration: number): number {
	let fanGeneration = baseFanGeneration;

	// Apply prestige experience multiplier
	fanGeneration *= state.experienceMultiplier;  // ← REMOVE THIS

	// Apply active boost multipliers (multiplicative stacking)
	const boostMultiplier = calculateBoostMultiplier(state, 'fanMultiplier');
	fanGeneration *= boostMultiplier;

	return fanGeneration;
}

// AFTER
function applyFanMultipliers(state: GameState, baseFanGeneration: number): number {
	// NOTE: Prestige multiplier is already baked into song fan generation rates
	// Only apply temporary boost multipliers here

	// Apply active boost multipliers (multiplicative stacking)
	const boostMultiplier = calculateBoostMultiplier(state, 'fanMultiplier');
	return baseFanGeneration * boostMultiplier;
}
```

#### Change 2: Remove trending multiplier from calculateSongFanGeneration
```typescript
// BEFORE (lines 75-90)
function calculateSongFanGeneration(state: GameState): number {
	let fanGeneration = 0;

	for (const song of state.songs) {
		let songFanGen = song.fanGenerationRate;

		// Apply trending multiplier if song matches current trending genre and is marked as trending
		if (state.currentTrendingGenre === song.genre && song.isTrending) {
			songFanGen *= TRENDING_MULTIPLIER;  // ← REMOVE THIS
		}

		fanGeneration += songFanGen;
	}

	return fanGeneration;
}

// AFTER
function calculateSongFanGeneration(state: GameState): number {
	let fanGeneration = 0;

	for (const song of state.songs) {
		// Songs already have trending bonus baked in when created
		// song.fanGenerationRate already includes trending multiplier if applicable
		fanGeneration += song.fanGenerationRate;
	}

	return fanGeneration;
}
```

### File: `src/lib/systems/songs.ts`

#### Add clarifying comment
```typescript
// Add at line 189 (before generateSong function)
/**
 * Generate a single completed song
 * 
 * IMPORTANT: This function bakes ALL multipliers into the song's income and fan values:
 * - Upgrade multiplier (from tech tier)
 * - Prestige experience multiplier
 * - Trending multiplier (if applicable, with fade)
 * 
 * These multipliers should NOT be re-applied in income/fan calculations!
 * Only temporary boost multipliers should be applied there.
 *
 * @param state - Current game state
 * @returns A new Song object with final calculated values
 */
```

---

## Bug #1, #5: Duplicate Unlock Triggers

### Problem
Systems unlock in two places:
1. In `tech.ts::applyTechEffects()` immediately when upgrade purchased
2. In `unlocks.ts::checkXXXUnlock()` on every game tick

### Solution
Remove unlock logic from `tech.ts`, keep only in `unlocks.ts`

### File: `src/lib/systems/tech.ts`

#### Change 1: Remove GPU unlock
```typescript
// REMOVE lines 116-124
if (effects.unlockGPU) {
	state.unlockedSystems.gpu = true;
	console.log('💻 System Unlocked: GPU Resources! Run AI models locally on your hardware.');
	toastStore.unlock(
		'GPU Resources Unlocked!',
		'Run AI models locally on your hardware',
		'💻'
	);
}
```

#### Change 2: Remove Prestige unlock
```typescript
// REMOVE lines 126-134
if (effects.unlockPrestige) {
	state.unlockedSystems.prestige = true;
	console.log('⭐ System Unlocked: Prestige! Reset your progress to gain permanent bonuses.');
	toastStore.unlock(
		'Prestige Unlocked!',
		'Reset your progress to gain permanent bonuses',
		'⭐'
	);
}
```

#### Change 3: Remove Physical Albums unlock
```typescript
// REMOVE lines 136-144
if (effects.unlockPhysicalAlbums) {
	state.unlockedSystems.physicalAlbums = true;
	console.log('🎵 System Unlocked: Physical Albums! Release albums for massive one-time payouts.');
	toastStore.unlock(
		'Physical Albums Unlocked!',
		'Release albums for massive one-time payouts',
		'🎵'
	);
}
```

#### Change 4: Remove Trend Research unlock
```typescript
// REMOVE lines 153-161
if (effects.unlockTrendResearch) {
	state.unlockedSystems.trendResearch = true;
	console.log('🔍 System Unlocked: Trend Research! Discover trending genres for 2x income and fans.');
	toastStore.unlock(
		'Trend Research Unlocked!',
		'Discover trending genres for 2x income and fans',
		'🔍'
	);
}
```

#### Change 5: Remove unlockPrestigePoints call
```typescript
// REMOVE lines 86-88 in purchaseTechUpgrade()
// Check for prestige unlock
unlockPrestigePoints(state);
```

#### Change 6: Remove unlockPrestigePoints function
```typescript
// REMOVE entire function (lines 164-173)
export function unlockPrestigePoints(state: GameState): void {
	if (doesTierUnlockPrestige(state.techTier)) {
		state.unlockedSystems.prestige = true;
	}
}
```

#### Change 7: Update comments
```typescript
// REPLACE lines 145-147
// Note: Tours require 10 albums + 100K fans in addition to upgrade - handled by checkTourUnlock in unlocks.ts
// Note: Platform ownership requires 50 tours + 1M fans - handled by checkPlatformUnlock in unlocks.ts

// WITH
// NOTE: All system unlocks are handled in unlocks.ts to prevent duplicate toasts
// Tours require: upgrade + 10 albums + 100K fans
// Platform ownership requires: upgrade + 50 tours + 1M fans
// All other systems unlock immediately when upgrade is purchased (checked in unlocks.ts)
```

---

## Testing Updates

### File: `src/lib/systems/income.test.ts`

#### Update test expectations
```typescript
// BEFORE
it('should apply prestige experience multiplier', () => {
	const state = createTestState({
		experienceMultiplier: 1.5
	});
	expect(applyIncomeMultipliers(state, 100)).toBe(150);
});

// AFTER - prestige is NOT applied in applyIncomeMultipliers
it('should NOT apply prestige multiplier (already in songs)', () => {
	const state = createTestState({
		experienceMultiplier: 1.5
	});
	// Prestige is baked into songs, not applied here
	expect(applyIncomeMultipliers(state, 100)).toBe(100);
});
```

```typescript
// BEFORE
it('should apply all multipliers together', () => {
	// ... setup ...
	// 100 * 1.5 (prestige) * 2.0 (boost) = 300
	expect(applyIncomeMultipliers(state, 100)).toBe(300);
});

// AFTER
it('should apply only boost multipliers', () => {
	// ... setup ...
	// 100 * 2.0 (boost) = 200
	// Prestige already in base value
	expect(applyIncomeMultipliers(state, 100)).toBe(200);
});
```

### File: `src/lib/systems/fans.test.ts`

#### Update test expectations
```typescript
// Similar updates as income.test.ts
// Remove expectations for prestige multiplier in fan calculations
```

### File: `src/lib/systems/tech.test.ts`

#### Remove unlock tests
```typescript
// Remove or update tests that check for immediate unlocks in applyTechEffects
// Unlocks should now ONLY be tested in unlocks.test.ts
```

---

## Migration Notes

### Existing Save Files
No migration needed! Existing saves will work fine because:
- Songs already have multipliers baked in (working correctly now)
- We're just removing the SECOND application
- Income will decrease to correct values (fixing the bug)

### Player Impact
Players will notice:
- Income decreases (bug fix - they were getting too much)
- Trending is less powerful (bug fix - it was 4x instead of 2x)
- Prestige is less powerful (bug fix - it was exponential instead of linear)
- No more duplicate unlock toasts (bug fix - better UX)

**This is a balance fix, not a nerf!** Players were getting unintended bonuses.

---

## Summary of Changes

| File | Lines Changed | Description |
|------|---------------|-------------|
| `src/lib/systems/income.ts` | ~20 | Remove double multipliers |
| `src/lib/systems/fans.ts` | ~15 | Remove double multipliers |
| `src/lib/systems/tech.ts` | ~50 | Remove duplicate unlocks |
| `src/lib/systems/songs.ts` | +10 | Add documentation |
| `src/lib/systems/income.test.ts` | ~10 | Update expectations |
| `src/lib/systems/fans.test.ts` | ~10 | Update expectations |

**Total:** ~115 lines modified, mostly deletions

---

## Verification Checklist

After implementing fixes:

### Income Calculation
- [ ] Create new game, generate 1 song
- [ ] Note base income (should be $2/sec)
- [ ] Prestige with 1.15x multiplier
- [ ] Generate 1 song with same conditions
- [ ] Verify income is $2.30/sec (exactly 1.15x, not 1.32x)

### Trending Bonus
- [ ] Research trending genre
- [ ] Generate trending songs
- [ ] Verify income is 2x base (not 4x)
- [ ] Verify fans are 2x base (not 4x)

### Unlock Toasts
- [ ] Purchase tier1_advanced (Trend Research)
- [ ] Verify ONE toast appears
- [ ] Purchase tier2_improved (Physical Albums)
- [ ] Verify ONE toast appears
- [ ] Purchase tier3_basic (GPU + Prestige)
- [ ] Verify TWO toasts appear (one for each)
- [ ] Check console for duplicate logs (should be none)

### Existing Saves
- [ ] Load existing save with prestige
- [ ] Verify income adjusts correctly
- [ ] Verify no errors in console
- [ ] Verify game is still playable

---

## Risk Assessment

### Low Risk Changes
- Removing unlock duplicates (pure deletion, safe)
- Removing stub function (never used)
- Updating tests (test-only changes)

### Medium Risk Changes
- Removing multipliers from income/fan calc (changes balance)
- Need thorough testing to verify calculations

### Mitigation
- All changes remove code (less likely to break things)
- Tests will catch calculation errors
- Manual verification checklist provided
- Existing saves still work (just get corrected values)

---

## Post-Fix Tasks

1. Update BALANCE_REPORT.md with new calculations
2. Run full test suite
3. Manual playthrough to verify balance
4. Update documentation with correct multiplier behavior
5. Consider adding integration test for multiplier stacking
