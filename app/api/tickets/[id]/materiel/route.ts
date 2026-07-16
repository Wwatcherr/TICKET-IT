import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createAdminClient()
    const { inventaire_id } = await req.json()

    // Check if already linked
    const { data: existing } = await supabase
      .from('inventaire_tickets')
      .select('id')
      .eq('ticket_id', params.id)
      .eq('inventaire_id', inventaire_id)
      .single()

    if (existing) return NextResponse.json({ error: 'Déjà associé' }, { status: 400 })

    const { error } = await supabase
      .from('inventaire_tickets')
      .insert({ ticket_id: params.id, inventaire_id })

    if (error) throw error

    // Update nb_tickets count
    await supabase.rpc('increment_ticket_count', { p_inventaire_id: inventaire_id })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createAdminClient()
    const { inventaire_id } = await req.json()
    const { error } = await supabase
      .from('inventaire_tickets')
      .delete()
      .eq('ticket_id', params.id)
      .eq('inventaire_id', inventaire_id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
