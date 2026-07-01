# 🛠️ IT Helpdesk — Application complète de gestion de tickets

Application web professionnelle de gestion des tickets IT, construite avec **Next.js 14**, **Supabase** et **Tailwind CSS**. Hébergement **100% gratuit** sur Vercel + Supabase.

---

## ✨ Fonctionnalités

### Portail Utilisateur (public)
- ✅ Formulaire de création de ticket en **3 étapes guidées**
- ✅ Sélection de catégorie visuelle (9 types de problèmes)
- ✅ Niveaux d'urgence (Faible, Normale, Urgente, Bloquante)
- ✅ Upload de captures d'écran et fichiers (max 10 Mo / fichier)
- ✅ Numéro de ticket unique généré automatiquement
- ✅ E-mail de confirmation automatique
- ✅ Page de confirmation avec récapitulatif
- ✅ Design responsive (mobile, tablette, ordinateur)

### Interface Administrateur
- ✅ Connexion sécurisée (Supabase Auth)
- ✅ **Tableau de bord** avec statistiques en temps réel
- ✅ **Graphiques** : tickets par semaine, par statut, par catégorie
- ✅ **Liste de tickets** avec recherche instantanée et filtres avancés
- ✅ Tri par date, priorité, statut, catégorie
- ✅ **Détail ticket** avec conversation intégrée style messagerie
- ✅ Changement de statut, priorité, technicien assigné
- ✅ **Notes internes** invisibles pour le demandeur
- ✅ Fermeture/réouverture de ticket
- ✅ **Export Excel et CSV**
- ✅ Impression d'un ticket
- ✅ Historique complet des actions

### Notifications Email
- ✅ Création du ticket → confirmation au demandeur
- ✅ Création du ticket → notification à l'admin
- ✅ Réponse de l'équipe IT → notification au demandeur
- ✅ Changement de statut → notification au demandeur
- ✅ Objets e-mail avec numéro de ticket (`[Ticket IT #xxxx]`)
- ✅ Templates HTML responsive et professionnels

### Gestion des utilisateurs
- ✅ Rôles : **Administrateur**, **Technicien**, **Lecture seule**
- ✅ Création de comptes depuis l'interface

---

## 🚀 Installation (30 minutes)

### Prérequis
- Compte [GitHub](https://github.com) (gratuit)
- Compte [Supabase](https://supabase.com) (gratuit)
- Compte [Vercel](https://vercel.com) (gratuit)

---

### Étape 1 — Configurer Supabase

1. Allez sur [supabase.com](https://supabase.com) → **New project**
2. Choisissez un nom, un mot de passe et une région (ex: Frankfurt EU)
3. Attendez la création (environ 1 minute)
4. Dans le menu gauche → **SQL Editor** → **New query**
5. Copiez tout le contenu du fichier `supabase-schema.sql` et exécutez-le
6. Notez vos clés dans **Settings → API** :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

### Étape 2 — Créer votre compte administrateur

Dans Supabase → **Authentication → Users → Add user** :
1. Renseignez votre email et un mot de passe fort
2. Notez l'UUID de l'utilisateur créé
3. Dans **SQL Editor**, exécutez :

```sql
INSERT INTO admin_users (id, email, full_name, role)
VALUES (
  'REMPLACEZ-PAR-VOTRE-UUID',
  'votre@email.fr',
  'Votre Nom',
  'admin'
);
```

### Étape 3 — Configurer l'email SMTP

**Option A — Gmail (recommandé pour débuter)**
1. Activez la [validation en 2 étapes](https://myaccount.google.com/security) sur votre compte Google
2. Allez dans **Sécurité → Mots de passe des applications**
3. Créez un mot de passe d'application "Messagerie"
4. Utilisez ces paramètres :
   - `SMTP_HOST=smtp.gmail.com`
   - `SMTP_PORT=587`
   - `SMTP_USER=votre@gmail.com`
   - `SMTP_PASS=le mot de passe d'application généré`

**Option B — OVH / Ionos / votre hébergeur**
Consultez la documentation SMTP de votre hébergeur.

**Option C — Brevo (anciennement Sendinblue) — recommandé en production**
[brevo.com](https://brevo.com) → 300 emails/jour gratuits

### Étape 4 — Déployer sur Vercel

1. Forkez ce dépôt GitHub (ou importez votre dossier)
2. Allez sur [vercel.com](https://vercel.com) → **New Project**
3. Importez votre dépôt GitHub
4. Dans **Environment Variables**, ajoutez :

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre@email.fr
SMTP_PASS=votre_mot_de_passe_app
SMTP_FROM=IT Helpdesk <helpdesk@votre-entreprise.fr>
ADMIN_EMAIL=admin@votre-entreprise.fr
NEXT_PUBLIC_APP_URL=https://votre-app.vercel.app
NEXT_PUBLIC_COMPANY_NAME=Mon Entreprise
```

5. Cliquez **Deploy** → Votre app est en ligne !

### Étape 5 — Configurer l'URL Supabase

Dans Supabase → **Authentication → URL Configuration** :
- **Site URL** : `https://votre-app.vercel.app`
- **Redirect URLs** : `https://votre-app.vercel.app/**`

---

## 💻 Développement local

```bash
# Cloner le projet
git clone https://github.com/votre-repo/helpdesk-it.git
cd helpdesk-it

# Installer les dépendances
npm install

# Copier et remplir les variables d'environnement
cp .env.local.example .env.local
# → Éditez .env.local avec vos clés

# Lancer le serveur de développement
npm run dev
# → App disponible sur http://localhost:3000
```

---

## 📁 Structure du projet

```
helpdesk-it/
├── app/
│   ├── page.tsx                    # Page d'accueil publique
│   ├── ticket/
│   │   ├── new/page.tsx            # Formulaire de ticket (3 étapes)
│   │   └── confirmation/page.tsx  # Page de confirmation
│   ├── admin/
│   │   ├── page.tsx               # Page de connexion
│   │   ├── layout.tsx             # Layout admin avec sidebar
│   │   ├── dashboard/page.tsx     # Tableau de bord
│   │   ├── tickets/
│   │   │   ├── page.tsx           # Liste des tickets
│   │   │   └── [id]/page.tsx      # Détail ticket
│   │   ├── users/page.tsx         # Gestion utilisateurs
│   │   └── settings/page.tsx      # Paramètres
│   └── api/
│       ├── tickets/               # CRUD tickets + messages + notes
│       └── admin/                 # Stats, export, users
├── lib/
│   ├── supabase/                  # Client browser + server
│   ├── email.ts                   # Service email (Nodemailer)
│   └── utils.ts                   # Utilitaires et constantes
├── types/index.ts                 # Types TypeScript
├── supabase-schema.sql            # Schéma base de données complet
└── middleware.ts                  # Protection routes admin
```

---

## 🎨 Personnalisation

### Changer les couleurs
Dans `tailwind.config.js`, modifiez la section `brand` pour utiliser vos couleurs d'entreprise.

### Ajouter/modifier les sites
Dans `lib/utils.ts`, modifiez le tableau `SITES`.

### Ajouter/modifier les services
Dans `lib/utils.ts`, modifiez le tableau `SERVICES`.

### Logo de l'entreprise
Remplacez le texte "🛠️ IT Helpdesk" dans les layouts par votre logo.

---

## 📧 Structure des emails

Les e-mails sont envoyés automatiquement via SMTP dans les cas suivants :

| Événement | Destinataire |
|-----------|-------------|
| Ticket créé | Demandeur + Admin |
| Réponse IT | Demandeur |
| Changement de statut | Demandeur |
| Ticket résolu/fermé | Demandeur |

---

## 🔒 Sécurité

- Authentification via Supabase Auth (JWT)
- Middleware Next.js pour protéger les routes `/admin/*`
- Row Level Security (RLS) activé sur toutes les tables
- La clé `service_role` n'est jamais exposée côté client
- Upload de fichiers avec vérification des types MIME

---

## 💰 Coûts (100% gratuit pour commencer)

| Service | Plan gratuit |
|---------|-------------|
| **Vercel** | 100 GB bande passante/mois |
| **Supabase** | 500 MB base de données, 1 GB storage |
| **Gmail SMTP** | 500 emails/jour |
| **Brevo** | 300 emails/jour |

---

## 🆘 Problèmes courants

**Les e-mails ne s'envoient pas**
→ Vérifiez vos variables `SMTP_*`. Avec Gmail, utilisez un "mot de passe d'application" et non votre mot de passe habituel.

**Erreur de connexion admin**
→ Vérifiez que l'utilisateur existe dans `auth.users` ET dans `admin_users` avec le même UUID.

**Le schéma SQL donne des erreurs**
→ Exécutez les sections une par une dans l'éditeur SQL Supabase.

**Le stockage des fichiers ne fonctionne pas**
→ Vérifiez que le bucket `ticket-attachments` est créé dans Supabase Storage (Section Storage du dashboard).

---

## 📄 Licence

MIT — Libre d'utilisation, modification et distribution.
