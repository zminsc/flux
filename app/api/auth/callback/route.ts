import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL

  if (!code) {
    return NextResponse.redirect(new URL('/?error=auth_failed', baseUrl))
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(new URL(`/?error=auth_failed&message=${error.message}`, baseUrl))
  }

  return NextResponse.redirect(new URL('/dashboard', baseUrl))
}
