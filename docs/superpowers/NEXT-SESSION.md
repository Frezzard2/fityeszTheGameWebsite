# Next session — start here

Written 2026-09-25, at the end of the first build session.

## Direction from the creators, taken after seeing the site live

These override the spec and the Phase 1 plan where they differ.

### 1. Campaign direction only — drop the dossier entirely

The site must use **one** visual direction everywhere: the campaign-propaganda look on the
**Tricolour** palette. The **leaked dossier** direction is not wanted on any page, including the
playable chapter.

Currently `dossier` is applied in two places, both of which must change:

- `app/[locale]/jatek/page.tsx` — wrapped in `<DirectionScope value="dossier">`
- `app/[locale]/lexikon/page.tsx` — same

After the change, `DirectionScope` should only ever receive `"campaign"`. Decide then whether to
keep the `dossier` token block in `lib/design/tokens.css` as dead code or delete it; deleting is
cleaner, and the design prototype remains the record if it is ever wanted back.

Note this also retires the "poster outside, console inside" idea the spec argued for in §2 and the
one-structural-rule-break-per-page requirement in §6.3 leans on. Those sections need rewriting, not
just the components.

**Knock-on effects to handle deliberately:**

- Saira Stencil One and IBM Plex Mono become unused. Their `next/font` loaders, the committed
  `app/fonts/SairaStencilOne-Regular.ttf` and its OFL licence file can all go once nothing
  references them — but check first, because removing a font that is still referenced silently
  falls back to a system face.
- `--tex` (the ruled-paper background) is dossier-only and becomes unused.
- The play screen and Lexikon currently use monospace (`var(--fB)` resolving to IBM Plex Mono).
  Under campaign that becomes Public Sans, which changes how the dialogue boxes and the `[1][2][3]`
  choices read. Worth looking at on screen before assuming it is fine.

### 2. The animations from the prototype are wanted

The creators specifically asked for these. None are implemented yet — the current site is
completely static. Ten keyframe animations exist in
`Fityesz Chronicles Website Design/Fityesz Chronicles.dc.html`:

| Name | What it does | Where the prototype uses it |
|---|---|---|
| `fzIn` | fade + rise 10px | the workhorse — 8 usages, `.3s`–`.5s`, some staggered with delays |
| `fzFade` | plain fade | light transitions |
| `fzSlam` | scale 1.18 → 1, `.8s` | the hero headline landing |
| `fzStampIn` | scale 1.9 → .95 → 1, overshoot easing | rubber-stamp impact, two staggered instances |
| `fzTab` | fade + rise 12px | Lexikon panel switching |
| `fzCaret` | blinking caret | typewriter cursor |
| `fzMarquee` | translateX -50% | scrolling banner |
| `fzDrift` | background-position drift | the halftone field, slow movement |
| `fzWord` | translate -9% | word-level motion in a headline |
| `fzPulse` | expanding box-shadow ring | attention pulse on the accent |

Plus transitions — `transform .15s` on buttons (5 uses), meter fills at
`width .9s cubic-bezier(.2,.7,.2,1)`, and hover states, the commonest being
`transform: translate(-2px,-2px)` which slides a button into its own hard shadow.

**Two things not to lose when implementing:**

- Every one of these must be disabled under `prefers-reduced-motion: reduce`. Spec §4.1 already
  requires it for the typewriter; it applies to all of the above.
- The XP and lebukás meters should animate their width on change (`width .9s`), which is currently
  an instant jump.

### 3. The site does not match the design yet

The creators know and said so. The five pages were built from the message catalogue and the design
tokens under time pressure, not by porting the prototype's markup screen by screen. Layout,
spacing and composition all differ.

Next session should treat this as the main visual task: open the prototype, and bring each page to
match — landing first, since it is the one people see.

---

## Where the code stands

Live on the creators' own FTP hosting at `fityeszthegame.com`, as a static export.

| Done | |
|---|---|
| Next.js 16 app, Vitest, GitHub Actions CI | ✅ |
| Tricolour tokens, both directions, flag rail | ✅ (dossier now to be removed) |
| hu/en routing, 248 message keys, 4 self-hosted fonts | ✅ |
| Story engine — 10 tests against the Java values | ✅ |
| Prologue + Chapter 1 playable, autosaving to localStorage | ✅ |
| Landing, Szereplők, Lexikon, Támogatás | ✅ (not design-matched) |
| Static export + `.htaccess` for plain-file hosting | ✅ |

| Not built | Blocked on |
|---|---|
| Accounts, register/login | Supabase project; needs a server |
| Save sync, player dashboard | same |
| Download page + installers | Docker, `jpackage` CI in the game repo |
| Desktop device-code sign-in | Phase 3, the game repo |

`lib/features.ts` hides the download route behind `DOWNLOAD_ENABLED` so nothing links to a 404.

### Static export is a real constraint now

`next.config.ts` sets `output: 'export'`. That means **no middleware, no API routes, no server
components that run per-request**. Accounts and the gated download cannot be built on this host as
things stand. When that work starts, the first decision is: move to a Node host, or keep the static
site and put the backend somewhere else.

### Environment

The machine's system `node` is broken — a Homebrew formula (`merve`) links against a missing
`libsimdutf`. Until it is repaired, every npm command needs:

```bash
export PATH=/opt/homebrew/opt/node@22/bin:$PATH
```

### Housekeeping left over

Local-only refs still holding the pre-rewrite history, safe to delete once nobody wants it:

```bash
git tag -d backup-before-msg-rewrite
git for-each-ref --format='%(refname)' refs/original/ | xargs -n1 git update-ref -d
```

Commit messages no longer carry a `Co-Authored-By` trailer — the creators asked for it removed and
history was rewritten on 2026-09-25. Do not reintroduce it.

### Deferred findings from the first session

Recorded during review, none fixed:

- `app/[locale]/layout.tsx` is 325 lines with header and footer inline; extracting `<SiteHeader>`
  and `<SiteFooter>` would help every task that touches it.
- `'var(--dW)' as unknown as number` double-cast repeated 4× in the layout.
- `stripLocalePrefix` in `LocaleToggleClient` is untested.
- No mobile nav collapse — the header wraps via `flexWrap`, nothing is hidden, but it is unpolished
  at narrow widths.
- Saira Stencil One ships as a 91KB TTF; converting to woff2 (~40KB) needs a brotli-capable
  toolchain. May become moot if the dossier direction is dropped.
- A Vite "native config loader" warning prints on every `npm test`.

The full ledger, including every ruling made during execution and why, is in
`.superpowers/sdd/2026-09-24-fityesz-website-phase1/progress.md` (git-ignored, local only).
