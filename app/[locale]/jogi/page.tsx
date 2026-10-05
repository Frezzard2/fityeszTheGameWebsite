import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/lib/constants'
import { pageMetadata } from '@/lib/seo'
import { CREATORS } from '@/lib/creators'
import { CONTACT_EMAIL, DATA_REGION, HOSTING_PROVIDER } from '@/lib/legal'
import { ConsentChoice } from '@/components/ConsentChoice'

import type { ReactNode } from 'react'

const DISPLAY = {
  fontFamily: 'var(--fD)',
  fontWeight: 'var(--dW)' as unknown as number,
  textTransform: 'uppercase' as const,
  lineHeight: 1.14,
}
const SUBHEAD = {
  font: '700 13px/1.4 var(--fL)',
  letterSpacing: '.14em',
  textTransform: 'uppercase' as const,
  margin: '26px 0 0',
  color: 'var(--inkSoft)',
}

function H({ children }: { children: ReactNode }) {
  return <h2 style={{ ...DISPLAY, fontSize: 'clamp(24px,4vw,38px)', margin: '40px 0 0' }}>{children}</h2>
}
function P({ children }: { children: ReactNode }) {
  return <p style={{ margin: '12px 0 0', maxWidth: '42em', lineHeight: 1.6 }}>{children}</p>
}
function Row({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
      <span style={{ flex: '0 0 12em', font: '700 12px/1.4 var(--fL)', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--inkSoft)' }}>{k}</span>
      <span style={{ flex: '1 1 16em', minWidth: 0 }}>{v}</span>
    </div>
  )
}


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale })
  return pageMetadata({
    locale: locale as Locale,
    path: '/jogi',
    title: t('legalTitle'),
    description: t('seoLegalD'),
  })
}

export default async function LegalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale as Locale)
  const t = await getTranslations()
  const l = locale as Locale

  const todo = (
    <mark style={{ background: 'var(--accent)', color: 'var(--onAccent)', padding: '2px 8px', font: '700 12px/1 var(--fL)', letterSpacing: '.1em' }}>
      {t('legalTodo')}
    </mark>
  )

  return (
    <div style={{ padding: 'clamp(24px,4cqw,48px) clamp(16px,3cqw,40px)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ ...DISPLAY, fontSize: 'clamp(34px,7vw,74px)', lineHeight: 0.92, margin: 0 }}>
          {t('legalTitle')}
        </h1>

        <H>{t('imprintT')}</H>
        <div style={{ marginTop: 12, borderTop: 'var(--bw) solid var(--ink)' }}>
          <Row k={t('legalOperator')} v={CREATORS.map((c) => c.name[l]).join(' · ')} />
          <Row k={t('legalContact')} v={CONTACT_EMAIL ? <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> : todo} />
          <Row k={t('legalHost')} v={HOSTING_PROVIDER || todo} />
        </div>

        <H>{t('privacyT')}</H>
        <P>{t('legalData')}</P>

        <h3 style={SUBHEAD}>{t('legalAccountT')}</h3>
        <P>{t('legalAccount')}</P>

        <h3 style={SUBHEAD}>{t('legalBasisT')}</h3>
        <P>{t('legalBasis')}</P>

        <h3 style={SUBHEAD}>{t('legalProcessorT')}</h3>
        <P>{t('legalProcessor')}</P>
        <div style={{ marginTop: 12, borderTop: '1px solid var(--line)', maxWidth: '42em' }}>
          <Row k={t('legalProcessorL')} v="Supabase Inc." />
          <Row k={t('legalRegionL')} v={DATA_REGION || todo} />
        </div>

        <h3 style={SUBHEAD}>{t('legalRetentionT')}</h3>
        <P>{t('legalRetention')}</P>

        <h3 style={SUBHEAD}>{t('legalLocalT')}</h3>
        <P>{t('legalLocal')}</P>

        <h3 style={SUBHEAD}>{t('legalFontsT')}</h3>
        <P>{t('legalFonts')}</P>

        <h3 style={SUBHEAD}>{t('legalAnalyticsT')}</h3>
        <P>{t('legalAnalytics')}</P>
        <ConsentChoice
          labels={{
            legalConsentState: t('legalConsentState'),
            legalConsentYes: t('legalConsentYes'),
            legalConsentNo: t('legalConsentNo'),
            legalConsentNone: t('legalConsentNone'),
            legalConsentChange: t('legalConsentChange'),
          }}
        />

        <h3 style={SUBHEAD}>{t('legalRightsT')}</h3>
        <P>{t('legalRights')}</P>

        <H>{t('legalTermsT')}</H>
        <P>{t('legalTerms')}</P>

        <H>{t('legalIpT')}</H>
        <P>{t('legalIp')}</P>

        <p style={{ margin: '40px 0 0', padding: 'clamp(14px,2vw,20px)', background: 'var(--paper2)', borderLeft: '4px solid var(--accent)', maxWidth: '42em', lineHeight: 1.6 }}>
          {t('legalSatire')}
        </p>
      </div>
    </div>
  )
}
