# NoevaPet Web

Customer-facing NoevaPet website for Germany (DE/EN).

## Release model

This repository follows NOEVA Deployment Standard v1:

`main` → GitHub Actions qualification → clean `production` branch → Hostinger Git deployment.

- `main` contains the release source and QA/deployment automation.
- `production` is generated automatically and contains only the deployable static website.
- Hostinger must deploy the `production` branch into the domain document root.
- Production remains `noindex,nofollow` until the commercial core, legal details, consent/analytics and retailer bindings are launch-ready.

## Approved baseline

Approved pre-deployment UI baseline: **NoevaPet V26** (`NoevaPet_PreDeployment_V26.zip`).

Do not replace the approved V26 payload with an older build. V26 retains V25 logic/QA and adds the final readability pass plus the pet identity treatment in purchase confirmation.
