import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { FlagRail } from '@/components/FlagRail'

describe('FlagRail', () => {
  it('renders three equal bands', () => {
    const { container } = render(<FlagRail />)
    const rail = container.querySelector('[data-flag-rail]')
    expect(rail).not.toBeNull()
    expect(rail!.children).toHaveLength(3)
  })

  it('is hidden from assistive technology — it is decoration, not content', () => {
    const { container } = render(<FlagRail />)
    expect(container.querySelector('[data-flag-rail]')!.getAttribute('aria-hidden')).toBe('true')
  })
})
