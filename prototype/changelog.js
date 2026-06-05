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
    version: '1.1.0',
    date: '2026-06-05',
    summary: 'Adds a trash bin so deleted folders, topics, and cards can be recovered.',
    entries: [
      { type: 'feature', text: 'Deleting a folder, topic, or card now moves it to a trash bin instead of removing it for good.' },
      { type: 'feature', text: 'Open the trash from the toolbar to restore an item to where it was, delete it forever, or empty the trash.' },
    ],
  },
  {
    version: '1.0.0',
    date: '2026-06-05',
    summary: 'The first stable release — the full Runico feature set as a local-first desktop app and a web build.',
    entries: [
      { type: 'feature', text: 'Study sessions with a reveal-then-Continue/Pause flow and no grading scales.' },
      { type: 'feature', text: 'Pick up where you left off: the home view remembers your last session and cards remaining.' },
      { type: 'feature', text: 'Column browser for navigating subjects, folders, and topics, then practicing any topic.' },
      { type: 'feature', text: 'Reorganize folders and topics: drag-and-drop, or cut/copy and paste, to move a folder (with everything inside) or copy it into another folder.' },
      { type: 'feature', text: 'Track your progress with per-session accuracy charts and a drill-down to any single card.' },
      { type: 'feature', text: 'Generate cards from pasted text, screenshots, or notes via OpenRouter, then review the drafts.' },
      { type: 'feature', text: 'Image-occlusion cards: draw, drag, and resize masks over a figure.' },
      { type: 'feature', text: 'See-the-source view that shows the original material with the studied term highlighted.' },
      { type: 'feature', text: 'Light, Warm, and Dark canvas themes plus a per-language interface.' },
      { type: 'feature', text: 'Desktop app for macOS, Windows, and Linux, wrapping the app via Electron.' },
      { type: 'feature', text: 'About page with this changelog, opened from the version badge or Settings → About.' },
      { type: 'security', text: 'On the desktop, your OpenRouter key is stored in the OS keychain and never reaches the renderer.' },
      { type: 'security', text: 'OpenRouter requests run in the main process, so the raw key never crosses into the page and is free of browser CORS limits.' },
      { type: 'enhancement', text: 'All your data persists to a single local save file you own, with export/import backups.' },
      { type: 'enhancement', text: 'A per-model cost estimate (cards per $1) is shown when choosing a generation model.' },
      { type: 'enhancement', text: 'Re-crop an image-occlusion card from the full original image.' },
      { type: 'enhancement', text: '“Use my own AI” can now also build image-occlusion cards: copy the figure prompt, paste back the result, and the masks are placed for you.' },
      { type: 'fix', text: 'Image-occlusion masks now land correctly when the AI returns coordinates in pixels or a 0–1000 grounding scale, not just 0–1 fractions.' },
      { type: 'enhancement', text: 'Image occlusion now skips photos, satellite imagery, and before/after comparisons that have no labeled parts to learn, instead of masking their captions.' },
      { type: 'enhancement', text: 'Rewrote the card-generation and image-occlusion prompts using current prompt-engineering guidance — atomic, single-answer cards, clearer output rules, and tighter, better-placed occlusion masks.' },
    ],
  },
  {
    version: '0.1.0',
    date: '2026-05-29',
    summary: 'Internal prototype, recreated from the design handoff.',
    entries: [
      { type: 'feature', text: 'Interactive, mock-data prototype of the full Runico interface.' },
      { type: 'enhancement', text: 'Durable local persistence so your changes survive a reload.' },
      { type: 'fix', text: 'The folder browser auto-scrolls to reveal newly opened columns.' },
    ],
  },
];
