import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const { assessment_id, respondent_type, token, data } = await request.json()

  if (!assessment_id || !respondent_type || !data) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Verify token for yp and parent
  if (respondent_type !== 'clinician') {
    const { data: assessment, error } = await supabase
      .from('assessments')
      .select('yp_token, parent_token')
      .eq('id', assessment_id)
      .single()

    if (error || !assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    const expectedToken =
      respondent_type === 'yp' ? assessment.yp_token : assessment.parent_token

    if (token !== expectedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
    }
  }

  // Upsert response
  const { error: respError } = await supabase
    .from('responses')
    .upsert({ assessment_id, respondent_type, data }, { onConflict: 'assessment_id,respondent_type' })

  if (respError) {
    console.error(respError)
    return NextResponse.json({ error: 'Failed to save response' }, { status: 500 })
  }

  // Mark submitted flag
  const flagField = `${respondent_type}_submitted`
  await supabase
    .from('assessments')
    .update({ [flagField]: true })
    .eq('id', assessment_id)

  // Check if all 3 are now done
  const { data: assessment } = await supabase
    .from('assessments')
    .select('clinician_email, clinician_submitted, yp_submitted, parent_submitted, report_token')
    .eq('id', assessment_id)
    .single()

  if (
    assessment &&
    assessment.clinician_submitted &&
    assessment.yp_submitted &&
    assessment.parent_submitted
  ) {
    const base = process.env.NEXT_PUBLIC_BASE_URL
    const reportLink = `${base}/report/${assessment_id}?token=${assessment.report_token}`

    await resend.emails.send({
      from: 'TRAM <tram@sagarjilka.com>',
      to: assessment.clinician_email,
      subject: 'TRAM Report Ready',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #1e3a5f;">Your TRAM Report is Ready</h2>
          <p>All three questionnaires have been completed. Your full TRAM report is now available.</p>
          <p style="margin: 24px 0;">
            <a href="${reportLink}" style="background: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Report
            </a>
          </p>
          <p style="font-size: 13px; color: #666;">Or copy this link: ${reportLink}</p>
        </div>
      `,
    })
  }

  return NextResponse.json({ success: true })
}
