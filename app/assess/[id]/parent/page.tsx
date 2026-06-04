'use client'

import { useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import QuestionnaireForm from '@/components/QuestionnaireForm'

export default function ParentPage() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [done, setDone] = useState(false)

  if (!token) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-10 max-w-md w-full text-center">
          <p className="text-red-600 font-medium">Invalid link. Please use the link sent to you by your clinician.</p>
        </div>
      </main>
    )
  }

  if (done) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Thank you!</h2>
          <p className="text-gray-500 text-sm">
            Your responses have been submitted. You can now close this page.
            The clinician will receive the full report once everyone has completed their questionnaire.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-3xl mx-auto px-4 mb-4">
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-800">
          <strong>For the parent/carer:</strong> Your clinician has asked you to complete this short questionnaire about the young person in your care. Your answers will be kept confidential and used to support their care.
        </div>
      </div>
      <QuestionnaireForm
        respondent="parent"
        assessmentId={id}
        token={token}
        onComplete={() => setDone(true)}
      />
    </main>
  )
}
