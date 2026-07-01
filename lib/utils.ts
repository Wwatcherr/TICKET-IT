import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { TicketStatus, TicketPriority, TicketCategory } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateTicketNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 90000) + 10000
  return `IT-${year}-${random}`
}

export const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string; bg: string; dot: string }> = {
  nouveau: {
    label: 'Nouveau',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
    dot: 'bg-blue-500',
  },
  en_cours: {
    label: 'En cours',
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    dot: 'bg-amber-500',
  },
  en_attente_utilisateur: {
    label: 'Attente utilisateur',
    color: 'text-purple-700',
    bg: 'bg-purple-50 border-purple-200',
    dot: 'bg-purple-500',
  },
  en_attente_fournisseur: {
    label: 'Attente fournisseur',
    color: 'text-orange-700',
    bg: 'bg-orange-50 border-orange-200',
    dot: 'bg-orange-500',
  },
  resolu: {
    label: 'Résolu',
    color: 'text-green-700',
    bg: 'bg-green-50 border-green-200',
    dot: 'bg-green-500',
  },
  ferme: {
    label: 'Fermé',
    color: 'text-gray-600',
    bg: 'bg-gray-50 border-gray-200',
    dot: 'bg-gray-400',
  },
}

export const PRIORITY_CONFIG: Record<TicketPriority, { label: string; color: string; bg: string; icon: string }> = {
  faible: {
    label: 'Faible',
    color: 'text-gray-600',
    bg: 'bg-gray-50',
    icon: '↓',
  },
  normale: {
    label: 'Normale',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    icon: '→',
  },
  urgente: {
    label: 'Urgente',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    icon: '↑',
  },
  bloquante: {
    label: 'Bloquante',
    color: 'text-red-600',
    bg: 'bg-red-50',
    icon: '⚡',
  },
}

export const CATEGORY_CONFIG: Record<TicketCategory, { label: string; emoji: string }> = {
  ordinateur:  { label: 'Ordinateur',  emoji: '💻' },
  imprimante:  { label: 'Imprimante',  emoji: '🖨️' },
  mail:        { label: 'Mail',        emoji: '📧' },
  teams:       { label: 'Teams',       emoji: '💬' },
  reseau:      { label: 'Réseau',      emoji: '🌐' },
  telephone:   { label: 'Téléphone',   emoji: '📱' },
  logiciel:    { label: 'Logiciel',    emoji: '⚙️' },
  acces:       { label: 'Accès',       emoji: '🔑' },
  autre:       { label: 'Autre',       emoji: '❓' },
}

export const SITES = [
  'Siège social',
  'Agence Lyon',
  'Agence Paris',
  'Agence Marseille',
  'Entrepôt',
  'Télétravail',
  'Autre',
]

export const SERVICES = [
  'Informatique',
  'Ressources Humaines',
  'Comptabilité / Finance',
  'Commercial / Ventes',
  'Marketing',
  'Direction',
  'Logistique',
  'Production',
  'Qualité',
  'Autre',
]

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options,
  })
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function timeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "À l'instant"
  if (minutes < 60) return `Il y a ${minutes} min`
  if (hours < 24) return `Il y a ${hours}h`
  if (days < 7) return `Il y a ${days}j`
  return formatDate(d)
}
