import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/lib/constants'

// Minimal placeholder proving the locale route and translations work.
// Task 11 owns the real landing page and replaces this wholesale.
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale as Locale)
  const t = await getTranslations()

  return (
    <div style={{ padding: 'clamp(24px,4cqw,48px) clamp(16px,3cqw,40px)' }}>
      <h1 style={{ fontFamily: 'var(--fD)', fontWeight: 'var(--dW)', textTransform: 'uppercase' }}>{t('titleFull')}</h1>
      <p style={{ marginTop: 12, maxWidth: '32em' }}>{t('heroSub')}</p>
    </div>
  )
}
