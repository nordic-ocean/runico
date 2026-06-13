# 🖼️ Image-Occlusion Cards

> Draw, drag, and resize boxes over a figure to build image-occlusion cards.

<p align="center">
  <img src="https://raw.githubusercontent.com/nordic-ocean/runico/main/tutorial/assets/occlusion.gif" alt="Masking an image — looping demo" width="700">
  <br><sub>Looping demo · plays automatically</sub>
</p>

**Image occlusion** is a fancy name for a simple idea: take a picture, cover up a label
with a box, and study by recalling what's hidden. It's perfect for **diagrams, anatomy,
maps, and any labelled image** — anything where *where* something is matters as much as
*what* it is.

Each box you draw becomes **one card** that hides that one label.

---

## How to mask an image

1. **Open the figure** in the occlusion editor (you get here while
   **[adding cards](Adding-Cards)** from an image).
2. **Draw a box:** click-and-drag across the part you want to hide. A mask box appears.
3. **Reposition:** drag the middle of a box to move it.
4. **Resize:** pull a corner handle to make it bigger or smaller.
5. **Delete:** click the **×** on a box to remove it — keep only what matters.

An on-screen hint reminds you: *"Drag to add · drag to move · pull the corner to resize,"*
and a live counter shows how many regions you've made (*1 region, 2 regions, …*).

> 📱 On phones and tablets the corner handles and the **×** are enlarged so you can grab
> them with a finger.

---

## A worked example

You have a diagram of a plant cell labelled *Nucleus, Mitochondrion, Chloroplast, Cell
wall*. You:

1. Draw a box over the word **Nucleus**.
2. Draw boxes over the other three labels too — four boxes, four regions.
3. That's **four occlusion cards**. When you study, Runico shows the diagram with one label
   hidden and asks *"What's the highlighted region?"* You recall it, then reveal to check.

---

## How you study them

Occlusion cards work just like text cards in a session:

- Runico shows the picture with one box covering a label and asks **"What's the highlighted
  region?"**
- You recall the answer, then reveal what's underneath.
- Continue or Pause, same as always. See **[Studying Cards](Studying-Cards)**.

---

## Don't want to draw boxes yourself?

If you're using the **[Use my own AI](Adding-Cards#2--use-your-own-ai-chatgpt-claude-gemini)**
flow, there's an optional prompt that asks your AI chat to identify the labels on a figure
for you — paste its response and Runico builds the occlusion card automatically.

---

### Related

- ✨ **[Adding Cards](Adding-Cards)** — where image cards are created.
- 📖 **[Studying Cards](Studying-Cards)** — how you practice them.

<div align="center"><sub><a href="Home">↑ Home</a> · Next: <a href="Seeing-the-Source">Seeing the Source →</a></sub></div>
