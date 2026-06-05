> Implementation note: `FoldersScreen` is defined but **not rendered anywhere** in the app — the column-browser `FolderView` replaced it. So the reorganization is implemented on the live column browser only; task 7 and the spec's "folders screen" scenario are marked N/A (see spec update). The move/copy semantics were unit-tested headlessly against the real functions (all scenarios pass).

## 1. Core scope helpers (validation, subtree, depth/order)

- [x] 1.1 Add `scopeSubtreeRange(scopes, id)` returning the contiguous `[start, end)` block of the scope + its descendants in the ordered array (plus `insertAfterSubtree`).
- [x] 1.2 Add `isScopeDescendant(scopes, ancestorId, scopeId)` that walks `scopeId`'s parent chain to detect cycles.
- [x] 1.3 Add `canReceiveScope(scopes, srcId, destId, mode)` enforcing: dest exists & `!dest.isLeaf`; `destId !== srcId`; dest not inside src's subtree; src is not root; and (move only) `destId !== src.parent`.
- [x] 1.4 Depth recompute via a single `delta` applied across the block (root → `dest.depth + 1`), in `applyScopeMove`/`applyScopeCopy`.

## 2. Move (re-parent) handler

- [x] 2.1 Implement `applyScopeMove` (pure) + `moveScope(scopeId, destId)` in `App`: validate, re-parent, recompute depths, re-splice the block after the destination's last descendant; no-op when invalid.
- [x] 2.2 Ids untouched on move, so `sourceCards`/`history`/`scopeLabelOverrides` stay correctly keyed (verified by unit test).
- [ ] 2.3 Auto-select/reveal the moved block root after a move — deferred (nice-to-have; move works, browser doesn't auto-navigate yet).

## 3. Copy (duplicate) handler

- [x] 3.1 Implement `applyScopeCopy` (pure) + `copyScope`: old→new id map over the subtree (ids via `genId`), remapped `parent`, recomputed `depth`, inserted under the destination.
- [x] 3.2 Clone each cloned leaf's `sourceCards` with fresh card ids; copy `scopeLabelOverrides`; do NOT copy `history`/`pendingDrafts`; set cloned leaf `total`.
- [x] 3.3 Disambiguate the block-root label against the destination's children (localized `(copy)` suffix + counter).

## 4. Clipboard state + wiring

- [x] 4.1 Ephemeral `clipboard` state `{ mode, scopeId } | null` in `App` (plain `useState`, not persisted).
- [x] 4.2 `cutScope`/`copyScopeToClipboard`/`pasteScopeInto`/clear handlers; `pasteScopeInto` re-checks `canReceiveScope` + existence at apply time, moves (cut) or copies (copy), and clears the clipboard after ANY successful paste (one-shot) so every paste affordance disappears.
- [x] 4.3 Threaded `clipboard`, `canReceive`, move + clipboard handlers into `FolderView`. (FoldersScreen N/A — not rendered.)

## 5. Column-browser drag-and-drop

- [x] 5.1 `column-item` is `draggable`; `onDragStart` records the dragged id in state.
- [x] 5.2 Folder items: `onDragOver` `preventDefault()`s only when `canReceive(...,'move')`, toggling an `is-drop-target` highlight; `onDrop` calls `moveScope`.
- [x] 5.3 Works across columns; invalid targets neither highlight nor accept a drop (no-op).

## 6. Column-browser Cut/Copy/Paste affordances

- [x] 6.1 Per-item **Cut** and **Copy** actions in `column-item-actions`.
- [x] 6.2 **Paste here** on folder items (when valid) and in each column footer (paste into that column's folder); a header banner shows the clipboard item + Cancel.
- [x] 6.3 Cut source dimmed (`is-cut`); cleared after paste or Cancel.

## 7. Folders management screen

- [~] 7.1 N/A — `FoldersScreen` is not rendered in the current app (replaced by the column browser). No live surface to wire.

## 8. Styles & i18n

- [x] 8.1 CSS in `prototype/index.html`: drop-target highlight, dimmed cut source, paste affordance, clipboard banner (theme-aware).
- [x] 8.2 i18n keys (cut/copy/pasteHere/titles/copySuffix/clipboard banners) added to all 7 locales in `prototype/i18n.js`.

## 9. Verify & document

- [x] 9.1 Manual UI verification in the running app (move folder+subtree, move topic, copy folder/topic with fresh ids + fresh history + original unchanged, name-collision suffix, validation rejections) — confirmed; logic also covered by headless unit tests.
- [x] 9.2 `app.jsx` transforms cleanly (in-browser Babel verified); column browser renders/scrolls correctly.
- [x] 9.3 Changelog entry added in `prototype/changelog.js`.

## 10. Refinements (added during review)

- [x] 10.1 The ⋯ action menu (Rename/Cut/Copy/Delete + Cancel copy) is rendered at the browser root, fixed-positioned from the button's rect, so a row's cut-dimming / scroll-clipping / stacking can't affect it.
- [x] 10.2 Per-folder display sort — Name (A–Z) / Name (Z–A) / Most cards / Manual — with the control inside each card, stored as a `{folderId: mode}` map, persisted, and display-only (stored order unchanged).
- [x] 10.3 Each column card is itself a drop target: dropping a scope on the card body moves it into that card's folder; folder rows remain the more specific target (via `stopPropagation`); the card highlights while valid.
