# NoevaPet V20

## Logic and journey congruency
- Hardened the true no-pet state so old orphan cart/routine records cannot appear without an active pet.
- Linked recommendation + need state is now removed as one unit. A user removal remains removed after reload.
- Pet Match orbit renders one semantic item per choice instead of duplicating a selected need and its concrete recommendation.
- Saved current products now expose an explicit repeat-purchase control: **Add for today / In this cart**.
- Exact products entered from Pet Match retain their originating need key for later journey consistency.
- Result-page rationale is contextual to the actual requested area.
- Compare-page products, labels and pricing alternatives are contextual to the actual requested area.
- Selecting a comparison alternative replaces the prior recommendation for that need instead of adding a duplicate.

## Purchase-flow integrity
- Retailer checkout progress is signed to the exact pet + cart + purchase mode. Any route change resets stale opened-retailer state.
- Chosen purchase mode survives page/cart refreshes.
- Review stage 3 now shows the actual basket products and the actual retailer/delivery route.
- Purchase completion records the retailer assignment and optimized line price for each product.
- Final receipt is grouped by retailer.
- Completed open needs are cleared together with the shopping plan, preventing fulfilled recommendations from reappearing on the next visit.
- Saved routine products remain in the pet profile but reset to “not buying today” after completion.
- Pet deletion cleans pet-specific routine, need, plan, checkout-session and purchase-history storage.
- Legacy `purchase.html` is now a zero-click redirect to the canonical basket flow.

## Copy / consistency
- Removed remaining prototype-style “Example result” language.
- Stage-2 reassurance now refers to products in the cart, not only “usual products.”
- Purchase-history heading now correctly describes a multi-pet history list.
- “How it works” now separates product recommendation from purchase-route optimization, matching the real journey: profile → need → recommendation → purchase route → retailer checkout.

## Scope protection
- `assets/runtime-config.js` unchanged.
- Production binding contracts unchanged.
