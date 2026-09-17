# NoevaPet Pre-Deployment V18

## Purpose
Final UX / customer-journey congruency pass before production binding. V18 focuses on state continuity, first-time-user logic, visual legibility and a complete end-to-end purchase closure rather than adding new commercial scope.

## Journey corrections
- Fresh visitor state no longer seeds demo pets.
- **Start with my pet / Mit meinem Tier starten** is state-aware:
  - no saved pet → My Pets / first-profile creation
  - saved active pet → Pet Match, with the pet name in the primary CTA
- The six Home and Explore entry cards remember the selected need. If a pet must first be created, the intent survives profile creation and is resumed in Pet Match.
- Food remains a grouped entry and highlights dry food, wet food and treats instead of forcing an arbitrary subcategory.
- Sleep and Travel are now first-class Pet Match needs so every public entry point has a matching destination.
- Direct access to Results / Compare / Basket / Purchase without a pet routes back to first-profile creation.

## Pet profile / photo
- Upload preview redesigned as a small round frame with the complete image visible.
- Uploaded photos are resized client-side to a maximum 720 px dimension and stored as compressed JPEG data for safer localStorage usage.
- Saving the first pet selects it and continues directly to Pet Match.
- Active pet name/photo/profile continue through header, My Pets, Pet Match, recommendation result and cart.

## Pet Match
- No-pet state is now a true onboarding state:
  - clickable Add pet card
  - clickable centre state
  - needs disabled until a pet exists
  - fake 84%/86% match score removed from the empty state
- Current flat icons replaced by a clearly differentiated brand-neutral packshot-style asset family.
- Existing saved V13/V17 image references are visually migrated at runtime without modifying the underlying user choices.

## Recommendation result
- Main recommendation product visual uses the V18 packshot language.
- Add action wording changed to a direct cart action.
- After adding, a clear continuation panel appears:
  - Continue to cart
  - Add another need
- The dark 1 + 2 result tile receives stronger readable contrast.

## Checkout / closure
- Confirmation helper copy receives more whitespace, separation and readable sizing.
- Decorative paw marks are intentionally more visible.
- Completing retailer checkouts now creates a purchase snapshot before the active basket is cleared.
- Completion screen now includes:
  - pet
  - date/time
  - confirmed plan total
  - selected products
  - retailer checkout list
  - explicit verification limitation
  - Print / Save as PDF action via the browser print dialog
  - link back to the pet's purchase history
- Purchase history is stored per pet in localStorage for the pre-deployment build and surfaced on My Pets.

## Visual refinement
- Six-entry cards reduced further in height and restructured into compact visual + copy rows.
- Entire entry card is the interaction target; redundant small Start chips are hidden.
- No site-wide gradients were added in V18.

## Production scope unchanged
- `assets/runtime-config.js` unchanged from V17.
- `/bindings/*` unchanged from V17.
- `noindex,nofollow` and robots lock remain in place.
- Retailer/catalogue/recommendation production bindings remain the next tranche.
