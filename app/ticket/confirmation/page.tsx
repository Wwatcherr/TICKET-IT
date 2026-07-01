'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ConfirmationContent() {
  const params = useSearchParams()
  const ticket = params.get('ticket')
  const email = params.get('email')

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center animate-slide-up">
        {/* Success icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">Demande envoyée !</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Votre ticket a bien été enregistré. Notre équipe informatique l'a reçu et va le traiter dans les meilleurs délais.
        </p>

        {/* Ticket number */}
        <div className="card p-6 mb-6 bg-brand-50 border-brand-200">
          <div className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-2">Numéro de ticket</div>
          <div className="text-3xl font-bold text-brand-700 font-mono tracking-wider">{ticket}</div>
          <div className="text-sm text-brand-600 mt-2">Conservez ce numéro pour toute question</div>
        </div>

        {/* Email notice */}
        {email && (
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 text-left mb-8">
            <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <div>
              <div className="text-sm font-medium text-blue-800">E-mail de confirmation envoyé</div>
              <div className="text-xs text-blue-600 mt-0.5">
                Un récapitulatif a été envoyé à <strong>{email}</strong>. Vérifiez vos spams si vous ne le recevez pas.
              </div>
            </div>
          </div>
        )}

        {/* What's next */}
        <div className="text-left card p-5 mb-8">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Prochaines étapes</div>
          <div className="space-y-3">
            {[
              { icon: '📧', text: 'Vous recevrez un e-mail de confirmation' },
              { icon: '👨‍💻', text: 'Un technicien analysera votre demande' },
              { icon: '💬', text: 'Il vous contactera par e-mail si besoin' },
              { icon: '✅', text: 'Vous serez notifié à la résolution' },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                <span className="text-base">{step.icon}</span>
                <span>{step.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/ticket/new" className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouveau ticket
          </Link>
          <Link href="/" className="btn-secondary">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <ConfirmationContent />
    </Suspense>
  )
}
