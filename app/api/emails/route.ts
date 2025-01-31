import { NextResponse } from 'next/server'

import { google } from 'googleapis'

import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
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
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10,
      q: 'newer_than:7d',
    })

    if (!response.data.messages) {
      return NextResponse.json([])
    }

    const messages = await Promise.all(
      response.data.messages.map(async (message) => {
        try {
          const email = await gmail.users.messages.get({
            userId: 'me',
            id: message.id!,
          })
          return email.data
        } catch {
          return null
        }
      })
    )

    const validMessages = messages.filter((msg): msg is NonNullable<typeof msg> => msg !== null)
    return NextResponse.json(validMessages)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 500 })
  }
}
