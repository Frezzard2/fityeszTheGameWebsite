import type { Metadata } from 'next'
import type { CSSProperties, ReactNode } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Antonio, Public_Sans } from 'next/font/google'
import { routing, localePath } from '@/i18n/routing'
import { DOWNLOAD_ENABLED } from '@/lib/features'
import { SITE_TITLE, type Locale } from '@/lib/constants'
import { FlagRail } from '@/components/FlagRail'
import { LocaleToggleClient } from '@/components/LocaleToggleClient'
import { NavLink } from '@/components/NavLink'
import '../globals.css'

// Self-hosted via next/font/google: no request ever reaches Google at runtime.
const antonio = Antonio({
  subsets: ['latin', 'latin-ext'],
  weight: '700',
  display: 'swap',
  variable: '--font-antonio',
})

const publicSans = Public_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-public-sans',
})

// Saira Stencil One isn't in next/font/google's bundled catalogue (only the
// unrelated variable "Saira Stencil" family is). Self-hosted locally instead;
const fontVariables = [
  antonio.variable,
  publicSans.variable,
].join(' ')

const NAV_ITEMS = [
  { href: '/szereplok', labelKey: 'navChars' },
  { href: '/lexikon', labelKey: 'navLore' },
  { href: '/jatek', labelKey: 'navPlay' },
  ...(DOWNLOAD_ENABLED ? [{ href: '/letoltes', labelKey: 'navDownload' }] : []),
  { href: '/tamogatas', labelKey: 'navSupport' },
]

const CREATORS = [
  { name: { hu: 'Kukucska Zsombor', en: 'Zsombor Kukucska' }, handle: 'Frezzard2', url: 'https://github.com/Frezzard2' },
  { name: { hu: 'Dajka Zea', en: 'Zea Dajka' }, handle: 'djkzea', url: 'https://github.com/djkzea' },
] as const

const navLinkStyle: CSSProperties = {
  padding: '10px 12px',
  font: '600 13px/1 var(--fL)',
  letterSpacing: '.07em',
  textTransform: 'uppercase',
  color: 'var(--ink)',
  textDecoration: 'none',
}

const ctaStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 14px 9px',
  background: 'var(--accent)',
  color: 'var(--onAccent)',
  border: 'var(--bw) solid var(--ink)',
  boxShadow: 'var(--shS)',
  fontFamily: 'var(--fD)',
  fontWeight: 'var(--dW)' as unknown as number,
  fontSize: 17,
  lineHeight: 1.14,
  textTransform: 'uppercase',
  letterSpacing: '.04em',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
}

const loginLinkStyle: CSSProperties = {
  padding: '8px 6px',
  font: '600 13px/1 var(--fL)',
  letterSpacing: '.07em',
  textTransform: 'uppercase',
  color: 'var(--ink)',
  textDecoration: 'underline',
  textUnderlineOffset: 4,
  whiteSpace: 'nowrap',
}

// The mobile disclosure panel reuses the prototype's `menuOpen` branch
// styling, which runs noticeably larger than the desktop nav.
const mobileNavLinkStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  borderBottom: '1px solid var(--line)',
  padding: '14px 0 12px',
  fontFamily: 'var(--fD)',
  fontWeight: 'var(--dW)' as unknown as number,
  fontSize: 30,
  lineHeight: 1.14,
  textTransform: 'uppercase',
  color: 'var(--ink)',
  textDecoration: 'none',
}

const mobileLoginStyle: CSSProperties = {
  display: 'inline-block',
  padding: '12px 16px 11px',
  background: 'transparent',
  color: 'var(--ink)',
  border: 'var(--bw) solid var(--ink)',
  fontFamily: 'var(--fD)',
  fontWeight: 'var(--dW)' as unknown as number,
  fontSize: 18,
  lineHeight: 1.14,
  textTransform: 'uppercase',
  textDecoration: 'none',
}

const mobileCtaStyle: CSSProperties = {
  display: 'inline-block',
  padding: '12px 16px 11px',
  background: 'var(--accent)',
  color: 'var(--onAccent)',
  border: 'var(--bw) solid var(--ink)',
  boxShadow: 'var(--shS)',
  fontFamily: 'var(--fD)',
  fontWeight: 'var(--dW)' as unknown as number,
  fontSize: 18,
  lineHeight: 1.14,
  textTransform: 'uppercase',
  textDecoration: 'none',
}

// There is no JS breakpoint state in this static export (the prototype's
// `wide`/`narrow` sc-if branches), so the header's two layouts are plain CSS:
// below this width the desktop nav/login/CTA are replaced by a
// details/summary disclosure, styled to match the prototype's mobile menu.
const HEADER_NARROW_CSS = `
.fz-hdr-wide { }
.fz-hdr-narrow { display: none; }
@media (max-width: 899px) {
  .fz-hdr-wide { display: none !important; }
  .fz-hdr-narrow { display: block; }
}
.fz-hdr-menu > summary { list-style: none; cursor: pointer; }
.fz-hdr-menu > summary::-webkit-details-marker { display: none; }
.fz-hdr-menu > summary .fz-hdr-menu-open-label { display: none; }
.fz-hdr-menu[open] > summary .fz-hdr-menu-open-label { display: inline; }
.fz-hdr-menu[open] > summary .fz-hdr-menu-closed-label { display: none; }
.fz-hdr-menu-panel {
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  border-top: var(--bw) solid var(--ink);
  background: var(--desk);
  padding: 6px clamp(16px,3cqw,40px) 22px;
}
`

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  return { title: SITE_TITLE[locale as Locale] }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale: rawLocale } = await params
  if (!hasLocale(routing.locales, rawLocale)) notFound()
  const locale = rawLocale as Locale

  setRequestLocale(locale)
  const t = await getTranslations()
  const li = locale === 'en' ? 1 : 0

  return (
    <html lang={locale} className={fontVariables}>
      <body>
        <NextIntlClientProvider>
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
              <header
                style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 40,
                  background: 'var(--desk)',
                  borderBottom: 'var(--bw) solid var(--ink)',
                }}
              >
                <style>{HEADER_NARROW_CSS}</style>
                <FlagRail />
                <div
                  style={{
                    maxWidth: 1320,
                    margin: '0 auto',
                    padding: '12px clamp(16px,3cqw,40px)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 18,
                    flexWrap: 'wrap',
                  }}
                >
                  <Link
                    href={localePath('/', locale)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink)', textDecoration: 'none' }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        background: 'var(--accent)',
                        color: 'var(--onAccent)',
                        fontFamily: 'var(--fD)',
                        fontWeight: 'var(--dW)' as unknown as number,
                        fontSize: 26,
                        lineHeight: 1.14,
                        border: 'var(--bw) solid var(--ink)',
                      }}
                    >
                      F
                    </span>
                    <span
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        lineHeight: 1.14,
                        fontFamily: 'var(--fD)',
                        fontWeight: 'var(--dW)' as unknown as number,
                        textTransform: 'uppercase',
                      }}
                    >
                      <span style={{ fontSize: 24, letterSpacing: '.02em' }}>Fityesz</span>
                      <span style={{ fontSize: 12, letterSpacing: '.26em', color: 'var(--accentText)', marginTop: 5 }}>
                        {t('logoSub')}
                      </span>
                    </span>
                  </Link>

                  {/*
                    Grouping the wide nav and the right-hand controls under one
                    always-rendered `marginLeft: auto` wrapper (rather than
                    putting the auto margin on `nav` itself, as the prototype
                    does) keeps everything right-aligned even once the nav is
                    hidden at narrow widths, without needing the prototype's
                    JS-driven spacer div.
                  */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginLeft: 'auto', flexWrap: 'wrap' }}>
                    <nav
                      className="fz-hdr-wide"
                      style={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}
                    >
                      {NAV_ITEMS.map((item) => (
                        <NavLink key={item.href} href={localePath(item.href, locale)} style={navLinkStyle}>
                          {t(item.labelKey)}
                        </NavLink>
                      ))}
                    </nav>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <LocaleToggleClient current={locale} />
                      <Link href={localePath('/belepes', locale)} className="fz-hdr-wide" style={loginLinkStyle}>
                        {t('login')}
                      </Link>
                      <Link href={localePath('/jatek', locale)} className="fz-hdr-wide fz-btn" style={ctaStyle}>
                        {t('playFree')}
                      </Link>

                      <details className="fz-hdr-narrow fz-hdr-menu">
                        <summary
                          style={{
                            border: 'var(--bw) solid var(--ink)',
                            background: 'var(--ink)',
                            color: 'var(--onInk)',
                            padding: '8px 12px',
                            font: '700 12px/1 var(--fL)',
                            letterSpacing: '.1em',
                            textTransform: 'uppercase',
                          }}
                        >
                          <span className="fz-hdr-menu-closed-label">{t('menu')}</span>
                          <span className="fz-hdr-menu-open-label">{t('close')}</span>
                        </summary>
                        <div className="fz-hdr-menu-panel">
                          {NAV_ITEMS.map((item) => (
                            <Link key={item.href} href={localePath(item.href, locale)} style={mobileNavLinkStyle}>
                              {t(item.labelKey)}
                            </Link>
                          ))}
                          <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
                            <Link href={localePath('/belepes', locale)} style={mobileLoginStyle}>
                              {t('login')}
                            </Link>
                            <Link href={localePath('/jatek', locale)} className="fz-btn" style={mobileCtaStyle}>
                              {t('playFree')}
                            </Link>
                          </div>
                        </div>
                      </details>
                    </div>
                  </div>
                </div>
              </header>

              <main style={{ flex: 1 }}>{children}</main>

              <footer style={{ background: 'var(--ink)', color: 'var(--onInk)' }}>
                <div
                  style={{
                    maxWidth: 1320,
                    margin: '0 auto',
                    padding: '56px clamp(16px,3cqw,40px) 36px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '40px 64px',
                  }}
                >
                  <div style={{ flex: '1 1 300px' }}>
                    <div
                      style={{
                        fontFamily: 'var(--fD)',
                        fontWeight: 'var(--dW)' as unknown as number,
                        textTransform: 'uppercase',
                        lineHeight: 1.14,
                        fontSize: 56,
                      }}
                    >
                      Fityesz
                      <span style={{ display: 'block', fontSize: '.4em', letterSpacing: '.26em', marginTop: 6, color: 'var(--accent)' }}>
                        {t('logoSub')}
                      </span>
                    </div>
                    <p style={{ margin: '16px 0 0', fontSize: 15, maxWidth: '22em' }}>{t('footTag')}</p>
                  </div>

                  <div style={{ flex: '0 1 200px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
                    {NAV_ITEMS.map((item) => (
                      <Link
                        key={item.href}
                        href={localePath(item.href, locale)}
                        style={{
                          font: '600 14px/1.2 var(--fL)',
                          letterSpacing: '.07em',
                          textTransform: 'uppercase',
                          color: 'var(--onInk)',
                          textDecoration: 'none',
                        }}
                      >
                        {t(item.labelKey)}
                      </Link>
                    ))}
                  </div>

                  <div style={{ flex: '0 1 280px' }}>
                    <div style={{ font: '700 12px/1 var(--fL)', letterSpacing: '.14em', textTransform: 'uppercase', opacity: 0.75 }}>
                      {t('footMade')}
                    </div>
                    {CREATORS.map((c) => (
                      <div key={c.handle} style={{ marginTop: 14 }}>
                        <div style={{ fontSize: 16, fontWeight: 600 }}>{li ? c.name.en : c.name.hu}</div>
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener"
                          style={{ font: '500 14px/1.4 var(--fL)', color: 'var(--onInk)' }}
                        >
                          github.com/{c.handle}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    maxWidth: 1320,
                    margin: '0 auto',
                    padding: '18px clamp(16px,3cqw,40px) 30px',
                    borderTop: '1px solid color-mix(in srgb,var(--onInk) 22%,transparent)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px 24px',
                    justifyContent: 'space-between',
                    fontSize: 13,
                  }}
                >
                  <span>© 2026 {t('titleFull')}</span>
                  <a
                    href="https://github.com/djkzea/fityeszthegame"
                    target="_blank"
                    rel="noopener"
                    style={{ color: 'var(--onInk)' }}
                  >
                    {t('footRepo')}
                  </a>
                </div>
              </footer>
            </div>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
