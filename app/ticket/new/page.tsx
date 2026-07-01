'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { SITES, SERVICES, CATEGORY_CONFIG } from '@/lib/utils'
import type { TicketCategory, TicketPriority } from '@/types'

const PRIORITIES: { value: TicketPriority; label: string; desc: string; color: string }[] = [
  { value: 'faible',    label: 'Faible',     desc: 'Peut attendre',         color: 'gray' },
  { value: 'normale',   label: 'Normale',    desc: 'À traiter bientôt',     color: 'blue' },
  { value: 'urgente',   label: 'Urgente',    desc: 'Impact sur le travail', color: 'orange' },
  { value: 'bloquante', label: 'Bloquante',  desc: 'Travail impossible',    color: 'red' },
]

const PRIORITY_STYLES: Record<string, string> = {
  gray:   'border-gray-300 bg-gray-50 text-gray-700 ring-gray-400',
  blue:   'border-blue-300 bg-blue-50 text-blue-700 ring-blue-400',
  orange: 'border-orange-300 bg-orange-50 text-orange-700 ring-orange-400',
  red:    'border-red-300 bg-red-50 text-red-700 ring-red-400',
}

export default function NewTicketPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<File[]>([])

  const [form, setForm] = useState({
    requester_name: '',
    requester_email: '',
    requester_service: '',
    requester_site: '',
    request_date: new Date().toISOString().split('T')[0],
    affected_person: '',
    category: '' as TicketCategory | '',
    priority: 'normale' as TicketPriority,
    title: '',
    description: '',
    equipment: '',
    email_consent: false,
  })

  const onDrop = useCallback((accepted: File[]) => {
    setFiles(prev => [...prev, ...accepted].slice(0, 5))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 10 * 1024 * 1024,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
  })

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const step1Valid = form.requester_name && form.requester_email && form.requester_service && form.requester_site
  const step2Valid = form.category && form.priority
  const step3Valid = form.title && form.description && form.email_consent

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([k, v]) => formData.append(k, String(v)))
      files.forEach(f => formData.append('files', f))

      const res = await fetch('/api/tickets', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Erreur lors de la création')

      router.push(`/ticket/confirmation?ticket=${data.ticket_number}&email=${encodeURIComponent(form.requester_email)}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <span className="text-base">🛠️</span>
            </div>
            <span className="font-semibold text-gray-800">IT Helpdesk</span>
          </Link>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <button
                  onClick={() => step > s && setStep(s)}
                  className={`w-7 h-7 rounded-full text-xs font-semibold transition-all ${
                    step === s
                      ? 'bg-brand-600 text-white scale-110'
                      : step > s
                      ? 'bg-brand-100 text-brand-700 cursor-pointer hover:bg-brand-200'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {step > s ? '✓' : s}
                </button>
                {s < 3 && <div className={`w-8 h-0.5 ${step > s ? 'bg-brand-300' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Step 1: Identity */}
        {step === 1 && (
          <div className="animate-slide-up">
            <div className="mb-8">
              <div className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-2">Étape 1 / 3</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Vos coordonnées</h1>
              <p className="text-gray-500">Ces informations nous permettent de vous recontacter.</p>
            </div>

            <div className="card p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="form-label">Nom et prénom <span className="text-red-500">*</span></label>
                  <input className="form-input" placeholder="Jean Dupont" value={form.requester_name} onChange={e => set('requester_name', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">E-mail professionnel <span className="text-red-500">*</span></label>
                  <input className="form-input" type="email" placeholder="jean.dupont@entreprise.fr" value={form.requester_email} onChange={e => set('requester_email', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="form-label">Service / équipe <span className="text-red-500">*</span></label>
                  <select className="form-select" value={form.requester_service} onChange={e => set('requester_service', e.target.value)}>
                    <option value="">Sélectionner...</option>
                    {SERVICES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Site concerné <span className="text-red-500">*</span></label>
                  <select className="form-select" value={form.requester_site} onChange={e => set('requester_site', e.target.value)}>
                    <option value="">Sélectionner...</option>
                    {SITES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="form-label">Date de la demande</label>
                  <input className="form-input" type="date" value={form.request_date} onChange={e => set('request_date', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Personne concernée <span className="text-gray-400 font-normal">(si différente)</span></label>
                  <input className="form-input" placeholder="Nom prénom du collègue" value={form.affected_person} onChange={e => set('affected_person', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button className="btn-primary btn-lg" onClick={() => setStep(2)} disabled={!step1Valid}>
                Continuer
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Category & Priority */}
        {step === 2 && (
          <div className="animate-slide-up">
            <div className="mb-8">
              <div className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-2">Étape 2 / 3</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Type de problème</h1>
              <p className="text-gray-500">Aidez-nous à comprendre votre situation.</p>
            </div>

            <div className="card p-6 mb-5">
              <label className="form-label mb-4 block">Catégorie <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-3 gap-3">
                {(Object.entries(CATEGORY_CONFIG) as [TicketCategory, { label: string; emoji: string }][]).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => set('category', key)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all duration-150 ${
                      form.category === key
                        ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200'
                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-2xl">{cfg.emoji}</span>
                    <span className="text-xs font-medium text-gray-700">{cfg.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <label className="form-label mb-4 block">Niveau d'urgence <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 gap-3">
                {PRIORITIES.map(p => (
                  <button
                    key={p.value}
                    onClick={() => set('priority', p.value)}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-150 ${
                      form.priority === p.value
                        ? `${PRIORITY_STYLES[p.color]} ring-2`
                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 bg-${p.color === 'gray' ? 'gray-400' : p.color + '-500'}`} />
                    <div>
                      <div className="text-sm font-semibold">{p.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{p.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button className="btn-secondary btn-lg" onClick={() => setStep(1)}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Retour
              </button>
              <button className="btn-primary btn-lg" onClick={() => setStep(3)} disabled={!step2Valid}>
                Continuer
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Description & Submit */}
        {step === 3 && (
          <div className="animate-slide-up">
            <div className="mb-8">
              <div className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-2">Étape 3 / 3</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Décrivez votre problème</h1>
              <p className="text-gray-500">Plus vous êtes précis, plus nous pourrons vous aider rapidement.</p>
            </div>

            <div className="card p-6 space-y-5">
              <div>
                <label className="form-label">Titre du problème <span className="text-red-500">*</span></label>
                <input
                  className="form-input"
                  placeholder="Ex: Mon ordinateur ne démarre plus ce matin"
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  maxLength={120}
                />
                <div className="text-xs text-gray-400 mt-1 text-right">{form.title.length}/120</div>
              </div>

              <div>
                <label className="form-label">Description détaillée <span className="text-red-500">*</span></label>
                <textarea
                  className="form-textarea"
                  rows={5}
                  placeholder="Décrivez le problème en détail : que s'est-il passé ? Depuis quand ? Quelles étapes avez-vous déjà essayé ? Tout détail nous aide à résoudre plus vite."
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">Matériel concerné <span className="text-gray-400 font-normal">(optionnel)</span></label>
                <input
                  className="form-input"
                  placeholder="Ex: PC-JEAN-001, Imprimante HP couloir 2e étage..."
                  value={form.equipment}
                  onChange={e => set('equipment', e.target.value)}
                />
              </div>

              {/* File upload */}
              <div>
                <label className="form-label">Captures d'écran / fichiers <span className="text-gray-400 font-normal">(optionnel, max 5 fichiers)</span></label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                    isDragActive
                      ? 'border-brand-400 bg-brand-50'
                      : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="text-2xl mb-2">📎</div>
                  <p className="text-sm text-gray-600">
                    {isDragActive ? 'Déposez les fichiers ici' : 'Glissez-déposez vos fichiers ici, ou cliquez pour parcourir'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF, DOC · Max 10 Mo par fichier</p>
                </div>
                {files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <span>📄</span>
                          <span className="truncate max-w-[200px]">{f.name}</span>
                          <span className="text-gray-400 text-xs">({(f.size / 1024).toFixed(0)} Ko)</span>
                        </div>
                        <button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-500 transition-colors ml-2">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Consent */}
              <div className={`rounded-xl border-2 p-4 transition-all cursor-pointer ${form.email_consent ? 'border-brand-300 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}
                onClick={() => set('email_consent', !form.email_consent)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 flex items-center justify-center border-2 transition-all ${form.email_consent ? 'bg-brand-600 border-brand-600' : 'border-gray-300'}`}>
                    {form.email_consent && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" /></svg>}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">J'accepte d'être contacté par e-mail pour le suivi de mon ticket <span className="text-red-500">*</span></div>
                    <div className="text-xs text-gray-500 mt-0.5">Vous recevrez des notifications à chaque mise à jour de votre demande.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-5 card p-4 bg-gray-50">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Récapitulatif</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Demandeur :</span> <strong>{form.requester_name}</strong></div>
                <div><span className="text-gray-500">Site :</span> <strong>{form.requester_site}</strong></div>
                <div><span className="text-gray-500">Catégorie :</span> <strong>{form.category ? CATEGORY_CONFIG[form.category].label : '—'}</strong></div>
                <div><span className="text-gray-500">Urgence :</span> <strong>{PRIORITIES.find(p => p.value === form.priority)?.label}</strong></div>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button className="btn-secondary btn-lg" onClick={() => setStep(2)}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Retour
              </button>
              <button className="btn-primary btn-lg" onClick={handleSubmit} disabled={!step3Valid || loading}>
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Envoi...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Envoyer ma demande
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
