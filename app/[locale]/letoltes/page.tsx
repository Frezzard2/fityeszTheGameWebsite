import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/lib/constants'
import { pageMetadata } from '@/lib/seo'
import { Reveal } from '@/components/Reveal'

/** The three builds in the design. Ported from the prototype's `dl.platforms`. */
const PLATFORMS = [
  { name: 'Windows', fileKey: 'dlWin' },
  { name: 'macOS', fileKey: 'dlMac' },
  { name: 'Linux', fileKey: 'dlLinux' },
] as const

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale })
  return pageMetadata({
    locale: locale as Locale,
    path: '/letoltes',
    title: t('dlTitle'),
    description: t('seoDownloadD'),
  })
}

export default async function DownloadPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale as Locale)
  const t = await getTranslations()

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
          font: '700 13px/1.3 var(--fL)',
          letterSpacing: '.14em',
          textTransform: 'uppercase',
          color: 'var(--accentText)',
        }}
      >
        {t('dlKicker')}
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
          maxWidth: '11em',
        }}
      >
        {t('dlTitle')}
      </Reveal>

      <p style={{ margin: '18px 0 0', maxWidth: '34em', fontSize: 'clamp(17px,1.5cqw,20px)', lineHeight: 1.5 }}>
        {t('dlSub')}
      </p>

      {/* Nothing is downloadable yet: the installers are not built. */}
      <Reveal
        kind="up"
        style={{
          marginTop: 32,
          background: 'var(--ink)',
          color: 'var(--onInk)',
          border: 'var(--bw) solid var(--ink)',
          padding: 'clamp(20px,3cqw,32px)',
          maxWidth: '46em',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--fD)',
            fontWeight: 'var(--dW)' as unknown as number,
            textTransform: 'uppercase',
            fontSize: 32,
            lineHeight: 1.14,
          }}
        >
          {t('dlSoon')}
        </div>
        <p style={{ margin: '8px 0 0', fontSize: 15, lineHeight: 1.5, opacity: 0.88 }}>{t('dlSoonNote')}</p>
      </Reveal>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,280px),1fr))',
          gap: 24,
          marginTop: 28,
        }}
      >
        {PLATFORMS.map((p, n) => (
          <Reveal
            key={p.name}
            kind="lift"
            delay={n * 110}
            style={{
              background: 'var(--sheet)',
              border: 'var(--bw) solid var(--ink)',
              boxShadow: 'var(--shS)',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              minHeight: 250,
              opacity: 0.55,
            }}
          >
            <div style={{ font: '700 12px/1 var(--fL)', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--inkSoft)' }}>
              {t('dlKicker')}
            </div>
            <div
              style={{
                fontFamily: 'var(--fD)',
                fontWeight: 'var(--dW)' as unknown as number,
                textTransform: 'uppercase',
                fontSize: 'clamp(34px,4cqw,56px)',
                lineHeight: 1.14,
              }}
            >
              {p.name}
            </div>
            <div style={{ fontSize: 15 }}>{t(p.fileKey)}</div>
            <button
              type="button"
              disabled
              style={{
                marginTop: 'auto',
                padding: '14px 18px 13px',
                background: 'transparent',
                color: 'var(--ink)',
                border: 'var(--bw) solid var(--ink)',
                fontFamily: 'var(--fD)',
                fontWeight: 'var(--dW)' as unknown as number,
                fontSize: 20,
                lineHeight: 1.14,
                textTransform: 'uppercase',
                cursor: 'not-allowed',
              }}
            >
              {t('dlSoon')}
            </button>
          </Reveal>
        ))}
      </div>

      <Reveal
        kind="rise"
        as="h2"
        style={{
          margin: 'clamp(48px,6cqw,80px) 0 0',
          fontFamily: 'var(--fD)',
          fontWeight: 'var(--dW)' as unknown as number,
          textTransform: 'uppercase',
          lineHeight: 1.14,
          fontSize: 'clamp(36px,4.6cqw,64px)',
        }}
      >
        {t('dlHowT')}
      </Reveal>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,260px),1fr))',
          gap: 1,
          background: 'var(--line)',
          border: 'var(--bw) solid var(--ink)',
          marginTop: 26,
        }}
      >
        {(['dlStep1', 'dlStep2', 'dlStep3'] as const).map((key, n) => (
          <Reveal key={key} kind="up" delay={n * 110} style={{ background: 'var(--sheet)', padding: '24px 24px 28px' }}>
            <div
              style={{
                fontFamily: 'var(--fD)',
                fontWeight: 'var(--dW)' as unknown as number,
                fontSize: 60,
                lineHeight: 1.14,
                color: 'var(--accentText)',
              }}
            >
              0{n + 1}
            </div>
            <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.45 }}>{t(key)}</p>
          </Reveal>
        ))}
      </div>
    </div>
  )
}
