'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { STATUS_CONFIG, PRIORITY_CONFIG, CATEGORY_CONFIG, timeAgo, cn } from '@/lib/utils'
import type { Ticket, TicketStatus, TicketPriority, TicketCategory } from '@/types'

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous les statuts' },
  ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({ value: k, label: v.label })),
]
const PRIORITY_OPTIONS = [
  { value: 'all', label: 'Toutes priorités' },
  ...Object.entries(PRIORITY_CONFIG).map(([k, v]) => ({ value: k, label: v.label })),
]
const CATEGORY_OPTIONS = [
  { value: 'all', label: 'Toutes catégories' },
  ...Object.entries(CATEGORY_CONFIG).map(([k, v]) => ({ value: k, label: v.label })),
]

function TicketsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [tickets, setTickets] = useState<Ticket[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [exportLoading, setExportLoading] = useState(false)
  const [page, setPage] = useState(1)

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [status, setStatus] = useState(searchParams.get('status') || 'all')
  const [priority, setPriority] = useState(searchParams.get('priority') || 'all')
  const [category, setCategory] = useState(searchParams.get('category') || 'all')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const perPage = 20

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(perPage),
        sort_by: sortBy,
        sort_order: sortOrder,
      })
      if (search) params.set('search', search)
      if (status !== 'all') params.set('status', status)
      if (priority !== 'all') params.set('priority', priority)
      if (category !== 'all') params.set('category', category)

      const res = await fetch(`/api/tickets?${params}`)
      const data = await res.json()
      setTickets(data.data || [])
      setTotal(data.count || 0)
    } finally {
      setLoading(false)
    }
  }, [page, search, status, priority, category, sortBy, sortOrder])

  useEffect(() => {
    const timeout = setTimeout(fetchTickets, search ? 300 : 0)
    return () => clearTimeout(timeout)
  }, [fetchTickets])

  const handleExport = async (format: 'csv' | 'xlsx') => {
    setExportLoading(true)
    try {
      const params = new URLSearchParams({ format })
      if (status !== 'all') params.set('status', status)
      if (priority !== 'all') params.set('priority', priority)
      const res = await fetch(`/api/admin/export?${params}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tickets-${new Date().toISOString().split('T')[0]}.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExportLoading(false)
    }
  }

  const toggleSort = (field: string) => {
    if (sortBy === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc')
    else { setSortBy(field); setSortOrder('desc') }
    setPage(1)
  }

  const SortIcon = ({ field }: { field: string }) => (
    <span className={cn('ml-1 text-xs', sortBy === field ? 'text-brand-600' : 'text-gray-300')}>
      {sortBy === field ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  )

  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Tickets</h1>
          <p className="text-sm text-gray-500 mt-1">{total} ticket{total > 1 ? 's' : ''} au total</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button className="btn-secondary btn-sm flex items-center gap-1.5 pr-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exporter
            </button>
            {/* Simple dropdown via a group */}
          </div>
          <button onClick={() => handleExport('csv')} className="btn-secondary btn-sm" disabled={exportLoading}>CSV</button>
          <button onClick={() => handleExport('xlsx')} className="btn-secondary btn-sm" disabled={exportLoading}>Excel</button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="form-input pl-9"
              placeholder="Rechercher un ticket, demandeur, numéro..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <select className="form-select w-full sm:w-44" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select className="form-select w-full sm:w-40" value={priority} onChange={e => { setPriority(e.target.value); setPage(1) }}>
            {PRIORITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select className="form-select w-full sm:w-40" value={category} onChange={e => { setCategory(e.target.value); setPage(1) }}>
            {CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {(search || status !== 'all' || priority !== 'all' || category !== 'all') && (
            <button
              className="btn-ghost btn-sm whitespace-nowrap"
              onClick={() => { setSearch(''); setStatus('all'); setPriority('all'); setCategory('all'); setPage(1) }}
            >
              Effacer
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <div className="text-sm text-gray-400">Chargement...</div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="empty-state">
            <div className="text-4xl mb-4">🔍</div>
            <div className="text-gray-500 font-medium mb-1">Aucun ticket trouvé</div>
            <div className="text-sm text-gray-400">Modifiez vos filtres ou créez un nouveau ticket</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="cursor-pointer" onClick={() => toggleSort('ticket_number')}>
                    N° Ticket <SortIcon field="ticket_number" />
                  </th>
                  <th>Titre</th>
                  <th>Demandeur</th>
                  <th className="cursor-pointer" onClick={() => toggleSort('priority')}>
                    Priorité <SortIcon field="priority" />
                  </th>
                  <th className="cursor-pointer" onClick={() => toggleSort('status')}>
                    Statut <SortIcon field="status" />
                  </th>
                  <th>Catégorie</th>
                  <th className="cursor-pointer" onClick={() => toggleSort('created_at')}>
                    Créé <SortIcon field="created_at" />
                  </th>
                  <th>Assigné à</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(ticket => {
                  const status = STATUS_CONFIG[ticket.status]
                  const priority = PRIORITY_CONFIG[ticket.priority]
                  const category = CATEGORY_CONFIG[ticket.category]
                  return (
                    <tr
                      key={ticket.id}
                      className="cursor-pointer hover:bg-brand-50/30 transition-colors"
                      onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
                    >
                      <td>
                        <span className="font-mono text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                          {ticket.ticket_number}
                        </span>
                      </td>
                      <td>
                        <div className="max-w-[220px] truncate font-medium text-gray-900">{ticket.title}</div>
                        <div className="text-xs text-gray-400 truncate max-w-[220px]">{ticket.requester_site}</div>
                      </td>
                      <td>
                        <div className="text-sm font-medium text-gray-700">{ticket.requester_name}</div>
                        <div className="text-xs text-gray-400">{ticket.requester_service}</div>
                      </td>
                      <td>
                        <span className={cn('badge', priority.color, priority.bg)}>
                          {priority.icon} {priority.label}
                        </span>
                      </td>
                      <td>
                        <span className={cn('badge', status.color, status.bg, 'border')}>
                          <span className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
                          {status.label}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-gray-600">{category?.emoji} {category?.label}</span>
                      </td>
                      <td>
                        <span className="text-xs text-gray-500">{timeAgo(ticket.created_at)}</span>
                      </td>
                      <td>
                        {ticket.assigned_user ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-semibold text-brand-700">
                                {(ticket.assigned_user as {full_name?: string})?.full_name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-xs text-gray-600">{(ticket.assigned_user as {full_name?: string})?.full_name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300">Non assigné</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50">
            <div className="text-xs text-gray-500">
              {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} sur {total}
            </div>
            <div className="flex items-center gap-1">
              <button
                className="btn-ghost btn-sm px-2"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                ←
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = i + Math.max(1, page - 2)
                if (p > totalPages) return null
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn('btn-sm px-3 rounded-lg text-xs font-medium', p === page ? 'bg-brand-600 text-white' : 'btn-ghost')}
                  >
                    {p}
                  </button>
                )
              })}
              <button
                className="btn-ghost btn-sm px-2"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TicketsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Chargement...</div>}>
      <TicketsContent />
    </Suspense>
  )
}
