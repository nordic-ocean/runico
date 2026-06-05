## 1. Core scope helpers (validation, subtree, depth/order)

- [ ] 1.1 Add `collectSubtree(scopes, id)` returning the scope plus all descendants (reuse `deleteFolder`'s parent-chain sweep) and `subtreeBlockRange(scopes, id)` returning the contiguous `[start, end)` indices of that block in the ordered array.
- [ ] 1.2 Add `isDescendant(scopes, ancestorId, scopeId)` that walks `scopeId`'s parent chain to detect cycles.
- [ ] 1.3 Add `canReceive(scopes, srcId, destId, mode)` enforcing: dest exists & `!dest.isLeaf`; `destId !== srcId`; dest not inside src's subtree; src is not root; and (move only) `destId !== src.parent`.
- [ ] 1.4 Add a depth-recompute helper that, given the moved/cloned block in order, sets the block root depth to `dest.depth + 1` and each subsequent node's depth from its (already-updated) parent.

## 2. Move (re-parent) handler

- [ ] 2.1 Implement `moveScope(scopeId, destId)` in `App`: validate via `canReceive(...,'move')`; set `parent`, recompute depths, extract the subtree block and re-insert it after the destination's last descendant; bail as a no-op when invalid.
- [ ] 2.2 Verify ids are untouched so `sourceCards`/`history`/`scopeLabelOverrides` stay correctly keyed (no edits needed for move).
- [ ] 2.3 Select the moved block root after a move so the browser reveals it.

## 3. Copy (duplicate) handler

- [ ] 3.1 Implement `copyScope(scopeId, destId)` in `App`: validate via `canReceive(...,'copy')`; build an old→new id map over the subtree (ids via `genId`), emit cloned scopes with remapped `parent` and recomputed `depth`, and insert the cloned block under the destination.
- [ ] 3.2 Clone each cloned leaf's `sourceCards[oldId]` into `sourceCards[newId]` with fresh card ids; copy `scopeLabelOverrides`; do NOT copy `history` or `pendingDrafts`; set each cloned leaf's `total` to its cloned card count.
- [ ] 3.3 Disambiguate the block-root label against the destination's existing children (append a localized "(copy)" suffix, with a counter if still colliding).

## 4. Clipboard state + wiring

- [ ] 4.1 Add ephemeral `clipboard` state `{ mode:'cut'|'copy', scopeId } | null` in `App` (not persisted).
- [ ] 4.2 Add `cutScope`/`copyToClipboard`/`pasteInto(destId)`/`clearClipboard` handlers; `pasteInto` re-checks `canReceive` and scope existence at apply time, calls `moveScope` (cut) or `copyScope` (copy), and clears the clipboard after a cut paste (leaves a copy in place).
- [ ] 4.3 Thread `clipboard`, `moveScope`, and the clipboard handlers into `FolderView` and `FoldersScreen` props.

## 5. Column-browser drag-and-drop

- [ ] 5.1 Make `column-item` `draggable`; on `onDragStart` record the dragged scope id in state (mirroring the Add screen's priority-row pattern).
- [ ] 5.2 On folder items, `onDragOver` calls `preventDefault()` only when `canReceive(...,'move')` is true (and toggles a valid-target highlight class); `onDrop` calls `moveScope(draggedId, folderId)`.
- [ ] 5.3 Ensure dragging works across columns and that invalid targets neither highlight nor accept a drop (no-op).

## 6. Column-browser Cut/Copy/Paste affordances

- [ ] 6.1 Add per-item **Cut** and **Copy** actions to `column-item` (alongside the existing item actions).
- [ ] 6.2 Show a **Paste here** affordance on folder items only when `clipboard` is set and `canReceive(scopes, clipboard.scopeId, folderId, clipboard.mode)` is true; wire it to `pasteInto`.
- [ ] 6.3 Dim/mark the cut source while it is on the clipboard; clear the mark after paste or clipboard clear.

## 7. Folders management screen

- [ ] 7.1 Add the same Cut/Copy and Paste-here actions to `FoldersScreen` rows (folders as paste targets, valid scopes as sources), reusing the App handlers.

## 8. Styles & i18n

- [ ] 8.1 Add CSS in `prototype/index.html` for the valid drop-target highlight, the dimmed cut source, and the Paste-here affordance (theme-aware tokens).
- [ ] 8.2 Add i18n keys (Cut, Copy, Paste here, the "(copy)" suffix, and any invalid-target hint) to all 7 locales in `prototype/i18n.js` (en, pt-BR, pt-PT, es, ru, it, zh).

## 9. Verify & document

- [ ] 9.1 Manually verify each spec scenario: move folder+subtree (cards/progress preserved), move topic, copy folder/topic (fresh ids, fresh history, original unchanged), name-collision suffix, all validation rejections (root, cycle, topic target, same-parent), and that move and copy survive a reload.
- [ ] 9.2 Confirm `app.jsx` transforms cleanly (in-browser Babel) and the column browser still renders/scrolls correctly after deep nesting from moves.
- [ ] 9.3 Add a changelog entry in `prototype/changelog.js` for moving/copying folders and topics.
