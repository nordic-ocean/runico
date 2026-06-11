# Runico — the app

This directory is the Runico app itself: a build-free React page that runs the
whole product. It is served as-is in two ways:

- **Browser build** — hosted on GitHub Pages ([open it](https://nordic-ocean.github.io/runico/app/))
  or served locally; the library lives in a `.runico` file the user opens or
  creates, and preferences persist to `localStorage`.
- **Desktop build** — the Electron shell (`electron/`) serves this same directory
  over a localhost server and swaps in native backends (OS keychain for the
  OpenRouter key, native auto-save for the `.runico` file) through the single
  `window.runico` seam in `app.jsx`.

## Run it

JSX is compiled in the browser by Babel (no build step), so the page must be
served over HTTP — opening it via `file://` won't work (the browser blocks
loading `app.jsx`). From the repo root:

```bash
python3 -m http.server 8000 --directory app
# then open http://localhost:8000/
```

or with Node:

```bash
npx serve app
```

React, ReactDOM, and Babel are vendored in `vendor/`, so no CDN is needed; only
the Inter font is fetched from Google Fonts and falls back to system fonts when
offline.

## What persists

The library — the folder/topic tree, cards, study history, trash, pending AI
drafts, and your last session — lives in the `.runico` file you open or create
on the Start screen. In Chromium browsers it auto-saves in place through the
File System Access API; in browsers without it, saving downloads the file. To
start over, create a **New library** from the Start screen.

App preferences — theme, language, generation model, and the OpenRouter key —
stay in the browser, in `localStorage` under the `runico:v3:` prefix (along
with a transient backup of an in-flight card-generation draft).

In the desktop build the `.runico` file auto-saves natively, preferences live
in an app-managed `data.json`, and the OpenRouter key is encrypted via the OS
keychain.

## Files

- `index.html` — entry point: design-tokens link, the full component `<style>` block, vendored scripts, then mounts `app.jsx`.
- `app.jsx` — the whole app: seed data, screens, persistence, and the `App` state machine.
- `colors_and_type.css` — design tokens (Inter, color scales, spacing, radii, shadows).
- `i18n.js` — interface translations (7 languages) and the tiny i18n engine.
- `changelog.js` — in-app release notes.
- `assets/` — the Runico logo art. (The cell figure is inline SVG inside `app.jsx`.)
- `vendor/` — pinned production React 18.3.1 + @babel/standalone, vendored for offline use.

## History

This code began as the design-handoff prototype (it lived at `prototype/` until
v1.0) and grew into the shipped renderer. The prototype-only **Tweaks** panel
from the handoff was removed — theme and language live on the in-app
**Settings** screen.
