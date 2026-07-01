import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendAdminReply } from '@/lib/email'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createAdminClient()
    const body = await req.json()
    const { content, author_name, author_email, author_role = 'admin', attachments } = body

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Le message est vide' }, { status: 400 })
    }

    // Get ticket
    const { data: ticket } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', params.id)
      .single()

    if (!ticket) return NextResponse.json({ error: 'Ticket introuvable' }, { status: 404 })

    // Insert message
    const { data: message, error } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: params.id,
        content,
        author_name,
        author_email,
        author_role,
        attachments: attachments || null,
        is_email_reply: false,
      })
      .select()
      .single()

    if (error) throw error

    // Update ticket updated_at + status if admin replies to a "waiting" ticket
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (author_role !== 'user' && ticket.status === 'nouveau') {
      updates.status = 'en_cours'
    }
    await supabase.from('tickets').update(updates).eq('id', params.id)

    // Log activity
    await supabase.from('ticket_activities').insert({
      ticket_id: params.id,
      action: author_role === 'user' ? 'Réponse du demandeur' : 'Réponse de l\'équipe IT',
      performed_by: author_name,
    })

    // Send email if admin replied
    if (author_role !== 'user' && ticket.email_consent) {
      try {
        await sendAdminReply(ticket, message)
      } catch (emailErr) {
        console.error('Email error:', emailErr)
      }
    }

    return NextResponse.json(message)
  } catch (error) {
    console.error('Message error:', error)
    return NextResponse.json({ error: 'Erreur envoi message' }, { status: 500 })
  }
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', params.id)
      .order('created_at', { ascending: true })

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
