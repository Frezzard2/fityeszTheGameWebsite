import { defineRouting } from 'next-intl/routing'
import { LOCALES, DEFAULT_LOCALE, type Locale } from '@/lib/constants'

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'as-needed',
})

export function otherLocale(l: Locale): Locale {
  return l === 'hu' ? 'en' : 'hu'
}

export function localePath(path: string, l: Locale): string {
  if (l === DEFAULT_LOCALE) return path
  return path === '/' ? '/en' : `/en${path}`
}
