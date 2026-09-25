import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/lib/constants'
import { CHARACTERS } from '@/lib/design/characters'

export default async function CharactersPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale as Locale)
  const t = await getTranslations()
  const l = locale as Locale

  return (
    <div style={{ padding: 'clamp(24px,4cqw,48px) clamp(16px,3cqw,40px)' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        <p style={{ fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--inkSoft)' }}>
          {t('charsKicker')}
        </p>
        <h1
          style={{
            fontFamily: 'var(--fD)',
            fontSize: 'clamp(38px,8vw,88px)',
            lineHeight: 0.9,
            textTransform: 'uppercase',
            margin: '10px 0 0',
          }}
        >
          {t('navChars')}
        </h1>
        <p
          style={{
            marginTop: 16,
            maxWidth: '36em',
            fontStyle: 'italic',
            borderLeft: '4px solid var(--accent)',
            paddingLeft: 14,
          }}
        >
          {t('charsQuote')}
        </p>

        {/* A ledger, one subject per row — not a grid of identical cards */}
        <div style={{ marginTop: 32, borderTop: 'var(--bw) solid var(--ink)' }}>
          {CHARACTERS.map((c, n) => (
            <article
              key={c.id}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(64px,auto) minmax(0,1fr) minmax(0,1.1fr)',
                gap: 'clamp(12px,3vw,28px)',
                alignItems: 'start',
                padding: '22px 0',
                borderBottom: '1px solid var(--line)',
              }}
            >
              <div
                aria-hidden
                style={{
                  fontFamily: 'var(--fD)',
                  fontSize: 'clamp(28px,5vw,46px)',
                  lineHeight: 1,
                  color: 'var(--onAccent)',
                  background: c.boss ? 'var(--accent)' : 'var(--ink)',
                  border: 'var(--bw) solid var(--ink)',
                  padding: '10px 12px',
                  textAlign: 'center',
                }}
              >
                {c.initials}
              </div>

              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    letterSpacing: '.18em',
                    textTransform: 'uppercase',
                    color: 'var(--inkSoft)',
                  }}
                >
                  {t('fileNo')} FK-{String(n + 1).padStart(2, '0')}
                  {c.boss ? ` · ${t('finalBoss').split(' ')[0]}` : ''}
                </p>
                <h2
                  style={{
                    margin: '6px 0 0',
                    fontFamily: 'var(--fD)',
                    fontSize: 'clamp(22px,3.4vw,34px)',
                    textTransform: 'uppercase',
                    lineHeight: 1.05,
                  }}
                >
                  {c.name[l]}
                </h2>
                <p style={{ margin: '4px 0 0', color: 'var(--inkSoft)' }}>{c.title[l]}</p>
                <p style={{ margin: '10px 0 0', fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--inkSoft)' }}>
                  {t('firstSeen')}:{' '}
                  <span style={{ color: 'var(--ink)' }}>
                    {c.chapter === 0 ? t('prologue') : t('chapterN').replace('%n', String(c.chapter))}
                  </span>
                </p>
              </div>

              <blockquote
                style={{
                  margin: 0,
                  background: 'var(--sheet)',
                  border: '1px solid var(--line)',
                  padding: '14px 16px',
                  fontSize: 16,
                  lineHeight: 1.6,
                }}
              >
                &bdquo;{c.quote[l]}&rdquo;
              </blockquote>
            </article>
          ))}
        </div>

        <p style={{ marginTop: 18, fontSize: 13, color: 'var(--inkSoft)' }}>{t('noPhoto')}</p>
      </div>
    </div>
  )
}
