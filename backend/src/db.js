import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'alarmbriefing.db');

// Ensure data dir exists
import fs from 'fs';
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT,
    password TEXT,
    auth_providers TEXT DEFAULT '[]',
    settings TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS auth_identities (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    email TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(provider, provider_id)
  );

  CREATE TABLE IF NOT EXISTS alarms (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT DEFAULT 'Alarm',
    active INTEGER DEFAULT 1,
    time TEXT NOT NULL,
    days TEXT DEFAULT '[]',
    one_time INTEGER DEFAULT 0,
    snooze_enabled INTEGER DEFAULT 1,
    snooze_duration INTEGER DEFAULT 5,
    sound TEXT DEFAULT 'default',
    vibration INTEGER DEFAULT 1,
    briefing_mode TEXT DEFAULT 'standard',
    managed_by TEXT DEFAULT 'manual',
    last_triggered TEXT,
    next_trigger TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS bot_keys (
    key_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scopes TEXT DEFAULT '[]',
    name TEXT DEFAULT 'Bot Key',
    last_used TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS briefings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    alarm_id TEXT REFERENCES alarms(id) ON DELETE SET NULL,
    modules TEXT DEFAULT '[]',
    content TEXT DEFAULT '',
    audio_url TEXT,
    duration_seconds INTEGER,
    cached INTEGER DEFAULT 0,
    generated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    target TEXT,
    details TEXT,
    timestamp TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS device_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    platform TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS bot_pairings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pairing_code TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    bot_token_hash TEXT,
    bot_name TEXT DEFAULT 'ClawdBot',
    scopes TEXT DEFAULT '["alarms:read","alarms:write","briefings:write","settings:read"]',
    expires_at TEXT NOT NULL,
    paired_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_pairings_code ON bot_pairings(pairing_code);
  CREATE INDEX IF NOT EXISTS idx_pairings_user ON bot_pairings(user_id);
  CREATE INDEX IF NOT EXISTS idx_alarms_user ON alarms(user_id);
  CREATE INDEX IF NOT EXISTS idx_briefings_user ON briefings(user_id);
  CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
  CREATE INDEX IF NOT EXISTS idx_bot_keys_user ON bot_keys(user_id);
`);

export default db;
