-- ============================================================
-- IT HELPDESK — Schéma Supabase complet
-- À exécuter dans : Supabase Dashboard > SQL Editor
-- ============================================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ───────────────────────────────────────────────
-- TABLE: admin_users (profils des admins)
-- ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL UNIQUE,
  full_name   TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'technicien' CHECK (role IN ('admin', 'technicien', 'lecture')),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ───────────────────────────────────────────────
-- TABLE: tickets
-- ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tickets (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number       TEXT NOT NULL UNIQUE,
  title               TEXT NOT NULL,
  description         TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'nouveau'
                      CHECK (status IN ('nouveau','en_cours','en_attente_utilisateur','en_attente_fournisseur','resolu','ferme')),
  priority            TEXT NOT NULL DEFAULT 'normale'
                      CHECK (priority IN ('faible','normale','urgente','bloquante')),
  category            TEXT NOT NULL
                      CHECK (category IN ('ordinateur','imprimante','mail','teams','reseau','telephone','logiciel','acces','autre')),
  requester_name      TEXT NOT NULL,
  requester_email     TEXT NOT NULL,
  requester_service   TEXT NOT NULL,
  requester_site      TEXT NOT NULL,
  request_date        DATE,
  affected_person     TEXT,
  equipment           TEXT,
  email_consent       BOOLEAN DEFAULT TRUE,
  assigned_to         UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  attachments         TEXT[],
  merged_into         UUID REFERENCES tickets(id),
  resolved_at         TIMESTAMPTZ,
  closed_at           TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_tickets_status   ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category);
CREATE INDEX IF NOT EXISTS idx_tickets_created  ON tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_number   ON tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON tickets(assigned_to);

-- ───────────────────────────────────────────────
-- TABLE: ticket_messages (conversation)
-- ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ticket_messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id       UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_name     TEXT NOT NULL,
  author_email    TEXT,
  author_role     TEXT NOT NULL DEFAULT 'user'
                  CHECK (author_role IN ('user','admin','technicien')),
  content         TEXT NOT NULL,
  attachments     TEXT[],
  is_email_reply  BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_ticket ON ticket_messages(ticket_id, created_at);

-- ───────────────────────────────────────────────
-- TABLE: ticket_notes (notes internes)
-- ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ticket_notes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id   UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_id   UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_ticket ON ticket_notes(ticket_id);

-- ───────────────────────────────────────────────
-- TABLE: ticket_activities (journal)
-- ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ticket_activities (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id     UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  action        TEXT NOT NULL,
  old_value     TEXT,
  new_value     TEXT,
  performed_by  TEXT NOT NULL DEFAULT 'Système',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_ticket ON ticket_activities(ticket_id, created_at);

-- ───────────────────────────────────────────────
-- TRIGGER: updated_at automatique
-- ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON tickets;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ───────────────────────────────────────────────
-- STORAGE: bucket pour les pièces jointes
-- ───────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ticket-attachments',
  'ticket-attachments',
  true,
  10485760, -- 10 MB
  ARRAY['image/jpeg','image/png','image/gif','image/webp','application/pdf',
        'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- ───────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ───────────────────────────────────────────────

-- Tickets: lecture publique (pour les API routes avec service_role), insertion publique
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert tickets"
  ON tickets FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can view all tickets"
  ON tickets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can update tickets"
  ON tickets FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can delete tickets"
  ON tickets FOR DELETE
  TO authenticated
  USING (true);

-- Messages: lecture publique (nécessaire pour la API route)
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert messages"
  ON ticket_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can view messages"
  ON ticket_messages FOR SELECT
  TO authenticated
  USING (true);

-- Notes: réservées aux authentifiés
ALTER TABLE ticket_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can manage notes"
  ON ticket_notes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Activities: réservées aux authentifiés
ALTER TABLE ticket_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can manage activities"
  ON ticket_activities FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Admin users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can update own profile"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Storage
CREATE POLICY "Public can upload attachments"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'ticket-attachments');

CREATE POLICY "Public can view attachments"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'ticket-attachments');

-- ───────────────────────────────────────────────
-- DONNÉES DE TEST (optionnel — à supprimer en prod)
-- ───────────────────────────────────────────────

/*
-- Insérez un ticket de test pour vérifier l'installation
INSERT INTO tickets (
  ticket_number, title, description, status, priority, category,
  requester_name, requester_email, requester_service, requester_site,
  email_consent
) VALUES (
  'IT-2025-00001',
  'Ordinateur ne démarre plus',
  'Ce matin en arrivant, mon PC ne s''est pas allumé. L''écran reste noir malgré plusieurs tentatives.',
  'nouveau', 'urgente', 'ordinateur',
  'Jean Dupont', 'jean.dupont@entreprise.fr', 'Comptabilité / Finance', 'Siège social',
  true
);
*/

-- ───────────────────────────────────────────────
-- NOTE: Créez votre premier admin manuellement
-- après avoir créé le compte via Supabase Auth :
--
-- INSERT INTO admin_users (id, email, full_name, role)
-- VALUES ('VOTRE-UUID-AUTH', 'admin@entreprise.fr', 'Votre Nom', 'admin');
-- ───────────────────────────────────────────────
