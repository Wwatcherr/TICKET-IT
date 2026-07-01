import nodemailer from 'nodemailer'
import { Ticket, TicketMessage } from '@/types'
import { STATUS_CONFIG, PRIORITY_CONFIG, formatDateTime } from '@/lib/utils'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Mon Entreprise'
const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER

function baseTemplate(content: string, preheader = '') {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>IT Helpdesk</title>
</head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#4f46e5,#6366f1);border-radius:12px 12px 0 0;padding:28px 36px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                    🛠️ IT Helpdesk
                  </div>
                  <div style="font-size:13px;color:rgba(255,255,255,0.75);margin-top:4px;">${companyName}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:36px;border-radius:0 0 12px 12px;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 0 0;text-align:center;color:#9ca3af;font-size:12px;">
            <p style="margin:0 0 4px;">Ce message est envoyé automatiquement — merci de ne pas y répondre directement.</p>
            <p style="margin:0;">© ${new Date().getFullYear()} ${companyName} · IT Helpdesk</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function ticketBadge(ticket: Ticket) {
  const priority = PRIORITY_CONFIG[ticket.priority]
  const status = STATUS_CONFIG[ticket.status]
  return `
    <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;width:100%;">
      <tr>
        <td style="background:#f8f9ff;border:1px solid #e0e7ff;border-radius:10px;padding:20px;">
          <div style="font-size:13px;color:#6366f1;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">
            Ticket ${ticket.ticket_number}
          </div>
          <div style="font-size:18px;font-weight:700;color:#111827;margin-bottom:12px;">${ticket.title}</div>
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-right:16px;">
                <span style="font-size:12px;font-weight:600;padding:3px 10px;border-radius:20px;background:#fef3c7;color:#d97706;">
                  ${priority.icon} ${priority.label}
                </span>
              </td>
              <td>
                <span style="font-size:12px;font-weight:600;padding:3px 10px;border-radius:20px;background:#ede9fe;color:#7c3aed;">
                  ${status.label}
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}

function ctaButton(url: string, label: string) {
  return `
    <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td style="background:linear-gradient(135deg,#4f46e5,#6366f1);border-radius:8px;">
          <a href="${url}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.2px;">
            ${label} →
          </a>
        </td>
      </tr>
    </table>`
}

// ── Email: confirmation ticket créé (côté demandeur) ──────────────────────────
export async function sendTicketConfirmation(ticket: Ticket) {
  if (!ticket.email_consent) return

  const html = baseTemplate(
    `
    <h2 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;">Demande reçue ✅</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">
      Bonjour <strong>${ticket.requester_name}</strong>, votre ticket a bien été enregistré.
      Notre équipe informatique va traiter votre demande dans les meilleurs délais.
    </p>
    ${ticketBadge(ticket)}
    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;">
      <tr>
        <td width="50%" style="padding:0 8px 16px 0;vertical-align:top;">
          <div style="font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Catégorie</div>
          <div style="font-size:14px;color:#374151;font-weight:500;">${ticket.category}</div>
        </td>
        <td width="50%" style="padding:0 0 16px 8px;vertical-align:top;">
          <div style="font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Date de la demande</div>
          <div style="font-size:14px;color:#374151;font-weight:500;">${formatDateTime(ticket.created_at)}</div>
        </td>
      </tr>
    </table>
    <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:24px;">
      <div style="font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;margin-bottom:8px;">Votre description</div>
      <div style="font-size:14px;color:#374151;line-height:1.6;">${ticket.description}</div>
    </div>
    <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">
      Conservez votre numéro de ticket <strong style="color:#4f46e5;">${ticket.ticket_number}</strong> pour toute communication.
      Vous recevrez un e-mail à chaque mise à jour de votre demande.
    </p>
    ${ctaButton(`${appUrl}/ticket/${ticket.ticket_number}`, 'Suivre mon ticket en ligne')}`,
    `Votre ticket ${ticket.ticket_number} a bien été enregistré`
  )

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: ticket.requester_email,
    subject: `[Ticket IT ${ticket.ticket_number}] Votre demande a bien été enregistrée`,
    html,
    replyTo: `helpdesk+${ticket.id}@${process.env.SMTP_USER?.split('@')[1] || 'entreprise.fr'}`,
  })
}

// ── Email: notification admin nouveau ticket ──────────────────────────────────
export async function sendNewTicketNotification(ticket: Ticket) {
  const html = baseTemplate(
    `
    <h2 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;">Nouveau ticket 🎫</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">
      Un nouveau ticket vient d'être créé et nécessite votre attention.
    </p>
    ${ticketBadge(ticket)}
    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;">
      <tr>
        <td width="50%" style="padding:0 8px 16px 0;vertical-align:top;">
          <div style="font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;margin-bottom:4px;">Demandeur</div>
          <div style="font-size:14px;color:#374151;font-weight:500;">${ticket.requester_name}</div>
          <div style="font-size:13px;color:#6b7280;">${ticket.requester_email}</div>
        </td>
        <td width="50%" style="padding:0 0 16px 8px;vertical-align:top;">
          <div style="font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;margin-bottom:4px;">Service / Site</div>
          <div style="font-size:14px;color:#374151;font-weight:500;">${ticket.requester_service}</div>
          <div style="font-size:13px;color:#6b7280;">${ticket.requester_site}</div>
        </td>
      </tr>
    </table>
    ${ctaButton(`${appUrl}/admin/tickets/${ticket.id}`, 'Traiter ce ticket')}`,
    `Nouveau ticket ${ticket.ticket_number} — ${ticket.priority.toUpperCase()}`
  )

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: adminEmail,
    subject: `[Ticket IT ${ticket.ticket_number}] Nouveau ticket — ${ticket.requester_name}`,
    html,
  })
}

// ── Email: réponse admin → utilisateur ───────────────────────────────────────
export async function sendAdminReply(ticket: Ticket, message: TicketMessage) {
  if (!ticket.email_consent) return

  const html = baseTemplate(
    `
    <h2 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;">Nouvelle réponse 💬</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">
      Bonjour <strong>${ticket.requester_name}</strong>, l'équipe informatique a répondu à votre ticket.
    </p>
    ${ticketBadge(ticket)}
    <div style="border-left:3px solid #6366f1;padding:16px 20px;background:#f8f9ff;border-radius:0 8px 8px 0;margin-bottom:24px;">
      <div style="font-size:12px;color:#6366f1;font-weight:600;margin-bottom:8px;">
        ${message.author_name} · ${formatDateTime(message.created_at)}
      </div>
      <div style="font-size:15px;color:#374151;line-height:1.7;white-space:pre-wrap;">${message.content}</div>
    </div>
    <p style="margin:0 0 16px;color:#6b7280;font-size:14px;">
      Vous pouvez répondre directement à cet e-mail, votre réponse sera automatiquement ajoutée à votre ticket.
    </p>`,
    `Réponse à votre ticket ${ticket.ticket_number}`
  )

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: ticket.requester_email,
    subject: `[Ticket IT ${ticket.ticket_number}] Réponse de l'équipe IT`,
    html,
    replyTo: `helpdesk+${ticket.id}@${process.env.SMTP_USER?.split('@')[1] || 'entreprise.fr'}`,
  })
}

// ── Email: changement de statut ───────────────────────────────────────────────
export async function sendStatusChange(ticket: Ticket, oldStatus: string, newStatus: string) {
  if (!ticket.email_consent) return

  const statusLabel = STATUS_CONFIG[ticket.status as keyof typeof STATUS_CONFIG]?.label || newStatus
  const isClosed = ticket.status === 'ferme' || ticket.status === 'resolu'

  const html = baseTemplate(
    `
    <h2 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;">
      Statut mis à jour ${isClosed ? '✅' : '🔄'}
    </h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">
      Bonjour <strong>${ticket.requester_name}</strong>, le statut de votre ticket a été mis à jour.
    </p>
    ${ticketBadge(ticket)}
    <div style="text-align:center;padding:24px;background:#f9fafb;border-radius:10px;margin-bottom:24px;">
      <div style="font-size:13px;color:#9ca3af;margin-bottom:12px;">Nouveau statut</div>
      <div style="font-size:20px;font-weight:700;color:#4f46e5;">${statusLabel}</div>
    </div>
    ${isClosed
      ? `<p style="margin:0;color:#6b7280;font-size:14px;text-align:center;">Votre demande a été traitée. Si le problème persiste, n'hésitez pas à créer un nouveau ticket.</p>`
      : `<p style="margin:0;color:#6b7280;font-size:14px;text-align:center;">Notre équipe continue de traiter votre demande. Vous serez notifié(e) à chaque étape.</p>`
    }`,
    `Ticket ${ticket.ticket_number} — ${statusLabel}`
  )

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: ticket.requester_email,
    subject: `[Ticket IT ${ticket.ticket_number}] Statut mis à jour : ${statusLabel}`,
    html,
    replyTo: `helpdesk+${ticket.id}@${process.env.SMTP_USER?.split('@')[1] || 'entreprise.fr'}`,
  })
}
