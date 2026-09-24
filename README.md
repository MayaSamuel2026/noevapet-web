# NoevaPet Web

Customer-facing NoevaPet website for Germany.

## Current release authority

The qualified release authority is the `production` branch. The Hostinger German deployment integration follows `production-de`, which must mirror the qualified `production` release before live acceptance.

- Website: **NoevaPet V27 / V26 UX + REAL CORE v1.0 + Revenue Loop**
- Runtime: static hosting
- CORE binding: native NoevaPet REAL CORE v1
- Public indexing: enabled
- Website Gate: **PASS**
- Revenue Loop: active CORE event attribution; Search Console measurement pending credentials
- Sitemap: `https://noevapet.de/sitemap.xml`
- Launch receipt: `P1_LAUNCH_RECEIPT.json`
- WordPress dependency: none
- WPVibe dependency: none

The previous automatic `main -> production` publisher is retired because it
rebuilt the old pre-launch `noindex,nofollow` shell and could overwrite the
public acquisition surface.

## Release rule

Future releases must preserve the current production authority and use:

`qualified candidate -> explicit production promotion -> production-de deployment mirror -> live Website Gate acceptance -> freeze / rollback on failure`

Do not restore the legacy pre-launch publisher or re-close indexing as part of
routine development. A release is not live merely because `production` advanced;
`production-de` and the live `release.json` marker must match before the Website
Gate can pass.

## Operator

NoevaPet is currently operated by Frederick Samuel under the business
designation NOEVA Systems, Marienburger Straße 16, 56112 Lahnstein, Germany.

Current contact: `info@noevasystems.com`.

The public legal pages reflect the present sole-trader status. Registered
company details should only be added after the corresponding register facts
exist and have been verified.
