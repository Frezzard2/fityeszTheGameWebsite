# Fityesz Krónika — website

The website for **[Fityesz Krónika](https://github.com/djkzea/fityeszthegame)**, a bilingual
Hungarian/English text adventure about clawing your way to the top of a political party.

The site introduces the game, its characters and its world, and lets anyone play the **Prologue and
Chapter 1 in the browser** — no account, no download.

- **Live:** [fityeszthegame.com](https://fityeszthegame.com)
- **Game repo:** [djkzea/fityeszthegame](https://github.com/djkzea/fityeszthegame) (Java)

---

## What's here

| Page | Hungarian | English |
|---|---|---|
| Landing | `/hu/` | `/en/` |
| Characters | `/hu/szereplok/` | `/en/szereplok/` |
| Lexikon (world codex) | `/hu/lexikon/` | `/en/lexikon/` |
| Play Chapter 1 | `/hu/jatek/` | `/en/jatek/` |
| Support the creators | `/hu/tamogatas/` | `/en/tamogatas/` |

Chapter 1 tracks the same **XP**, **lebukás** (exposure) and items as the desktop game, using the
same numbers. Progress saves to `localStorage`, so a reload picks up where you left off.

## Not built yet

Accounts, cross-device save sync, and the gated installer download. All three need server-side code,
and the site is currently a static export. They're specified in
[`docs/superpowers/`](docs/superpowers/) — a design spec and a task-by-task implementation plan —
so the work can resume without re-deciding anything.

The download page is hidden behind a flag rather than linking to a 404:

```ts
// lib/features.ts
export const DOWNLOAD_ENABLED = false
export const ACCOUNTS_ENABLED = false
```

Flip a flag once its page exists; nothing else needs changing.

---

## Running it locally

Requires **Node 22**.

```bash
npm ci
npm run dev        # http://localhost:3000/hu/
```

```bash
npm test           # vitest
npm run lint
npm run build      # static export → out/
```

> **Note for the maintainers' Mac:** the system `node` is broken by an unrelated Homebrew formula
> (`merve` links against a missing `libsimdutf`). Until that's fixed, prefix commands with
> `PATH=/opt/homebrew/opt/node@22/bin:$PATH`, or repair it with `brew uninstall merve`.

## The story text is generated, not copied

`lib/story/content/*.json` is **generated from the game's own `Lang.java`** — the Prologue and
Chapter 1 script, every chapter title and quote, and every item name. Nothing is retyped, so the
website cannot drift from the game.

```bash
npm run extract:story
```

This fetches `src/Lang.java` from the game repo, parses its `p(key, magyar, angol)` calls, and
rewrites the JSON. **Don't hand-edit those files** — edit the game, then re-run this.

The XP and exposure values live in `scripts/extract-lang.ts`, transcribed from `fityesz1_0.java`,
and are covered by unit tests in `tests/unit/engine.test.ts`. If the browser chapter ever disagrees
with the Java, those tests fail.

## Deploying

`npm run build` writes a complete static site to `out/` (~3 MB). Upload **the contents** of `out/`
to your web root.

`out/.htaccess` handles the redirect from `/` to `/hu/`, trailing slashes, the 404 page and cache
headers. It's a dotfile — **enable "show hidden files" in your FTP client** or it won't be uploaded.

Any static host works: Apache, nginx, Vercel, Netlify, GitHub Pages. If the host isn't Apache, the
`.htaccess` is ignored and `out/index.html` handles the root redirect instead.

---

## How it's built

**Next.js 16** (App Router, static export) · **TypeScript** · **Tailwind v4** · **next-intl** ·
**Vitest**

```
app/[locale]/          the five pages
components/            play screen, lore tabs, flag rail, locale toggle
lib/design/            colour tokens, the two art directions, character roster
lib/story/             pure game engine + generated content
scripts/               Lang.java → JSON extractor, post-export redirect
messages/              hu.json / en.json — 248 keys each
docs/superpowers/      design spec and implementation plan
```

### Two art directions

Marketing pages use **campaign propaganda** — Antonio at poster scale, 3px borders, hard offset
shadows. The Lexikon and the playable chapter use **leaked dossier** — Saira Stencil One, IBM Plex
Mono, hairline borders, ruled-paper texture. Both share one palette, and the red-white-green flag
rail sits on every page.

All four typefaces are **self-hosted** — no request reaches Google when someone loads the site.
Saira Stencil One ships from `app/fonts/` under the SIL Open Font License, included alongside it.

---

## Credits

Made by **[Kukucska Zsombor](https://github.com/Frezzard2)** and
**[Dajka Zea](https://github.com/djkzea)**.

*Fityesz Krónika* is a work of satire. It is fiction, it depicts no real person or organisation, and
it reproduces no real party's logo, wordmark or branding.
