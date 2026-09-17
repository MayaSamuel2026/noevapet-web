# NoevaPet Pre-Deployment V24

## Exact repurchase action + Pet Match / basket congruency

This pass fixes the defect where **Heute nachkaufen / Buy again today** appeared actionable but did nothing when an existing routine product did not yet have a pack size / exact variant.

### Root cause
V23 correctly required an exact pack size before starting retailer comparison, but the routine-card action only attempted to show a toast. The Pet Match page did not contain the toast host used by the basket page, so the action appeared dead.

### V24 behavior
- Clicking **Heute nachkaufen** on a saved product with missing variant now opens the exact-product editor, prefilled with the existing product.
- The user confirms pack size / variant and the same routine item is updated; it is not duplicated.
- The exact product then becomes `buyNow=true`, `exactProduct=true`, `offerSearch=true` and appears in the canonical basket immediately.
- If the routine item is explicitly tied to the same need as an existing recommendation, the exact repurchase supersedes that recommendation so the basket does not contain two products solving the same need.
- If the historical item has no known originating need, NoevaPet does not guess and remove an unrelated recommendation; it becomes an additional basket line instead.
- **Im Warenkorb ✓ · heute entfernen** returns the item to routine-only state while preserving the pet profile.
- Pet Match orbit, Pet Match purchase summary, navigation basket count, homepage basket and basket page all consume the same canonical cart state.
- A toast host is now created on Pet Match so interaction feedback is visible there as well.

### Qualification
- V22 state/congruency suite: 25/25 PASS
- V23 exact-product suite: 14/14 PASS
- V24 repurchase/congruency suite: 10/10 PASS
- V24 structural checks: 13/13 PASS
- `assets/app.js` syntax: PASS

Browser automation was attempted, but this execution environment blocks local/file navigation in Chromium (`ERR_BLOCKED_BY_ADMINISTRATOR`). Therefore V24 does not claim a browser-E2E PASS from this workspace.
