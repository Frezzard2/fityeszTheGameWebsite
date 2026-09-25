import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/lib/constants'
import { CREATORS, GAME_REPO_URL, kofiUrl } from '@/lib/creators'

export default async function SupportPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale as Locale)
  const t = await getTranslations()
  const kofi = kofiUrl()

  return (
    <div style={{ padding: 'clamp(24px,4cqw,48px) clamp(16px,3cqw,40px)' }}>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <p style={{ fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--inkSoft)' }}>
          {t('supKicker')}
        </p>
        <h1
          style={{
            fontFamily: 'var(--fD)',
            fontSize: 'clamp(34px,7vw,74px)',
            lineHeight: 0.92,
            textTransform: 'uppercase',
            margin: '10px 0 0',
          }}
        >
          {t('supTitle')}
        </h1>
        <p style={{ marginTop: 16, maxWidth: '40em', fontSize: 17, lineHeight: 1.6 }}>{t('supSub')}</p>

        {/* Ko-fi panel — config-driven, so it ships before the account exists */}
        <section
          data-testid="kofi"
          style={{
            marginTop: 30,
            border: 'var(--bw) solid var(--ink)',
            background: 'var(--sheet)',
            boxShadow: 'var(--shS)',
            padding: 'clamp(18px,3vw,30px)',
          }}
        >
          <h2 style={{ margin: 0, fontFamily: 'var(--fD)', fontSize: 'clamp(22px,4vw,34px)', textTransform: 'uppercase' }}>
            {t('kofiCardT')}
          </h2>
          <p style={{ margin: '8px 0 0', maxWidth: '38em', color: 'var(--inkSoft)' }}>{t('kofiCardD')}</p>

          {kofi ? (
            <a
              href={kofi}
              rel="noopener noreferrer"
              target="_blank"
              style={{
                display: 'inline-block',
                marginTop: 18,
                padding: '13px 22px',
                background: 'var(--accent)',
                color: 'var(--onAccent)',
                border: 'var(--bw) solid var(--ink)',
                fontFamily: 'var(--fD)',
                fontSize: 19,
                textTransform: 'uppercase',
                letterSpacing: '.04em',
                textDecoration: 'none',
              }}
            >
              {t('kofi')}
            </a>
          ) : (
            <>
              <p
                style={{
                  display: 'inline-block',
                  marginTop: 18,
                  padding: '13px 22px',
                  border: '2px dashed var(--line)',
                  color: 'var(--inkSoft)',
                  fontFamily: 'var(--fD)',
                  fontSize: 19,
                  textTransform: 'uppercase',
                  letterSpacing: '.04em',
                }}
              >
                {t('kofiSoon')}
              </p>
              <p style={{ margin: '10px 0 0', maxWidth: '38em' }}>{t('kofiNote')}</p>
            </>
          )}
        </section>

        <section style={{ marginTop: 40 }}>
          <h2 style={{ margin: 0, fontFamily: 'var(--fD)', fontSize: 'clamp(22px,4vw,34px)', textTransform: 'uppercase' }}>
            {t('meet')}
          </h2>
          <div style={{ marginTop: 16, borderTop: 'var(--bw) solid var(--ink)' }}>
            {CREATORS.map((c) => (
              <div
                key={c.handle}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  gap: 16,
                  flexWrap: 'wrap',
                  padding: '16px 0',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <div>
                  <p style={{ margin: 0, fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--inkSoft)' }}>
                    {t('creatorWord')}
                  </p>
                  <p style={{ margin: '4px 0 0', fontFamily: 'var(--fD)', fontSize: 'clamp(20px,3vw,28px)', textTransform: 'uppercase' }}>
                    {c.name}
                  </p>
                </div>
                <a href={c.url} rel="noopener noreferrer" target="_blank" style={{ fontWeight: 700 }}>
                  {c.handle} · {t('ghBtn')}
                </a>
              </div>
            ))}
          </div>

          <p style={{ marginTop: 20 }}>
            <a href={GAME_REPO_URL} rel="noopener noreferrer" target="_blank" style={{ fontWeight: 700 }}>
              {t('repoT')} →
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}
