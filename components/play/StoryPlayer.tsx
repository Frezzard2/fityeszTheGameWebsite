'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Locale } from '@/lib/constants'
import { applyChoice, initialState, EXPOSURE_LIMIT } from '@/lib/story/engine'
import type { Beat, PlayerState, Scene } from '@/lib/story/types'
import { CHARACTERS, speakerName } from '@/lib/design/characters'
import { loadLocalSave, saveLocalSave, clearLocalSave } from '@/lib/story/localSave'
import codex from '@/lib/story/content/codex.json'

export type PlayLabels = {
  namePh: string
  confirm: string
  nameNote: string
  namePrompt: string
  playHelp: string
  chooseHint: string
  next: string
  exposure: string
  itemsWord: string
  restart: string
  endKicker: string
  endNext: string
  gateTitle: string
  gateSub: string
  gateCta: string
  gateSkip: string
  gateSkipNote: string
  exposed: string
  pressfound: string
  prologue: string
  /** `%n` is replaced with the chapter number. */
  chapterN: string
  found: string
  decisions: string
  savedLocal: string
  replay: string
  /** `ui.enter` from the game — the "press Enter to continue" hint. */
  enterHint: string
}

/**
 * The title without its own label prefix.
 *
 * The game names the prologue "Prológus: A mélyPont", so printing it under a
 * PROLÓGUS label says the word twice. Chapter titles have no prefix and pass
 * through untouched.
 */
function bareTitle(title: string): string {
  const at = title.indexOf(': ')
  return at === -1 ? title : title.slice(at + 2)
}

/** The game's text uses printf placeholders; the player's name is the only argument. */
function fill(text: string, name: string): string {
  return text.replace(/%s/g, name)
}

const CAP: CSSProperties = {
  font: '700 12px/1 var(--fL)',
  letterSpacing: '.12em',
  textTransform: 'uppercase',
  color: 'var(--inkSoft)',
}

const DISPLAY: CSSProperties = {
  fontFamily: 'var(--fD)',
  fontWeight: 'var(--dW)' as unknown as number,
  textTransform: 'uppercase',
  lineHeight: 1.14,
}

/**
 * Reveals `text` a character at a time.
 *
 * The count is the state, and the component slices the CURRENT text with it,
 * so a stale count can only ever render a prefix — never the wrong string and
 * never nothing. The timer lives in a ref so skipping can stop it; an earlier
 * version set the text to complete without clearing the interval, and the next
 * tick overwrote the finished line with a short prefix.
 */
function useTypewriter(text: string, enabled: boolean) {
  const [count, setCount] = useState(text.length)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const textRef = useRef(text)

  const stop = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    // Typing IS the effect: the text arrives over time from a timer, which is
    // the external-system case useEffect exists for.
    textRef.current = text
    stop()

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    if (!enabled || reduced || text.length === 0) {
      setCount(text.length)
      return
    }

    setCount(0)
    timerRef.current = setInterval(() => {
      setCount((c) => {
        const next = c + 1
        if (next >= textRef.current.length) stop()
        return next
      })
    }, 18)

    return stop
  }, [text, enabled, stop])
  /* eslint-enable react-hooks/set-state-in-effect */

  /** Jump to the end. Returns true if there was anything left to reveal. */
  const finish = useCallback(() => {
    if (count >= text.length) return false
    stop()
    setCount(text.length)
    return true
  }, [count, text.length, stop])

  // Slicing here — rather than storing the sliced string — is what makes a
  // stale count harmless.
  return { shown: text.slice(0, count), typing: count < text.length, finish }
}

export function StoryPlayer({
  scenes,
  labels,
  locale,
  startName,
}: {
  scenes: Scene[]
  labels: PlayLabels
  locale: Locale
  /** Test hook: skips the name prompt. Production never passes it. */
  startName?: string
}) {
  const allBeats = useMemo(() => scenes.flatMap((s) => s.beats), [scenes])

  const [name, setName] = useState<string | null>(startName ?? null)
  const [draft, setDraft] = useState('')
  const [queue, setQueue] = useState<Beat[]>(allBeats)
  const [i, setI] = useState(0)
  const [state, setState] = useState<PlayerState>(() => initialState(startName ?? ''))
  const [restored, setRestored] = useState(false)

  // localStorage does not exist during SSR, so a persisted run can only be
  // restored after mount. Seeding useState from it would desync hydration.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (restored || startName) return
    const saved = loadLocalSave()
    if (saved && saved.name) {
      setState(saved)
      setName(saved.name)
    }
    setRestored(true)
  }, [restored, startName])
  /* eslint-enable react-hooks/set-state-in-effect */

  const beat = queue[i]
  const finished = i >= queue.length
  const exposed = state.status === 'exposed'

  /** The chapter card most recently passed — drives the header and the watermark. */
  const currentCard = useMemo(() => {
    for (let n = Math.min(i, queue.length - 1); n >= 0; n--) {
      const b = queue[n]
      if (b?.kind === 'chapterCard') return b
    }
    return undefined
  }, [queue, i])

  const chapterLabel = currentCard
    ? currentCard.number === 0
      ? labels.prologue
      : labels.chapterN.replace('%n', String(currentCard.number))
    : labels.prologue

  const isTalk = beat?.kind === 'narration' || beat?.kind === 'dialogue'
  const talkText = isTalk && name ? fill(beat.text[locale], name) : ''
  const { shown: typed, typing, finish } = useTypewriter(talkText, isTalk)

  const speakerCard =
    beat?.kind === 'dialogue' ? CHARACTERS.find((c) => c.id === beat.speaker) : undefined

  const decisionLog = state.history.map((h) => {
    const source = allBeats.find((b) => b.kind === 'choice' && b.id === h.choicePointId)
    const option = source && source.kind === 'choice' ? source.options[h.optionIndex] : undefined
    return {
      id: h.choicePointId,
      question: source && source.kind === 'choice' && name ? fill(source.prompt[locale], name) : '',
      answer: option ? option.text[locale] : '',
      xp: option ? option.xp : 0,
      lebukas: option ? option.lebukas : 0,
    }
  })

  const advance = useCallback(() => {
    if (finished || exposed) return
    if (beat?.kind === 'choice') return
    if (finish()) return // the first press completes the typing
    setI((n) => n + 1)
  }, [beat, finished, exposed, finish])

  const choose = useCallback(
    (optionIndex: number) => {
      if (!beat || beat.kind !== 'choice') return
      const option = beat.options[optionIndex]
      if (!option) return
      const next = applyChoice(state, beat.id, optionIndex, option)
      setState(next)
      saveLocalSave(next)
      setQueue((q) => [...q.slice(0, i + 1), ...option.response, ...q.slice(i + 1)])
      setI((n) => n + 1)
    },
    [beat, i, state],
  )

  const restart = useCallback(() => {
    clearLocalSave()
    setState(initialState(name ?? ''))
    setQueue(allBeats)
    setI(0)
  }, [allBeats, name])

  useEffect(() => {
    if (name === null) return
    const onKey = (e: KeyboardEvent) => {
      // Held keys repeat; without this, leaning on Enter tears through several
      // beats at once and the text looks like it is vanishing.
      if (e.repeat) return
      if (e.key === 'Enter' || e.key === ' ') {
        advance()
        return
      }
      const n = Number(e.key)
      if (Number.isInteger(n) && n >= 1 && n <= 9) choose(n - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [advance, choose, name])

  const progress = queue.length ? Math.min(100, Math.round((i / queue.length) * 100)) : 0
  const exposurePct = Math.min(100, Math.round((state.lebukas / EXPOSURE_LIMIT) * 100))

  const panelBase: CSSProperties = {
    position: 'absolute',
    left: 'clamp(12px,3cqw,40px)',
    right: 'clamp(12px,3cqw,40px)',
    bottom: 'clamp(12px,3cqw,32px)',
    background: 'var(--sheet)',
    color: 'var(--ink)',
    border: 'var(--bw) solid var(--onInk)',
    boxShadow: 'var(--shS)',
  }

  return (
    <div style={{ containerType: 'inline-size' }}>
      <div
        data-testid="status-bar"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '10px 26px',
          padding: '12px 16px',
          background: 'var(--sheet)',
          border: 'var(--bw) solid var(--ink)',
          borderBottom: 0,
        }}
      >
        <div style={{ ...DISPLAY, fontSize: 24 }}>{chapterLabel}</div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px 20px',
            marginLeft: 'auto',
            flexWrap: 'wrap',
            font: '700 12px/1 var(--fL)',
            letterSpacing: '.1em',
            textTransform: 'uppercase',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            XP <span data-testid="status-xp" style={{ fontSize: 18 }}>{state.xp}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {labels.exposure}
            <div style={{ width: 100, height: 10, border: '1px solid var(--ink)', background: 'var(--paper2)' }}>
              <div className="fz-meter" style={{ height: '100%', width: exposurePct + '%', background: 'var(--danger)' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            {labels.itemsWord} <span data-testid="status-items" style={{ fontSize: 18 }}>{state.items.length}</span>
          </div>
          <button
            onClick={restart}
            className="fz-btn"
            style={{
              border: '1px solid var(--ink)',
              background: 'transparent',
              cursor: 'pointer',
              padding: '7px 10px',
              font: '700 11px/1 var(--fL)',
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              color: 'var(--ink)',
            }}
          >
            {labels.restart}
          </button>
        </div>
      </div>

      <div style={{ height: 5, background: 'var(--line)', borderLeft: 'var(--bw) solid var(--ink)', borderRight: 'var(--bw) solid var(--ink)' }}>
        <div style={{ height: '100%', width: progress + '%', background: 'var(--accent)', transition: 'width .4s' }} />
      </div>

      <div
        onClick={advance}
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--ink)',
          color: 'var(--onInk)',
          border: 'var(--bw) solid var(--ink)',
          minHeight: 'clamp(680px,62cqw,880px)',
          cursor: beat?.kind === 'choice' || finished || name === null ? 'default' : 'pointer',
          userSelect: 'none',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle,var(--onInk) 1px,transparent 1.6px)',
            backgroundSize: '10px 10px',
            opacity: 0.13,
            WebkitMaskImage: 'radial-gradient(ellipse at 70% 25%,#000,transparent 72%)',
            maskImage: 'radial-gradient(ellipse at 70% 25%,#000,transparent 72%)',
          }}
        />

        {currentCard && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: '-.04em',
              top: '9%',
              ...DISPLAY,
              fontSize: '22cqw',
              lineHeight: 0.8,
              color: 'var(--accent)',
              opacity: 0.22,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            {currentCard.title[locale]}
          </div>
        )}

        {currentCard && currentCard.place[locale] && (
          <div
            style={{
              position: 'absolute',
              left: 20,
              top: 18,
              right: 20,
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              font: '700 12px/1.3 var(--fL)',
              letterSpacing: '.14em',
              textTransform: 'uppercase',
            }}
          >
            <span style={{ flex: 'none', width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
            {currentCard.place[locale]}
          </div>
        )}

        {speakerCard && (
          <div className="fz-in" style={{ position: 'absolute', right: 'clamp(20px,4cqw,56px)', top: 60, width: 230, maxWidth: '38%' }}>
            <div style={{ background: 'var(--accent)', color: 'var(--onAccent)', border: 'var(--bw) solid var(--onInk)' }}>
              <div style={{ position: 'relative', height: 210, overflow: 'hidden' }}>
                <div
                  style={{
                    position: 'absolute',
                    right: -6,
                    bottom: 10,
                    ...DISPLAY,
                    fontSize: 190,
                    lineHeight: 1,
                    letterSpacing: '-.03em',
                    backgroundImage: 'radial-gradient(circle,var(--onAccent) 2.4px,transparent 3px)',
                    backgroundSize: '7px 7px',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  {speakerCard.initials}
                </div>
              </div>
              <div style={{ padding: '12px 14px', borderTop: 'var(--bw) solid var(--onInk)', background: 'var(--ink)', color: 'var(--onInk)' }}>
                <div style={{ ...DISPLAY, fontSize: 24 }}>{speakerCard.name[locale]}</div>
                <div style={{ marginTop: 6, font: '600 11px/1.3 var(--fL)', letterSpacing: '.1em', textTransform: 'uppercase', opacity: 0.85 }}>
                  {speakerCard.title[locale]}
                </div>
              </div>
            </div>
          </div>
        )}

        {beat?.kind === 'item' && (
          <div
            className="fz-stamp"
            style={{
              position: 'absolute',
              left: '50%',
              top: 'clamp(70px,10cqw,130px)',
              transform: 'translateX(-50%) rotate(-3deg)',
              background: 'var(--sheet)',
              color: 'var(--ink)',
              border: 'var(--bw) solid var(--accentText)',
              padding: '14px 20px',
              textAlign: 'center',
              maxWidth: '86%',
            }}
          >
            <div style={{ font: '700 12px/1 var(--fL)', letterSpacing: '.16em', color: 'var(--accentText)' }}>{labels.found}</div>
            <div style={{ marginTop: 8, ...DISPLAY, fontSize: 'clamp(20px,4cqw,40px)' }}>
              {codex.items.find((it) => it.id === beat.item)?.name[locale] ?? beat.item}
            </div>
          </div>
        )}

        {beat?.kind === 'chapterCard' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: 18,
              padding: '40px 24px',
              background: 'var(--accent)',
              color: 'var(--onAccent)',
            }}
          >
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'radial-gradient(circle,var(--onAccent) 1.2px,transparent 1.8px)',
                backgroundSize: '10px 10px',
                opacity: 0.16,
                WebkitMaskImage: 'linear-gradient(to top,#000,transparent)',
                maskImage: 'linear-gradient(to top,#000,transparent)',
              }}
            />
            <div style={{ position: 'relative', font: '700 14px/1 var(--fL)', letterSpacing: '.24em', textTransform: 'uppercase' }}>
              {beat.number === 0 ? labels.prologue : labels.chapterN.replace('%n', String(beat.number))}
            </div>
            <div className="fz-slam" style={{ position: 'relative', ...DISPLAY, fontSize: 'clamp(46px,9cqw,132px)', lineHeight: 0.98 }}>
              {bareTitle(beat.title[locale])}
            </div>
            <div className="fz-in fz-d4" style={{ position: 'relative', maxWidth: '30em', fontSize: 'clamp(16px,1.6cqw,21px)', fontStyle: 'italic' }}>
              &bdquo;{beat.quote[locale]}&rdquo;
            </div>
            <div style={{ position: 'relative', marginTop: 14, font: '600 12px/1 var(--fL)', letterSpacing: '.06em' }}>{labels.enterHint}</div>
          </div>
        )}

        {isTalk && name && (
          <div data-testid="beat" className="fz-in" style={panelBase}>
            <div style={{ position: 'relative', padding: '24px clamp(18px,2.4cqw,28px) 16px' }}>
              {beat.kind === 'dialogue' && (
                <div
                  className="fz-tab"
                  style={{
                    position: 'absolute',
                    left: -3,
                    top: -36,
                    padding: '9px 14px 8px',
                    background: 'var(--accent)',
                    color: 'var(--onAccent)',
                    border: 'var(--bw) solid var(--onInk)',
                    ...DISPLAY,
                    fontSize: 20,
                  }}
                >
                  {speakerName(beat.speaker, name)[locale]}
                </div>
              )}
              <div
                style={{
                  fontSize: 'clamp(17px,1.7cqw,24px)',
                  lineHeight: 1.55,
                  whiteSpace: 'pre-line',
                  minHeight: '3.1em',
                  fontStyle: beat.kind === 'narration' ? 'italic' : 'normal',
                }}
              >
                {typed}
                {typing && <span className="fz-caret">&#9611;</span>}
              </div>
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', font: '600 12px/1.2 var(--fL)', color: 'var(--inkSoft)' }}>
                {labels.enterHint}
              </div>
            </div>
          </div>
        )}

        {beat?.kind === 'choice' && name && (
          <div data-testid="beat" onClick={(e) => e.stopPropagation()} style={{ ...panelBase, padding: 'clamp(16px,2.4cqw,24px)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '8px 16px', alignItems: 'baseline' }}>
              <div style={{ ...DISPLAY, fontSize: 'clamp(19px,3cqw,32px)' }}>{fill(beat.prompt[locale], name)}</div>
              <div style={{ font: '700 12px/1 var(--fL)', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--inkSoft)' }}>
                {labels.chooseHint}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
              {beat.options.map((o, n) => (
                <button
                  key={n}
                  data-testid={'choice-' + (n + 1)}
                  onClick={() => choose(n)}
                  className="fz-in"
                  style={{
                    animationDelay: n * 90 + 'ms',
                    transition: 'border-color .2s ease, background-color .2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    textAlign: 'left',
                    padding: 12,
                    background: 'var(--paper)',
                    color: 'var(--ink)',
                    border: '1px solid var(--ink)',
                    cursor: 'pointer',
                    font: 'inherit',
                    fontSize: 'clamp(15px,1.4cqw,17px)',
                  }}
                >
                  <span
                    style={{
                      flex: 'none',
                      width: 30,
                      height: 30,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--ink)',
                      color: 'var(--onInk)',
                      font: '700 14px/1 var(--fL)',
                    }}
                  >
                    {n + 1}
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>{o.text[locale]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {exposed && (
          <div
            data-testid="exposed"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: 14,
              padding: 40,
              background: 'var(--ink)',
            }}
          >
            <div className="fz-slam" style={{ ...DISPLAY, fontSize: 'clamp(36px,7cqw,96px)', color: 'var(--accent)' }}>{labels.exposed}</div>
            <p style={{ maxWidth: '30em', fontSize: 18 }}>{labels.pressfound}</p>
            <button
              onClick={restart}
              className="fz-btn"
              style={{ marginTop: 10, padding: '14px 20px 13px', background: 'var(--accent)', color: 'var(--onAccent)', border: 'var(--bw) solid var(--onInk)', ...DISPLAY, fontSize: 21, cursor: 'pointer' }}
            >
              {labels.restart}
            </button>
          </div>
        )}

        {name === null && (
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <form
              className="fz-in"
              onSubmit={(e) => {
                e.preventDefault()
                const v = draft.trim()
                if (!v) return
                setName(v)
                setState(initialState(v))
              }}
              style={{
                width: '100%',
                maxWidth: 560,
                background: 'var(--sheet)',
                color: 'var(--ink)',
                border: 'var(--bw) solid var(--onInk)',
                boxShadow: 'var(--sh)',
                padding: 'clamp(22px,3cqw,36px)',
              }}
            >
              <div style={{ font: '700 12px/1 var(--fL)', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--accentText)' }}>{labels.prologue}</div>
              <label htmlFor="player-name" style={{ display: 'block', marginTop: 12, ...DISPLAY, fontSize: 'clamp(24px,4cqw,38px)' }}>
                {labels.namePrompt}
              </label>
              <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
                <input
                  id="player-name"
                  data-testid="name-input"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={labels.namePh}
                  maxLength={24}
                  style={{ flex: '1 1 220px', minWidth: 0, padding: 14, border: 'var(--bw) solid var(--ink)', background: 'var(--paper)', color: 'var(--ink)', font: 'inherit' }}
                />
                <button
                  type="submit"
                  data-testid="name-confirm"
                  className="fz-btn"
                  style={{ padding: '14px 22px 13px', background: 'var(--accent)', color: 'var(--onAccent)', border: 'var(--bw) solid var(--ink)', boxShadow: 'var(--shS)', ...DISPLAY, fontSize: 21, cursor: 'pointer' }}
                >
                  {labels.confirm}
                </button>
              </div>
              <p style={{ margin: '12px 0 0', fontSize: 13, color: 'var(--inkSoft)' }}>{labels.nameNote}</p>
            </form>
          </div>
        )}

        {!exposed && finished && (
          <div
            data-testid="chapter-end"
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'relative', padding: '54px clamp(14px,3cqw,40px) clamp(14px,3cqw,40px)', display: 'flex', justifyContent: 'center' }}
          >
            <div className="fz-in" style={{ width: '100%', maxWidth: 860, background: 'var(--sheet)', color: 'var(--ink)', border: 'var(--bw) solid var(--onInk)', boxShadow: 'var(--shS)' }}>
              <div style={{ background: 'var(--accent)', color: 'var(--onAccent)', padding: 'clamp(20px,3cqw,32px)' }}>
                <div style={{ font: '700 12px/1 var(--fL)', letterSpacing: '.16em', textTransform: 'uppercase' }}>{labels.endKicker}</div>
                <div style={{ marginTop: 10, ...DISPLAY, fontSize: 'clamp(36px,6cqw,80px)' }}>{currentCard ? bareTitle(currentCard.title[locale]) : ''}</div>
              </div>
              <div style={{ padding: 'clamp(18px,3cqw,32px)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 1, background: 'var(--line)', border: '1px solid var(--line)' }}>
                  <div style={{ background: 'var(--sheet)', padding: 16 }}>
                    <div style={CAP}>XP</div>
                    <div style={{ marginTop: 8, ...DISPLAY, fontSize: 32 }}>{state.xp}</div>
                  </div>
                  <div style={{ background: 'var(--sheet)', padding: 16 }}>
                    <div style={CAP}>{labels.exposure}</div>
                    <div style={{ marginTop: 8, ...DISPLAY, fontSize: 32, color: 'var(--accentText)' }}>
                      {state.lebukas}/{EXPOSURE_LIMIT}
                    </div>
                  </div>
                  <div style={{ background: 'var(--sheet)', padding: 16 }}>
                    <div style={CAP}>{labels.itemsWord}</div>
                    <div style={{ marginTop: 8, ...DISPLAY, fontSize: 32 }}>{state.items.length}</div>
                  </div>
                </div>

                {decisionLog.length > 0 && (
                  <>
                    <div style={{ ...CAP, marginTop: 24, letterSpacing: '.14em' }}>{labels.decisions}</div>
                    {decisionLog.map((d, n) => (
                      <div key={d.id + '-' + n} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '4px 16px', padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
                        <div style={{ minWidth: 0, flex: '1 1 300px' }}>
                          <div style={{ fontSize: 13, color: 'var(--inkSoft)' }}>{d.question}</div>
                          <div style={{ fontSize: 17, fontWeight: 600, marginTop: 2 }}>{d.answer}</div>
                        </div>
                        <div style={{ font: '600 13px/1.3 var(--fL)', color: 'var(--accentText)', alignSelf: 'center', whiteSpace: 'nowrap' }}>
                          {d.xp > 0 ? '+' + d.xp + ' XP' : '—'}
                          {d.lebukas !== 0 ? ' · ' + (d.lebukas > 0 ? '+' : '') + d.lebukas : ''}
                        </div>
                      </div>
                    ))}
                  </>
                )}

                <div style={{ marginTop: 16, fontSize: 15 }}>{labels.endNext}</div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 22, alignItems: 'center' }}>
                  <button
                    onClick={restart}
                    className="fz-btn"
                    style={{ padding: '14px 20px 13px', background: 'transparent', color: 'var(--ink)', border: 'var(--bw) solid var(--ink)', ...DISPLAY, fontSize: 21, cursor: 'pointer' }}
                  >
                    {labels.replay}
                  </button>
                  <span style={{ fontSize: 13, color: 'var(--inkSoft)' }}>{labels.savedLocal}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <p style={{ margin: '14px 0 0', fontSize: 13, color: 'var(--inkSoft)' }}>{labels.playHelp}</p>
    </div>
  )
}
