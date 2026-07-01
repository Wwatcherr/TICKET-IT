import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import * as XLSX from 'xlsx'
import { STATUS_CONFIG, PRIORITY_CONFIG, CATEGORY_CONFIG, formatDateTime } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(req.url)
    const format = searchParams.get('format') || 'csv'
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    let query = supabase.from('tickets').select('*, assigned_user:admin_users(full_name)').order('created_at', { ascending: false })
    if (status && status !== 'all') query = query.eq('status', status)
    if (priority && priority !== 'all') query = query.eq('priority', priority)

    const { data: tickets, error } = await query
    if (error) throw error

    const rows = tickets?.map(t => ({
      'N° Ticket': t.ticket_number,
      'Titre': t.title,
      'Statut': STATUS_CONFIG[t.status as keyof typeof STATUS_CONFIG]?.label || t.status,
      'Priorité': PRIORITY_CONFIG[t.priority as keyof typeof PRIORITY_CONFIG]?.label || t.priority,
      'Catégorie': CATEGORY_CONFIG[t.category as keyof typeof CATEGORY_CONFIG]?.label || t.category,
      'Demandeur': t.requester_name,
      'Email': t.requester_email,
      'Service': t.requester_service,
      'Site': t.requester_site,
      'Matériel': t.equipment || '',
      'Technicien assigné': t.assigned_user?.full_name || 'Non assigné',
      'Créé le': formatDateTime(t.created_at),
      'Mis à jour': formatDateTime(t.updated_at),
      'Résolu le': t.resolved_at ? formatDateTime(t.resolved_at) : '',
      'Description': t.description,
    })) || []

    if (format === 'xlsx') {
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(rows)

      // Column widths
      ws['!cols'] = [
        { wch: 16 }, { wch: 40 }, { wch: 20 }, { wch: 12 }, { wch: 15 },
        { wch: 22 }, { wch: 30 }, { wch: 18 }, { wch: 18 }, { wch: 20 },
        { wch: 22 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 60 },
      ]

      XLSX.utils.book_append_sheet(wb, ws, 'Tickets')
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="tickets-${new Date().toISOString().split('T')[0]}.xlsx"`,
        },
      })
    }

    // CSV
    const headers = Object.keys(rows[0] || {})
    const csvRows = [
      headers.join(';'),
      ...rows.map(r => headers.map(h => `"${String(r[h as keyof typeof r] || '').replace(/"/g, '""')}"`).join(';')),
    ]
    const csv = '\uFEFF' + csvRows.join('\n') // BOM for Excel UTF-8

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="tickets-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Erreur export' }, { status: 500 })
  }
}
