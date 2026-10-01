import { LOCALES, type Locale } from '@/lib/constants'

/**
 * The canonical origin, used for canonical links, hreflang, the sitemap and
 * link-preview image URLs. Those all have to be absolute, and a static export
 * has no request to read the host from.
 */
export const SITE_URL = 'https://fityeszthegame.com'

/** Every page a search engine should know about, without its locale prefix. */
export const PUBLIC_ROUTES = [
  '/',
  '/szereplok',
  '/lexikon',
  '/jatek',
  '/letoltes',
  '/tamogatas',
  '/jogi',
] as const

/**
 * Pages kept out of search results. The sign-in page has nothing to read, and
 * the dashboard is a signed-in view that would only ever render empty to a
 * crawler.
 */
export const PRIVATE_ROUTES = ['/belepes', '/vezerlopult'] as const

export function absolute(path: string, locale: Locale): string {
  return `${SITE_URL}/${locale}${path === '/' ? '/' : `${path}/`}`
}

/** hreflang map: each locale, plus x-default pointing at the Hungarian site. */
export function languageAlternates(path: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const l of LOCALES) out[l] = absolute(path, l)
  out['x-default'] = absolute(path, 'hu')
  return out
}
