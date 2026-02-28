# 🔔 AlarmBriefing

**Wake up like Tony Stark.** A smart alarm clock with AI-powered audio briefings — weather, calendar, and news read to you every morning.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Mobile App  │────▶│  Next.js API │◀────│  ClawdBot   │
│  (Expo RN)   │     │  (Vercel)    │     │  (Bot CLI)  │
└─────────────┘     └──────┬───────┘     └─────────────┘
                           │
                    ┌──────▼───────┐
                    │   Supabase   │
                    │   (Postgres) │
                    └──────────────┘
```

- **Web App** — `public/app.html` (standalone SPA, no framework)
- **API** — Next.js API routes in `app/api/`
- **Mobile** — Expo Router app in `mobile/`
- **Backend (standalone)** — Express + SQLite in `backend/` (for self-hosting)
- **Bot Client** — CLI in `bot/alarmbriefing-bot.js`

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/lulius2021/AlarmBriefing.git
cd AlarmBriefing
npm install
```

### 2. Environment

```bash
cp .env.example .env.local
# Edit .env.local — at minimum set:
#   JWT_SECRET (random 64+ chars)
#   NEXT_PUBLIC_SUPABASE_URL + keys (or leave empty for in-memory mode)
```

### 3. Run

```bash
npm run dev        # Web + API on http://localhost:3000
```

Open `http://localhost:3000` — redirects to landing page, click "Open App" or go to `/app.html`.

### 4. Deploy to Vercel

```bash
vercel --prod
```

Set these environment variables in Vercel dashboard:
- `JWT_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Supabase Setup

Create these tables in Supabase SQL editor:

```sql
-- Users
CREATE TABLE app_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  password_hash TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alarms
CREATE TABLE alarms (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES app_users(id) ON DELETE CASCADE,
  name TEXT DEFAULT 'Alarm',
  active BOOLEAN DEFAULT true,
  time TEXT NOT NULL,
  days JSONB DEFAULT '[]',
  snooze_enabled BOOLEAN DEFAULT true,
  snooze_duration INT DEFAULT 5,
  sound TEXT DEFAULT 'default',
  vibration BOOLEAN DEFAULT true,
  briefing_mode TEXT DEFAULT 'standard',
  managed_by TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bot Keys
CREATE TABLE app_bot_keys (
  hash TEXT PRIMARY KEY,
  user_id TEXT REFERENCES app_users(id) ON DELETE CASCADE,
  scopes JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Briefings
CREATE TABLE briefings (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES app_users(id) ON DELETE CASCADE,
  alarm_id TEXT REFERENCES alarms(id) ON DELETE SET NULL,
  modules JSONB DEFAULT '[]',
  content TEXT DEFAULT '',
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Log
CREATE TABLE audit_log (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_alarms_user ON alarms(user_id);
CREATE INDEX idx_briefings_user ON briefings(user_id);
CREATE INDEX idx_audit_user ON audit_log(user_id);
```

## Bot Client

The bot CLI lets ClawdBot manage alarms and briefings:

```bash
export ALARMBRIEFING_API_KEY=ab_...
export ALARMBRIEFING_API_URL=https://alarm-briefing.vercel.app

node bot/alarmbriefing-bot.js ping
node bot/alarmbriefing-bot.js alarms
node bot/alarmbriefing-bot.js create-alarm --name "Morning" --time "06:30" --days "1,2,3,4,5"
node bot/alarmbriefing-bot.js update-alarm --id <id> --time "07:00"
node bot/alarmbriefing-bot.js delete-alarm --id <id>
node bot/alarmbriefing-bot.js briefing --modules "weather,news"
node bot/alarmbriefing-bot.js settings
```

## Mobile App (Expo)

```bash
cd mobile
npx expo install
npx expo start
```

Requires Expo Go on your phone or an iOS/Android simulator.

## Self-Hosted Backend (SQLite)

For running without Supabase:

```bash
cd backend
npm install
node src/index.js
# API on http://localhost:4000
```

## i18n

Language is auto-detected from:
- **iOS/Android** — System language via `expo-localization`
- **Web** — `navigator.language`
- **API** — `Accept-Language` header

Supported: **German (de)**, **English (en)**. Fallback: English.

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Email login |
| POST | `/api/auth/social` | Social login (Apple/Google) |
| POST | `/api/auth/refresh` | Refresh JWT |
| POST | `/api/auth/bot-key` | Generate bot API key |
| GET | `/api/auth/me` | Current user |
| DELETE | `/api/auth/account` | Delete account + all data |

### Alarms (user)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/alarms` | List alarms |
| POST | `/api/alarms` | Create alarm |
| PATCH | `/api/alarms/:id` | Update alarm |
| DELETE | `/api/alarms/:id` | Delete alarm |

### Bot API (X-Bot-Key header)
| Method | Path | Scope |
|--------|------|-------|
| GET | `/api/bot/ping` | — |
| GET | `/api/bot/alarms` | alarms:read |
| POST | `/api/bot/alarms` | alarms:write |
| PATCH | `/api/bot/alarms/:id` | alarms:write |
| DELETE | `/api/bot/alarms/:id` | alarms:write |
| POST | `/api/bot/briefings/generate` | briefings:write |
| GET | `/api/bot/settings` | settings:read |

### Other
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/briefings/latest` | Latest briefing |
| GET | `/api/settings` | User settings |
| GET | `/api/settings/export` | GDPR data export |
| GET | `/api/audit` | Audit log |

## Security

- Passwords: bcrypt (12 rounds)
- API keys: SHA-256 hashed, never stored raw
- JWT: 30-day expiry with refresh tokens
- Bot API: scoped access, rate-limited (30 req/min)
- User API: rate-limited (200 req/15min)
- Input validation: HTML stripping, format checks on all endpoints
- Bot can only modify bot-created alarms
- All bot actions audit-logged
- GDPR: full data export + account deletion

## Tests

```bash
npm test
```

## License

Private — © 2026 Julius Deusch
