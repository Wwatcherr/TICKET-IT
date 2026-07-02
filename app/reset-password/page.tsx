'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${appUrl}/reset-password/confirm`,
      })
      if (error) throw error
      setSent(true)
    } catch {
      toast.error('Erreur lors de l\'envoi. Vérifiez l\'adresse e-mail.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔑</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Mot de passe oublié</h1>
          <p className="text-gray-500 text-sm">Entrez votre email pour recevoir un lien de réinitialisation</p>
        </div>

        <div className="card p-8">
          {sent ? (
            <div className="text-center">
              <div className="text-4xl mb-4">📧</div>
              <h3 className="font-semibold text-gray-900 mb-2">E-mail envoyé !</h3>
              <p className="text-sm text-gray-500 mb-6">
                Vérifiez votre boîte mail et cliquez sur le lien pour réinitialiser votre mot de passe.
              </p>
              <Link href="/login" className="btn-primary w-full justify-center">
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="form-label">Adresse e-mail</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="prenom.nom@entreprise.fr"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                {loading ? 'Envoi...' : 'Envoyer le lien'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/login" className="text-brand-600 hover:underline">← Retour à la connexion</Link>
        </p>
      </div>
    </main>
  )
}
