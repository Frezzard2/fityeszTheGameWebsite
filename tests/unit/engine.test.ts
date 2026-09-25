import { describe, it, expect } from 'vitest'
import {
  initialState,
  applyChoice,
  EXPOSURE_LIMIT,
  LEVEL_UP_XP,
} from '@/lib/story/engine'
import type { ChoiceOption, ItemId } from '@/lib/story/types'

const opt = (xp: number, lebukas: number, grantsItem?: ItemId): ChoiceOption => ({
  text: { hu: '', en: '' },
  xp,
  lebukas,
  grantsItem,
  response: [],
})

describe('applyChoice', () => {
  it('adds xp and exposure', () => {
    const s = applyChoice(initialState('Anna'), 'ch1.q1', 0, opt(15, 10))
    expect(s.xp).toBe(15)
    expect(s.lebukas).toBe(10)
  })

  it('grants an item exactly once', () => {
    let s = applyChoice(initialState('Anna'), 'ch1.q2', 0, opt(20, 15, 'envelope1'))
    s = applyChoice(s, 'ch1.q2', 0, opt(20, 15, 'envelope1'))
    expect(s.items).toEqual(['envelope1'])
  })

  it('lets a careful choice lower exposure', () => {
    let s = applyChoice(initialState('Anna'), 'ch1.q1', 0, opt(15, 10))
    s = applyChoice(s, 'ch1.q2', 2, opt(0, -10))
    expect(s.lebukas).toBe(0)
  })

  it('never drops exposure below zero', () => {
    const s = applyChoice(initialState('Anna'), 'ch1.q2', 2, opt(0, -10))
    expect(s.lebukas).toBe(0)
  })

  it('ends the run when exposure reaches the limit', () => {
    const s = applyChoice(initialState('Anna'), 'ch1.q1', 0, opt(0, EXPOSURE_LIMIT))
    expect(s.status).toBe('exposed')
  })

  it('does not end the run one short of the limit', () => {
    const s = applyChoice(initialState('Anna'), 'ch1.q1', 0, opt(0, EXPOSURE_LIMIT - 1))
    expect(s.status).toBe('playing')
  })

  it('levels up at the xp threshold and not before', () => {
    const below = applyChoice(initialState('Anna'), 'ch1.q1', 0, opt(LEVEL_UP_XP - 1, 0))
    expect(below.szint).toBe(1)
    const at = applyChoice(initialState('Anna'), 'ch1.q1', 0, opt(LEVEL_UP_XP, 0))
    expect(at.szint).toBe(2)
  })

  it('records every decision in order', () => {
    let s = applyChoice(initialState('Anna'), 'ch1.q1', 1, opt(10, 5))
    s = applyChoice(s, 'ch1.q2', 2, opt(0, -10))
    expect(s.history).toEqual([
      { choicePointId: 'ch1.q1', optionIndex: 1 },
      { choicePointId: 'ch1.q2', optionIndex: 2 },
    ])
  })

  it('does not mutate the state it is given', () => {
    const before = initialState('Anna')
    const snapshot = JSON.stringify(before)
    applyChoice(before, 'ch1.q1', 0, opt(15, 10))
    expect(JSON.stringify(before)).toBe(snapshot)
  })

  it('reproduces the full Chapter 1 greedy path from the Java', () => {
    let s = initialState('Anna')
    s = applyChoice(s, 'ch1.q1', 0, opt(15, 10))
    s = applyChoice(s, 'ch1.q2', 0, opt(20, 15, 'envelope1'))
    expect(s).toMatchObject({
      xp: 35,
      lebukas: 25,
      szint: 1,
      items: ['envelope1'],
      status: 'playing',
    })
  })
})
