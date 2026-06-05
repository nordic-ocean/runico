// Dev-only convenience: make the macOS dock show "Runico" instead of "Electron"
// when running `npm start` / `npm run dev`.
//
// In a dev run the dock tooltip + app-menu name come from the Electron binary's
// own bundle Info.plist (CFBundleName = "Electron"); app.setName() cannot change
// that. The PACKAGED build (npm run build) already uses "Runico". This patches the
// locally-installed dev bundle's display name in place. It is best-effort and
// idempotent (re-applied each start), macOS-only, and a no-op everywhere else.
// node_modules is gitignored, so this only ever touches the local install.
const fs = require('fs');
const path = require('path');

if (process.platform !== 'darwin') process.exit(0);

try {
  const plist = path.join(
    __dirname, '..', 'node_modules', 'electron', 'dist',
    'Electron.app', 'Contents', 'Info.plist'
  );
  if (!fs.existsSync(plist)) process.exit(0);
  let xml = fs.readFileSync(plist, 'utf8');
  let changed = false;
  // Only rewrite the DISPLAY name keys — never CFBundleExecutable (the binary is
  // still "Electron"); changing that would break launch.
  for (const key of ['CFBundleName', 'CFBundleDisplayName']) {
    const re = new RegExp('(<key>' + key + '</key>\\s*<string>)[^<]*(</string>)');
    if (re.test(xml)) { xml = xml.replace(re, '$1Runico$2'); changed = true; }
  }
  if (changed) fs.writeFileSync(plist, xml);
} catch (e) { /* best-effort: dev dock name just stays "Electron" */ }
