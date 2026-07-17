import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''
    const statut = searchParams.get('statut') || ''
    const site = searchParams.get('site') || ''

    let query = supabase
      .from('inventaire')
      .select('*')
      .order('code_interne', { ascending: true })

    if (search) query = query.or(`code_interne.ilike.%${search}%,collaborateur.ilike.%${search}%,numero_serie.ilike.%${search}%,modele.ilike.%${search}%,marque.ilike.%${search}%`)
    if (type && type !== 'all') query = query.eq('type_materiel', type)
    if (statut && statut !== 'all') query = query.eq('statut_inventaire', statut)
    if (site && site !== 'all') query = query.eq('site', site)

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

function sanitize(body: Record<string, unknown>): Record<string, unknown> {
  const dateFields = ['date_ajout', 'date_remise', 'date_restitution']
  const result: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(body)) {
    if (dateFields.includes(k)) {
      result[k] = v === '' || v === null || v === undefined ? null : v
    } else {
      result[k] = v === '' ? null : v
    }
  }
  return result
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await req.json()
    const clean = sanitize(body)

    const { data, error } = await supabase
      .from('inventaire')
      .insert(clean)
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      throw error
    }
    return NextResponse.json(data)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erreur création'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
