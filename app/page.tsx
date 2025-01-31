'use client'

import { useState } from 'react'

import { useSearchParams } from 'next/navigation'

import { signInWithGoogle } from '@/lib/supabase/server'

const ERROR_MESSAGES = {
  auth_failed: 'Sign in failed. Please try again later.',
}

export default function Page() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const errorMessage = error ? ERROR_MESSAGES[error as keyof typeof ERROR_MESSAGES] : null

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      await signInWithGoogle()
    } catch (error) {
      console.error('Failed to sign in:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-gray-900">
          flux<span className="text-blue-600">.</span>
        </h1>

        <p className="text-xl text-gray-600 max-w-md mx-auto">
          redefine the flow, redefine with flux
        </p>

        {errorMessage && (
          <div className="text-red-600 bg-red-50 p-3 rounded-lg mt-4">{errorMessage}</div>
        )}

        <div className="flex justify-center mt-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className={`
              flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 
              rounded-lg shadow-sm transition-all duration-200
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
            `}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
              />
            </svg>
            <span className="text-gray-700 font-medium">
              {isLoading ? 'Signing in...' : 'Sign in with Google'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
