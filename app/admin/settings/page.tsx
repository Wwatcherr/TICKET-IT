'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { DEFAULT_SITES, DEFAULT_SERVICES } from '@/lib/config'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

function ListEditor({
  title, description, icon, items, onSave, saving
}: {
  title: string
  description: string
  icon: string
  items: string[]
  onSave: (items: string[]) => Promise<void>
  saving: boolean
}) {
  const [list, setList] = useState<string[]>(items)
  const [newItem, setNewItem] = useState('')
  const [dirty, setDirty] = useState(false)

  useEffect(() => { setList(items); setDirty(false) }, [items])

  const add = () => {
    const val = newItem.trim()
    if (!val || list.includes(val)) return
    setList(prev => [...prev, val])
    setNewItem('')
    setDirty(true)
  }

  const remove = (i: number) => {
    setList(prev => prev.filter((_, idx) => idx !== i))
    setDirty(true)
  }

  const move = (i: number, dir: -1 | 1) => {
    const next = [...list]
    const tmp = next[i]; next[i] = next[i + dir]; next[i + dir] = tmp
    setList(next)
    setDirty(true)
  }

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{icon}</span>
            <h3 className="font-semibold text-gray-900">{title}</h3>
          </div>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        {dirty && (
          <button className="btn-primary btn-sm" onClick={() => onSave(list)} disabled={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        )}
      </div>

      <div className="space-y-2 mb-4">
        {list.map((item, i) => (
          <div key={i} className="flex items-center gap-2 group">
            <div className="flex flex-col gap-0.5">
              <button onClick={() => i > 0 && move(i, -1)} disabled={i === 0} className="text-gray-300 hover:text-gray-500 disabled:opacity-20 text-xs leading-none">▲</button>
              <button onClick={() => i < list.length - 1 && move(i, 1)} disabled={i === list.length - 1} className="text-gray-300 hover:text-gray-500 disabled:opacity-20 text-xs leading-none">▼</button>
            </div>
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800">{item}</div>
            <button onClick={() => remove(i)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all text-sm px-2">✕</button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="form-input flex-1"
          placeholder={`Ajouter...`}
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
        />
        <button className="btn-secondary" onClick={add} disabled={!newItem.trim()}>Ajouter</button>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [copied, setCopied] = useState('')
  const [sites, setSites] = useState<string[]>([])
  const [services, setServices] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [savingSites, setSavingSites] = useState(false)
  const [savingServices, setSavingServices] = useState(false)

  useEffect(() => {
    fetch('/api/admin/config')
      .then(r => r.json())
      .then(data => {
        setSites(data.sites?.length ? data.sites : DEFAULT_SITES)
        setServices(data.services?.length ? data.services : DEFAULT_SERVICES)
      })
      .finally(() => setLoading(false))
  }, [])

  const saveSites = async (items: string[]) => {
    setSavingSites(true)
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'sites', value: items }),
      })
      if (!res.ok) throw new Error()
      setSites(items)
      toast.success('Sites mis à jour')
    } catch { toast.error('Erreur') } finally { setSavingSites(false) }
  }

  const saveServices = async (items: string[]) => {
    setSavingServices(true)
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'services', value: items }),
      })
      if (!res.ok) throw new Error()
      setServices(items)
      toast.success('Services mis à jour')
    } catch { toast.error('Erreur') } finally { setSavingServices(false) }
  }

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

      <div className="card p-6">
        <div className="section-title mb-4">🔗 Liens publics</div>
        <div className="space-y-4">
          {[
            { label: 'Portail de création de ticket', url: `${APP_URL}/ticket/new`, desc: 'Partagez ce lien aux salariés' },
            { label: "Page d'accueil", url: APP_URL, desc: "Page d'accueil du helpdesk" },
          ].map(item => (
            <div key={item.label} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 mb-0.5">{item.label}</div>
                  <div className="text-xs text-gray-500 mb-2">{item.desc}</div>
                  <div className="font-mono text-xs text-brand-600 bg-white border border-brand-100 rounded px-2 py-1 truncate">{item.url}</div>
                </div>
                <button className="btn-secondary btn-sm flex-shrink-0" onClick={() => copyLink(item.url, item.label)}>
                  {copied === item.label ? '✓ Copié' : 'Copier'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="card p-8 text-center">
          <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <>
          <ListEditor title="Sites" description="Sites disponibles dans le formulaire de ticket et d'inscription." icon="🏢" items={sites} onSave={saveSites} saving={savingSites} />
          <ListEditor title="Services / Équipes" description="Services disponibles dans le formulaire de ticket et d'inscription." icon="🏗️" items={services} onSave={saveServices} saving={savingServices} />
        </>
      )}

      <div className="card p-6">
        <div className="section-title mb-4">⚙️ Configuration technique</div>
        <div className="space-y-3 text-sm">
          {[
            { key: 'NEXT_PUBLIC_APP_URL', desc: "URL de l'application" },
            { key: 'NEXT_PUBLIC_COMPANY_NAME', desc: "Nom de l'entreprise" },
            { key: 'SMTP_HOST', desc: 'Serveur SMTP' },
            { key: 'SMTP_USER', desc: 'Compte e-mail expéditeur' },
            { key: 'ADMIN_EMAIL', desc: "E-mail de l'administrateur" },
          ].map(item => (
            <div key={item.key} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
              <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono w-52 flex-shrink-0 truncate">{item.key}</code>
              <span className="text-gray-500 text-sm">{item.desc}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4">Variables configurées dans Vercel → Environment Variables.</p>
      </div>
    </div>
  )
}
