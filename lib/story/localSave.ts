import type { PlayerState } from './types'

export const LOCAL_SAVE_KEY = 'fityesz.save.v1'
export const GATE_DISMISSED_KEY = 'fityesz.gate.dismissed.v1'

/**
 * Every accessor is guarded: localStorage throws in private mode and can come
 * back empty with site data blocked. The play screen must still work.
 */
export function loadLocalSave(): PlayerState | null {
  try {
    const raw = localStorage.getItem(LOCAL_SAVE_KEY)
    return raw ? (JSON.parse(raw) as PlayerState) : null
  } catch {
    return null
  }
}

export function saveLocalSave(s: PlayerState): void {
  try {
    localStorage.setItem(LOCAL_SAVE_KEY, JSON.stringify(s))
  } catch {
    /* private mode — the run still plays, it just will not survive a reload */
  }
}

export function clearLocalSave(): void {
  try {
    localStorage.removeItem(LOCAL_SAVE_KEY)
  } catch {
    /* nothing to do */
  }
}

export function isGateDismissed(): boolean {
  try {
    return localStorage.getItem(GATE_DISMISSED_KEY) === '1'
  } catch {
    return false
  }
}

export function dismissGate(): void {
  try {
    localStorage.setItem(GATE_DISMISSED_KEY, '1')
  } catch {
    /* nothing to do */
  }
}
