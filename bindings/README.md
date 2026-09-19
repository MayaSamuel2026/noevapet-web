# NoevaPet production binding layer

The V2 front end is prepared for production services without changing the public UX.

Prepared contracts:
- catalogue + retailer offers
- recommendation runtime
- retailer handoff (`prefilled_cart` or exact-product deep link)
- contact endpoint
- pet-profile persistence/auth
- affiliate attribution
- consent/analytics configuration

`assets/runtime-config.js` remains in `predeployment` mode and contains no credentials.

## External facts / live systems still required before GO_LIVE
- confirmed register court
- commercial registration number
- VAT ID
- final legal sign-off
- production endpoint URLs / secrets
- confirmed retailer partners and affiliate identifiers
- authentication/persistence provider decision if persistent accounts are in V1
- final analytics and consent provider configuration
