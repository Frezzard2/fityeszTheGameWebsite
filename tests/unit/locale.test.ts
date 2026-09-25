import { describe, it, expect } from 'vitest'
import { otherLocale, localePath } from '@/i18n/routing'

describe('locale helpers', () => {
  it('toggles between the two locales', () => {
    expect(otherLocale('hu')).toBe('en')
    expect(otherLocale('en')).toBe('hu')
  })
  it('leaves Hungarian paths unprefixed and prefixes English ones', () => {
    expect(localePath('/jatek', 'hu')).toBe('/jatek')
    expect(localePath('/jatek', 'en')).toBe('/en/jatek')
    expect(localePath('/', 'en')).toBe('/en')
    expect(localePath('/', 'hu')).toBe('/')
  })
})
