# NoevaPet — Pre-Deployment V20

This is the complete static pre-deployment website build.

## Public experience included
EN + DE versions of:
- Home
- How it works
- Explore
- Guided tool
- Recommendation result
- Product comparison
- Smart cart / pet-plan board
- Retailer purchase-route handoff
- My Pets with add/remove and photo upload
- About
- How we make money / independence explanation
- FAQ
- Contact
- Privacy
- Imprint
- Terms
- Cookies
- 404

## Functional demo behaviour
- Add/remove pet profiles
- Upload a pet photo (stored locally in the browser for demo purposes)
- Add products to the Smart Cart
- Move/remove products on the Pet Plan Board
- EN/DE page parity
- FAQ accordions
- Cookie-choice demo
- Contact-form confirmation demo



## V20 logic + congruency refinement
- No-pet state can no longer inherit orphan cart/routine data from earlier sessions.
- Removing a recommendation also removes its linked open need, so removed products cannot silently return after reload.
- Pet Match now renders one semantic orbit item per selected need instead of need + recommendation duplicates.
- Saved current products have a clear “Add for today” / “In this cart” control, making repeat purchases possible without re-entering the product.
- Recommendation Results and Compare now follow the actual requested category (dry, wet, dental, walk, sleep, travel, etc.) rather than falling back to food-specific copy.
- Choosing an alternative replaces the recommendation for that need instead of creating a duplicate basket line.
- Checkout progress is tied to an exact basket + purchase-mode signature; changing the basket or Save/Balance/Simple route invalidates stale “opened retailer” state.
- The review step shows the actual products and retailer/delivery route instead of non-functional placeholder rows.
- Final purchase summaries now retain retailer assignment per product.
- Completing a purchase clears fulfilled needs as well as the trip basket, preventing purchased recommendations from reappearing on the next visit.
- Current routine products remain saved after checkout but are reset to “not buying today,” ready for a future repeat purchase.
- Removing a pet cleans up its pet-specific basket, needs, routine, checkout session and purchase-history data.
- The legacy `purchase.html` route now redirects directly to the canonical basket flow, eliminating an unnecessary click.
- “How it works” has been aligned to the implemented journey: recommendation is the product-choice step; purchase-route optimization happens only after the basket exists.
- Runtime configuration and production binding contracts remain unchanged.

## V19 final cart / purchase congruency pass
- Pet Match suggestions now become basket-ready recommendations immediately; the recommendation detail page is optional rather than a required detour.
- The active pet portrait is restored as a circular visual in the homepage basket preview when space allows.
- Pet Match vertical rhythm is restored and the non-functional morning/day/evening/night legend is removed.
- The result summary `1 + 2` card no longer has overlapping typography.
- The result pet ribbon is shortened to a simple pet-specific confirmation.
- Purchase optimization derives retailer count from the actual basket: a one-product basket cannot create an artificial two-retailer route.
- Best-buy route and retailer checkout both show the exact products assigned to each retailer.
- V18 open suggestion-needs are migrated into concrete basket recommendations.
- Runtime configuration and production binding contracts remain unchanged.

## Pre-deployment protections
- Every page has `noindex,nofollow`
- robots.txt blocks all crawling
- Contact form does not transmit data
- Retailer buttons are non-live
- Legal pages are marked as pre-deployment drafts where production facts are still missing

## Must be completed before production GO_LIVE
1. Add confirmed register court / registration number / VAT ID / content-responsible person.
2. Legal review of Privacy, Imprint, Terms, Affiliate disclosures, and cookie consent.
3. Connect production contact endpoint.
4. Connect real authentication/profile backend if accounts are in V1 scope.
5. Connect real recommendation/catalogue runtime and retailer handoff/deep-cart logic.
6. Replace demo retailer names/prices/products with live data.
7. Connect analytics/affiliate tracking only through the final consent configuration.
8. Run responsive/browser/accessibility/performance qualification.
9. Remove noindex + change robots.txt only after legal/data/deployment gates PASS.

## Deployment model
Package is static and suitable for the NOEVA standard public-site pipeline once the above gates are cleared:
GitHub main -> GitHub Actions qualification -> production branch -> Hostinger Git auto-deploy -> live validation.

## V2 interaction refinement
- warmer cream / peach / sand / sage treatment while keeping NoevaPet teal
- Aqua-Compass-inspired NoevaPet Orbit as the signature tool
- drag/tap dry food, wet food, treats, supplements/oils, dental care and coat care into the pet orbit
- live match score, overlap insight and buying-preference switch
- real drag-and-drop on the Smart Cart / Pet Plan Board
- simplified 5-step How it works page for first-time users
- Good to know answers + trust strip
- production binding contracts under `/bindings/`

The build remains pre-deployment locked (`noindex,nofollow` + robots disallow).

## V6 customer journey
The selected pet is now persistent across the experience. Pet Match, recommendations and cart use the same active-pet context.

Pet Match:
1. tap/drag a need
2. choose exact current product or ask for suggestions
3. exact current products can be locked so they are not replaced

Cart:
1. Basket
2. Best way to buy
3. Review
4. Retailer checkout hub

Retailer handoff:
- NoevaPet remains open in its original tab.
- Each retailer is opened in a separate tab.
- The hub records which retailer buttons have been opened.
- In pre-deployment, absent retailer URLs are simulated; production URLs are injected through `assets/runtime-config.js`.
- NoevaPet V1 does not claim to know whether payment, delivery, returns or retailer support completed.

## V7 checkout closure
The retailer handoff now behaves as a persistent NoevaPet checkout hub:
- the NoevaPet page stays open;
- each retailer cart opens in a new tab;
- opened retailers are marked on the NoevaPet page;
- once all required retailer carts have been opened, the user can explicitly confirm that they completed the retailer checkouts;
- the confirmation closes the current shopping session, clears the active cart, and preserves the pet’s saved routine.

The detailed “How we make money” page is retained for transparency, but it is no longer a primary footer navigation item. The footer instead contains a short commission disclosure with a transparency link.

## V8 retailer handoff design
NoevaPet does **not** automatically open multiple retailer tabs on page arrival.

The customer first sees a short explanation:
1. the retailer cart will open in a new tab;
2. payment happens on the retailer site;
3. the original NoevaPet tab remains open.

The customer then clicks one primary button. NoevaPet opens Retailer A. When the customer returns, the same hub presents Retailer B as the next action. This avoids surprise tab spawning and browser popup-blocker problems while keeping the handoff extremely low-friction.

Production binding still decides whether each retailer handoff URL is a `prefilled_cart` or `product_deeplink`.

## V9 recommendation continuity
The comparison surface is now transactional rather than decorative. Selecting Product A/B/C updates the active pet's plan immediately. A later selection from the same comparison replaces the prior comparison choice. The chosen product is then visible in:
- the comparison feedback,
- Pet Match (“Selected for this shopping trip” + orbit),
- the homepage dynamic basket,
- the cart / purchase flow.

This fixes the previous state break where a compare choice visually changed but did not enter the shopping plan.


## V18 final UX / process-congruency pass
- New visitors now start with a real empty pet state rather than demo pets.
- Primary start CTAs route to **My Pets** when no pet exists and directly to **Pet Match** when an active pet is saved.
- Homepage / Explore entry intent is remembered across profile creation and carried into Pet Match.
- Pet Match has a clickable add-pet empty state and no longer displays a fictitious match score without a pet.
- Pet photo uploads are resized locally for safer local-storage use and shown in a compact round preview while preserving the complete image.
- Pet name/photo/profile propagate through header, My Pets, Pet Match, recommendations and cart via the canonical active-pet object.
- Need/category imagery uses a more differentiated brand-neutral product-packshot family; Sleep and Travel are first-class Pet Match needs.
- Recommendation results expose an explicit next step after an item is added: continue to cart or add another need.
- Checkout confirmation spacing / legibility was increased.
- Checkout completion now creates a printable / Save-as-PDF purchase summary and stores the confirmed session under **My Pets → Purchase history**.
- Purchase records state that retailer payment is user-confirmed and cannot be independently verified by NoevaPet.
- The pre-deployment `noindex` lock, runtime configuration and production-binding contracts remain unchanged.
