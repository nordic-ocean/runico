# ✨ Adding Cards

> Drop in material, let Runico draft cards, then keep the ones worth studying.

<p align="center">
  <img src="https://raw.githubusercontent.com/nordic-ocean/runico/main/tutorial/assets/add.gif" alt="Adding cards from anything — looping demo" width="700">
  <br><sub>Looping demo · plays automatically</sub>
</p>

You can turn almost **anything** into flashcards — a textbook page, a screenshot, your
class notes, a diagram. You drop in the material, Runico reads it and **drafts cards for
you**, and you review each one and keep only the good ones.

There are three ways to get cards into a topic. Pick whichever suits you:

1. **[Let AI draft them for you](#1--let-ai-draft-cards-for-you)** (needs a free OpenRouter key — see below)
2. **[Use your own AI chat](#2--use-your-own-ai-chatgpt-claude-gemini)** (no key needed)
3. **[Write them by hand](#3--write-cards-by-hand)**

---

## Before you start: the AI key (optional but recommended)

To have Runico draft cards automatically, it needs to talk to an AI model through a service
called **OpenRouter**. This takes one minute to set up:

1. Make a free account at **[openrouter.ai](https://openrouter.ai/)** and create an API key.
2. In Runico, open **[Settings](Settings)** → **AI card generation**.
3. Paste your key and click **Save**. (Click **Test key** to confirm it works.)
4. Optionally pick a **Generation model** — Runico shows a rough *"≈ N cards per $1"*
   estimate so you can balance quality against cost.

> 🔒 **Your key stays private.** In the browser it's stored only on your device; in the
> desktop app it's encrypted in your operating system's keychain. It's never sent anywhere
> except OpenRouter.

**No key, or don't want one?** No problem — skip to
**[Use your own AI chat](#2--use-your-own-ai-chatgpt-claude-gemini)**.

---

## 1 · Let AI draft cards for you

1. **Start the flow.** In the **[browser](Browsing-and-Practicing)**, open a folder and
   click **➕ Add AI Cards** (or **Add more AI Cards** on a topic's action card). You'll see
   a breadcrumb like *New AI Cards in Biology › Cell Biology* so you know where the cards
   will land.
2. **Name the topic.** Answer *"What are you learning?"* with a name like *Cell signaling*.
3. **Drop in your source.** Use the **"Drop, paste, or browse"** zone — an image, a chapter,
   a screenshot, or a page of notes. Once a file lands you'll see a thumbnail and a
   *"ready to read"* check.
4. **(Optional) Set what matters most.** Drag to reorder priorities like *Definitions*,
   *Labeled diagrams*, *Examples*, *Body prose* so the AI focuses on what you care about.
5. **Click _Begin_.** Runico works in the background, cycling through *Reading →
   Understanding → Drafting cards → Choosing the best*. You can even leave this screen —
   your cards will be waiting.
6. **Review each draft.** For every card you get **Remove**, **Edit**, or **Keep**. Keep the
   good ones, drop the rest.
7. **Done.** You'll see *"5 cards added to Cell signaling,"* with **View cards** and **Back
   home**.

> 💡 The cards stay as **drafts** until you review them — your topic shows a *"N new cards
> ready"* badge until you do.

---

## 2 · Use your own AI (ChatGPT, Claude, Gemini…)

No OpenRouter key? You can still get AI-drafted cards using *any* chat assistant you already
use. On the Add screen, choose **Use my own AI**:

1. Runico shows a ready-made **prompt**. Click **Copy prompt**.
2. Paste it into your AI chat (ChatGPT, Claude, Gemini — anything). If your source is an
   image, attach the image in the chat too.
3. The AI replies with card data. Copy its whole response.
4. Back in Runico, **paste the response** into the box and click **Use these cards**.
5. Review and keep, exactly like the automatic flow.

There's even an optional second prompt for building **image-occlusion** cards from a figure
— see **[Image-Occlusion Cards](Image-Occlusion-Cards)**.

---

## 3 · Write cards by hand

You can always author cards yourself. When editing a card you choose its type:

| Type | What it is | Example |
|------|------------|---------|
| **Q&A** | A question on the front, an answer on the back. | *Q: What organelle makes ATP? → A: Mitochondrion* |
| **Cloze** | A sentence with a blank you fill in. Wrap the blank in `{{ }}`. | *The {{nucleus}} holds the cell's DNA.* |
| **Reversible** | A term ↔ definition pair you can study in both directions. | *Front: Mitochondrion · Back: the cell's powerhouse* |

---

## A worked example

You snap a photo of a textbook page on cell signaling. You:

1. Click **Add AI Cards** inside *Cell Biology*.
2. Name it *Cell signaling*, drop in the photo, and tap **Begin**.
3. After a few seconds, 6 draft cards appear. You **Keep** 5 and **Remove** 1 that's too
   trivial.
4. Tap **View cards** — your new topic is ready to **[study](Studying-Cards)**. ✨

---

### Related

- 🖼️ **[Image-Occlusion Cards](Image-Occlusion-Cards)** — make cards that hide labels on a figure.
- 🎨 **[Settings](Settings)** — where the OpenRouter key and model live.
- 🔎 **[Seeing the Source](Seeing-the-Source)** — each card links back to the material it came from.

<div align="center"><sub><a href="Home">↑ Home</a> · Next: <a href="Image-Occlusion-Cards">Image-Occlusion Cards →</a></sub></div>
