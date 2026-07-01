'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/admin/dashboard', icon: '📊', label: 'Tableau de bord' },
  { href: '/admin/tickets', icon: '🎫', label: 'Tickets' },
  { href: '/admin/users', icon: '👥', label: 'Utilisateurs' },
  { href: '/admin/settings', icon: '⚙️', label: 'Paramètres' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)
  const [userName, setUserName] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Mon Entreprise'

  // Login page — render directly, no auth check needed
  if (pathname === '/admin') {
    return <>{children}</>
  }

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace('/admin')
        return
      }

      // Try to get name from admin_users, fallback to email
      try {
        const { data } = await supabase
          .from('admin_users')
          .select('full_name')
          .eq('id', session.user.id)
          .single()
        setUserName(data?.full_name || session.user.email || 'Admin')
      } catch {
        setUserName(session.user.email || 'Admin')
      }

      setReady(true)
    })
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/admin')
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <div className="text-sm text-gray-500">Chargement...</div>
        </div>
      </div>
    )
  }

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-white border-r border-gray-100">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-base">🛠️</span>
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 text-sm truncate">IT Helpdesk</div>
            <div className="text-xs text-gray-400 truncate">{companyName}</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
        <div className="pt-4">
          <Link href="/ticket/new" target="_blank" className="nav-item text-brand-600 hover:text-brand-700 hover:bg-brand-50">
            <span className="text-base">🔗</span>
            <span>Portail utilisateur</span>
          </Link>
        </div>
      </nav>

      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50">
          <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-brand-700">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900 truncate">{userName}</div>
          </div>
          <button onClick={handleSignOut} className="text-gray-400 hover:text-red-500 transition-colors" title="Se déconnecter">
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
      <div className="hidden lg:flex lg:w-60 xl:w-64 flex-shrink-0">
        <div className="w-full h-full">
          <Sidebar />
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 z-50 shadow-elevated">
            <Sidebar />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-gray-900 text-sm">IT Helpdesk</span>
          <div className="w-9" />
        </div>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
