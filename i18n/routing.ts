import { defineRouting } from 'next-intl/routing'
import { LOCALES, DEFAULT_LOCALE, type Locale } from '@/lib/constants'

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  // Static export has no middleware, so every locale carries its prefix.
  localePrefix: 'always',
})

export function otherLocale(l: Locale): Locale {
  return l === 'hu' ? 'en' : 'hu'
}

export function localePath(path: string, l: Locale): string {
  return path === '/' ? `/${l}` : `/${l}${path}`
}
