'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Mon Entreprise'

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login')
        return
      }
      setUser({
        name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Utilisateur',
        email: session.user.email || '',
      })
      setLoading(false)
    })
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50 flex flex-col">
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto w-full border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">🛠️</span>
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-sm leading-tight">IT Helpdesk</div>
            <div className="text-xs text-gray-500 leading-tight">{companyName}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 hidden sm:block">
            Bonjour, <strong>{user?.name}</strong>
          </span>
          <button onClick={handleSignOut} className="btn-secondary btn-sm text-red-600 border-red-200 hover:bg-red-50">
            Déconnexion
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
          Service disponible 24h/24
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight tracking-tight text-balance max-w-2xl">
          Besoin d'aide
          <span className="text-brand-600"> informatique ?</span>
        </h1>

        <p className="text-lg text-gray-500 mb-10 max-w-xl leading-relaxed">
          Signalez votre problème en quelques clics. Notre équipe IT reçoit votre demande
          instantanément et vous répond rapidement.
        </p>

        {/* Action cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full mb-12">
          <Link href="/ticket/new" className="card p-6 text-left hover:shadow-soft hover:border-brand-200 transition-all group cursor-pointer">
            <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-200 transition-colors">
              <span className="text-2xl">➕</span>
            </div>
            <div className="font-semibold text-gray-900 mb-1">Créer un ticket</div>
            <div className="text-sm text-gray-500">Signalez un problème informatique</div>
          </Link>

          <Link href="/mon-espace/tickets" className="card p-6 text-left hover:shadow-soft hover:border-brand-200 transition-all group cursor-pointer">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
              <span className="text-2xl">📋</span>
            </div>
            <div className="font-semibold text-gray-900 mb-1">Mes tickets</div>
            <div className="text-sm text-gray-500">Suivez vos demandes en cours</div>
          </Link>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full">
          {[
            { icon: '⚡', title: 'Rapide', desc: 'Moins de 2 minutes pour créer un ticket' },
            { icon: '📨', title: 'Notifié', desc: 'E-mail à chaque mise à jour' },
            { icon: '🔒', title: 'Sécurisé', desc: 'Données internes à l\'entreprise' },
          ].map(f => (
            <div key={f.title} className="card p-5 text-left">
              <div className="text-xl mb-2">{f.icon}</div>
              <div className="font-semibold text-gray-900 text-sm mb-0.5">{f.title}</div>
              <div className="text-xs text-gray-500">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="py-6 text-center text-xs text-gray-400 border-t border-gray-100">
        {companyName} · IT Helpdesk · {new Date().getFullYear()}
      </footer>
    </main>
  )
}
