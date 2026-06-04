'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import QuestionnaireForm from '@/components/QuestionnaireForm'

export default function ClinicianPage() {
  const { id } = useParams<{ id: string }>()
  const [done, setDone] = useState(false)

  if (done) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Clinician form submitted</h2>
          <p className="text-gray-500 text-sm mb-6">
            Check your email — we&apos;ve sent you the links to share with the young person and parent/carer.
            You&apos;ll receive a separate email with the report link once all three questionnaires are complete.
          </p>
          <div className="bg-blue-50 rounded-xl p-4 text-left">
            <p className="text-sm font-semibold text-[#1e3a5f] mb-2">Next steps:</p>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. Open the email from TRAM</li>
              <li>2. Forward or copy the YP link to the young person</li>
              <li>3. Forward or copy the Parent/Carer link to the parent</li>
              <li>4. Wait for the report email once all done</li>
            </ol>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <QuestionnaireForm
        respondent="clinician"
        assessmentId={id}
        onComplete={() => setDone(true)}
      />
    </main>
  )
}
