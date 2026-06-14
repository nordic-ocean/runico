## Why

A `.runico` file is a self-contained library, so the moment a user keeps study material in more than one file — a deck a classmate shared, a subject they started on another machine, an export they want to fold back in — there is no way to bring them together. The only existing combine operations (folder move/copy) work *within* one open library. Users need to join the contents of a second file into the one they are working in without losing their study history or silently creating duplicate cards.

## What Changes

- Add a **Merge a library** operation: from the open library (A), the user picks a second `.runico` file (B) and Runico folds B's contents into A. B's file is never modified; the result is written into A's current file and auto-saved.
- **Union by label-path, not blind append.** B's content is matched against A by effective label-path: folders/topics that already exist at the same path merge into A's existing ones (recursively); branches that don't exist in A are grafted in as new siblings with freshly minted ids.
- **Study history is preserved.** Sessions and per-card pass/fail records from B are carried across and remapped onto the merged ids.
- **Duplicate cards are surfaced, never silently dropped.** A card counts as a duplicate only when both its path and its content match an existing card. Detected duplicates are collected into a review step where the user resolves each one — *Keep both*, *Edit incoming*, or *Skip* (keep A's copy). On *Skip*, B's study history for that card merges into the surviving card.
- Add a **"Merge…"** entry point in the top navigation, beside Open and New.
- Reading B reuses the existing file-picker primitives (File System Access API on the web, the native dialog on desktop) but returns the parsed library for merging instead of replacing the open library.

## Capabilities

### New Capabilities
- `merge-library`: Folding a second `.runico` library into the currently-open one — file selection, recursive union by label-path with id reminting, study-history preservation and remapping, path-and-content duplicate detection, and the per-duplicate resolution step (keep both / edit / skip).

### Modified Capabilities
<!-- No existing requirement changes; merge-library is purely additive and preserves the invariants defined by library-model, copy-scope, and local-save-file. -->

## Impact

- **Code:** `app/app.jsx` — new merge orchestration (the label-path union walk, duplicate detector, and resolution screen), a "Merge…" nav action beside Open/New, and a file-read path that parses B without replacing state. Reuses `applyScopeCopy` (graft engine), `genId` (fresh ids), and the pending-drafts review screen as the resolution-UI pattern.
- **No file-format change:** the `.runico` envelope (`{ format: 'runico-library', version: 1, library: {…} }`) and the nine `LIBRARY_KEYS` are unchanged; merge operates entirely on the existing v1 shape.
- **Localization:** all new UI strings (the Merge action, the resolution screen, its actions and counts) go through the i18n layer in all seven languages.
- **Platforms:** works on the web build (File System Access API, with the upload fallback noted as a constraint) and the Electron desktop build (native open dialog).
- **No new dependencies.**
