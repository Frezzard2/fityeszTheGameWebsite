'use client'

import { useId, useRef, useState } from 'react'

export type TabPanel = { id: string; label: string; content: React.ReactNode }

export function LoreTabs({ panels }: { panels: TabPanel[] }) {
  const [active, setActive] = useState(0)
  const base = useId()
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const onKeyDown = (e: React.KeyboardEvent) => {
    const last = panels.length - 1
    let next: number | null = null
    if (e.key === 'ArrowRight') next = active === last ? 0 : active + 1
    if (e.key === 'ArrowLeft') next = active === 0 ? last : active - 1
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = last
    if (next === null) return
    e.preventDefault()
    setActive(next)
    refs.current[next]?.focus()
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Lexikon"
        onKeyDown={onKeyDown}
        style={{ display: 'flex', flexWrap: 'wrap', gap: 0, borderBottom: '1px solid var(--line)' }}
      >
        {panels.map((p, n) => (
          <button
            key={p.id}
            ref={(el) => {
              refs.current[n] = el
            }}
            role="tab"
            id={`${base}-tab-${p.id}`}
            aria-selected={n === active}
            aria-controls={`${base}-panel-${p.id}`}
            tabIndex={n === active ? 0 : -1}
            onClick={() => setActive(n)}
            style={{
              padding: '10px 14px',
              border: 0,
              borderBottom: n === active ? '3px solid var(--accent)' : '3px solid transparent',
              background: 'none',
              color: n === active ? 'var(--ink)' : 'var(--inkSoft)',
              fontFamily: 'var(--fL)',
              fontSize: 13,
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`${base}-panel-${panels[active].id}`}
        aria-labelledby={`${base}-tab-${panels[active].id}`}
        style={{ paddingTop: 24 }}
      >
        {panels[active].content}
      </div>
    </div>
  )
}
