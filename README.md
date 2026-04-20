# Duel de Poids

Application web privée, mobile-first, pour suivre une transformation de poids entre deux amis sur une période configurable. Le projet est conçu pour être simple à héberger sur Vercel, avec Next.js App Router, Supabase, Resend et Vercel Cron.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase
- Resend
- Vercel Cron
- Recharts
- lucide-react

## Fonctionnalités

- Dashboard privé protégé par un mot de passe global unique
- Vue côte à côte Ilias / Renaud, mobile-first et responsive desktop
- Encodage quotidien avec upsert: une seule entrée par jour et par personne
- Calcul des moyennes hebdomadaires du lundi au dimanche
- Progression réelle vs progression théorique linéaire
- Statut automatique: `en avance`, `dans les temps`, `en retard`
- Graphique hebdomadaire réel + ligne théorique
- Popup motivant aléatoire après chaque pesée
- Zone admin simple pour:
  - modifier les poids de départ
  - modifier les objectifs finaux
  - modifier les dates
  - ajuster la tolérance de statut
  - ajuster le cooldown des rappels
  - corriger ou supprimer une entrée quotidienne
  - éditer les messages motivants stockés en base
- Cron hebdomadaire pour les emails du lundi
- Cron quotidien pour les rappels après 3 jours d’oubli, avec anti-spam via logs

## Arborescence

```text
.
├── app
│   ├── admin/page.tsx
│   ├── api
│   │   ├── admin/settings/route.ts
│   │   ├── admin/weights/[entryId]/route.ts
│   │   ├── auth/login/route.ts
│   │   ├── auth/logout/route.ts
│   │   ├── cron/check-missed-entries/route.ts
│   │   ├── cron/weekly-summary/route.ts
│   │   ├── dashboard/route.ts
│   │   └── weights/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   ├── login/page.tsx
│   └── page.tsx
├── components
│   ├── charts/weekly-weight-chart.tsx
│   ├── dashboard/dashboard-view.tsx
│   ├── dashboard/participant-card.tsx
│   ├── dashboard/progress-gauge.tsx
│   ├── forms/admin-panel.tsx
│   ├── forms/login-form.tsx
│   ├── forms/weight-entry-form.tsx
│   ├── layout/app-shell.tsx
│   └── ui
├── lib
│   ├── auth.ts
│   ├── calculations.ts
│   ├── constants.ts
│   ├── date.ts
│   ├── email
│   ├── env.ts
│   ├── services
│   ├── supabase
│   ├── types.ts
│   ├── utils.ts
│   └── validators
├── sql
│   ├── schema.sql
│   └── seed.sql
├── .env.example
├── eslint.config.mjs
├── middleware.ts
├── next.config.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vercel.json
```

## Installation locale

1. Installer les dépendances:

```bash
npm install
```

2. Créer un fichier `.env.local` à partir de `.env.example`.

```bash
cp .env.example .env.local
```

3. Compléter les variables d’environnement.

4. Initialiser la base Supabase avec les scripts SQL.

5. Lancer le projet:

```bash
npm run dev
```

L’application sera disponible sur `http://localhost:3000`.

## Variables d’environnement

Le fichier [.env.example](/Users/Renaud_Lothaire/Downloads/IliasRenaud/.env.example) contient toutes les variables nécessaires:

- `SITE_PASSWORD`: mot de passe global du site
- `SESSION_SECRET`: secret utilisé pour signer le cookie d’accès
- `APP_URL`: URL publique de l’application
- `ENABLE_TEST_TOOLS`: active explicitement la section `Simulation & tests` hors développement
- `APP_SIMULATED_NOW`: date ISO simulée injectée depuis l’environnement
- `RENAUD_EMAIL`: email de destination de Renaud
- `ILIAS_EMAIL`: email de destination de Ilias
- `RESEND_API_KEY`: clé API Resend
- `RESEND_FROM_EMAIL`: expéditeur Resend
- `SUPABASE_URL`: URL du projet Supabase
- `SUPABASE_ANON_KEY`: clé publique Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: clé service role Supabase
- `CRON_SECRET`: secret partagé pour sécuriser les routes cron

## Configuration Supabase

1. Créer un projet Supabase.
2. Ouvrir l’éditeur SQL.
3. Exécuter d’abord [sql/schema.sql](/Users/Renaud_Lothaire/Downloads/IliasRenaud/sql/schema.sql).
4. Exécuter ensuite [sql/seed.sql](/Users/Renaud_Lothaire/Downloads/IliasRenaud/sql/seed.sql).
5. Si la base existait déjà avant l’ajout des outils de simulation, exécuter aussi [sql/migrations/20260421_simulation_tools.sql](/Users/Renaud_Lothaire/Downloads/IliasRenaud/sql/migrations/20260421_simulation_tools.sql).

Le seed configure immédiatement:

- Ilias: départ 116 kg, objectif 105 kg
- Renaud: départ 65 kg, objectif 70 kg
- période du `2026-05-01` au `2026-08-31`
- 20 messages motivants minimum par personne

## Logique métier

### Encodage quotidien

- Une seule entrée par jour et par personne
- Une nouvelle saisie le même jour remplace l’entrée existante
- Les poids quotidiens restent stockés mais ne sont pas affichés sur le dashboard public

### Calcul hebdomadaire

- Semaines du lundi au dimanche
- La moyenne est calculée uniquement sur les jours encodés
- Le poids de référence affiché en grand est la dernière moyenne hebdomadaire disponible

### Progressions

- Progression théorique: interpolation linéaire entre la date de début et la date de fin
- Progression réelle: part du chemin réellement parcouru entre poids de départ et objectif
- Les valeurs sont bornées entre `0 %` et `100 %`

### Statut

- `en avance` si la progression réelle dépasse la théorique de plus que la tolérance
- `en retard` si elle passe sous la théorique au-delà de la tolérance
- `dans les temps` sinon

## Zone admin

La page `/admin` permet de gérer sans toucher au code:

- dates de début et de fin
- tolérance du statut
- cooldown des rappels
- activation ou non des emails automatiques
- poids de départ et poids cible
- messages motivants de chaque personne
- correction d’une pesée quotidienne
- suppression d’une pesée quotidienne

En développement, ou si `ENABLE_TEST_TOOLS=true`, l’admin expose aussi une section `Simulation & tests`.

Le mot de passe est le même que pour le dashboard.

## Simulation & tests

Le projet inclut une couche dédiée de simulation pour éviter les manipulations SQL manuelles.

### Date centralisée

- toute la logique métier s’appuie sur `getCurrentAppDate()`
- cette fonction peut retourner:
  - la vraie date système
  - une date simulée définie dans l’admin
  - une date simulée injectée par `APP_SIMULATED_NOW`
- un badge visuel apparaît dès qu’une date simulée est active

### Sécurité

- les outils de simulation sont désactivés en production par défaut
- ils sont disponibles si:
  - `NODE_ENV !== production`
  - ou `ENABLE_TEST_TOOLS=true`
- toutes les données générées pour les tests sont marquées `is_test_data=true`
- les actions de reset ciblent ces données de test en priorité

### Outils disponibles dans l’admin

Carte `Date simulée`:

- activer/désactiver la simulation
- choisir une date précise
- revenir immédiatement à la vraie date

Carte `Scénarios de test`:

- `A`: 14 jours de données propres
- `B`: 30 jours avec quelques oublis
- `C`: 60 jours avec progression réaliste
- `D`: utilisateur en retard
- `E`: utilisateur en avance
- `F`: semaine incomplète
- `G`: aucun poids depuis 3 jours
- `H`: lundi midi simulé pour tester le mail hebdomadaire

Carte `Génération de données`:

- date de début / fin
- fréquence d’encodage
- tendance
- bruit aléatoire réaliste
- jours manquants
- mode `replace` ou `ignore` si une pesée existe déjà

Carte `Prévisualisation emails`:

- preview du résumé hebdomadaire
- preview du rappel d’oubli
- envoi réel de test
- dry-run indiquant à qui l’email partirait, pourquoi et avec quel HTML

Carte `Reset / rollback`:

- supprimer toutes les données de test
- réinitialiser les données par défaut
- vider uniquement les poids
- restaurer la configuration initiale

Carte `Snapshot`:

- export JSON de l’état courant
- restauration via script développeur

## Emails avec Resend

### Email hebdomadaire

- route: `/api/cron/weekly-summary`
- envoi un résumé chaque lundi
- contenu personnalisé:
  - poids hebdomadaire courant
  - objectif
  - progression réelle
  - progression théorique
  - statut
  - message motivant

### Rappel d’oubli

- route: `/api/cron/check-missed-entries`
- vérifie chaque jour si une personne n’a rien encodé depuis 3 jours
- utilise la table `email_logs` pour éviter des rappels trop rapprochés

### Tester les emails sans attendre

Depuis `/admin` > `Simulation & tests`:

- `Prévisualiser email hebdomadaire`
- `Prévisualiser rappel oubli`
- `Tester email hebdomadaire`
- `Tester rappel oubli`

Pour tester précisément le créneau du lundi midi:

- activer une date simulée manuellement
- ou injecter directement le scénario `H`

## Déploiement sur Vercel

1. Pousser le repo sur GitHub.
2. Créer un projet Vercel lié au repo.
3. Ajouter toutes les variables d’environnement de `.env.example` dans Vercel.
4. Déployer.

Le fichier [vercel.json](/Users/Renaud_Lothaire/Downloads/IliasRenaud/vercel.json) contient déjà:

- un cron quotidien à `10:00 UTC` pour le résumé hebdomadaire
- un cron quotidien à `07:00 UTC`

Sur Vercel Hobby, un cron ne peut pas s’exécuter plus d’une fois par jour. Le projet utilise donc un cron quotidien à `10:00 UTC`, et la route n’envoie réellement le résumé hebdomadaire que si l’on est lundi à l’heure locale configurée.

Important: sur Hobby, comme le cron ne passe qu’une fois par jour, `weekly_email_hour_local` doit rester aligné avec ce passage quotidien.
Pour la Belgique en période estivale, `10:00 UTC` correspond à `12:00`.
Si vous voulez une autre heure en Hobby, il faut modifier [vercel.json](/Users/Renaud_Lothaire/Downloads/IliasRenaud/vercel.json) puis redéployer.
Si vous voulez un horaire réellement libre depuis l’admin sans redéploiement, il faut passer en Vercel Pro ou utiliser un scheduler externe.

## Configuration du cron secret

Dans Vercel, définissez `CRON_SECRET`. Les routes cron vérifient l’en-tête:

```text
Authorization: Bearer <CRON_SECRET>
```

Pour tester en local:

```bash
curl -H "Authorization: Bearer votre-secret" http://localhost:3000/api/cron/weekly-summary
curl -H "Authorization: Bearer votre-secret" http://localhost:3000/api/cron/check-missed-entries
```

## Personnalisation

### Changer les emails

- Modifier `ILIAS_EMAIL` et `RENAUD_EMAIL` dans l’environnement

### Changer le mot de passe global

- Modifier `SITE_PASSWORD`
- Modifier aussi `SESSION_SECRET` pour invalider les anciennes sessions

### Changer les messages motivants

- Aller dans `/admin`
- Modifier la liste de messages, un message par ligne
- Enregistrer

### Changer la période ou les objectifs

- Aller dans `/admin`
- Ajuster les dates, poids de départ ou objectifs
- Enregistrer

### Activer le mode simulation

- en local: il est disponible automatiquement
- hors local: définir `ENABLE_TEST_TOOLS=true`
- optionnellement définir `APP_SIMULATED_NOW=2026-08-17T12:00:00.000Z` pour forcer une date simulée depuis l’environnement

### Générer de faux poids

- ouvrir `/admin`
- section `Simulation & tests`
- utiliser `Scénarios de test` ou `Générer les poids fictifs`

### Reset de la base de test

- `/admin` > `Supprimer toutes les données de test`
- ou `npm run reset:dev`

## Scripts utiles

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run seed:dev
npm run seed:scenario -- scenario-c
npm run reset:dev
npm run reset:weights
npm run snapshot:export -- snapshot.dev.json
npm run snapshot:restore -- snapshot.dev.json
```

## Notes de production

- Le projet n’utilise pas de système de comptes complet: un simple mot de passe global suffit
- Les routes API sensibles vérifient le cookie de session
- Les routes cron vérifient `CRON_SECRET`
- Le service role Supabase n’est jamais exposé au client
- Toute la logique serveur reste dans Next.js
- Les outils de simulation sont explicitement protégés et ne sont pas destinés à la production courante
