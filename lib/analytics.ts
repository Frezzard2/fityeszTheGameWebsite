/**
 * Google Analytics, behind consent.
 *
 * Analytics cookies are not strictly necessary for anything the visitor asked
 * for, so under the ePrivacy rules they need agreement BEFORE they are set —
 * not a notice afterwards. Nothing here contacts Google until `isGranted()`
 * returns true, so a visitor who ignores or refuses the banner never appears
 * in the measurement data and never receives a cookie.
 */
export const GA_MEASUREMENT_ID = 'G-8WGRJG0ZT0'

export const CONSENT_KEY = 'fityesz.consent.v1'

export type Consent = 'granted' | 'denied' | null

/**
 * Every accessor is guarded: localStorage throws in private mode and can come
 * back empty with site data blocked, and the site has to work either way.
 * Unreadable means undecided, which means nothing loads.
 */
export function readConsent(): Consent {
  try {
    const v = localStorage.getItem(CONSENT_KEY)
    return v === 'granted' || v === 'denied' ? v : null
  } catch {
    return null
  }
}

export function writeConsent(value: Exclude<Consent, null>): void {
  try {
    localStorage.setItem(CONSENT_KEY, value)
  } catch {
    /* private mode — the choice holds for this page view only */
  }
}

/** Forgetting the choice brings the banner back, which is how it is withdrawn. */
export function forgetConsent(): void {
  try {
    localStorage.removeItem(CONSENT_KEY)
  } catch {
    /* nothing to do */
  }
}

/**
 * Drops the cookies Google set. They are first-party, so the site can clear
 * them itself — withdrawing consent should not leave the identifier behind.
 */
export function clearAnalyticsCookies(): void {
  try {
    const host = location.hostname
    const domains = [host, `.${host}`, `.${host.split('.').slice(-2).join('.')}`]
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.split('=')[0]?.trim()
      if (!name || !/^_ga/.test(name)) continue
      for (const d of domains) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${d}`
      }
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
    }
  } catch {
    /* nothing to do */
  }
}
