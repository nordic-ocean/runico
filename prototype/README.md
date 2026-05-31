# Runico — interactive prototype

A runnable, mock-data prototype of the Runico flashcard app, recreated from the
Claude Design handoff. All data is seeded from mock constants and **persisted to
`sessionStorage`**, so your changes — new folders, edited/added cards, approved AI
drafts, theme/language, and session progress — survive reloads within the tab, and
reset when you close it.

## Run it

It uses in-browser Babel (no build step), so it must be served over HTTP (opening it
via `file://` won't work — the browser blocks loading `app.jsx`). From the repo root:

```bash
python3 -m http.server 8000 --directory prototype
# then open http://localhost:8000/
```

or with Node:

```bash
npx serve prototype
```

First load needs network access: it pulls React 18, ReactDOM, and Babel from a CDN and
the Inter font from Google Fonts.

## What persists

State is mirrored to `sessionStorage` under the `runico:v1:` prefix:

| Key | Holds |
|-----|-------|
| `runico:v1:scopes` | the folder/topic tree (create / rename / delete) |
| `runico:v1:sourceCards` | cards per topic (add / edit / delete / approved drafts) |
| `runico:v1:scopeLabels` | source-name overrides |
| `runico:v1:lastSession` | quick-resume session state |
| `runico:v1:settings` | theme + language (from the Settings screen) |

To reset to the seeded mock data: clear the tab's session storage (DevTools →
Application → Session Storage) or open a fresh tab.

## Files

- `index.html` — entry point: the design-tokens link + the full component `<style>` block, then mounts `app.jsx`.
- `app.jsx` — the whole app: mock data, screens, and the `App` state machine (plus the added `usePersistentState` hook).
- `colors_and_type.css` — design tokens (Inter, color scales, spacing, radii, shadows).
- `assets/` — the Runico logo art. (The cell figure is inline SVG inside `app.jsx`.)

## Notes vs. the handoff

- The prototype-only **Tweaks** panel (theme/size, wired to the design host via `postMessage`) was removed — theme and language live on the in-app **Settings** screen, exactly as the handoff intended for the shipped app.
- Mock data + in-browser Babel are for prototyping only; a production build would compile JSX ahead of time and swap the mock constants for real API calls.
