import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import nodemailer from 'nodemailer'

export const dynamic = 'force-dynamic'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  tls: { rejectUnauthorized: false },
})

export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data: abonnements } = await supabase
      .from('abonnements')
      .select('*')
      .eq('statut', 'actif')

    if (!abonnements?.length) return NextResponse.json({ message: 'Aucun abonnement actif' })

    const today = new Date()
    const toSend = abonnements.filter(a => {
      const jours = Math.ceil((new Date(a.date_renouvellement).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return jours === 30 || jours === 7
    })

    if (!toSend.length) return NextResponse.json({ message: "Aucune alerte aujourd'hui" })

    const rows = toSend.map(a => {
      const jours = Math.ceil((new Date(a.date_renouvellement).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;">${a.nom}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;">${a.categorie}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;">${a.cout}€/${a.periodicite === 'mensuel' ? 'mois' : 'an'}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;">${new Date(a.date_renouvellement).toLocaleDateString('fr-FR')}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-weight:600;color:${jours <= 7 ? '#dc2626' : '#d97706'};">${jours} jours</td>
      </tr>`
    }).join('')

    const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:linear-gradient(135deg,#0284c7,#0ea5e9);padding:24px;border-radius:12px 12px 0 0;">
        <h2 style="color:white;margin:0;">Rappel renouvellement abonnements</h2>
      </div>
      <div style="background:white;padding:24px;border-radius:0 0 12px 12px;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <p style="color:#6b7280;">Les abonnements suivants arrivent a renouvellement :</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead>
            <tr style="background:#f9fafb;">
              <th style="padding:8px 12px;text-align:left;color:#6b7280;font-size:12px;">Nom</th>
              <th style="padding:8px 12px;text-align:left;color:#6b7280;font-size:12px;">Categorie</th>
              <th style="padding:8px 12px;text-align:left;color:#6b7280;font-size:12px;">Cout</th>
              <th style="padding:8px 12px;text-align:left;color:#6b7280;font-size:12px;">Date</th>
              <th style="padding:8px 12px;text-align:left;color:#6b7280;font-size:12px;">Dans</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.ADMIN_EMAIL,
      subject: `Rappel : ${toSend.length} abonnement${toSend.length > 1 ? 's' : ''} a renouveler prochainement`,
      html,
    })

    return NextResponse.json({ success: true, alertes: toSend.length })
  } catch (error) {
    console.error('Cron abonnements error:', error)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
