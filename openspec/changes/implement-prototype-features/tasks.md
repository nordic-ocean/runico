<!-- Batch A (done): durable persistence, factual counts/no-SRS, 7 UI-only languages
     (picker + copy), edited-draft fix.
     Batch B1 (done): study self-mark "Got it"/"Missed" (binary, no grading scale;
     occlusion auto-grades from per-region marks) + real per-sitting accuracy
     recorded into durably-persisted history.
     Verification is by code inspection + adversarial review workflow + esbuild parse
     check (the app is browser-only JSX-via-Babel and can't be headless-run); a full
     in-browser click-through remains as task 10.1.
     Batch B2 (done): i18n engine (prototype/i18n.js: t/tp + 7-locale string table,
     202 keys × en/pt-BR/pt-PT/es/ru/it/zh) wired live from tweaks.language; ~203
     t()/tp() call sites across all components; reactivity traps handled. Translation
     data validated (placeholder parity, no entities, {{ }} preserved); migration
     adversarially verified. Translations are machine-generated — flag for native review.
     Still deferred to Batch B: file-drop intake (6.1), factual pending-draft counts
     (6.5), occlusion box→card production (7.4/7.5), and source-view generalization
     (8.x) — the source overlay is still canned demo content, so its two chrome
     strings ("From this source", "Highlighted:") are intentionally left until 8.x. -->

## 1. Library model

- [x] 1.1 Implement the subjects → folders → topics scope hierarchy with leaf topics holding cards
- [x] 1.2 Implement the four card kinds (`cloze`, `qa`, `rev`, `occlusion`) with their fields
- [x] 1.3 Track and expose per-scope factual counts — total cards, optional new/unstudied count, last-studied recency (no SRS "due" computation)
- [x] 1.4 Persist the library and user edits across reloads within a session
- [x] 1.5 Verify hierarchy, kinds, counts, and persistence against the prototype

## 2. Study session

- [x] 2.1 Implement one-card-at-a-time recall with prompt shown and answer hidden (cloze blanks the term)
- [x] 2.2 Implement Show answer → reveal
- [x] 2.3 Implement "Got it"/"Missed" self-mark (record pass/miss, advance) and Pause (stop, save place) — no grading scale
- [x] 2.4 Implement the "N of M" progress marker
- [x] 2.5 Implement keyboard shortcuts: reveal key, Enter to continue, Esc to pause
- [x] 2.6 Implement the Source link in the card footer
- [x] 2.7 Verify the full study loop and that a completed sitting records real pass/miss accuracy

## 3. Session resume

- [x] 3.1 Implement the home-view quick-resume action bound to the last session
- [x] 3.2 Implement the three states: Continue (paused, with remaining), Restart (finished), Begin (not started)
- [x] 3.3 Resume onto the exact paused card
- [x] 3.4 Verify each state transition and exact-card resume

## 4. Library browser

- [x] 4.1 Implement the column browser drilling subjects → folders → topics, opening a new column per selection
- [x] 4.2 Auto-scroll newly revealed columns into view; show total (and any new/unstudied) count per entry
- [x] 4.3 Implement Practice-all per column
- [x] 4.4 Implement the topic action card (accuracy trend, stats, resume hint, actions: Continue / Open cards / View progress / Add more cards)
- [x] 4.5 Implement the thin-history fallback marker for the trend
- [x] 4.6 Verify drill-down, Practice-all, and the action card

## 5. Progress tracking

- [x] 5.1 Compute per-session accuracy (passed ÷ reviewed) per sitting
- [x] 5.2 Render the accuracy trend chart (0–100%) with a point and tooltip per sitting and an empty state
- [x] 5.3 Implement Earlier/Later 30-day window paging with the visible range labeled
- [x] 5.4 Implement the stats row (latest sitting with ▲/▼, window average, sittings count)
- [x] 5.5 Implement per-card drill-down (sparkline + window pass-rate; chart switches to pass/miss; Deck overview returns)
- [x] 5.6 Wire both entry points (action card + Open-cards trend banner)
- [x] 5.7 Ensure progress is reporting-only and never modifies the library, cards, or history
- [x] 5.8 Verify metric, chart, paging, drill-down, and reporting-only behavior

## 6. Card authoring

- [x] 6.1 Implement the add flow: destination breadcrumb, topic name, and a drop/paste/browse zone with thumbnail/size/ready indicator
- [x] 6.2 Implement the processing screen cycling through reading → understanding → drafting → choosing
- [x] 6.3 Implement draft review (one at a time) with Keep / Remove / Edit, adding only kept cards
- [x] 6.4 Implement the completion confirmation ("N cards added", view cards / back home)
- [x] 6.5 Implement pending-draft indicators and the review path (and practice guard where applicable)
- [x] 6.6 Implement manual card create / edit / delete with kind selection
- [x] 6.7 Verify the add flow, draft review, and manual CRUD
- [ ] 6.8 NOTE: real generation engine is delivered by `add-ai-card-generation`; here the flow may use the prototype's mock drafting

## 7. Image occlusion

- [x] 7.1 Implement the editing surface over a figure: drag to draw a mask box
- [x] 7.2 Implement move (drag), resize (corner handle), and remove (× control)
- [x] 7.3 Show the interaction hint and a live region count
- [ ] 7.4 Produce one occlusion card per kept box (hiding that region's label)
- [ ] 7.5 Verify draw/move/resize/remove and card generation

## 8. Source view

- [ ] 8.1 Associate each card with its originating source
- [ ] 8.2 Implement the book-style source page (title, prose, embedded figure + caption)
- [ ] 8.3 Highlight the studied term inline within the prose
- [ ] 8.4 Verify Source opens the page with the term highlighted

## 9. Appearance settings

- [x] 9.1 Implement theme selection (Light / Warm / Dark) applied across the interface and persisted
- [x] 9.2 Implement interface-language selection (English, Português BR, Português PT, Español, Русский, Italiano, 中文), UI-only (no card-content translation), persisted
- [x] 9.3 Verify theme and language switching and persistence

## 10. Baseline verification

- [ ] 10.1 Run the prototype and confirm every capability's scenarios are observable
- [ ] 10.2 Record any gaps between the spec and the running app as follow-up tasks
