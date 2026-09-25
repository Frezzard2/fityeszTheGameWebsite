import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/lib/constants'
import { CREATORS, GAME_REPO_URL, kofiUrl } from '@/lib/creators'
import { Reveal } from '@/components/Reveal'

/** `c.name[1].split(' ').map(w => w[0]).join('')`, ported from the prototype. */
function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
}

export default async function SupportPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale as Locale)
  const t = await getTranslations()
  const kofi = kofiUrl()

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
          fontFamily: 'var(--fL)',
          fontWeight: 700,
          fontSize: 13,
          lineHeight: 1.3,
          letterSpacing: '.14em',
          textTransform: 'uppercase',
          color: 'var(--accentText)',
        }}
      >
        {t('supKicker')}
      </div>

      <Reveal
        kind="rise"
        as="h1"
        style={{
          margin: '12px 0 0',
          fontFamily: 'var(--fD)',
          fontWeight: 'var(--dW)' as unknown as number,
          textTransform: 'uppercase',
          lineHeight: 1.06,
          fontSize: 'clamp(52px,8cqw,124px)',
          maxWidth: '10em',
        }}
      >
        {t('supTitle')}
      </Reveal>

      <p
        style={{
          margin: '18px 0 0',
          maxWidth: '34em',
          fontSize: 'clamp(17px,1.5cqw,20px)',
          lineHeight: 1.5,
        }}
      >
        {t('supSub')}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,280px),1fr))',
          gap: 24,
          marginTop: 40,
          alignItems: 'stretch',
        }}
      >
        <Reveal
          kind="up"
          as="div"
          data-testid="kofi"
          style={{
            background: 'var(--accent)',
            color: 'var(--onAccent)',
            border: 'var(--bw) solid var(--ink)',
            boxShadow: 'var(--sh)',
            padding: 'clamp(24px,3cqw,36px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            aria-hidden
            className="fz-drift"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(circle,var(--onAccent) 1.2px,transparent 1.8px)',
              backgroundSize: '9px 9px',
              opacity: 0.2,
              WebkitMaskImage: 'linear-gradient(to top left,#000,transparent 65%)',
              maskImage: 'linear-gradient(to top left,#000,transparent 65%)',
            }}
          />
          <div
            style={{
              position: 'relative',
              fontFamily: 'var(--fL)',
              fontWeight: 700,
              fontSize: 12,
              lineHeight: 1,
              letterSpacing: '.16em',
              textTransform: 'uppercase',
            }}
          >
            Ko-fi
          </div>
          <div
            style={{
              position: 'relative',
              fontFamily: 'var(--fD)',
              fontWeight: 'var(--dW)' as unknown as number,
              textTransform: 'uppercase',
              fontSize: 'clamp(40px,4.4cqw,60px)',
              lineHeight: 1.14,
            }}
          >
            {t('kofiCardT')}
          </div>
          <p style={{ position: 'relative', margin: 0, fontSize: 16, lineHeight: 1.5 }}>{t('kofiCardD')}</p>

          {kofi ? (
            <a
              href={kofi}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                position: 'relative',
                marginTop: 'auto',
                alignSelf: 'flex-start',
                display: 'inline-flex',
                alignItems: 'center',
                padding: '15px 22px 14px',
                background: 'var(--ink)',
                color: 'var(--onInk)',
                border: 'var(--bw) solid var(--ink)',
                fontFamily: 'var(--fD)',
                fontWeight: 'var(--dW)' as unknown as number,
                fontSize: 21,
                lineHeight: 1.14,
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              {t('kofi')}
            </a>
          ) : (
            <>
              <span
                style={{
                  position: 'relative',
                  marginTop: 'auto',
                  alignSelf: 'flex-start',
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '15px 22px 14px',
                  background: 'var(--ink)',
                  color: 'var(--onInk)',
                  border: 'var(--bw) solid var(--ink)',
                  fontFamily: 'var(--fD)',
                  fontWeight: 'var(--dW)' as unknown as number,
                  fontSize: 21,
                  lineHeight: 1.14,
                  textTransform: 'uppercase',
                }}
              >
                {t('kofiSoon')}
              </span>
              <p style={{ position: 'relative', margin: 0, fontSize: 13, lineHeight: 1.45 }}>{t('kofiNote')}</p>
            </>
          )}
        </Reveal>

        {CREATORS.map((c) => (
          <Reveal
            key={c.handle}
            kind="up"
            as="div"
            style={{
              background: 'var(--sheet)',
              border: 'var(--bw) solid var(--ink)',
              boxShadow: 'var(--shS)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                position: 'relative',
                height: 150,
                overflow: 'hidden',
                background: 'var(--ink)',
                color: 'var(--onInk)',
                borderBottom: 'var(--bw) solid var(--ink)',
              }}
            >
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  right: -6,
                  bottom: 8,
                  fontFamily: 'var(--fD)',
                  fontWeight: 'var(--dW)' as unknown as number,
                  fontSize: 140,
                  lineHeight: 1,
                  letterSpacing: '-.03em',
                  backgroundImage: 'radial-gradient(circle,var(--onInk) 2.2px,transparent 2.8px)',
                  backgroundSize: '7px 7px',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                {initialsOf(c.name)}
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
                }}
              >
                {t('creatorWord')}
              </div>
            </div>
            <div style={{ padding: '20px 22px 22px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              <div
                style={{
                  fontFamily: 'var(--fD)',
                  fontWeight: 'var(--dW)' as unknown as number,
                  textTransform: 'uppercase',
                  fontSize: 40,
                  lineHeight: 1.14,
                }}
              >
                {c.name}
              </div>
              <div style={{ fontFamily: 'var(--fL)', fontWeight: 600, fontSize: 14, lineHeight: 1.3, color: 'var(--inkSoft)' }}>
                @{c.handle}
              </div>
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  marginTop: 'auto',
                  alignSelf: 'flex-start',
                  padding: '11px 16px 10px',
                  border: 'var(--bw) solid var(--ink)',
                  color: 'var(--ink)',
                  fontFamily: 'var(--fD)',
                  fontWeight: 'var(--dW)' as unknown as number,
                  fontSize: 17,
                  lineHeight: 1.14,
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                }}
              >
                {t('ghBtn')} →
              </a>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal
        kind="up"
        as="div"
        style={{
          marginTop: 28,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px 20px',
          alignItems: 'center',
          padding: '18px 20px',
          border: 'var(--bw) solid var(--ink)',
          background: 'var(--paper2)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--fD)',
            fontWeight: 'var(--dW)' as unknown as number,
            textTransform: 'uppercase',
            fontSize: 24,
            lineHeight: 1.14,
          }}
        >
          {t('repoT')}
        </span>
        <a href={GAME_REPO_URL} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--fL)', fontWeight: 600, fontSize: 15, lineHeight: 1.3 }}>
          {GAME_REPO_URL.replace('https://', '')}
        </a>
      </Reveal>
    </div>
  )
}
