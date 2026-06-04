'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleStart(e: React.FormEvent) {
    e.preventDefault()
    if (!email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clinician_email: email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push(`/assess/${data.id}/clinician`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start assessment.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1e3a5f] rounded-2xl mb-4">
            <span className="text-white font-bold text-xl">T</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">TRAM</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Transition Readiness and Appropriateness Measure
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Start a new assessment</h2>
          <p className="text-gray-500 text-sm mb-6">
            Enter your email address to begin. You will receive links to share with the young person
            and their parent/carer, and a link to the full report once all three questionnaires are complete.
          </p>

          <form onSubmit={handleStart} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clinician email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="clinician@example.com"
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1e3a5f] hover:bg-[#16304f] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Starting…' : 'Start Assessment →'}
            </button>
          </form>
        </div>

        <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">How it works</h3>
          <ol className="space-y-2 text-sm text-gray-500">
            <li className="flex gap-2"><span className="text-[#1e3a5f] font-bold">1.</span> You complete the clinician questionnaire</li>
            <li className="flex gap-2"><span className="text-[#1e3a5f] font-bold">2.</span> Share unique links with the young person and parent/carer</li>
            <li className="flex gap-2"><span className="text-[#1e3a5f] font-bold">3.</span> Once all three are done, you receive the full report by email</li>
            <li className="flex gap-2"><span className="text-[#1e3a5f] font-bold">4.</span> View charts, scores, and clinical guidance — download as PDF</li>
          </ol>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          MILESTONE Project · University of Warwick
        </p>
      </div>
    </main>
  )
}
