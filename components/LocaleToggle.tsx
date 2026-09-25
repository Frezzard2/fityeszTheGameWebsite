import Link from 'next/link'
import type { CSSProperties } from 'react'
import type { Locale } from '@/lib/constants'
import { localePath, otherLocale } from '@/i18n/routing'

const ITEMS: { locale: Locale; label: string }[] = [
  { locale: 'hu', label: 'HU' },
  { locale: 'en', label: 'EN' },
]

function itemStyle(active: boolean): CSSProperties {
  return {
    border: 0,
    padding: '7px 9px',
    font: '700 12px/1 var(--fL)',
    letterSpacing: '.08em',
    background: active ? 'var(--ink)' : 'transparent',
    color: active ? 'var(--onInk)' : 'var(--ink)',
    textDecoration: 'none',
    display: 'inline-block',
  }
}

export function LocaleToggle({ current, path }: { current: Locale; path: string }) {
  const next = otherLocale(current)
  return (
    <div style={{ display: 'flex', border: 'var(--bw) solid var(--ink)' }}>
      {ITEMS.map(({ locale, label }) => {
        const active = locale === current
        return active ? (
          <span key={locale} style={itemStyle(true)} aria-current="true">
            {label}
          </span>
        ) : (
          <Link key={locale} href={localePath(path, next)} style={itemStyle(false)}>
            {label}
          </Link>
        )
      })}
    </div>
  )
}
