# NoevaPet V19

## UX / visual corrections
- Added the active pet portrait as a circular medallion in the homepage basket preview when the composition has one product.
- Restored the lower Pet Match orbit position and separated the insight / handwritten line vertically.
- Removed the non-functional morning/day/evening/night legend.
- Fixed the overlapping `1 + 2` results metric.
- Shortened the result pet ribbon by removing the anonymous-cart wording.

## Process congruency
- Choosing “Please suggest” now creates a concrete default recommendation in the active pet basket immediately; viewing recommendations is optional, not required to make the cart work.
- V18 saved suggestion-needs are migrated into basket-ready recommendations.
- Purchase optimization now derives retailer count from the actual basket (one item never creates an artificial two-retailer split).
- Stage 2 shows the exact products assigned to each retailer, with product image and optimized line price.
- Retailer checkout cards keep the exact product list visible through the handoff.
- Results hydrate to the most recently requested need and show when that recommendation is already in the basket.
- Removing an auto-recommended need also removes its linked basket recommendation.

## Scope
- Runtime configuration and production binding contracts remain unchanged.
