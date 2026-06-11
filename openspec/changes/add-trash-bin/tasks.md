## 1. Trash state + capture

- [x] 1.1 Add a persisted `trash` state (`usePersistentState('trash', () => [])`), newest-first, with a `genId('trash')` id + `deletedAt` timestamp per entry.
- [x] 1.2 In `deleteFolder`, before pruning, snapshot the `removed` scope objects + their `sourceCards` + `scopeLabelOverrides` (NOT `history`/`pendingDrafts`) into a `kind:'scope'` entry (`label` = deleted root label, `originParent` = root's `parent`); prepend it to `trash`; then prune as today.
- [x] 1.3 In `onDeleteCard`, snapshot the card + `sourceId` + source label into a `kind:'card'` entry before removing it.

## 2. Restore + permanent delete

- [x] 2.1 `restoreFromTrash(trashId)` — scope entry: re-insert the snapshotted scopes (ids/depths/order preserved) and merge cards/labelOverrides; insert after `originParent`'s subtree if it exists, else under the nearest surviving ancestor / root (recompute depths); remint any colliding id (and fix child `parent` refs); drop the entry.
- [x] 2.2 `restoreFromTrash` — card entry: re-add the card to `sourceCards[sourceId]` and bump `total` when the source exists; otherwise surface a notice and keep it in the trash.
- [x] 2.3 `deleteForever(trashId)` removes one entry; `emptyTrash()` clears all (behind a confirm).

## 3. UI — nav button + Trash screen

- [x] 3.1 Add a `trash` glyph to `Glyph` and a `nav-btn` in `nav-right` (left of Settings) that opens `screen === 'trash'`, showing the trash count when > 0.
- [x] 3.2 Build `TrashScreen`: newest-first list with label / kind tag / card count / relative deleted-time, per-row **Restore** + **Delete forever**, an **Empty trash** header action (confirm), and an empty state.
- [x] 3.3 Wire the screen into the App render switch and the screen-list condition (and clear any transient nav state on open, mirroring the other nav buttons).

## 4. Styles & i18n

- [x] 4.1 Add CSS in `app/index.html` for the nav trash button (+ count badge) and the Trash list / rows / empty state (theme-aware, AA contrast).
- [x] 4.2 Add trash i18n keys (nav button title, screen title, Restore, Delete forever, Empty trash + confirm, folder/topic/card kind labels, relative-time, restore-failed notice, empty state) to all 7 locales (en, pt-BR, pt-PT, es, ru, it, zh).

## 5. Verify & document

- [x] 5.1 Verify each spec scenario: delete folder/topic/card → appears in trash and is gone from the browser/counts/decks; restore → reappears in place (and under the nearest surviving ancestor when the parent is gone); delete-forever / empty; trash survives a reload and round-trips through export/import.
- [x] 5.2 Confirm `app.jsx` transforms cleanly (in-browser Babel) and the headless jsdom SSR smoke still renders the app.
- [x] 5.3 Add a changelog entry in `app/changelog.js` for the trash bin.
