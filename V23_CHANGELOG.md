# NoevaPet Pre-Deployment V23

## Exact product repurchase

- Reworked **We already use something / Wir nutzen schon etwas** into three explicit intents:
  - Buy again today / Heute nachkaufen
  - Remember only / Nur merken
  - Find an alternative / Alternative suchen
- Added pack-size / variant capture so retailer comparison is like-for-like.
- Exact repurchases are fixed products: retailer route can change, product identity cannot.
- Exact repurchase state is visible in Pet Match, cart, buying route, checkout and history.
- Exact product search request maps to the existing catalogue/offer contract using exact match and `lowest_total_route`.
- After checkout, the product stays in the pet routine but is reset to remember-only for the next shopping trip.
- Added V23 exact-product qualification suite and DE/EN browser journey harness.

## Important production boundary

The pre-deployment build now carries the correct exact-product retailer-search intent and payload. Real cheapest/current retailer offers require the production catalogue and retailer-offer bindings to be connected; demo prices in the static build are not represented as live market prices.
