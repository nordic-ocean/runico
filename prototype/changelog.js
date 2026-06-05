// ── Runico changelog + app description ───────────────────────────────────────
// Static, authored content (plain JS, loaded before app.jsx — like i18n.js).
// Shown on the About page, reachable from the version badge (bottom-left) and
// from Settings → About.
//
// To cut a release: add an entry to the TOP of RUNICO_CHANGELOG (newest first).
// Each change's `type` must be one of: 'feature' | 'fix' | 'enhancement' | 'security'.
// Keep the newest release's `version` in sync with package.json "version" and the
// APP_VERSION constant in app.jsx.
//
// This is product content, not interface chrome, so it is authored in English and
// is not run through the i18n layer (mirroring how card/source content is handled).

window.RUNICO_ABOUT = {
  tagline: 'Magical runes for your learning.',
  description: [
    "Runico turns anything you're learning into flashcards and helps you practice them — recall the answer, reveal it, then Continue or Pause, with no grading scales to fuss over.",
    "Your library is organized into subjects, folders, and topics you can navigate in a column browser. Per-session accuracy charts show whether a topic is trending up — reporting only, never grading. Drop in a page, screenshot, or notes and Runico drafts cards for you to review, including image-occlusion cards that mask regions of a figure.",
    "On the desktop, all your data lives in a local save file you own, and your OpenRouter key is stored in the operating-system keychain — never in the page.",
  ],
};

window.RUNICO_CHANGELOG = [
  {
    version: '1.0.0',
    date: '2026-06-05',
    summary: 'The first stable release — the full Runico feature set, working with files you own, as a local-first desktop app and a web build.',
    entries: [
      { type: 'feature', text: 'Study sessions with a reveal-then-Continue/Pause flow and no grading scales.' },
      { type: 'feature', text: 'Pick up where you left off: the home view remembers your last session and the cards remaining.' },
      { type: 'feature', text: 'Column browser for navigating subjects, folders, and topics, then practicing any one of them.' },
      { type: 'feature', text: 'Reorganize folders and topics by drag-and-drop or cut/copy-and-paste — move a folder with everything inside, or copy it into another folder.' },
      { type: 'feature', text: 'Trash bin: deleting a folder, topic, or card moves it to a recoverable trash, where you can restore it to its place, delete it forever, or empty the trash.' },
      { type: 'feature', text: 'Track your progress with per-session accuracy charts and a drill-down to any single card.' },
      { type: 'feature', text: 'Generate cards from pasted text, screenshots, or notes via OpenRouter, then review the drafts before keeping them.' },
      { type: 'feature', text: 'Image-occlusion cards: draw, drag, and resize masks over a figure, and re-crop from the full original image.' },
      { type: 'feature', text: '“Use my own AI”: copy the generation prompt, paste the result back, and Runico builds the cards — including image-occlusion cards with the masks placed for you.' },
      { type: 'feature', text: 'A per-model cost estimate (cards per $1) when choosing a generation model.' },
      { type: 'feature', text: 'See-the-source view that shows the original material with the studied term highlighted.' },
      { type: 'feature', text: 'Work in files you own: open a library file to start, or create a new one — your folders, cards, and pictures all live in that file, and every change is saved to it automatically.' },
      { type: 'feature', text: 'Light, Warm, and Dark canvas themes and a per-language interface in seven languages.' },
      { type: 'feature', text: 'Desktop app for macOS, Windows, and Linux that runs fully offline.' },
      { type: 'feature', text: 'On the desktop your OpenRouter key is stored in the OS keychain and never reaches the page; generation requests run in the main process, free of browser CORS limits.' },
      { type: 'feature', text: 'Keyboard-navigable with a visible focus ring and screen-reader labels, and it honours your reduced-motion setting.' },
      { type: 'feature', text: 'About page with these release notes, opened from the version badge or Settings → About.' },
    ],
  },
];
