import type { DirectionName } from '@/lib/design/direction'

export function DirectionScope({ value, children }: { value: DirectionName; children: React.ReactNode }) {
  return (
    <div data-direction={value} style={{ background: 'var(--desk)', color: 'var(--ink)', fontFamily: 'var(--fB)' }}>
      {children}
    </div>
  )
}
