# rok-landing

Public landing page for kingdom 4028 (Rise of Kingdoms). Next.js 16 (App Router) +
Tailwind v4 + Framer Motion. Talks to [`rok-api`](../rok-api) for migration
requirements, media, and the DKP leaderboard.

## Local development

```bash
npm install
cp .env.example .env.local
# point NEXT_PUBLIC_API_URL at your local or deployed rok-api
npm run dev          # http://localhost:3000
```

## Free deploy

Full end-to-end walkthrough (Neon + Render + Vercel) lives in [`rok-api/DEPLOY.md`](../rok-api/DEPLOY.md). Short version:

### Vercel

1. Sign in at <https://vercel.com> with GitHub.
2. **Add New → Project** → pick this repo. Vercel auto-detects Next.js — no config needed.
3. **Environment Variables** (Production + Preview):
   - `NEXT_PUBLIC_API_URL` = `https://<your-rok-api>.onrender.com`
4. **Deploy**.
5. Once Vercel gives you the URL (e.g. `https://rok-landing-xxx.vercel.app`), copy it
   and append to the API's `CORS_ORIGINS` env var on Render.

ISR: `/migration` and `/media` revalidate every 60 seconds — admin edits
propagate within a minute on the public site.

## Pages

| Route        | Purpose                                                    |
| ------------ | ---------------------------------------------------------- |
| `/`          | Hero + CTA                                                 |
| `/migration` | Kingdom stats + dynamic migration requirements             |
| `/media`     | Dynamic YouTube grid                                       |
| `/dkp`       | Dynamic leaderboard with search/filter/sort/pagination     |

## Stack

Next.js 16 / React 19 / TypeScript / Tailwind v4 / Lucide / Framer Motion / Cinzel + Inter (Google Fonts).
