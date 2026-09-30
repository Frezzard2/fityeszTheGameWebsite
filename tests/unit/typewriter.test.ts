import { describe, it, expect } from 'vitest'
import { revealedCount } from '@/lib/story/typewriter'

describe('typewriter reveal', () => {
  it('reveals what has been counted for this line', () => {
    expect(revealedCount({ src: 'Jó napot', count: 3 }, 'Jó napot', true)).toBe(3)
  })

  it('refuses a count measured against a different line', () => {
    // The old line was longer; slicing the new one with its count would show
    // the whole sentence for a frame before it blanked.
    const stale = { src: 'Egy jóval hosszabb mondat.', count: 26 }
    expect(revealedCount(stale, 'Rövid.', true)).toBe(0)
  })

  it('shows a new line whole when typing is off', () => {
    const stale = { src: 'Előző sor', count: 9 }
    expect(revealedCount(stale, 'Rövid.', false)).toBe('Rövid.'.length)
  })

  it('never reveals past the end of the line', () => {
    expect(revealedCount({ src: 'Rövid.', count: 99 }, 'Rövid.', true)).toBe(6)
  })
})
