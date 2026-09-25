'use client'

import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from 'react'

/**
 * The reveal vocabulary from the design prototype's `data-reveal` attribute.
 * Each name maps to a keyframe in lib/design/motion.css.
 */
export type RevealKind =
  | 'up'
  | 'rise'
  | 'fade'
  | 'drop'
  | 'slam'
  | 'stamp'
  | 'swing'
  | 'lift'
  | 'bar'
  | 'wipe'
  | 'shake'

/**
 * Plays its animation once, when it first scrolls into view.
 *
 * Elements start hidden and are revealed by the observer, so anything below
 * the fold does not animate before anyone can see it. Two cases must still
 * end up visible:
 *
 *   - `prefers-reduced-motion` — shown immediately, no animation, no observer.
 *   - No IntersectionObserver (old browsers, some crawlers) — shown immediately.
 *
 * Getting this wrong hides content permanently, so the default on every
 * failure path is "visible".
 */
export function Reveal({
  kind = 'up',
  delay = 0,
  as: Tag = 'div',
  className = '',
  style,
  children,
  ...rest
}: {
  kind?: RevealKind
  /** Milliseconds, matching the prototype's `data-delay`. */
  delay?: number
  as?: ElementType
  className?: string
  style?: CSSProperties
  children: ReactNode
} & Record<string, unknown>) {
  const ref = useRef<HTMLElement | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    if (!el || reduced || typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true)
            io.disconnect()
          }
        }
      },
      // Fire slightly before the element reaches the viewport edge, so the
      // motion reads as the page arriving rather than as a late reaction.
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      data-reveal={kind}
      data-shown={shown ? '' : undefined}
      className={className}
      style={{ ...style, animationDelay: delay ? `${delay}ms` : undefined }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
