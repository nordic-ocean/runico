## Context

Persistence today is `usePersistentState(key, initial)`: browser writes each key to `localStorage` under `runico:v3:<key>`; desktop mirrors into an in-memory `NATIVE_STORE` flushed to a userData file via the preload `runico` API (`saveData`/`saveDataSync`, `initialData` read once at start). Keys in use: `scopes`, `sourceCards` (cards, with base64 images), `scopeLabels`, `folderSort`, `history`, `trash`, `pendingDrafts`, `sources`, `lastSession`, plus settings `settings` (theme/language/size), `genModel`, and the transient `genDraftBackup`. Export/Import already round-trips a JSON dump through native dialogs (`runico:export` / `runico:import`).

## Goals / Non-Goals

- **Goals:** a start screen that gates on opening/creating a file; the file holds the full library incl. pictures; auto-save every change to the open file; reopen requires loading again; works on desktop (native paths) and browser (File System Access API) with a graceful fallback.
- **Non-goals:** migrating existing auto-saved data (start fresh); multi-file/merge; cloud sync; persisting a file handle across sessions (the user re-opens each launch).

## Decisions

### Library vs. settings split
Two buckets:
- **Library** (lives in the file): `scopes`, `sourceCards`, `scopeLabels`, `folderSort`, `history`, `trash`, `pendingDrafts`, `sources`, `lastSession`.
- **App settings** (stay local, independent of the open file): `settings` (theme/language/size), `genModel`, `genDraftBackup`, and the OpenRouter key (keychain/localStorage). These keep `usePersistentState` (localStorage / native store).

Library keys stop auto-persisting to localStorage/native. They become plain in-memory state seeded from the opened file; a single debounced effect serializes them and writes the file on change.

### File format
A self-describing envelope:
`{ "format": "runico-library", "version": 1, "library": { scopes, sourceCards, scopeLabels, folderSort, history, trash, pendingDrafts, sources, lastSession } }`.
Pictures are the existing base64 image fields inside `sourceCards`, so they travel in the file automatically. Loading tolerates a missing key (defaults to its empty value) and rejects a payload without a `library` object.

### Current-file state + start gate
`currentFile` (in-memory only): `{ kind: 'desktop' | 'fsapi' | 'upload', name, path?, handle? }`. `libraryLoaded` boolean. When `!libraryLoaded`, the app renders `StartScreen` (Open / New, plus Open-recent on desktop) instead of the browser; no library keys are read at boot.

### Open / New
- **Desktop:** `runico.openLibrary()` → native open dialog → `{ path, name, data }`; `runico.newLibrary()` → save dialog → writes an empty library → `{ path, name }`. Library state is set from `data` (or empty); `currentFile` records the path.
- **Browser (FSA):** `showOpenFilePicker()` → handle → `getFile()` → parse; `showSaveFilePicker()` → handle → write empty. Keep the handle on `currentFile` for auto-save.
- **Browser (fallback, no FSA):** Open = hidden file input (upload, parse); New = in-memory empty. No handle ⇒ auto-save can't write silently.
- **Empty library:** `scopes = [{ id:'all', label:'Everything', parent:null, depth:0, isLeaf:false }]`, everything else empty — so the column browser renders its empty-state guidance.

### Auto-save
A debounced (~600ms) effect watches the library bucket; on change it serializes the envelope and writes the open file:
- **Desktop:** `runico.saveLibrary(path, envelope)` (fs write in main).
- **Browser FSA:** `handle.createWritable()` → write → close.
- **Fallback (upload):** cannot write silently — set a `dirty` flag, show an unsaved-changes indicator + a manual **Save** (download), and warn on `beforeunload` while dirty.
A synchronous flush on close (desktop `saveLibrarySync`; browser FSA best-effort) avoids losing the last change.

### Electron IPC additions (preload + main)
`runico.openLibrary()` (`runico:openLibrary`), `runico.newLibrary()` (`runico:newLibrary`), `runico.saveLibrary(path, data)` (`runico:saveLibrary`), `runico.saveLibrarySync(path, data)`, and `runico.recentLibraries()` for the start screen. Settings keep using the existing native store; the library no longer rides in it.

### Migration / settings
No migration: existing `runico:v3:*` library keys are ignored at boot (the start screen always shows). Settings keys continue to load/persist as today, so theme/language/key are preserved across files and sessions.
