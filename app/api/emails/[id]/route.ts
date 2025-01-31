import { NextResponse } from 'next/server'

import { google } from 'googleapis'

import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 })
    }

    if (!session.provider_token) {
      return NextResponse.json({ error: 'No provider token found' }, { status: 401 })
    }

    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({
      access_token: session.provider_token,
    })

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client })
    const response = await gmail.users.messages.get({
      userId: 'me',
      id,
      format: 'full',
    })

    return NextResponse.json(response.data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch email content' }, { status: 500 })
  }
}
