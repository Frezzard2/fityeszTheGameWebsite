import type { ChoiceOption, ChoicePointId, PlayerState } from './types'

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
