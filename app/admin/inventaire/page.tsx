'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { formatDate, cn } from '@/lib/utils'
import { SITES, SERVICES } from '@/lib/utils'

interface Materiel {
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
  nb_tickets?: number
}

const TYPES = ['PC fixe', 'PC portable', 'Téléphone', 'Écran', 'Badge', 'Tablette', 'Imprimante', 'Autre']
const STATUTS = ['En service', 'En stock', 'À vérifier', 'Réforme']
const DISPONIBILITES = ['Utilisé', 'Stock', 'À vérifier']
const ETATS = ['Neuf', 'Très bon état', 'Bon état', 'État correct', 'Mauvais état', 'HS', '']

const STATUT_COLORS: Record<string, string> = {
  'En service': 'text-green-700 bg-green-50 border-green-200',
  'En stock':   'text-blue-700 bg-blue-50 border-blue-200',
  'À vérifier': 'text-amber-700 bg-amber-50 border-amber-200',
  'Réforme':    'text-red-700 bg-red-50 border-red-200',
}

const TYPE_ICONS: Record<string, string> = {
  'PC fixe': '🖥️', 'PC portable': '💻', 'Téléphone': '📱',
  'Écran': '🖥️', 'Badge': '🪪', 'Tablette': '📱',
  'Imprimante': '🖨️', 'Autre': '📦',
}

const emptyForm = {
  code_interne: '', site: '', service: '', collaborateur: '', responsable: '',
  type_materiel: 'PC portable', modele: '', marque: '', numero_serie: '',
  numero_telephone: '', accessoires: '', date_ajout: new Date().toISOString().split('T')[0],
  date_remise: '', date_restitution: '', statut_inventaire: 'En service',
  disponibilite: 'Utilisé', etat_remise: '', etat_restitution: '', commentaires: '',
}

export default function InventairePage() {
  const router = useRouter()
  const [items, setItems] = useState<Materiel[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [current, setCurrent] = useState<Materiel | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatut, setFilterStatut] = useState('all')
  const [filterSite, setFilterSite] = useState('all')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const load = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (filterType !== 'all') params.set('type', filterType)
    if (filterStatut !== 'all') params.set('statut', filterStatut)
    if (filterSite !== 'all') params.set('site', filterSite)
    const res = await fetch(`/api/admin/inventaire?${params}`)
    if (res.ok) setItems(await res.json())
    setLoading(false)
  }

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0)
    return () => clearTimeout(t)
  }, [search, filterType, filterStatut, filterSite])

  const openCreate = () => {
    setCurrent(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (item: Materiel) => {
    setCurrent(item)
    setForm({
      code_interne: item.code_interne || '',
      site: item.site || '',
      service: item.service || '',
      collaborateur: item.collaborateur || '',
      responsable: item.responsable || '',
      type_materiel: item.type_materiel || 'PC portable',
      modele: item.modele || '',
      marque: item.marque || '',
      numero_serie: item.numero_serie || '',
      numero_telephone: item.numero_telephone || '',
      accessoires: item.accessoires || '',
      date_ajout: item.date_ajout ? item.date_ajout.split('T')[0] : '',
      date_remise: item.date_remise ? item.date_remise.split('T')[0] : '',
      date_restitution: item.date_restitution ? item.date_restitution.split('T')[0] : '',
      statut_inventaire: item.statut_inventaire || 'En service',
      disponibilite: item.disponibilite || 'Utilisé',
      etat_remise: item.etat_remise || '',
      etat_restitution: item.etat_restitution || '',
      commentaires: item.commentaires || '',
    })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!form.code_interne || !form.type_materiel) return toast.error('Code interne et type obligatoires')
    setSaving(true)
    try {
      const url = current ? `/api/admin/inventaire/${current.id}` : '/api/admin/inventaire'
      const method = current ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }
      toast.success(current ? 'Matériel mis à jour' : 'Matériel ajouté')
      setShowModal(false)
      load()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce matériel ?')) return
    const res = await fetch(`/api/admin/inventaire/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Supprimé'); load() }
    else toast.error('Erreur suppression')
  }

  // Stats
  const enService = items.filter(i => i.statut_inventaire === 'En service').length
  const enStock = items.filter(i => i.statut_inventaire === 'En stock').length
  const aVerifier = items.filter(i => i.statut_inventaire === 'À vérifier' || i.statut_inventaire === 'Réforme').length

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Inventaire IT</h1>
          <p className="text-sm text-gray-500 mt-1">{items.length} matériel{items.length > 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="text-2xl font-bold text-gray-900">{items.length}</div>
          <div className="text-xs text-gray-500 mt-1">Total actifs</div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold text-green-600">{enService}</div>
          <div className="text-xs text-gray-500 mt-1">En service</div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold text-blue-600">{enStock}</div>
          <div className="text-xs text-gray-500 mt-1">En stock</div>
        </div>
        <div className={cn('stat-card', aVerifier > 0 && 'border-amber-200')}>
          <div className={cn('text-2xl font-bold', aVerifier > 0 ? 'text-amber-600' : 'text-gray-900')}>{aVerifier}</div>
          <div className="text-xs text-gray-500 mt-1">À vérifier / Réforme</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input className="form-input pl-9" placeholder="Code, collaborateur, n° série, modèle..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-select w-full sm:w-40" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="all">Tous types</option>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <select className="form-select w-full sm:w-36" value={filterStatut} onChange={e => setFilterStatut(e.target.value)}>
            <option value="all">Tous statuts</option>
            {STATUTS.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="form-select w-full sm:w-36" value={filterSite} onChange={e => setFilterSite(e.target.value)}>
            <option value="all">Tous sites</option>
            {SITES.map(s => <option key={s}>{s}</option>)}
          </select>
          {(search || filterType !== 'all' || filterStatut !== 'all' || filterSite !== 'all') && (
            <button className="btn-ghost btn-sm" onClick={() => { setSearch(''); setFilterType('all'); setFilterStatut('all'); setFilterSite('all') }}>Effacer</button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state py-16">
            <div className="text-3xl mb-3">📦</div>
            <div className="text-gray-500">Aucun matériel trouvé</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Marque / Modèle</th>
                  <th>Collaborateur</th>
                  <th>Site</th>
                  <th>Statut</th>
                  <th>Dispo</th>
                  <th>Tickets</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="cursor-pointer hover:bg-brand-50/30" onClick={() => router.push(`/admin/inventaire/${item.id}`)}>
                    <td>
                      <span className="font-mono text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                        {item.code_interne}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm">{TYPE_ICONS[item.type_materiel] || '📦'} {item.type_materiel}</span>
                    </td>
                    <td>
                      <div className="text-sm font-medium text-gray-900">{item.marque}</div>
                      <div className="text-xs text-gray-400">{item.modele}</div>
                    </td>
                    <td>
                      <div className="text-sm text-gray-700">{item.collaborateur || '—'}</div>
                      <div className="text-xs text-gray-400">{item.service}</div>
                    </td>
                    <td className="text-sm text-gray-600">{item.site || '—'}</td>
                    <td>
                      <span className={cn('badge border text-xs', STATUT_COLORS[item.statut_inventaire] || 'text-gray-600 bg-gray-50 border-gray-200')}>
                        {item.statut_inventaire}
                      </span>
                    </td>
                    <td className="text-sm text-gray-600">{item.disponibilite || '—'}</td>
                    <td>
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {item.nb_tickets || 0}
                      </span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <button className="btn-ghost btn-sm text-brand-600 text-xs" onClick={() => openEdit(item)}>Modifier</button>
                        <button className="btn-ghost btn-sm text-red-500 text-xs" onClick={() => handleDelete(item.id)}>Suppr.</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal ajout/édition */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-elevated w-full max-w-2xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                {current ? 'Modifier le matériel' : 'Nouveau matériel'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="space-y-4">
              {/* Identification */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Identification</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Code interne *</label>
                    <input className="form-input font-mono" placeholder="PC BRE 01" value={form.code_interne} onChange={e => set('code_interne', e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">Type de matériel *</label>
                    <select className="form-select" value={form.type_materiel} onChange={e => set('type_materiel', e.target.value)}>
                      {TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Marque</label>
                    <input className="form-input" placeholder="HP, Apple, Samsung..." value={form.marque} onChange={e => set('marque', e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">Modèle</label>
                    <input className="form-input" placeholder="ProBook 450, iPhone 14..." value={form.modele} onChange={e => set('modele', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Numéro de série</label>
                    <input className="form-input font-mono" placeholder="NBAGFR01" value={form.numero_serie} onChange={e => set('numero_serie', e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">Numéro de téléphone</label>
                    <input className="form-input" placeholder="06 xx xx xx xx" value={form.numero_telephone} onChange={e => set('numero_telephone', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="form-label">Accessoires fournis</label>
                  <input className="form-input" placeholder="Chargeur, souris, clavier..." value={form.accessoires} onChange={e => set('accessoires', e.target.value)} />
                </div>
              </div>

              {/* Attribution */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Attribution</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Site</label>
                    <select className="form-select" value={form.site} onChange={e => set('site', e.target.value)}>
                      <option value="">—</option>
                      {SITES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Service</label>
                    <select className="form-select" value={form.service} onChange={e => set('service', e.target.value)}>
                      <option value="">—</option>
                      {SERVICES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Collaborateur / Détenteur</label>
                    <input className="form-input" placeholder="Prénom NOM" value={form.collaborateur} onChange={e => set('collaborateur', e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">Responsable assignation</label>
                    <input className="form-input" placeholder="Prénom NOM" value={form.responsable} onChange={e => set('responsable', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dates</div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="form-label">Date d'ajout</label>
                    <input className="form-input" type="date" value={form.date_ajout} onChange={e => set('date_ajout', e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">Date de remise</label>
                    <input className="form-input" type="date" value={form.date_remise} onChange={e => set('date_remise', e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">Date de restitution</label>
                    <input className="form-input" type="date" value={form.date_restitution} onChange={e => set('date_restitution', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Statut */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut & État</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Statut inventaire</label>
                    <select className="form-select" value={form.statut_inventaire} onChange={e => set('statut_inventaire', e.target.value)}>
                      {STATUTS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Disponibilité</label>
                    <select className="form-select" value={form.disponibilite} onChange={e => set('disponibilite', e.target.value)}>
                      {DISPONIBILITES.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">État remise</label>
                    <select className="form-select" value={form.etat_remise} onChange={e => set('etat_remise', e.target.value)}>
                      {ETATS.map(e => <option key={e} value={e}>{e || '—'}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">État restitution</label>
                    <select className="form-select" value={form.etat_restitution} onChange={e => set('etat_restitution', e.target.value)}>
                      {ETATS.map(e => <option key={e} value={e}>{e || '—'}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label">Commentaires</label>
                  <textarea className="form-textarea" rows={2} placeholder="Notes, remarques..." value={form.commentaires} onChange={e => set('commentaires', e.target.value)} />
                </div>
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
