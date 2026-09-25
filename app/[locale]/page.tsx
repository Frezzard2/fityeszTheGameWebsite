import Link from 'next/link'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/lib/constants'
import { localePath } from '@/i18n/routing'
import { CHARACTERS } from '@/lib/design/characters'
import codex from '@/lib/story/content/codex.json'

const HALFTONE = {
  backgroundImage: 'radial-gradient(circle, var(--ink) 1.2px, transparent 1.8px)',
  backgroundSize: '9px 9px',
  WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,.3), transparent 85%)',
  maskImage: 'linear-gradient(to left, rgba(0,0,0,.3), transparent 85%)',
} as const

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
    <div>
      {/* Hero — poster, not a centred marketing block */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderBottom: 'var(--bw) solid var(--ink)',
          padding: 'clamp(28px,5cqw,64px) clamp(16px,3cqw,40px)',
        }}
      >
        <div
          aria-hidden
          style={{ position: 'absolute', inset: 0, left: '36%', pointerEvents: 'none', ...HALFTONE }}
        />
        <div style={{ position: 'relative', maxWidth: 1320, margin: '0 auto' }}>
          <p
            style={{
              display: 'inline-block',
              transform: 'rotate(-2deg)',
              background: 'var(--ink)',
              color: 'var(--onInk)',
              padding: '9px 14px',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '.1em',
              textTransform: 'uppercase',
            }}
          >
            {t('heroKicker')}
          </p>

          <h1
            style={{
              fontFamily: 'var(--fD)',
              fontWeight: 'var(--dW)' as never,
              fontSize: 'clamp(52px,13vw,150px)',
              lineHeight: 0.84,
              letterSpacing: '-.03em',
              textTransform: 'uppercase',
              margin: '22px 0 0',
              maxWidth: '10em',
            }}
          >
            {t('slogan1')}
            <br />
            <span style={{ color: 'var(--accent)' }}>{t('slogan2')}</span>
          </h1>

          <p style={{ marginTop: 20, maxWidth: '34em', fontSize: 17, lineHeight: 1.6 }}>
            {t('heroSub')}
          </p>

          <div style={{ marginTop: 26, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link
              href={href('/jatek')}
              style={{
                padding: '15px 24px',
                background: 'var(--accent)',
                color: 'var(--onAccent)',
                border: 'var(--bw) solid var(--ink)',
                boxShadow: 'var(--shS)',
                fontFamily: 'var(--fD)',
                fontSize: 21,
                textTransform: 'uppercase',
                letterSpacing: '.03em',
                textDecoration: 'none',
              }}
            >
              ▶ {t('cta1')}
            </Link>
            <Link
              href={href('/letoltes')}
              style={{
                padding: '15px 22px',
                border: 'var(--bw) solid var(--ink)',
                color: 'var(--ink)',
                fontFamily: 'var(--fD)',
                fontSize: 21,
                textTransform: 'uppercase',
                letterSpacing: '.03em',
                textDecoration: 'none',
              }}
            >
              {t('cta2')}
            </Link>
          </div>
          <p style={{ marginTop: 16, fontSize: 14, color: 'var(--inkSoft)' }}>{t('heroNote')}</p>
        </div>
      </section>

      {/* Starting position — a ledger, deliberately not a card grid */}
      <section
        style={{
          borderBottom: 'var(--bw) solid var(--ink)',
          padding: 'clamp(24px,4cqw,48px) clamp(16px,3cqw,40px)',
          background: 'var(--paper2)',
        }}
      >
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <p style={{ fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--inkSoft)' }}>
            {t('posterTitle')}
          </p>
          <dl
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
              gap: 0,
              marginTop: 14,
              borderTop: '1px solid var(--line)',
            }}
          >
            {[
              [t('rolls'), '3'],
              [t('cash'), t('cashVal')],
              [t('debt'), t('debtVal')],
            ].map(([k, v]) => (
              <div key={k} style={{ borderBottom: '1px solid var(--line)', padding: '14px 0' }}>
                <dt style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--inkSoft)' }}>
                  {k}
                </dt>
                <dd
                  style={{
                    margin: '6px 0 0',
                    fontFamily: 'var(--fD)',
                    fontSize: 'clamp(24px,4vw,40px)',
                    lineHeight: 1,
                    color: k === t('debt') ? 'var(--accentText)' : 'var(--ink)',
                  }}
                >
                  {v}
                </dd>
              </div>
            ))}
          </dl>
          <p style={{ marginTop: 14, fontStyle: 'italic', color: 'var(--inkSoft)' }}>{t('bank')}</p>
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
          <h2
            style={{
              fontFamily: 'var(--fD)',
              fontSize: 'clamp(28px,5vw,52px)',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            {t('howTitle')}
          </h2>
          <ol style={{ listStyle: 'none', padding: 0, margin: '20px 0 0' }}>
            {[
              [t('how1t'), t('how1d')],
              [t('how2t'), t('how2d')],
              [t('how3t'), t('how3d')],
            ].map(([title, desc], n) => (
              <li
                key={title}
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
                    fontSize: 'clamp(32px,6vw,64px)',
                    lineHeight: 1,
                    color: 'var(--accent)',
                  }}
                >
                  {n + 1}
                </span>
                <div>
                  <h3 style={{ margin: 0, fontFamily: 'var(--fD)', fontSize: 22, textTransform: 'uppercase' }}>
                    {title}
                  </h3>
                  <p style={{ margin: '6px 0 0', maxWidth: '44em', color: 'var(--inkSoft)' }}>{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Cast strip */}
      <section style={{ padding: 'clamp(24px,4cqw,48px) clamp(16px,3cqw,40px)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--fD)', fontSize: 'clamp(28px,5vw,52px)', textTransform: 'uppercase', margin: 0 }}>
            {t('castTitle')}
          </h2>
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
            {CHARACTERS.filter((c) => c.id !== 'you').map((c) => (
              <li
                key={c.id}
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
              </li>
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
