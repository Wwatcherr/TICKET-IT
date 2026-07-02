import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const supabase = createAdminClient()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: allTickets } = await supabase.from('tickets').select('status, priority, category, created_at, resolved_at')
    const { data: recentActivity } = await supabase.from('ticket_activities')
      .select('*, ticket:tickets(ticket_number, title)')
      .order('created_at', { ascending: false })
      .limit(10)

    const tickets = allTickets || []

    const openStatuses = ['nouveau', 'en_cours', 'en_attente_utilisateur', 'en_attente_fournisseur']
    const totalOpen = tickets.filter(t => openStatuses.includes(t.status)).length
    const inProgress = tickets.filter(t => t.status === 'en_cours').length
    const urgent = tickets.filter(t => ['urgente', 'bloquante'].includes(t.priority) && !['resolu', 'ferme'].includes(t.status)).length
    const resolvedToday = tickets.filter(t => t.status === 'resolu' && t.resolved_at && new Date(t.resolved_at) >= today).length

    const byStatus = tickets.reduce((acc: Record<string, number>, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1; return acc
    }, {})

    const byCategory = tickets.reduce((acc: Record<string, number>, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1; return acc
    }, {})

    const byPriority = tickets.reduce((acc: Record<string, number>, t) => {
      acc[t.priority] = (acc[t.priority] || 0) + 1; return acc
    }, {})

    // Weekly chart
    const weeklyMap: Record<string, number> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const key = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
      weeklyMap[key] = 0
    }
    tickets.forEach(t => {
      const d = new Date(t.created_at)
      const key = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
      if (key in weeklyMap) weeklyMap[key]++
    })
    const weeklyChart = Object.entries(weeklyMap).map(([date, count]) => ({ date, count }))

    return NextResponse.json({
      stats: {
        total_open: totalOpen,
        in_progress: inProgress,
        urgent,
        resolved_today: resolvedToday,
        total_tickets: tickets.length,
      },
      by_status: byStatus,
      by_category: byCategory,
      by_priority: byPriority,
      recent_activity: recentActivity || [],
      weekly_chart: weeklyChart,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Erreur stats' }, { status: 500 })
  }
}
