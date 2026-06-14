## 1. Read a second file without disturbing the workspace

- [x] 1.1 Add a read-only "pick a library file" path that returns parsed bytes for merging — `showOpenFilePicker` (web), Electron open dialog (desktop), and the upload fallback — without setting `currentFile`/`libraryLoaded` or touching live state
- [x] 1.2 Parse and validate the selected file via `parseLibrary`; on an invalid/corrupt envelope, abort with an error and leave the open library unchanged (no mutation)

## 2. Extract the reusable graft core

- [x] 2.1 Factor `applyScopeCopy` (`app/app.jsx:415`) so its graft mechanics — `idMap` minting, `parent` rewire, `depth` delta, card re-id, contiguous depth-first splice, label disambiguation — can run with source rows coming from a *parsed B library* rather than the live library
- [x] 2.2 Verify the existing in-library copy/paste still behaves identically after the refactor (no behavior change to `copy-scope`)

## 3. Build the merge plan (pure, no state mutation)

- [x] 3.1 Compute each scope's effective label-path (apply `scopeLabels` overrides) for both A and B; build an index of A keyed by label-path
- [x] 3.2 Walk B's root children (never B's root) and classify each node: graft (no match), recurse (folder=folder match), union-cards (topic=topic match), or disambiguated graft (folder-vs-topic clash → `(copy)` suffix)
- [x] 3.3 For unioned topics, compute each B card's `contentKey` — kind+question+answer for text cards; stable hash of stored image base64 + normalized box layout for occlusion cards — and split B's cards into added vs. duplicate (same path AND same content)
- [x] 3.4 Produce a plan object `{ grafts, unionedTopics, addedCards, duplicates }` with enough detail to apply later, and an `idMap` covering all grafted/added ids

## 4. History, sources, and auxiliary keys in the plan

- [x] 4.1 Remap B's `history` (`sessions` + `cardHist`) through the `idMap`; for unioned topics, plan to append B's sessions to A's (kept sorted by `ts`) and merge `cardHist` maps
- [x] 4.2 Remap `sources` referenced by grafted/added cards, merge into A's `sources`, and enforce the existing 40-entry cap (evict oldest)
- [x] 4.3 Plan auxiliary keys: A wins `scopeLabels`/`folderSort` for unioned nodes, B's carried (remapped) for grafted nodes; drop B's `trash`, `pendingDrafts`, and `lastSession`; keep A's `lastSession`

## 5. Duplicate-resolution step

- [x] 5.1 Build the resolution screen (model on the pending-drafts review surface, `app/app.jsx:4333`): list each duplicate as an A-card vs B-card pair with per-row actions Keep both / Edit / Skip, plus bulk keep-all / skip-all
- [x] 5.2 Wire "Edit incoming" to the existing card editor, then re-evaluate the edited card against the duplicate test (still-identical stays flagged)
- [x] 5.3 Encode resolutions back into the plan: Keep both → add incoming; Edit → add edited; Skip → drop incoming and merge B's per-card `cardHist` for that card onto A's surviving card
- [x] 5.4 Show the resolution step only when the plan has ≥1 duplicate; when there are none, proceed straight to commit

## 6. Commit and persist

- [x] 6.1 Apply the resolved plan as a single state batch across `scopes`, `sourceCards`, `history`, `scopeLabels`, `folderSort`, and `sources` so auto-save fires once and the atomic write is consistent
- [x] 6.2 Confirm the merged library auto-saves to A's current file (desktop path + FS Access path); B's file remains byte-unchanged

## 7. Entry point and UI

- [x] 7.1 Add a "Merge…" action in the top nav beside Open/New (`app/app.jsx:4412`) that runs file-pick → plan → (resolve) → commit
- [x] 7.2 Surface a post-merge summary (counts of folders/topics/cards added and duplicates resolved) consistent with existing nav/save feedback

## 8. Localization

- [x] 8.1 Add all new UI strings (Merge action, resolution screen title/actions/counts, summary, error states) to the i18n layer in all seven languages

## 9. Verification

- [x] 9.1 Manually verify the core flows: merge a non-overlapping file (clean union of siblings), merge an overlapping file (folder/topic union + duplicate detection), and each resolution action (keep both / edit / skip), confirming history carries and skip-merges
- [x] 9.2 Verify invariants: B unchanged on disk; A unchanged on invalid-file abort; ids unique post-merge; references (parent, card keys, history keys, source refs) all consistent; result survives a reload/restart
- [x] 9.3 Add a 1.0.x changelog entry (English, in `app/changelog.js`) describing Merge a library, and bump the version constants in sync (`app/app.jsx` `APP_VERSION`, `package.json`, `package-lock.json`)
