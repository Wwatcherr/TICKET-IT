'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Mon Entreprise'

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace('/login'); return }
      setUser({ name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Utilisateur' })
      setLoading(false)
    })
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f0f9ff' }}>
      <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <main className="min-h-screen flex flex-col" style={{
      background: `
        radial-gradient(ellipse 80% 50% at 50% -10%, rgba(14,165,233,0.15) 0%, transparent 60%),
        radial-gradient(ellipse 60% 40% at 100% 80%, rgba(2,132,199,0.10) 0%, transparent 50%),
        radial-gradient(ellipse 50% 40% at 0% 60%, rgba(56,189,248,0.08) 0%, transparent 50%),
        #ffffff
      `
    }}>

      {/* Grille SVG en fond */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(14,165,233,0.08)" strokeWidth="1"/>
            </pattern>
            <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="rgba(14,165,233,0.12)"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)"/>
        </svg>
      </div>

      {/* Header */}
      <header className="relative border-b px-6 py-4" style={{
        zIndex: 10,
        background: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(16px)',
        borderColor: 'rgba(14,165,233,0.1)',
      }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{
              background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
              boxShadow: '0 2px 8px rgba(14,165,233,0.35)',
            }}>🛠️</div>
            <div>
              <div className="font-bold text-gray-900 text-sm leading-tight tracking-tight">IT Helpdesk</div>
              <div className="text-xs text-gray-400 leading-tight">{companyName}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs" style={{
              background: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(14,165,233,0.15)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              <div className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}>
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-gray-700">{user?.name}</span>
            </div>
            <button onClick={handleSignOut} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 px-3 py-1.5 rounded-xl transition-all" style={{
              background: 'rgba(255,255,255,0.8)',
              border: '1px solid rgba(0,0,0,0.06)',
            }}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-6 py-20" style={{ zIndex: 1 }}>
        <div className="text-center mb-14 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight leading-tight">
            Portail assistance <span style={{ color: '#0ea5e9' }}>IT</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-md mx-auto">
            Ouvrez un ticket ou consultez vos demandes en cours.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl w-full animate-slide-up">
          {/* Card créer ticket */}
          <Link href="/ticket/new" className="group relative overflow-hidden rounded-2xl p-7 cursor-pointer transition-all duration-200 hover:-translate-y-1.5" style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(14,165,233,0.15)',
            boxShadow: '0 2px 8px rgba(14,165,233,0.08), 0 8px 24px rgba(0,0,0,0.06)',
          }}>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
              background: 'linear-gradient(135deg, rgba(224,242,254,0.6) 0%, rgba(186,230,253,0.2) 100%)',
            }} />
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full" style={{
              background: 'radial-gradient(circle, rgba(14,165,233,0.15), transparent 70%)',
            }} />
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 text-xl transition-transform duration-200 group-hover:scale-110" style={{
                background: 'linear-gradient(135deg, #bae6fd, #7dd3fc)',
                boxShadow: '0 4px 12px rgba(14,165,233,0.25)',
              }}>➕</div>
              <div className="font-bold text-gray-900 text-lg mb-1.5">Créer un ticket</div>
              <div className="text-sm text-gray-500">Signalez un problème informatique</div>
              <div className="mt-5 text-xs font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200" style={{ color: '#0284c7' }}>
                Commencer →
              </div>
            </div>
          </Link>

          {/* Card mes tickets */}
          <Link href="/mon-espace/tickets" className="group relative overflow-hidden rounded-2xl p-7 cursor-pointer transition-all duration-200 hover:-translate-y-1.5" style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(168,85,247,0.15)',
            boxShadow: '0 2px 8px rgba(168,85,247,0.08), 0 8px 24px rgba(0,0,0,0.06)',
          }}>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
              background: 'linear-gradient(135deg, rgba(243,232,255,0.6) 0%, rgba(233,213,255,0.2) 100%)',
            }} />
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full" style={{
              background: 'radial-gradient(circle, rgba(168,85,247,0.15), transparent 70%)',
            }} />
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 text-xl transition-transform duration-200 group-hover:scale-110" style={{
                background: 'linear-gradient(135deg, #e9d5ff, #d8b4fe)',
                boxShadow: '0 4px 12px rgba(168,85,247,0.25)',
              }}>📋</div>
              <div className="font-bold text-gray-900 text-lg mb-1.5">Mes tickets</div>
              <div className="text-sm text-gray-500">Suivez vos demandes en cours</div>
              <div className="mt-5 text-xs font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200" style={{ color: '#9333ea' }}>
                Consulter →
              </div>
            </div>
          </Link>
        </div>
      </section>

      <footer className="relative py-5 text-center text-xs text-gray-400 border-t" style={{
        zIndex: 1,
        borderColor: 'rgba(14,165,233,0.08)',
      }}>
        {companyName} · IT Helpdesk · {new Date().getFullYear()}
      </footer>
    </main>
  )
}
