/**
 * Flags for parts of the site that are designed but not yet built.
 *
 * Flip a flag to true once its page exists — nothing else needs changing.
 */

/**
 * The download page needs the installer pipeline and an account gate, neither
 * of which exists yet. While this is false, every route into it is hidden
 * rather than left pointing at a 404.
 */
export const DOWNLOAD_ENABLED = false

/** Accounts, save sync and the player dashboard. Needs a backend. */
export const ACCOUNTS_ENABLED = false
