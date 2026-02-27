-- AlarmBriefing Database Schema
-- Run this in Supabase SQL Editor to set up the database.

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT DEFAULT '',
  password_hash TEXT NOT NULL,
  settings JSONB DEFAULT '{"briefingModules":["weather","calendar","news"],"voice":"jarvis","speed":1.0,"location":"Berlin, DE"}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- Alarms
CREATE TABLE IF NOT EXISTS alarms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT DEFAULT 'Alarm',
  active BOOLEAN DEFAULT true,
  time TEXT NOT NULL DEFAULT '07:00',
  days INTEGER[] DEFAULT ARRAY[1,2,3,4,5],
  snooze_enabled BOOLEAN DEFAULT true,
  snooze_duration INTEGER DEFAULT 5,
  sound TEXT DEFAULT 'default',
  vibration BOOLEAN DEFAULT true,
  briefing_mode TEXT DEFAULT 'auto',
  managed_by TEXT DEFAULT 'manual' CHECK (managed_by IN ('manual', 'bot')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alarms_user ON alarms(user_id);

-- Bot Keys
CREATE TABLE IF NOT EXISTS bot_keys (
  hash TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scopes TEXT[] DEFAULT ARRAY['alarms:read','alarms:write','briefings:write','settings:read'],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_botkeys_user ON bot_keys(user_id);
CREATE INDEX idx_botkeys_hash ON bot_keys(hash);

-- Audit Log
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  actor TEXT NOT NULL CHECK (actor IN ('bot', 'user')),
  action TEXT NOT NULL,
  target TEXT DEFAULT '-',
  details TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_log(user_id);

-- Briefings
CREATE TABLE IF NOT EXISTS briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alarm_id TEXT,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  modules TEXT[] DEFAULT ARRAY['weather','news'],
  content TEXT DEFAULT '',
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_briefings_user ON briefings(user_id);
CREATE INDEX idx_briefings_alarm ON briefings(alarm_id);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE alarms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefings ENABLE ROW LEVEL SECURITY;

-- Policies: Service role (our API) can do everything.
-- No direct client access needed since all goes through API routes.
CREATE POLICY "Service role full access" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON alarms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON bot_keys FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON audit_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON briefings FOR ALL USING (true) WITH CHECK (true);

-- Auto-cleanup: delete audit logs older than 90 days (run via cron)
-- SELECT cron.schedule('cleanup-audit', '0 3 * * *', $$DELETE FROM audit_log WHERE created_at < NOW() - INTERVAL '90 days'$$);
