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
      if (!session) { router.replace('/login'); return }
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #ffffff 0%, #f0f9ff 60%, #ffffff 100%)' }}>

      {/* Motif de points en arrière-plan */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: 'radial-gradient(circle, #0ea5e9 1.5px, transparent 1.5px)',
          backgroundSize: '30px 30px'
        }} />

      {/* Blobs décoratifs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none opacity-[0.06] -translate-y-1/3 translate-x-1/3"
        style={{ background: 'radial-gradient(circle, #0ea5e9, transparent 70%)' }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none opacity-[0.05] translate-y-1/3 -translate-x-1/3"
        style={{ background: 'radial-gradient(circle, #0284c7, transparent 70%)' }} />
      <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] rounded-full pointer-events-none opacity-[0.03]"
        style={{ background: 'radial-gradient(circle, #38bdf8, transparent 70%)' }} />

      {/* Header */}
      <header className="relative z-10 border-b border-gray-100/80 px-6 py-4 glass">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', boxShadow: '0 2px 8px rgba(14,165,233,0.3)' }}>
              🛠️
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm leading-tight tracking-tight">IT Helpdesk</div>
              <div className="text-xs text-gray-400 leading-tight">{companyName}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm bg-white/80 border border-gray-100 px-3 py-1.5 rounded-xl shadow-sm">
              <div className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}>
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-gray-700 text-xs">{user?.name}</span>
            </div>
            <button onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-all duration-150 border border-transparent hover:border-red-100">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="text-center mb-14 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight leading-tight">
            Portail assistance <span className="text-brand-500">IT</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-md mx-auto">
            Ouvrez un ticket ou consultez vos demandes en cours.
          </p>
        </div>

        {/* Action cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl w-full animate-slide-up">
          <Link href="/ticket/new"
            className="group relative overflow-hidden bg-white rounded-2xl p-7 cursor-pointer transition-all duration-200 hover:-translate-y-1"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)', border: '1px solid rgba(14,165,233,0.1)' }}>
            {/* Motif intérieur subtil */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ background: 'linear-gradient(135deg, rgba(224,242,254,0.5) 0%, transparent 60%)' }} />
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.06]"
              style={{ background: 'radial-gradient(circle, #0ea5e9, transparent)', transform: 'translate(30%, -30%)' }} />
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 text-xl transition-transform duration-200 group-hover:scale-110"
                style={{ background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)' }}>
                ➕
              </div>
              <div className="font-bold text-gray-900 text-lg mb-1.5">Créer un ticket</div>
              <div className="text-sm text-gray-500 leading-relaxed">Signalez un problème informatique</div>
              <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-brand-500 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-0 group-hover:translate-x-1">
                Commencer →
              </div>
            </div>
          </Link>

          <Link href="/mon-espace/tickets"
            className="group relative overflow-hidden bg-white rounded-2xl p-7 cursor-pointer transition-all duration-200 hover:-translate-y-1"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)', border: '1px solid rgba(168,85,247,0.1)' }}>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ background: 'linear-gradient(135deg, rgba(243,232,255,0.5) 0%, transparent 60%)' }} />
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.06]"
              style={{ background: 'radial-gradient(circle, #a855f7, transparent)', transform: 'translate(30%, -30%)' }} />
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 text-xl transition-transform duration-200 group-hover:scale-110"
                style={{ background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)' }}>
                📋
              </div>
              <div className="font-bold text-gray-900 text-lg mb-1.5">Mes tickets</div>
              <div className="text-sm text-gray-500 leading-relaxed">Suivez vos demandes en cours</div>
              <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-purple-500 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-0 group-hover:translate-x-1">
                Consulter →
              </div>
            </div>
          </Link>
        </div>
      </section>

      <footer className="relative z-10 py-5 text-center text-xs text-gray-300 border-t border-gray-100/60">
        {companyName} · IT Helpdesk · {new Date().getFullYear()}
      </footer>
    </main>
  )
}
