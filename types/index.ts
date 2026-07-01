export type TicketStatus = 
  | 'nouveau'
  | 'en_cours'
  | 'en_attente_utilisateur'
  | 'en_attente_fournisseur'
  | 'resolu'
  | 'ferme'

export type TicketPriority = 'faible' | 'normale' | 'urgente' | 'bloquante'

export type TicketCategory =
  | 'ordinateur'
  | 'imprimante'
  | 'mail'
  | 'teams'
  | 'reseau'
  | 'telephone'
  | 'logiciel'
  | 'acces'
  | 'autre'

export type UserRole = 'admin' | 'technicien' | 'lecture'

export interface Ticket {
  id: string
  ticket_number: string
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  category: TicketCategory
  requester_name: string
  requester_email: string
  requester_service: string
  requester_site: string
  affected_person?: string
  equipment?: string
  request_date: string
  email_consent: boolean
  assigned_to?: string
  attachments?: string[]
  merged_into?: string
  created_at: string
  updated_at: string
  resolved_at?: string
  closed_at?: string
  // Joined fields
  assigned_user?: AdminUser
  messages?: TicketMessage[]
  notes?: TicketNote[]
}

export interface TicketMessage {
  id: string
  ticket_id: string
  author_name: string
  author_email: string
  author_role: 'user' | 'admin' | 'technicien'
  content: string
  attachments?: string[]
  is_email_reply: boolean
  created_at: string
}

export interface TicketNote {
  id: string
  ticket_id: string
  author_id: string
  content: string
  created_at: string
  author?: AdminUser
}

export interface TicketActivity {
  id: string
  ticket_id: string
  action: string
  old_value?: string
  new_value?: string
  performed_by: string
  created_at: string
}

export interface AdminUser {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url?: string
  created_at: string
}

export interface DashboardStats {
  total_open: number
  in_progress: number
  urgent: number
  resolved_today: number
  total_tickets: number
  avg_resolution_hours?: number
}

export interface TicketFilter {
  search?: string
  status?: TicketStatus | 'all'
  priority?: TicketPriority | 'all'
  category?: TicketCategory | 'all'
  site?: string
  assigned_to?: string
  date_from?: string
  date_to?: string
  sort_by?: 'created_at' | 'updated_at' | 'priority' | 'status'
  sort_order?: 'asc' | 'desc'
  page?: number
  per_page?: number
}
