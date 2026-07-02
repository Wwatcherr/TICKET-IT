'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TicketStatusSearchPage() {
  const router = useRouter()
  const [numero, setNumero] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Mon Entreprise'

  const handleSearch = async () => {
    const cleaned = numero.trim().toUpperCase()
    if (!cleaned) return setError('Veuillez entrer un numéro de ticket')
    setLoading(true)
    setError('')

    const res = await fetch(`/api/tickets/public/${cleaned}`)
    if (!res.ok) {
      setError('Ticket introuvable. Vérifiez le numéro et réessayez.')
      setLoading(false)
      return
    }

    router.push(`/ticket/${cleaned}`)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50 flex flex-col">
      <header className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">🛠️</span>
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-sm leading-tight">IT Helpdesk</div>
            <div className="text-xs text-gray-500 leading-tight">{companyName}</div>
          </div>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md animate-slide-up">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">🔍</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Suivre mon ticket</h1>
            <p className="text-gray-500">Entrez le numéro de ticket reçu par e-mail</p>
          </div>

          <div className="card p-6">
            <label className="form-label">Numéro de ticket</label>
            <input
              className="form-input mb-3 font-mono text-center text-lg tracking-widest uppercase"
              placeholder="IT-2025-XXXXX"
              value={numero}
              onChange={e => { setNumero(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
                {error}
              </div>
            )}
            <button
              className="btn-primary w-full justify-center"
              onClick={handleSearch}
              disabled={loading || !numero.trim()}
            >
              {loading ? 'Recherche...' : 'Accéder à mon ticket'}
            </button>
          </div>

          <div className="text-center mt-6">
            <Link href="/ticket/new" className="text-sm text-brand-600 hover:underline">
              + Créer un nouveau ticket
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
