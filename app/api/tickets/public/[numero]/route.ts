import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(_: NextRequest, { params }: { params: { numero: string } }) {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('tickets')
      .select(`
        id, ticket_number, title, description, status, priority, category,
        requester_name, requester_email, requester_service, requester_site,
        equipment, created_at, updated_at, resolved_at, attachments,
        messages:ticket_messages(id, author_name, author_role, content, created_at)
      `)
      .eq('ticket_number', params.numero)
      .order('created_at', { referencedTable: 'ticket_messages', ascending: true })
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Ticket introuvable' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
