## Context

A `.runico` file is the unit of storage: a JSON envelope `{ format: 'runico-library', version: 1, library: {…} }` whose `library` holds nine keys (`app/app.jsx:179`, `LIBRARY_KEYS`): `scopes`, `sourceCards`, `scopeLabels`, `folderSort`, `history`, `trash`, `pendingDrafts`, `sources`, `lastSession`. `scopes` is a **flat, depth-first array** of `{ id, label, parent, depth, isLeaf, … }`; cards live in `sourceCards[scopeId]`; images are stored **inline as base64** on occlusion cards. Every id is minted by `genId(prefix)` = `prefix-<Date.now() b36>-<counter>` (`app/app.jsx:334`), so ids from two independently-created files effectively never collide — *except* the root scope (`id: 'all'`), which both files share.

The app is a single-open-file workspace: `currentFile` holds the active handle/path, and any library mutation auto-saves (debounced, atomic) to that file. Today the only "combine" operations are folder/topic **move** and **copy**, both operating within one open library. `applyScopeCopy` (`app/app.jsx:415`) already implements the hard parts of grafting a subtree: it builds an `idMap`, mints fresh ids per scope, rewires `parent`, recomputes `depth`, clones cards with fresh ids, disambiguates labels with a `(copy)` suffix, and splices the block in contiguously to preserve depth-first order. The pending-drafts review screen (`approveDrafts`, `app/app.jsx:4333`) is an existing "review a list of incoming cards before committing" surface.

This change adds a cross-file operation: fold a second file (B) into the open library (A). It is a renderer-only feature on the existing v1 format; no schema change, no new dependency.

## Goals / Non-Goals

**Goals:**
- Fold all of B's content into A additively, writing the result into A's current file; never modify B.
- Place content by **recursive union on effective label-path**: matching folders/topics merge; new branches graft as siblings with fresh ids.
- **Preserve B's study history**, remapped onto the new ids; combine sessions for unioned topics.
- Detect duplicates by **path + content** and route them through a **resolution step** (keep both / edit / skip); never silently drop an incoming card. On skip, merge B's per-card history into A's survivor.
- Localize all new UI in seven languages; ship the full behavior (no reduced MVP).

**Non-Goals:**
- No three-way/structural conflict UI beyond the per-card duplicate step (folder-level differences just union or graft).
- No content-level dedup of *folders/topics* themselves (only cards are dedup-checked).
- No de-duplication of inline images across cards (merging image-heavy libraries may grow the file; acceptable).
- No "save as / new combined file" flow — result lands in A's current file.
- No undo stack for a merge (mitigations below).
- No change to the `.runico` format or version.

## Decisions

### D1: Union by effective label-path, not flat append
Match B's scopes to A's by the sequence of effective labels (apply `scopeLabels` overrides) from root down. Folder=folder at the same path → recurse; topic=topic → union cards; absent → graft whole subtree. This is what makes "duplicate = same path + same content" coherent: without path-merging, the same-named folders would never line up and a card could never be a duplicate.
- *Alternative considered:* always graft B's top folders as `(copy)` siblings (pure `applyScopeCopy`). Rejected — simpler, but the duplicate step would almost never fire, defeating the user's stated requirement.
- *Path-key details:* effective label per scope; key is the ordered label chain. Edge cases: (a) two sibling folders with the same label within one file → match the first, treat the rest as graft (documented, rare); (b) folder-vs-topic clash at the same path → cannot union → graft with `(copy)` suffix.

### D2: Reuse `applyScopeCopy`'s graft mechanics, drive them from B
The graft of an absent subtree is exactly `applyScopeCopy` semantics (idMap, parent rewire, depth delta, card re-id, contiguous splice), except the *source* rows come from B's parsed library rather than the live one, and the *destination* is the matched A scope (or A's root for top-level grafts). Factor the reusable core so both the in-library copy and the cross-file graft share it.
- *Alternative:* write a separate grafter. Rejected — duplicates subtle depth/order logic that already works and is spec'd by `copy-scope`.

### D3: History preserved (diverges from copy)
Copy intentionally resets history (`last: 'never'`). Merge does the opposite: remap `history[oldScopeId] → history[newScopeId]` and `cardHist[oldCardId] → cardHist[newCardId]` through the same idMap. For a **unioned** topic, append B's `sessions[]` to A's (keep sorted by `ts`) and merge `cardHist` maps. For a **skipped** duplicate, append B's `cardHist[bCardId]` entries onto A's surviving card's `cardHist` (the user studied the same card in two libraries; stats add up).
- *Alternative:* drop B's history (copy-style). Rejected by the explore decision — losing progress is the main thing users would not want when *merging* (vs. copying).

### D4: Two-phase merge — plan, then commit — with a resolution gate
Phase 1 (pure, no state mutation): parse B, compute the union plan = { grafts, unioned topics, added cards, **duplicates** }. If duplicates exist, render the resolution screen seeded with the plan. Phase 2: apply the resolved plan as a **single state batch** (so the 600 ms auto-save fires once and the atomic write is consistent). Keeping phase 1 pure makes it testable and makes "invalid file leaves A unchanged" trivial.
- *Resolution UI:* model on `approveDrafts` — a list of A-card vs B-card pairs, per-row actions Keep both / Edit / Skip, plus bulk "keep all / skip all". "Edit" opens the incoming card in the existing card editor, then re-checks (an edited card that still matches stays flagged).

### D5: Read B without disturbing `currentFile`
Add a read-only variant of the open path: `showOpenFilePicker` (web) / Electron open dialog returning file contents, then `parseLibrary`. Do **not** set `currentFile`, `libraryLoaded`, or any live state from B. Web upload fallback (no FS Access API) can still supply bytes for the merge even though it can't be a *workspace* file.

### D6: Auxiliary keys
`scopeLabels`/`folderSort`: A wins for unioned nodes; B's carried (remapped) for grafted nodes. `sources`: remap srcIds on grafted cards, merge the map, then enforce the existing 40-entry cap (evict oldest). `trash`, `pendingDrafts`, `lastSession` from B: **dropped** (B's deleted items and half-finished drafts are noise in A; only one last-session is meaningful and A's is kept).

### D7: Entry point
A "Merge…" action in the nav beside Open/New (`app/app.jsx:4412`). (Drag-a-`.runico`-onto-the-window is a possible later enhancement; not required for this change.)

## Risks / Trade-offs

- **No undo for a merge** → B is never touched (re-derivable), grafted content is identifiable, and per-card deletes go through trash; an accidental merge is recoverable by deleting the grafted branches. Acceptable for v1.
- **Occlusion content equality is approximate** (a re-encoded image hashes differently) → such cards are treated as *distinct* rather than falsely merged; over-counting duplicates is safer than dropping a real card. Compare on a stable hash of the stored base64 + normalized box layout.
- **Inline images duplicate on graft** → merging image-heavy libraries grows the file; no dedup. Flagged as a non-goal; the `local-save-file`/`library-model` "media referenced once" aspiration is out of scope here.
- **Label-path ambiguity** (duplicate sibling labels, or label edited after merge) → documented first-match rule; rare in practice. Path matching is a heuristic for *placement*, and the per-card duplicate gate is the real safety net.
- **Large libraries** → the plan is O(n) over scopes+cards (build A's path/content index once, probe B against it); fine for expected sizes.
- **Partial/corrupt B** → phase-1 parse validates the envelope; failure aborts before any mutation, satisfying "open library unchanged".

## Open Questions

- Should the resolution step also offer a "remember my choice for the rest of this merge" (apply one action to all remaining duplicates)? Bulk keep/skip covers most of it; per-row default is the safe baseline.
- For unioned topics, should added (non-duplicate) cards from B be appended after A's cards or interleaved by original order? Default: append, preserving A's existing order.
