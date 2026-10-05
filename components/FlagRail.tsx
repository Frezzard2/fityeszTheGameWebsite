/**
 * The tricolour rule that runs under the header and along the party card.
 *
 * `height` because the card wants a heavier one than the page does — before
 * this it carried its own copy of the three divs to get it.
 */
export function FlagRail({ height = 6 }: { height?: number }) {
  return (
    <div data-flag-rail aria-hidden="true" style={{ display: 'flex', height }}>
      <div style={{ flex: 1, background: 'var(--accent)' }} />
      <div style={{ flex: 1, background: 'var(--paper2)' }} />
      <div style={{ flex: 1, background: 'var(--second)' }} />
    </div>
  )
}
