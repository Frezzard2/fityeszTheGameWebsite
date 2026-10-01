/**
 * Facts the privacy notice states. Only you can supply them, so each renders a
 * visible KITÖLTENDŐ marker while it is empty rather than shipping a blank or,
 * worse, a guess.
 *
 * An imprint naming who operates the site and how to reach them is legally
 * required in the EU; so is naming the hosting provider. The contact address
 * carries more weight than that here: it is the only route a user has to
 * exercise their rights over account data, which the site really does store.
 */
export const CONTACT_EMAIL = ''
export const HOSTING_PROVIDER = ''

/**
 * Where the Supabase project keeps accounts and saves, as users should read it
 * — e.g. 'EU (Frankfurt)'. Read it off the project's dashboard; outside the
 * EEA the notice needs a transfer basis as well, so say so if that is the case.
 */
export const DATA_REGION = ''
