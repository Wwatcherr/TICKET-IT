import Link from 'next/link'

export default function HomePage() {
  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Mon Entreprise'

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50 flex flex-col">
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">🛠️</span>
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-sm leading-tight">IT Helpdesk</div>
            <div className="text-xs text-gray-500 leading-tight">{companyName}</div>
          </div>
        </div>
        <Link href="/admin" className="btn-secondary btn-sm">
          <span>Espace admin</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse"></span>
          Service disponible 24h/24
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-tight text-balance max-w-3xl">
          Besoin d'aide
          <span className="text-brand-600"> informatique ?</span>
        </h1>

        <p className="text-lg text-gray-500 mb-10 max-w-xl leading-relaxed">
          Signalez votre problème en quelques clics. Notre équipe IT reçoit votre demande
          instantanément et vous répond rapidement.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link href="/ticket/new" className="btn-primary btn-lg group">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Créer un ticket
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link href="/ticket/status" className="btn-secondary btn-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Suivre mon ticket
          </Link>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full">
          {[
            {
              icon: '⚡',
              title: 'Rapide',
              desc: 'Formulaire simplifié, moins de 2 minutes pour créer votre ticket',
            },
            {
              icon: '📨',
              title: 'Notifié',
              desc: 'Recevez un e-mail de confirmation et à chaque mise à jour',
            },
            {
              icon: '🔒',
              title: 'Sécurisé',
              desc: 'Vos données restent au sein de l\'entreprise',
            },
          ].map((f) => (
            <div key={f.title} className="card p-6 text-left hover:shadow-soft transition-shadow">
              <div className="text-2xl mb-3">{f.icon}</div>
              <div className="font-semibold text-gray-900 mb-1">{f.title}</div>
              <div className="text-sm text-gray-500 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-gray-400 border-t border-gray-100">
        {companyName} · IT Helpdesk · {new Date().getFullYear()}
      </footer>
    </main>
  )
}
