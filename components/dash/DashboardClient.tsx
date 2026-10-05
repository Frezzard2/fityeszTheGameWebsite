'use client'

import { useCallback, useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import Link from 'next/link'
import type { Session } from '@supabase/supabase-js'
import { supabase, isAuthConfigured } from '@/lib/supabase'
import { eraseSave } from '@/lib/story/save'
import { Reveal } from '@/components/Reveal'
import { decisions, EXPOSURE_LIMIT, LEVEL_UP_XP } from '@/lib/story/engine'
import type { Decision, Scene } from '@/lib/story/types'
import codex from '@/lib/story/content/codex.json'

export type DashLabels = Record<
  | 'dashKicker' | 'hello' | 'logout' | 'dashOutT' | 'dashOutD' | 'tabLogin'
  | 'tabReg' | 'dashEmptyT' | 'dashEmptyD' | 'cta1' | 'slotLabel' | 'nextCh2'
  | 'dashContinue' | 'replay' | 'progress' | 'pDone' | 'pNext' | 'pLock'
  | 'statsT' | 'statsSub' | 'levelW' | 'rankW' | 'rankNone' | 'rankLocal'
  | 'exposure' | 'expWarn' | 'itemsWord' | 'tlT' | 'decisions' | 'prologue'
  | 'contNoteDone' | 'contCh1' | 'contNoteProg' | 'authNotConfigured'
  | 'authNotConfiguredD' | 'found' | 'notFound' | 'authBusy'
  | 'dashDeleteT' | 'dashDelete' | 'dashDeleteGo' | 'dashDeleteAsk'
  | 'dashDeleteCancel' | 'dashDeleted' | 'dashDeleteAcct',
  string
>

type SaveRow = {
  player_name: string | null
  xp: number
  lebukas: number
  szint: number
  items: string[]
  history: Decision[]
  updated_at: string
  /** 2 once chapter one has been finished — see lib/story/save.ts. */
  chapter: number
}

const DISPLAY: CSSProperties = {
  fontFamily: 'var(--fD)',
  fontWeight: 'var(--dW)' as unknown as number,
  textTransform: 'uppercase',
  lineHeight: 1.14,
}
const CAP: CSSProperties = {
  font: '700 12px/1 var(--fL)',
  letterSpacing: '.12em',
  textTransform: 'uppercase',
  color: 'var(--inkSoft)',
}
const CARD: CSSProperties = {
  background: 'var(--sheet)',
  border: 'var(--bw) solid var(--ink)',
  boxShadow: 'var(--shS)',
}
const CARD_HEAD: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  gap: 12,
  padding: '18px 22px',
  borderBottom: 'var(--bw) solid var(--ink)',
}

/** Prologue plus the seven chapters — the eight segments in the design. */
const SEGMENTS = 8

export function DashboardClient({
  labels,
  locale,
  playHref,
  authHref,
  downloadHref,
  scenes,
}: {
  labels: DashLabels
  locale: 'hu' | 'en'
  playHref: string
  authHref: string
  downloadHref: string
  /** Prologue + Chapter 1, so a decision can be shown as its question and answer. */
  scenes: Scene[]
}) {
  const [session, setSession] = useState<Session | null>(null)
  const [save, setSave] = useState<SaveRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [asking, setAsking] = useState(false)
  const [erased, setErased] = useState(false)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const sb = supabase()
    if (!sb) {
      setLoading(false)
      return
    }
    sb.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const sb = supabase()
    if (!sb) return
    if (!session) {
      setSave(null)
      setLoading(false)
      return
    }
    sb.from('saves')
      .select('player_name,xp,lebukas,szint,items,history,updated_at,chapter')
      .eq('slot', 1)
      .maybeSingle()
      .then(({ data }) => {
        setSave((data as SaveRow) ?? null)
        setLoading(false)
      })
  }, [session])
  /* eslint-enable react-hooks/set-state-in-effect */

  const signOut = useCallback(() => supabase()?.auth.signOut(), [])

  const erase = useCallback(async () => {
    await eraseSave()
    setSave(null)
    setAsking(false)
    setErased(true)
  }, [])

  // Erasure has to be reachable whether or not there is a run to show, so it
  // sits below every signed-in state rather than inside the one with a save.
  const eraseBlock = (
    <Reveal kind="up" delay={320} style={{ ...CARD, marginTop: 24, padding: 'clamp(18px,2.6cqw,28px)' }}>
      <h2 style={{ margin: 0, ...DISPLAY, fontSize: 24 }}>{labels.dashDeleteT}</h2>
      <p style={{ margin: '10px 0 0', fontSize: 15, lineHeight: 1.5, color: 'var(--inkSoft)', maxWidth: '40em' }}>
        {labels.dashDelete}
      </p>
      {erased ? (
        <p role="status" style={{ margin: '14px 0 0', font: '700 13px/1.4 var(--fL)', color: 'var(--good)' }}>
          {labels.dashDeleted}
        </p>
      ) : asking ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 16, alignItems: 'center' }}>
          <span style={{ font: '700 13px/1.4 var(--fL)', color: 'var(--accentText)' }}>{labels.dashDeleteAsk}</span>
          <button onClick={erase} className="fz-btn" style={{ padding: '11px 16px 10px', background: 'var(--accent)', color: 'var(--onAccent)', border: 'var(--bw) solid var(--ink)', ...DISPLAY, fontSize: 17, cursor: 'pointer' }}>
            {labels.dashDeleteGo}
          </button>
          <button onClick={() => setAsking(false)} style={{ border: 0, background: 'none', padding: 0, cursor: 'pointer', font: '600 14px/1.3 var(--fL)', color: 'var(--ink)', textDecoration: 'underline', textUnderlineOffset: 4 }}>
            {labels.dashDeleteCancel}
          </button>
        </div>
      ) : (
        <button onClick={() => setAsking(true)} className="fz-btn" style={{ marginTop: 16, padding: '11px 16px 10px', background: 'transparent', color: 'var(--ink)', border: 'var(--bw) solid var(--ink)', ...DISPLAY, fontSize: 17, cursor: 'pointer' }}>
          {labels.dashDeleteT}
        </button>
      )}
      <p style={{ margin: '14px 0 0', fontSize: 13, lineHeight: 1.5, color: 'var(--inkSoft)', maxWidth: '40em' }}>
        {labels.dashDeleteAcct}
      </p>
    </Reveal>
  )

  if (!isAuthConfigured()) {
    return (
      <div style={{ ...CARD, padding: 'clamp(18px,3vw,28px)', maxWidth: '40em' }}>
        <h1 style={{ ...DISPLAY, fontSize: 'clamp(20px,3vw,28px)', margin: 0 }}>{labels.authNotConfigured}</h1>
        <p style={{ margin: '10px 0 0', lineHeight: 1.6 }}>{labels.authNotConfiguredD}</p>
      </div>
    )
  }

  if (loading) return <p style={CAP}>{labels.authBusy}</p>

  // Signed out
  if (!session) {
    return (
      <Reveal kind="up" style={{ ...CARD, maxWidth: 720, boxShadow: 'var(--sh)', padding: 'clamp(24px,4cqw,48px)' }}>
        <p style={{ ...CAP, color: 'var(--accentText)', margin: 0 }}>{labels.dashKicker}</p>
        <h1 style={{ ...DISPLAY, fontSize: 'clamp(34px,5cqw,56px)', margin: '12px 0 0' }}>{labels.dashOutT}</h1>
        <p style={{ margin: '14px 0 0', fontSize: 17, lineHeight: 1.5 }}>{labels.dashOutD}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 24 }}>
          <Link href={authHref} className="fz-btn" style={{ padding: '14px 22px 13px', background: 'var(--accent)', color: 'var(--onAccent)', border: 'var(--bw) solid var(--ink)', boxShadow: 'var(--shS)', ...DISPLAY, fontSize: 20, textDecoration: 'none' }}>
            {labels.tabLogin}
          </Link>
          <Link href={authHref} className="fz-btn" style={{ padding: '14px 20px 13px', background: 'transparent', color: 'var(--ink)', border: 'var(--bw) solid var(--ink)', ...DISPLAY, fontSize: 20, textDecoration: 'none' }}>
            {labels.tabReg}
          </Link>
        </div>
      </Reveal>
    )
  }

  const displayName =
    (session.user.user_metadata?.display_name as string) || session.user.email || ''

  const header = (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px 32px' }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ ...CAP, color: 'var(--accentText)', letterSpacing: '.14em', margin: 0 }}>{labels.dashKicker}</p>
        <Reveal kind="rise" as="h1" style={{ ...DISPLAY, fontSize: 'clamp(34px,5cqw,64px)', margin: '10px 0 0' }}>
          {labels.hello.replace('%s', displayName)}
        </Reveal>
      </div>
      <button onClick={signOut} className="fz-btn" style={{ border: 'var(--bw) solid var(--ink)', background: 'transparent', cursor: 'pointer', padding: '9px 14px', font: '700 12px/1 var(--fL)', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink)' }}>
        {labels.logout}
      </button>
    </div>
  )

  // Signed in, nothing played yet
  if (!save) {
    return (
      <>
        {header}
        <Reveal kind="up" delay={120} style={{ ...CARD, marginTop: 32, boxShadow: 'var(--sh)', padding: 'clamp(24px,4cqw,44px)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '18px 32px' }}>
          <div style={{ flex: '1 1 360px', minWidth: 0 }}>
            <p style={{ ...DISPLAY, fontSize: 'clamp(26px,3.4cqw,40px)', margin: 0 }}>{labels.dashEmptyT}</p>
            <p style={{ margin: '12px 0 0', fontSize: 16, lineHeight: 1.5, color: 'var(--inkSoft)' }}>{labels.dashEmptyD}</p>
          </div>
          <Link href={playHref} className="fz-btn" style={{ padding: '14px 22px 13px', background: 'var(--accent)', color: 'var(--onAccent)', border: 'var(--bw) solid var(--ink)', boxShadow: 'var(--shS)', ...DISPLAY, fontSize: 20, textDecoration: 'none' }}>
            ▶ {labels.cta1}
          </Link>
        </Reveal>
        {eraseBlock}
      </>
    )
  }

  // Signed in with a run
  const exposurePct = Math.min(100, Math.round((save.lebukas / EXPOSURE_LIMIT) * 100))
  const rank = save.xp >= LEVEL_UP_XP ? labels.rankLocal : labels.rankNone
  const allBeats = scenes.flatMap((s) => s.beats)

  const timeline = decisions(save.history, allBeats, locale)

  // Chapter 1 is the only playable chapter. Finishing it is as far as the web
  // version goes, so from there "continue" means the downloadable game.
  //
  // Answering every choice counts as finished too: runs saved before the play
  // screen started recording the chapter have no marker of their own, and only
  // a few closing lines follow the last decision.
  const choicePoints = allBeats.filter((b) => b.kind === 'choice').length
  const complete = save.chapter >= 2 || save.history.length >= choicePoints
  const done = complete ? 2 : 1
  const continueHref = complete ? downloadHref : playHref

  return (
    <>
      {header}

      {/* Continue */}
      <Reveal kind="up" delay={120} style={{ marginTop: 32, background: 'var(--ink)', color: 'var(--onInk)', border: 'var(--bw) solid var(--ink)', display: 'flex', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 460px', minWidth: 0, padding: 'clamp(22px,3cqw,36px)' }}>
          <p style={{ ...CAP, color: 'var(--accent)', letterSpacing: '.16em', margin: 0 }}>{labels.slotLabel}</p>
          <p style={{ ...DISPLAY, fontSize: 'clamp(30px,4cqw,56px)', margin: '12px 0 0' }}>{complete ? labels.nextCh2 : labels.contCh1}</p>
          <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.5, opacity: 0.88 }}>{complete ? labels.contNoteDone : labels.contNoteProg}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 22 }}>
            <Link href={continueHref} className="fz-btn" style={{ padding: '14px 22px 13px', background: 'var(--accent)', color: 'var(--onAccent)', border: 'var(--bw) solid var(--ink)', ...DISPLAY, fontSize: 20, textDecoration: 'none' }}>
              ▶ {labels.dashContinue}
            </Link>
            <Link href={playHref} className="fz-btn" style={{ padding: '14px 20px 13px', background: 'transparent', color: 'var(--onInk)', border: 'var(--bw) solid var(--onInk)', ...DISPLAY, fontSize: 20, textDecoration: 'none' }}>
              {labels.replay}
            </Link>
          </div>
        </div>

        <div style={{ flex: '1 1 380px', minWidth: 0, padding: 'clamp(22px,3cqw,36px)', borderLeft: '1px solid color-mix(in srgb,var(--onInk) 20%,transparent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', ...CAP, color: 'var(--onInk)', letterSpacing: '.14em' }}>
            <span>{labels.progress}</span>
            <span>{done}/{SEGMENTS}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SEGMENTS},minmax(0,1fr))`, gap: 4, marginTop: 14 }}>
            {Array.from({ length: SEGMENTS }, (_, n) => (
              <Reveal
                key={n}
                kind="slam"
                delay={250 + n * 55}
                style={{
                  height: 40,
                  background: n < done ? 'var(--accent)' : 'transparent',
                  border: `2px solid ${n < done ? 'var(--accent)' : 'var(--onInk)'}`,
                  opacity: n < done || n === done ? 1 : 0.45,
                }}
              >
                {/* the segment is the bar itself */}
                <span hidden>{n + 1}</span>
              </Reveal>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 18px', marginTop: 14, font: '600 12px/1 var(--fL)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, background: 'var(--accent)' }} />{labels.pDone}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, border: '2px solid var(--onInk)' }} />{labels.pNext}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: 0.6 }}><span style={{ width: 10, height: 10, border: '2px solid currentColor' }} />{labels.pLock}</span>
          </div>
        </div>
      </Reveal>

      {/* Stats */}
      <Reveal kind="up" delay={200} style={{ ...CARD, marginTop: 24 }}>
        <div style={CARD_HEAD}>
          <h2 style={{ margin: 0, ...DISPLAY, fontSize: 28 }}>{labels.statsT}</h2>
          <span style={{ ...CAP, fontSize: 11 }}>{labels.statsSub}</span>
        </div>
        <div style={{ padding: '20px 22px 24px', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 12 }}>
            <div>
              <div style={CAP}>XP</div>
              <div style={{ marginTop: 8, ...DISPLAY, fontSize: 38 }}>{save.xp}</div>
            </div>
            <div>
              <div style={CAP}>{labels.levelW}</div>
              <div style={{ marginTop: 8, ...DISPLAY, fontSize: 38 }}>{save.szint}</div>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={CAP}>{labels.rankW}</div>
              <div style={{ marginTop: 8, ...DISPLAY, fontSize: 'clamp(18px,2cqw,26px)' }}>{rank}</div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', ...CAP, color: 'var(--ink)' }}>
              <span>{labels.exposure}</span>
              <span style={{ color: 'var(--accentText)' }}>{save.lebukas} / {EXPOSURE_LIMIT}</span>
            </div>
            <div style={{ marginTop: 8, height: 18, border: '2px solid var(--ink)', background: 'var(--paper2)' }}>
              <div className="fz-meter" style={{ height: '100%', width: `${exposurePct}%`, background: 'var(--accent)' }} />
            </div>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--inkSoft)' }}>{labels.expWarn}</p>
          </div>

          <div>
            <div style={CAP}>{labels.itemsWord} · {save.items.length}/{codex.items.length}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(118px,1fr))', gap: 8, marginTop: 10 }}>
              {codex.items.map((it, n) => {
                const held = save.items.includes(it.id)
                return (
                  <Reveal
                    key={it.id}
                    kind="up"
                    delay={200 + n * 45}
                    style={{
                      minHeight: 66,
                      padding: 10,
                      border: held ? '1px solid var(--ink)' : '1px dashed var(--line)',
                      background: held ? 'var(--ink)' : 'transparent',
                      color: held ? 'var(--onInk)' : 'var(--inkSoft)',
                      font: '700 11px/1.3 var(--fL)',
                      letterSpacing: '.06em',
                      textTransform: 'uppercase',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <span>{it.name[locale]}</span>
                    <span style={{ opacity: 0.75 }}>{held ? labels.found : labels.notFound}</span>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </div>
      </Reveal>

      {/* Decisions */}
      {timeline.length > 0 && (
        <Reveal kind="up" delay={260} style={{ ...CARD, marginTop: 24 }}>
          <div style={CARD_HEAD}>
            <h2 style={{ margin: 0, ...DISPLAY, fontSize: 28 }}>{labels.tlT}</h2>
            <span style={{ ...CAP, fontSize: 11 }}>{labels.decisions}</span>
          </div>
          <div style={{ padding: '4px 22px 18px' }}>
            {timeline.map((e, n) => (
              <Reveal
                key={`${e.id}-${n}`}
                kind="lift"
                delay={n * 90}
                style={{ display: 'grid', gridTemplateColumns: '24px minmax(0,1fr)', gap: 14 }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 14, height: 14, marginTop: 22, flex: 'none', background: 'var(--accent)', border: '2px solid var(--ink)' }} />
                  <div style={{ flex: 1, width: 2, background: 'var(--line)' }} />
                </div>
                <div style={{ padding: '18px 0', borderBottom: '1px solid var(--line)', minWidth: 0 }}>
                  <div style={{ ...CAP, fontSize: 11, letterSpacing: '.14em', color: 'var(--accentText)' }}>{e.id}</div>
                  <div style={{ marginTop: 6, fontSize: 14, color: 'var(--inkSoft)' }}>{e.question}</div>
                  <div style={{ marginTop: 4, ...DISPLAY, fontSize: 'clamp(18px,2.4cqw,26px)', lineHeight: 1.05 }}>{e.answer}</div>
                  <div style={{ marginTop: 8, font: '700 12px/1.3 var(--fL)', letterSpacing: '.05em' }}>
                    {e.xp > 0 ? `+${e.xp} XP` : '—'}
                    {e.lebukas !== 0 ? ` · ${e.lebukas > 0 ? '+' : ''}${e.lebukas} ${labels.exposure}` : ''}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>
      )}

      {eraseBlock}
    </>
  )
}
