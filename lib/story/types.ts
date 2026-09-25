import type { Locale } from '@/lib/constants'

export type Bilingual = { hu: string; en: string }

export function pick(text: Bilingual, locale: Locale): string {
  return text[locale]
}

export type ItemId =
  | 'envelope1'
  | 'envelopeSmall'
  | 'lakatosFile'
  | 'offshore'
  | 'peteriDossier'
  | 'bossTrust'
  | 'parliamentKey'

export type CharacterId =
  | 'you'
  | 'lipoti'
  | 'lakatos'
  | 'kapzs'
  | 'peteri'
  | 'molnar'
  | 'unknown'

export type ChoicePointId = string

export type RunStatus = 'playing' | 'exposed' | 'demoComplete'

export type Beat =
  | { kind: 'narration'; text: Bilingual }
  | { kind: 'dialogue'; speaker: CharacterId; text: Bilingual }
  | {
      kind: 'chapterCard'
      number: number
      title: Bilingual
      quote: Bilingual
      place: Bilingual
    }
  | { kind: 'item'; item: ItemId }
  | { kind: 'statScreen' }
  | {
      kind: 'choice'
      id: ChoicePointId
      prompt: Bilingual
      options: ChoiceOption[]
    }

export type ChoiceOption = {
  text: Bilingual
  xp: number
  lebukas: number
  grantsItem?: ItemId
  response: Beat[]
}

export type Scene = {
  id: string
  chapter: number
  beats: Beat[]
}

export type Decision = { choicePointId: ChoicePointId; optionIndex: number }

export type PlayerState = {
  name: string
  xp: number
  lebukas: number
  szint: number
  items: ItemId[]
  history: Decision[]
  status: RunStatus
}
