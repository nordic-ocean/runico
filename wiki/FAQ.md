# ❓ FAQ & Troubleshooting

Quick answers to the questions beginners ask most.

---

## Getting started

**Do I need to install anything or make an account?**
No. Just **[open Runico in your browser](https://nordic-ocean.github.io/runico/app/)** —
no install, no account, no sign-in. (A desktop app is available if you prefer one.)

**Is it free?**
Yes, the app is free and open source. The only thing that can cost money is **AI card
generation**, if you choose to use it — that's billed by OpenRouter based on your own
usage. Studying, browsing, and writing your own cards are entirely free.

**What does it cost to use AI?**
Whatever your chosen model costs through OpenRouter. Runico shows a rough *"≈ N cards per
$1"* estimate next to each model so you can pick one that fits your budget — or skip AI
entirely and **[use your own AI chat](Adding-Cards#2--use-your-own-ai-chatgpt-claude-gemini)**
for free.

---

## My data and saving

**Where is my data stored?**
In a single **`.runico` file** on your own device — see **[Your Library File](Your-Library-File)**.
Runico has no server that holds your cards.

**It says it can't auto-save / "you'll save with a download." Why?**
Your browser doesn't support save-in-place. Use **Chrome or Edge** (or the desktop app) for
auto-save, or just keep saving by download. Nothing is lost either way. Details:
**[Your Library File](Your-Library-File)**.

**How do I move my library to another computer or my phone?**
Copy the `.runico` file (e.g. via a cloud-drive folder) and **Open** it on the other device.
Your theme and AI key are device-specific, so you'll set those again there.

**Is my data private?**
Yes. Your library stays in your file on your device. Your OpenRouter key is stored locally
(or encrypted in your OS keychain on desktop) and is only ever sent to OpenRouter when you
generate cards.

---

## Studying

**There's no 1–5 rating after each card. Is that a bug?**
Nope — it's the whole idea. Runico keeps it to **Continue** or **Pause**, with no grading
scale. See **[Studying Cards](Studying-Cards)**.

**Does checking my progress change what I study next?**
No. The **[progress charts](Tracking-Your-Progress)** are reporting only — looking never
changes scheduling or what's due.

**I deleted something by accident!**
Open the **[Trash](Trash-and-Recovery)** and click **Restore**. Deletes are recoverable
until you empty the trash.

---

## AI cards

**AI generation failed or says "network / CORS." What do I do?**
This usually means the browser couldn't reach OpenRouter directly. Try the
**[Use my own AI](Adding-Cards#2--use-your-own-ai-chatgpt-claude-gemini)** option (copy the
prompt into ChatGPT/Claude/Gemini, paste the result back), or use the **desktop app**, which
makes the request without that browser restriction.

**It says to add a key in Settings.**
You need an OpenRouter API key to use automatic generation. Setup steps are on
**[Adding Cards](Adding-Cards)** — or skip the key and use your own AI chat.

---

## Desktop app

**The installer warns about an "unidentified developer."**
The desktop apps are unsigned. On **macOS**, right-click the app → **Open**. On **Windows**,
click **More info → Run anyway**. This is expected and safe to proceed.

---

## Still stuck?

Open an issue on the **[GitHub repository](https://github.com/nordic-ocean/runico/issues)**.

<div align="center"><sub><a href="Home">↑ Home</a></sub></div>
