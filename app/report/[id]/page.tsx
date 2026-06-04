'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import {
  buildSymptomsChart, buildRiskChart, buildDisruptionChart, buildBarriersChart,
  isHighlighted, getFreqSevScore, getScore,
} from '@/lib/scoring'

type ResponseData = Record<string, number>

interface ReportData {
  assessment_id: string
  clinician_email: string
  created_at: string
  responses: {
    clinician: ResponseData
    yp: ResponseData
    parent: ResponseData
  }
}

const CL_COLOR = '#1e3a5f'
const YP_COLOR = '#2e86ab'
const PC_COLOR = '#a23b72'

export default function ReportPage() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [report, setReport] = useState<ReportData | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`/api/report?id=${id}&token=${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error)
        else setReport(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load report.')
        setLoading(false)
      })
  }, [id, token])

  function handlePrint() {
    window.print()
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading report…</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-10 max-w-md text-center">
          <p className="text-red-600 font-medium mb-2">Report unavailable</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </main>
    )
  }

  if (!report) return null

  const { clinician: cl, yp, parent: par } = report.responses

  const symptomsData = buildSymptomsChart(cl, yp, par)
  const riskData = buildRiskChart(cl, yp, par)
  const disruptionData = buildDisruptionChart(cl, yp, par)
  const barriersData = buildBarriersChart(cl, yp, par)

  const dateStr = new Date(report.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Print/download bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#1e3a5f] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="font-semibold text-gray-800">TRAM Report</span>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#16304f] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download / Print PDF
        </button>
      </div>

      <div ref={printRef} className="max-w-5xl mx-auto px-4 py-8">
        {/* Report header */}
        <div className="bg-[#1e3a5f] text-white rounded-xl p-6 mb-8 print:rounded-none">
          <p className="text-blue-200 text-xs uppercase tracking-widest mb-1">TRAM Score Summary Report</p>
          <h1 className="text-2xl font-bold mb-4">Transition Readiness and Appropriateness Measure</h1>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-300">Clinician:</span>{' '}
              <span className="font-medium">{report.clinician_email}</span>
            </div>
            <div>
              <span className="text-blue-300">Date compiled:</span>{' '}
              <span className="font-medium">{dateStr}</span>
            </div>
          </div>
        </div>

        {/* GUIDANCE (Page 3 equivalent) */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-8">
          <h2 className="text-lg font-bold text-[#1e3a5f] mb-4 border-b border-gray-100 pb-2">
            Clinician Guidance
          </h2>
          <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
            <div>
              <p className="font-semibold text-gray-800 mb-1">PAGE 1: Plots 1–3 — Symptoms, Risk, and Disruption</p>
              <p>Each plot shows the degree of symptoms, risk, or disruption experienced by the young person as rated by the Clinician (CL), the Young Person (YP), and their Parent/Carer (P/C). Higher scores indicate items that may benefit more from consideration when deciding on transition pathways.</p>
              <p className="mt-1 text-gray-500">Severity and frequency scores have been summed for each item within the symptom and risk domains to give a score out of 10. Where a score is not present it is because that item is not experienced by the young person.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-1">PAGE 1: Plot 4 — Potential Barriers to a Smooth Transition</p>
              <p>This plot shows the type and level of potential barriers to successful transition as rated by all three respondents. These are key areas that need to be worked on to ensure successful transition. Where a score is not present, the young person was considered to have no problems in that area.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-1">PAGE 2: Score Summary Report</p>
              <p>The summary report is divided into two sections: items relevant to the clinician&apos;s transition decision (Part A), and items that, if worked on, may result in a smoother transition (Part B). <span className="bg-yellow-100 px-1 rounded">Highlighted rows</span> are items scored as moderate or higher — these are items that may benefit most from consideration.</p>
            </div>
          </div>
        </section>

        {/* PAGE 1: CHARTS */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#1e3a5f] mb-6">Page 1 — Plots</h2>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard title="Plot 1: Symptoms" data={symptomsData} maxValue={10} />
            <ChartCard title="Plot 2: Risk Factors" data={riskData} maxValue={10} />
            <ChartCard title="Plot 3: Disruption" data={disruptionData} maxValue={4} />
            <ChartCard title="Plot 4: Barriers to Functioning" data={barriersData} maxValue={3} />
          </div>

          {(symptomsData.length === 0 && riskData.length === 0 && disruptionData.length === 0 && barriersData.length === 0) && (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400 text-sm">
              No items scored above zero — no chart data to display.
            </div>
          )}
        </section>

        {/* PAGE 2: SCORE TABLES */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#1e3a5f] mb-6">Page 2 — Score Summary</h2>

          <div className="space-y-6">
            <ScoreTable
              title="Part A — Appropriateness for Transition"
              subtitle=""
              sections={[
                {
                  heading: '1. Symptoms',
                  description: 'Freq. = Frequency (0–5). Sev. = Severity (1–5). Score = Freq + Sev (max 10). Not experienced = score of 0.',
                  columns: ['Freq', 'Sev', 'Freq', 'Sev', 'Freq', 'Sev'],
                  subheaders: ['Clinician', '', 'Young Person', '', 'Parent/Carer', ''],
                  rows: buildFreqSevRows(cl, yp, par, [
                    { id: 'sym_depression', label: 'Depression' },
                    { id: 'sym_mania', label: 'Mania' },
                    { id: 'sym_anxiety', label: 'Anxiety' },
                    { id: 'sym_ptsd', label: 'Post-traumatic stress' },
                    { id: 'sym_psychosis', label: 'Psychosis' },
                    { id: 'sym_borderline', label: 'Borderline personality' },
                    { id: 'sym_antisocial', label: 'Antisocial behaviour' },
                    { id: 'sym_adhd', label: 'Attention deficit' },
                    { id: 'sym_social_comm', label: 'Social communication difficulties' },
                    { id: 'sym_eating', label: 'Eating difficulties' },
                    { id: 'sym_other_mh', label: 'Other mental health conditions' },
                  ], 1),
                },
                {
                  heading: '2. Overall Illness',
                  description: '0 = Recovered, no treatment needed · 1 = Recovered on treatment · 2 = Mildly ill · 3 = Moderately ill · 4 = Severely ill · 5 = Very severely ill',
                  columns: ['CL', 'YP', 'P/C'],
                  subheaders: [],
                  rows: buildSimpleRows(cl, yp, par, [
                    { id: 'illness_overall', label: 'Overall illness' },
                  ], 2),
                },
                {
                  heading: '3. Overall Disruption',
                  description: '0 = No disruption · 1 = Some · 2 = Moderate · 3 = Significant · 4 = Total disruption',
                  columns: ['CL', 'YP', 'P/C'],
                  subheaders: [],
                  rows: buildSimpleRows(cl, yp, par, [
                    { id: 'dis_selfcare', label: 'Self care' },
                    { id: 'dis_sleep', label: 'Sleep' },
                    { id: 'dis_household', label: 'Household chores' },
                    { id: 'dis_community', label: 'Community' },
                    { id: 'dis_social', label: 'Social' },
                    { id: 'dis_responsibility', label: 'Responsibility' },
                    { id: 'dis_family', label: 'Relationships with family' },
                    { id: 'dis_friends', label: 'Relationships with friends/partner' },
                    { id: 'dis_peers', label: 'Relationships with peers/colleagues' },
                    { id: 'dis_education', label: 'Education/work performance' },
                  ], 3),
                },
                {
                  heading: '4. Risk',
                  description: 'Freq. = Frequency (0–5). Sev. = Severity (1–5). Score = Freq + Sev (max 10).',
                  columns: ['Freq', 'Sev', 'Freq', 'Sev', 'Freq', 'Sev'],
                  subheaders: ['Clinician', '', 'Young Person', '', 'Parent/Carer', ''],
                  rows: buildFreqSevRows(cl, yp, par, [
                    { id: 'risk_stress', label: 'Stress' },
                    { id: 'risk_risk_taking', label: 'Risk taking behaviour' },
                    { id: 'risk_selfharm', label: 'Self-harming behaviours (no suicidal intent)' },
                    { id: 'risk_suicidal', label: 'Suicidal thoughts/behaviours' },
                    { id: 'risk_to_others', label: 'Risk to others' },
                    { id: 'risk_from_others', label: 'Risk from others' },
                  ], 4),
                },
                {
                  heading: '5. Factors Affecting Symptoms',
                  description: '0 = Not present · 1 = Present. Crisis frequency: 0–4.',
                  columns: ['CL', 'YP', 'P/C'],
                  subheaders: [],
                  rows: buildSimpleRows(cl, yp, par, [
                    { id: 'fac_crisis_service', label: 'Service use in times of crisis' },
                    { id: 'fac_crisis_freq', label: 'Frequency of crisis service use' },
                    { id: 'fac_inpatient', label: 'Inpatient hospital stays' },
                    { id: 'fac_relapse', label: 'Relapse' },
                    { id: 'fac_ongoing_tx', label: 'Ongoing treatment' },
                    { id: 'fac_drug_alcohol', label: 'Drug and alcohol misuse' },
                    { id: 'fac_comorbidity', label: 'Medical comorbidity' },
                    { id: 'fac_side_effects', label: 'Side effects' },
                  ], 5),
                },
                {
                  heading: '6. Health System Factors (Clinician only)',
                  description: '0 = No problem · 1 = Very mild · 2 = Mild · 3 = Moderate · 4 = Significant problem',
                  columns: ['CL'],
                  subheaders: [],
                  rows: buildClinicianOnlyRows(cl, [
                    { id: 'hs_financial', label: 'Negative financial implications of transition' },
                    { id: 'hs_camhs_links', label: 'Poor CAMHS-AMHS links' },
                    { id: 'hs_local_services', label: 'Lack of appropriate local services' },
                    { id: 'hs_alt_services', label: 'Poor extent of alternative services' },
                    { id: 'hs_gp', label: "GP not familiar with young person's condition" },
                  ], 6),
                },
              ]}
            />

            <ScoreTable
              title="Part B — Readiness for Transition"
              subtitle=""
              sections={[
                {
                  heading: '7. Barriers to Functioning',
                  description: '0 = No barrier · 1 = Minor · 2 = Moderate · 3 = Severe barrier',
                  columns: ['CL', 'YP', 'P/C'],
                  subheaders: [],
                  rows: buildSimpleRows(cl, yp, par, [
                    { id: 'bar_independence', label: 'Inability to act independently' },
                    { id: 'bar_condition', label: 'Poor condition understanding' },
                    { id: 'bar_service_knowledge', label: 'Poor service access knowledge' },
                    { id: 'bar_motivation', label: 'Poor motivation' },
                    { id: 'bar_medication', label: 'Poor medication adherence' },
                    { id: 'bar_social_support', label: 'Poor social support' },
                    { id: 'bar_carers', label: 'Not wanting carers involved' },
                    { id: 'bar_team_relations', label: 'Difficulty forming team relations' },
                    { id: 'bar_history', label: 'Difficulty repeating history' },
                  ], 7),
                },
                {
                  heading: '8. Other Life Changes (YP & Parent/Carer)',
                  description: '-1 = Positive change · 0 = No change / no impact · +1 = Negative change',
                  columns: ['YP', 'P/C'],
                  subheaders: [],
                  rows: buildLifeChangeRows(yp, par, [
                    { id: 'lc_family', label: 'Family relationships' },
                    { id: 'lc_friends', label: 'Relationships with friends and partner' },
                    { id: 'lc_house', label: 'Moving house' },
                    { id: 'lc_school', label: 'School/college/work' },
                    { id: 'lc_illness_death', label: 'Illness/death' },
                    { id: 'lc_police', label: 'Police involvement' },
                    { id: 'lc_pregnancy', label: 'Pregnancy' },
                    { id: 'lc_other', label: 'Other' },
                  ]),
                },
              ]}
            />
          </div>
        </section>

        <p className="text-center text-xs text-gray-400 print:mt-8">
          TRAM · MILESTONE Project · University of Warwick · Report generated {dateStr}
        </p>
      </div>

      <style jsx global>{`
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </main>
  )
}

// ── Chart component ──────────────────────────────────────────────────────────

function ChartCard({ title, data, maxValue }: { title: string; data: { name: string; clinician: number; yp: number; parent: number }[]; maxValue: number }) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-gray-800 mb-4 text-sm">{title}</h3>
        <p className="text-gray-400 text-sm italic">No items scored above zero.</p>
      </div>
    )
  }

  const chartHeight = Math.max(160, data.length * 36)

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="font-semibold text-gray-800 mb-4 text-sm">{title}</h3>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={[0, maxValue]} tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="clinician" name="Clinician" fill={CL_COLOR} barSize={8} />
          <Bar dataKey="yp" name="Young Person" fill={YP_COLOR} barSize={8} />
          <Bar dataKey="parent" name="Parent/Carer" fill={PC_COLOR} barSize={8} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Score table helpers ──────────────────────────────────────────────────────

interface TableRow {
  label: string
  values: (number | string)[]
  highlight: boolean
}

interface TableSection {
  heading: string
  description: string
  columns: string[]
  subheaders: string[]
  rows: TableRow[]
}

function buildFreqSevRows(
  cl: ResponseData, yp: ResponseData, par: ResponseData,
  items: { id: string; label: string }[],
  domain: number
): TableRow[] {
  return items.map(item => {
    const clFreq = cl[`${item.id}_freq`] ?? 0
    const clSev = clFreq > 0 ? (cl[`${item.id}_sev`] ?? 0) : 0
    const ypFreq = yp[`${item.id}_freq`] ?? 0
    const ypSev = ypFreq > 0 ? (yp[`${item.id}_sev`] ?? 0) : 0
    const parFreq = par[`${item.id}_freq`] ?? 0
    const parSev = parFreq > 0 ? (par[`${item.id}_sev`] ?? 0) : 0
    const scores = [clFreq + clSev, ypFreq + ypSev, parFreq + parSev]
    const highlight = scores.some(s => isHighlighted(domain, s))
    return {
      label: item.label,
      values: [clFreq, clSev || '–', ypFreq, ypSev || '–', parFreq, parSev || '–'],
      highlight,
    }
  })
}

function buildSimpleRows(
  cl: ResponseData, yp: ResponseData, par: ResponseData,
  items: { id: string; label: string }[],
  domain: number
): TableRow[] {
  return items.map(item => {
    const clVal = getScore(cl, item.id)
    const ypVal = getScore(yp, item.id)
    const parVal = getScore(par, item.id)
    const highlight = [clVal, ypVal, parVal].some(s => isHighlighted(domain, s))
    return { label: item.label, values: [clVal, ypVal, parVal], highlight }
  })
}

function buildClinicianOnlyRows(
  cl: ResponseData,
  items: { id: string; label: string }[],
  domain: number
): TableRow[] {
  return items.map(item => {
    const val = getScore(cl, item.id)
    return { label: item.label, values: [val], highlight: isHighlighted(domain, val) }
  })
}

function buildLifeChangeRows(
  yp: ResponseData, par: ResponseData,
  items: { id: string; label: string }[]
): TableRow[] {
  return items.map(item => {
    const ypVal = yp[item.id] ?? 0
    const parVal = par[item.id] ?? 0
    return {
      label: item.label,
      values: [ypVal === -1 ? '−1' : ypVal === 1 ? '+1' : '0', parVal === -1 ? '−1' : parVal === 1 ? '+1' : '0'],
      highlight: ypVal === 1 || parVal === 1,
    }
  })
}

function ScoreTable({ title, sections }: { title: string; subtitle: string; sections: TableSection[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-[#1e3a5f] text-white px-5 py-3">
        <h3 className="font-bold text-sm">{title}</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {sections.map((section, si) => (
          <div key={si} className="p-5">
            <p className="font-semibold text-gray-800 text-sm mb-1">{section.heading}</p>
            {section.description && (
              <p className="text-xs text-gray-400 mb-3">{section.description}</p>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-2 py-2 font-medium text-gray-600 w-48">Item</th>
                    {section.columns.map((col, ci) => (
                      <th key={ci} className="text-center px-2 py-2 font-medium text-gray-600 w-16">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {section.rows.map((row, ri) => (
                    <tr key={ri} className={row.highlight ? 'bg-yellow-50' : ''}>
                      <td className={`px-2 py-2 font-medium ${row.highlight ? 'text-amber-800' : 'text-gray-700'}`}>
                        {row.label}
                        {row.highlight && <span className="ml-1 text-amber-500">●</span>}
                      </td>
                      {row.values.map((val, vi) => (
                        <td key={vi} className={`text-center px-2 py-2 ${row.highlight ? 'text-amber-800 font-semibold' : 'text-gray-600'}`}>
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              <span className="text-amber-500">●</span> Highlighted rows = scored moderate or above
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
