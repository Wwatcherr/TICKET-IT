import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createAdminClient()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
      { count: totalOpen },
      { count: inProgress },
      { count: urgent },
      { count: resolvedToday },
      { count: totalTickets },
      { data: byStatus },
      { data: byCategory },
      { data: byPriority },
      { data: recentActivity },
      { data: weeklyData },
    ] = await Promise.all([
      supabase.from('tickets').select('*', { count: 'exact', head: true })
        .in('status', ['nouveau', 'en_cours', 'en_attente_utilisateur', 'en_attente_fournisseur']),
      supabase.from('tickets').select('*', { count: 'exact', head: true })
        .eq('status', 'en_cours'),
      supabase.from('tickets').select('*', { count: 'exact', head: true })
        .in('priority', ['urgente', 'bloquante'])
        .not('status', 'in', '("resolu","ferme")'),
      supabase.from('tickets').select('*', { count: 'exact', head: true })
        .eq('status', 'resolu')
        .gte('resolved_at', today.toISOString()),
      supabase.from('tickets').select('*', { count: 'exact', head: true }),
      supabase.from('tickets').select('status').then(({ data }) => ({
        data: data?.reduce((acc: Record<string, number>, t) => {
          acc[t.status] = (acc[t.status] || 0) + 1; return acc
        }, {})
      })),
      supabase.from('tickets').select('category').then(({ data }) => ({
        data: data?.reduce((acc: Record<string, number>, t) => {
          acc[t.category] = (acc[t.category] || 0) + 1; return acc
        }, {})
      })),
      supabase.from('tickets').select('priority').then(({ data }) => ({
        data: data?.reduce((acc: Record<string, number>, t) => {
          acc[t.priority] = (acc[t.priority] || 0) + 1; return acc
        }, {})
      })),
      supabase.from('ticket_activities').select('*, ticket:tickets(ticket_number, title)')
        .order('created_at', { ascending: false }).limit(10),
      // Weekly tickets for chart (last 7 days)
      supabase.from('tickets').select('created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    ])

    // Build weekly chart data
    const weeklyMap: Record<string, number> = {}
    const days = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam']
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const key = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
      weeklyMap[key] = 0
    }
    weeklyData?.forEach((t) => {
      const d = new Date(t.created_at)
      const key = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
      if (key in weeklyMap) weeklyMap[key]++
    })
    const weeklyChart = Object.entries(weeklyMap).map(([date, count]) => ({ date, count }))

    return NextResponse.json({
      stats: {
        total_open: totalOpen || 0,
        in_progress: inProgress || 0,
        urgent: urgent || 0,
        resolved_today: resolvedToday || 0,
        total_tickets: totalTickets || 0,
      },
      by_status: byStatus || {},
      by_category: byCategory || {},
      by_priority: byPriority || {},
      recent_activity: recentActivity || [],
      weekly_chart: weeklyChart,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Erreur stats' }, { status: 500 })
  }
}
