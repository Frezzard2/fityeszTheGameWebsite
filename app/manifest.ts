import type { MetadataRoute } from 'next'
import { SITE_TITLE, DEFAULT_LOCALE } from '@/lib/constants'

/** A static export has no server to generate this per request. */
export const dynamic = 'force-static'

/** What a phone uses when the site is kept on a home screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_TITLE[DEFAULT_LOCALE],
    short_name: 'Fityesz',
    description: 'Szatirikus szöveges kalandjáték a politikai ranglétráról.',
    start_url: `/${DEFAULT_LOCALE}/`,
    display: 'standalone',
    background_color: '#F4EFE6',
    theme_color: '#161616',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
