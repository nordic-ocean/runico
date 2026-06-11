## Why

Today the library persists invisibly — browser `localStorage`, or a save file in the desktop app's userData — and auto-restores on launch, so there is no explicit document the user owns or moves around. The product direction is a **file-based workspace**: the user opens a file to work, every change is written to that file, and the next launch starts by opening a file again. This makes the library a portable document the user controls and makes "where my data lives" explicit.

## What Changes

- On launch the app no longer auto-restores a library. It shows a **start screen** to **Open** an existing library file or create a **New** (empty) one.
- The opened file holds the whole library — folder/topic structure, cards, and embedded pictures (plus labels, study history, trash, drafts, and last session). App settings (theme, language, model, API key) stay local and are **not** part of the file.
- Every change — add/edit/delete/move a folder, topic, card, or picture — is **auto-saved** to the open file (debounced).
- Closing and reopening the app returns to the start screen; the user opens the file again. There is no silent auto-restore.
- **Desktop** uses native file dialogs and writes the chosen path. **Browser** uses the File System Access API (Chrome/Edge); Firefox/Safari fall back to upload-to-open and download-to-save, with auto-save degraded to a manual Save plus an unsaved-changes indicator.
- Existing auto-saved data is **not** migrated (start fresh); **New** starts empty.

## Impact

- Affected specs: new capability `file-workspace`.
- Affected code: `app/app.jsx` (library/settings persistence split, start-screen gate, open/new/save flow, auto-save), `electron/main.js` + `electron/preload.js` (open / new / save-to-path IPC), `app/index.html` (start screen + indicator styles), `app/i18n.js` (file/start strings ×7), `app/changelog.js`.
- Behavior change: library keys no longer persist to `localStorage` / the native store; app settings still do. Export/Import stays available for backups.
