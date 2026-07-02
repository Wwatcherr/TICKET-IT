'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface SalarieUser {
  id: string
  email: string
  full_name: string
  service: string
  site: string
  created_at: string
  last_sign_in_at: string
  banned: boolean
}

export default function SalariesPage() {
  const [users, setUsers] = useState<SalarieUser[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadUsers = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/salaries')
    if (res.ok) {
      const data = await res.json()
      setUsers(data)
    }
    setLoading(false)
  }

  useEffect(() => { loadUsers() }, [])

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Supprimer le compte de ${email} ? Cette action est irréversible.`)) return
    setActionLoading(id)
    const res = await fetch('/api/admin/salaries', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: id }),
    })
    if (res.ok) {
      toast.success('Compte supprimé')
      loadUsers()
    } else {
      toast.error('Erreur lors de la suppression')
    }
    setActionLoading(null)
  }

  const handleResetPassword = async (email: string) => {
    setActionLoading(email)
    const res = await fetch('/api/admin/salaries', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, action: 'reset_password' }),
    })
    if (res.ok) {
      toast.success(`E-mail de réinitialisation envoyé à ${email}`)
    } else {
      toast.error('Erreur lors de l\'envoi')
    }
    setActionLoading(null)
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Comptes salariés</h1>
        <p className="text-sm text-gray-500 mt-1">{users.length} compte{users.length > 1 ? 's' : ''} enregistré{users.length > 1 ? 's' : ''}</p>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state py-16">
            <div className="text-3xl mb-3">👥</div>
            <div className="text-gray-500">Aucun compte salarié</div>
            <div className="text-sm text-gray-400 mt-1">Les salariés apparaîtront ici après leur inscription</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Salarié</th>
                <th>Service / Site</th>
                <th>Inscription</th>
                <th>Dernière connexion</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-purple-700">
                          {user.full_name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{user.full_name || '—'}</div>
                        <div className="text-xs text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm text-gray-600">{user.service || '—'}</div>
                    <div className="text-xs text-gray-400">{user.site || '—'}</div>
                  </td>
                  <td className="text-sm text-gray-500">{formatDate(user.created_at)}</td>
                  <td className="text-sm text-gray-500">
                    {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Jamais'}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        className="btn-secondary btn-sm text-xs"
                        onClick={() => handleResetPassword(user.email)}
                        disabled={actionLoading === user.email}
                      >
                        🔑 Reset MDP
                      </button>
                      <button
                        className="btn-secondary btn-sm text-xs text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleDelete(user.id, user.email)}
                        disabled={actionLoading === user.id}
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
