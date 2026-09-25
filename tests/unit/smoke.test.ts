import { describe, it, expect } from 'vitest'
import { SITE_TITLE } from '@/lib/constants'

describe('site constants', () => {
  it('spells the title without an accent on the first word', () => {
    expect(SITE_TITLE.hu).toBe('Fityesz Krónika')
    expect(SITE_TITLE.en).toBe('The Fityesz Chronicle')
  })
})
