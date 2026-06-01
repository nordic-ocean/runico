## 1. Library model

- [ ] 1.1 Implement the subjects → folders → topics scope hierarchy with leaf topics holding cards
- [ ] 1.2 Implement the four card kinds (`cloze`, `qa`, `rev`, `occlusion`) with their fields
- [ ] 1.3 Track and expose per-scope factual counts — total cards, optional new/unstudied count, last-studied recency (no SRS "due" computation)
- [ ] 1.4 Persist the library and user edits across reloads within a session
- [ ] 1.5 Verify hierarchy, kinds, counts, and persistence against the prototype

## 2. Study session

- [ ] 2.1 Implement one-card-at-a-time recall with prompt shown and answer hidden (cloze blanks the term)
- [ ] 2.2 Implement Show answer → reveal
- [ ] 2.3 Implement Continue (record pass, advance) and Pause (stop, save place) — no grading scale
- [ ] 2.4 Implement the "N of M" progress marker
- [ ] 2.5 Implement keyboard shortcuts: reveal key, Enter to continue, Esc to pause
- [ ] 2.6 Implement the Source link in the card footer
- [ ] 2.7 Verify the full study loop and that Continue counts as passed

## 3. Session resume

- [ ] 3.1 Implement the home-view quick-resume action bound to the last session
- [ ] 3.2 Implement the three states: Continue (paused, with remaining), Restart (finished), Begin (not started)
- [ ] 3.3 Resume onto the exact paused card
- [ ] 3.4 Verify each state transition and exact-card resume

## 4. Library browser

- [ ] 4.1 Implement the column browser drilling subjects → folders → topics, opening a new column per selection
- [ ] 4.2 Auto-scroll newly revealed columns into view; show total (and any new/unstudied) count per entry
- [ ] 4.3 Implement Practice-all per column
- [ ] 4.4 Implement the topic action card (accuracy trend, stats, resume hint, actions: Continue / Open cards / View progress / Add more cards)
- [ ] 4.5 Implement the thin-history fallback marker for the trend
- [ ] 4.6 Verify drill-down, Practice-all, and the action card

## 5. Progress tracking

- [ ] 5.1 Compute per-session accuracy (passed ÷ reviewed) per sitting
- [ ] 5.2 Render the accuracy trend chart (0–100%) with a point and tooltip per sitting and an empty state
- [ ] 5.3 Implement Earlier/Later 30-day window paging with the visible range labeled
- [ ] 5.4 Implement the stats row (latest sitting with ▲/▼, window average, sittings count)
- [ ] 5.5 Implement per-card drill-down (sparkline + window pass-rate; chart switches to pass/miss; Deck overview returns)
- [ ] 5.6 Wire both entry points (action card + Open-cards trend banner)
- [ ] 5.7 Ensure progress is reporting-only and never modifies the library, cards, or history
- [ ] 5.8 Verify metric, chart, paging, drill-down, and reporting-only behavior

## 6. Card authoring

- [ ] 6.1 Implement the add flow: destination breadcrumb, topic name, and a drop/paste/browse zone with thumbnail/size/ready indicator
- [ ] 6.2 Implement the processing screen cycling through reading → understanding → drafting → choosing
- [ ] 6.3 Implement draft review (one at a time) with Keep / Remove / Edit, adding only kept cards
- [ ] 6.4 Implement the completion confirmation ("N cards added", view cards / back home)
- [ ] 6.5 Implement pending-draft indicators and the review path (and practice guard where applicable)
- [ ] 6.6 Implement manual card create / edit / delete with kind selection
- [ ] 6.7 Verify the add flow, draft review, and manual CRUD
- [ ] 6.8 NOTE: real generation engine is delivered by `add-ai-card-generation`; here the flow may use the prototype's mock drafting

## 7. Image occlusion

- [ ] 7.1 Implement the editing surface over a figure: drag to draw a mask box
- [ ] 7.2 Implement move (drag), resize (corner handle), and remove (× control)
- [ ] 7.3 Show the interaction hint and a live region count
- [ ] 7.4 Produce one occlusion card per kept box (hiding that region's label)
- [ ] 7.5 Verify draw/move/resize/remove and card generation

## 8. Source view

- [ ] 8.1 Associate each card with its originating source
- [ ] 8.2 Implement the book-style source page (title, prose, embedded figure + caption)
- [ ] 8.3 Highlight the studied term inline within the prose
- [ ] 8.4 Verify Source opens the page with the term highlighted

## 9. Appearance settings

- [ ] 9.1 Implement theme selection (Light / Warm / Dark) applied across the interface and persisted
- [ ] 9.2 Implement interface-language selection (English, Português BR, Português PT, Español, Русский, Italiano, 中文), UI-only (no card-content translation), persisted
- [ ] 9.3 Verify theme and language switching and persistence

## 10. Baseline verification

- [ ] 10.1 Run the prototype and confirm every capability's scenarios are observable
- [ ] 10.2 Record any gaps between the spec and the running app as follow-up tasks
