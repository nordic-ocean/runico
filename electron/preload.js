// Runico desktop preload — the ONLY bridge between the renderer and the main
// process. Exposes a minimal, whitelisted API via contextBridge: no Node, no fs,
// and never the raw OpenRouter key. The save document and key-presence are read
// synchronously here so the renderer can hydrate them at first render.
const { contextBridge, ipcRenderer } = require('electron');

let initialData = {};
try { initialData = ipcRenderer.sendSync('runico:load') || {}; } catch (e) { initialData = {}; }

contextBridge.exposeInMainWorld('runico', {
  isDesktop: true,
  // The whole save document ({ "runico:v3:<key>": value, ... }) read once at start.
  initialData,
  // Presence/validity of the keychain key — never the key itself.
  keyStatusSync: () => { try { return !!ipcRenderer.sendSync('runico:keyStatus'); } catch (e) { return false; } },
  // Persist the save document (debounced by the renderer).
  saveData: (obj) => ipcRenderer.invoke('runico:save', obj),
  // Synchronous save used on window close/quit to flush the pending write before
  // the renderer is torn down (an async save would race teardown and be lost).
  saveDataSync: (obj) => { try { return ipcRenderer.sendSync('runico:saveSync', obj); } catch (e) { return { ok: false }; } },
  // Key management — the raw key goes IN to the keychain and never comes back.
  saveKey: (key) => ipcRenderer.invoke('runico:saveKey', key),
  clearKey: () => ipcRenderer.invoke('runico:clearKey'),
  // OpenRouter requests run in the main process (no CORS); the key is attached there.
  validate: () => ipcRenderer.invoke('runico:validate'),
  generate: (body) => ipcRenderer.invoke('runico:generate', body),
  // Export to / import from a user-chosen backup file (native dialogs in main).
  exportData: (data, name) => ipcRenderer.invoke('runico:export', { data, name }),
  importData: () => ipcRenderer.invoke('runico:import'),
});
