## Why

The Runico prototype (`prototype/` + the eight `tutorial/` walkthroughs) is the product requirements document: it is the envisioned experience, and it is what needs to be implemented. Until now none of that behavior is captured as OpenSpec capabilities, so there is no spec-backed contract for the app's core features. This change specifies the full prototype so the product can be implemented (and verified) against an explicit baseline.

## What Changes

- Capture every feature shown in the prototype and tutorials as OpenSpec capabilities with testable requirements.
- Specify the eight tour features — study, resume, browse, progress, add cards, image occlusion, source view, appearance — plus the underlying library/card data model they share.
- Specify behavior only (the WHAT): card-by-card study with no grading scale, the per-session accuracy metric, the column browser hierarchy, the draft-review add flow, the occlusion editor, the source page, and theme/language settings.
- Defer the storage/runtime mechanism to design: the prototype uses mock data in `sessionStorage`, but the specs describe observable behavior so a production data layer can satisfy them later.
- Note relationship to in-flight changes: `add-ai-card-generation` will later supply the real generation engine behind the `card-authoring` flow specified here; `add-openrouter-key-management` and `add-electron-desktop-wrapper` build on `appearance-settings`/the data layer.

## Capabilities

### New Capabilities
- `library-model`: the subjects → folders → topics hierarchy, the four card kinds (`cloze`, `qa`, `rev`, `occlusion`), factual counts (no SRS scheduling), and durable single-save-file persistence of the library.
- `study-session`: studying one card at a time — recall, reveal, then Continue (pass) or Pause — with progress marker, keyboard shortcuts, and a source link, and no grading scale.
- `session-resume`: the home-view quick-resume action that adapts to the last session (Continue / Restart / Begin) and returns to the exact card.
- `library-browser`: the column browser that drills subjects → folders → topics, with Practice-all per column and a topic action card.
- `progress-tracking`: per-session accuracy charts over rolling 30-day windows, per-card pass/miss drill-down, reporting-only (never affects scheduling).
- `card-authoring`: turning dropped source material into reviewable draft cards (keep/remove/edit) plus manual create/edit/delete of cards.
- `image-occlusion`: the mask editor — draw, move, resize, and remove boxes over a figure to build occlusion cards.
- `source-view`: opening a card's original material as a book page with the studied term highlighted in context.
- `appearance-settings`: choosing a canvas theme (Light / Warm / Dark) and the language (English / Spanish / Mandarin) for cards and interface.

### Modified Capabilities
<!-- None — this is the baseline; openspec/specs/ is empty. -->

## Impact

- **Source of truth**: `prototype/app.jsx`, `prototype/index.html`, and `tutorial/01..08`.
- **Code**: establishes the spec baseline these features must satisfy; the existing prototype already realizes most behavior and is the reference implementation.
- **Storage/runtime**: persistence mechanism (mock/`sessionStorage` today vs a production data layer) is a design decision, not a spec requirement.
- **Downstream**: this baseline is the foundation the three AI/desktop changes layer onto (`card-authoring` ↔ `add-ai-card-generation`; `appearance-settings` ↔ key-management Settings; data layer ↔ Electron storage).
