import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('inventaire')
      .select('*, tickets_lies:inventaire_tickets(ticket_id, ticket:tickets(id, ticket_number, title, status, created_at))')
      .eq('id', params.id)
      .single()
    if (error) throw error
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createAdminClient()
    const body = await req.json()

    // Uniquement les champs autorisés
    const allowed = [
      'code_interne', 'site', 'service', 'collaborateur', 'responsable',
      'type_materiel', 'modele', 'marque', 'numero_serie', 'numero_telephone',
      'accessoires', 'date_ajout', 'date_remise', 'date_restitution',
      'statut_inventaire', 'disponibilite', 'etat_remise', 'etat_restitution',
      'commentaires',
    ]

    const updates: Record<string, unknown> = {}
    allowed.forEach(key => {
      if (key in body) {
        // Convertir les chaînes vides en null pour les dates
        updates[key] = body[key] === '' ? null : body[key]
      }
    })

    const { data, error } = await supabase
      .from('inventaire')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (e) {
    console.error('PATCH inventaire error:', e)
    return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('inventaire').delete().eq('id', params.id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 })
  }
}
