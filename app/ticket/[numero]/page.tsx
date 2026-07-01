'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { STATUS_CONFIG, PRIORITY_CONFIG, CATEGORY_CONFIG, formatDateTime, cn } from '@/lib/utils'
import type { Ticket, TicketMessage } from '@/types'

type PublicTicket = Ticket & { messages: TicketMessage[] }

export default function TicketStatusPage() {
  const { numero } = useParams()
  const [ticket, setTicket] = useState<PublicTicket | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Mon Entreprise'

  useEffect(() => {
    fetch(`/api/tickets/public/${numero}`)
      .then(r => {
        if (!r.ok) { setNotFound(true); return null }
        return r.json()
      })
      .then(data => { if (data) setTicket(data) })
      .finally(() => setLoading(false))
  }, [numero])

  const sendReply = async () => {
    if (!reply.trim() || !ticket) return
    setSending(true)
    try {
      await fetch(`/api/tickets/${ticket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: reply,
          author_name: ticket.requester_name,
          author_email: ticket.requester_email,
          author_role: 'user',
        }),
      })
      setReply('')
      setSent(true)
      // Reload ticket to show new message
      const res = await fetch(`/api/tickets/public/${numero}`)
      if (res.ok) setTicket(await res.json())
      setTimeout(() => setSent(false), 3000)
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <span className="text-base">🛠️</span>
            </div>
            <span className="font-semibold text-gray-800">IT Helpdesk</span>
          </Link>
          <span className="text-xs text-gray-400">{companyName}</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {notFound && !loading && (
          <div className="text-center py-20 animate-fade-in">
            <div className="text-5xl mb-4">🔍</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Ticket introuvable</h1>
            <p className="text-gray-500 mb-6">Le numéro de ticket <strong>{numero}</strong> n'existe pas ou a été supprimé.</p>
            <Link href="/ticket/new" className="btn-primary">Créer un nouveau ticket</Link>
          </div>
        )}

        {ticket && !loading && (() => {
          const status = STATUS_CONFIG[ticket.status]
          const priority = PRIORITY_CONFIG[ticket.priority]
          const category = CATEGORY_CONFIG[ticket.category]
          const isClosed = ticket.status === 'ferme' || ticket.status === 'resolu'

          return (
            <div className="space-y-5 animate-fade-in">
              {/* Ticket header */}
              <div className="card p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">
                      {ticket.ticket_number}
                    </div>
                    <h1 className="text-lg font-bold text-gray-900">{ticket.title}</h1>
                  </div>
                  <span className={cn('badge border flex-shrink-0', status.color, status.bg)}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
                    {status.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5">Priorité</div>
                    <span className={cn('badge', priority.color, priority.bg)}>
                      {priority.icon} {priority.label}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5">Catégorie</div>
                    <span className="text-gray-700">{category?.emoji} {category?.label}</span>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5">Demandeur</div>
                    <span className="text-gray-700 font-medium">{ticket.requester_name}</span>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5">Créé le</div>
                    <span className="text-gray-700">{formatDateTime(ticket.created_at)}</span>
                  </div>
                </div>

                {isClosed && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
                    <span>✅</span>
                    <span>Ce ticket a été {ticket.status === 'resolu' ? 'résolu' : 'fermé'}. Si le problème persiste, créez un nouveau ticket.</span>
                  </div>
                )}
              </div>

              {/* Conversation */}
              <div className="card p-6">
                <div className="text-sm font-semibold text-gray-700 mb-4">💬 Conversation</div>
                <div className="space-y-4">
                  {/* Initial description */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold text-gray-600">
                      {ticket.requester_name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-800">{ticket.requester_name}</span>
                          <span className="text-xs text-gray-400">{formatDateTime(ticket.created_at)}</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  {ticket.messages?.map(msg => {
                    const isAdmin = msg.author_role !== 'user'
                    return (
                      <div key={msg.id} className={cn('flex gap-3', isAdmin && 'flex-row-reverse')}>
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold',
                          isAdmin ? 'bg-brand-100 text-brand-700' : 'bg-gray-200 text-gray-600'
                        )}>
                          {msg.author_name.charAt(0)}
                        </div>
                        <div className={cn('flex-1 max-w-[85%]', isAdmin && 'flex flex-col items-end')}>
                          <div className={cn(
                            'rounded-xl p-4',
                            isAdmin ? 'bg-brand-600 text-white' : 'bg-gray-50 border border-gray-100 text-gray-800'
                          )}>
                            <div className={cn('flex items-center justify-between mb-2 gap-4', isAdmin && 'flex-row-reverse')}>
                              <span className={cn('text-xs font-semibold', isAdmin ? 'text-brand-200' : 'text-gray-700')}>
                                {isAdmin ? '🛠️ Équipe IT' : msg.author_name}
                              </span>
                              <span className={cn('text-xs', isAdmin ? 'text-brand-300' : 'text-gray-400')}>
                                {formatDateTime(msg.created_at)}
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {ticket.messages?.length === 0 && (
                    <div className="text-center py-6 text-sm text-gray-400">
                      Aucune réponse pour le moment. L'équipe IT va traiter votre demande.
                    </div>
                  )}
                </div>

                {/* Reply box - only if not closed */}
                {!isClosed && (
                  <div className="mt-6 pt-5 border-t border-gray-100">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Ajouter un message</div>
                    <textarea
                      className="form-textarea mb-3"
                      rows={3}
                      placeholder="Apportez des précisions ou répondez à l'équipe IT..."
                      value={reply}
                      onChange={e => setReply(e.target.value)}
                    />
                    <div className="flex items-center justify-between">
                      {sent && <span className="text-sm text-green-600">✓ Message envoyé !</span>}
                      {!sent && <span />}
                      <button className="btn-primary" onClick={sendReply} disabled={!reply.trim() || sending}>
                        {sending ? 'Envoi...' : 'Envoyer'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center">
                <Link href="/ticket/new" className="text-sm text-brand-600 hover:underline">
                  + Créer un nouveau ticket
                </Link>
              </div>
            </div>
          )
        })()}
      </div>
    </main>
  )
}
