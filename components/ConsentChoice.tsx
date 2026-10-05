'use client'

import { useEffect, useState } from 'react'
import { clearAnalyticsCookies, forgetConsent, readConsent, type Consent } from '@/lib/analytics'

export type ConsentChoiceLabels = Record<
  'legalConsentState' | 'legalConsentYes' | 'legalConsentNo' | 'legalConsentNone' | 'legalConsentChange',
  string
>

/**
 * Shows the visitor what they chose, and lets them take it back.
 *
 * Consent that cannot be withdrawn as easily as it was given is not consent,
 * so this clears the stored answer and the cookies with it, then tells the
 * banner to come back and ask again.
 */
export function ConsentChoice({ labels }: { labels: ConsentChoiceLabels }) {
  const [consent, setConsent] = useState<Consent>(null)
  const [known, setKnown] = useState(false)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    // Only readable after mount; see ConsentBanner.
    setConsent(readConsent())
    setKnown(true)
    const onChange = () => setConsent(readConsent())
    window.addEventListener('fityesz:consent', onChange)
    return () => window.removeEventListener('fityesz:consent', onChange)
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!known) return null

  const said =
    consent === 'granted' ? labels.legalConsentYes
    : consent === 'denied' ? labels.legalConsentNo
    : labels.legalConsentNone

  return (
    <p style={{ margin: '12px 0 0', display: 'flex', flexWrap: 'wrap', gap: '8px 14px', alignItems: 'center' }}>
      <span style={{ font: '700 12px/1.4 var(--fL)', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--inkSoft)' }}>
        {labels.legalConsentState}
      </span>
      <strong style={{ font: '700 14px/1.4 var(--fL)' }}>{said}</strong>
      <button
        onClick={() => {
          forgetConsent()
          clearAnalyticsCookies()
          setConsent(null)
          window.dispatchEvent(new Event('fityesz:consent'))
        }}
        style={{
          border: '1px solid var(--ink)',
          background: 'transparent',
          cursor: 'pointer',
          padding: '7px 12px',
          font: '700 12px/1 var(--fL)',
          letterSpacing: '.08em',
          textTransform: 'uppercase',
          color: 'var(--ink)',
        }}
      >
        {labels.legalConsentChange}
      </button>
    </p>
  )
}
