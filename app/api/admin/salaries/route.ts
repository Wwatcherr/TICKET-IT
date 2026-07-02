import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function GET() {
  try {
    const supabase = createAdminClient()

    // Get all auth users
    const { data: { users }, error } = await supabase.auth.admin.listUsers()
    if (error) throw error

    // Get admin user IDs to exclude them
    const { data: adminUsers } = await supabase.from('admin_users').select('id')
    const adminIds = new Set(adminUsers?.map(a => a.id) || [])

    // Filter out admins
    const salaries = users
      .filter(u => !adminIds.has(u.id))
      .map(u => ({
        id: u.id,
        email: u.email,
        full_name: u.user_metadata?.full_name || '',
        service: u.user_metadata?.service || '',
        site: u.user_metadata?.site || '',
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        banned: false,
      }))

    return NextResponse.json(salaries)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { user_id } = await req.json()
    const { error } = await supabase.auth.admin.deleteUser(user_id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { email, action } = await req.json()

    if (action === 'reset_password') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${appUrl}/reset-password/confirm`,
      })
      if (error) throw error
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
