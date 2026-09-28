import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Browser-only Supabase client.
 *
 * The site is a static export with no server, so auth runs entirely in the
 * visitor's browser against Supabase directly. Row-level security is what
 * protects the data — the anon key is public by design.
 *
 * Returns null until the project is configured, so the auth page can say so
 * instead of throwing.
 */
let client: SupabaseClient | null | undefined

export function supabase(): SupabaseClient | null {
  if (client !== undefined) return client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  client = url && key ? createClient(url, key) : null
  return client
}

export const isAuthConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
