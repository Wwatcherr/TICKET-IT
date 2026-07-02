'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { SERVICES, SITES } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function InscriptionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    service: '',
    site: '',
    password: '',
    confirm_password: '',
  })
  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Mon Entreprise'
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm_password) {
      return toast.error('Les mots de passe ne correspondent pas')
    }
    if (form.password.length < 8) {
      return toast.error('Le mot de passe doit contenir au moins 8 caractères')
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.full_name,
            service: form.service,
            site: form.site,
          },
        },
      })
      if (error) throw error
      toast.success('Compte créé ! Vous pouvez vous connecter.')
      router.push('/login')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la création du compte')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl">🛠️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Créer un compte</h1>
          <p className="text-gray-500 text-sm">{companyName} · IT Helpdesk</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Nom complet *</label>
              <input className="form-input" placeholder="Prénom Nom" required value={form.full_name} onChange={e => set('full_name', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Adresse e-mail professionnelle *</label>
              <input className="form-input" type="email" placeholder="prenom.nom@entreprise.fr" required value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Service *</label>
                <select className="form-select" required value={form.service} onChange={e => set('service', e.target.value)}>
                  <option value="">Choisir...</option>
                  {SERVICES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Site *</label>
                <select className="form-select" required value={form.site} onChange={e => set('site', e.target.value)}>
                  <option value="">Choisir...</option>
                  {SITES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="form-label">Mot de passe *</label>
              <input className="form-input" type="password" placeholder="8 caractères minimum" required value={form.password} onChange={e => set('password', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Confirmer le mot de passe *</label>
              <input className="form-input" type="password" placeholder="••••••••" required value={form.confirm_password} onChange={e => set('confirm_password', e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-brand-600 font-medium hover:underline">Se connecter</Link>
        </p>
      </div>
    </main>
  )
}
