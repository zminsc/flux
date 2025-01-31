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
    const textPart =
      email.payload?.parts?.find((part) => part.mimeType === 'text/plain') ||
      email.payload?.parts?.find((part) => part.mimeType === 'text/html')

    // If no parts, try the body directly
    const content = textPart?.body.data || email.payload?.body?.data

    if (content) {
      try {
        // Gmail API returns base64url encoded content
        const decoded = atob(content.replace(/-/g, '+').replace(/_/g, '/'))

        // Handle HTML content by stripping tags
        if (textPart?.mimeType === 'text/html') {
          return decoded
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
        }

        // Clean up plain text content
        return decoded
          .split('\n')
          .map((line) => line.trim())
          .join('\n')
          .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newline
          .trim()
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
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 p-8 pr-[400px]">
        <h1 className="text-2xl text-navy-light font-bold mb-8">Recent Emails</h1>

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

      {/* Right Sidebar */}
      <div className="fixed top-0 right-0 w-[400px] h-full bg-gray-50 border-l border-gray-200 overflow-y-auto">
        <div className="p-6 sticky top-0 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-medium text-navy">Draft Email Reply</h2>
        </div>

        {/* Drop Zone */}
        <div className="p-6" onDrop={handleDrop} onDragOver={handleDragOver}>
          {fetchingContent || generatingDraft ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 bg-white">
              <p className="text-gray-500 text-center">
                {generatingDraft ? 'Generating reply...' : 'Loading email content...'}
              </p>
            </div>
          ) : droppedEmail ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <h3 className="font-medium mb-2">Original Email</h3>
                <p className="text-sm font-medium break-words">
                  {droppedEmail.payload?.headers?.find((h) => h.name === 'Subject')?.value}
                </p>
                <p className="text-sm text-gray-600 break-words mt-1">
                  From: {droppedEmail.payload?.headers?.find((h) => h.name === 'From')?.value}
                </p>
                <div className="mt-3 pt-3 border-t">
                  <pre
                    className="text-sm whitespace-pre-wrap break-words font-sans w-full"
                    style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                  >
                    {getEmailContent(droppedEmail)}
                  </pre>
                </div>
              </div>

              {draftReply && (
                <div className="rounded-lg border border-navy-light/20 bg-navy-light/5 p-4">
                  <h3 className="font-medium mb-2 text-navy">Draft Reply</h3>
                  <pre
                    className="text-sm whitespace-pre-wrap break-words font-sans w-full"
                    style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                  >
                    {draftReply}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 bg-white">
              <p className="text-gray-500 text-center">Drag an email here to generate a reply</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
