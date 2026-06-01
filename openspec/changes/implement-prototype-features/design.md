## Context

The prototype (`prototype/app.jsx`, ~2700 lines; `prototype/index.html`) is a single-file React app loaded via CDN, with all state seeded from mock data and mirrored to `sessionStorage` via `usePersistentState` under the `runico:v1:` prefix. It already realizes nearly all specified behavior and is the reference implementation. The eight `tutorial/` pages are the prose PRD. This change establishes the spec baseline for that behavior; the specs intentionally describe observable behavior so the underlying data/runtime can evolve without rewriting them.

## Goals / Non-Goals

**Goals:**
- A complete, testable spec baseline covering every prototype feature.
- Keep specs behavior-level (WHAT) so they hold whether storage is mock, local, or a backend.
- Preserve the prototype's defining choices: no grading scale (Continue = pass), per-session accuracy as the single metric, reporting-only progress, review-before-keep authoring.
- Provide an implementation/verification task list grouped by capability.

**Non-Goals:**
- The concrete save-file format/bundle and `fs` mechanics — owned by `local-save-file` in `add-electron-desktop-wrapper` (this change only requires durable, single-document persistence at the behavior level).
- Cloud sync across devices and a multi-user backend (the save file is user-owned and local; users can sync the file themselves).
- Re-implementing what already works in the prototype where it already satisfies the spec.
- The real AI generation engine, key storage, and desktop packaging — owned by `add-ai-card-generation`, `add-openrouter-key-management`, `add-electron-desktop-wrapper`.
- Spaced-repetition scheduling of any kind in v1 (decided below) — no algorithmic due dates, intervals, or modelled retention; the prototype's interval labels are not surfaced as behavior.

## Decisions

- **Persistence model is decided: a single user-owned save document.** All state persists durably (survives a full restart, not just a reload) and is captured as one portable save document — `data.json` for text plus a `media/` bundle for images, referenced by id/hash. The concrete file/bundle and load/auto-save/export/import live in the `local-save-file` capability (`add-electron-desktop-wrapper`, where `fs` access exists); the browser build uses a durable fallback (local storage / IndexedDB + manual export/import). Specs stay behavior-level so either runtime satisfies them. *Alternative considered:* base64-embed images in one JSON — rejected; it bloats the file (~33% tax, tens-to-hundreds of MB at scale) and forces whole-file rewrites on every auto-save. *Alternative:* a backend with accounts/sync — rejected for v1; the local save file keeps data user-owned with no server.
- **"No grading scale" is a hard requirement, not an implementation detail.** The study UI exposes only Continue/Pause; Continue records a pass (`onGrade('good')` in `StudyScreen`). The four interval labels in the data model are not surfaced as user choices. This is core to the product and is specified explicitly.
- **One capability per feature area, plus a shared `library-model`.** Nine capabilities keep each spec focused and map cleanly to the tutorial pages; the shared data model (hierarchy + card kinds + factual counts + persistence) is factored out so the feature specs reference it rather than redefining it.
- **`card-authoring` specifies the UX flow, not the generation engine.** The drop → process → review → keep flow and manual CRUD are specified here; the actual model call is layered in by `add-ai-card-generation`. The processing stages are specified as user-visible feedback, not as a contract on how cards are produced.
- **Reference implementation stays the prototype.** Implementation work is "make the product satisfy these specs," and for most capabilities the prototype already does; tasks focus on confirming coverage and filling gaps rather than rewriting.
- **Language is UI-only across seven languages.** The interface localizes to English, Português (Brasil), Português (Portugal), Español, Русский, Italiano, and 中文; user-authored card content is never machine-translated. This refines the prototype's tutorial text (which listed three languages and implied card translation). *Alternative considered:* translate card content too — rejected; cards are the user's own material and should stay as authored.
- **No spaced repetition in v1; practice is user-driven.** No algorithm computes due dates, intervals, or retention. The user decides what and when to study (pick a topic, Practice-all, or any scope), in their own time and order. Counts shown are factual only — total cards, an optional new/unstudied count, last-studied recency — not an SRS "due" number. This refines the prototype, whose "due" counts were mock/decorative (Continue already records a plain pass, no scheduling). *Alternative considered:* ship an SRS engine (SM-2 style) in v1 — rejected per product decision; keeps v1 simple and puts the user in control. An SRS layer can be added later as a separate change without changing the recorded study history.

## Risks / Trade-offs

- **Specs drift from a future production rewrite** → Behavior-level specs plus the prototype as reference keep verification concrete; archive specs become the baseline future changes diff against.
- **Large single change** → Grouped tasks per capability keep `/opsx:apply` tractable; capabilities can be implemented/verified independently.
- **Persistence spans two runtimes (browser vs desktop)** → Behavior-level requirement plus a single save-document model; the desktop `local-save-file` capability and a browser fallback both satisfy it, keeping divergence to the storage adapter.
- **Overlap with the AI/desktop changes** → Explicit non-goals and cross-references prevent double-specifying the generation engine, key storage, and packaging.

## Migration Plan

Establishes baseline specs; on archive they populate `openspec/specs/`. No runtime migration. The existing prototype continues to serve as the running reference. Durable persistence replaces the prototype's `sessionStorage` scaffolding via the storage adapter (desktop save file / browser fallback) without changing any behavior requirement.

## Open Questions

_None — all resolved (persistence: single save file; languages: 7, UI-only; scheduling: none in v1, user-driven)._
