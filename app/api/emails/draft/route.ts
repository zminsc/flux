import { NextResponse } from 'next/server'

import { generateEmailResponse } from '@/lib/langchain/langchain'

export async function POST(request: Request) {
  try {
    const { emailContent } = await request.json()

    if (!emailContent) {
      return NextResponse.json({ error: 'Email content is required' }, { status: 400 })
    }

    const draftResponse = await generateEmailResponse(emailContent)
    return NextResponse.json({ draft: draftResponse })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate email draft' }, { status: 500 })
  }
}
