export function FlagRail() {
  return (
    <div data-flag-rail aria-hidden="true" style={{ display: 'flex', height: 6 }}>
      <div style={{ flex: 1, background: 'var(--accent)' }} />
      <div style={{ flex: 1, background: 'var(--paper2)' }} />
      <div style={{ flex: 1, background: 'var(--second)' }} />
    </div>
  )
}
