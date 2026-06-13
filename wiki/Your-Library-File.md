# 💾 Your Library File

Everything you make in Runico — folders, topics, cards, study history, trash, and your
last session — lives in **one file you own**, with a `.runico` extension. This page
explains what it is, where it lives, and how to keep it safe. It's the one "plumbing"
concept worth understanding, and it's simple.

---

## What is it?

Think of the `.runico` file as your **notebook**. Just like a Word document holds your
writing, a `.runico` file holds your *entire* Runico library. Open the file and you're
back exactly where you left off.

You can have **as many libraries as you want** — for example one for school and one for a
hobby — each in its own file.

---

## Creating and opening it

On the **Start screen** (the first thing you see):

- **New** — creates a fresh, empty library.
- **Open** — opens an existing `.runico` file you (or another device) saved earlier.

---

## How saving works

This is the one place the **browser** and the **desktop app** differ:

| Where you're running | How it saves |
|----------------------|--------------|
| **Chrome / Edge** (browser) | **Auto-saves** straight back into your file as you work. The top bar shows *Saving… → Saved*. |
| **Other browsers** (Safari, Firefox…) | Saving **downloads** a fresh copy of the file. You'll see a note about this on the Start screen. |
| **Desktop app** | **Auto-saves** natively to your file, just like Chrome/Edge. |

> 💡 **Why the difference?** Auto-save-in-place relies on a browser capability (the File
> System Access API) that only some browsers have. If yours doesn't, nothing is lost — you
> just save by downloading, then keep using that downloaded file.

---

## Backing up and syncing

Because your library is just a normal file, you're in full control:

- **Back it up** by copying the `.runico` file somewhere safe.
- **Sync between computers** by keeping it in a cloud folder (Dropbox, iCloud Drive,
  Google Drive…) and **Open**-ing it on each device.
- **Move between browser and desktop** by opening the same file in both.

---

## Where do my *preferences* live?

Your **theme**, **language**, **AI model choice**, and **OpenRouter key** are *not* part of
the library file — they're settings for the app itself:

- **In the browser:** stored on your device (under a `runico:v3:` prefix in local storage).
- **In the desktop app:** in an app-managed settings file, with the OpenRouter key
  encrypted in your OS keychain.

So if you move your `.runico` file to a new device, you'll re-pick your theme and re-enter
your key there — but all your cards and history come along in the file.

---

## A worked example

You study on your laptop in Chrome (auto-save just works). You keep `school.runico` in your
iCloud Drive folder. On the bus you open the same file on your phone, study a few cards, and
it saves back. Tonight on your desktop you **Open** it again — every card and your exact
stopping point are right there. 📚

---

### Related

- 🚀 **[Getting Started](Getting-Started)** — creating your first library.
- 🗑️ **[Trash and Recovery](Trash-and-Recovery)** — undeleting things inside a library.
- ❓ **[FAQ & Troubleshooting](FAQ)** — "where is my data?" and privacy.

<div align="center"><sub><a href="Home">↑ Home</a></sub></div>
