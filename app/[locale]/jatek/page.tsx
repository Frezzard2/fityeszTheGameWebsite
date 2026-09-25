import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/lib/constants'
import { DirectionScope } from '@/components/DirectionScope'
import { StoryPlayer, type PlayLabels } from '@/components/play/StoryPlayer'
import type { Scene } from '@/lib/story/types'
import prologus from '@/lib/story/content/prologus.json'
import fejezet01 from '@/lib/story/content/fejezet-01.json'

const SCENES = [prologus, fejezet01] as unknown as Scene[]

export default async function PlayPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale as Locale)
  const t = await getTranslations()

  const labels: PlayLabels = {
    namePh: t('namePh'),
    confirm: t('confirm'),
    nameNote: t('nameNote'),
    namePrompt: t('namePrompt'),
    playHelp: t('playHelp'),
    chooseHint: t('chooseHint'),
    next: t('next'),
    exposure: t('exposure'),
    itemsWord: t('itemsWord'),
    restart: t('restart'),
    endKicker: t('endKicker'),
    endNext: t('endNext'),
    gateTitle: t('gateTitle'),
    gateSub: t('gateSub'),
    gateCta: t('gateCta'),
    gateSkip: t('gateSkip'),
    gateSkipNote: t('gateSkipNote'),
    exposed: t('exposed'),
    pressfound: t('pressfound'),
  }

  return (
    <DirectionScope value="dossier">
      <div
        style={{
          padding: 'clamp(24px,4cqw,48px) clamp(16px,3cqw,40px)',
          maxWidth: 820,
          margin: '0 auto',
          backgroundImage: 'var(--tex)',
          minHeight: '70vh',
        }}
      >
        <StoryPlayer scenes={SCENES} labels={labels} locale={locale as Locale} />
      </div>
    </DirectionScope>
  )
}
