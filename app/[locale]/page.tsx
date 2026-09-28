import Link from 'next/link'
import type { CSSProperties } from 'react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/lib/constants'
import { localePath } from '@/i18n/routing'
import { CHARACTERS } from '@/lib/design/characters'
import { DOWNLOAD_ENABLED } from '@/lib/features'
import codex from '@/lib/story/content/codex.json'
import { Reveal } from '@/components/Reveal'

// The prototype's `--dW` design token, cast the same way the layout does.
const DW = 'var(--dW)' as unknown as number

const HALFTONE: CSSProperties = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  width: '64%',
  backgroundImage: 'radial-gradient(circle, var(--ink) 1.2px, transparent 1.8px)',
  backgroundSize: '9px 9px',
  WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,.3), transparent 85%)',
  maskImage: 'linear-gradient(to left, rgba(0,0,0,.3), transparent 85%)',
  pointerEvents: 'none',
}

const LEDGER_LABEL: CSSProperties = {
  font: '700 13px/1.2 var(--fL)',
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  color: 'var(--inkSoft)',
}

const LEDGER_VALUE: CSSProperties = {
  fontFamily: 'var(--fD)',
  fontWeight: DW,
  fontSize: 58,
  lineHeight: 1.14,
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale as Locale)
  const t = await getTranslations()
  const l = locale as Locale
  const href = (p: string) => localePath(p, l)

  return (
    // container-type establishes the query container the cqw units below need.
    <div style={{ containerType: 'inline-size' }}>
      {/* Hero — poster, not a centred marketing block */}
      <section
        data-screen-label="Landing"
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderBottom: 'var(--bw) solid var(--ink)',
        }}
      >
        <div aria-hidden className="fz-drift" style={HALFTONE} />
        <div
          style={{
            position: 'relative',
            maxWidth: 1320,
            margin: '0 auto',
            padding: 'clamp(32px,5cqw,72px) clamp(16px,3cqw,40px) clamp(48px,6cqw,92px)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            gap: 'clamp(36px,5cqw,72px)',
          }}
        >
          <div style={{ flex: '1 1 540px', minWidth: 0 }}>
            <Reveal
              kind="drop"
              as="p"
              style={{
                display: 'inline-block',
                transform: 'rotate(-2deg)',
                background: 'var(--ink)',
                color: 'var(--onInk)',
                margin: 0,
                padding: '9px 14px',
                font: '700 13px/1.25 var(--fL)',
                letterSpacing: '.1em',
                textTransform: 'uppercase',
              }}
            >
              {t('heroKicker')}
            </Reveal>

            <h1
              style={{
                margin: '26px 0 0',
                fontFamily: 'var(--fD)',
                fontWeight: DW,
                textTransform: 'uppercase',
                lineHeight: 0.98,
                fontSize: 'clamp(60px,10.5cqw,168px)',
                letterSpacing: '-.005em',
                overflowWrap: 'break-word',
                wordBreak: 'break-word',
                hyphens: 'auto',
              }}
            >
              <Reveal kind="rise" delay={120} as="span" style={{ display: 'block' }}>
                {t('slogan1')}
              </Reveal>
              <Reveal
                kind="slam"
                delay={360}
                as="span"
                style={{ display: 'block', color: 'var(--accentText)', transformOrigin: 'left bottom' }}
              >
                {t('slogan2')}
              </Reveal>
            </h1>

            <Reveal
              kind="up"
              delay={540}
              as="p"
              style={{
                maxWidth: '32em',
                margin: '28px 0 0',
                fontSize: 'clamp(17px,1.45cqw,20px)',
                lineHeight: 1.5,
              }}
            >
              {t('heroSub')}
            </Reveal>

            <Reveal
              kind="up"
              delay={660}
              as="div"
              style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 30 }}
            >
              <Link
                href={href('/jatek')}
                className="fz-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '15px 24px 14px',
                  background: 'var(--accent)',
                  color: 'var(--onAccent)',
                  border: 'var(--bw) solid var(--ink)',
                  boxShadow: 'var(--shS)',
                  fontFamily: 'var(--fD)',
                  fontWeight: DW,
                  fontSize: 22,
                  lineHeight: 1.14,
                  textTransform: 'uppercase',
                  letterSpacing: '.03em',
                  textDecoration: 'none',
                }}
              >
                ▶ {t('cta1')}
              </Link>
              <Link
                href={href(DOWNLOAD_ENABLED ? '/letoltes' : '/lexikon')}
                className="fz-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '15px 22px 14px',
                  background: 'transparent',
                  color: 'var(--ink)',
                  border: 'var(--bw) solid var(--ink)',
                  fontFamily: 'var(--fD)',
                  fontWeight: DW,
                  fontSize: 22,
                  lineHeight: 1.14,
                  textTransform: 'uppercase',
                  letterSpacing: '.03em',
                  textDecoration: 'none',
                }}
              >
                {DOWNLOAD_ENABLED ? t('cta2') : t('navLore')}
              </Link>
            </Reveal>

            <Reveal
              kind="fade"
              delay={840}
              as="p"
              style={{ margin: '16px 0 0', fontSize: 14, color: 'var(--inkSoft)' }}
            >
              {t('heroNote')}
            </Reveal>
          </div>

          <Reveal
            kind="swing"
            delay={300}
            as="div"
            style={{
              flex: '0 1 370px',
              minWidth: 260,
              background: 'var(--sheet)',
              border: 'var(--bw) solid var(--ink)',
              boxShadow: 'var(--sh)',
              transform: 'rotate(1.2deg)',
            }}
          >
            <div
              style={{
                background: 'var(--accent)',
                color: 'var(--onAccent)',
                padding: '14px 20px 12px',
                fontFamily: 'var(--fD)',
                fontWeight: DW,
                fontSize: 28,
                lineHeight: 1.14,
                textTransform: 'uppercase',
                letterSpacing: '.02em',
                borderBottom: 'var(--bw) solid var(--ink)',
              }}
            >
              {t('posterTitle')}
            </div>
            <div style={{ padding: '6px 20px 10px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '12px 0',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <span style={LEDGER_VALUE}>3</span>
                <span style={LEDGER_LABEL}>{t('rolls')}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '12px 0',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <span style={LEDGER_VALUE}>{t('cashVal')}</span>
                <span style={LEDGER_LABEL}>{t('cash')}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '14px 0 6px' }}>
                <span style={LEDGER_LABEL}>{t('debt')}</span>
                <span
                  style={{
                    fontFamily: 'var(--fD)',
                    fontWeight: DW,
                    fontSize: 'clamp(40px,4cqw,52px)',
                    lineHeight: 1.14,
                    color: 'var(--accentText)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t('debtVal')}
                </span>
              </div>
            </div>
            <div
              style={{
                background: 'var(--ink)',
                color: 'var(--onInk)',
                padding: '12px 20px',
                font: '600 14px/1.3 var(--fL)',
              }}
            >
              {t('bank')}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Quote band — the chapter epigraphs, scrolling. Two copies so the
          -50% shift lands on the duplicate and the loop never jumps. */}
      <section style={{ background: 'var(--ink)', color: 'var(--onInk)', overflow: 'hidden', borderBottom: 'var(--bw) solid var(--ink)' }}>
        <div
          className="fz-marquee"
          style={{
            display: 'flex',
            width: 'max-content',
            fontFamily: 'var(--fD)',
            fontWeight: 'var(--dW)' as never,
            textTransform: 'uppercase',
            fontSize: 'clamp(17px,1.7cqw,23px)',
            lineHeight: 1.15,
            letterSpacing: '.02em',
            whiteSpace: 'nowrap',
          }}
        >
          {[0, 1].map((copy) => (
            <div key={copy} aria-hidden={copy === 1} style={{ display: 'flex', gap: 30, padding: '18px 15px' }}>
              {codex.chapters.map((c) => (
                <span key={c.number} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <span style={{ color: 'var(--accent)' }}>&#9733;</span>
                  <span>{c.quote[l]}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>


      {/* Prologue — the game's own opening lines, at poster scale */}
      <section style={{ borderBottom: 'var(--bw) solid var(--ink)', padding: 'clamp(36px,5cqw,80px) clamp(16px,3cqw,40px)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '24px 56px' }}>
          <Reveal kind="fade" as="p" style={{ flex: '0 0 auto', margin: 0, font: '700 13px/1.3 var(--fL)', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--accentText)' }}>
            {t('proTitle')}
          </Reveal>
          <div style={{ flex: '1 1 540px', minWidth: 0 }}>
            {[t('pro1'), t('pro2'), t('pro3'), t('pro4')].map((line, n) => (
              <Reveal
                key={line}
                kind="up"
                delay={n * 90}
                as="p"
                style={{ margin: n ? '18px 0 0' : 0, fontFamily: 'var(--fD)', fontWeight: DW, textTransform: 'uppercase', fontSize: 'clamp(24px,3.4cqw,44px)', lineHeight: 1.1 }}
              >
                {line}
              </Reveal>
            ))}
            <Reveal kind="rise" delay={400} as="p" style={{ margin: '18px 0 0', fontFamily: 'var(--fD)', fontWeight: DW, textTransform: 'uppercase', fontSize: 'clamp(24px,3.4cqw,44px)', lineHeight: 1.1, color: 'var(--accentText)' }}>
              {t('pro5')}
            </Reveal>

            {/* The call that starts everything */}
            <Reveal kind="up" delay={520} style={{ marginTop: 36, border: 'var(--bw) solid var(--ink)', background: 'var(--sheet)', boxShadow: 'var(--shS)', padding: 'clamp(16px,2cqw,22px)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px 20px' }}>
              <div style={{ flex: '1 1 320px', minWidth: 0 }}>
                <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10, font: '700 12px/1 var(--fL)', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--accentText)' }}>
                  <span className="fz-pulse" style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--accent)' }} />
                  {t('phone')}
                </p>
                <p style={{ margin: '10px 0 0', fontStyle: 'italic', fontSize: 'clamp(15px,1.5cqw,18px)' }}>{t('offer')}</p>
              </div>
              <Link href={href('/jatek')} className="fz-btn" style={{ padding: '13px 20px 12px', background: 'var(--accent)', color: 'var(--onAccent)', border: 'var(--bw) solid var(--ink)', boxShadow: 'var(--shS)', fontFamily: 'var(--fD)', fontWeight: DW, fontSize: 19, textTransform: 'uppercase', textDecoration: 'none' }}>
                {t('answer')}
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Cast — a numbered ledger, one row per character */}
      <section style={{ borderBottom: 'var(--bw) solid var(--ink)', padding: 'clamp(36px,5cqw,80px) clamp(16px,3cqw,40px)', background: 'var(--sheet)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <Reveal kind="rise" as="h2" style={{ margin: 0, fontFamily: 'var(--fD)', fontWeight: DW, textTransform: 'uppercase', fontSize: 'clamp(34px,6cqw,72px)', lineHeight: 1 }}>
            {t('castTitle')}
          </Reveal>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '8px 24px', marginTop: 10, alignItems: 'baseline' }}>
            <p style={{ margin: 0, color: 'var(--inkSoft)' }}>{t('castSub')}</p>
            <Link href={href('/szereplok')} style={{ font: '700 13px/1 var(--fL)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
              {t('castAll')} →
            </Link>
          </div>

          <div style={{ marginTop: 26, borderTop: '1px solid var(--line)' }}>
            {CHARACTERS.filter((c) => c.id !== 'you').map((c, n) => (
              <Reveal
                key={c.id}
                kind="up"
                delay={n * 70}
                style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '6px 20px', padding: '18px 0', borderBottom: '1px solid var(--line)' }}
              >
                <span style={{ flex: '0 0 2.5em', font: '700 13px/1 var(--fL)', letterSpacing: '.1em', color: 'var(--inkSoft)' }}>
                  {String(n + 1).padStart(2, '0')}
                </span>
                <span style={{ flex: '1 1 18em', minWidth: 0 }}>
                  <span style={{ display: 'block', fontFamily: 'var(--fD)', fontWeight: DW, textTransform: 'uppercase', fontSize: 'clamp(22px,2.6cqw,34px)', lineHeight: 1.1 }}>
                    {c.name[l]}
                  </span>
                  <span style={{ display: 'block', marginTop: 4, fontSize: 14, color: 'var(--inkSoft)' }}>{c.title[l]}</span>
                </span>
                <span style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 10, font: '700 12px/1 var(--fL)', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--inkSoft)' }}>
                  {t('chapterN').replace('%n', String(c.chapter))}
                  {c.boss && (
                    <span style={{ background: 'var(--accent)', color: 'var(--onAccent)', padding: '4px 8px' }}>{t('bossfight')}</span>
                  )}
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it plays — three cards, each showing the mechanic rather than describing it */}
      <section style={{ borderBottom: 'var(--bw) solid var(--ink)', padding: 'clamp(36px,5cqw,80px) clamp(16px,3cqw,40px)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <Reveal kind="rise" as="h2" style={{ margin: 0, fontFamily: 'var(--fD)', fontWeight: DW, textTransform: 'uppercase', fontSize: 'clamp(34px,6cqw,72px)', lineHeight: 1 }}>
            {t('howTitle')}
          </Reveal>

          <div style={{ marginTop: 30, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
            {[
              { n: '01', title: t('how1t'), desc: t('how1d') },
              { n: '02', title: t('how2t'), desc: t('how2d') },
              { n: '03', title: t('how3t'), desc: t('how3d') },
            ].map((step, i) => (
              <Reveal
                key={step.n}
                kind="up"
                delay={i * 120}
                style={{ border: 'var(--bw) solid var(--ink)', background: 'var(--sheet)', boxShadow: 'var(--shS)', padding: 'clamp(16px,2cqw,22px)', display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                <div style={{ fontFamily: 'var(--fD)', fontWeight: DW, fontSize: 34, lineHeight: 1, color: 'var(--accentText)' }}>{step.n}</div>
                <h3 style={{ margin: 0, fontFamily: 'var(--fD)', fontWeight: DW, textTransform: 'uppercase', fontSize: 21, lineHeight: 1.14 }}>{step.title}</h3>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: 'var(--inkSoft)' }}>{step.desc}</p>

                {i === 0 && (
                  <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--line)' }}>
                    <div style={{ font: '700 11px/1 var(--fL)', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--inkSoft)' }}>{t('sampleQ')}</div>
                    {[t('sampleO1'), t('sampleO2'), t('sampleO3')].map((o, k) => (
                      <div key={o} style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, border: '1px solid var(--ink)', padding: '7px 9px', fontSize: 13 }}>
                        <span style={{ flex: 'none', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ink)', color: 'var(--onInk)', font: '700 11px/1 var(--fL)' }}>{k + 1}</span>
                        <span style={{ minWidth: 0 }}>{o}</span>
                      </div>
                    ))}
                  </div>
                )}

                {i === 1 && (
                  <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--line)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', font: '700 11px/1 var(--fL)', letterSpacing: '.12em', textTransform: 'uppercase' }}>
                      <span style={{ color: 'var(--inkSoft)' }}>{t('exposure')}</span>
                      <span style={{ color: 'var(--accentText)' }}>25 / 100</span>
                    </div>
                    <div style={{ marginTop: 8, height: 12, border: '1px solid var(--ink)', background: 'var(--paper2)' }}>
                      <div style={{ width: '25%', height: '100%', background: 'var(--accent)' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, font: '700 10px/1 var(--fL)', color: 'var(--inkSoft)' }}>
                      <span>0</span><span>50</span><span>100</span>
                    </div>
                  </div>
                )}

                {i === 2 && (
                  <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--line)' }}>
                    {[
                      { who: t('you'), hp: '100/100', pct: 100, color: 'var(--second)' },
                      { who: 'Lakatos', hp: '60/80', pct: 75, color: 'var(--accent)' },
                    ].map((row) => (
                      <div key={row.who} style={{ marginTop: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', font: '700 11px/1 var(--fL)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
                          <span>{row.who}</span>
                          <span style={{ color: 'var(--inkSoft)' }}>{row.hp}</span>
                        </div>
                        <div style={{ marginTop: 4, height: 8, border: '1px solid var(--ink)', background: 'var(--paper2)' }}>
                          <div style={{ width: `${row.pct}%`, height: '100%', background: row.color }} />
                        </div>
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <span style={{ border: '1px solid var(--ink)', padding: '5px 8px', font: '700 11px/1 var(--fL)', textTransform: 'uppercase' }}>1 · {t('attack')}</span>
                      <span style={{ border: '1px solid var(--ink)', padding: '5px 8px', font: '700 11px/1 var(--fL)', textTransform: 'uppercase' }}>2 · {t('defend')}</span>
                    </div>
                  </div>
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* What happens to your decisions */}
      <section style={{ borderBottom: 'var(--bw) solid var(--ink)', padding: 'clamp(36px,5cqw,80px) clamp(16px,3cqw,40px)', background: 'var(--sheet)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <Reveal kind="rise" as="h2" style={{ margin: 0, fontFamily: 'var(--fD)', fontWeight: DW, textTransform: 'uppercase', fontSize: 'clamp(30px,5cqw,64px)', lineHeight: 1 }}>
            {t('saveTitle')}
          </Reveal>
          <div style={{ marginTop: 26, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 0, border: '1px solid var(--line)' }}>
            {[t('save1'), t('save2'), t('save3'), t('save4')].map((step, n) => (
              <Reveal key={step} kind="up" delay={n * 90} style={{ padding: 'clamp(16px,2cqw,22px)', borderRight: '1px solid var(--line)' }}>
                <div style={{ fontFamily: 'var(--fD)', fontWeight: DW, fontSize: 34, lineHeight: 1, color: 'var(--accentText)' }}>
                  {String(n + 1).padStart(2, '0')}
                </div>
                <p style={{ margin: '10px 0 0', fontSize: 14, lineHeight: 1.5 }}>{step}</p>
              </Reveal>
            ))}
          </div>
          <Link href={href('/jatek')} className="fz-btn" style={{ display: 'inline-block', marginTop: 24, padding: '14px 22px 13px', background: 'var(--accent)', color: 'var(--onAccent)', border: 'var(--bw) solid var(--ink)', boxShadow: 'var(--shS)', fontFamily: 'var(--fD)', fontWeight: DW, fontSize: 20, textTransform: 'uppercase', textDecoration: 'none' }}>
            ▶ {t('saveCta')}
          </Link>
        </div>
      </section>

      {/* Support band */}
      <section style={{ background: 'var(--accent)', color: 'var(--onAccent)', padding: 'clamp(32px,4cqw,64px) clamp(16px,3cqw,40px)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px 40px' }}>
          <div style={{ flex: '1 1 420px', minWidth: 0 }}>
            <Reveal kind="rise" as="h2" style={{ margin: 0, fontFamily: 'var(--fD)', fontWeight: DW, textTransform: 'uppercase', fontSize: 'clamp(30px,5cqw,60px)', lineHeight: 1 }}>
              {t('supTitle')}
            </Reveal>
            <p style={{ margin: '12px 0 0', maxWidth: '34em', lineHeight: 1.5 }}>{t('supSub')}</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ padding: '13px 20px 12px', background: 'var(--ink)', color: 'var(--onInk)', fontFamily: 'var(--fD)', fontWeight: DW, fontSize: 18, textTransform: 'uppercase' }}>
              {t('kofiSoon')}
            </span>
            <Link href={href('/tamogatas')} className="fz-btn" style={{ padding: '13px 20px 12px', background: 'var(--onAccent)', color: 'var(--ink)', border: 'var(--bw) solid var(--ink)', fontFamily: 'var(--fD)', fontWeight: DW, fontSize: 18, textTransform: 'uppercase', textDecoration: 'none' }}>
              {t('meet')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
