'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { CSSProperties, ReactNode } from 'react'

/**
 * A header nav link that underlines itself when it points at the current page.
 *
 * The prototype computes this as `s.page === k ? 'var(--accent)' : 'transparent'`,
 * drawn with an inset box-shadow rather than a border so the bar does not
 * change the link's box.
 *
 * Only this leaf is a client component. Keeping `usePathname` out of the
 * layout itself leaves the rest of the header server-rendered.
 */
export function NavLink({
  href,
  style,
  children,
}: {
  href: string
  style?: CSSProperties
  children: ReactNode
}) {
  const pathname = usePathname()

  // `href` already carries its locale prefix (/hu/lexikon). A link is current
  // when the path matches it exactly, or sits beneath it — but "/hu" must not
  // match every page on the site, so the prefix test needs the trailing slash.
  const active = pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      style={{ ...style, boxShadow: `inset 0 -3px 0 ${active ? 'var(--accent)' : 'transparent'}` }}
    >
      {children}
    </Link>
  )
}
