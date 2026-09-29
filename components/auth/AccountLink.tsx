'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

/**
 * The header's account control.
 *
 * Signed out it invites you in; signed in it shows who you are and goes to
 * the dashboard. The header is server-rendered, so this has to be a client
 * leaf — without it the link says "sign in" to someone already signed in.
 */
export function AccountLink({
  signedOutLabel,
  signInHref,
  dashboardHref,
  className,
  style,
}: {
  signedOutLabel: string
  signInHref: string
  dashboardHref: string
  className?: string
  style?: CSSProperties
}) {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    const sb = supabase()
    if (!sb) return
    sb.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  const name =
    (session?.user.user_metadata?.display_name as string) || session?.user.email || null

  return (
    <Link href={name ? dashboardHref : signInHref} className={className} style={style}>
      {name ?? signedOutLabel}
    </Link>
  )
}
