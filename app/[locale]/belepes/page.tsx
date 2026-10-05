import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/lib/constants'
import { pageMetadata } from '@/lib/seo'
import { localePath } from '@/i18n/routing'
import { AuthForm, type AuthLabels } from '@/components/auth/AuthForm'

const KEYS = [
  'tabReg', 'tabLogin', 'authRegTitle', 'authLoginTitle', 'authSub',
  'fUser', 'fEmail', 'fPass', 'fId', 'submitReg', 'submitLogin',
  'haveAcc', 'noAcc', 'authSkip', 'saveMove', 'cardTitle', 'cardNo',
  'cardName', 'cardRank', 'cardJoined', 'cardNamePh', 'cardNote',
  'rankNone', 'authNotConfigured', 'authNotConfiguredD', 'authBusy',
  'authSignOut', 'authCheckEmail', 'authSavedRun', 'authNoSave',
  'authWelcome', 'hello', 'exposure', 'itemsWord', 'authNoSuchUser',
  'authPrivacyNote', 'navLegal', 'authUserLoginOff',
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
    path: '/belepes',
    title: t('tabLogin'),
    description: t('seoAuthD'),
    index: false,
  })
}

export default async function AuthPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale as Locale)
  const t = await getTranslations()

  const labels = Object.fromEntries(KEYS.map((k) => [k, t(k)])) as AuthLabels

  return (
    <div style={{ containerType: 'inline-size' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(36px,5cqw,80px) clamp(16px,3cqw,40px) clamp(56px,7cqw,104px)' }}>
        <AuthForm labels={labels} locale={locale} legalHref={localePath('/jogi', locale as Locale)} />
      </div>
    </div>
  )
}
