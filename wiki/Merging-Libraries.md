# 🔀 Merging Libraries

> Have study material in more than one `.runico` file? Fold one into the other — folders,
> topics, cards, **and** your study history come along, with a quick step to sort out any
> duplicates.

Each Runico library is a self-contained **[`.runico` file](Your-Library-File)**. That's great
for keeping things tidy, but sometimes you end up with two: a deck a classmate shared, a
subject you started on another laptop, an export you want to fold back in. **Merge** brings
them together.

---

## The short version

1. **Open** the library you want to keep working in (call it **A**).
2. Click **🔀 Merge** in the top bar and pick the **second** file (**B**).
3. If any cards clash, resolve them (keep both / edit / skip).
4. Done — B's content is now part of A, and A is saved automatically.

> 🔒 **B is never touched.** Merging only adds to the library you have open. The file you
> merged *from* is left exactly as it was on disk.

---

## How content is placed

Runico doesn't just dump B's folders next to A's — it **matches them up by name** so things
land where you'd expect:

- A folder or topic in B that has the **same name in the same place** as one in A is
  **merged into** it. Two folders both called *Biology* become one *Biology*.
- Anything in B that **doesn't exist** in A is **added** — a new topic appears inside the
  matching folder; a brand-new top-level folder appears alongside your existing ones.
- Everything that comes across gets fresh internal ids, so nothing collides with what you
  already had.

**Example.** You merge *Study Set B* into your library:

```
Your library (A)          Merging in (B)            Result
─────────────────         ───────────────           ──────────────────
Biology                   Biology          ──▶      Biology         (merged)
  └ Cell Biology            └ Cell Biology  ──▶        └ Cell Biology  (cards combined)
History                    └ Microbiology  ──▶        └ Microbiology  (added)
                          Spanish          ──▶      History
                            └ Verbs        ──▶      Spanish           (added)
                                                      └ Verbs
```

---

## Your study history comes too

When a topic from B merges into one of yours, its **[progress](Tracking-Your-Progress)**
isn't thrown away:

- Past **sessions** from both files are combined, so the topic's accuracy chart shows your
  whole history.
- Per-card pass/fail records travel with each card.

Newly added folders and topics bring their own history with them.

---

## Resolving duplicate cards

A card counts as a **duplicate** only when it lands in the **same place** *and* has the
**same content** as a card you already have. (A card with the same wording under a
different topic is **not** a duplicate — it's legitimately separate.)

When duplicates turn up, Runico pauses and shows them to you one at a time, **side by side** —
your copy on the left, the incoming copy on the right — so you can compare and choose:

| Action | What happens |
|--------|--------------|
| **Keep both** | The incoming card is added too. You end up with both copies. |
| **Edit** | Tweak the incoming card before it's added, so it's no longer a duplicate. |
| **Skip** | Keep only the copy you already had. The incoming card's study history is **merged into** your surviving card, so you don't lose its practice record. |

> 💡 Nothing is ever discarded silently — if there's a duplicate, you decide what happens to
> it. If a merge finds **no** duplicates, it just completes, no questions asked.

When it's done you'll see a short summary: *"Added 1 folder, 2 topics, and 6 cards · 1
duplicate resolved."*

---

## Merging three or more files

Merge handles two files at a time, but it's **repeatable** — open A, merge B, then merge C,
and so on. Each merge folds the next file into the growing library.

---

## Good to know

- **Where the result goes.** The merged result is written into the library you have open
  (A) and **[auto-saved](Your-Library-File)** to its file. There's no separate "save as"
  step.
- **Changed your mind mid-merge?** Use **Cancel merge** on the duplicate screen (or the
  Back arrow) — nothing is written until you finish resolving.
- **No undo for a whole merge,** but since B is untouched and the added content is easy to
  spot, you can always delete a grafted folder (it goes to the **[Trash](Trash-and-Recovery)**)
  or re-open B.
- **What doesn't come across:** B's trash and its unreviewed AI drafts are left behind, and
  your own "last session" marker is kept — only real library content is merged.

---

## A worked example

You've been studying *biology.runico* all semester. A classmate sends you
*shared-deck.runico* with extra cell-biology cards and a whole new Spanish set.

1. You **Open** *biology.runico*.
2. You click **🔀 Merge** and pick *shared-deck.runico*.
3. Their *Cell Biology* merges into yours; the new cards appear, and one card you both had
   ("Powerhouse of the cell?") shows up as a duplicate. You tap **Skip** — your version
   stays, and your classmate's practice history on it merges into yours.
4. Their *Spanish* folder lands alongside your subjects.
5. The summary reads *"Added 1 folder, 1 topic, and 9 cards · 1 duplicate resolved,"* and
   *biology.runico* saves automatically. ✨

---

### Related

- 💾 **[Your Library File](Your-Library-File)** — what a `.runico` file is and how saving works.
- 🌱 **[Organizing Your Library](Organizing-Your-Library)** — move, copy, and sort after merging.
- 🗑️ **[Trash and Recovery](Trash-and-Recovery)** — remove something a merge added.
- 📈 **[Tracking Your Progress](Tracking-Your-Progress)** — the history that merging preserves.

<div align="center"><sub><a href="Home">↑ Home</a></sub></div>
