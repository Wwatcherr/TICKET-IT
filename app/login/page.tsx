'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Mon Entreprise'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      const { data: adminUser } = await supabase.from('admin_users').select('id').eq('email', email).single()
      router.push(adminUser ? '/admin/dashboard' : '/')
      router.refresh()
    } catch {
      toast.error('Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f0f9ff 50%, #f8fafc 100%)' }}>
      {/* Panneau gauche décoratif */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-white"
              style={{ width: `${(i+1)*130}px`, height: `${(i+1)*130}px`, top:'50%', left:'50%', transform:'translate(-50%,-50%)' }} />
          ))}
        </div>
        <div className="relative text-white text-center max-w-xs">
          <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6">🛠️</div>
          <h2 className="text-3xl font-bold mb-2 tracking-tight">IT Helpdesk</h2>
          <p className="text-sky-200 mb-10">{companyName}</p>
          <div className="space-y-3 text-left">
            {[
              { icon: '⚡', text: 'Tickets traités rapidement' },
              { icon: '📧', text: 'Notifications en temps réel' },
              { icon: '🔒', text: 'Données sécurisées' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
                <span>{item.icon}</span>
                <span className="text-sm font-medium text-white/90">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm animate-slide-up">
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}>🛠️</div>
            <h1 className="text-xl font-bold text-gray-900">IT Helpdesk</h1>
            <p className="text-sm text-gray-400">{companyName}</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">Connexion</h2>
            <p className="text-sm text-gray-400">Accédez à votre espace personnel</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="form-label">Adresse e-mail</label>
              <input type="email" required className="form-input" placeholder="prenom.nom@entreprise.fr"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="form-label mb-0">Mot de passe</label>
                <Link href="/reset-password" className="text-xs text-brand-500 hover:text-brand-600 font-semibold">Oublié ?</Link>
              </div>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} required className="form-input pr-11"
                  placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d={showPass ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                        : "M15 12a3 3 0 11-6 0 3 3 0 016 0zm-9.543 0C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                  </svg>
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2" style={{ padding: '14px' }}>
              {loading
                ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Connexion...</>
                : 'Se connecter'
              }
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Pas encore de compte ?{' '}
            <Link href="/inscription" className="text-brand-500 font-semibold hover:text-brand-600">Créer un compte</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
