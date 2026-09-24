# NoevaPet Web

Customer-facing NoevaPet website for Germany.

## Current release authority

The live release authority is the `production` branch.

- Website: **NoevaPet V26 + REAL CORE v1.0**
- Runtime: static hosting
- CORE binding: native NoevaPet REAL CORE v1
- Public indexing: enabled
- Sitemap: `https://noevapet.de/sitemap.xml`
- Launch receipt: `P1_LAUNCH_RECEIPT.json`
- WordPress dependency: none
- WPVibe dependency: none

The previous automatic `main -> production` publisher is retired because it
rebuilt the old pre-launch `noindex,nofollow` shell and could overwrite the
public acquisition surface.

## Release rule

Future releases must preserve the current production authority and use:

`qualified candidate -> Website Gate -> explicit production promotion -> live acceptance -> rollback on failure`

Do not restore the legacy pre-launch publisher or re-close indexing as part of
routine development.

## Operator

NoevaPet is currently operated by Frederick Samuel under the business
designation NOEVA Systems, Marienburger Straße 16, 56112 Lahnstein, Germany.

Current contact: `info@noevasystems.com`.

The public legal pages reflect the present sole-trader status. Registered
company details should only be added after the corresponding register facts
exist and have been verified.
