'use client'

import { useCallback, useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Reveal } from '@/components/Reveal'
import { supabase, isAuthConfigured } from '@/lib/supabase'
import { loadLocalSave, clearLocalSave } from '@/lib/story/localSave'
import type { PlayerState } from '@/lib/story/types'

export type AuthLabels = Record<
  | 'tabReg' | 'tabLogin' | 'authRegTitle' | 'authLoginTitle' | 'authSub'
  | 'fUser' | 'fEmail' | 'fPass' | 'fId' | 'submitReg' | 'submitLogin'
  | 'haveAcc' | 'noAcc' | 'authSkip' | 'saveMove' | 'cardTitle' | 'cardNo'
  | 'cardName' | 'cardRank' | 'cardJoined' | 'cardNamePh' | 'cardNote'
  | 'rankNone' | 'authNotConfigured' | 'authNotConfiguredD' | 'authBusy'
  | 'authSignOut' | 'authCheckEmail' | 'authSavedRun' | 'authNoSave'
  | 'authWelcome' | 'hello' | 'exposure' | 'itemsWord' | 'authNoSuchUser',
  string
>

const DISPLAY: CSSProperties = {
  overflowWrap: 'anywhere',
  fontFamily: 'var(--fD)',
  fontWeight: 'var(--dW)' as unknown as number,
  textTransform: 'uppercase',
  lineHeight: 1.14,
}
const CAP: CSSProperties = {
  font: '700 11px/1 var(--fL)',
  letterSpacing: '.14em',
  textTransform: 'uppercase',
  color: 'var(--inkSoft)',
}
const INPUT: CSSProperties = {
  padding: 14,
  border: 'var(--bw) solid var(--ink)',
  background: 'var(--sheet)',
  color: 'var(--ink)',
  font: 'inherit',
  minWidth: 0,
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ font: '700 12px/1 var(--fL)', letterSpacing: '.12em', textTransform: 'uppercase' }}>{label}</span>
      <input {...rest} style={INPUT} />
    </label>
  )
}

/** Card number derived from the account id, so it is stable and looks issued. */
function memberNo(id: string): string {
  let n = 0
  for (const ch of id) n = (n * 31 + ch.charCodeAt(0)) % 1000000
  return 'FK-' + String(n).padStart(6, '0')
}

export function AuthForm({ labels, locale }: { labels: AuthLabels; locale: string }) {
  const [mode, setMode] = useState<'register' | 'login'>('register')
  const [user, setUser] = useState('')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [save, setSave] = useState<PlayerState | null>(null)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setSave(loadLocalSave())
    const sb = supabase()
    if (!sb) return
    sb.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  /** Move the browser save into the account, once, after signing in. */
  const migrate = useCallback(async (userId: string, displayName: string) => {
    const sb = supabase()
    const local = loadLocalSave()
    if (!sb || !local) return false
    const { error } = await sb.from('saves').upsert(
      {
        user_id: userId,
        slot: 1,
        display_name: displayName,
        player_name: local.name,
        chapter: 1,
        xp: local.xp,
        lebukas: local.lebukas,
        szint: local.szint,
        items: local.items,
        history: local.history,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,slot' },
    )
    if (error) return false
    clearLocalSave()
    setSave(null)
    return true
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const sb = supabase()
    if (!sb) return
    setBusy(true)
    setError(null)
    setNote(null)
    try {
      if (mode === 'register') {
        const { data, error } = await sb.auth.signUp({
          email,
          password: pass,
          options: { data: { display_name: user } },
        })
        if (error) throw error
        if (!data.session) {
          setNote(labels.authCheckEmail) // email confirmation is on
        } else if (await migrate(data.session.user.id, user)) {
          setNote(labels.authSavedRun)
        }
      } else {
        // Supabase signs in on email. Anything without an @ is treated as a
        // username and resolved first; the lookup returns only an email.
        let email = user.trim()
        if (!email.includes('@')) {
          const { data: found, error: lookupError } = await sb.rpc('email_for_username', {
            p_username: email,
          })
          if (lookupError) throw lookupError
          if (!found) throw new Error(labels.authNoSuchUser)
          email = found as string
        }
        const { data, error } = await sb.auth.signInWithPassword({ email, password: pass })
        if (error) throw error
        const name = (data.user.user_metadata?.display_name as string) || data.user.email || ''
        if (await migrate(data.user.id, name)) setNote(labels.authSavedRun)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  if (!isAuthConfigured()) {
    return (
      <div style={{ border: 'var(--bw) solid var(--ink)', background: 'var(--paper2)', padding: 'clamp(18px,3vw,28px)', maxWidth: '40em' }}>
        <h2 style={{ ...DISPLAY, fontSize: 'clamp(20px,3vw,28px)', margin: 0 }}>{labels.authNotConfigured}</h2>
        <p style={{ margin: '10px 0 0', lineHeight: 1.6 }}>{labels.authNotConfiguredD}</p>
      </div>
    )
  }

  const displayName =
    (session?.user.user_metadata?.display_name as string) || session?.user.email || ''

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '44px 64px', alignItems: 'flex-start' }}>
      <div style={{ flex: '1 1 440px', minWidth: 0 }}>
        {session ? (
          <>
            <Reveal kind="rise" as="h1" style={{ ...DISPLAY, fontSize: 'clamp(40px,6cqw,88px)', margin: 0 }}>
              {labels.hello.replace('%s', displayName)}
            </Reveal>
            <p style={{ margin: '14px 0 0', fontSize: 17 }}>{labels.authWelcome}</p>
            <button
              className="fz-btn"
              onClick={() => supabase()?.auth.signOut()}
              style={{ marginTop: 22, padding: '14px 22px 13px', background: 'transparent', color: 'var(--ink)', border: 'var(--bw) solid var(--ink)', ...DISPLAY, fontSize: 19, cursor: 'pointer' }}
            >
              {labels.authSignOut}
            </button>
          </>
        ) : (
          <>
            <Reveal kind="fade" style={{ display: 'inline-flex', border: 'var(--bw) solid var(--ink)', maxWidth: '100%' }}>
              {(['register', 'login'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  aria-pressed={mode === m}
                  style={{
                    border: 0,
                    cursor: 'pointer',
                    padding: '10px 16px 9px',
                    ...DISPLAY,
                    fontSize: 20,
                    background: mode === m ? 'var(--ink)' : 'transparent',
                    color: mode === m ? 'var(--onInk)' : 'var(--ink)',
                  }}
                >
                  {m === 'register' ? labels.tabReg : labels.tabLogin}
                </button>
              ))}
            </Reveal>

            <Reveal kind="rise" delay={80} as="h1" style={{ ...DISPLAY, fontSize: 'clamp(40px,6cqw,88px)', margin: '26px 0 0' }}>
              {mode === 'register' ? labels.authRegTitle : labels.authLoginTitle}
            </Reveal>
            <Reveal kind="up" delay={200} as="p" style={{ margin: '14px 0 0', fontSize: 17, lineHeight: 1.5, maxWidth: '30em' }}>
              {labels.authSub}
            </Reveal>

            {save && (
              <Reveal kind="up" delay={280} as="p" style={{ margin: '18px 0 0', padding: '12px 14px', border: 'var(--bw) solid var(--ink)', background: 'var(--paper2)', fontSize: 15, lineHeight: 1.4 }}>
                {labels.saveMove.replace('%n', String(save.history.length))}
              </Reveal>
            )}

            <form key={mode} onSubmit={submit} className="fz-in" style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16, animationDelay: '320ms' }}>
              {mode === 'register' ? (
                <>
                  <Field label={labels.fUser} value={user} onChange={(e) => setUser(e.target.value)} required maxLength={32} autoComplete="nickname" />
                  <Field label={labels.fEmail} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                </>
              ) : (
                <Field label={labels.fId} type="text" value={user} onChange={(e) => setUser(e.target.value)} required autoComplete="username" spellCheck={false} autoCapitalize="none" />
              )}
              <Field label={labels.fPass} type="password" value={pass} onChange={(e) => setPass(e.target.value)} required minLength={8} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} />

              <button
                type="submit"
                disabled={busy}
                className={busy ? 'fz-btn fz-pulse' : 'fz-btn'}
                style={{ marginTop: 6, padding: '16px 22px 15px', background: 'var(--accent)', color: 'var(--onAccent)', border: 'var(--bw) solid var(--ink)', boxShadow: 'var(--shS)', ...DISPLAY, fontSize: 22, cursor: busy ? 'progress' : 'pointer' }}
              >
                {busy ? labels.authBusy : mode === 'register' ? labels.submitReg : labels.submitLogin}
              </button>
            </form>

            <div style={{ marginTop: 18, display: 'flex', flexWrap: 'wrap', gap: '10px 22px' }}>
              <button
                onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
                style={{ border: 0, background: 'none', padding: 0, cursor: 'pointer', font: '600 14px/1.3 var(--fL)', color: 'var(--ink)', textDecoration: 'underline', textUnderlineOffset: 4 }}
              >
                {mode === 'register' ? labels.haveAcc : labels.noAcc}
              </button>
            </div>
          </>
        )}

        {note && <p role="status" style={{ marginTop: 16, padding: '12px 14px', border: '1px solid var(--second)', color: 'var(--second)', fontSize: 15 }}>{note}</p>}
        {error && <p role="alert" style={{ marginTop: 16, padding: '12px 14px', border: '1px solid var(--accent)', color: 'var(--accentText)', fontSize: 15 }}>{error}</p>}
      </div>

      {/* Pártigazolvány */}
      <div style={{ flex: '0 1 420px', minWidth: 280 }}>
        <Reveal
          kind="swing"
          delay={200}
          style={{
            // fzRevSwing settles on --swing, so the card keeps its tilt
            // instead of the animation fighting an inline transform.
            ['--swing' as string]: '-1.5deg',
            rotate: '-1.5deg',
            background: 'var(--sheet)',
            border: 'var(--bw) solid var(--ink)',
            boxShadow: 'var(--sh)',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', height: 10 }}>
            <div style={{ flex: 1, background: 'var(--accent)' }} />
            <div style={{ flex: 1, background: 'var(--paper2)' }} />
            <div style={{ flex: 1, background: 'var(--second)' }} />
          </div>
          <div style={{ padding: '22px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, borderBottom: '1px solid var(--line)' }}>
            <div>
              <div style={{ ...DISPLAY, fontSize: 30 }}>Fityesz</div>
              <div style={{ marginTop: 6, ...CAP }}>{labels.cardTitle}</div>
            </div>
            <div style={{ width: 56, height: 56, flex: 'none', background: 'var(--accent)', color: 'var(--onAccent)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...DISPLAY, fontSize: 34 }}>F</div>
          </div>
          <div style={{ padding: '18px 24px 22px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={CAP}>{labels.cardName}</div>
              <div style={{ marginTop: 8, ...DISPLAY, fontSize: 26 }}>{displayName || user || labels.cardNamePh}</div>
            </div>
            <div>
              <div style={CAP}>{labels.cardNo}</div>
              <div style={{ marginTop: 6, font: '700 16px/1.2 var(--fL)' }}>{session ? memberNo(session.user.id) : '—'}</div>
            </div>
            <div>
              <div style={CAP}>{labels.cardJoined}</div>
              <div style={{ marginTop: 6, font: '700 16px/1.2 var(--fL)' }}>
                {session ? new Date(session.user.created_at).getFullYear() : '—'}
              </div>
            </div>
            <div>
              <div style={CAP}>XP</div>
              <div style={{ marginTop: 6, font: '700 16px/1.2 var(--fL)' }}>{save ? save.xp : 0}</div>
            </div>
            <div>
              <div style={CAP}>{labels.cardRank}</div>
              <div style={{ marginTop: 6, font: '700 16px/1.2 var(--fL)' }}>{labels.rankNone}</div>
            </div>
          </div>
          <div style={{ padding: '12px 24px', background: 'var(--ink)', color: 'var(--onInk)', font: '600 12px/1.4 var(--fL)' }}>{labels.cardNote}</div>
        </Reveal>
        <span hidden>{locale}</span>
      </div>
    </div>
  )
}
