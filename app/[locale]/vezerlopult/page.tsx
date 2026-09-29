import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/lib/constants'
import { localePath } from '@/i18n/routing'
import { DashboardClient, type DashLabels } from '@/components/dash/DashboardClient'
import type { Scene } from '@/lib/story/types'
import prologus from '@/lib/story/content/prologus.json'
import fejezet01 from '@/lib/story/content/fejezet-01.json'

const SCENES = [prologus, fejezet01] as unknown as Scene[]

const KEYS = [
  'dashKicker', 'hello', 'logout', 'dashOutT', 'dashOutD', 'tabLogin',
  'tabReg', 'dashEmptyT', 'dashEmptyD', 'cta1', 'slotLabel', 'nextCh2',
  'dashContinue', 'replay', 'progress', 'pDone', 'pNext', 'pLock',
  'statsT', 'statsSub', 'levelW', 'rankW', 'rankNone', 'rankLocal',
  'exposure', 'expWarn', 'itemsWord', 'tlT', 'decisions', 'prologue',
  'contNoteDone', 'contCh1', 'contNoteProg', 'authNotConfigured',
  'authNotConfiguredD', 'found', 'notFound', 'authBusy',
] as const

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale as Locale)
  const t = await getTranslations()
  const l = locale as Locale

  const labels = Object.fromEntries(KEYS.map((k) => [k, t(k)])) as DashLabels

  return (
    <div style={{ containerType: 'inline-size' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(36px,5cqw,72px) clamp(16px,3cqw,40px) clamp(56px,7cqw,104px)' }}>
        <DashboardClient
          labels={labels}
          locale={l}
          playHref={localePath('/jatek', l)}
          authHref={localePath('/belepes', l)}
          downloadHref={localePath('/letoltes', l)}
          scenes={SCENES}
        />
      </div>
    </div>
  )
}
