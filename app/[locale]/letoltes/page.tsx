import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/lib/constants'
import { pageMetadata } from '@/lib/seo'
import { Reveal } from '@/components/Reveal'
import { Builds, type BuildLabels } from '@/components/download/Builds'

/** What the cards say. The files themselves are read off the release at load. */
const LABELS = [
  'dlKicker', 'dlVersion', 'dlBtn', 'dlWin', 'dlMacArm', 'dlMacIntel', 'dlLinux',
  'dlYours', 'dlAll', 'dlFallback', 'dlUnsignedT', 'dlUnsigned',
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

      <Builds
        labels={Object.fromEntries(LABELS.map((key) => [key, t(key)])) as BuildLabels}
      />

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
