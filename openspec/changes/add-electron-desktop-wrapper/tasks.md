<!-- Implemented: a thin Electron shell (electron/main.js + electron/preload.js +
     root package.json) around the existing prototype renderer. The renderer is
     served over a localhost http server (the Babel-via-src + CDN setup can't load
     over file://). A single native seam in prototype/app.jsx (RUNICO/IS_DESKTOP)
     routes the key to the OS keychain, OpenRouter requests to the main process
     (no CORS), and persistence to a local data.json — falling back to localStorage
     + fetch in the browser. Verification of a running window / live request / packaged
     build is the user's gate (can't run Electron headlessly here).
     DEFERRED to a follow-up: 6.2 media-by-hash bundle (images are currently embedded
     base64 in data.json — works, but rewrites the whole file on save), 6.4 export/import
     zip bundle, vendoring React/Babel for offline launch (currently needs internet for
     the CDN libs), and 8.x signing/notarization/sync. -->

## 1. Electron scaffold

- [x] 1.1 Add `package.json` with `electron` and a builder/packager dev dependency, plus `dev` and `build` scripts
- [x] 1.2 Create `main.js` that creates a `BrowserWindow` (`contextIsolation: true`, `nodeIntegration: false`) and loads the `prototype/` app
- [x] 1.3 Add app lifecycle handling (quit-on-close per platform, basic application menu)
- [ ] 1.4 Verify `npm run dev` launches a window showing the existing Runico UI

## 2. IPC surface (preload)

- [x] 2.1 Create `preload.js` exposing a minimal `contextBridge` API: `saveKey`, `clearKey`, `keyStatus`, `validate`, `generate`, plus save-document channels `loadData`, `saveData` (`saveMedia`/`loadMedia`/`exportBundle`/`importBundle` deferred with 6.2/6.4)
- [x] 2.2 Ensure no Node internals, no `fs`, and no raw key are ever exposed to the renderer

## 3. Keychain-backed storage (main)

- [x] 3.1 Implement key persistence using `safeStorage.encryptString` / `decryptString`, storing ciphertext under `app.getPath('userData')`
- [x] 3.2 Guard with `safeStorage.isEncryptionAvailable()`; if unavailable, warn and refuse to persist (no plaintext fallback)
- [x] 3.3 Implement `saveKey`, `clearKey`, and a `keyStatus` that returns presence/validity only — never the raw key

## 4. Renderer credential adapter

- [x] 4.1 Update the credential seam to detect the Electron preload API and route get/set/clear through IPC when present
- [x] 4.2 Fall back to the existing web-storage backend in a plain browser
- [x] 4.3 Confirm Settings and generation callers are unchanged (same store contract)

## 5. Main-process requests

- [x] 5.1 Move the OpenRouter validation request into the main process behind `validate` IPC
- [x] 5.2 Move the card-generation request into the main process behind `generate` IPC, attaching the keychain key there
- [x] 5.3 Return only results/errors to the renderer; verify the key never crosses IPC to the renderer
- [ ] 5.4 Verify a request that the browser would block by CORS succeeds in the desktop app

## 6. Local save file (main + adapter)

- [x] 6.1 Implement the save-document layer in the main process: load/save `data.json` (text) under `app.getPath('userData')`
- [ ] 6.2 Store images as binary files in a `media/` bundle, referenced by hash; de-duplicate identical images; never base64-embed in `data.json` (DEFERRED — currently embedded base64)
- [x] 6.3 Auto-save (debounced) using temp-file-then-rename atomic writes
- [ ] 6.4 Implement export (zip the document) and import (restore full state) (DEFERRED)
- [x] 6.5 Repoint the renderer's `usePersistentState` seam through the save-document layer (IPC in Electron) instead of web storage
- [x] 6.6 Implement the browser fallback: durable web storage (localStorage) + (manual file copy for now)
- [x] 6.7 Seed an empty/default library + fresh document on first run when none exists
- [x] 6.8 Interrupted write leaves the prior document intact (atomic rename); unreadable doc → empty library (seeded)

## 7. Web build parity & verification

- [x] 7.1 The static/GitHub Pages build still runs in the browser with the localStorage fallback (renderer unchanged for the browser path)
- [ ] 7.2 Verify desktop: save key → keychain, restart → key persists, clear → key removed
- [ ] 7.3 Verify end-to-end card generation in the desktop app with no CORS error
- [ ] 7.4 Verify save file: edits/history/settings persist across a restart
- [ ] 7.5 Verify export → fresh install → import restores the full state (after 6.4 lands)
- [ ] 7.6 Verify browser data survives closing and reopening the tab
- [ ] 7.7 Produce a local packaged build for the current platform (`npm run build`)

## 8. Deferred (future change)

- [ ] 8.1 Document code signing / notarization and installer distribution as a follow-up (not in this change)
- [ ] 8.2 Cloud sync across devices (out of scope; users can sync the save file themselves)
- [ ] 8.3 Vendor React + Babel locally so the desktop app launches offline (currently loads them from the CDN)
