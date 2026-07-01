import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createAdminClient()
    const body = await req.json()
    const { content, author_id } = body

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Note vide' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('ticket_notes')
      .insert({ ticket_id: params.id, content, author_id })
      .select('*, author:admin_users(id, full_name)')
      .single()

    if (error) throw error

    await supabase.from('ticket_activities').insert({
      ticket_id: params.id,
      action: 'Note interne ajoutée',
      performed_by: data.author?.full_name || 'Admin',
    })

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
