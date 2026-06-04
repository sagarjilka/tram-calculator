import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const token = searchParams.get('token')

  if (!id || !token) {
    return NextResponse.json({ error: 'Missing id or token' }, { status: 400 })
  }

  const { data: assessment, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('id', id)
    .eq('report_token', token)
    .single()

  if (error || !assessment) {
    return NextResponse.json({ error: 'Report not found or invalid token' }, { status: 404 })
  }

  if (!assessment.clinician_submitted || !assessment.yp_submitted || !assessment.parent_submitted) {
    return NextResponse.json({
      error: 'Report not yet complete',
      clinician_submitted: assessment.clinician_submitted,
      yp_submitted: assessment.yp_submitted,
      parent_submitted: assessment.parent_submitted,
    }, { status: 202 })
  }

  const { data: responses } = await supabase
    .from('responses')
    .select('respondent_type, data')
    .eq('assessment_id', id)

  const result: Record<string, Record<string, number>> = {}
  for (const r of (responses ?? [])) {
    result[r.respondent_type] = r.data
  }

  return NextResponse.json({
    assessment_id: id,
    clinician_email: assessment.clinician_email,
    created_at: assessment.created_at,
    responses: result,
  })
}
