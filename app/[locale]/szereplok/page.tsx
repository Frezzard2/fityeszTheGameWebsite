import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/lib/constants'
import { CHARACTERS } from '@/lib/design/characters'
import { Reveal } from '@/components/Reveal'

/** Cycles the card header colour per card, ported from the prototype's `cols` array. */
const HEADER_COLORS = [
  { bg: 'var(--accent)', fg: 'var(--onAccent)' },
  { bg: 'var(--ink)', fg: 'var(--onInk)' },
  { bg: 'var(--second)', fg: 'var(--onSecond)' },
] as const

export default async function CharactersPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale as Locale)
  const t = await getTranslations()
  const l = locale as Locale
  const openQuote = l === 'en' ? '“' : '„'

  return (
    <div
      style={{
        maxWidth: 1320,
        margin: '0 auto',
        padding: 'clamp(40px,6cqw,88px) clamp(16px,3cqw,40px) clamp(56px,7cqw,104px)',
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: 13,
          lineHeight: 1.3,
          fontFamily: 'var(--fL)',
          letterSpacing: '.14em',
          textTransform: 'uppercase',
          color: 'var(--accentText)',
        }}
      >
        {t('charsKicker')}
      </div>

      <Reveal
        kind="rise"
        as="h1"
        style={{
          margin: '12px 0 0',
          fontFamily: 'var(--fD)',
          fontWeight: 'var(--dW)' as unknown as number,
          textTransform: 'uppercase',
          lineHeight: 0.98,
          fontSize: 'clamp(56px,9cqw,140px)',
        }}
      >
        {t('navChars')}
      </Reveal>

      <p
        style={{
          margin: '18px 0 0',
          maxWidth: '30em',
          fontSize: 'clamp(18px,1.6cqw,22px)',
          lineHeight: 1.45,
          fontStyle: 'italic',
        }}
      >
        {t('charsQuote')}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,300px),1fr))',
          gap: 28,
          marginTop: 44,
        }}
      >
        {CHARACTERS.map((c, n) => {
          const { bg, fg } = HEADER_COLORS[n % HEADER_COLORS.length]
          const num = String(n).padStart(2, '0')
          const first = c.chapter === 0 ? t('prologue') : t('chapterN').replace('%n', String(c.chapter))

          return (
            <Reveal
              key={c.id}
              kind="up"
              delay={n * 90}
              as="article"
              className="fz-lift"
              style={{
                background: 'var(--sheet)',
                border: 'var(--bw) solid var(--ink)',
                boxShadow: 'var(--sh)',
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
              }}
            >
              <div
                style={{
                  position: 'relative',
                  height: 220,
                  overflow: 'hidden',
                  background: bg,
                  color: fg,
                  borderBottom: 'var(--bw) solid var(--ink)',
                }}
              >
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `radial-gradient(circle,${fg} 1px,transparent 1.6px)`,
                    backgroundSize: '8px 8px',
                    opacity: 0.3,
                    WebkitMaskImage: 'linear-gradient(200deg,#000 10%,transparent 70%)',
                    maskImage: 'linear-gradient(200deg,#000 10%,transparent 70%)',
                  }}
                />
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    right: -6,
                    bottom: 10,
                    fontFamily: 'var(--fD)',
                    fontWeight: 'var(--dW)' as unknown as number,
                    fontSize: 200,
                    lineHeight: 1,
                    letterSpacing: '-.03em',
                    backgroundImage: `radial-gradient(circle,${fg} 2.4px,transparent 3px)`,
                    backgroundSize: '7px 7px',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  {c.initials}
                </div>
                <div
                  style={{
                    position: 'absolute',
                    left: 16,
                    top: 16,
                    fontFamily: 'var(--fL)',
                    fontWeight: 700,
                    fontSize: 12,
                    lineHeight: 1,
                    letterSpacing: '.14em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t('fileNo')} {num} · {first}
                </div>
                <div
                  style={{
                    position: 'absolute',
                    left: 16,
                    bottom: 12,
                    fontFamily: 'var(--fL)',
                    fontSize: 11,
                    letterSpacing: '.12em',
                    textTransform: 'uppercase',
                    opacity: 0.65,
                  }}
                >
                  {t('noPhoto')}
                </div>
                {c.boss && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 14,
                      top: 14,
                      padding: '6px 8px',
                      background: 'var(--ink)',
                      color: 'var(--onInk)',
                      fontFamily: 'var(--fL)',
                      fontWeight: 700,
                      fontSize: 11,
                      lineHeight: 1,
                      letterSpacing: '.12em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {t('bossfight')}
                  </div>
                )}
              </div>

              <div
                style={{
                  padding: '20px 22px 22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  flex: 1,
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontFamily: 'var(--fD)',
                    fontWeight: 'var(--dW)' as unknown as number,
                    textTransform: 'uppercase',
                    fontSize: 44,
                    lineHeight: 1.14,
                  }}
                >
                  {c.name[l]}
                </h2>
                <div
                  style={{
                    fontFamily: 'var(--fL)',
                    fontWeight: 700,
                    fontSize: 12,
                    lineHeight: 1.35,
                    letterSpacing: '.12em',
                    textTransform: 'uppercase',
                    color: 'var(--accentText)',
                  }}
                >
                  {c.title[l]}
                </div>
                <p
                  style={{
                    margin: '6px 0 0',
                    fontSize: 17,
                    lineHeight: 1.45,
                    fontStyle: 'italic',
                  }}
                >
                  {openQuote}
                  {c.quote[l]}
                  {'”'}
                </p>
                <div
                  style={{
                    marginTop: 'auto',
                    paddingTop: 14,
                    borderTop: '1px solid var(--line)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    fontFamily: 'var(--fL)',
                    fontWeight: 600,
                    fontSize: 12,
                    lineHeight: 1.2,
                    letterSpacing: '.08em',
                    textTransform: 'uppercase',
                    color: 'var(--inkSoft)',
                  }}
                >
                  <span>{t('firstSeen')}</span>
                  <span>{first}</span>
                </div>
              </div>
            </Reveal>
          )
        })}
      </div>
    </div>
  )
}
