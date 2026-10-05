import Link from 'next/link'
import { FlagRail } from '@/components/FlagRail'
import { LOCALES, SITE_TITLE } from '@/lib/constants'

/**
 * The 404, in both languages at once.
 *
 * A static export writes one of these, at the root, outside the [locale] tree —
 * so there is no locale to read and no translations to load. Rather than guess,
 * it says it in Hungarian and English and offers the way back to each. Before
 * this the host served Apache's own bare error page.
 */
const DISPLAY = {
  fontFamily: 'var(--fD)',
  fontWeight: 'var(--dW)' as unknown as number,
  textTransform: 'uppercase' as const,
  lineHeight: 1.02,
}

const SAID = {
  hu: { lost: 'Ez az oldal nincs meg.', back: 'Vissza a főoldalra' },
  en: { lost: 'This page does not exist.', back: 'Back to the homepage' },
}

export default function NotFound() {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--paper)', color: 'var(--ink)', display: 'flex', flexDirection: 'column' }}>
      <FlagRail />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 'clamp(20px,4vw,36px)',
          maxWidth: 900,
          width: '100%',
          margin: '0 auto',
          padding: 'clamp(28px,6vw,72px) clamp(16px,4vw,40px)',
        }}
      >
        <div style={{ font: '700 13px/1.3 var(--fL)', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--accentText)' }}>
          404
        </div>

        <h1 style={{ ...DISPLAY, margin: 0, fontSize: 'clamp(44px,11vw,120px)' }}>
          {SAID.hu.lost}
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, borderTop: 'var(--bw) solid var(--ink)', paddingTop: 'clamp(20px,3vw,30px)' }}>
          {LOCALES.map((l) => (
            <div key={l} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '6px 18px' }}>
              <span style={{ flex: '0 0 2.2em', font: '700 12px/1.3 var(--fL)', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--inkSoft)' }}>
                {l}
              </span>
              <span style={{ flex: '1 1 14em', minWidth: 0, fontSize: 16 }}>{SAID[l].lost}</span>
              <Link
                href={`/${l}/`}
                className="fz-btn"
                style={{
                  padding: '12px 18px 11px',
                  background: l === 'hu' ? 'var(--accent)' : 'transparent',
                  color: l === 'hu' ? 'var(--onAccent)' : 'var(--ink)',
                  border: 'var(--bw) solid var(--ink)',
                  ...DISPLAY,
                  lineHeight: 1.14,
                  fontSize: 18,
                  textDecoration: 'none',
                }}
              >
                {SAID[l].back}
              </Link>
            </div>
          ))}
        </div>

        <div style={{ font: '700 12px/1.4 var(--fL)', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--inkSoft)' }}>
          {SITE_TITLE.hu}
        </div>
      </div>
    </div>
  )
}
