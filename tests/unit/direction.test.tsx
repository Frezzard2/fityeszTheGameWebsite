import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { DirectionScope } from '@/components/DirectionScope'
import { FlagRail } from '@/components/FlagRail'

describe('DirectionScope', () => {
  it('marks the subtree with the direction name', () => {
    const { container } = render(<DirectionScope value="dossier"><p>x</p></DirectionScope>)
    expect(container.querySelector('[data-direction="dossier"]')).not.toBeNull()
  })
})

describe('FlagRail', () => {
  it('renders three equal bands in both directions', () => {
    for (const d of ['campaign', 'dossier'] as const) {
      const { container } = render(<DirectionScope value={d}><FlagRail /></DirectionScope>)
      const rail = container.querySelector('[data-flag-rail]')
      expect(rail, `flag rail missing in ${d}`).not.toBeNull()
      expect(rail!.children).toHaveLength(3)
    }
  })
})
