import { describe, it, expect } from 'vitest'
import { otherLocale, localePath } from '@/i18n/routing'

describe('locale helpers', () => {
  it('toggles between the two locales', () => {
    expect(otherLocale('hu')).toBe('en')
    expect(otherLocale('en')).toBe('hu')
  })
  it('prefixes every path with its locale', () => {
    expect(localePath('/jatek', 'hu')).toBe('/hu/jatek')
    expect(localePath('/jatek', 'en')).toBe('/en/jatek')
    expect(localePath('/', 'hu')).toBe('/hu')
    expect(localePath('/', 'en')).toBe('/en')
  })
})
