## Context

`deleteFolder(id)` (app.jsx) computes the scope plus all descendants (BFS over the parent chain), filters them out of the flat depth-first `scopes` array, and prunes `sourceCards` / `pendingDrafts` / `history` / `scopeLabelOverrides` for those ids. `onDeleteCard(id)` filters one card out of `sourceCards[scopeId]` and updates `scope.total`. Both are hard deletes. The persistence model is the flat `scopes` array plus the per-scope `sourceCards` map (the same model the move/copy feature operates on).

## Goals / Non-Goals

- **Goals:** capture every delete into a restorable trash; restore to the original location; manual empty; persisted + export/import-safe; excluded from study until restored.
- **Non-goals:** auto-expiry / time-based purge; per-item version history. (Study `history` and `pendingDrafts` ARE preserved — see below — so a restore is a faithful undo.)

## Decisions

### Trash state
A new persisted array `trash` (`usePersistentState('trash', () => [])`), newest-first. Two entry shapes, each with `trashId` (`genId('trash')`) and a `deletedAt` timestamp:

- **Scope subtree:** `{ trashId, kind: 'scope', deletedAt, label, scopes: [<removed scope objects, depth-first order>], cards: { <leafId>: [<card objects>] }, labelOverrides: { <id>: <override> }, originParent: <parent id of the block root at delete time> }`
- **Card:** `{ trashId, kind: 'card', deletedAt, card: <card object>, sourceId: <scope id it lived in>, sourceLabel: <for display> }`

`deletedAt` uses the wall clock (`Date.now()` is fine in the app — it is only restricted inside workflow scripts).

### Capture on delete
- `deleteFolder` builds the `removed` set exactly as today, but BEFORE pruning it snapshots the removed scope objects + their `sourceCards`, `scopeLabelOverrides`, `history`, and `pendingDrafts` into a `kind:'scope'` entry (`label` = deleted root's label, `originChain` = the deleted root's surviving-ancestor ids). Study `history` and `pendingDrafts` ARE captured so Restore brings back the topic's progress (unlike copy, which deliberately resets it). It then prunes as today and prepends the entry to `trash`.
- `onDeleteCard` snapshots the card + its `sourceId` and source label into a `kind:'card'` entry before filtering it out.

### Restore
- **Scope entry:** re-insert the snapshotted scope objects into `scopes` (ids / depths / relative order preserved) and merge their `cards` + `labelOverrides` back. Insertion point: immediately after `originParent`'s subtree if `originParent` still exists; otherwise attach the block root under the nearest surviving ancestor, falling back to the root `all`, recomputing depths from the new parent. If a restored id already exists (e.g. a new scope reused it), remint that id on the restored copy and fix child `parent` refs. Drop the entry on success.
- **Card entry:** if `sourceId` still exists, prepend the card to `sourceCards[sourceId]` and bump that scope's `total`; if the source is gone (also deleted/trashed), surface a notice and leave the entry in the trash (the user can restore the source first). Drop the entry on success.

### Exclusion while trashed
Because trashed scopes/cards are removed from `scopes` / `sourceCards` at capture time and only snapshotted inside `trash`, they are already invisible to counts (`descendantStats`), decks (`deckFor`), the browser, and study — no extra filtering is required anywhere else.

### UI
- A `nav-btn` carrying a new `trash` glyph in `nav-right` (left of Settings), with a small count badge when the trash is non-empty; it sets `screen === 'trash'`.
- `TrashScreen`: items newest-first, each row showing the label, a kind tag (folder / topic / card), the card count, and a relative deleted-time, with **Restore** and **Delete forever** actions; a header **Empty trash** (confirm) and a friendly empty state.

### Persistence / export
`trash` is a `usePersistentState` key, so it persists and is included in export/import like the rest of the `runico:v3:` store. Trashed image-occlusion cards keep only their already-cropped image (consistent with the on-approve stripping).
