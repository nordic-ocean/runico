## Why

Deleting a folder, topic, or card is currently irreversible. `deleteFolder` removes the scope and its whole subtree and prunes the cards, drafts, history, and label overrides; `onDeleteCard` drops a card outright. A single mis-click — behind one confirm step — can destroy a topic with dozens of cards and its study history, with no way back. For a local-first app where the library is the user's own work, a recoverable delete is table stakes.

## What Changes

- Deleting a folder/topic (with its subtree + cards) or an individual card moves it to a **trash bin** instead of removing it permanently.
- A **Trash** view, opened from a button in the top navigation bar, lists trashed items newest-first with **Restore** and **Delete forever** per item, plus **Empty trash**.
- **Restore** returns an item to its original location, re-creating or falling back sensibly when the original parent is gone.
- Retention is **manual only** — nothing is auto-purged; items stay until the user restores them or empties the trash.
- The trash is **persisted** with the rest of the library and travels with export/import.

## Impact

- Affected specs: new capability `trash-bin`.
- Affected code: `app/app.jsx` (`deleteFolder`, `onDeleteCard`, new `trash` state + handlers, nav button, `TrashScreen`), `app/index.html` (nav button + Trash view styles), `app/i18n.js` (trash strings in all 7 locales), `app/changelog.js` (entry).
- No change to scheduling or grading: trashed items are removed from `scopes`/`sourceCards` at capture time, so they are already excluded from counts, decks, and study until restored.
