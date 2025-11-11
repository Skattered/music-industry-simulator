# Investigation Index - Music Industry Simulator

## Overview

This directory contains the complete investigation results for the codebase analysis requested to find conflicting systems, bugs, and double-stacking bonuses.

**Investigation Date:** 2025-11-11  
**Status:** ✅ COMPLETE  
**Bugs Found:** 5 (2 CRITICAL, 3 HIGH)

---

## Quick Start

### For Quick Reference
Start with **VISUAL_SUMMARY.md** for diagrams and quick overview.

### For Implementation
Read **FIX_STRATEGY.md** for exact code changes needed.

### For Complete Analysis
Read **INVESTIGATION_FINDINGS.md** for full technical details.

### For Quick Lookup
Use **BUG_SUMMARY.md** as a reference guide.

---

## Document Guide

### 📊 VISUAL_SUMMARY.md
**Best for:** Quick understanding of the issues  
**Contains:**
- ASCII diagrams showing bug flow
- Impact visualization tables
- Architecture comparison (broken vs fixed)
- Fix summary with line counts
- Verification commands

**Read this if:** You want to quickly understand what's broken and why.

---

### 🔧 FIX_STRATEGY.md
**Best for:** Implementing the fixes  
**Contains:**
- Exact line-by-line code changes
- Before/after code comparisons
- Test update requirements
- Risk assessment
- Migration notes
- Verification checklist

**Read this if:** You're ready to implement the fixes.

---

### 📋 INVESTIGATION_FINDINGS.md
**Best for:** Complete technical understanding  
**Contains:**
- Detailed analysis of each bug
- Code evidence with line numbers
- Root cause explanations
- Architecture discussion
- Impact calculations
- Recommended solutions

**Read this if:** You need complete technical details.

---

### 📖 BUG_SUMMARY.md
**Best for:** Quick reference while working  
**Contains:**
- Bug summary table
- Quick examples
- User impact analysis
- Testing recommendations
- Related files list
- Comments to add to code

**Read this if:** You need a quick lookup while fixing bugs.

---

## Bug Summary

### 🔴 CRITICAL (Game Breaking)

**Bug #3: Double Prestige Multiplier**
- Income multiplied by prestige TWICE
- 1.5x prestige → 2.25x actual (+50% error)
- Completely breaks game balance
- Files: `songs.ts:204`, `income.ts:75`

**Bug #4: Double Trending Multiplier**
- Trending bonus applied TWICE
- 2x trending → 4x actual (+100% error)
- Makes trending research overpowered
- Files: `songs.ts:207-219`, `income.ts:92-97`, `fans.ts:78-84`

### 🟡 HIGH (UX Issues)

**Bug #1: Duplicate Physical Albums Unlock**
- User reported issue!
- Shows unlock toast twice
- Files: `tech.ts:137`, `unlocks.ts:46`

**Bug #5: Multiple Duplicate Unlocks**
- 4 systems have duplicate unlock triggers
- Prestige has TRIPLE triggers!
- Poor user experience

**Bug #2: Stub Function in Production**
- Incomplete implementation
- Technical debt
- File: `income.ts:152-160`

---

## Implementation Phases

### Phase 1: Critical Fixes (Priority 0)
**Target:** Fix game-breaking multiplier bugs  
**Files:** `income.ts`, `fans.ts`  
**Changes:** Remove double application of multipliers  
**Impact:** Game balance restored  
**See:** FIX_STRATEGY.md sections "Bug #3 & #4"

### Phase 2: UX Fixes (Priority 1)
**Target:** Fix duplicate unlock toasts  
**Files:** `tech.ts`, tests  
**Changes:** Remove unlock code from tech.ts  
**Impact:** Better user experience  
**See:** FIX_STRATEGY.md section "Bug #1, #5"

### Phase 3: Cleanup (Priority 2)
**Target:** Remove stub function, add docs  
**Files:** `income.ts`, `songs.ts`, various tests  
**Changes:** Code quality improvements  
**Impact:** Maintainability  
**See:** FIX_STRATEGY.md section "Bug #2"

---

## Key Findings

### Root Cause: Architectural Issue

Current system applies multipliers at TWO points:
1. ✅ Song creation (baked into values)
2. ❌ Income/fan calculation (applied again)

This causes all multipliers to be applied TWICE!

### Solution

Remove multipliers from income/fan calculations.  
Songs already have correct values baked in.

### Impact

**Current (Buggy):**
- Prestige grows exponentially instead of linearly
- Trending gives 4x instead of 2x
- Game too easy, completes in ~3 hours instead of 8-12

**After Fix:**
- Prestige grows linearly as intended
- Trending gives 2x as designed
- Game balance restored

---

## Testing Strategy

### Before Implementing Fixes
1. Create new game
2. Generate 1 song → note income
3. Prestige with 1.5x
4. Generate 1 song → should be 2.25x income (bug!)

### After Implementing Fixes
1. Create new game
2. Generate 1 song → $2/sec
3. Prestige with 1.15x
4. Generate 1 song → $2.30/sec (exactly 1.15x)
5. Research trend
6. Generate trending song → $4.60/sec (exactly 2x)
7. Purchase API Access → ONE toast only

---

## File Locations

### Source Files to Modify
```
src/lib/systems/income.ts    - Remove prestige, trending, stub
src/lib/systems/fans.ts       - Remove prestige, trending
src/lib/systems/tech.ts       - Remove all unlock code
src/lib/systems/songs.ts      - Add documentation
```

### Test Files to Update
```
src/lib/systems/income.test.ts
src/lib/systems/fans.test.ts
src/lib/systems/tech.test.ts
src/lib/integration/game-loop.test.ts
```

### Documentation Files
```
INVESTIGATION_FINDINGS.md     - Complete technical analysis
BUG_SUMMARY.md               - Quick reference guide
FIX_STRATEGY.md              - Implementation guide
VISUAL_SUMMARY.md            - Visual overview
README.md                    - This file
```

---

## Statistics

**Investigation Metrics:**
- Files analyzed: 20+
- Bugs found: 5
- Critical bugs: 2
- High priority bugs: 3
- Lines to modify: ~115
- Documentation created: 4 files (39 KB)

**Bug Impact:**
- Income error: 50-200% too high
- Trending error: 100% too high
- Duplicate toasts: 4 systems affected
- User reports: 1 (physical albums unlock)

---

## Next Steps

1. ✅ Investigation complete
2. ✅ Documentation created
3. ✅ Fix strategy defined
4. ⏳ Implement critical fixes (Phase 1)
5. ⏳ Implement UX fixes (Phase 2)
6. ⏳ Code cleanup (Phase 3)
7. ⏳ Update balance documentation
8. ⏳ Full playthrough testing

---

## Questions & Support

If you need clarification on any bug or fix:

1. Check **VISUAL_SUMMARY.md** for quick diagrams
2. Check **BUG_SUMMARY.md** for examples
3. Check **FIX_STRATEGY.md** for exact changes
4. Check **INVESTIGATION_FINDINGS.md** for deep analysis

All documentation includes:
- File locations with line numbers
- Code evidence (before/after)
- Impact analysis
- Clear explanations

---

## Acknowledgments

**User Report:**
> "buying api access unlocks physical albums, but then I get a toast later that it's available, I think based on fans, that's when it's supposed to appear"

This report led to discovery of ALL 5 bugs through comprehensive codebase investigation.

**Investigation Method:**
- Traced physical albums unlock through both code paths
- Discovered duplicate unlock pattern
- Examined multiplier application in income calculation
- Found double application of prestige & trending
- Traced all income/fan calculation paths
- Identified architectural root cause

---

**Investigation Complete ✅**

All bugs documented, analyzed, and ready to fix!
