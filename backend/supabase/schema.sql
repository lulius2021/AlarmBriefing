-- AlarmBriefing Database Schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. PROFILES (extends Supabase Auth users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  timezone TEXT DEFAULT 'Europe/Berlin',
  locale TEXT DEFAULT 'de',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 2. BOT PAIRINGS
-- ============================================
CREATE TABLE IF NOT EXISTS bot_pairings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pairing_code TEXT UNIQUE NOT NULL,        -- 6-digit code user gives to bot
  bot_token_hash TEXT UNIQUE,               -- SHA256 of the bot's access token
  bot_name TEXT DEFAULT 'ClawdBot',
  scopes TEXT[] DEFAULT ARRAY['alarms:read','alarms:write','briefings:write','settings:read'],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','active','revoked')),
  paired_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '10 minutes'),  -- pairing code expiry
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bot_pairings_user ON bot_pairings(user_id);
CREATE INDEX idx_bot_pairings_code ON bot_pairings(pairing_code) WHERE status = 'pending';
CREATE INDEX idx_bot_pairings_token ON bot_pairings(bot_token_hash) WHERE status = 'active';

-- ============================================
-- 3. ALARMS
-- ============================================
CREATE TABLE IF NOT EXISTS alarms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Alarm',
  active BOOLEAN DEFAULT TRUE,
  time TIME NOT NULL DEFAULT '07:00:00',
  days INT[] DEFAULT ARRAY[1,2,3,4,5],      -- 0=Sun, 1=Mon...6=Sat
  snooze_enabled BOOLEAN DEFAULT TRUE,
  snooze_duration INT DEFAULT 5,             -- minutes
  sound TEXT DEFAULT 'default',
  vibration BOOLEAN DEFAULT TRUE,
  briefing_mode TEXT DEFAULT 'standard' CHECK (briefing_mode IN ('none','short','standard','long')),
  managed_by TEXT DEFAULT 'manual' CHECK (managed_by IN ('manual','bot')),
  bot_pairing_id UUID REFERENCES bot_pairings(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alarms_user ON alarms(user_id);
CREATE INDEX idx_alarms_active ON alarms(user_id, active) WHERE active = TRUE;

-- ============================================
-- 4. BRIEFINGS
-- ============================================
CREATE TABLE IF NOT EXISTS briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alarm_id UUID NOT NULL REFERENCES alarms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  modules TEXT[] DEFAULT ARRAY['weather','news'],
  content_text TEXT,                          -- plain text briefing
  content_ssml TEXT,                          -- SSML for TTS
  audio_url TEXT,                             -- URL to generated audio file
  weather_data JSONB,
  news_data JSONB,
  calendar_data JSONB,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  cached BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_briefings_alarm ON briefings(alarm_id);
CREATE INDEX idx_briefings_user ON briefings(user_id);

-- ============================================
-- 5. AUDIT LOG
-- ============================================
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  actor TEXT NOT NULL CHECK (actor IN ('user','bot','system')),
  action TEXT NOT NULL,
  target_type TEXT,           -- 'alarm', 'briefing', 'settings', 'pairing'
  target_id UUID,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_log(user_id, created_at DESC);

-- ============================================
-- 6. USER SETTINGS
-- ============================================
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  tts_voice TEXT DEFAULT 'alloy',
  tts_speed NUMERIC(2,1) DEFAULT 1.0,
  briefing_length TEXT DEFAULT 'standard' CHECK (briefing_length IN ('short','standard','long')),
  modules_enabled TEXT[] DEFAULT ARRAY['weather','calendar','news'],
  telemetry_enabled BOOLEAN DEFAULT FALSE,
  notification_enabled BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_pairings ENABLE ROW LEVEL SECURITY;
ALTER TABLE alarms ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their own data
CREATE POLICY "Users own profiles" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users own pairings" ON bot_pairings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own alarms" ON alarms FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own briefings" ON briefings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own audit" ON audit_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);

-- Service role (backend) can do everything (uses service_role key)
-- No extra policy needed — service_role bypasses RLS

-- ============================================
-- 8. UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_alarms_updated_at BEFORE UPDATE ON alarms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
