import type { Locale } from '@/lib/constants'
import type { Beat, ChoiceOption, ChoicePointId, Decision, PlayerState } from './types'

/** Reaching this exposure ends the run — `lebukasEllenorzes()` in fityesz1_0.java. */
export const EXPOSURE_LIMIT = 100

/** `if (xp >= 50)` in fityesz1_0.java grants HELYI PÁRTTAG and level 2. */
export const LEVEL_UP_XP = 50

export function initialState(name: string): PlayerState {
  return {
    name,
    xp: 0,
    lebukas: 0,
    szint: 1,
    items: [],
    history: [],
    status: 'playing',
    beat: 0,
  }
}

export function applyChoice(
  s: PlayerState,
  choicePointId: ChoicePointId,
  optionIndex: number,
  option: ChoiceOption,
): PlayerState {
  const xp = s.xp + option.xp
  const lebukas = Math.max(0, s.lebukas + option.lebukas)
  const items =
    option.grantsItem && !s.items.includes(option.grantsItem)
      ? [...s.items, option.grantsItem]
      : s.items

  return {
    ...s,
    xp,
    lebukas,
    szint: xp >= LEVEL_UP_XP ? 2 : s.szint,
    items,
    history: [...s.history, { choicePointId, optionIndex }],
    status: lebukas >= EXPOSURE_LIMIT ? 'exposed' : s.status,
  }
}

/** The game's text uses printf placeholders; the player's name is the only argument. */
export function fill(text: string, name: string): string {
  return text.replace(/%s/g, name)
}

/** One answered choice, ready to show. */
export type Decided = {
  id: ChoicePointId
  question: string
  answer: string
  xp: number
  lebukas: number
}

/**
 * Reads a run's history back against the story.
 *
 * `history` records which option was taken where, and nothing about what was
 * asked; recovering the question and the answer means finding the choice beat
 * again. The play screen and the dashboard both show this list, and each used
 * to work it out for itself.
 */
export function decisions(
  history: Decision[],
  beats: Beat[],
  locale: Locale,
  /** When given, fills the player's name into the question. */
  name?: string,
): Decided[] {
  return history.map((h) => {
    const source = beats.find((b) => b.kind === 'choice' && b.id === h.choicePointId)
    const asked = source?.kind === 'choice' ? source.prompt[locale] : ''
    const option = source?.kind === 'choice' ? source.options[h.optionIndex] : undefined
    return {
      id: h.choicePointId,
      question: name ? fill(asked, name) : asked,
      answer: option ? option.text[locale] : '',
      xp: option ? option.xp : 0,
      lebukas: option ? option.lebukas : 0,
    }
  })
}
