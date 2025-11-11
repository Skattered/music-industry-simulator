# Investigation Findings: Conflicting Systems & Double-Stacking Bonuses

## Date: 2025-11-11

## Executive Summary
Comprehensive investigation of the codebase revealed **5 critical bugs** involving duplicate unlock triggers, double-stacking multipliers, and inconsistent implementations.

---

## Bug #1: Duplicate Physical Albums Unlock Triggers ⚠️ CRITICAL

### Description
Physical albums unlock is triggered in TWO places, causing duplicate toast notifications.

### Locations
1. **`src/lib/systems/tech.ts:137`** - In `applyTechEffects()` when purchasing API Access upgrade
2. **`src/lib/systems/unlocks.ts:46`** - In `checkPhysicalAlbumUnlock()` called every game tick

### Code Evidence
```typescript
// tech.ts line 136-144
if (effects.unlockPhysicalAlbums) {
    state.unlockedSystems.physicalAlbums = true;
    console.log('🎵 System Unlocked: Physical Albums!');
    toastStore.unlock('Physical Albums Unlocked!', ...);
}

// unlocks.ts line 45-53
if (hasUpgrade) {
    state.unlockedSystems.physicalAlbums = true;
    console.log('🎵 System Unlocked: Physical Albums!');
    toastStore.unlock('Physical Albums Unlocked!', ...);
    return true;
}
```

### Impact
- User buys API access upgrade → Physical albums unlock immediately with toast
- Next game tick (100ms later) → `checkPhysicalAlbumUnlock()` runs but sees it's already unlocked
- However, this creates confusion and was the source of the reported issue

### Root Cause
The system has both immediate unlocking (in tech.ts) and validation unlocking (in unlocks.ts). The unlocks.ts check is redundant for systems that only require an upgrade.

---

## Bug #2: Incomplete Implementation of Upgrade Income Multiplier ⚠️ CRITICAL

### Description
The `calculateUpgradeMultiplier()` function in `income.ts` is a stub that always returns 1.0, but the same calculation exists properly in `songs.ts`.

### Location
**`src/lib/systems/income.ts:152-160`**

### Code Evidence
```typescript
function calculateUpgradeMultiplier(state: GameState): number {
	let multiplier = 1.0;
	
	// Note: In a full implementation, we would look up upgrade definitions
	// and sum their incomeMultiplier effects. For now, we return base multiplier.
	// This will be implemented when the upgrade system is added.
	
	return multiplier;
}
```

Meanwhile in `songs.ts:124-136`:
```typescript
function getIncomeMultiplier(state: GameState): number {
	let multiplier = 1.0;
	
	// Find the highest income multiplier among all upgrades (they replace, not multiply)
	for (const upgradeId in state.upgrades) {
		const upgrade = UPGRADE_MAP.get(upgradeId);
		if (upgrade?.effects.incomeMultiplier) {
			multiplier = Math.max(multiplier, upgrade.effects.incomeMultiplier);
		}
	}
	
	return multiplier;
}
```

### Impact
- Currently benign because income multipliers are baked into songs at creation time
- If `calculateUpgradeMultiplier()` were implemented, it would cause DOUBLE application
- Creates confusion and inconsistency in codebase

---

## Bug #3: Double Application of Prestige & Upgrade Multipliers ⚠️ CRITICAL - GAME BREAKING

### Description
Prestige multiplier and upgrade multipliers are applied TWICE to song income:
1. When songs are created (baked into `song.incomePerSecond`)
2. When total income is calculated

### Locations
- **Song creation**: `src/lib/systems/songs.ts:204`
- **Income calculation**: `src/lib/systems/income.ts:71-75`

### Code Evidence
```typescript
// songs.ts - When creating a song
const upgradeMultiplier = getIncomeMultiplier(state);
let incomePerSecond = BASE_INCOME_PER_SONG * upgradeMultiplier * state.experienceMultiplier;
// This value is stored in song.incomePerSecond

// income.ts - When calculating total income
income *= upgradeMultiplier;  // Applied again (currently 1.0, but would be bug if implemented)
income *= state.experienceMultiplier;  // Applied again!
```

### Impact
**SEVERE GAME BALANCE ISSUE**:
- With prestige multiplier of 1.5 (after 1 prestige), songs earn **2.25x** instead of 1.5x (1.5 * 1.5 = 2.25)
- With upgrade multiplier of 50x (tier 7), songs would earn **2500x** instead of 50x (50 * 50 = 2500)
- Game becomes exponentially easier with each prestige
- Balance is completely broken

### Calculation Flow
1. Song created: `$2 * 1.5 (prestige) = $3/sec` → stored in song
2. Income calculated: `$3 * 1.5 (prestige) = $4.5/sec` → actual income

**This is a 50% bonus income bug!**

---

## Bug #4: Double Application of Trending Multiplier ⚠️ CRITICAL - GAME BREAKING

### Description
Trending multiplier is applied TWICE to song income and fan generation:
1. When songs are created (baked into values)
2. When income/fans are calculated

### Locations
- **Song creation**: `src/lib/systems/songs.ts:207-219`
- **Income calculation**: `src/lib/systems/income.ts:92-97`
- **Fan calculation**: `src/lib/systems/fans.ts:78-84`

### Code Evidence
```typescript
// songs.ts - When creating a trending song
if (isTrending) {
    const trendingMultiplier = getTrendingMultiplier(state);
    incomePerSecond *= trendingMultiplier;  // Applied at creation
}
// Stored in song.incomePerSecond

// income.ts - When calculating income
if (state.currentTrendingGenre === song.genre && song.isTrending) {
    songIncome *= TRENDING_MULTIPLIER;  // Applied AGAIN!
}

// fans.ts - Same issue
if (state.currentTrendingGenre === song.genre && song.isTrending) {
    songFanGen *= TRENDING_MULTIPLIER;  // Applied AGAIN!
}
```

### Impact
**SEVERE GAME BALANCE ISSUE**:
- Trending songs should earn 2x income/fans
- Instead they earn **4x** (2.0 * 2.0 = 4.0) at the start of trend
- With fade mechanics, it gets even more complex
- Trending research becomes massively overpowered
- Progression is far too fast

---

## Bug #5: Multiple Duplicate Unlock Triggers ⚠️ HIGH

### Description
Several unlocks have duplicate or triplicate triggers across `tech.ts` and `unlocks.ts`.

### Summary Table
| System | tech.ts | unlocks.ts | Total Triggers | Status |
|--------|---------|-----------|----------------|---------|
| GPU | Line 117 | Line 187 | **2** | Duplicate |
| Prestige | Lines 127, 171 | Line 116 | **3** | Triplicate! |
| Physical Albums | Line 137 | Line 46 | **2** | Duplicate |
| Trend Research | Line 154 | Line 219 | **2** | Duplicate |
| Tours | - | Line 84 | 1 | ✅ Correct |
| Platform Ownership | - | Line 155 | 1 | ✅ Correct |

### Impact
- Duplicate console logs
- Duplicate toast notifications
- Confusing user experience (reported issue!)
- Code duplication and maintenance burden
- Potential race conditions

### Why Tours & Platform Ownership Are Correct
These two systems have **additional requirements** beyond just purchasing an upgrade:
- **Tours**: Requires upgrade + 10 albums + 100K fans
- **Platform Ownership**: Requires upgrade + 50 tours + 1M fans

So they correctly ONLY unlock in `unlocks.ts` where the additional checks happen.

---

## Architecture Issues

### Current Flow (Problematic)
1. Player purchases upgrade
2. `tech.ts::applyTechEffects()` → Unlocks systems immediately, shows toast
3. Game tick runs
4. `unlocks.ts::checkPhaseUnlocks()` → Checks same conditions, tries to unlock again

### Recommended Fix
**Option A: Remove unlocks from tech.ts (Cleanest)**
- Only unlock in `unlocks.ts` where all checks are centralized
- Add the upgrade check to unlocks.ts for tours/platforms
- Single source of truth

**Option B: Remove unlocks from unlocks.ts**
- Only unlock in `tech.ts` when upgrade is purchased
- Add additional requirement checks to `applyTechEffects()`
- Less clean but keeps unlock logic with purchase logic

**Recommendation: Option A** - Centralize all unlock logic in unlocks.ts

---

## Summary of Critical Issues

### Income/Fan Generation Problems
1. ❌ Prestige multiplier applied twice (1.5x becomes 2.25x)
2. ❌ Upgrade multiplier would be applied twice if implemented
3. ❌ Trending multiplier applied twice (2x becomes 4x)
4. ❌ Trending uses two different multiplier values (fade vs constant)

### Unlock Problems
5. ❌ 4 systems have duplicate unlock triggers
6. ❌ Prestige has TRIPLE unlock triggers
7. ❌ Duplicate toast notifications confuse players

### Code Quality Issues
8. ⚠️ Incomplete stub function in production code
9. ⚠️ Same calculation implemented in two different places
10. ⚠️ No centralized multiplier application strategy

---

## Recommended Fix Priority

### P0 - CRITICAL (Game Breaking)
1. **Fix double trending multiplier** - Completely breaks balance
2. **Fix double prestige multiplier** - Makes progression exponential

### P1 - HIGH (User Reported)
3. **Fix duplicate unlock triggers** - User confusion and poor UX
4. **Consolidate unlock logic** - Single source of truth

### P2 - MEDIUM (Technical Debt)
5. **Implement or remove calculateUpgradeMultiplier stub**
6. **Consolidate multiplier calculation logic**
7. **Add tests for multiplier stacking**

---

## Testing Recommendations

After fixes, verify:
- [ ] Prestige multiplier applied exactly once
- [ ] Upgrade multiplier applied exactly once
- [ ] Trending multiplier applied exactly once
- [ ] Each unlock shows toast exactly once
- [ ] No console.log duplicates for unlocks
- [ ] Income calculation matches expected values
- [ ] Fan generation matches expected values

---

## Notes

The core issue is **architectural**:
- Multipliers are being baked into songs at creation time
- Then applied again when calculating totals
- This creates compounding effects

**Proper Architecture:**
- Songs should store BASE values only
- All multipliers applied at calculation time
- Single point of multiplication

OR

- Songs store FINAL values
- No multipliers applied at calculation time
- All bonuses baked in at creation

Current code tries to do BOTH, causing double application.
