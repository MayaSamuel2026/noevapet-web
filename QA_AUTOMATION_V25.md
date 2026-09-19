# NoevaPet automated qualification model — V25

## The gap that caused previous regressions
The earlier deterministic suites were strong at checking stored state and calculations but weaker at verifying that the visible control a user clicked was actually wired to the same state transition. This allowed defects such as a visible **Heute nachkaufen** action failing while direct function-level tests still passed.

## Four qualification layers
1. **Static integrity** — local references, duplicate IDs, DE/EN structure, required controls and JavaScript syntax.
2. **State invariants** — one selected product per need, no resolved need left open, no same-need routine+recommendation double purchase, exact repurchase requires an exact variant, every cart item appears exactly once in the retailer route, no pet-state leakage.
3. **Interaction wiring** — render the actual action, verify a click listener exists, execute the visible click, then reconcile Pet Match and basket state.
4. **Real browser journeys** — Playwright runs the actual DE/EN pages in Chromium, clicks visible controls and verifies rendered counts/products across Pet Match and basket.

## Runtime QA mode
Open any page with `?qa=1` during qualification. A QA panel verifies visible counts against the canonical state. The panel is absent during normal use.

## Release rule
A build is not deployable unless:
- deterministic gate = PASS;
- browser gate = PASS in CI;
- no blocking QA invariant is present.

The GitHub Actions workflow included in V25 enforces the first two gates automatically on each push or pull request.
