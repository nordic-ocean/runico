<div align="center">

<img src="tutorial/assets/runico-ring.png" alt="" width="72" />
<img src="tutorial/assets/runico-wordmark.png" alt="Runico" width="240" />

### Magical runes for your learning

Runico turns anything you're learning into flashcards and helps you practice them —
recall the answer, reveal it, then Continue or Pause, with no grading scales to fuss over.

### ▶ [Launch the live prototype](https://nordic-ocean.github.io/runico/prototype/)

Runs entirely in your browser · your changes are saved locally and persist between visits

</div>

---

## A quick tour of Runico

Eight short, looping demos — one per feature. Everything plays automatically.
Each section links to a full step-by-step walkthrough.

### 1 · Study a card

> Recall the answer, reveal it, then Continue or Pause — no grading scales to fuss over.

<p align="center"><img src="tutorial/assets/study.gif" alt="Study a card — looping demo" width="700"></p>

**[Full walkthrough →](tutorial/01-study-a-card.md)**

### 2 · Pick up where you left off

> The home view remembers your last session and shows how many cards remain.

<p align="center"><img src="tutorial/assets/resume.gif" alt="Pick up where you left off — looping demo" width="700"></p>

**[Full walkthrough →](tutorial/02-pick-up-where-you-left-off.md)**

### 3 · Browse & practice

> Navigate subjects, folders, and topics in a column browser, then practice any topic.

<p align="center"><img src="tutorial/assets/browse.gif" alt="Browse & practice — looping demo" width="700"></p>

**[Full walkthrough →](tutorial/03-browse-and-practice.md)**

### 4 · Track your progress

> See whether a topic is trending up — per-session accuracy over time, with a drill-down to any single card.

<p align="center"><img src="tutorial/assets/progress.gif" alt="Track your progress — looping demo" width="700"></p>

**[Full walkthrough →](tutorial/04-track-your-progress.md)**

### 5 · Add cards from anything

> Drop in material, let Runico draft cards, then keep the ones worth studying.

<p align="center"><img src="tutorial/assets/add.gif" alt="Add cards from anything — looping demo" width="700"></p>

**[Full walkthrough →](tutorial/05-add-cards-from-anything.md)**

### 6 · Mask an image

> Draw, drag, and resize boxes over a figure to build image-occlusion cards.

<p align="center"><img src="tutorial/assets/occlusion.gif" alt="Mask an image — looping demo" width="700"></p>

**[Full walkthrough →](tutorial/06-mask-an-image.md)**

### 7 · See the source

> Open the original material as a book page, with the studied term highlighted in context.

<p align="center"><img src="tutorial/assets/source.gif" alt="See the source — looping demo" width="700"></p>

**[Full walkthrough →](tutorial/07-see-the-source.md)**

### 8 · Make it yours

> Choose a canvas theme and the language for your cards and interface.

<p align="center"><img src="tutorial/assets/settings.gif" alt="Make it yours — looping demo" width="700"></p>

**[Full walkthrough →](tutorial/08-make-it-yours.md)**

---

## Try the prototype

A fully interactive, mock-data build of the app — browse the library, study cards
(including image-occlusion), generate and review AI draft cards, rename/add/delete
cards and folders, and switch themes and language. **Everything you change is saved
locally in your browser** (localStorage), so it persists between visits and survives a
full restart — until you clear your browser data or import a different library.

**▶ [Open the live prototype](https://nordic-ocean.github.io/runico/prototype/)**

Prefer to run it locally? See [`prototype/`](prototype/) — `python3 -m http.server --directory prototype`, then open the printed URL.

## Desktop app

A desktop build wraps the same UI in Electron so your OpenRouter key is stored in
the **OS keychain** (never in the page), card-generation requests run in the main
process (**no CORS**), and all your data lives in a single local **save file** you own.

```sh
npm install
npm start        # launches the desktop app
npm run build    # packages an app for your platform (unsigned)
```

The browser build is unchanged and remains the lightweight default; the desktop
shell only adds the keychain, request, and save-file backends.

### Download

Prebuilt installers for **macOS, Windows, and Linux** are attached to each
[GitHub Release](https://github.com/nordic-ocean/runico/releases). The apps are
**unsigned**, so on first launch macOS (Gatekeeper) and Windows (SmartScreen) warn
about an unidentified developer — open via right-click → **Open** (macOS) or
**More info → Run anyway** (Windows) to proceed.

## At a glance

- **Study without grading scales.** Reveal the answer, then choose **Continue** or **Pause** — that's it.
- **Always resumable.** Runico remembers the exact card you stopped on.
- **A library you can navigate.** Subjects → folders → topics, in a column browser.
- **See your progress.** Per-session accuracy charts show whether a topic is trending up — reporting only, never grading.
- **Cards from any material.** Drop in a page, screenshot, or notes and Runico drafts cards for you to review.
- **Image-occlusion cards.** Mask regions of a figure to study diagrams and labels.
- **Source in context.** Every card links back to the original material, shown like a book page.
- **Make it yours.** Light / Warm / Dark canvas themes and per-language cards and interface.

## The full tutorial

Every feature has its own page with a step-by-step walkthrough in
**[`tutorial/`](tutorial/)** — start at the [tour index](tutorial/README.md).

## License

Runico is released under the **GNU Affero General Public License v3.0** (AGPL-3.0) —
see [`LICENSE`](LICENSE) for the full text.

---

<div align="center"><sub>Runico · feature tour</sub></div>
