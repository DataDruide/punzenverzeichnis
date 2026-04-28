# Deployment auf Cloudflare Pages

Dieses Projekt ist für **Cloudflare Pages** mit automatischem Deploy aus dem GitHub-Repo vorbereitet.

## Einmaliges Setup

1. **Cloudflare Dashboard** → **Workers & Pages** → **Create** → Tab **Pages** → **Connect to Git**
2. GitHub autorisieren und Repo `DataDruide/punzenverzeichnis` auswählen
3. Build-Einstellungen:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** *(leer)*
   - **Node version:** `20` (unter Environment variables → `NODE_VERSION = 20`)
4. **Environment variables** (Production **und** Preview):
   - `VITE_SUPABASE_URL` = `https://gnufywlflvxvfmczvylu.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = *(aus Lovable Cloud → siehe `.env`)*
   - `VITE_SUPABASE_PROJECT_ID` = `gnufywlflvxvfmczvylu`
   - `NODE_VERSION` = `20`
5. **Save and Deploy**

## Auto-Deploy

Ab jetzt löst jeder Push auf `main` automatisch ein Production-Deploy aus.
Pushes auf andere Branches / Pull Requests erzeugen Preview-Deploys.

## SPA-Routing

`public/_redirects` enthält `/* /index.html 200` – damit funktionieren Deep-Links und Page-Refresh in React Router.

> **Wichtig:** Es gibt **keine** `wrangler.toml` im Repo. Cloudflare Pages erkennt das Projekt automatisch als statische Site. Eine `wrangler.toml` würde Cloudflare in den Worker-Modus zwingen und den Deploy abbrechen lassen.

## Security-Header

`public/_headers` setzt die wichtigsten Security-Header (HSTS, X-Frame-Options, Referrer-Policy etc.).

## Supabase Auth – Redirect-URLs ergänzen

Nach dem ersten Deploy in **Lovable Cloud → Users → URL Configuration** ergänzen:
- **Site URL:** `https://<dein-projekt>.pages.dev` (oder Custom Domain)
- **Redirect URLs:**
  - `https://<dein-projekt>.pages.dev/*`
  - `https://<dein-projekt>.pages.dev/reset-password`

## Custom Domain

Cloudflare Pages → Projekt → **Custom domains** → **Set up a custom domain**.
Wenn die Domain bereits in Cloudflare liegt, wird der DNS-Record automatisch angelegt.
