import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const { clinician_email } = await request.json()

  if (!clinician_email || !clinician_email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  const { data: assessment, error } = await supabase
    .from('assessments')
    .insert({ clinician_email })
    .select()
    .single()

  if (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create assessment' }, { status: 500 })
  }

  const base = process.env.NEXT_PUBLIC_BASE_URL
  const ypLink = `${base}/assess/${assessment.id}/yp?token=${assessment.yp_token}`
  const parentLink = `${base}/assess/${assessment.id}/parent?token=${assessment.parent_token}`
  const clinicianLink = `${base}/assess/${assessment.id}/clinician`

  await resend.emails.send({
    from: 'TRAM <tram@sagarjilka.com>',
    to: clinician_email,
    subject: 'TRAM Assessment – Your links',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #1e3a5f;">TRAM Assessment Started</h2>
        <p>Your TRAM assessment has been created. Please find below:</p>
        <ol>
          <li style="margin-bottom: 12px;">
            <strong>Your clinician form:</strong><br/>
            <a href="${clinicianLink}">${clinicianLink}</a>
          </li>
          <li style="margin-bottom: 12px;">
            <strong>Send this link to the Young Person:</strong><br/>
            <a href="${ypLink}">${ypLink}</a>
          </li>
          <li style="margin-bottom: 12px;">
            <strong>Send this link to the Parent/Carer:</strong><br/>
            <a href="${parentLink}">${parentLink}</a>
          </li>
        </ol>
        <p>Once all three questionnaires are completed, you will receive an email with a link to the full report.</p>
        <p style="color: #666; font-size: 13px; margin-top: 32px;">
          This assessment was initiated by ${clinician_email}.
        </p>
      </div>
    `,
  })

  return NextResponse.json({
    id: assessment.id,
    clinicianLink,
    ypLink,
    parentLink,
  })
}
