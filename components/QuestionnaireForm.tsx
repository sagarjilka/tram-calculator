'use client'

import { useState } from 'react'
import {
  Question, Respondent, QUESTIONS, DOMAIN_LABELS,
  FREQ_OPTIONS, SEV_OPTIONS, ILLNESS_OPTIONS, DISRUPTION_OPTIONS,
  BARRIER_OPTIONS, HEALTH_SYSTEM_OPTIONS, LIFE_CHANGE_OPTIONS,
  BINARY_OPTIONS, CRISIS_FREQ_OPTIONS,
  getQuestionsForRespondent,
} from '@/lib/questions'

interface Props {
  respondent: Respondent
  assessmentId: string
  token?: string
  onComplete: () => void
}

const RESPONDENT_LABELS: Record<Respondent, string> = {
  clinician: 'Clinician',
  yp: 'Young Person',
  parent: 'Parent / Carer',
}

export default function QuestionnaireForm({ respondent, assessmentId, token, onComplete }: Props) {
  const questions = getQuestionsForRespondent(respondent)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Group by domain
  const byDomain = questions.reduce<Record<number, Question[]>>((acc, q) => {
    if (!acc[q.domain]) acc[q.domain] = []
    acc[q.domain].push(q)
    return acc
  }, {})

  function setValue(key: string, value: number) {
    setAnswers(prev => ({ ...prev, [key]: value }))
  }

  function getCompletionCount(): [number, number] {
    let required = 0
    let filled = 0
    for (const q of questions) {
      if (q.type === 'freq_sev') {
        required += 1 // freq is mandatory; sev only if freq > 0
        if (answers[`${q.id}_freq`] !== undefined) {
          filled += 1
          if ((answers[`${q.id}_freq`] ?? 0) > 0 && answers[`${q.id}_sev`] === undefined) {
            filled -= 0.5 // sev missing when freq > 0
          }
        }
      } else {
        required += 1
        if (answers[q.id] !== undefined) filled += 1
      }
    }
    return [Math.floor(filled), required]
  }

  function isComplete(): boolean {
    for (const q of questions) {
      if (q.type === 'freq_sev') {
        if (answers[`${q.id}_freq`] === undefined) return false
        if ((answers[`${q.id}_freq`] ?? 0) > 0 && answers[`${q.id}_sev`] === undefined) return false
      } else {
        if (answers[q.id] === undefined) return false
      }
    }
    return true
  }

  async function handleSubmit() {
    if (!isComplete()) {
      setError('Please answer all questions before submitting.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment_id: assessmentId,
          respondent_type: respondent,
          token,
          data: answers,
        }),
      })
      if (!res.ok) throw new Error('Submission failed')
      onComplete()
    } catch {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const [filled, total] = getCompletionCount()
  const progress = Math.round((filled / total) * 100)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-[#1e3a5f] text-white rounded-xl p-6 mb-8">
        <div className="text-xs uppercase tracking-widest text-blue-200 mb-1">TRAM Assessment</div>
        <h1 className="text-2xl font-bold">
          {RESPONDENT_LABELS[respondent]} Questionnaire
        </h1>
        <p className="text-blue-100 text-sm mt-2">
          Transition Readiness and Appropriateness Measure (TRAM)
        </p>
        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-blue-200 mb-1">
            <span>{filled} of {total} questions answered</span>
            <span>{progress}%</span>
          </div>
          <div className="bg-blue-900 rounded-full h-2">
            <div
              className="bg-blue-300 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Domains */}
      {Object.entries(byDomain).map(([domainStr, domainQuestions]) => {
        const domain = parseInt(domainStr)
        return (
          <div key={domain} className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#1e3a5f] text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0">
                {domain}
              </div>
              <h2 className="text-lg font-semibold text-gray-800">{DOMAIN_LABELS[domain]}</h2>
            </div>

            {domain === 1 && (
              <p className="text-sm text-gray-500 mb-4 ml-10">
                For each symptom, rate how often it is experienced (Frequency) and how severe it is (Severity). If not experienced, select 0 for frequency — no severity rating needed.
              </p>
            )}
            {domain === 4 && (
              <p className="text-sm text-gray-500 mb-4 ml-10">
                For each risk area, rate frequency and severity. If not experienced, select 0 for frequency.
              </p>
            )}
            {domain === 2 && (
              <p className="text-sm text-gray-500 mb-4 ml-10">
                0 = Recovered, no treatment needed &nbsp;·&nbsp; 1 = Recovered on treatment &nbsp;·&nbsp; 2 = Mildly ill &nbsp;·&nbsp; 3 = Moderately ill &nbsp;·&nbsp; 4 = Severely ill &nbsp;·&nbsp; 5 = Very severely ill
              </p>
            )}
            {domain === 3 && (
              <p className="text-sm text-gray-500 mb-4 ml-10">
                0 = No disruption &nbsp;·&nbsp; 1 = Some &nbsp;·&nbsp; 2 = Moderate &nbsp;·&nbsp; 3 = Significant &nbsp;·&nbsp; 4 = Total disruption
              </p>
            )}
            {domain === 5 && (
              <p className="text-sm text-gray-500 mb-4 ml-10">
                Indicate whether each factor is present (1) or not (0).
              </p>
            )}
            {domain === 6 && (
              <p className="text-sm text-gray-500 mb-4 ml-10">
                0 = No problem &nbsp;·&nbsp; 1 = Very mild &nbsp;·&nbsp; 2 = Mild &nbsp;·&nbsp; 3 = Moderate &nbsp;·&nbsp; 4 = Significant problem
              </p>
            )}
            {domain === 7 && (
              <p className="text-sm text-gray-500 mb-4 ml-10">
                0 = No barrier &nbsp;·&nbsp; 1 = Minor &nbsp;·&nbsp; 2 = Moderate &nbsp;·&nbsp; 3 = Severe barrier
              </p>
            )}
            {domain === 8 && (
              <p className="text-sm text-gray-500 mb-4 ml-10">
                For each life area, indicate whether there has been a positive change (−1), no change (0), or a negative change (+1) recently.
              </p>
            )}

            <div className="space-y-4 ml-10">
              {domainQuestions.map(q => (
                <QuestionRow
                  key={q.id}
                  question={q}
                  answers={answers}
                  setValue={setValue}
                />
              ))}
            </div>
          </div>
        )
      })}

      {/* Submit */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-[#1e3a5f] hover:bg-[#16304f] text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting…' : 'Submit Questionnaire'}
        </button>
        <p className="text-center text-sm text-gray-400 mt-3">
          {filled} of {total} questions answered
        </p>
      </div>
    </div>
  )
}

function QuestionRow({
  question,
  answers,
  setValue,
}: {
  question: Question
  answers: Record<string, number>
  setValue: (key: string, value: number) => void
}) {
  if (question.type === 'freq_sev') {
    const freq = answers[`${question.id}_freq`]
    const sev = answers[`${question.id}_sev`]
    return (
      <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
        <p className="font-medium text-gray-800 mb-3">{question.label}</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
              Frequency
            </label>
            <SelectField
              options={FREQ_OPTIONS}
              value={freq}
              onChange={v => setValue(`${question.id}_freq`, v)}
            />
          </div>
          {freq !== undefined && freq > 0 && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                Severity
              </label>
              <SelectField
                options={SEV_OPTIONS}
                value={sev}
                onChange={v => setValue(`${question.id}_sev`, v)}
              />
            </div>
          )}
          {freq === 0 && (
            <div className="flex items-center">
              <span className="text-xs text-gray-400 italic">Not experienced – no severity needed</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  const optionsMap: Record<string, { value: number; label: string }[]> = {
    scale_0_5: ILLNESS_OPTIONS,
    scale_0_4: DISRUPTION_OPTIONS,
    scale_0_3: BARRIER_OPTIONS,
    binary: BINARY_OPTIONS,
    crisis_freq: CRISIS_FREQ_OPTIONS,
    life_change: LIFE_CHANGE_OPTIONS,
  }

  const options = optionsMap[question.type] ?? []

  return (
    <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
      <p className="font-medium text-gray-800 mb-3">{question.label}</p>
      <SelectField
        options={options}
        value={answers[question.id]}
        onChange={v => setValue(question.id, v)}
      />
    </div>
  )
}

function SelectField({
  options,
  value,
  onChange,
}: {
  options: { value: number; label: string }[]
  value: number | undefined
  onChange: (v: number) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-3 py-2 text-sm rounded-lg border transition-all text-left ${
            value === opt.value
              ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
              : 'bg-white text-gray-700 border-gray-200 hover:border-[#1e3a5f] hover:text-[#1e3a5f]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
