'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { formatDate, cn } from '@/lib/utils'

interface Abonnement {
  id: string
  nom: string
  categorie: string
  cout: number
  periodicite: 'mensuel' | 'annuel'
  date_renouvellement: string
  statut: 'actif' | 'resilie' | 'en_pause'
  notes?: string
  created_at: string
}

const CATEGORIES = ['Hébergement', 'Intelligence Artificielle', 'Logiciel', 'Téléphonie', 'Sécurité', 'Communication', 'Autre']

const STATUT_CONFIG = {
  actif:    { label: 'Actif',     color: 'text-green-700 bg-green-50 border-green-200' },
  resilie:  { label: 'Résilié',   color: 'text-red-700 bg-red-50 border-red-200' },
  en_pause: { label: 'En pause',  color: 'text-amber-700 bg-amber-50 border-amber-200' },
}

function joursAvantRenouvellement(date: string): number {
  const diff = new Date(date).getTime() - new Date().getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function AlerteBadge({ jours }: { jours: number }) {
  if (jours < 0) return <span className="badge border text-red-700 bg-red-50 border-red-200">⚠️ Expiré</span>
  if (jours <= 7) return <span className="badge border text-red-700 bg-red-50 border-red-200">🔴 {jours}j</span>
  if (jours <= 30) return <span className="badge border text-amber-700 bg-amber-50 border-amber-200">🟡 {jours}j</span>
  return <span className="text-xs text-gray-400">{jours}j</span>
}

interface FormState {
  nom: string
  categorie: string
  cout: string
  periodicite: 'mensuel' | 'annuel'
  date_renouvellement: string
  statut: 'actif' | 'resilie' | 'en_pause'
  notes: string
}

const emptyForm: FormState = {
  nom: '', categorie: 'Hébergement', cout: '', periodicite: 'annuel',
  date_renouvellement: '', statut: 'actif', notes: '',
}

export default function AbonnementsPage() {
  const [abonnements, setAbonnements] = useState<Abonnement[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [current, setCurrent] = useState<Abonnement | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('tous')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/abonnements')
    if (res.ok) setAbonnements(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setCurrent(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (a: Abonnement) => {
    setCurrent(a)
    setForm({
      nom: a.nom, categorie: a.categorie, cout: String(a.cout),
      periodicite: a.periodicite as 'mensuel' | 'annuel', date_renouvellement: a.date_renouvellement.split('T')[0],
      statut: a.statut as 'actif' | 'resilie' | 'en_pause', notes: a.notes || '',
    })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!form.nom || !form.date_renouvellement || !form.cout) return toast.error('Champs obligatoires manquants')
    setSaving(true)
    try {
      const body = { ...form, cout: Number(form.cout) }
      const res = await fetch('/api/admin/abonnements' + (current ? `/${current.id}` : ''), {
        method: current ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error()
      toast.success(current ? 'Abonnement mis à jour' : 'Abonnement ajouté')
      setShowModal(false)
      load()
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet abonnement ?')) return
    const res = await fetch(`/api/admin/abonnements/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Supprimé'); load() }
    else toast.error('Erreur suppression')
  }

  const filtered = abonnements.filter(a => filter === 'tous' || a.statut === filter)
  const totalMensuel = abonnements
    .filter(a => a.statut === 'actif')
    .reduce((sum, a) => sum + (a.periodicite === 'mensuel' ? a.cout : a.cout / 12), 0)
  const totalAnnuel = totalMensuel * 12
  const alertes = abonnements.filter(a => a.statut === 'actif' && joursAvantRenouvellement(a.date_renouvellement) <= 30)

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Abonnements</h1>
          <p className="text-sm text-gray-500 mt-1">{abonnements.length} abonnement{abonnements.length > 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="text-2xl font-bold text-gray-900">{totalMensuel.toFixed(2)} €</div>
          <div className="text-xs text-gray-500 mt-1">Coût mensuel estimé</div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold text-gray-900">{totalAnnuel.toFixed(2)} €</div>
          <div className="text-xs text-gray-500 mt-1">Coût annuel estimé</div>
        </div>
        <div className={cn('stat-card', alertes.length > 0 && 'border-amber-200 bg-amber-50')}>
          <div className={cn('text-2xl font-bold', alertes.length > 0 ? 'text-amber-600' : 'text-gray-900')}>
            {alertes.length}
          </div>
          <div className="text-xs text-gray-500 mt-1">Renouvellement{alertes.length > 1 ? 's' : ''} dans 30j</div>
        </div>
      </div>

      {/* Alertes */}
      {alertes.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="text-sm font-semibold text-amber-800 mb-2">⚠️ Renouvellements à venir</div>
          <div className="space-y-1">
            {alertes.map(a => (
              <div key={a.id} className="flex items-center justify-between text-sm">
                <span className="text-amber-700 font-medium">{a.nom}</span>
                <span className="text-amber-600">{formatDate(a.date_renouvellement)} — {a.cout}€/{a.periodicite === 'mensuel' ? 'mois' : 'an'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { value: 'tous', label: 'Tous' },
          { value: 'actif', label: 'Actifs' },
          { value: 'en_pause', label: 'En pause' },
          { value: 'resilie', label: 'Résiliés' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn('btn-sm rounded-lg text-sm font-medium px-4', filter === f.value ? 'bg-brand-600 text-white' : 'btn-secondary')}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state py-16">
            <div className="text-3xl mb-3">💳</div>
            <div className="text-gray-500">Aucun abonnement</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Catégorie</th>
                <th>Coût</th>
                <th>Renouvellement</th>
                <th>Dans</th>
                <th>Statut</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => {
                const jours = joursAvantRenouvellement(a.date_renouvellement)
                const statut = STATUT_CONFIG[a.statut]
                return (
                  <tr key={a.id}>
                    <td>
                      <div className="font-medium text-gray-900">{a.nom}</div>
                      {a.notes && <div className="text-xs text-gray-400 truncate max-w-[200px]">{a.notes}</div>}
                    </td>
                    <td className="text-sm text-gray-600">{a.categorie}</td>
                    <td>
                      <div className="font-medium text-gray-900">{a.cout}€</div>
                      <div className="text-xs text-gray-400">/{a.periodicite === 'mensuel' ? 'mois' : 'an'}</div>
                    </td>
                    <td className="text-sm text-gray-600">{formatDate(a.date_renouvellement)}</td>
                    <td><AlerteBadge jours={jours} /></td>
                    <td>
                      <span className={cn('badge border', statut.color)}>{statut.label}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button className="btn-ghost btn-sm text-brand-600" onClick={() => openEdit(a)}>Modifier</button>
                        <button className="btn-ghost btn-sm text-red-500" onClick={() => handleDelete(a.id)}>Supprimer</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-elevated w-full max-w-md p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                {current ? 'Modifier l\'abonnement' : 'Nouvel abonnement'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="form-label">Nom *</label>
                <input className="form-input" placeholder="Ex: Vercel Pro, ChatGPT Plus..." value={form.nom} onChange={e => set('nom', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Catégorie *</label>
                  <select className="form-select" value={form.categorie} onChange={e => set('categorie', e.target.value)}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Statut *</label>
                  <select className="form-select" value={form.statut} onChange={e => set('statut', e.target.value)}>
                    <option value="actif">Actif</option>
                    <option value="en_pause">En pause</option>
                    <option value="resilie">Résilié</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Coût (€) *</label>
                  <input className="form-input" type="number" step="0.01" placeholder="9.99" value={form.cout} onChange={e => set('cout', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Périodicité *</label>
                  <select className="form-select" value={form.periodicite} onChange={e => set('periodicite', e.target.value)}>
                    <option value="mensuel">Mensuel</option>
                    <option value="annuel">Annuel</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Date de renouvellement *</label>
                <input className="form-input" type="date" value={form.date_renouvellement} onChange={e => set('date_renouvellement', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Notes <span className="text-gray-400 font-normal">(optionnel)</span></label>
                <textarea className="form-textarea" rows={2} placeholder="Informations complémentaires..." value={form.notes} onChange={e => set('notes', e.target.value)} />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button className="btn-secondary flex-1" onClick={() => setShowModal(false)}>Annuler</button>
              <button className="btn-primary flex-1" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Enregistrement...' : current ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
