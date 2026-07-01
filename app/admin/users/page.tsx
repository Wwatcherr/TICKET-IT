'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import type { AdminUser, UserRole } from '@/types'

const ROLE_CONFIG: Record<UserRole, { label: string; desc: string; color: string }> = {
  admin:      { label: 'Administrateur', desc: 'Tous les droits',          color: 'text-brand-700 bg-brand-50 border-brand-200' },
  technicien: { label: 'Technicien',     desc: 'Gestion des tickets',      color: 'text-blue-700 bg-blue-50 border-blue-200' },
  lecture:    { label: 'Lecture seule',  desc: 'Consultation uniquement',  color: 'text-gray-600 bg-gray-50 border-gray-200' },
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null)
  const [form, setForm] = useState({ email: '', full_name: '', role: 'technicien' as UserRole, password: '' })
  const [saving, setSaving] = useState(false)

  const loadUsers = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('admin_users').select('*').order('created_at')
    setUsers(data || [])
    setLoading(false)
  }

  useEffect(() => { loadUsers() }, [])

  const handleSubmit = async () => {
    if (!form.email || !form.full_name || !form.role) return toast.error('Champs obligatoires manquants')
    if (!currentUser && !form.password) return toast.error('Mot de passe requis')
    setSaving(true)

    try {
      const supabase = createClient()
      if (currentUser) {
        // Update existing
        await supabase.from('admin_users').update({
          full_name: form.full_name,
          role: form.role,
        }).eq('id', currentUser.id)
        toast.success('Utilisateur mis à jour')
      } else {
        // Create via admin endpoint
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Erreur création')
        }
        toast.success('Utilisateur créé')
      }
      setShowModal(false)
      setForm({ email: '', full_name: '', role: 'technicien', password: '' })
      setCurrentUser(null)
      loadUsers()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  const openEdit = (user: AdminUser) => {
    setCurrentUser(user)
    setForm({ email: user.email, full_name: user.full_name, role: user.role, password: '' })
    setShowModal(true)
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Utilisateurs</h1>
          <p className="text-sm text-gray-500 mt-1">{users.length} membre{users.length > 1 ? 's' : ''} de l'équipe</p>
        </div>
        <button className="btn-primary" onClick={() => { setCurrentUser(null); setForm({ email: '', full_name: '', role: 'technicien', password: '' }); setShowModal(true) }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter un utilisateur
        </button>
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Object.entries(ROLE_CONFIG).map(([role, cfg]) => {
          const count = users.filter(u => u.role === role).length
          return (
            <div key={role} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`badge border text-xs ${cfg.color}`}>{cfg.label}</span>
                <span className="text-2xl font-bold text-gray-800">{count}</span>
              </div>
              <div className="text-xs text-gray-400">{cfg.desc}</div>
            </div>
          )
        })}
      </div>

      {/* Users list */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>E-mail</th>
                <th>Rôle</th>
                <th>Créé le</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const roleConfig = ROLE_CONFIG[user.role]
                return (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-brand-700">{user.full_name.charAt(0)}</span>
                        </div>
                        <div className="font-medium text-gray-900">{user.full_name}</div>
                      </div>
                    </td>
                    <td className="text-gray-600 text-sm">{user.email}</td>
                    <td>
                      <span className={`badge border ${roleConfig.color}`}>{roleConfig.label}</span>
                    </td>
                    <td className="text-sm text-gray-500">{formatDate(user.created_at)}</td>
                    <td>
                      <button
                        className="btn-ghost btn-sm text-brand-600"
                        onClick={() => openEdit(user)}
                      >
                        Modifier
                      </button>
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
          <div className="relative bg-white rounded-2xl shadow-elevated w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                {currentUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="form-label">Nom complet *</label>
                <input className="form-input" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Prénom Nom" />
              </div>
              <div>
                <label className="form-label">Adresse e-mail *</label>
                <input className="form-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="user@entreprise.fr" disabled={!!currentUser} />
              </div>
              {!currentUser && (
                <div>
                  <label className="form-label">Mot de passe *</label>
                  <input className="form-input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
                </div>
              )}
              <div>
                <label className="form-label">Rôle *</label>
                <select className="form-select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))}>
                  {Object.entries(ROLE_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label} — {v.desc}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button className="btn-secondary flex-1" onClick={() => setShowModal(false)}>Annuler</button>
              <button className="btn-primary flex-1" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Enregistrement...' : currentUser ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
