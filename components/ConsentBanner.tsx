'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { FlagRail } from '@/components/FlagRail'
import {
  GA_MEASUREMENT_ID,
  clearAnalyticsCookies,
  readConsent,
  writeConsent,
  type Consent,
} from '@/lib/analytics'

export type ConsentLabels = Record<'cookieT' | 'cookieD' | 'cookieYes' | 'cookieNo' | 'cookieMore', string>

const DISPLAY: CSSProperties = {
  fontFamily: 'var(--fD)',
  fontWeight: 'var(--dW)' as unknown as number,
  textTransform: 'uppercase',
  lineHeight: 1.14,
}

/** Loads gtag.js once, and only once consent exists. */
function startAnalytics() {
  if (document.getElementById('ga-src')) return

  const tag = document.createElement('script')
  tag.id = 'ga-src'
  tag.async = true
  tag.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(tag)

  const w = window as unknown as { dataLayer?: unknown[] }
  w.dataLayer = w.dataLayer || []
  // gtag pushes `arguments` itself, so this has to be a real function, not an
  // arrow taking a rest parameter — the SDK reads the arguments object.
  function gtag() {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments)
  }
  const g = gtag as unknown as (...args: unknown[]) => void
  g('js', new Date())
  g('config', GA_MEASUREMENT_ID, { anonymize_ip: true })
}

/**
 * The cookie bar.
 *
 * Analytics load on agreement and not before: a visitor who refuses, or who
 * never answers, sends nothing to Google and is given no cookie. Refusing also
 * clears any `_ga` cookie left from an earlier yes, so withdrawing actually
 * withdraws rather than just stopping new collection.
 */
export function ConsentBanner({ labels, legalHref }: { labels: ConsentLabels; legalHref: string }) {
  // Starts null on the server and on the first client render, so nothing is
  // drawn until the stored choice has been read — otherwise the bar would
  // flash for someone who decided months ago.
  const [consent, setConsent] = useState<Consent>(null)
  const [known, setKnown] = useState(false)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    // localStorage does not exist during SSR, so the stored choice can only be
    // read after mount. Drawing before it is read would flash the bar at
    // someone who answered months ago.
    const stored = readConsent()
    setConsent(stored)
    setKnown(true)
    if (stored === 'granted') startAnalytics()

    // The legal page withdraws consent by clearing it and firing this.
    const onChange = () => {
      setConsent(readConsent())
      setKnown(true)
    }
    window.addEventListener('fityesz:consent', onChange)
    return () => window.removeEventListener('fityesz:consent', onChange)
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  const decide = (value: Exclude<Consent, null>) => {
    writeConsent(value)
    setConsent(value)
    if (value === 'granted') startAnalytics()
    else clearAnalyticsCookies()
  }

  if (!known || consent !== null) return null

  return (
    <div
      role="dialog"
      aria-label={labels.cookieT}
      className="fz-in"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        background: 'var(--ink)',
        color: 'var(--onInk)',
        borderTop: 'var(--bw) solid var(--ink)',
        boxShadow: '0 -14px 40px -24px rgba(0,0,0,.6)',
      }}
    >
      <FlagRail />
      <div
        style={{
          maxWidth: 1320,
          margin: '0 auto',
          padding: 'clamp(16px,2.4cqw,24px) clamp(16px,3cqw,40px)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '14px 28px',
        }}
      >
        <div style={{ flex: '1 1 460px', minWidth: 0 }}>
          <div style={{ ...DISPLAY, fontSize: 'clamp(20px,2.4cqw,28px)' }}>{labels.cookieT}</div>
          <p style={{ margin: '8px 0 0', fontSize: 15, lineHeight: 1.5, opacity: 0.9, maxWidth: '46em' }}>
            {labels.cookieD}{' '}
            <Link href={legalHref} style={{ color: 'var(--onInk)' }}>
              {labels.cookieMore}
            </Link>
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <button
            onClick={() => decide('granted')}
            className="fz-btn"
            style={{
              padding: '13px 20px 12px',
              background: 'var(--accent)',
              color: 'var(--onAccent)',
              border: 'var(--bw) solid var(--accent)',
              ...DISPLAY,
              fontSize: 19,
              cursor: 'pointer',
            }}
          >
            {labels.cookieYes}
          </button>
          <button
            onClick={() => decide('denied')}
            className="fz-btn"
            style={{
              padding: '13px 20px 12px',
              background: 'transparent',
              color: 'var(--onInk)',
              border: 'var(--bw) solid var(--onInk)',
              ...DISPLAY,
              fontSize: 19,
              cursor: 'pointer',
            }}
          >
            {labels.cookieNo}
          </button>
        </div>
      </div>
    </div>
  )
}
