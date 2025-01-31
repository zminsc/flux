'use client'

import { useEffect, useState } from 'react'

type EmailMessage = {
  id: string
  payload?: {
    headers?: {
      name: string
      value: string
    }[]
    parts?: {
      mimeType: string
      body: {
        data?: string
      }
    }[]
    body?: {
      data?: string
    }
  }
}

export default function Dashboard() {
  const [emails, setEmails] = useState<EmailMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [droppedEmail, setDroppedEmail] = useState<EmailMessage | null>(null)
  const [fetchingContent, setFetchingContent] = useState(false)
  const [draftReply, setDraftReply] = useState<string | null>(null)
  const [generatingDraft, setGeneratingDraft] = useState(false)

  useEffect(() => {
    async function fetchEmails() {
      try {
        const response = await fetch('/api/emails')
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch emails')
        }
        setEmails(data)
      } catch (err) {
        console.error('Error fetching emails:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch emails')
      } finally {
        setLoading(false)
      }
    }

    fetchEmails()
  }, [])

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, emailId: string) => {
    e.dataTransfer.setData('text/plain', emailId)
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const emailId = e.dataTransfer.getData('text/plain')
    setFetchingContent(true)
    setDraftReply(null)

    try {
      const response = await fetch(`/api/emails/${emailId}`)
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch email content')
      }
      setDroppedEmail(data)

      // Generate draft reply
      setGeneratingDraft(true)
      const emailContent = getEmailContent(data)
      const subject = data.payload?.headers?.find((h) => h.name === 'Subject')?.value || ''
      const from = data.payload?.headers?.find((h) => h.name === 'From')?.value || ''

      const context = `
        Email From: ${from}
        Subject: ${subject}
        Content: ${emailContent}
        
        Please draft a professional reply to this email.
      `

      const draftResponse = await fetch('/api/emails/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailContent: context }),
      })

      const { draft } = await draftResponse.json()
      setDraftReply(draft)
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to process email')
    } finally {
      setFetchingContent(false)
      setGeneratingDraft(false)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const getEmailContent = (email: EmailMessage) => {
    // Try to get content from parts first (multipart emails)
    const textPart = email.payload?.parts?.find(
      (part) => part.mimeType === 'text/plain' || part.mimeType === 'text/html'
    )

    // If no parts, try the body directly
    const content = textPart?.body.data || email.payload?.body?.data

    if (content) {
      // Gmail API returns base64url encoded content
      try {
        const decoded = atob(content.replace(/-/g, '+').replace(/_/g, '/'))
        return decoded
      } catch (e) {
        return 'Unable to decode email content'
      }
    }

    return 'No content available'
  }

  if (loading) {
    return <div className="p-4">Loading emails...</div>
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl text-navy-light font-bold">Recent Emails</h1>

      {/* Drop Zone */}
      <div
        className="p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 max-w-full"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {fetchingContent || generatingDraft ? (
          <p className="text-gray-500">
            {generatingDraft ? 'Generating reply...' : 'Loading email content...'}
          </p>
        ) : droppedEmail ? (
          <div className="space-y-4">
            <h2 className="font-medium break-words">
              {droppedEmail.payload?.headers?.find((h) => h.name === 'Subject')?.value}
            </h2>
            <p className="text-sm text-gray-600 break-words">
              From: {droppedEmail.payload?.headers?.find((h) => h.name === 'From')?.value}
            </p>
            <div className="mt-4 p-4 bg-white rounded border">
              <h3 className="font-medium mb-2">Original Email:</h3>
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap break-words font-sans overflow-x-auto">
                  {getEmailContent(droppedEmail)}
                </pre>
              </div>
            </div>
            {draftReply && (
              <div className="mt-4 p-4 bg-navy-light/5 rounded border">
                <h3 className="font-medium mb-2 text-navy">Draft Reply:</h3>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap break-words font-sans overflow-x-auto">
                    {draftReply}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500">
            Drop an email here to see its content and get a draft reply
          </p>
        )}
      </div>

      {/* Email List */}
      <div className="space-y-2">
        {emails.map((email) => (
          <div
            key={email.id}
            className="p-4 bg-white rounded-lg shadow cursor-move hover:shadow-md transition-shadow"
            draggable
            onDragStart={(e) => handleDragStart(e, email.id)}
          >
            <h2 className="font-medium break-words">
              {email.payload?.headers?.find((h) => h.name === 'Subject')?.value}
            </h2>
            <p className="text-sm text-gray-600 break-words">
              From: {email.payload?.headers?.find((h) => h.name === 'From')?.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
