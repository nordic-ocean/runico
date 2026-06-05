## 1. Library / settings split + file format

- [x] 1.1 Split persisted keys into LIBRARY (`scopes`, `sourceCards`, `scopeLabels`, `folderSort`, `history`, `trash`, `pendingDrafts`, `sources`, `lastSession`) and SETTINGS (`settings`, `genModel`, `genDraftBackup`, OpenRouter key). Settings keep `usePersistentState`; library keys become in-memory state that no longer writes to localStorage / the native store.
- [x] 1.2 Add serialize/parse for the `{ format:'runico-library', version:1, library:{...} }` envelope; parse tolerates missing keys and rejects payloads with no `library` object. Define the empty-library value (root-only `scopes`, everything else empty).

## 2. Current-file state + start-screen gate

- [x] 2.1 Add in-memory `currentFile` (`{ kind, name, path?, handle? }`) and `libraryLoaded` state (not persisted).
- [x] 2.2 When `!libraryLoaded`, render a `StartScreen` (Open / New, plus Open-recent on desktop) instead of the browser; do not read library keys at boot.
- [x] 2.3 On open/new, load the library bucket into state, set `currentFile`, and flip `libraryLoaded`.

## 3. Desktop file I/O

- [x] 3.1 Add main + preload IPC: `openLibrary` (open dialog → {path,name,data}), `newLibrary` (save dialog → write empty → {path,name}), `saveLibrary(path,data)`, `saveLibrarySync(path,data)`, `recentLibraries()`.
- [x] 3.2 Stop riding the library in the native store; keep the native store for SETTINGS only.

## 4. Browser file I/O

- [x] 4.1 File System Access path: `showOpenFilePicker` / `showSaveFilePicker`, keep the handle on `currentFile`, read via `getFile`, write via `createWritable`.
- [x] 4.2 Fallback (no FSA): Open via a hidden file input (upload + parse); New in-memory; Save via download. Feature-detect to choose the path.

## 5. Auto-save + indicator

- [x] 5.1 Debounced (~600ms) effect on the library bucket → serialize + write the open file (desktop path / FSA handle); synchronous flush on close.
- [x] 5.2 Fallback only: track a `dirty` flag, show an unsaved-changes indicator + manual Save, and warn on `beforeunload` while dirty.

## 6. Styles & i18n

- [x] 6.1 Add CSS in `index.html` for the start screen and the saving/unsaved indicator (theme-aware).
- [x] 6.2 Add file/start i18n keys (open, new, start-screen copy, current-file name, saving/saved/unsaved, invalid-file, close-with-unsaved warning) to all 7 locales.

## 7. Verify & document

- [x] 7.1 Verify each scenario: launch → start screen; New → empty library; Open → folders/cards/pictures load; a change writes the file; reopen shows the changes; settings persist across files; invalid file rejected; both FSA and fallback browser paths.
- [x] 7.2 Confirm `app.jsx` transforms and the headless jsdom SSR smoke renders the start screen.
- [x] 7.3 Add a changelog entry in `prototype/changelog.js`.
