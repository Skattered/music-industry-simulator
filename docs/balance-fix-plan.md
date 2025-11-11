# Balance Fix Plan - Music Industry Simulator

## Problem Identified

Simulation shows game takes **77.6 hours** instead of target **10-12 hours**.

### Root Cause Analysis

1. **Tier 5-7 upgrade costs are WAY too high** relative to income at those stages
   - At tier 4 complete with 2 prestiges: ~$350K/sec income
   - Tier 5 basic costs $1.5M (4.3 seconds to afford - OK)
   - Tier 5 improved costs $4M (11.4 seconds - OK)
   - Tier 5 advanced costs $8M (22.8 seconds - OK)
   - BUT: The simulation took 30+ hours because income wasn't scaling properly!

2. **Income multipliers don't apply correctly during rebuild after prestige**
   - Songs store BASE income ($2/sec)
   - Multipliers applied at calculation time
   - After prestige, need to rebuild songs but upgrade multipliers take time to re-buy

3. **Tours provide massive income spike but come too late**
   - Tours generate $400K/sec at mid-game but unlock requirements still gated

## Solution Strategy

### Phase 1: Aggressive Cost Reduction for Tiers 5-7 (75-90% cuts)

Current tier 5-7 costs were INCREASED from balance doc recommendations. This was a mistake.
Need to cut them dramatically to match intended 10-12 hour timeline.

**Tier 5 Adjustments:**
- tier5_basic: $1.5M → **$200K** (-87%)
- tier5_improved: $4M → **$500K** (-87.5%)
- tier5_advanced: $8M → **$1M** (-87.5%)

Rationale: At tier 4 with prestige 2, income is ~$350K/sec. These upgrades should take:
- Basic: <1 second
- Improved: ~1.5 seconds  
- Advanced: ~3 seconds
Plus time to rebuild songs (~10 minutes)

**Tier 6 Adjustments:**
- tier6_basic: $15M → **$2M** (-87%)
- tier6_improved: $35M → **$5M** (-86%)
- tier6_advanced: $65M → **$10M** (-85%)

Rationale: After tier 5 with tours, income should be ~$1-2M/sec. These should take:
- Basic: ~1-2 seconds
- Improved: ~2.5 seconds
- Advanced: ~5 seconds

**Tier 7 Adjustments:**
- tier7_basic: $125M → **$20M** (-84%)
- tier7_improved: $300M → **$50M** (-83%)
- tier7_advanced: $550M → **$100M** (-82%)

Rationale: With platforms, income is ~$2-5M/sec. These should still feel expensive (final tier):
- Basic: ~4-10 seconds
- Improved: ~10-25 seconds
- Advanced: ~20-50 seconds

### Phase 2: Platform Cost Reductions (Additional 50% cut from current)

Current platform costs were already halved but still too high.

**Current → New:**
- Streaming: $5M → **$2M** (-60%)
- Ticketing: $12.5M → **$5M** (-60%)
- Venue: $25M → **$10M** (-60%)
- Billboard: $50M → **$20M** (-60%)
- Grammys: $125M → **$50M** (-60%)
- Training Data: $250M → **$100M** (-60%)

Total investment: $467.5M → **$187M** (-60%)

Rationale: With tier 6-7, income is $5-10M/sec. Platforms should be achievable within 2-5 seconds each for satisfying end-game purchases.

### Phase 3: Tour and Album Tweaks

**Tours:**
- Cost already good at $250K
- But income calculation might need boost for early tours
- Increase TOUR_FAN_MULTIPLIER: $0.02 → **$0.05** (+150%)

Rationale: Make tours more impactful when first unlocked.

**Albums:**
- Album system seems OK based on simulation
- No changes needed

### Phase 4: Early Game Minor Tweaks

Early game (0-2 hours) is actually well-balanced based on simulation.
Only small adjustment:

- Tier 4 costs already reduced, seem OK
- No major changes needed

## Expected Results

With these changes, progression timeline should be:

| Milestone | Current | Target | New Expected |
|-----------|---------|--------|--------------|
| Tier 1-2 Complete | 0.5h | 0.5h | 0.5h ✓ |
| Phase 2 Unlock | 0.6h | 1h | 1h ✓ |
| First Prestige | 1.1h | 2h | 2h ✓ |
| Phase 3 Unlock | 1.8h | 3h | 3h ✓ |
| Second Prestige | 2.7h | 4h | 4-5h ✓ |
| Tier 5 Complete | **33h** | 6h | **6-7h** ✓ |
| Phase 4 Unlock | **34h** | 6h | **7h** ✓ |
| Tier 6 Complete | **74h** | 8h | **8-9h** ✓ |
| Platform Purchases | **77h** | 10h | **10h** ✓ |
| Victory | **77.6h** | 10-12h | **10-11h** ✓ |

## Implementation

1. Edit `src/lib/game/config.ts`
2. Update ALL tier 5-7 upgrade costs (75-90% reductions)
3. Update ALL platform costs (60% reduction)
4. Increase TOUR_FAN_MULTIPLIER by 150%
5. Run simulation again to validate
6. Update tests as needed
7. Document changes

## Validation Criteria

- [ ] Full playthrough simulation completes in 10-12 hours
- [ ] No "dead zones" where progress stalls >30 minutes
- [ ] Income scaling feels smooth and exponential
- [ ] Each tier upgrade feels affordable when unlocked
- [ ] Platforms feel like satisfying late-game purchases
- [ ] 3-4 prestige cycles feel natural
