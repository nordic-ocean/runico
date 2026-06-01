// Runico desktop (Electron) main process.
// Thin shell around the existing prototype renderer:
//  • serves prototype/ over a localhost http server (so the Babel-via-src renderer
//    and CDN scripts load exactly as in the browser),
//  • stores the OpenRouter key in the OS keychain (safeStorage) — the raw key
//    never crosses IPC to the renderer,
//  • makes OpenRouter validation + generation requests here (no CORS),
//  • persists all user data to a single user-owned save file (data.json).
const { app, BrowserWindow, ipcMain, safeStorage, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');

// Name the app "Runico" (the dev Electron binary is otherwise called "Electron"
// in the menu bar / About panel). Must be set before the app is ready.
app.setName('Runico');

const dataFile = () => path.join(app.getPath('userData'), 'data.json');
const keyFile = () => path.join(app.getPath('userData'), 'openrouter.key'); // safeStorage ciphertext

// ── Save document (text). Atomic write: temp file then rename, so an interrupted
// save never corrupts the good document. (Media-by-hash bundling is deferred.) ──
function loadDataSync() {
  try { return JSON.parse(fs.readFileSync(dataFile(), 'utf8')); }
  catch (e) { return {}; }            // missing/corrupt → empty library (seeded by the renderer)
}
function saveData(obj) {
  try {
    const tmp = dataFile() + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(obj));
    fs.renameSync(tmp, dataFile());
    return { ok: true };
  } catch (e) { return { ok: false, error: String(e && e.message || e) }; }
}

// ── Keychain-backed key storage. Ciphertext on disk; plaintext only in-memory
// here when a request is made. No plaintext fallback if encryption is unavailable. ──
function keyAvailable() { return safeStorage.isEncryptionAvailable(); }
function hasKey() { try { return fs.existsSync(keyFile()); } catch (e) { return false; } }
function readKey() {
  try {
    if (!hasKey() || !keyAvailable()) return '';
    return safeStorage.decryptString(fs.readFileSync(keyFile()));
  } catch (e) { return ''; }
}
function writeKey(key) {
  if (!keyAvailable()) return { ok: false, reason: 'unavailable' };
  try { fs.writeFileSync(keyFile(), safeStorage.encryptString(String(key || ''))); return { ok: true }; }
  catch (e) { return { ok: false, reason: 'write' }; }
}
function clearKey() {
  try { if (hasKey()) fs.unlinkSync(keyFile()); return { ok: true }; }
  catch (e) { return { ok: false }; }
}

// ── OpenRouter requests (main process → no browser CORS). The renderer sends only
// the request body; the key is attached here and never returned. ──
async function openRouterGenerate(body) {
  const key = readKey();
  if (!key) return { ok: false, status: 401 };
  try {
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + key,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://nordic-ocean.github.io/runico/',
        'X-Title': 'Runico',
      },
      body: JSON.stringify(body || {}),
    });
    if (!r.ok) return { ok: false, status: r.status };
    const data = await r.json().catch(() => null);
    const content = (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
    return { ok: true, status: 200, content };
  } catch (e) { return { ok: false, error: 'network' }; }
}
// Export the library to a user-chosen backup file; import reads one back (the
// renderer confirms + applies, so import only READS here, never overwrites).
async function exportData(data) {
  const r = await dialog.showSaveDialog(win || undefined, {
    title: 'Save Runico backup', defaultPath: 'runico-backup.json',
    filters: [{ name: 'Runico backup', extensions: ['json'] }],
  });
  if (r.canceled || !r.filePath) return { canceled: true };
  try { fs.writeFileSync(r.filePath, JSON.stringify(data || {})); return { ok: true, path: r.filePath }; }
  catch (e) { return { ok: false, error: String(e && e.message || e) }; }
}
async function importData() {
  const r = await dialog.showOpenDialog(win || undefined, {
    title: 'Load Runico backup', properties: ['openFile'],
    filters: [{ name: 'Runico backup', extensions: ['json'] }],
  });
  if (r.canceled || !r.filePaths || !r.filePaths[0]) return { canceled: true };
  try {
    const data = JSON.parse(fs.readFileSync(r.filePaths[0], 'utf8'));
    if (!data || typeof data !== 'object' || Array.isArray(data)) return { ok: false, error: 'invalid' };
    return { ok: true, data };
  } catch (e) { return { ok: false, error: 'invalid' }; }
}

async function openRouterValidate() {
  const key = readKey();
  if (!key) return 'invalid';
  try {
    const r = await fetch('https://openrouter.ai/api/v1/key', { headers: { 'Authorization': 'Bearer ' + key } });
    return r.ok ? 'valid' : ((r.status === 401 || r.status === 403) ? 'invalid' : 'untested');
  } catch (e) { return 'untested'; }
}

// ── Local static server for prototype/ ──
function startServer() {
  const root = path.join(__dirname, '..', 'prototype');
  const MIME = {
    '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8', '.jsx': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
    '.woff': 'font/woff', '.woff2': 'font/woff2',
  };
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent((req.url || '/').split('?')[0]);
    if (p === '/' || p === '') p = '/index.html';
    const file = path.normalize(path.join(root, p));
    if (!file.startsWith(root)) { res.writeHead(403); res.end('Forbidden'); return; }
    fs.readFile(file, (err, buf) => {
      if (err) { res.writeHead(404); res.end('Not found'); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
      res.end(buf);
    });
  });
  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server.address().port));
  });
}

// ── IPC surface (mirrors preload.js) ──
ipcMain.on('runico:load', (e) => { e.returnValue = loadDataSync(); });           // sync: read at first render
ipcMain.on('runico:keyStatus', (e) => { e.returnValue = hasKey() && keyAvailable(); });
ipcMain.on('runico:saveSync', (e, obj) => { e.returnValue = saveData(obj); });   // sync: flush-on-close before teardown
ipcMain.handle('runico:save', (e, obj) => saveData(obj));
ipcMain.handle('runico:saveKey', (e, key) => writeKey(key));
ipcMain.handle('runico:clearKey', () => clearKey());
ipcMain.handle('runico:validate', () => openRouterValidate());
ipcMain.handle('runico:generate', (e, body) => openRouterGenerate(body));
ipcMain.handle('runico:export', (e, data) => exportData(data));
ipcMain.handle('runico:import', () => importData());

const ICON = path.join(__dirname, '..', 'prototype', 'assets', 'runico-ring.png');

let win = null;
async function createWindow() {
  let port;
  try { port = await startServer(); }
  catch (e) { console.error('Runico: failed to start local server', e); app.quit(); return; }
  win = new BrowserWindow({
    width: 1200, height: 860, minWidth: 880, minHeight: 600,
    backgroundColor: '#FBFCFD',
    title: 'Runico',
    icon: ICON,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  // Open external links in the user's browser, not inside the app window.
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  win.loadURL('http://127.0.0.1:' + port + '/index.html');
  win.on('closed', () => { win = null; });
}

app.whenReady().then(() => {
  // Use the Runico ring as the dock icon (macOS dev run shows the default Electron
  // icon otherwise); packaged builds use build.icon from package.json.
  if (process.platform === 'darwin' && app.dock) { try { app.dock.setIcon(ICON); } catch (e) {} }
  try { app.setAboutPanelOptions({ applicationName: 'Runico', applicationVersion: app.getVersion() }); } catch (e) {}
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
