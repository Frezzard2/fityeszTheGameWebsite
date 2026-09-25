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

      {/* Chapter descent — a vertical list, one per row */}
      <section
        style={{
          borderBottom: 'var(--bw) solid var(--ink)',
          padding: 'clamp(24px,4cqw,48px) clamp(16px,3cqw,40px)',
        }}
      >
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <Reveal
            kind="rise"
            as="h2"
            style={{
              fontFamily: 'var(--fD)',
              fontWeight: DW,
              fontSize: 'clamp(28px,5cqw,52px)',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            {t('howTitle')}
          </Reveal>
          <ol style={{ listStyle: 'none', padding: 0, margin: '20px 0 0' }}>
            {[
              [t('how1t'), t('how1d')],
              [t('how2t'), t('how2d')],
              [t('how3t'), t('how3d')],
            ].map(([title, desc], n) => (
              <Reveal
                key={title}
                kind="up"
                delay={n * 120}
                as="li"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  gap: 'clamp(12px,3vw,32px)',
                  alignItems: 'baseline',
                  padding: '18px 0',
                  borderTop: '1px solid var(--line)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--fD)',
                    fontWeight: DW,
                    fontSize: 'clamp(32px,6vw,64px)',
                    lineHeight: 1,
                    color: 'var(--accent)',
                  }}
                >
                  {n + 1}
                </span>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontFamily: 'var(--fD)',
                      fontWeight: DW,
                      fontSize: 22,
                      textTransform: 'uppercase',
                    }}
                  >
                    {title}
                  </h3>
                  <p style={{ margin: '6px 0 0', maxWidth: '44em', color: 'var(--inkSoft)' }}>{desc}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Cast strip */}
      <section style={{ padding: 'clamp(24px,4cqw,48px) clamp(16px,3cqw,40px)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <Reveal
            kind="rise"
            as="h2"
            style={{
              fontFamily: 'var(--fD)',
              fontWeight: DW,
              fontSize: 'clamp(28px,5cqw,52px)',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            {t('castTitle')}
          </Reveal>
          <p style={{ color: 'var(--inkSoft)', marginTop: 6 }}>{t('castSub')}</p>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: '20px 0 0',
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            {CHARACTERS.filter((c) => c.id !== 'you').map((c, n) => (
              <Reveal
                key={c.id}
                kind="up"
                delay={n * 90}
                as="li"
                className="fz-lift"
                style={{
                  border: 'var(--bw) solid var(--ink)',
                  background: 'var(--sheet)',
                  padding: '12px 14px',
                  minWidth: 190,
                  flex: '1 1 190px',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--fD)',
                    fontSize: 13,
                    letterSpacing: '.14em',
                    color: c.boss ? 'var(--accentText)' : 'var(--inkSoft)',
                  }}
                >
                  {c.initials}
                  {c.boss ? ' · BOSS' : ''}
                </span>
                <p style={{ margin: '6px 0 0', fontFamily: 'var(--fD)', fontSize: 19, textTransform: 'uppercase' }}>
                  {c.name[l]}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--inkSoft)' }}>{c.title[l]}</p>
              </Reveal>
            ))}
          </ul>
          <p style={{ marginTop: 18 }}>
            <Link href={href('/szereplok')} style={{ fontWeight: 700 }}>
              {t('castAll')} →
            </Link>
          </p>
          <p style={{ marginTop: 28, fontSize: 13, color: 'var(--inkSoft)' }}>
            {codex.chapters.length} {t('tabChapters').toLowerCase()} ·{' '}
            <Link href={href('/lexikon')}>{t('navLore')}</Link>
          </p>
        </div>
      </section>
    </div>
  )
}
