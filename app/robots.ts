import type { MetadataRoute } from 'next'
import { PRIVATE_ROUTES, SITE_URL } from '@/lib/site'
import { LOCALES } from '@/lib/constants'

/** A static export has no server to generate these per request. */
export const dynamic = 'force-static'

/** Emitted as a real robots.txt at build time, which a static export needs. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: LOCALES.flatMap((l) => PRIVATE_ROUTES.map((r) => `/${l}${r}/`)),
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
