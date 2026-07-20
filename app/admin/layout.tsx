'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/admin/dashboard',   icon: '▦',  label: 'Tableau de bord' },
  { href: '/admin/tickets',     icon: '🎫', label: 'Tickets' },
  { href: '/admin/inventaire',  icon: '🖥️', label: 'Inventaire IT' },
  { href: '/admin/abonnements', icon: '💳', label: 'Abonnements' },
  { href: '/admin/salaries',    icon: '👤', label: 'Salariés' },
  { href: '/admin/users',       icon: '👥', label: 'Équipe IT' },
  { href: '/admin/settings',    icon: '⚙️', label: 'Paramètres' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)
  const [userName, setUserName] = useState('')
  const [userInitial, setUserInitial] = useState('A')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Mon Entreprise'
  const isLoginPage = pathname === '/admin'

  useEffect(() => {
    if (isLoginPage) { setReady(true); return }
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/admin'); return }
      try {
        const { data } = await supabase.from('admin_users').select('full_name').eq('id', session.user.id).single()
        const name = data?.full_name || session.user.email || 'Admin'
        setUserName(name)
        setUserInitial(name.charAt(0).toUpperCase())
      } catch {
        const name = session.user.email || 'Admin'
        setUserName(name)
        setUserInitial(name.charAt(0).toUpperCase())
      }
      setReady(true)
    })
  }, [isLoginPage])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/admin')
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Chargement...</p>
        </div>
      </div>
    )
  }

  if (isLoginPage) return <>{children}</>

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-white border-r border-gray-100">
      {/* Logo */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}>
            🛠️
          </div>
          <div className="min-w-0">
            <div className="font-bold text-gray-900 text-sm truncate tracking-tight">IT Helpdesk</div>
            <div className="text-xs text-gray-400 truncate">{companyName}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 pt-2 pb-2">
          Navigation
        </div>
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'text-brand-700 bg-brand-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                }`}
                style={isActive ? { boxShadow: 'inset 3px 0 0 #0ea5e9' } : {}}
              >
                <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>

        <div className="mt-4">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 pb-2">
            Accès rapide
          </div>
          <Link href="/" target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-brand-600 hover:bg-brand-50 transition-all duration-150">
            <span className="text-base w-5 text-center">🔗</span>
            <span>Portail utilisateur</span>
            <svg className="w-3 h-3 ml-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </div>
      </nav>

      {/* User */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}>
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-gray-900 truncate">{userName}</div>
            <div className="text-xs text-gray-400">Administrateur</div>
          </div>
          <button onClick={handleSignOut} title="Se déconnecter"
            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-60 xl:w-64 flex-shrink-0">
        <div className="w-full h-full"><Sidebar /></div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 z-50 shadow-elevated"><Sidebar /></div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs" style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}>🛠️</div>
            <span className="font-bold text-gray-900 text-sm tracking-tight">IT Helpdesk</span>
          </div>
          <div className="w-9" />
        </div>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
