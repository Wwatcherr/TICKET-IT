import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendStatusChange } from '@/lib/email'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        assigned_user:admin_users(id, full_name, email, role),
        messages:ticket_messages(*),
        notes:ticket_notes(*, author:admin_users(id, full_name)),
        activities:ticket_activities(*)
      `)
      .eq('id', params.id)
      .order('created_at', { referencedTable: 'ticket_messages', ascending: true })
      .order('created_at', { referencedTable: 'ticket_activities', ascending: true })
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Ticket introuvable' }, { status: 404 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createAdminClient()
    const body = await req.json()
    const { performed_by, ...updates } = body

    // Get current ticket for comparison
    const { data: currentTicket } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', params.id)
      .single()

    if (!currentTicket) return NextResponse.json({ error: 'Ticket introuvable' }, { status: 404 })

    // Add resolved/closed timestamps
    if (updates.status === 'resolu' && !currentTicket.resolved_at) {
      updates.resolved_at = new Date().toISOString()
    }
    if (updates.status === 'ferme' && !currentTicket.closed_at) {
      updates.closed_at = new Date().toISOString()
    }

    const { data: ticket, error } = await supabase
      .from('tickets')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    // Log activities
    const activities = []
    if (updates.status && updates.status !== currentTicket.status) {
      activities.push({
        ticket_id: params.id,
        action: 'Statut modifié',
        old_value: currentTicket.status,
        new_value: updates.status,
        performed_by: performed_by || 'Admin',
      })
    }
    if (updates.priority && updates.priority !== currentTicket.priority) {
      activities.push({
        ticket_id: params.id,
        action: 'Priorité modifiée',
        old_value: currentTicket.priority,
        new_value: updates.priority,
        performed_by: performed_by || 'Admin',
      })
    }
    if (updates.assigned_to !== undefined && updates.assigned_to !== currentTicket.assigned_to) {
      activities.push({
        ticket_id: params.id,
        action: 'Technicien assigné',
        new_value: updates.assigned_to,
        performed_by: performed_by || 'Admin',
      })
    }

    if (activities.length > 0) {
      await supabase.from('ticket_activities').insert(activities)
    }

    // Send email on status change
    if (updates.status && updates.status !== currentTicket.status) {
      try {
        await sendStatusChange(ticket, currentTicket.status, updates.status)
      } catch (emailErr) {
        console.error('Email error:', emailErr)
      }
    }

    return NextResponse.json(ticket)
  } catch (error) {
    console.error('Update ticket error:', error)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('tickets').delete().eq('id', params.id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 })
  }
}
