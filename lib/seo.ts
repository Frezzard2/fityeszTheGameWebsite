import type { Metadata } from 'next'
import { SITE_TITLE, type Locale } from '@/lib/constants'
import { SITE_URL, absolute, languageAlternates } from '@/lib/site'

/**
 * Metadata for one page, in one locale.
 *
 * Everything a crawler needs comes from here: a title and description of its
 * own, a canonical URL, the other locale named as an alternate, and the card
 * that social sites show when the link is shared. Pages used to carry only a
 * title, identical on every one of them.
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  index = true,
}: {
  locale: Locale
  /** Route without its locale prefix, e.g. '/szereplok'. */
  path: string
  title: string
  description: string
  /** False for pages that should stay out of search results. */
  index?: boolean
}): Metadata {
  const url = absolute(path, locale)
  const image = `${SITE_URL}/og.png`

  // Every title carries the name, because the name is what anyone searching
  // will type. A page whose own title already says it is left alone rather
  // than ending up "Fityesz Krónika · Fityesz Krónika".
  const site = SITE_TITLE[locale]
  const full = title.includes('Fityesz') ? title : `${title} · ${site}`

  return {
    title: { absolute: full },
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    robots: index ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      type: 'website',
      siteName: SITE_TITLE[locale],
      locale: locale === 'hu' ? 'hu_HU' : 'en_GB',
      alternateLocale: locale === 'hu' ? 'en_GB' : 'hu_HU',
      url,
      title: full,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: SITE_TITLE[locale] }],
    },
    twitter: { card: 'summary_large_image', title: full, description, images: [image] },
  }
}
