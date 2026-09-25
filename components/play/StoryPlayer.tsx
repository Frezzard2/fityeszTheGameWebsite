'use client'

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import type { Locale } from '@/lib/constants'
import { applyChoice, initialState, EXPOSURE_LIMIT } from '@/lib/story/engine'
import type { Beat, CharacterId, PlayerState, Scene } from '@/lib/story/types'
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
  /** `ui.prologue` in the design prototype — kicker on the name prompt and the prologue's chapter card. */
  prologue: string
  /** `chapterN` — `%n` is replaced with the chapter number, same placeholder convention as `fill()`. */
  chapterN: string
  /** `found` — reused from the Lexikon's item-acquired tag; the prototype's own `ui.item` string has no message key. */
  found: string
  /** `decisions` — heading over the chapter-end recap of what the player chose. */
  decisions: string
  /** `savedLocal` — this run lives in this browser only; there are no accounts yet. */
  savedLocal: string
  /** `replay` — start the chapter again from the beginning. */
  replay: string
}

/** `Lang.java` uses printf placeholders; the player's name is the only argument. */
function fill(text: string, name: string): string {
  return text.replace(/%s/g, name)
}

/** Same convention as `fill()`, for the chapter-number placeholder in `chapterN`. */
function fillN(text: string, n: number): string {
  return text.replace(/%n/g, String(n))
}

const MONO = { fontFamily: 'var(--fB)' } as const

const CAP: CSSProperties = {
  fontFamily: 'var(--fB)',
  fontWeight: 700,
  fontSize: 11,
  letterSpacing: '.12em',
  textTransform: 'uppercase',
  color: 'var(--inkSoft)',
}

const CHAR_BY_ID = new Map(CHARACTERS.map((c) => [c.id, c]))

const ITEM_NAMES = new Map(
  (codex.items as { id: string; name: Record<string, string> }[]).map((it) => [it.id, it.name]),
)

function Meter({
  label,
  value,
  max,
  color,
}: {
  label: string
  value: number
  max: number
  color: string
}) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ color: 'var(--inkSoft)' }}>{label}</span>
      <div style={{ width: 88, height: 8, border: '1px solid var(--ink)', background: 'var(--paper2)' }}>
        <div className="fz-meter" style={{ width: `${pct}%`, height: '100%', background: color }} />
      </div>
      <span style={{ color }}>
        {value}
        {max === EXPOSURE_LIMIT ? `/${max}` : ''}
      </span>
    </div>
  )
}

function StatusBar({
  state,
  labels,
  locale,
  chapterLabel,
}: {
  state: PlayerState
  labels: PlayLabels
  locale: Locale
  chapterLabel: string
}) {
  return (
    <div
      data-testid="status-bar"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '10px 24px',
        padding: '12px 16px',
        background: 'var(--sheet)',
        border: 'var(--bw) solid var(--ink)',
        borderBottom: 0,
        ...MONO,
      }}
    >
      <div style={{ fontFamily: 'var(--fD)', fontWeight: 'var(--dW)', textTransform: 'uppercase', fontSize: 'clamp(16px,2.4cqw,22px)', lineHeight: 1.14 }}>
        {chapterLabel}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px 20px',
          marginLeft: 'auto',
          flexWrap: 'wrap',
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
        }}
      >
        <Meter label="XP" value={state.xp} max={100} color="var(--second)" />
        <Meter label={labels.exposure} value={state.lebukas} max={EXPOSURE_LIMIT} color="var(--accentText)" />
        <div>
          <div style={{ color: 'var(--inkSoft)' }}>{labels.itemsWord}</div>
          <div data-testid="status-items" style={{ color: 'var(--ink)', marginTop: 4, fontSize: 15 }}>
            {state.items.length === 0 ? '—' : state.items.length}
          </div>
        </div>
      </div>
      <div
        data-testid="status-xp"
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}
      >
        {state.xp}
      </div>
      <span hidden>{locale}</span>
    </div>
  )
}

/** The speaker's portrait card — the dossier direction's tilted case-file sheet is dropped. */
function Portrait({ speaker, locale, name }: { speaker: CharacterId; locale: Locale; name: string }) {
  const c = CHAR_BY_ID.get(speaker)
  if (!c) return null
  return (
    <div
      className="fz-in"
      style={{ position: 'absolute', right: 'clamp(12px,3cqw,32px)', top: 'clamp(12px,3cqw,28px)', width: 'clamp(96px,24cqw,190px)' }}
    >
      <div style={{ display: 'block', background: 'var(--accent)', color: 'var(--onAccent)', border: 'var(--bw) solid var(--onInk)' }}>
        <div style={{ position: 'relative', height: 'clamp(88px,20cqw,160px)', overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute',
              right: -6,
              bottom: 6,
              fontFamily: 'var(--fD)',
              fontWeight: 'var(--dW)',
              fontSize: 'clamp(72px,20cqw,150px)',
              lineHeight: 1,
              letterSpacing: '-.03em',
              backgroundImage: 'radial-gradient(circle,var(--onAccent) 2.2px,transparent 3px)',
              backgroundSize: '7px 7px',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {c.initials}
          </div>
        </div>
        <div style={{ padding: '10px 12px', borderTop: 'var(--bw) solid var(--onInk)', background: 'var(--ink)', color: 'var(--onInk)' }}>
          <div style={{ fontFamily: 'var(--fD)', fontWeight: 'var(--dW)', textTransform: 'uppercase', fontSize: 'clamp(14px,2.6cqw,20px)', lineHeight: 1.14 }}>
            {speakerName(speaker, name)[locale]}
          </div>
          <div style={{ marginTop: 4, fontFamily: 'var(--fB)', fontWeight: 600, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', opacity: 0.85 }}>
            {c.title[locale]}
          </div>
        </div>
      </div>
    </div>
  )
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
  // restored after mount. Seeding useState from it instead would desync
  // hydration. This is the one place the rule cannot be satisfied cleanly.
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

  /**
   * The chapter-end recap. `history` records which option index was taken at
   * each choice point; the text lives on the beat, so it is resolved here
   * rather than duplicated into the save.
   */
  const decisionLog = state.history.map((h) => {
    const source = allBeats.find((b) => b.kind === 'choice' && b.id === h.choicePointId)
    const option =
      source && source.kind === 'choice' ? source.options[h.optionIndex] : undefined
    return {
      id: h.choicePointId,
      text: option ? option.text[locale] : '',
      xp: option ? option.xp : 0,
      lebukas: option ? option.lebukas : 0,
    }
  })

  const beat = queue[i]
  const finished = i >= queue.length
  const exposed = state.status === 'exposed'

  // The last chapterCard at or before the current beat — drives the chapter
  // label and location badge, same as the prototype's per-scene `vn.chapter`
  // and `vn.loc`, without needing a new field on the story content.
  const currentCard = useMemo(() => {
    const upto = Math.min(i, queue.length - 1)
    for (let idx = upto; idx >= 0; idx--) {
      const b = queue[idx]
      if (b?.kind === 'chapterCard') return b
    }
    return null
  }, [queue, i])

  const chapterLabel = currentCard
    ? `${currentCard.number === 0 ? labels.prologue : fillN(labels.chapterN, currentCard.number)} · ${currentCard.title[locale]}`
    : ''
  const locationLabel = currentCard && currentCard.place[locale] ? currentCard.place[locale] : ''

  const advance = useCallback(() => {
    if (finished || exposed) return
    if (beat?.kind === 'choice') return // a choice waits for a number key
    setI((n) => n + 1)
  }, [beat, finished, exposed])

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

  useEffect(() => {
    if (name === null) return
    const onKey = (e: KeyboardEvent) => {
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

  if (name === null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
        <form
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
            border: 'var(--bw) solid var(--ink)',
            boxShadow: 'var(--sh)',
            padding: 'clamp(22px,3cqw,36px)',
            ...MONO,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--accentText)' }}>
            {labels.prologue}
          </div>
          <label
            htmlFor="player-name"
            style={{ display: 'block', marginTop: 12, fontFamily: 'var(--fD)', fontWeight: 'var(--dW)', textTransform: 'uppercase', fontSize: 'clamp(26px,4cqw,36px)', lineHeight: 1.14 }}
          >
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
              style={{
                flex: '1 1 200px',
                minWidth: 0,
                padding: 14,
                border: 'var(--bw) solid var(--ink)',
                background: 'var(--paper)',
                fontSize: 16,
                color: 'var(--ink)',
              }}
            />
            <button
              type="submit"
              data-testid="name-confirm"
              className="fz-btn"
              style={{
                padding: '14px 22px 13px',
                background: 'var(--accent)',
                color: 'var(--onAccent)',
                border: 'var(--bw) solid var(--ink)',
                boxShadow: 'var(--shS)',
                fontFamily: 'var(--fD)',
                fontWeight: 'var(--dW)',
                textTransform: 'uppercase',
                fontSize: 18,
                lineHeight: 1.14,
                cursor: 'pointer',
              }}
            >
              {labels.confirm}
            </button>
          </div>
          <p style={{ marginTop: 12, fontSize: 13, color: 'var(--inkSoft)' }}>{labels.nameNote}</p>
        </form>
      </div>
    )
  }

  return (
    <div>
      <StatusBar state={state} labels={labels} locale={locale} chapterLabel={chapterLabel} />
      <div
        style={{
          height: 5,
          background: 'var(--line)',
          borderLeft: 'var(--bw) solid var(--ink)',
          borderRight: 'var(--bw) solid var(--ink)',
        }}
      >
        <div
          className="fz-meter"
          style={{ height: '100%', width: `${queue.length > 1 ? Math.round((Math.min(i, queue.length) / (queue.length - 1)) * 100) : 100}%`, background: 'var(--accent)' }}
        />
      </div>

      <div
        key={i}
        className="fz-in"
        onClick={advance}
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--ink)',
          color: 'var(--onInk)',
          border: 'var(--bw) solid var(--ink)',
          minHeight: 'clamp(360px,52cqw,560px)',
          cursor: beat?.kind === 'choice' ? 'default' : 'pointer',
        }}
      >
        <div
          style={{
            display: 'block',
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle,var(--onInk) 1px,transparent 1.6px)',
            backgroundSize: '10px 10px',
            opacity: 0.13,
            WebkitMaskImage: 'radial-gradient(ellipse at 70% 25%,#000,transparent 72%)',
            maskImage: 'radial-gradient(ellipse at 70% 25%,#000,transparent 72%)',
          }}
        />

        {locationLabel && !exposed && (
          <div
            style={{
              position: 'absolute',
              left: 16,
              top: 16,
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              ...MONO,
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: '.14em',
              textTransform: 'uppercase',
            }}
          >
            <span style={{ width: 8, height: 8, background: 'var(--accent)' }} />
            {locationLabel}
          </div>
        )}

        {exposed && (
          <div
            data-testid="exposed"
            style={{
              display: 'flex',
              position: 'absolute',
              inset: 0,
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: 14,
              padding: '40px 24px',
              background: 'var(--accent)',
              color: 'var(--onAccent)',
            }}
          >
            <p className="fz-slam" style={{ fontFamily: 'var(--fD)', fontWeight: 'var(--dW)', textTransform: 'uppercase', fontSize: 'clamp(36px,7cqw,64px)', lineHeight: 1, margin: 0 }}>
              {labels.exposed}
            </p>
            <p style={{ ...MONO, fontSize: 'clamp(15px,1.6cqw,19px)', margin: 0 }}>{labels.pressfound}</p>
          </div>
        )}

        {!exposed && beat?.kind === 'chapterCard' && (
          <div
            data-testid="beat"
            style={{
              display: 'flex',
              position: 'absolute',
              inset: 0,
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
            <div style={{ ...MONO, fontWeight: 700, fontSize: 14, letterSpacing: '.24em', textTransform: 'uppercase' }}>
              {beat.number === 0 ? labels.prologue : fillN(labels.chapterN, beat.number)}
            </div>
            <h2 className="fz-slam" style={{ fontFamily: 'var(--fD)', fontWeight: 'var(--dW)', textTransform: 'uppercase', fontSize: 'clamp(40px,8cqw,88px)', lineHeight: 0.98, margin: 0 }}>
              {beat.title[locale]}
            </h2>
            <p style={{ ...MONO, maxWidth: '30em', fontSize: 'clamp(15px,1.6cqw,19px)', fontStyle: 'italic', margin: 0 }}>
              &bdquo;{beat.quote[locale]}&rdquo;
            </p>
          </div>
        )}

        {!exposed && beat?.kind === 'item' && (
          <div
            data-testid="beat"
            className="fz-stamp"
            style={{
              position: 'absolute',
              left: '50%',
              top: 'clamp(50px,10cqw,110px)',
              transform: 'translateX(-50%) rotate(-3deg)',
              background: 'var(--sheet)',
              color: 'var(--ink)',
              border: 'var(--bw) solid var(--accent)',
              boxShadow: 'var(--sh)',
              padding: '16px 26px',
              textAlign: 'center',
            }}
          >
            <div style={{ ...MONO, fontWeight: 700, fontSize: 12, letterSpacing: '.16em', color: 'var(--accentText)' }}>{labels.found}</div>
            <div style={{ marginTop: 8, fontFamily: 'var(--fD)', fontWeight: 'var(--dW)', fontSize: 'clamp(22px,4cqw,34px)', lineHeight: 1.14, whiteSpace: 'nowrap' }}>
              {ITEM_NAMES.get(beat.item)?.[locale] ?? beat.item}
            </div>
          </div>
        )}

        {!exposed && beat?.kind === 'dialogue' && <Portrait speaker={beat.speaker} locale={locale} name={name} />}

        {!exposed && (beat?.kind === 'narration' || beat?.kind === 'dialogue') && (
          <div
            data-testid="beat"
            style={{ position: 'absolute', left: 'clamp(12px,3cqw,32px)', right: 'clamp(12px,3cqw,32px)', bottom: 'clamp(12px,3cqw,26px)' }}
          >
            <div
              style={{
                position: 'relative',
                background: 'var(--sheet)',
                color: 'var(--ink)',
                border: 'var(--bw) solid var(--onInk)',
                boxShadow: 'var(--shS)',
                padding: '20px clamp(16px,2.4cqw,24px) 16px',
              }}
            >
              {beat.kind === 'dialogue' && (
                <div
                  className="fz-tab"
                  style={{
                    position: 'absolute',
                    left: -3,
                    top: -34,
                    padding: '8px 12px 7px',
                    background: 'var(--accent)',
                    color: 'var(--onAccent)',
                    border: 'var(--bw) solid var(--onInk)',
                    fontFamily: 'var(--fD)',
                    fontWeight: 'var(--dW)',
                    textTransform: 'uppercase',
                    fontSize: 18,
                    lineHeight: 1.14,
                  }}
                >
                  {speakerName(beat.speaker, name)[locale]}
                </div>
              )}
              <p
                style={{
                  ...MONO,
                  fontSize: 'clamp(15px,1.6cqw,18px)',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-line',
                  fontStyle: beat.kind === 'narration' ? 'italic' : 'normal',
                  margin: 0,
                }}
              >
                {fill(beat.text[locale], name)}
              </p>
            </div>
          </div>
        )}

        {!exposed && beat?.kind === 'choice' && (
          <div
            data-testid="beat"
            style={{
              position: 'absolute',
              left: 'clamp(12px,3cqw,32px)',
              right: 'clamp(12px,3cqw,32px)',
              bottom: 'clamp(12px,3cqw,26px)',
              background: 'var(--sheet)',
              color: 'var(--ink)',
              border: 'var(--bw) solid var(--onInk)',
              boxShadow: 'var(--shS)',
              padding: 'clamp(16px,2.4cqw,24px)',
              cursor: 'default',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '8px 16px', alignItems: 'baseline' }}>
              <div style={{ fontFamily: 'var(--fD)', fontWeight: 'var(--dW)', textTransform: 'uppercase', fontSize: 'clamp(20px,3cqw,28px)', lineHeight: 1.14 }}>
                {fill(beat.prompt[locale], name)}
              </div>
              <div style={{ ...MONO, fontWeight: 700, fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--inkSoft)' }}>
                {labels.chooseHint}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
              {beat.options.map((o, n) => (
                <button
                  key={n}
                  data-testid={`choice-${n + 1}`}
                  className="fz-btn"
                  onClick={() => choose(n)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    width: '100%',
                    textAlign: 'left',
                    padding: '13px 16px',
                    border: 'var(--bw) solid var(--ink)',
                    background: 'var(--sheet)',
                    color: 'var(--ink)',
                    cursor: 'pointer',
                    ...MONO,
                    fontSize: 16,
                    lineHeight: 1.35,
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
                      fontWeight: 700,
                      fontSize: 14,
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

        {!exposed && finished && (
          <div
            data-testid="chapter-end"
            style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, overflow: 'auto' }}
          >
            <div style={{ width: '100%', maxWidth: 640, background: 'var(--sheet)', color: 'var(--ink)', border: 'var(--bw) solid var(--onInk)', boxShadow: 'var(--shS)' }}>
              <div style={{ background: 'var(--accent)', color: 'var(--onAccent)', padding: 'clamp(18px,3cqw,28px)' }}>
                <div style={{ ...MONO, fontWeight: 700, fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase' }}>{labels.endKicker}</div>
              </div>
              <div style={{ padding: 'clamp(16px,3cqw,28px)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 1, background: 'var(--line)', border: '1px solid var(--line)' }}>
                  <div style={{ background: 'var(--sheet)', padding: 14 }}>
                    <div style={CAP}>XP</div>
                    <div style={{ marginTop: 6, fontFamily: 'var(--fD)', fontWeight: 'var(--dW)', fontSize: 32, lineHeight: 1.14 }}>{state.xp}</div>
                  </div>
                  <div style={{ background: 'var(--sheet)', padding: 14 }}>
                    <div style={CAP}>{labels.exposure}</div>
                    <div style={{ marginTop: 6, fontFamily: 'var(--fD)', fontWeight: 'var(--dW)', fontSize: 32, lineHeight: 1.14, color: 'var(--accentText)' }}>
                      {state.lebukas}/{EXPOSURE_LIMIT}
                    </div>
                  </div>
                  <div style={{ background: 'var(--sheet)', padding: 14 }}>
                    <div style={CAP}>{labels.itemsWord}</div>
                    <div style={{ marginTop: 8, ...MONO, fontWeight: 700, fontSize: 14 }}>
                      {state.items.length === 0 ? '—' : state.items.length}
                    </div>
                  </div>
                </div>
                <p style={{ marginTop: 16, ...MONO, fontSize: 14 }}>{labels.endNext}</p>

                {decisionLog.length > 0 && (
                  <div style={{ marginTop: 20 }}>
                    <div style={CAP}>{labels.decisions}</div>
                    <ol style={{ listStyle: 'none', margin: '10px 0 0', padding: 0 }}>
                      {decisionLog.map((d, n) => (
                        <li
                          key={`${d.id}-${n}`}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 12,
                            flexWrap: 'wrap',
                            padding: '10px 0',
                            borderTop: '1px solid var(--line)',
                            ...MONO,
                            fontSize: 13,
                          }}
                        >
                          <span style={{ flex: '1 1 14em' }}>
                            <span style={{ color: 'var(--accentText)', fontWeight: 700 }}>
                              [{n + 1}]
                            </span>{' '}
                            {d.text}
                          </span>
                          <span style={{ color: 'var(--inkSoft)', whiteSpace: 'nowrap' }}>
                            {d.xp > 0 ? `+${d.xp} XP` : '—'}
                            {d.lebukas !== 0
                              ? ` · ${d.lebukas > 0 ? '+' : ''}${d.lebukas} ${labels.exposure}`
                              : ''}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                <p style={{ marginTop: 16, ...MONO, fontSize: 12, color: 'var(--inkSoft)' }}>
                  {labels.savedLocal}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {!finished && !exposed && beat?.kind !== 'choice' && (
        <p style={{ ...MONO, fontSize: 12, color: 'var(--inkSoft)', marginTop: 16 }}>{labels.playHelp}</p>
      )}

      {(finished || exposed) && (
        <button
          className="fz-btn"
          onClick={() => {
            clearLocalSave()
            setState(initialState(name))
            setQueue(allBeats)
            setI(0)
          }}
          style={{
            marginTop: 20,
            padding: '10px 18px',
            border: 'var(--bw) solid var(--ink)',
            background: 'transparent',
            color: 'var(--ink)',
            fontFamily: 'var(--fD)',
            fontWeight: 'var(--dW)',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          {finished && !exposed ? labels.replay : labels.restart}
        </button>
      )}
    </div>
  )
}
