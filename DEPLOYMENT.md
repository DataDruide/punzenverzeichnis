# Production Deployment Guide für punzenverzeichnis auf Netlify

## ✅ Setup für Netlify

### 1. Repository mit Netlify verbinden
```bash
# Pushe dein Repository zu GitHub
git push origin main
```

Gehe zu https://app.netlify.com und:
1. Klicke "New site from Git"
2. Wähle GitHub und dein Repository aus
3. Bestätige die Build-Einstellungen

### 2. Environment-Variablen in Netlify setzen

Unter "Site settings > Build & deploy > Environment" füge folgende Variablen hinzu:

**Required - Frontend:**
```
VITE_SUPABASE_PROJECT_ID=gnufywlflvxvfmczvylu
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdudWZ5d2xmbHZ4dmZtY3p2eWx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NjQ4MzcsImV4cCI6MjA4ODU0MDgzN30.CbCILsKJQ1kK6mbbNfCxKCTsZ7I_RXLoDZvIx7na4Es
VITE_SUPABASE_URL=https://gnufywlflvxvfmczvylu.supabase.co
```

**Required - Edge Functions (Supabase):**
```
SUPABASE_URL=https://gnufywlflvxvfmczvylu.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdudWZ5d2xmbHZ4dmZtY3p2eWx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NjQ4MzcsImV4cCI6MjA4ODU0MDgzN30.CbCILsKJQ1kK6mbbNfCxKCTsZ7I_RXLoDZvIx7na4Es
SUPABASE_SERVICE_ROLE_KEY=<Holen von Supabase Dashboard - Project Settings - API Keys>
```

🔐 **WICHTIG:** `SUPABASE_SERVICE_ROLE_KEY` ist sehr sensibel! Nur als Secret in Netlify speichern.

### 3. Custom Domain (optional)

1. Gehe zu "Site settings > Domain management"
2. Klicke "Add custom domain"
3. Folge den DNS-Konfigurationsanweisungen
4. Automatisches HTTPS Certificate wird von Netlify eingerichtet

### 4. Deployment verifyifizieren

Nach dem Push sollte Netlify:
1. ✓ JavaScript/CSS bundlen
2. ✓ React App bauen
3. ✓ Dist-Folder deployen
4. ✓ Live-URL generieren

## 📋 Checkliste vor Production

- [ ] Alle Environment-Variablen in Netlify gesetzt
- [ ] Build erfolgreich (grüner Haken in Netlify)
- [ ] Frontend lädt ohne Fehler
- [ ] Login funktioniert mit echten Supabase-Credentials
- [ ] Alle Routes funktionieren (teste /login, /dashboard, /admin)
- [ ] API-Aufrufe zur Datenbank funktionieren
- [ ] CORS-Header richtig konfiguriert
- [ ] SSL-Zertifikat aktiv (https://)

## 🔍 Troubleshooting

### Build fehlgeschlagen
```
Build command: npm install && npm run build
```
Stelle sicher, dass package.json alle Dependencies hat.

### Environment-Variablen nicht gefunden
- Variablen müssen mit `VITE_` prefixen für Frontend
- Nach Hinzufügen: Site neubuild triggern (Deploy > Trigger deploy)

### CORS-Fehler
Überprüfe in Supabase:
- Project Settings > CORS
- Erlaubte Origins: `https://your-netlify-domain.netlify.app`

### Edge Functions funktionieren nicht
- Supabase Functions müssen in `supabase/functions/` sein
- Netify liest aus `netlify.toml`: `functions = "supabase/functions"`
- Ggf. mit Supabase CLI deployen

## 📝 Dateistruktur

```
.
├── netlify.toml          ← Netlify Konfiguration
├── package.json
├── vite.config.ts        ← Build-Konfiguration
├── src/                  ← React App
└── supabase/functions/   ← Edge Functions
```

## 🚀 Auto-Deployment Setup

Jeder Push zu `main` triggered automatisch:
1. Netlify klont Repository
2. Installiert Dependencies: `npm install`
3. Baut App: `npm run build`
4. Deployed zu Live-URL

Logs findest du unter Netlify > "Deploys" Tab.

---

**Deployed auf:** https://your-site.netlify.app
**Build Status:** Check Netlify Dashboard
