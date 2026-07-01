'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  STATUS_CONFIG, PRIORITY_CONFIG, CATEGORY_CONFIG,
  formatDateTime, timeAgo, cn
} from '@/lib/utils'
import type { Ticket, TicketMessage, TicketNote, TicketStatus, TicketPriority, AdminUser } from '@/types'
import { createClient } from '@/lib/supabase/client'

type TicketActivity = {
  id: string
  action: string
  old_value?: string
  new_value?: string
  performed_by: string
  created_at: string
}

type FullTicket = Ticket & {
  messages: TicketMessage[]
  notes: TicketNote[]
  activities: TicketActivity[]
}

export default function TicketDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [ticket, setTicket] = useState<FullTicket | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'conversation' | 'notes' | 'history'>('conversation')
  const [reply, setReply] = useState('')
  const [note, setNote] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [technicians, setTechnicians] = useState<AdminUser[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      const { data } = await supabase.from('admin_users').select('*').eq('id', session.user.id).single()
      if (data) setAdminUser(data)
    })
    supabase.from('admin_users').select('*').then(({ data }) => setTechnicians(data || []))
  }, [])

  const loadTicket = async () => {
    try {
      const res = await fetch(`/api/tickets/${id}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setTicket(data)
    } catch {
      toast.error('Ticket introuvable')
      router.push('/admin/tickets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTicket() }, [id])

  useEffect(() => {
    if (activeTab === 'conversation') {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }, [ticket?.messages, activeTab])

  const updateTicket = async (updates: Partial<Ticket>) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, performed_by: adminUser?.full_name || 'Admin' }),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setTicket(prev => prev ? { ...prev, ...updated } : null)
      await loadTicket()
      toast.success('Ticket mis à jour')
    } catch {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  const sendMessage = async () => {
    if (!reply.trim()) return
    setSendingMessage(true)
    try {
      const res = await fetch(`/api/tickets/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: reply,
          author_name: adminUser?.full_name || 'Admin IT',
          author_email: adminUser?.email || '',
          author_role: adminUser?.role || 'admin',
        }),
      })
      if (!res.ok) throw new Error()
      setReply('')
      await loadTicket()
      toast.success('Message envoyé')
    } catch {
      toast.error('Erreur envoi message')
    } finally {
      setSendingMessage(false)
    }
  }

  const addNote = async () => {
    if (!note.trim() || !adminUser) return
    try {
      const res = await fetch(`/api/tickets/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: note, author_id: adminUser.id }),
      })
      if (!res.ok) throw new Error()
      setNote('')
      await loadTicket()
      toast.success('Note ajoutée')
    } catch {
      toast.error('Erreur ajout note')
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!ticket) return null

  const status = STATUS_CONFIG[ticket.status]
  const priority = PRIORITY_CONFIG[ticket.priority]
  const category = CATEGORY_CONFIG[ticket.category]

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden animate-fade-in">
      {/* Main panel */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="p-6 lg:p-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/admin/tickets" className="hover:text-gray-700">Tickets</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{ticket.ticket_number}</span>
          </div>

          {/* Title & meta */}
          <div className="mb-6">
            <div className="flex items-start gap-3 mb-3">
              <span className={cn('badge border mt-1', status.color, status.bg)}>
                <span className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
                {status.label}
              </span>
              <span className={cn('badge mt-1', priority.color, priority.bg)}>
                {priority.icon} {priority.label}
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">{ticket.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span>📋 {category?.emoji} {category?.label}</span>
              <span>·</span>
              <span>👤 {ticket.requester_name}</span>
              <span>·</span>
              <span>🕐 {timeAgo(ticket.created_at)}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-100 mb-6">
            <div className="flex gap-6">
              {[
                { key: 'conversation', label: 'Conversation', count: ticket.messages?.length },
                { key: 'notes', label: 'Notes internes', count: ticket.notes?.length },
                { key: 'history', label: 'Historique', count: ticket.activities?.length },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={cn(
                    'pb-3 text-sm font-medium border-b-2 transition-all flex items-center gap-1.5',
                    activeTab === tab.key
                      ? 'border-brand-500 text-brand-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  )}
                >
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-1.5 py-0.5">{tab.count}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation */}
          {activeTab === 'conversation' && (
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
                    {ticket.equipment && (
                      <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                        💻 Matériel : <strong>{ticket.equipment}</strong>
                      </div>
                    )}
                    {ticket.attachments && ticket.attachments.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="text-xs text-gray-500 mb-2">📎 Pièces jointes</div>
                        <div className="flex flex-wrap gap-2">
                          {ticket.attachments.map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noopener" className="text-xs text-brand-600 hover:underline bg-brand-50 px-2 py-1 rounded">
                              Fichier {i + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
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
                    <div className={cn('flex-1 max-w-[80%]', isAdmin && 'items-end flex flex-col')}>
                      <div className={cn(
                        'rounded-xl p-4',
                        isAdmin ? 'bg-brand-600 text-white' : 'bg-gray-50 border border-gray-100 text-gray-800'
                      )}>
                        <div className={cn('flex items-center justify-between mb-2 gap-4', isAdmin && 'flex-row-reverse')}>
                          <span className={cn('text-xs font-semibold', isAdmin ? 'text-brand-200' : 'text-gray-700')}>
                            {msg.author_name} {isAdmin && '· IT'}
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
              <div ref={messagesEndRef} />

              {/* Reply box */}
              <div className="card p-4 mt-6">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Répondre au demandeur</div>
                <textarea
                  className="form-textarea mb-3"
                  rows={4}
                  placeholder="Écrivez votre réponse... Le demandeur la recevra par e-mail."
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <span>📧</span>
                    <span>Le demandeur sera notifié par e-mail</span>
                  </div>
                  <button
                    className="btn-primary"
                    onClick={sendMessage}
                    disabled={!reply.trim() || sendingMessage}
                  >
                    {sendingMessage ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                    Envoyer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notes internes */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
                <span className="text-base">🔒</span>
                <span>Les notes internes sont visibles uniquement par l'équipe IT. Elles ne sont pas envoyées au demandeur.</span>
              </div>

              {ticket.notes?.length === 0 && (
                <div className="empty-state py-10">
                  <div className="text-3xl mb-3">📝</div>
                  <div className="text-gray-500">Aucune note interne</div>
                </div>
              )}

              {ticket.notes?.map(n => (
                <div key={n.id} className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-amber-800">{(n.author as { full_name?: string })?.full_name || 'Admin'}</span>
                    <span className="text-xs text-amber-600">{formatDateTime(n.created_at)}</span>
                  </div>
                  <p className="text-sm text-amber-900 whitespace-pre-wrap">{n.content}</p>
                </div>
              ))}

              <div className="card p-4">
                <textarea
                  className="form-textarea mb-3"
                  rows={3}
                  placeholder="Ajouter une note interne..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />
                <button className="btn-secondary" onClick={addNote} disabled={!note.trim()}>
                  Ajouter la note
                </button>
              </div>
            </div>
          )}

          {/* Historique */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {ticket.activities?.length === 0 && (
                <div className="empty-state py-10">
                  <div className="text-3xl mb-3">📋</div>
                  <div className="text-gray-500">Aucune activité enregistrée</div>
                </div>
              )}
              {[...ticket.activities || []].reverse().map(a => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-700">
                      <strong>{a.performed_by}</strong> — {a.action}
                      {a.old_value && a.new_value && (
                        <span className="text-gray-500">
                          {' '}(<span className="line-through">{a.old_value}</span> → <strong>{a.new_value}</strong>)
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{formatDateTime(a.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right sidebar - ticket actions */}
      <div className="w-full lg:w-72 xl:w-80 border-t lg:border-t-0 lg:border-l border-gray-100 overflow-y-auto bg-white flex-shrink-0">
        <div className="p-5 space-y-5">
          {/* Status */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Statut</label>
            <select
              className="form-select"
              value={ticket.status}
              onChange={e => updateTicket({ status: e.target.value as TicketStatus })}
              disabled={saving}
            >
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Priorité</label>
            <select
              className="form-select"
              value={ticket.priority}
              onChange={e => updateTicket({ priority: e.target.value as TicketPriority })}
              disabled={saving}
            >
              {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.icon} {v.label}</option>
              ))}
            </select>
          </div>

          {/* Assigned to */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Assigné à</label>
            <select
              className="form-select"
              value={ticket.assigned_to || ''}
              onChange={e => updateTicket({ assigned_to: e.target.value || undefined })}
              disabled={saving}
            >
              <option value="">Non assigné</option>
              {technicians.map(t => (
                <option key={t.id} value={t.id}>{t.full_name}</option>
              ))}
            </select>
          </div>

          <div className="divider" />

          {/* Ticket info */}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Informations</div>
            <div className="space-y-2.5 text-sm">
              {[
                { label: 'Demandeur', value: ticket.requester_name },
                { label: 'E-mail', value: ticket.requester_email },
                { label: 'Service', value: ticket.requester_service },
                { label: 'Site', value: ticket.requester_site },
                { label: 'Catégorie', value: `${category?.emoji} ${category?.label}` },
                { label: 'Créé le', value: formatDateTime(ticket.created_at) },
                ticket.equipment && { label: 'Matériel', value: ticket.equipment },
                ticket.affected_person && { label: 'Personne concernée', value: ticket.affected_person },
              ].filter(Boolean).map((item) => (
                item && (
                  <div key={item.label} className="flex items-start gap-2">
                    <span className="text-gray-400 flex-shrink-0 w-24 text-xs pt-0.5">{item.label}</span>
                    <span className="text-gray-700 text-xs break-all">{item.value}</span>
                  </div>
                )
              ))}
            </div>
          </div>

          <div className="divider" />

          {/* Quick actions */}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Actions</div>
            <div className="space-y-2">
              {ticket.status !== 'resolu' && (
                <button
                  className="btn-secondary w-full justify-center text-green-700 border-green-200 hover:bg-green-50"
                  onClick={() => updateTicket({ status: 'resolu' })}
                  disabled={saving}
                >
                  ✅ Marquer résolu
                </button>
              )}
              {ticket.status !== 'ferme' && (
                <button
                  className="btn-secondary w-full justify-center text-gray-600"
                  onClick={() => updateTicket({ status: 'ferme' })}
                  disabled={saving}
                >
                  🔒 Fermer le ticket
                </button>
              )}
              {(ticket.status === 'resolu' || ticket.status === 'ferme') && (
                <button
                  className="btn-secondary w-full justify-center text-brand-600"
                  onClick={() => updateTicket({ status: 'nouveau' })}
                  disabled={saving}
                >
                  🔄 Rouvrir
                </button>
              )}
              <button
                className="btn-secondary w-full justify-center"
                onClick={() => window.print()}
              >
                🖨️ Imprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
