# AlarmBriefing

Intelligenter Wecker mit Jarvis-Briefings. Dein Bot erstellt Wecker und spricht dir morgens Wetter, Termine und News ueber deine Lautsprecher vor.

## Live

- **Website:** https://alarm-briefing.vercel.app
- **App:** https://alarm-briefing.vercel.app/app.html

## Tech Stack

- **Frontend:** HTML/CSS/JS (Dark UI, "Jarvis Blau")
- **Backend:** Next.js API Routes (Vercel Serverless)
- **Database:** Supabase (PostgreSQL)
- **Auth:** JWT + bcrypt
- **Bot API:** REST mit X-Bot-Key Header

## Setup

### 1. Supabase Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com) und erstelle ein kostenloses Projekt
2. Waehle **Region: EU (Frankfurt)** fuer DSGVO
3. Gehe zu **Project Settings → API** und kopiere:
   - `Project URL` → NEXT_PUBLIC_SUPABASE_URL
   - `anon public` key → NEXT_PUBLIC_SUPABASE_ANON_KEY
   - `service_role` key → SUPABASE_SERVICE_ROLE_KEY
4. Gehe zum **SQL Editor** und fuehre `supabase/schema.sql` aus

### 2. Vercel Environment Variables

In Vercel Dashboard → AlarmBriefing → Settings → Environment Variables:

```
JWT_SECRET=<openssl rand -base64 32>
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 3. Redeploy

Nach dem Setzen der Variables: Vercel → Deployments → Redeploy

## Bot API

Der Bot authentifiziert sich mit `X-Bot-Key` Header.

| Endpoint | Method | Description |
|---|---|---|
| `/api/bot/ping` | GET | Verbindung testen |
| `/api/bot/alarms` | GET | Alarme abrufen |
| `/api/bot/alarms` | POST | Alarm erstellen |
| `/api/bot/briefings` | POST | Briefing generieren |
| `/api/bot/settings` | GET | User-Settings lesen |
| `/api/health` | GET | System-Status |

### Bot Client

```bash
export ALARMBRIEFING_API_KEY=ab_xxx
node bot/alarmbriefing-bot.js ping
node bot/alarmbriefing-bot.js create-alarm --name "Morgenwecker" --time "06:30" --days "1,2,3,4,5"
```

## Rechtliches

- [Datenschutz](https://alarm-briefing.vercel.app/privacy.html)
- [Nutzungsbedingungen](https://alarm-briefing.vercel.app/terms.html)
- [Impressum](https://alarm-briefing.vercel.app/imprint.html)
- [Support](https://alarm-briefing.vercel.app/support.html)
