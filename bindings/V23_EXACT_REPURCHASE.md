# V23 exact-product repurchase binding

When a user chooses **Buy again today / Heute nachkaufen**, the product is treated as fixed. NoevaPet may optimise the retailer and total route, but it must not substitute the product.

The browser state carries:
- `exactProduct: true`
- `packSize`
- `purchaseIntent: "buy"`
- `offerSearch: true`

The generated search request is compatible with the existing catalogue/offer contract and uses:
- market: DE
- currency: EUR
- exact product name
- exact pack size / variant
- exact-match constraint
- strategy: `lowest_total_route`

Production implementation must resolve the product to a canonical catalogue product/GTIN where possible, retrieve currently available retailer offers, add shipping costs, and optimise total basket cost while preserving the exact product identity.

`Remember only` does not trigger offer search. `Find an alternative` keeps the current product as pet context and routes the need to the recommendation engine instead.
