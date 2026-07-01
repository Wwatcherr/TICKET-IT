'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { SITES, SERVICES } from '@/lib/utils'
import Link from 'next/link'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export default function SettingsPage() {
  const [copied, setCopied] = useState('')

  const copyLink = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    toast.success('Lien copié !')
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="page-title">Paramètres</h1>
        <p className="text-sm text-gray-500 mt-1">Configuration de votre helpdesk</p>
      </div>

      {/* Public links */}
      <div className="card p-6">
        <div className="section-title mb-4">🔗 Liens publics</div>
        <div className="space-y-4">
          {[
            { label: 'Portail de création de ticket', url: `${APP_URL}/ticket/new`, desc: 'Partagez ce lien aux salariés pour qu\'ils créent leurs tickets' },
            { label: 'Page d\'accueil', url: APP_URL, desc: 'Page d\'accueil du helpdesk' },
          ].map(item => (
            <div key={item.label} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 mb-0.5">{item.label}</div>
                  <div className="text-xs text-gray-500 mb-2">{item.desc}</div>
                  <div className="font-mono text-xs text-brand-600 bg-white border border-brand-100 rounded px-2 py-1 truncate">
                    {item.url}
                  </div>
                </div>
                <button
                  className="btn-secondary btn-sm flex-shrink-0"
                  onClick={() => copyLink(item.url, item.label)}
                >
                  {copied === item.label ? '✓ Copié' : 'Copier'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sites */}
      <div className="card p-6">
        <div className="section-title mb-1">🏢 Sites configurés</div>
        <p className="text-sm text-gray-500 mb-4">Ces sites apparaissent dans le formulaire de création de ticket.</p>
        <div className="flex flex-wrap gap-2">
          {SITES.map(s => (
            <span key={s} className="bg-gray-100 text-gray-700 text-sm px-3 py-1.5 rounded-lg border border-gray-200">
              {s}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">Pour modifier la liste, éditez <code className="bg-gray-100 px-1 rounded">lib/utils.ts</code></p>
      </div>

      {/* Services */}
      <div className="card p-6">
        <div className="section-title mb-1">🏗️ Services / Équipes</div>
        <p className="text-sm text-gray-500 mb-4">Services disponibles dans le formulaire.</p>
        <div className="flex flex-wrap gap-2">
          {SERVICES.map(s => (
            <span key={s} className="bg-gray-100 text-gray-700 text-sm px-3 py-1.5 rounded-lg border border-gray-200">
              {s}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">Pour modifier la liste, éditez <code className="bg-gray-100 px-1 rounded">lib/utils.ts</code></p>
      </div>

      {/* Env config */}
      <div className="card p-6">
        <div className="section-title mb-4">⚙️ Configuration technique</div>
        <div className="space-y-3 text-sm">
          {[
            { key: 'NEXT_PUBLIC_APP_URL', desc: 'URL de l\'application' },
            { key: 'NEXT_PUBLIC_COMPANY_NAME', desc: 'Nom de l\'entreprise' },
            { key: 'SMTP_HOST', desc: 'Serveur SMTP (emails)' },
            { key: 'SMTP_USER', desc: 'Compte e-mail expéditeur' },
            { key: 'ADMIN_EMAIL', desc: 'E-mail de l\'administrateur principal' },
          ].map(item => (
            <div key={item.key} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
              <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono w-52 flex-shrink-0 truncate">
                {item.key}
              </code>
              <span className="text-gray-500 text-sm">{item.desc}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4">
          Ces variables se configurent dans votre fichier <code className="bg-gray-100 px-1 rounded">.env.local</code> ou dans les variables d'environnement Vercel.
        </p>
      </div>

      {/* About */}
      <div className="card p-6 bg-gradient-to-br from-brand-50 to-white border-brand-100">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-xl">🛠️</span>
          </div>
          <div>
            <div className="font-semibold text-gray-900 mb-1">IT Helpdesk v1.0</div>
            <p className="text-sm text-gray-600 mb-3">
              Application open-source de gestion des tickets IT. Construite avec Next.js, Supabase et Tailwind CSS.
              Hébergée gratuitement sur Vercel.
            </p>
            <div className="flex gap-2">
              <Link href="/ticket/new" target="_blank" className="btn-primary btn-sm">
                Voir le portail →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
