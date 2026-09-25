'use client'

import { usePathname } from 'next/navigation'
import { LOCALES, type Locale } from '@/lib/constants'
import { LocaleToggle } from '@/components/LocaleToggle'

function stripLocalePrefix(pathname: string): string {
  for (const l of LOCALES) {
    if (pathname === `/${l}`) return '/'
    if (pathname.startsWith(`/${l}/`)) return pathname.slice(l.length + 1)
  }
  return pathname
}

/**
 * Resolves the locale-agnostic current path on the client (via `usePathname`)
 * and hands it to the pure, prop-driven `LocaleToggle`. Isolating the
 * `usePathname` call here keeps the rest of the layout server-rendered.
 */
export function LocaleToggleClient({ current }: { current: Locale }) {
  const pathname = usePathname()
  return <LocaleToggle current={current} path={stripLocalePrefix(pathname)} />
}
