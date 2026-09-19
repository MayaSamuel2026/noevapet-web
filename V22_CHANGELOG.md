# NoevaPet Pre-Deployment V22

## Purpose
V22 is the first release built against an explicit state/congruency qualification gate rather than a page-by-page refinement pass.

## Logic correction from V21
The V21 Pet Match renderer accidentally reintroduced resolved category/need nodes alongside the concrete recommended products. This caused a state such as:

- Vet Concept (saved routine)
- Spaziergang (resolved need)
- Alltagsgeschirr-Set (selected product)
- Snacks (resolved need)
- Kleine Trainingssnacks (selected product)
- Ausgewogenes Trockenfutter (selected product)

while the basket correctly contained only the three selected products.

V22 fixes the underlying semantics:

- a need is temporary;
- as soon as a concrete recommendation solves it, the need is removed from open state;
- saved routine products remain visible but are explicitly labelled as already used;
- selected purchase products are explicitly labelled as in the basket;
- only open unresolved needs can remain as need objects;
- the orbit legend reconciles routine vs basket vs open needs;
- the summary under the orbit lists the exact basket products and total.

Expected example:

- Vet Concept — Already used / Bereits genutzt
- Balanced dry food — In cart / Im Warenkorb
- Everyday harness set — In cart / Im Warenkorb
- Small training treats — In cart / Im Warenkorb

Orbit objects: 4. Basket products: 3. The UI now explains why those counts differ.

## Qualification infrastructure
V22 contains:

- `qa/v22-state-tests.mjs` — executable tests against the real final app.js state functions.
- `qa/v22-journey.html` — browser-level DE/EN journey harness that drives actual pages/DOM when run in a normal local browser environment.
- `QA_STATE_V22.json` — executed state-model test results.
- `QA_STATIC_V22.json` — executed structural/integrity results.
- `QA_QUALIFICATION_GATE_V22.md` — canonical release invariants for future NoevaPet versions.

The state and static tests are designed so a future visual override cannot silently reintroduce a semantically invalid state without failing the gate.
