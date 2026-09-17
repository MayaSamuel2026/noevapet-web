# NoevaPet Pre-Deployment Gate

## Design
- [x] Approved NoevaPet logo direction applied
- [x] Soft CI palette applied
- [x] No pet-shop storefront layout
- [x] EN/DE parity
- [x] Human copy; no technical headline language
- [x] Realistic AI editorial imagery
- [x] Sketch / symbol language
- [x] Distinct Smart Cart / Pet Plan Board
- [x] Mobile responsive rules

## Customer journey
- [x] Pet -> Need -> basket-ready recommendation -> optional Result/Compare -> Smart Cart -> retailer route
- [x] First-time buying process explained
- [x] No claim of NoevaPet delivery tracking
- [x] No retailer-password collection
- [x] Retailer remains payment / delivery / returns authority
- [x] Affiliate disclosure surfaced

## Product / account
- [x] Add pets
- [x] Remove pets
- [x] Upload pet photo
- [x] Add/remove/move Smart Cart products
- [ ] Production account/authentication decision
- [ ] Production persistence backend
- [ ] Live recommendation runtime
- [ ] Live catalogue / retailer data

## Legal / production
- [x] Privacy page shell
- [x] Imprint page shell
- [x] Terms page shell
- [x] Cookies page shell
- [x] noindex / robots deployment lock
- [ ] Register court
- [ ] Registration number
- [ ] VAT ID
- [ ] Final legal review
- [ ] Production contact endpoint
- [ ] Production consent tooling
- [ ] Analytics / affiliate configuration
- [ ] Final live qualification

## V2 signature refinement
- [x] Warmer visual layer applied site-wide
- [x] NoevaPet Orbit replaces the off-the-shelf category-card tool
- [x] Drag/tap routine products into the pet orbit
- [x] Live intelligence reaction ribbon
- [x] Lowest total / Best balance / Simplest purchase preference modes
- [x] Smart Cart supports real drag-and-drop between zones
- [x] Simplified 5-step first-time “How it works” page implemented
- [x] Good-to-know first-purchase FAQs implemented
- [x] Trust strip and retailer-handoff explanation implemented
- [x] Production binding contracts scaffolded

## V3 compact tool + current routine
- [x] Desktop Orbit scaled down so the following section begins near the first viewport
- [x] Current food / supplement / care items can be added by the user
- [x] Each current item can be marked “Keep” / “Behalten”
- [x] Locked current items appear in the Orbit with a lock badge
- [x] Locked items are explicitly not replaced by recommendations
- [x] Exact usual products may still be optimised by retailer / pack / total cost
- [x] “Keep usuals” added as a global preference mode
- [x] Result page surfaces locked products before new recommendations
- [x] Recommendation binding contract includes locked-current-routine semantics

## V4 purchasing interface + navigation
- [x] Tool is a first-class main-navigation item
- [x] Cart is visible in the main navigation with a live item count
- [x] No duplicate "Try the tool" CTA required to find the tool
- [x] User can type the exact current product name / brand
- [x] Exact current products can be locked: do not replace
- [x] Pet-day interface redesigned around the approved warmer Orbit concept
- [x] My Pets + Add Pet brought into one compact first-viewport workspace
- [x] Canonical purchasing flow implemented: Basket -> Best way to buy -> Review -> Retailer handoff
- [x] User can choose Save more / Best balance / Simplify
- [x] Usual products stay visible in the purchase logic
- [x] No V1 claim of NoevaPet delivery tracking

## V5 contrast / Pet Match modal / visual why
- [x] "Tool" renamed to "Pet Match" in main navigation
- [x] Header brand presence increased (larger brand word + tagline)
- [x] Homepage hero rebuilt with stronger NoevaPet branding and basket-builder preview
- [x] Pet Match no longer wastes vertical height on a permanent exact-product block
- [x] Clicking a need opens a small modal to either type the exact current product or ask for suggestions
- [x] Exact current product may still be locked: do not replace
- [x] Pet Match vertical height reduced on desktop
- [x] Best-way-to-buy options now update a visual "why this choice" explanation
- [x] Contrast and colour strength increased site-wide

## V6 integrated UX polish
- [x] Header logo no longer relies on the wide cropped logo asset; icon + text wordmark used instead
- [x] Duplicate logo removed from homepage hero
- [x] Homepage hero simplified and given stronger contrast / NoevaPet identity
- [x] Active pet selection persists and flows into header, homepage, Pet Match, results, compare and cart
- [x] Pet-specific routines and cart state
- [x] Pet Match category click opens a compact modal: exact current product OR suggestions
- [x] Permanent exact-product form removed from Pet Match
- [x] Cart items can be dragged to a remove area without deleting the pet profile
- [x] Save more / Best balance / Simplify visibly changes the reason, route, retailer count and deliveries
- [x] Retailer checkout hub keeps NoevaPet open; retailers open in separate tabs
- [x] Retailer-open progress remains on the NoevaPet page until all required retailers are opened
- [x] V1 still makes no claim to know whether retailer payment or delivery completed
- [x] Higher-contrast warm NoevaPet visual layer

## V7 checkout closure + interaction fixes
- [x] Footer now includes the NoevaPet icon + wordmark lockup
- [x] “How we make money” removed as a main footer navigation item
- [x] Commission/transparency disclosure remains visible and links to the detailed page
- [x] Saved pet cards are clickable and open an editable pet-profile modal
- [x] Dragging a Pet Match need into the orbit opens the same exact-product / suggestion dialog as clicking
- [x] Existing Pet Match items can be dragged out into a remove target
- [x] Cart remove drop target is always discoverable during shopping
- [x] Cart also has an inline remove fallback
- [x] Retailer handoff explicitly supports prepared-cart or exact-product modes
- [x] Retailer carts open in separate tabs while NoevaPet stays open
- [x] After all required retailer tabs are opened, the user receives an explicit “I completed the retailer checkouts” closure action
- [x] Closure screen confirms the shopping session is done for today
- [x] Closing the shopping session clears the current cart while preserving the pet’s saved routine

## V8 dynamic hero + sequential retailer handoff
- [x] Homepage basket preview now reflects the actual active pet and active shopping cart
- [x] Empty-cart state is shown instead of fictional generic items
- [x] Active-pet age/type metadata is normalized for EN/DE
- [x] Pet Match uses the full desktop width more efficiently
- [x] Milo Match panel receives a stronger visual container
- [x] Stage 4 collapses the large cart intro to focus on retailer handoff
- [x] User is told exactly what will happen before any retailer tab opens
- [x] Retailer carts open one at a time, only after an explicit user click
- [x] No simultaneous auto-opening of multiple retailer tabs
- [x] Next retailer is surfaced automatically after the prior retailer has been opened
- [x] NoevaPet stays open as the hub throughout retailer checkout
- [x] Final user-confirmed closure remains after all retailer carts have been opened

## V9 comparison continuity + contrast
- [x] Clicking any comparison product now writes the selected alternative into the active pet's shopping plan
- [x] Choosing another comparison product replaces the previous comparison choice instead of duplicating it
- [x] Recommendation choices persist into the cart
- [x] Recommendation choices also appear in Pet Match under “Selected for this shopping trip”
- [x] Selected recommendations also appear in the Pet Match orbit
- [x] Recommendation removals stay synchronized across Pet Match and cart
- [x] Results-page add button carries product type / price into the active pet cart
- [x] Oversized “One profile, everywhere” section reduced to a compact reassurance strip
- [x] Site-wide contrast increased with richer teal, coral, sage and warm-sand surfaces
- [x] Page hero areas receive stronger background separation


## V18 final journey gate
- [x] No-pet state is a real onboarding state; no fake match score
- [x] Primary start CTA resolves to My Pets or Pet Match from saved state
- [x] Homepage / Explore context survives first-profile creation
- [x] Photo preview compact, round-framed and storage-safe
- [x] Active pet details propagate consistently across customer journey
- [x] Pet Match product visuals are clearly differentiated
- [x] Sleep + Travel entry routes have matching Pet Match needs
- [x] Recommendation add action exposes a clear next step
- [x] Checkout helper copy has adequate separation from confirmation action
- [x] Confirmed checkout creates printable summary
- [x] Confirmed shopping sessions persist under My Pets purchase history
- [x] Runtime configuration and binding contracts unchanged from V17

## V19 cart / retailer-route congruency
- [x] Suggestion needs become concrete basket recommendations without requiring a results-page detour
- [x] One-product basket cannot create a fake two-retailer split
- [x] Exact products remain visible in best-buy route and retailer checkout
- [x] Removing an auto-suggested need also removes its linked recommendation
- [x] Empty basket cannot advance into purchase optimization
- [x] V19 DE/EN modified-page parity checked
- [x] Runtime configuration / binding contracts unchanged from V18

## V20 logic / congruency gate
- [x] No-pet state cannot expose orphan pet/cart state
- [x] One selected need maps to one concrete recommendation in the basket
- [x] Removing a recommendation also removes its linked need
- [x] Removed recommendations do not return after reload
- [x] Pet Match orbit suppresses duplicate need + recommendation nodes
- [x] Saved current products can be re-added to a new shopping trip without re-entry
- [x] Result rationale follows the actual need category
- [x] Comparison options follow the actual need category
- [x] Comparison choice replaces the prior recommendation for the same need
- [x] Checkout opened-state is invalidated when basket or purchase mode changes
- [x] Review stage lists the actual products
- [x] Completion record stores retailer assignment per product
- [x] Completed needs are cleared and do not re-populate the next cart
- [x] Saved routine survives checkout with buy-now state reset
- [x] Pet deletion cleans pet-specific journey/history state
- [x] Deprecated purchase route redirects to canonical basket flow
