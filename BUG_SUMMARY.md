# Bug Summary - Music Industry Simulator

## Investigation Date: 2025-11-11

## Quick Reference

| Bug # | Severity | Description | Files Affected | User Impact |
|-------|----------|-------------|----------------|-------------|
| 1 | 🟡 High | Duplicate Physical Albums unlock | tech.ts, unlocks.ts | Duplicate toasts (reported) |
| 2 | 🟡 High | Stub function in production | income.ts | Technical debt |
| 3 | 🔴 CRITICAL | Double prestige multiplier | songs.ts, income.ts | 50-200% bonus income |
| 4 | 🔴 CRITICAL | Double trending multiplier | songs.ts, income.ts, fans.ts | 100% bonus income/fans |
| 5 | 🟡 High | Multiple duplicate unlocks | tech.ts, unlocks.ts | Poor UX |

---

## Bug #1: Duplicate Physical Albums Unlock

### User Report
> "buying api access unlocks physical albums, but then I get a toast later that it's available, I think based on fans, that's when it's supposed to appear"

### Root Cause
Two unlock triggers:
- Immediate unlock in `tech.ts` when purchasing upgrade
- Validation check in `unlocks.ts` every game tick

### Files
- `src/lib/systems/tech.ts:137`
- `src/lib/systems/unlocks.ts:46`

### Fix
Remove unlock from `tech.ts` - only unlock in `unlocks.ts`

---

## Bug #2: Incomplete Implementation

### Issue
`calculateUpgradeMultiplier()` is a stub returning 1.0

### Location
`src/lib/systems/income.ts:152-160`

### Fix
Either:
- Remove the stub and never apply upgrade multiplier in income calc
- Implement properly and remove from song creation

---

## Bug #3: Double Prestige Multiplier 🚨

### The Problem
```
Song creation: $2 * 1.5 = $3/sec → Stored in song
Income calc:   $3 * 1.5 = $4.5/sec → Actual income

Expected: $3/sec
Actual:   $4.5/sec
Error:    +50% bonus
```

### Growth Over Time
| Prestige | Expected | Actual | Bonus |
|----------|----------|--------|-------|
| 1x | $2.00 | $2.00 | 0% |
| 1.5x | $3.00 | $4.50 | +50% |
| 2.0x | $4.00 | $8.00 | +100% |
| 3.0x | $6.00 | $18.00 | +200% |

### Files
- `src/lib/systems/songs.ts:204` (applies)
- `src/lib/systems/income.ts:75` (applies again)

### Fix
Remove prestige multiplier from EITHER:
- Song creation (store base values only)
- Income calculation (values already have multiplier)

**Recommended:** Remove from income calculation

---

## Bug #4: Double Trending Multiplier 🚨

### The Problem
```
Song creation: $2 * 2.0 (trending fade) = $4/sec → Stored in song
Income calc:   $4 * 2.0 (TRENDING_MULTIPLIER) = $8/sec → Actual income

Expected: $4/sec (2x bonus)
Actual:   $8/sec (4x bonus)
Error:    +100% bonus
```

### Even Worse
Song creation uses `getTrendingMultiplier()` with fade
Income calculation uses constant `TRENDING_MULTIPLIER = 2.0`

So it's not just double - it's using TWO DIFFERENT values!

### Files
- `src/lib/systems/songs.ts:207-209` (applies with fade)
- `src/lib/systems/income.ts:92-97` (applies constant)
- `src/lib/systems/fans.ts:78-84` (applies constant)

### Fix
Remove trending multiplier from income/fan calculations.
Songs already have it baked in.

---

## Bug #5: Multiple Duplicate Unlocks

### Summary
| System | Triggers | Locations |
|--------|----------|-----------|
| GPU | 2 | tech.ts:117, unlocks.ts:187 |
| Prestige | **3** | tech.ts:127, tech.ts:171, unlocks.ts:116 |
| Physical Albums | 2 | tech.ts:137, unlocks.ts:46 |
| Trend Research | 2 | tech.ts:154, unlocks.ts:219 |

### Why It Happens
Systems unlock in two places:
1. `applyTechEffects()` when upgrade purchased
2. `checkPhaseUnlocks()` on every game tick

### Fix
Centralize all unlocks in `unlocks.ts`
Remove unlock code from `tech.ts`

---

## Architectural Issues

### Current System
```
Multipliers applied at TWO points:
1. Song creation (baked into values)
2. Income calculation (applied to totals)

Result: DOUBLE APPLICATION
```

### Correct Architecture Option A
```
Song creation: Store BASE values only
Income calc: Apply ALL multipliers

Result: Single application
```

### Correct Architecture Option B
```
Song creation: Apply ALL multipliers (bake in)
Income calc: Use values as-is

Result: Single application
```

**Current code tries to do BOTH = BUG**

---

## Testing Evidence

From `income.test.ts`:
```typescript
it('should apply prestige experience multiplier', () => {
    const state = createTestState({
        experienceMultiplier: 1.5
    });
    expect(applyIncomeMultipliers(state, 100)).toBe(150);
});
```

This test EXPECTS prestige to be applied in income calculation.
But songs ALSO have it applied at creation.
**Therefore: Both are applied = double multiplication**

---

## Impact on Gameplay

### Without Bugs (Intended)
- 1st prestige: 15% income boost
- 2nd prestige: 30% income boost
- 3rd prestige: 45% income boost

### With Bugs (Current)
- 1st prestige: 32.25% income boost (1.15² = 1.3225)
- 2nd prestige: 69% income boost (1.30² = 1.69)
- 3rd prestige: 110% income boost (1.45² = 2.10)

**Game becomes exponentially easier!**

### Trending Research
- Intended: 2x income when trending
- Actual: 4x income when trending
- **Research is massively overpowered**

---

## Recommended Fix Order

### Phase 1 - Critical Fixes (Game Breaking)
1. ✅ **Remove prestige multiplier from income calculation**
   - Edit: `src/lib/systems/income.ts:75`
   - Remove: `income *= state.experienceMultiplier;`

2. ✅ **Remove trending multiplier from income/fan calculations**
   - Edit: `src/lib/systems/income.ts:92-97`
   - Edit: `src/lib/systems/fans.ts:78-84`
   - Remove trending multiplier application

### Phase 2 - UX Fixes (User Reported)
3. ✅ **Remove duplicate unlock triggers**
   - Edit: `src/lib/systems/tech.ts`
   - Remove unlock code for: GPU, Prestige, Physical Albums, Trend Research
   - Keep only in `unlocks.ts`

### Phase 3 - Code Quality
4. ✅ **Remove or implement upgrade multiplier stub**
   - Remove from `income.ts` (recommended)
   - Already properly handled in song creation

5. ✅ **Add comprehensive tests**
   - Test prestige multiplier applied exactly once
   - Test trending multiplier applied exactly once
   - Test upgrade multiplier applied exactly once
   - Test no duplicate unlocks

---

## Verification Steps

After fixes:
- [ ] Create new game
- [ ] Generate 1 song, note income
- [ ] Prestige, generate 1 song with same stats
- [ ] Verify income is exactly 1.15x higher (not 1.32x)
- [ ] Research trend, generate trending song
- [ ] Verify income is exactly 2x higher (not 4x)
- [ ] Purchase API access
- [ ] Verify physical albums unlock appears ONCE
- [ ] Check console for duplicate logs
- [ ] Verify each unlock shows toast exactly once

---

## Code Comments to Add

Add to `songs.ts`:
```typescript
// IMPORTANT: Songs store FINAL income values with ALL multipliers baked in
// Do NOT apply multipliers again in income calculation - they're already included!
```

Add to `income.ts`:
```typescript
// Songs already have all multipliers (prestige, upgrades, trending) baked in
// Only apply boost multipliers here (they're temporary and not baked into songs)
```

---

## Related Files

### Core Systems
- `src/lib/systems/songs.ts` - Song generation
- `src/lib/systems/income.ts` - Income calculation
- `src/lib/systems/fans.ts` - Fan generation
- `src/lib/systems/tech.ts` - Tech upgrades
- `src/lib/systems/unlocks.ts` - System unlocks

### Tests to Update
- `src/lib/systems/income.test.ts`
- `src/lib/systems/fans.test.ts`
- `src/lib/systems/songs.test.ts`
- `src/lib/integration/game-loop.test.ts`

### Configuration
- `src/lib/game/config.ts` - Constants
- `src/lib/game/types.ts` - Type definitions
