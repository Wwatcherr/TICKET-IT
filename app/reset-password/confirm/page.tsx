'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function ResetPasswordConfirmPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) return toast.error('Les mots de passe ne correspondent pas')
    if (password.length < 8) return toast.error('8 caractères minimum')
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      toast.success('Mot de passe mis à jour !')
      router.push('/login')
    } catch {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Nouveau mot de passe</h1>
        </div>
        <div className="card p-8">
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="form-label">Nouveau mot de passe</label>
              <input type="password" required className="form-input" placeholder="8 caractères minimum" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Confirmer</label>
              <input type="password" required className="form-input" placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
