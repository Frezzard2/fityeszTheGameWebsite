'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Locale } from '@/lib/constants'
import { applyChoice, initialState, EXPOSURE_LIMIT } from '@/lib/story/engine'
import type { Beat, PlayerState, Scene } from '@/lib/story/types'
import { speakerName } from '@/lib/design/characters'
import { loadLocalSave, saveLocalSave, clearLocalSave } from '@/lib/story/localSave'

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
}

/** `Lang.java` uses printf placeholders; the player's name is the only argument. */
function fill(text: string, name: string): string {
  return text.replace(/%s/g, name)
}

const MONO = { fontFamily: 'var(--fB)' } as const

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
    <div style={{ minWidth: 150 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 11,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          color: 'var(--inkSoft)',
        }}
      >
        <span>{label}</span>
        <span style={{ color }}>
          {value}
          {max === EXPOSURE_LIMIT ? ` / ${max}` : ''}
        </span>
      </div>
      <div style={{ height: 6, background: 'var(--paper2)', border: '1px solid var(--line)', marginTop: 4 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color }} />
      </div>
    </div>
  )
}

function StatusBar({
  state,
  labels,
  locale,
}: {
  state: PlayerState
  labels: PlayLabels
  locale: Locale
}) {
  return (
    <div
      data-testid="status-bar"
      style={{
        display: 'flex',
        gap: 24,
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        borderBottom: 'var(--bw) solid var(--ink)',
        paddingBottom: 12,
        marginBottom: 20,
        ...MONO,
      }}
    >
      <Meter label="XP" value={state.xp} max={100} color="var(--second)" />
      <Meter
        label={labels.exposure}
        value={state.lebukas}
        max={EXPOSURE_LIMIT}
        color="var(--accentText)"
      />
      <div style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--inkSoft)' }}>
        <div>{labels.itemsWord}</div>
        <div data-testid="status-items" style={{ color: 'var(--ink)', marginTop: 4 }}>
          {state.items.length === 0 ? '—' : state.items.length}
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

function Nameplate({ children }: { children: string }) {
  return (
    <div
      style={{
        display: 'inline-block',
        background: 'var(--accent)',
        color: 'var(--onAccent)',
        padding: '5px 12px',
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '.1em',
        textTransform: 'uppercase',
        ...MONO,
      }}
    >
      {children}
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

  const beat = queue[i]
  const finished = i >= queue.length
  const exposed = state.status === 'exposed'

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
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const v = draft.trim()
          if (!v) return
          setName(v)
          setState(initialState(v))
        }}
        style={{ maxWidth: 480, ...MONO }}
      >
        <label htmlFor="player-name" style={{ display: 'block', marginBottom: 8 }}>
          {labels.namePrompt}
        </label>
        <input
          id="player-name"
          data-testid="name-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={labels.namePh}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: 'var(--bw) solid var(--ink)',
            background: 'var(--sheet)',
            color: 'var(--ink)',
          }}
        />
        <p style={{ fontSize: 13, color: 'var(--inkSoft)', marginTop: 8 }}>{labels.nameNote}</p>
        <button
          type="submit"
          data-testid="name-confirm"
          style={{
            marginTop: 12,
            padding: '10px 20px',
            background: 'var(--accent)',
            color: 'var(--onAccent)',
            border: 'var(--bw) solid var(--ink)',
            fontFamily: 'var(--fD)',
            textTransform: 'uppercase',
            letterSpacing: '.06em',
            cursor: 'pointer',
          }}
        >
          {labels.confirm}
        </button>
      </form>
    )
  }

  return (
    <div>
      <StatusBar state={state} labels={labels} locale={locale} />

      <div
        onClick={advance}
        style={{ cursor: beat?.kind === 'choice' ? 'default' : 'pointer', minHeight: 220 }}
      >
        {exposed && (
          <div data-testid="exposed" style={{ ...MONO }}>
            <p style={{ fontFamily: 'var(--fD)', fontSize: 30, textTransform: 'uppercase', color: 'var(--accentText)' }}>
              {labels.exposed}
            </p>
            <p>{labels.pressfound}</p>
          </div>
        )}

        {!exposed && beat?.kind === 'chapterCard' && (
          <div data-testid="beat">
            <p style={{ ...MONO, fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--inkSoft)' }}>
              {beat.number === 0 ? '' : `${beat.number}.`}
            </p>
            <h2 style={{ fontFamily: 'var(--fD)', fontSize: 'clamp(28px,6vw,48px)', textTransform: 'uppercase', margin: '4px 0 12px' }}>
              {beat.title[locale]}
            </h2>
            <p style={{ ...MONO, fontStyle: 'italic', color: 'var(--inkSoft)' }}>
              &bdquo;{beat.quote[locale]}&rdquo;
            </p>
            {beat.place[locale] && <p style={{ ...MONO, marginTop: 12 }}>{beat.place[locale]}</p>}
          </div>
        )}

        {!exposed && beat?.kind === 'narration' && (
          <p data-testid="beat" style={{ ...MONO, fontSize: 16, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
            {fill(beat.text[locale], name)}
          </p>
        )}

        {!exposed && beat?.kind === 'item' && (
          <p data-testid="beat" style={{ ...MONO, border: 'var(--bw) solid var(--ink)', display: 'inline-block', padding: '8px 14px', background: 'var(--sheet)' }}>
            ▮ {beat.item}
          </p>
        )}

        {!exposed && beat?.kind === 'dialogue' && (
          <div data-testid="beat">
            <Nameplate>{speakerName(beat.speaker, name)[locale]}</Nameplate>
            <div
              style={{
                border: 'var(--bw) solid var(--ink)',
                background: 'var(--sheet)',
                padding: '14px 16px',
                ...MONO,
                fontSize: 16,
                lineHeight: 1.7,
                whiteSpace: 'pre-line',
              }}
            >
              {fill(beat.text[locale], name)}
            </div>
          </div>
        )}

        {!exposed && beat?.kind === 'choice' && (
          <div data-testid="beat">
            <p style={{ ...MONO, marginBottom: 10 }}>{fill(beat.prompt[locale], name)}</p>
            <div style={{ display: 'grid', gap: 8 }}>
              {beat.options.map((o, n) => (
                <button
                  key={n}
                  data-testid={`choice-${n + 1}`}
                  onClick={() => choose(n)}
                  style={{
                    textAlign: 'left',
                    padding: '10px 14px',
                    border: 'var(--bw) solid var(--ink)',
                    background: 'var(--sheet)',
                    color: 'var(--ink)',
                    cursor: 'pointer',
                    ...MONO,
                  }}
                >
                  <span style={{ color: 'var(--accentText)', fontWeight: 700 }}>[{n + 1}]</span>{' '}
                  {o.text[locale]}
                </button>
              ))}
            </div>
            <p style={{ ...MONO, fontSize: 12, color: 'var(--inkSoft)', marginTop: 8 }}>{labels.chooseHint}</p>
          </div>
        )}

        {!exposed && finished && (
          <div data-testid="chapter-end" style={{ ...MONO }}>
            <p style={{ fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--inkSoft)' }}>
              {labels.endKicker}
            </p>
            <p style={{ marginTop: 8 }}>{labels.endNext}</p>
          </div>
        )}
      </div>

      {!finished && !exposed && beat?.kind !== 'choice' && (
        <p style={{ ...MONO, fontSize: 12, color: 'var(--inkSoft)', marginTop: 16 }}>{labels.playHelp}</p>
      )}

      {(finished || exposed) && (
        <button
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
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          {labels.restart}
        </button>
      )}
    </div>
  )
}
