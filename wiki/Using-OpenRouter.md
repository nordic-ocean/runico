# 🤖 Using OpenRouter

> Connect Runico to an AI model so it can **draft cards for you** from a page, a screenshot,
> or your notes. Setup takes about a minute, and you only pay for what you use.

This page covers the OpenRouter setup in depth. For the card-drafting flow itself, see
**[Adding Cards](Adding-Cards)**. No key, or don't want one? You can draft cards for free
with **[your own AI chat](Using-Your-Own-AI)** instead.

---

## What is OpenRouter?

**OpenRouter** is a service that gives you access to many AI models (from Google, OpenAI,
Anthropic, DeepSeek, Mistral, and others) through a single account and a single **API key**.
Runico uses it as the bridge to whichever model you choose — so you're never locked into one
provider, and you can pick a cheaper or more capable model whenever you like.

Runico has **no AI server of its own**. When you generate cards, the request goes straight
from your device to OpenRouter using *your* key, and you're billed by OpenRouter for that
usage.

---

## Setting up your key

1. **Create an account** at **[openrouter.ai](https://openrouter.ai/)** (free).
2. **Create an API key** in your OpenRouter dashboard, and copy it.
3. In Runico, open **[Settings](Settings)** (the ⚙️ gear) → **AI card generation**.
4. **Paste** your key and click **Save**.
5. Click **Test key** to confirm Runico can reach OpenRouter with it. ✅

You can **Clear** the key at any time from the same place.

> 🔑 You'll need a little credit on your OpenRouter account to generate cards — add a small
> amount in their dashboard. Most models cost a fraction of a cent per batch of cards (see
> below).

---

## Choosing a generation model

Under **AI card generation → Generation model**, Runico offers a **curated list of models,
ordered cheapest → most capable**. Next to each one it shows a rough estimate:

> **≈ N cards per $1**

…so you can balance **quality against cost** at a glance. A cheaper model drafts more cards
per dollar; a stronger model may write better cards from messy or complex material. You can
switch models any time — the choice is saved as one of your app preferences.

> 💡 **Tip:** start with one of the cheaper models. If the drafts from a tricky source feel
> thin, bump up to a more capable one for that material.

---

## Where your key is stored (and kept private)

Your key is **never** sent anywhere except OpenRouter, and it's stored differently depending
on where you run Runico:

| Where you run Runico | Where the key lives |
|----------------------|---------------------|
| **Browser** (Chrome, Edge, …) | On your device only, in local storage. It never leaves your machine except in the request to OpenRouter. |
| **Desktop app** | Encrypted in your **operating-system keychain** (macOS Keychain, Windows Credential Manager, etc.). It never reaches the page at all. |

Because the key is a **device preference** (like your theme), it's *not* part of your
**[`.runico` library file](Your-Library-File)**. If you open your library on another device,
you'll re-enter the key there once.

---

## Browser vs. desktop: a note on reliability

In the **desktop app**, the generation request is made by the app itself, so it works
without browser cross-origin (CORS) restrictions and tends to "just work."

In the **browser**, the request goes directly from the page to OpenRouter. This works in
most modern browsers, but if you ever hit a **network / CORS** error, you have two easy
fallbacks:

- Use the **[desktop app](Getting-Started)**, or
- Switch to **[Use my own AI](Using-Your-Own-AI)** — no key or network call from Runico at all.

---

## What it costs

- **Runico itself is free.** The only thing that can cost money is AI generation, billed by
  **OpenRouter** based on the model you pick and how much you generate.
- The **"≈ N cards per $1"** estimate next to each model is your guide. Typical card batches
  cost cents.
- Prefer zero cost? **[Use your own AI chat](Using-Your-Own-AI)** is completely free.

---

## Troubleshooting

**"Add a key in Settings."**
You haven't saved an OpenRouter key yet, or it was cleared. Follow *Setting up your key*
above — or skip the key and **[use your own AI](Using-Your-Own-AI)**.

**"Test key" fails / generation says the key is invalid.**
Double-check you copied the whole key, that it's still active in your OpenRouter dashboard,
and that your account has a little credit.

**Generation says "network" or "CORS."**
The browser couldn't reach OpenRouter directly. Try the **desktop app**, or use
**[Use my own AI](Using-Your-Own-AI)**.

**Generation says "rate."**
OpenRouter is rate-limiting the requests; wait a moment and try again, or pick a different
model.

---

### Related

- ✨ **[Adding Cards](Adding-Cards)** — the full card-drafting flow.
- 💬 **[Using Your Own AI](Using-Your-Own-AI)** — draft cards for free with ChatGPT, Claude, or Gemini.
- 🎨 **[Settings](Settings)** — where the key and model live.
- ❓ **[FAQ & Troubleshooting](FAQ)** — more common fixes.

<div align="center"><sub><a href="Home">↑ Home</a></sub></div>
