import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/lib/constants'
import { LoreTabs, type TabPanel } from '@/components/lore/LoreTabs'
import codex from '@/lib/story/content/codex.json'

const ENTRY = {
  borderTop: '1px solid var(--line)',
  padding: '16px 0',
} as const

const LABEL = {
  fontSize: 11,
  letterSpacing: '.18em',
  textTransform: 'uppercase',
  color: 'var(--inkSoft)',
  margin: 0,
} as const

export default async function LorePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale as Locale)
  const t = await getTranslations()
  const l = locale as Locale

  const panels: TabPanel[] = [
    {
      id: 'party',
      label: t('tabParty'),
      content: (
        <div style={{ display: 'grid', gap: 22, maxWidth: '60em' }}>
          <p style={{ margin: 0, fontStyle: 'italic' }}>{t('partyCaption')}</p>

          <div style={ENTRY}>
            <p style={LABEL}>{t('leaderLabel')}</p>
            <p style={{ margin: '6px 0 0', fontFamily: 'var(--fD)', fontSize: 'clamp(22px,4vw,34px)', textTransform: 'uppercase' }}>
              Kapzs Imre
            </p>
            <p style={{ margin: '4px 0 0', color: 'var(--inkSoft)' }}>{t('leaderTitle')}</p>
          </div>

          <div style={ENTRY}>
            <p style={LABEL}>{t('mottoLabel')}</p>
            <p style={{ margin: '8px 0 0', fontFamily: 'var(--fD)', fontSize: 'clamp(18px,3vw,28px)', textTransform: 'uppercase', color: 'var(--accentText)' }}>
              {t('stampSlogan')}
            </p>
          </div>

          <div style={ENTRY}>
            <p style={LABEL}>
              {t('rulesLabel')} — {t('rulesBy')}
            </p>
            <ol style={{ margin: '10px 0 0', paddingLeft: '1.4em' }}>
              {[t('rule1'), t('rule2'), t('rule3'), t('rule4')].map((r) => (
                <li key={r} style={{ marginTop: 6 }}>
                  {r}
                </li>
              ))}
            </ol>
          </div>

          <blockquote style={{ margin: 0, borderLeft: '4px solid var(--accent)', paddingLeft: 14 }}>
            <p style={{ margin: 0 }}>{t('familyQuote')}</p>
            <footer style={{ ...LABEL, marginTop: 6 }}>{t('familyBy')}</footer>
          </blockquote>
        </div>
      ),
    },
    {
      id: 'chapters',
      label: t('tabChapters'),
      content: (
        <div style={{ maxWidth: '62em' }}>
          {codex.chapters.map((c) => (
            <article key={c.number} style={ENTRY}>
              <p style={LABEL}>
                {t('chapterN').replace('%n', String(c.number))} ·{' '}
                <span style={{ color: c.free ? 'var(--second)' : 'var(--accentText)' }}>
                  {c.free ? t('inBrowser') : t('inGame')}
                </span>
              </p>
              <h3 style={{ margin: '6px 0 0', fontFamily: 'var(--fD)', fontSize: 'clamp(20px,3.2vw,30px)', textTransform: 'uppercase' }}>
                {c.title[l]}
              </h3>
              <p style={{ margin: '6px 0 0', fontStyle: 'italic', color: 'var(--inkSoft)' }}>
                &bdquo;{c.quote[l]}&rdquo;
              </p>
              {!c.free && (
                <p style={{ ...LABEL, margin: '8px 0 0', color: 'var(--accentText)' }}>▮▮▮▮▮ {t('censored')}</p>
              )}
            </article>
          ))}
        </div>
      ),
    },
    {
      id: 'places',
      label: t('tabPlaces'),
      content: (
        <div style={{ maxWidth: '62em' }}>
          {codex.chapters.map((c) => (
            <div key={c.number} style={ENTRY}>
              <p style={LABEL}>
                {t('placeWord')} · {t('chapterN').replace('%n', String(c.number))}
              </p>
              <p style={{ margin: '6px 0 0' }}>
                {c.free ? c.place[l] : <span style={{ color: 'var(--accentText)' }}>▮▮▮▮▮▮▮▮ {t('censored')}</span>}
              </p>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'items',
      label: t('tabItems'),
      content: (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxWidth: '62em' }}>
          {codex.items.map((it) => (
            <li key={it.id} style={{ ...ENTRY, display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--fD)', fontSize: 'clamp(16px,2.4vw,22px)', textTransform: 'uppercase' }}>
                ▮ {it.name[l]}
              </span>
              <span style={LABEL}>{t('notFound')}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: 'rules',
      label: t('tabRules'),
      content: (
        <div style={{ maxWidth: '58em' }}>
          {[
            ['XP', t('xpD')],
            [t('exposure'), t('expD')],
            [t('rankT'), t('rankD')],
            [t('bossT'), t('bossD')],
          ].map(([k, v]) => (
            <div key={k} style={ENTRY}>
              <p style={LABEL}>{k}</p>
              <p style={{ margin: '6px 0 0' }}>{v}</p>
            </div>
          ))}
        </div>
      ),
    },
  ]

  return (
      <div
        style={{
          padding: 'clamp(24px,4cqw,48px) clamp(16px,3cqw,40px)',
          minHeight: '70vh',
        }}
      >
        {/* The codex keeps a fixed index column — its one structural difference
            from every other page on the site. */}
        <div
          style={{
            maxWidth: 1180,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr)',
            gap: 28,
          }}
        >
          <header>
            <p style={LABEL}>{t('loreKicker')}</p>
            <h1
              style={{
                fontFamily: 'var(--fD)',
                fontSize: 'clamp(34px,7vw,74px)',
                lineHeight: 0.92,
                textTransform: 'uppercase',
                margin: '8px 0 0',
                letterSpacing: 'calc((1 - var(--dS)) * 0.02em)',
              }}
            >
              {t('navLore')}
            </h1>
            <p style={{ marginTop: 12, maxWidth: '40em', color: 'var(--inkSoft)' }}>{t('loreSub')}</p>
          </header>

          <LoreTabs panels={panels} />
        </div>
      </div>
  )
}
