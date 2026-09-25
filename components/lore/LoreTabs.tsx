'use client'

import { useId, useRef, useState } from 'react'

export type TabPanel = { id: string; label: string; content: React.ReactNode }

export function LoreTabs({ panels, ariaLabel = 'Lexikon' }: { panels: TabPanel[]; ariaLabel?: string }) {
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
      {/* Ported from the prototype's tab strip: heavy-border buttons, active
          tab inverted to ink/onInk. Wraps rather than scrolling so five tabs
          never force horizontal overflow on a phone. */}
      <div
        role="tablist"
        aria-label={ariaLabel}
        onKeyDown={onKeyDown}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          margin: '36px 0',
          paddingBottom: 18,
          borderBottom: 'var(--bw) solid var(--ink)',
        }}
      >
        {panels.map((p, n) => {
          const isActive = n === active
          return (
            <button
              key={p.id}
              ref={(el) => {
                refs.current[n] = el
              }}
              role="tab"
              id={`${base}-tab-${p.id}`}
              aria-selected={isActive}
              aria-controls={`${base}-panel-${p.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActive(n)}
              className="fz-btn"
              style={{
                border: 'var(--bw) solid var(--ink)',
                cursor: 'pointer',
                padding: '10px 14px 9px',
                fontFamily: 'var(--fD)',
                fontWeight: 'var(--dW)' as never,
                fontSize: 20,
                lineHeight: 1.14,
                textTransform: 'uppercase',
                background: isActive ? 'var(--ink)' : 'transparent',
                color: isActive ? 'var(--onInk)' : 'var(--ink)',
              }}
            >
              {p.label}
            </button>
          )
        })}
      </div>

      <div
        role="tabpanel"
        key={panels[active].id}
        className="fz-tab"
        id={`${base}-panel-${panels[active].id}`}
        aria-labelledby={`${base}-tab-${panels[active].id}`}
      >
        {panels[active].content}
      </div>
    </div>
  )
}
