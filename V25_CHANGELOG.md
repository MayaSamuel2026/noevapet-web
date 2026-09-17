# NoevaPet Pre-Deployment V25

## Fine pass + automated qualification hardening

V25 is primarily a reliability release. It does not redesign the customer journey. It strengthens the release gate so UI wiring and cross-screen state mismatches cannot pass merely because the underlying storage functions work.

### Fine-pass corrections
- Added a runtime state invariant checker for active pet, routine, open needs, recommendations, cart and retailer route.
- Added DOM congruency checks for navigation cart count, Pet Match purchase nodes, Pet Match shopping summary, basket rows and homepage basket preview.
- QA mode can be enabled with `?qa=1` or `localStorage.npQaMode=1`; a small PASS/FAIL panel appears only in QA mode.
- Added interaction-level regression tests that render the actual routine card, confirm **Heute nachkaufen** has a real click handler, click it and verify the canonical basket changes correctly.
- Added a regression for missing pack/variant: the visible action must open the exact-product editor, prefill the saved product and focus the missing variant field.
- Added state-matrix tests for duplicated needs, duplicated purchase intent, stale checkout progress, pet switching, retailer allocation and exact-product invariants.
- Corrected German pet-meta placeholder text leaking into the English static templates.

### Automated release system
- `qa/v25-release-gate.mjs` is now the single deterministic release gate.
- `RUN_QA_V25.cmd` provides a one-click Windows deterministic qualification run.
- Added Playwright browser-level journey tests under `qa/browser/`.
- Added `.github/workflows/noevapet-qualification.yml`: every push/PR runs deterministic tests first, then real Chromium journey tests. Browser evidence is uploaded as a CI artifact.
- Deployment should depend on this workflow passing; a failing gate means the build must not be released.

### Why this is materially stronger
Earlier tests often called state functions directly. A button could therefore be visible but unwired and the state tests would still pass. V25 adds explicit UI-action wiring tests plus a real-browser CI gate, closing that gap.
