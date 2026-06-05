## Context

Scopes (subjects, folders, topics) live in a single **flat, depth-first-ordered array** in `prototype/app.jsx`. Each entry is `{ id, label, parent, depth, total, last, isLeaf, ... }`; the root is `{ id: 'all', parent: null, depth: 0 }`. The column browser (`FolderView`) renders columns by filtering `scopes` on `parent`, and relies on the array being ordered so that a parent is immediately followed by the contiguous block of its descendants. Cards live in `sourceCards[leafId]`; study history in `history[id]`; label overrides in `scopeLabelOverrides[id]`; all of it is mirrored to `sessionStorage` (`runico:v1:*`) via `usePersistentState`.

Two existing handlers already encode the invariants this change must respect:
- `createFolder` computes `depth = parent.depth + 1` and inserts the new scope **after the parent's last descendant** (it scans forward while `depth > parent.depth`).
- `deleteFolder` collects a scope **plus all descendants** via a parent-chain sweep, removes them, and prunes their entries from `sourceCards` / `pendingDrafts` / `history` / `scopeLabelOverrides`.

There is no current way to re-parent an existing scope. This design adds move (re-parent) and copy (duplicate) on top of the existing model without changing the storage schema.

## Goals / Non-Goals

**Goals:**
- Move a folder (with its whole subtree) or a single topic into another folder, preserving ids, cards, and progress.
- Copy (duplicate) a folder subtree or a topic, with all its cards, under a destination folder.
- Offer both gestures the user asked for: drag-and-drop, and a Cut/Copy → Paste clipboard.
- Keep the flat-array depth-first ordering invariant intact so the browser keeps working.
- Persist results through the existing session storage; no new storage keys; no data migration.

**Non-Goals:**
- Multi-select move/copy (one scope at a time).
- Reordering siblings within the same parent (this is a re-parent feature, not a sort feature).
- Touch-optimized drag-and-drop (Cut/Copy/Paste is the touch-friendly path; native HTML5 DnD is mouse-first).
- A nested-tree refactor of the scope model.

## Decisions

### Keep the flat array; move = re-parent + recompute depth + re-splice the block
Rather than refactor to a nested tree, `moveScope(scopeId, destId)` will:
1. Collect the contiguous subtree block `[scope … last descendant]` using the same parent-chain sweep `deleteFolder` uses (and the same "scan while depth > scope.depth" the create-insert uses to find the block end).
2. Set `scope.parent = destId`.
3. Recompute `depth` for the block in a single forward pass (parent appears before its children, so each node's depth = its parent's already-updated depth + 1; the block root = `dest.depth + 1`).
4. Remove the block and re-insert it immediately after the destination's last descendant.

Ids are untouched, so `sourceCards` / `history` / `scopeLabelOverrides` stay correctly keyed and need no edits. *Alternative considered:* a nested tree model — rejected as a large, risky refactor touching every browser/stats code path for no user-visible gain.

### Copy = deep clone with an id remap, fresh history
`copyScope(scopeId, destId)` builds an **old→new id map** over the subtree (in order), then emits cloned scopes with `parent = remap[oldParent]` (the block root re-parents to `destId`) and recomputed depth. For each cloned leaf it clones `sourceCards[oldId]` into `sourceCards[newId]` with **fresh card ids**, and copies `scopeLabelOverrides`. It does **not** copy `history` or `pendingDrafts`, so a duplicate starts with no progress and no stray drafts. *Alternative considered:* copying history too — rejected; a duplicate is a fresh study object, and carrying another scope's session record would be misleading.

### Id minting via `genId`
Cloned scope ids and card ids use the existing monotonic `genId(prefix)` (wall-clock + per-load counter), which is already the project's guard against id collisions across reloads — stronger than `createFolder`'s `Math.random` slice for the larger volume a copy mints.

### Name-collision disambiguation only at the block root
Only the top-level copied scope can collide with an existing sibling under the destination; descendants keep their labels (they live under the new root). If `dest` already has a child with the same label, append a localized "(copy)" suffix (and a counter if needed).

### One validation predicate, shared by both gestures
`canReceive(srcId, destId, mode)` returns true iff: `dest` exists and `!dest.isLeaf`; `destId !== srcId`; `dest` is not inside `src`'s subtree (cycle guard via a parent-chain `isDescendant` walk); `src` is not the root; and (for `move`) `destId !== src.parent`. Both the drop handler and the Paste affordance call it, so drag and paste enforce identical rules. Validation is re-checked **at apply time** (a scope on the clipboard could have been deleted meanwhile → paste no-ops).

### Clipboard is ephemeral React state
`clipboard = { mode: 'cut' | 'copy', scopeId } | null` lives in `App` state, not `usePersistentState` — it is intentionally cleared on reload. A successful **cut → paste** clears it (one-shot move); a **copy** is left in place so it can be pasted repeatedly. The cut source is rendered dimmed.

### Drag-and-drop mirrors the existing priority-row pattern
Reuse the app's proven HTML5 DnD approach (as in the Add screen's priority rows): `draggable` on `column-item`, the dragged id held in React state on `onDragStart`, `onDragOver` calls `preventDefault()` only on valid folder targets (which also drives the highlight), and `onDrop` calls `moveScope`. Because a drag can cross columns, the dragged id is kept in component state rather than only in `dataTransfer`.

### No artificial depth cap
The create-folder parent picker caps choices at `depth < 3`, but the data model comment and the browser both support arbitrary nesting. Move/copy will **not** impose a depth cap (surprising rejections are worse than an extra column); the browser already scrolls horizontally and auto-reveals new columns.

### Stats need no special handling
Folder counts come from `descendantStats(id)`, computed from leaf `sourceCards` by id, so move/copy totals update automatically. Cloned leaves set their own `total` to the cloned card count, matching how `createFolder`/card edits maintain it.

## Risks / Trade-offs

- **Ordering-invariant breakage** (a mis-spliced block would scramble the browser) → Mitigation: implement move/copy beside `createFolder`/`deleteFolder` reusing their block-boundary and descendant-sweep logic; cover with the spec scenarios (contiguity, depth recompute, reload).
- **Clipboard scope deleted before paste** → Mitigation: re-run `canReceive` and an existence check at paste time; paste no-ops if the source is gone.
- **Large copy bloats sessionStorage** (cloning many cards/images can approach the storage quota) → Mitigation: copy is explicit and user-initiated; this is the same quota exposure the existing add flow already has; no new guarantee is made beyond current behavior.
- **Touch drag-and-drop is unreliable** → Mitigation: Cut/Copy/Paste fully covers reorganization without dragging and is the recommended path on touch.
- **Deep nesting from repeated moves** (more horizontal columns) → Mitigation: accepted; the browser already handles and auto-scrolls to deep columns.

## Migration Plan

Purely additive client-side feature. No storage-schema change and no data migration: existing stored scopes already carry `parent`/`depth`, which move edits in place and copy extends. Rollback is removing the handlers and UI affordances; previously stored data remains valid because no shape changed.

## Open Questions

- Exact wording/i18n of the disambiguation suffix ("(copy)" and its translations) — a tasks-level detail.
- Whether the column browser should auto-select/scroll to a freshly pasted scope (nice-to-have; default to selecting the moved/copied block root).
