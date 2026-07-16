'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { formatDate, STATUS_CONFIG, cn } from '@/lib/utils'

interface TicketLie {
  ticket_id: string
  ticket: {
    id: string
    ticket_number: string
    title: string
    status: string
    created_at: string
  }
}

interface MaterielDetail {
  id: string
  code_interne: string
  site: string
  service: string
  collaborateur: string
  responsable: string
  type_materiel: string
  modele: string
  marque: string
  numero_serie: string
  numero_telephone: string
  accessoires: string
  date_ajout: string
  date_remise: string
  date_restitution: string
  statut_inventaire: string
  disponibilite: string
  etat_remise: string
  etat_restitution: string
  commentaires: string
  updated_at: string
  tickets_lies: TicketLie[]
}

const STATUT_COLORS: Record<string, string> = {
  'En service': 'text-green-700 bg-green-50 border-green-200',
  'En stock':   'text-blue-700 bg-blue-50 border-blue-200',
  'À vérifier': 'text-amber-700 bg-amber-50 border-amber-200',
  'Réforme':    'text-red-700 bg-red-50 border-red-200',
}

export default function MaterielDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [materiel, setMateriel] = useState<MaterielDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const res = await fetch(`/api/admin/inventaire/${id}`)
    if (!res.ok) { toast.error('Matériel introuvable'); router.push('/admin/inventaire'); return }
    setMateriel(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  if (loading) return <div className="p-8 flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>
  if (!materiel) return null

  const nbTickets = materiel.tickets_lies?.length || 0

  return (
    <div className="p-6 lg:p-8 max-w-4xl animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/admin/inventaire" className="hover:text-gray-700">Inventaire</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium font-mono">{materiel.code_interne}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-sm font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-lg">{materiel.code_interne}</span>
            <span className={cn('badge border', STATUT_COLORS[materiel.statut_inventaire] || 'text-gray-600 bg-gray-50 border-gray-200')}>
              {materiel.statut_inventaire}
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">{materiel.type_materiel} — {materiel.marque} {materiel.modele}</h1>
          {materiel.collaborateur && <p className="text-gray-500 mt-1">👤 {materiel.collaborateur} {materiel.service && `· ${materiel.service}`}</p>}
        </div>
        <Link href="/admin/inventaire" className="btn-secondary btn-sm">← Retour</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Infos principales */}
        <div className="lg:col-span-2 space-y-5">
          {/* Identification */}
          <div className="card p-5">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Identification</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: 'Type', value: materiel.type_materiel },
                { label: 'Marque', value: materiel.marque },
                { label: 'Modèle', value: materiel.modele },
                { label: 'N° de série', value: materiel.numero_serie },
                { label: 'N° de téléphone', value: materiel.numero_telephone },
                { label: 'Accessoires', value: materiel.accessoires },
              ].map(item => item.value && (
                <div key={item.label}>
                  <div className="text-xs text-gray-400 mb-0.5">{item.label}</div>
                  <div className="font-medium text-gray-800 font-mono text-xs">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Attribution */}
          <div className="card p-5">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Attribution</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: 'Site', value: materiel.site },
                { label: 'Service', value: materiel.service },
                { label: 'Collaborateur', value: materiel.collaborateur },
                { label: 'Responsable', value: materiel.responsable },
                { label: 'Disponibilité', value: materiel.disponibilite },
              ].map(item => item.value && (
                <div key={item.label}>
                  <div className="text-xs text-gray-400 mb-0.5">{item.label}</div>
                  <div className="font-medium text-gray-800">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Dates & États */}
          <div className="card p-5">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Dates & États</div>
            <div className="grid grid-cols-3 gap-4 text-sm mb-4">
              {[
                { label: "Date d'ajout", value: materiel.date_ajout },
                { label: 'Date de remise', value: materiel.date_remise },
                { label: 'Date de restitution', value: materiel.date_restitution },
              ].map(item => (
                <div key={item.label}>
                  <div className="text-xs text-gray-400 mb-0.5">{item.label}</div>
                  <div className="font-medium text-gray-800">{item.value ? formatDate(item.value) : '—'}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: 'État remise', value: materiel.etat_remise },
                { label: 'État restitution', value: materiel.etat_restitution },
              ].map(item => (
                <div key={item.label}>
                  <div className="text-xs text-gray-400 mb-0.5">{item.label}</div>
                  <div className="font-medium text-gray-800">{item.value || '—'}</div>
                </div>
              ))}
            </div>
            {materiel.commentaires && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-400 mb-1">Commentaires</div>
                <div className="text-sm text-gray-700">{materiel.commentaires}</div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar tickets */}
        <div className="space-y-5">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tickets liés</div>
              <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{nbTickets}</span>
            </div>

            {nbTickets === 0 ? (
              <div className="text-center py-6">
                <div className="text-2xl mb-2">🎫</div>
                <div className="text-sm text-gray-400">Aucun ticket lié</div>
                <div className="text-xs text-gray-400 mt-1">Associez des tickets depuis la fiche ticket</div>
              </div>
            ) : (
              <div className="space-y-2">
                {materiel.tickets_lies.map(tl => {
                  const status = STATUS_CONFIG[tl.ticket.status as keyof typeof STATUS_CONFIG]
                  return (
                    <Link
                      key={tl.ticket_id}
                      href={`/admin/tickets/${tl.ticket.id}`}
                      className="block p-3 bg-gray-50 rounded-lg hover:bg-brand-50 hover:border-brand-200 border border-transparent transition-all"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-brand-600">{tl.ticket.ticket_number}</span>
                        {status && (
                          <span className={cn('badge border text-xs', status.color, status.bg)}>
                            {status.label}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 truncate">{tl.ticket.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{formatDate(tl.ticket.created_at)}</div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          <div className="card p-4 bg-gray-50 text-xs text-gray-500">
            <div>Dernière mise à jour</div>
            <div className="font-medium text-gray-700 mt-0.5">{materiel.updated_at ? formatDate(materiel.updated_at) : '—'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
