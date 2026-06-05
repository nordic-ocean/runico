## Why

Runico lets you create, rename, and delete folders and topics, but once a scope exists there is no way to **reorganize** the hierarchy — a folder or topic created in the wrong place is stuck there (the only recourse is delete and recreate, which loses its cards and progress). Users need to move a folder (with everything inside it) or a single topic into another folder, and to duplicate one when they want a variant — using the familiar drag-and-drop and cut/copy/paste gestures.

## What Changes

- **Move a scope by re-parenting it.** A non-root folder (together with its entire subtree) or a single leaf topic can be moved into any other folder. The scope keeps its id, cards, and study history; only its `parent`, its (and its descendants') `depth`, and its position in the ordered scope list change.
- **Two interaction surfaces, one for each gesture the user asked for:**
  - **Drag-and-drop** in the column browser: drag a folder or topic onto a target folder to move it there.
  - **Cut / Copy → Paste**: a clipboard model — **Cut** then **Paste here** on a folder performs a move; **Copy** then **Paste here** performs a duplicate.
- **Copy a scope (duplicate).** Copy → Paste deep-clones the folder, its sub-folders, and every card they contain (with freshly minted ids) under the target folder; a single topic copies its cards likewise. Duplicates start with fresh study history, and a name collision under the target gets a disambiguating suffix.
- **Validation that keeps the tree valid:** the root ("Everything") cannot be moved; a folder cannot be moved or copied into itself or one of its own descendants (no cycles); only non-leaf folders are valid drop/paste targets (topics hold cards, not children); dropping onto the current parent is a no-op. Invalid targets are rejected with a clear visual cue and no state change.
- **Persistence:** move/copy results are written through the existing `sessionStorage`-backed state exactly like create/rename/delete, so they survive reloads within the tab. The clipboard itself is ephemeral (not persisted).
- No breaking changes: existing create/rename/delete, study, and resume flows are unaffected; ids of moved scopes are stable.

## Capabilities

### New Capabilities
- `move-scope`: the re-parenting semantics — moving a folder (with its subtree) or a topic into another folder, including validation (no root, no cycles, folder-only targets, same-parent no-op), recomputing `depth` across the moved subtree, re-ordering the flat scope list to keep each subtree contiguous, and persisting the result. Interaction-agnostic; invoked by both gestures below.
- `copy-scope`: the duplication semantics — deep-cloning a folder subtree (or a single topic) and its cards into a target folder with newly minted ids, fresh study history, and name-collision disambiguation.
- `scope-reorganization-ui`: the two interaction surfaces that trigger move/copy — drag-and-drop of a scope onto a target folder, and the Cut/Copy/Paste clipboard (clipboard state, the Cut/Copy actions per item, the "Paste here" affordance on valid folders, dimming the cut source, and rejecting invalid targets).

### Modified Capabilities
<!-- None — the column browser (FolderView) and the folders management screen are existing prototype code with no prior spec; they are extended in place (new handlers/affordances) under the new capabilities above, not respecified here. -->

## Impact

- **Code**: `prototype/app.jsx` —
  - App-level `moveScope(scopeId, targetParentId)` and `copyScope(scopeId, targetParentId)` handlers plus ephemeral clipboard state (`{ mode: 'cut' | 'copy', scopeId }`), built on the existing `setScopes` / `setSourceCards` updaters and reusing `deleteFolder`'s descendant-collection logic.
  - `FolderView` column browser (primary surface): make `column-item` draggable and add drop handling on folder items, per-item **Cut**/**Copy** actions, a **Paste here** affordance on valid target folders, and the dimmed-while-cut treatment — mirroring the existing HTML5 drag pattern used by the Add screen's priority rows.
  - `FoldersScreen` management list (secondary surface): expose the same Cut/Copy/Paste actions (it already has a parent picker for creation).
- **Storage**: no new `sessionStorage` keys. A **move** only edits `parent`/`depth`/order in `runico:v1:scopes` (ids stable, so `runico:v1:sourceCards`/`history`/`scopeLabels` keys are untouched). A **copy** writes new scope ids into `runico:v1:scopes` and clones the corresponding entries in `runico:v1:sourceCards` (and `runico:v1:scopeLabels`) under those new ids; cloned scopes start with no `history` entry.
- **Reused logic**: descendant collection (from `deleteFolder`), depth/ordering insertion (from `createFolder`), and `descendantStats` (folder counts recompute automatically from leaf cards by id).
- **Depends on**: nothing new — builds on the existing prototype scope model.
- **Downstream**: none.
