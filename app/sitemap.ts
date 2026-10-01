import type { MetadataRoute } from 'next'
import { LOCALES } from '@/lib/constants'
import { PUBLIC_ROUTES, absolute, languageAlternates } from '@/lib/site'

/** A static export has no server to generate these per request. */
export const dynamic = 'force-static'

/**
 * Both locales of every public page, each naming the other as an alternate so
 * a search engine treats them as one page in two languages rather than as
 * duplicates competing with each other.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return LOCALES.flatMap((locale) =>
    PUBLIC_ROUTES.map((path) => ({
      url: absolute(path, locale),
      // A date, not an instant. Millisecond precision on "when did this page
      // last change" is noise, and some sitemap parsers object to it.
      lastModified: new Date().toISOString().slice(0, 10),
      changeFrequency: path === '/' ? ('weekly' as const) : ('monthly' as const),
      priority: path === '/' ? 1 : path === '/jatek' ? 0.9 : 0.6,
      alternates: { languages: languageAlternates(path) },
    })),
  )
}
