/**
 * Flags for parts of the site that are designed but not yet built.
 *
 * Flip a flag to true once its page exists — nothing else needs changing.
 */

/**
 * The download page exists; the installers do not, so its buttons are disabled
 * and the page says so. Flip this back to false to hide every route into it.
 */
export const DOWNLOAD_ENABLED = true

/** Accounts, save sync and the player dashboard. Needs a backend. */
export const ACCOUNTS_ENABLED = false
