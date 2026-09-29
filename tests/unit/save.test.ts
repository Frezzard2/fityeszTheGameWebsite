import { describe, it, expect } from 'vitest'
import { chapterOf, nameFor, rowToState, type SaveRow } from '@/lib/story/save'
import { EXPOSURE_LIMIT } from '@/lib/story/engine'

const row = (over: Partial<SaveRow> = {}): SaveRow => ({
  player_name: 'Zsombi',
  display_name: 'Zsombi',
  xp: 35,
  lebukas: 25,
  szint: 1,
  items: [],
  history: [],
  chapter: 1,
  ...over,
})

describe('account save mapping', () => {
  it('reads a finished run back as finished', () => {
    // The row has no status column, so chapter has to carry it both ways.
    const state = rowToState(row({ chapter: chapterOf('demoComplete') }))
    expect(state.status).toBe('demoComplete')
  })

  it('leaves an unfinished run playable', () => {
    expect(rowToState(row({ chapter: chapterOf('playing') })).status).toBe('playing')
  })

  it('keeps an exposed run exposed', () => {
    expect(rowToState(row({ lebukas: EXPOSURE_LIMIT })).status).toBe('exposed')
  })
})

describe('what the game calls the player', () => {
  it('uses the account name over a name typed before signing in', () => {
    expect(nameFor(row({ player_name: 'Anna', display_name: 'Zsombi' }), 'Zsombi')).toBe('Zsombi')
  })

  it('keeps a name the player accepted', () => {
    expect(nameFor(row({ player_name: 'Anna', display_name: 'Anna' }), 'Zsombi')).toBe('Anna')
  })

  it('leaves a guest run alone', () => {
    expect(nameFor(row({ player_name: 'Anna', display_name: 'Zsombi' }), undefined)).toBe('Anna')
  })
})
