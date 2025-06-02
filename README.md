# 🍹 Cocktail Tracker

Une plateforme sociale moderne pour partager, découvrir et évaluer des recettes de cocktails. Construite avec SvelteKit et Supabase, Cocktail Tracker permet aux passionnés de mixologie de créer leur propre communauté de cocktails.

## ✨ Fonctionnalités

### 🔐 Authentification sécurisée
- **Inscription/Connexion** avec validation robuste des mots de passe
- **Sessions sécurisées** avec tokens cryptographiques et expiration automatique
- **Protection contre les attaques** : rate limiting, validation des entrées, protection CSRF
- **Hachage sécurisé** des mots de passe avec SHA-256 et sel unique

### 🍸 Gestion des cocktails
- **Création de recettes** avec titre et liste d'ingrédients
- **Affichage en grille** responsive et moderne
- **Page détaillée** pour chaque cocktail avec informations complètes
- **Suppression** de ses propres recettes (propriétaires uniquement)

### 👍 Système de votes
- **Like/Dislike** pour chaque cocktail
- **Compteurs en temps réel** mis à jour instantanément
- **État persistant** des votes par utilisateur
- **Redirection automatique** vers la connexion pour les utilisateurs non authentifiés

### 💬 Système de commentaires
- **Ajout de commentaires** sur chaque recette
- **Affichage chronologique** avec nom d'utilisateur et date
- **Interface intuitive** et responsive

### 🔍 Recherche et tri
- **Recherche textuelle** par nom de cocktail ou ingrédient
- **Tri avancé** : popularité, date de création (croissant/décroissant)
- **Filtrage en temps réel** avec URL persistante
- **Barre de recherche** dans le header pour navigation rapide

### 👤 Profil utilisateur complet
- **Tableau de bord personnel** avec statistiques
- **Mes recettes** : gestion de ses créations
- **Mes likes/dislikes** : historique des votes
- **Paramètres** : modification du nom d'utilisateur et mot de passe
- **Statistiques** : nombre de recettes créées, likes donnés, etc.

### 🛡️ Sécurité avancée
- **Rate limiting** adaptatif par type d'action
- **Validation et sanitisation** de toutes les entrées utilisateur
- **Protection XSS** avec échappement HTML automatique
- **Gestion d'erreurs** centralisée et logging sécurisé
- **En-têtes de sécurité** HTTP configurés
- **Middleware CORS** configuré pour la production

### 📱 Interface moderne
- **Design responsive** adapté mobile, tablette et desktop
- **Navigation intuitive** avec menu hamburger sur mobile
- **Animations fluides** et transitions soignées
- **Bouton d'action flottant** pour création rapide
- **Messages de feedback** clairs pour l'utilisateur

## 🚀 Technologies utilisées

### Frontend
- **[SvelteKit](https://kit.svelte.dev/)** - Framework full-stack moderne
- **[Svelte 5](https://svelte.dev/)** - Framework UI réactif et performant
- **TypeScript** - Typage statique pour une meilleure robustesse
- **CSS moderne** - Styles responsives avec variables CSS

### Backend
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service avec PostgreSQL
- **PostgreSQL** - Base de données relationnelle robuste
- **Authentication** - Gestion sécurisée des utilisateurs et sessions

### Sécurité
- **Crypto** - Chiffrement des mots de passe avec sel
- **Rate Limiting** - Protection contre les abus
- **Input Sanitization** - Prévention des attaques XSS
- **CORS** - Configuration sécurisée des origines autorisées

### Déploiement
- **[Vercel](https://vercel.com/)** - Hébergement et déploiement automatique
- **Variables d'environnement** - Configuration sécurisée

## 📋 Prérequis

- **Node.js** 18.0+ 
- **npm** ou **pnpm**
- **Compte Supabase** (gratuit)

## ⚙️ Installation

### 1. Cloner le repository

```bash
git clone https://github.com/gonicolas12/Cocktail-Tracker.git
cd cocktail-tracker
```

### 2. Installer les dépendances

```bash
npm install
# ou
pnpm install
```

### 3. Configuration Supabase

1. Créez un projet sur [Supabase](https://supabase.com/)
2. Exécutez les requêtes SQL suivantes dans l'éditeur SQL :

```sql
-- Table des utilisateurs
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table des cocktails
CREATE TABLE cocktails (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    ingredients TEXT[] NOT NULL,
    likes INTEGER DEFAULT 0,
    dislikes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id),
    user_username VARCHAR(50)
);

-- Table des sessions
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT
);

-- Table des votes
CREATE TABLE cocktail_votes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    cocktail_id INTEGER REFERENCES cocktails(id),
    vote_type VARCHAR(10) CHECK (vote_type IN ('like', 'dislike')),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, cocktail_id)
);

-- Table des commentaires
CREATE TABLE cocktail_comments (
    id SERIAL PRIMARY KEY,
    cocktail_id INTEGER REFERENCES cocktails(id),
    user_id INTEGER REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX idx_cocktails_created_by ON cocktails(created_by);
CREATE INDEX idx_cocktails_likes ON cocktails(likes DESC);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_votes_user_cocktail ON cocktail_votes(user_id, cocktail_id);
CREATE INDEX idx_comments_cocktail ON cocktail_comments(cocktail_id);
```

### 4. Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# Supabase (côté serveur)
SUPABASE_URL=votre_supabase_url
SUPABASE_ANON_KEY=votre_supabase_anon_key

# Supabase (côté client)
VITE_SUPABASE_URL=votre_supabase_url
VITE_SUPABASE_ANON_KEY=votre_supabase_anon_key

# Configuration optionnelle
NODE_ENV=development
COOKIE_DOMAIN=localhost
```

### 5. Lancer le serveur de développement

```bash
npm run dev
# ou
pnpm dev
```

L'application sera disponible sur `http://localhost:5173`

## 🏗️ Structure du projet

```
cocktail-tracker/
├── src/
│   ├── lib/
│   │   ├── components/          # Composants Svelte réutilisables
│   │   │   ├── CocktailCard.svelte
│   │   │   ├── CocktailForm.svelte
│   │   │   ├── LikeDislikeButtons.svelte
│   │   │   └── SearchBar.svelte
│   │   ├── middleware/          # Middlewares de sécurité
│   │   │   ├── cors-config.ts
│   │   │   └── rate-limiter.ts
│   │   ├── types/              # Types TypeScript
│   │   │   ├── cocktail.ts
│   │   │   └── user.ts
│   │   ├── utils/              # Utilitaires
│   │   │   ├── error-handler.ts
│   │   │   └── input-sanitizer.ts
│   │   ├── auth.ts             # Logique d'authentification
│   │   ├── auth-protect.ts     # Protection des routes
│   │   └── supabase-server.ts  # Client Supabase serveur
│   ├── routes/
│   │   ├── api/               # API endpoints
│   │   ├── cocktails/         # Pages des cocktails
│   │   ├── create/           # Création de cocktail
│   │   ├── login/            # Connexion
│   │   ├── register/         # Inscription
│   │   ├── profile/          # Profil utilisateur
│   │   └── +layout.svelte    # Layout principal
│   ├── app.html              # Template HTML
│   └── hooks.server.ts       # Hooks serveur (auth, sécurité)
├── static/                   # Assets statiques
├── package.json
└── svelte.config.js
```

## 🔒 Sécurité

### Authentification
- Mots de passe hachés avec SHA-256 + sel unique
- Sessions avec tokens cryptographiques sécurisés
- Expiration automatique des sessions (30 jours)
- Cookies sécurisés (HttpOnly, Secure, SameSite)

### Protection des données
- Validation rigoureuse de toutes les entrées
- Sanitisation automatique contre les attaques XSS
- Rate limiting adaptatif (10 tentatives/15min pour l'auth)
- En-têtes de sécurité HTTP configurés

### API et routes
- Protection CSRF avec tokens de session
- Autorisation basée sur les rôles
- Gestion centralisée des erreurs
- Logging sécurisé en production

## 🚀 Déploiement

### Vercel (recommandé)

1. **Connectez votre repository** à Vercel
2. **Configurez les variables d'environnement** dans le dashboard Vercel
3. **Déployez automatiquement** à chaque push sur main

### Variables d'environnement pour la production

```env
SUPABASE_URL=votre_supabase_url_prod
SUPABASE_ANON_KEY=votre_supabase_anon_key_prod
VITE_SUPABASE_URL=votre_supabase_url_prod
VITE_SUPABASE_ANON_KEY=votre_supabase_anon_key_prod
NODE_ENV=production
COOKIE_DOMAIN=votre-domaine.com
```

## 📝 Scripts disponibles

```bash
# Développement
npm run dev              # Serveur de développement
npm run dev -- --open   # Ouvre automatiquement le navigateur

# Production
npm run build           # Build pour la production
npm run preview         # Prévisualise le build de production

# Qualité code
npm run check           # Vérification TypeScript
npm run check:watch     # Vérification continue
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

1. **Forkez** le projet
2. **Créez une branche** pour votre fonctionnalité (`git checkout -b feature/amazing-feature`)
3. **Commitez** vos changements (`git commit -m 'Add amazing feature'`)
4. **Poussez** vers la branche (`git push origin feature/amazing-feature`)
5. **Ouvrez une Pull Request**

### Guidelines de développement

- Respectez la structure du projet existante
- Ajoutez des tests pour les nouvelles fonctionnalités
- Suivez les conventions de nommage TypeScript
- Documentez les nouvelles APIs dans le code
- Testez sur mobile et desktop

## 🐛 Rapporter des bugs

Si vous trouvez un bug, merci de créer une issue avec :

- **Description détaillée** du problème
- **Étapes pour reproduire** le bug
- **Comportement attendu** vs **comportement observé**
- **Captures d'écran** si pertinentes
- **Environnement** (navigateur, OS, version)

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Auteurs

   - [@NicolasGouy](https://github.com/gonicolas12)
   - [@BrennMakouya](https://github.com/Brenn007)
   - [@JosuéAdami](https://github.com/Joadm973)

## 🙏 Remerciements

- **SvelteKit** pour le framework extraordinaire
- **Supabase** pour la simplicité du backend
- **Vercel** pour l'hébergement gratuit
- **La communauté open source** pour l'inspiration

---

**🍹 Santé ! Créons ensemble la meilleure communauté de cocktails !**