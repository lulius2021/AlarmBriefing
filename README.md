# AlarmBriefing

Intelligenter Wecker + Audio-Morning/Evening-Briefings, gesteuert durch Bot-API (BYO-Key).

## Tech Stack

- **App**: Expo (React Native) – iOS + Android
- **Backend**: Node.js / Express
- **Auth**: JWT + Social Logins (Apple, Google, Facebook, Email)
- **Design**: "Jarvis Blau" – Dark UI, blaue Akzente, Glow-Highlights

## Quickstart

### App
```bash
npm install
npx expo start
```

### Backend
```bash
cd backend
npm install
npm run dev
```

## Bot-API

Authentifizierung via `X-Bot-Key` Header.

| Endpoint | Method | Scope | Description |
|---|---|---|---|
| `/api/bot/ping` | GET | - | Connection test |
| `/api/bot/alarms` | GET | alarms:read | List alarms |
| `/api/bot/alarms` | POST | alarms:write | Create alarm |
| `/api/bot/alarms/:id` | PATCH | alarms:write | Update alarm |
| `/api/bot/alarms/:id` | DELETE | alarms:write | Delete alarm |
| `/api/bot/briefings/generate` | POST | briefings:write | Generate briefing |
| `/api/bot/settings` | GET | settings:read | Read user settings |

## Architektur

```
Mobile App (Expo)
    ↕ REST API
Backend (Express)
    ↕
  Bot-API ← Clawdbot (via X-Bot-Key)
```

## Roadmap

- [x] v0.1 – Projektstruktur, UI Screens, Backend API
- [ ] v1.0 – Social Auth, Push Notifications, TTS Briefings
- [ ] v1.1 – Account Linking, Audit UI, Briefing Templates
- [ ] v2.0 – Kalender/Tasks Integration, Smart Speaker
