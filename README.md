# CreatorAI ✦ — SaaS IA TikTok/Reels

## 🚀 Setup rapide

### 1. Variables d'environnement
Renomme `.env.example` en `.env.local` et remplis les 3 valeurs :
```
NEXT_PUBLIC_SUPABASE_URL=https://VOTRE_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=VOTRE_ANON_KEY
OPENAI_API_KEY=sk-proj-VOTRE_CLE_OPENAI
```

### 2. Supabase
1. Crée un projet sur supabase.com
2. Va dans SQL Editor et colle le fichier `supabase/migrations/001_init.sql`
3. Active l'auth Email dans Authentication > Providers

### 3. Lancer
```bash
npm install
npm run dev
```

## Stack
- **Frontend** : Next.js 14 App Router + Tailwind CSS
- **IA** : OpenAI GPT-4o
- **Auth + DB** : Supabase

## Fonctionnalités
- ✅ Signup / Login (Email + Google)
- ✅ Génération IA (Hook, Script, Titre, Hashtags, Description, Idées visuelles)
- ✅ Historique des générations
- ✅ Export Markdown
- ✅ Rate limiting (20 générations/jour)
