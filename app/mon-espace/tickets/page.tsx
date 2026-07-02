'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { STATUS_CONFIG, PRIORITY_CONFIG, CATEGORY_CONFIG, timeAgo, cn } from '@/lib/utils'
import type { Ticket } from '@/types'

export default function MesTicketsPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Mon Entreprise'

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/login'); return }
      setUserEmail(session.user.email || '')

      const { data } = await supabase
        .from('tickets')
        .select('*')
        .eq('requester_email', session.user.email)
        .order('created_at', { ascending: false })

      setTickets(data || [])
      setLoading(false)
    })
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <span className="text-base">🛠️</span>
            </div>
            <span className="font-semibold text-gray-800">IT Helpdesk</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 hidden sm:block">{userEmail}</span>
            <button onClick={handleSignOut} className="btn-secondary btn-sm text-red-600 border-red-200 hover:bg-red-50">
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes tickets</h1>
            <p className="text-sm text-gray-500 mt-1">{tickets.length} demande{tickets.length > 1 ? 's' : ''}</p>
          </div>
          <Link href="/ticket/new" className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouveau ticket
          </Link>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && tickets.length === 0 && (
          <div className="empty-state card py-16">
            <div className="text-4xl mb-4">🎫</div>
            <div className="font-medium text-gray-700 mb-1">Aucun ticket pour le moment</div>
            <div className="text-sm text-gray-400 mb-6">Créez votre première demande IT</div>
            <Link href="/ticket/new" className="btn-primary">Créer un ticket</Link>
          </div>
        )}

        <div className="space-y-3">
          {tickets.map(ticket => {
            const status = STATUS_CONFIG[ticket.status]
            const priority = PRIORITY_CONFIG[ticket.priority]
            const category = CATEGORY_CONFIG[ticket.category]
            return (
              <Link
                key={ticket.id}
                href={`/ticket/${ticket.ticket_number}`}
                className="card p-5 flex items-start gap-4 hover:shadow-soft hover:border-brand-200 transition-all cursor-pointer block"
              >
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
                  {category?.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-xs font-mono font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded mr-2">
                        {ticket.ticket_number}
                      </span>
                      <span className="font-semibold text-gray-900 text-sm">{ticket.title}</span>
                    </div>
                    <span className={cn('badge border flex-shrink-0', status.color, status.bg)}>
                      <span className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
                      {status.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate mb-2">{ticket.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className={cn('font-medium', priority.color)}>{priority.icon} {priority.label}</span>
                    <span>·</span>
                    <span>{timeAgo(ticket.created_at)}</span>
                  </div>
                </div>
                <svg className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
