# Fityesz Krónika — Website Design

**Date:** 2026-09-24
**Authors:** Zsombor Kukucska ([@Frezzard2](https://github.com/Frezzard2)), Zea Dajka ([@djkzea](https://github.com/djkzea))
**Game repo:** [djkzea/fityeszthegame](https://github.com/djkzea/fityeszthegame)
**Status:** approved for planning

---

## 1. What we are building

A bilingual (Hungarian/English) website for *Fityesz Krónika*, a Java console text-adventure about
clawing your way to the top of a political party. The site introduces the game, its characters and
its world; lets anyone play the Prologue and Chapter 1 in the browser; asks them — without forcing
them — to register so their decisions are kept; gives registered players native installers for the
full game; and carries a section supporting the two creators.

### 1.1 What the game actually is

Facts taken from the source, not assumed:

| Element | Detail |
|---|---|
| Structure | Prologue (*A mélyPont*) + 7 chapters |
| Chapters | 1 *A Toborzás* · 2 *Az első gyűlés* · 3 *A Kongresszusi Próba* · 4 *Az Országos Választmány Árnyai* · 5 *A Parlamenti Útvesztő* · 6 *Az Országos Elnökség Kapujában* · 7 *Az Elnökség Trónján* |
| Tracked state | `xp` (int), `lebukas` (int, exposure), `szint` (int, level), 7 item booleans, player name |
| Outcomes | **Three, all real.** Reach the top → `TE LETTÉL A PÁRTELNÖK!` · exposure reaches 100 → `LEBUKTÁL!` (`lebukasEllenorzes()`) · quit after losing a bossfight → `UI.vereseg()` then `fight.gameover` |
| Level up | `if (xp >= 50)` sets `szint` to 2 and grants `HELYI PÁRTTAG` — the only named rank today, checked in Chapter 3 |
| Characters | Lipóti Dezső · Lakatos Ervin · Dr. Péteri Katalin · Molnár Gábor · Kapzs Imre · Ismeretlen hang |
| Boss fights | 3 — Lakatos (ch3), Dr. Péteri (ch5), Kapzs (ch7), turn-based with HP; award `+50`, `+80`, `+120` XP |
| Items | ELSŐ BORÍTÉK · KIS BORÍTÉK · LAKATOS AKTÁJA · OFFSHORE SZÁMLA BELÉPÉSI KÓD · PÉTERI DOSSZIÉ · FŐNÖK BIZALMA · PARLAMENTI TÖBBSÉG KULCSA |
| Languages | Already fully bilingual — `Lang.java` stores every string as `p(key, magyar, angol)` |
| Current save | Appends chosen option numbers to `valasztasok.txt` |

### 1.2 Explicitly out of scope

- **Per-character relationship tracking.** The game has no trust value per NPC, and we decided not to
  invent one. The dashboard shows XP / Exposure / Rank / Items only. The design prototype contains a
  finished *Kapcsolatok* panel with four trust states; it is deliberately left unbuilt, and stays in
  the file for whenever the game gains real trust values.
- **Chapters 2–7 in the browser.** The web demo stops at the end of Chapter 1.
- **A `.jar` download.** Native installers only.
- **Code-signing certificates.** Deferred; see §7.3.

---

## 2. Decisions taken

| Decision | Choice |
|---|---|
| Stack | Next.js 16 (App Router, TypeScript) + Tailwind v4 on Vercel; Supabase for Postgres, Auth, Storage |
| Languages | Hungarian and English, user-toggleable, Hungarian default |
| Web demo scope | Prologue + Chapter 1 |
| Registration | **Skippable** prompt at the end of Chapter 1 — never a hard wall on play |
| Download | Account required |
| Packaging | Native installers for Windows, macOS (Intel + Apple Silicon), Linux |
| Desktop continuation | The downloaded game signs in and loads the web save |
| Play presentation | Visual novel — dialogue boxes with typographic nameplates, no portrait art |
| Visual direction | **Campaign propaganda** on Landing, Szereplők, Letöltés, Támogatás, Vezérlőpult; **Leaked dossier** on Lexikon and Játék |
| Palette | **Tricolour** (§6.1), site-wide, both directions |
| Flag rail | The red/white/green rail stays visible on every page, including the dossier pages, overriding the prototype's `--cF:none` |
| Design source | The prototype in `Fityesz Chronicles Website Design/` is the visual source of truth (§6) |
| Domain | `fityeszthegame.com` |
| Crowd statistics | "% of players who chose this" hidden until a choice point has ≥ 30 responses |
| Ko-fi | Profile being created by Zsombor; section is config-driven, so it ships with or without it |

---

## 3. Architecture

### 3.1 Repository layout

```
app/[locale]/(marketing)/       page.tsx | karakterek | lore | letoltes | tamogatas
app/[locale]/(app)/             jatek | vezerlopult | belepes | regisztracio | eszkoz
app/api/saves/                  GET, PUT (web session or device token)
app/api/decisions/              POST
app/api/download/[platform]/    GET — session-gated redirect
app/api/device/                 start | poll | approve
components/                     ui primitives, story renderer, dashboard panels
lib/story/engine.ts             pure reducer — no React, no network
lib/story/types.ts
lib/story/content/              prologus.json, fejezet-01.json  (generated)
lib/supabase/                   browser + server clients
scripts/extract-lang.ts         Lang.java → story JSON
supabase/migrations/            schema + RLS policies
tests/                          vitest unit, playwright e2e
```

### 3.2 Story content pipeline

`Lang.java` already holds every line of the game in both languages. Retyping the Prologue and
Chapter 1 into the website would guarantee divergence, so we generate instead.

`scripts/extract-lang.ts` fetches `src/Lang.java` and `src/fityesz1_0.java` from the game repo,
parses the `p("key", "magyar", "angol")` calls and the Chapter 1 control flow, and emits
`lib/story/content/*.json`. A CI job re-runs the extractor and fails the build if the committed JSON
differs from the regenerated JSON — so a text change in the game repo surfaces as a failing check
rather than as silent drift.

**The game repo stays the single source of truth for the game's words.**

### 3.3 Story engine

A pure, framework-free reducer, so it can be tested directly against the Java:

```ts
type Beat =
  | { kind: 'narration';   text: LocalizedText }
  | { kind: 'dialogue';    speaker: CharacterId; text: LocalizedText }
  | { kind: 'chapterCard'; number: number; title: LocalizedText; quote: LocalizedText; place: LocalizedText }
  | { kind: 'item';        item: ItemId }
  | { kind: 'statScreen' }
  | { kind: 'choice';      id: ChoicePointId; prompt: LocalizedText; options: ChoiceOption[] }

type ChoiceOption = {
  text: LocalizedText
  xp: number
  lebukas: number
  grantsItem?: ItemId
  response: Beat[]
}

type PlayerState = {
  name: string
  xp: number
  lebukas: number
  szint: number
  items: ItemId[]
  history: { choicePointId: ChoicePointId; optionIndex: number }[]
  status: 'playing' | 'exposed' | 'demoComplete'
}

applyChoice(state: PlayerState, choicePointId: ChoicePointId, optionIndex: number): PlayerState
```

`applyChoice` adds `xp` and `lebukas`, grants any item, appends to `history`, then applies the
exposure check: if `lebukas >= 100`, `status` becomes `'exposed'` and the run is over — identical to
`lebukasEllenorzes()`.

**Chapter 1 values, lifted verbatim from `fityesz1_0.java`:**

| Choice point | Option | XP | Lebukás | Item |
|---|---|---|---|---|
| `ch1.q1` (Lipóti's loyalty question) | 1 | +15 | +10 | — |
| | 2 | +10 | +5 | — |
| | 3 | +5 | 0 | — |
| `ch1.q2` (the envelope) | 1 | +20 | +15 | `ELSŐ BORÍTÉK` |
| | 2 | +10 | +5 | — |
| | 3 | 0 | **−10** | — |

These become the first unit-test fixtures. If the web chapter ever disagrees with the Java, the
tests fail.

### 3.4 Data model

```sql
profiles          (id uuid pk → auth.users, display_name text, locale text, created_at)
saves             (id uuid pk, user_id uuid, slot smallint check 1..3, chapter smallint,
                   scene_id text, player_name text, xp int, lebukas int, szint int,
                   items text[], source text check in ('web','desktop'), updated_at,
                   unique (user_id, slot))
decisions         (id bigserial pk, save_id uuid, user_id uuid, choice_point_id text,
                   option_index smallint, chapter smallint, created_at)
choice_stats      (choice_point_id text, option_index smallint, count int,
                   primary key (choice_point_id, option_index))
endings           (id text pk, name_hu, name_en, hint_hu, hint_en, sort int)
unlocked_endings  (user_id uuid, ending_id text, unlocked_at, primary key (user_id, ending_id))
downloads         (id bigserial pk, user_id uuid, platform text, version text, created_at)
device_codes      (device_code text pk, user_code text unique, user_id uuid null,
                   approved_at timestamptz null, expires_at timestamptz, token_hash text null)
```

**`endings` seed — the two outcomes the game actually has today:**

| id | sort | hint (HU) | hint (EN) | condition in the game |
|---|---|---|---|---|
| `president` | 1 | Érj fel a csúcsra. | Reach the very top. | Finish Chapter 7 |
| `exposed` | 2 | Hagyd, hogy a sajtó mindent kiderítsen. | Let the press uncover everything. | `lebukas >= 100` |
| `gaveup` | 3 | Add fel egy elvesztett bossfight után. | Give up after losing a bossfight. | Lose a bossfight, then choose quit (`fight.gameover`) |

The dashboard reads `%n/3 feloldva`. Unlocked endings are named; locked ones show only the hint
above, never the name. These three are the outcomes the game actually has — no placeholders.

**Row-level security.** Every user-owned table restricts `select`/`insert`/`update` to
`auth.uid() = user_id`. `choice_stats` is never read directly; a view applies the threshold in SQL:

```sql
create view choice_stats_public as
select choice_point_id, option_index, count,
       round(100.0 * count / sum(count) over (partition by choice_point_id)) as pct
from choice_stats
where (select sum(count) from choice_stats s2
       where s2.choice_point_id = choice_stats.choice_point_id) >= 30;
```

Below 30 responses the view returns no rows and the UI renders nothing — the threshold cannot be
bypassed by a client.

`choice_stats.count` is incremented by an `after insert` trigger on `decisions`, running as
`security definer` so players can contribute to the aggregate without being able to read or write it.

---

## 4. Screens

All nine are responsive; "mobile" is not a separate build.

| Route (HU) | Purpose |
|---|---|
| `/` | Landing — poster hero, the hook, chapter descent, character roster, play + download CTAs |
| `/szereplok` | Szereplők — typographic cards: initials, name, party title, signature quote, first chapter |
| `/lexikon` | Lexikon — five tabs: A párt · Fejezetek · Helyszínek · Tárgyak · Játékszabályok (dossier direction) |
| `/jatek` | Play the Prologue + Chapter 1 |
| `/belepes`, `/regisztracio` | Auth |
| `/vezerlopult` | Player dashboard |
| `/letoltes` | Download (account required) |
| `/tamogatas` | Support the creators |
| `/eszkoz` | Enter the code shown by the desktop game (§7.4) |

### 4.1 Play screen

Visual-novel presentation in terminal dress. A coloured nameplate carries the speaker
(`Lipóti Dezső` on party red) above the dialogue box; narration sits in a quieter block; choices are
numbered `[1] [2] [3]` buttons that keep the console's numbering. A status bar pins XP, LEBUKÁS,
RANG and TÁRGYAK.

Narration reveals with a typewriter effect that is skipped entirely under
`prefers-reduced-motion: reduce`, and any click completes the current line instantly.

On mobile the status bar collapses to one tappable strip and choices anchor to the bottom of the
viewport.

### 4.2 Registration prompt

At the end of Chapter 1, after the envelope choice, a panel offers to save the run. **It is
dismissible.** Dismissing keeps the `localStorage` save intact, so registering days later still
inherits those decisions. Registering migrates the local state into slot 1 and forwards to the
dashboard.

### 4.3 Dashboard

Six panels: **Continue** (resume card with the 7-chapter progress strip) · **Save slots** (three,
with desktop sync status) · **Status readout** (XP, Exposure with its `/100` ceiling, Rank, Items
2/7) · **Decision timeline** (each entry showing the choice, its XP/exposure cost, and the crowd
percentage where ≥ 30 responses exist) · **Endings** (`%n/3 feloldva` — unlocked ones named, locked
ones showing only their hint, never their name).

The *Kapcsolatok* panel from the prototype is not built (§1.2).

### 4.4 Support the creators

Both creators credited with their GitHub profiles. Ko-fi is driven by a `NEXT_PUBLIC_KOFI_URL`
config value; while unset the button renders in a `hamarosan` / `coming soon` state and the section
leads with a "star the repo" call to action. Setting the variable is the only change needed once a
profile exists. The Ko-fi link is a plain anchor, not their embedded iframe widget — no third-party
script, no tracking, faster page.

---

## 5. Flows

### 5.1 Anonymous play → registration

1. Visitor opens `/jatek`, enters a name, plays the Prologue and Chapter 1.
2. State is written to `localStorage` after every beat.
3. End of Chapter 1 → skippable save prompt.
4. On registration, `localStorage` state is `POST`ed once, becoming slot 1, and each entry in
   `history` is inserted into `decisions` (which feeds `choice_stats`).
5. Visitor lands on `/vezerlopult` with their run intact.

### 5.2 Download

`/letoltes` shows platform buttons. Unauthenticated visitors get the registration screen instead of
the file. `GET /api/download/:platform` verifies the session, inserts a `downloads` row, and
redirects to the GitHub release asset. The page reads the latest release through the GitHub API
(cached for an hour), so shipping a new version never requires a site edit.

---

## 6. Visual design

### 6.0 The design file is the source of truth

`Fityesz Chronicles Website Design/Fityesz Chronicles.dc.html` is a working bilingual prototype of
all eight pages plus the register-prompt overlay, built in Claude Design. Where this document and
that file disagree about how something looks, **the file wins** and this document is corrected. The
tokens below are read out of it, not invented here.

It ships two art directions and four palettes as switchable props. We use a fixed subset (§2), but
the other palettes stay in the file as future options.

### 6.1 Palette — Tricolour

| Token | Hex | Use |
|---|---|---|
| `paper` | `#F4EFE6` | page background (campaign) |
| `paper2` | `#E8DFD0` | page background (dossier), rails, wells |
| `sheet` | `#FBF8F2` | cards, dialogue boxes |
| `ink` | `#161616` | text, borders |
| `inkSoft` | `#4A4640` | secondary text |
| `line` | `#CFC6B6` | hairlines |
| `accent` / `danger` | `#C8102E` | primary action, the party, exposure meter |
| `accentText` | `#B10E28` | accent colour on paper, where `accent` fails contrast |
| `onAccent` | `#FFF8F0` | text on accent |
| `second` / `good` | `#1F6B3A` | flag rail, positive states |
| `onInk` | `#F4EFE6` | text on ink |

The flag rail is `accent` / `paper2` / `second` in equal thirds, 6px, at the top of every page.

### 6.2 Type and print treatment

| | Campaign propaganda | Leaked dossier |
|---|---|---|
| Display | Antonio 700 | Saira Stencil One 400 |
| Body / label | Public Sans | IBM Plex Mono |
| Border width | `3px` | `1px` |
| Shadow | `6px 6px 0 ink` (hard offset) | soft, long, low-opacity |
| Surface | `paper` | `paper2`, with a 32px ruled-paper texture |
| Display tracking | `1` | `.74` |

All four faces are Google Fonts. **Diacritic coverage was a hard requirement** — `á é í ó ö ő ú ü ű`
must all render, or the wordmark itself breaks. All four were checked directly against their font
binaries' `cmap` tables, upper and lower case: **Antonio, Public Sans, IBM Plex Mono and Saira
Stencil One all carry every Hungarian diacritic, including `ő` `ű` `Ő` `Ű`.** No substitution
needed.

### 6.3 Not looking like a template

This is a stated requirement, so it is written as rules a built page either passes or fails — not as
an aspiration.

**Banned outright**

- Three equal cards in a row with an icon, a heading and a paragraph. This is the single strongest
  tell of a generated site and appears nowhere.
- Untouched component-library defaults — the `rounded-lg border bg-card` look. Components are styled
  from the tokens above, not accepted as shipped.
- Gradient text, glassmorphism, purple/blue gradients, soft ambient glow.
- Emoji used as icons. Marks are typographic (`§`, `▮`, `†`, `☞`) or purpose-drawn SVG.
- Generic section labels — "Features", "Get Started", "Why choose us", "Our Mission".
- Lorem ipsum, placeholder characters, invented statistics, stock illustration. Every mockup and
  every built page uses the game's real sentences.
- Fade-up-on-scroll applied uniformly to every section.

**Required**

- **In-world labelling.** Sections are titled as the game would title them — `I. FEJEZET`,
  `AZ AKTA`, `A BORÍTÉK`, `IKTATÓSZÁM` — never as web-marketing furniture.
- **Asymmetric layout.** Content sits on uneven column spans (7/5, 8/4). No page repeats a
  symmetric three-column rhythm.
- **Poster type scale.** A large jump between display and body size, as a printed poster has — not
  an even six-step modular scale where every heading is 1.25× the last.
- **Print texture, drawn from Hungarian bureaucratic printing rather than from a UI kit:** halftone
  dot screens, paper grain, a one-pixel misregistration on the red channel in headline treatments,
  rubber-stamp overlays (`IKTATVA`, `BIZALMAS`) on codex and character pages.
- **Square corners.** Border radius is 0 by default; any rounding is a deliberate, argued exception.
- **One structural rule-break per page**, so no two pages are interchangeable: the codex carries a
  fixed index column, the character page is a full-bleed ledger, the download page is shaped like an
  official form.
- **Motion with a reason.** Typewriter reveal for narration, a stamp impact when an item is granted,
  a meter that ticks when exposure rises. Nothing animates merely because it entered the viewport.
  All of it respects `prefers-reduced-motion`.

**The test.** Cover the logo on any finished page. If it could be another game's site — or another
product's entirely — the page fails and is reworked.

### 6.4 A noted risk

Red-white-green with party iconography is the sharpest version of this joke and the one most likely
to be read as a sincere political statement rather than satire, including by platforms hosting
donations. This was raised during design and the direction was chosen deliberately. The site
therefore carries a plain, non-defensive line in the footer identifying it as fiction and satire,
and avoids reproducing any real party's actual logo, wordmark or official colour specification.

---

## 7. Delivery phases

### 7.1 Phase 1 — Website (ships alone)

Marketing pages, playable Prologue + Chapter 1, auth, dashboard, Ko-fi section, and a download page
pointing at GitHub releases. Complete and useful with nothing else built.

### 7.2 Phase 2 — Installers

A GitHub Actions workflow **in the game repo**, matrix across `windows-latest`, `macos-13` (Intel),
`macos-14` (Apple Silicon) and `ubuntu-latest`. `jlink` trims a runtime; `jpackage` produces `.exe`,
two `.dmg` (Intel and Apple Silicon), `.deb` and `.rpm`, attached to a GitHub Release. AppImage is
not produced — `jpackage` cannot make one, and adding a second packaging tool was judged not worth
the extra build step.

### 7.3 Unsigned builds

Without certificates, Windows SmartScreen and macOS Gatekeeper will warn on first launch. The
download page states this plainly, per platform, with the steps to proceed. Certificates
(~$99/yr Apple, ~$200+/yr Windows) are a later decision, not a blocker.

### 7.4 Phase 3 — Desktop sign-in and save sync

A console application cannot perform a browser OAuth redirect, so the game uses **device code flow**:

1. Game `POST`s `/api/device/start`, receives a device code and a short user code (`FTY-7K2Q`).
2. Game prints: open `fityeszthegame.com/eszkoz` and enter `FTY-7K2Q`.
3. Player, signed in on the web, enters the code; the row is approved and bound to their user.
4. Game's poll succeeds and receives a long-lived opaque token, stored at `~/.fityesz/credentials`
   with `0600` permissions.
5. Game reads and writes saves through `/api/saves` with `Authorization: Bearer <token>`.

Offline, the game writes locally and syncs on next launch. On conflict the newer `updated_at` wins,
after showing the player both saves' chapter and stats and asking which to keep.

This phase changes the game's save handling from appending to `valasztasok.txt` to a structured save
model shared with the website, and is the largest single piece of work in the project — which is why
it is last.

---

## 8. Testing

- **Unit (vitest).** `applyChoice` against the Chapter 1 table in §3.3, including the `−10` exposure
  case and the `lebukas >= 100` cutoff. Written before the engine.
- **Extractor.** `extract-lang.ts` against a fixture copy of `Lang.java`, including the bilingual
  pairing and `%s` name substitution.
- **RLS.** A test asserting one user cannot read another's `saves` or `decisions` rows.
- **Threshold.** A test asserting `choice_stats_public` returns nothing at 29 responses and returns
  percentages at 30.
- **E2E (playwright).** Play the Prologue and Chapter 1 anonymously → dismiss the prompt → register
  later → confirm the run appears in slot 1 with its decision timeline intact.
- **Accessibility.** Keyboard-only completion of Chapter 1; contrast of every token pair in §6.1
  verified against WCAG AA; the typewriter effect disabled under `prefers-reduced-motion`.

---

## 9. Open items

1. **Ko-fi profile.** Zsombor is creating it. Once it exists the site needs only `NEXT_PUBLIC_KOFI_URL` set; no code change.
2. **Domain.** `fityeszthegame.com` — to be registered and pointed at Vercel.
3. ~~**Saira Stencil One diacritics.**~~ Closed 2026-09-24 — all four faces verified against their
   font binaries; see §6.2.
4. **Code-signing certificates.** Deferred; see §7.3.
