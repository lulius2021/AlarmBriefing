import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db.js';

export const botRouter = Router();

function checkScope(req, scope) {
  return req.botScopes.includes(scope);
}

function rowToAlarm(row) {
  return {
    id: row.id, name: row.name, active: !!row.active, time: row.time,
    days: JSON.parse(row.days || '[]'), snoozeEnabled: !!row.snooze_enabled,
    snoozeDuration: row.snooze_duration, sound: row.sound, vibration: !!row.vibration,
    briefingMode: row.briefing_mode, managedBy: row.managed_by,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

// Ping
botRouter.get('/ping', (req, res) => {
  res.json({ ok: true, userId: req.userId, scopes: req.botScopes, timestamp: new Date().toISOString() });
});

// List alarms
botRouter.get('/alarms', (req, res) => {
  if (!checkScope(req, 'alarms:read')) return res.status(403).json({ error: 'Scope alarms:read required' });
  const rows = db.prepare('SELECT * FROM alarms WHERE user_id = ? ORDER BY time ASC').all(req.userId);
  res.json({ alarms: rows.map(rowToAlarm) });
});

// Create alarm
botRouter.post('/alarms', (req, res) => {
  if (!checkScope(req, 'alarms:write')) return res.status(403).json({ error: 'Scope alarms:write required' });

  const count = db.prepare('SELECT COUNT(*) as cnt FROM alarms WHERE user_id = ?').get(req.userId);
  if (count.cnt >= 20) return res.status(429).json({ error: 'Bot alarm limit reached (20)' });

  const id = uuid();
  const b = req.body;
  db.prepare(`INSERT INTO alarms (id, user_id, name, active, time, days, snooze_enabled, snooze_duration, sound, vibration, briefing_mode, managed_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'bot')`)
    .run(id, req.userId, b.name || 'Bot-Alarm', b.active !== false ? 1 : 0, b.time || '07:00:00',
      JSON.stringify(b.days || []), b.snoozeEnabled !== false ? 1 : 0, b.snoozeDuration || 5,
      b.sound || 'default', b.vibration !== false ? 1 : 0, b.briefingMode || 'standard');

  const row = db.prepare('SELECT * FROM alarms WHERE id = ?').get(id);
  res.status(201).json({ alarm: rowToAlarm(row) });
});

// Update alarm (bot-managed only)
botRouter.patch('/alarms/:id', (req, res) => {
  if (!checkScope(req, 'alarms:write')) return res.status(403).json({ error: 'Scope alarms:write required' });

  const existing = db.prepare('SELECT * FROM alarms WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!existing) return res.status(404).json({ error: 'Alarm not found' });
  if (existing.managed_by !== 'bot') return res.status(403).json({ error: 'Cannot modify manual alarm' });

  const b = req.body;
  const updates = [];
  const values = [];

  if (b.name !== undefined) { updates.push('name = ?'); values.push(b.name); }
  if (b.active !== undefined) { updates.push('active = ?'); values.push(b.active ? 1 : 0); }
  if (b.time !== undefined) { updates.push('time = ?'); values.push(b.time); }
  if (b.days !== undefined) { updates.push('days = ?'); values.push(JSON.stringify(b.days)); }
  if (b.snoozeEnabled !== undefined) { updates.push('snooze_enabled = ?'); values.push(b.snoozeEnabled ? 1 : 0); }
  if (b.snoozeDuration !== undefined) { updates.push('snooze_duration = ?'); values.push(b.snoozeDuration); }
  if (b.briefingMode !== undefined) { updates.push('briefing_mode = ?'); values.push(b.briefingMode); }

  if (updates.length === 0) return res.json({ alarm: rowToAlarm(existing) });

  updates.push('updated_at = datetime("now")');
  values.push(req.params.id, req.userId);
  db.prepare(`UPDATE alarms SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`).run(...values);

  const row = db.prepare('SELECT * FROM alarms WHERE id = ?').get(req.params.id);
  res.json({ alarm: rowToAlarm(row) });
});

// Delete alarm (bot-managed only)
botRouter.delete('/alarms/:id', (req, res) => {
  if (!checkScope(req, 'alarms:write')) return res.status(403).json({ error: 'Scope alarms:write required' });

  const existing = db.prepare('SELECT * FROM alarms WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!existing) return res.status(404).json({ error: 'Alarm not found' });
  if (existing.managed_by !== 'bot') return res.status(403).json({ error: 'Cannot delete manual alarm' });

  db.prepare('DELETE FROM alarms WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// Generate briefing
botRouter.post('/briefings/generate', (req, res) => {
  if (!checkScope(req, 'briefings:write')) return res.status(403).json({ error: 'Scope briefings:write required' });

  const { alarmId, modules, content } = req.body;
  const id = uuid();
  db.prepare(`INSERT INTO briefings (id, user_id, alarm_id, modules, content, cached) VALUES (?, ?, ?, ?, ?, 1)`)
    .run(id, req.userId, alarmId || null, JSON.stringify(modules || ['weather', 'news']), content || '');

  // Cleanup: keep last 50 per user
  db.prepare(`DELETE FROM briefings WHERE id NOT IN (SELECT id FROM briefings WHERE user_id = ? ORDER BY generated_at DESC LIMIT 50)`).run(req.userId);

  const row = db.prepare('SELECT * FROM briefings WHERE id = ?').get(id);
  res.status(201).json({ briefing: row });
});

// Read settings
botRouter.get('/settings', (req, res) => {
  if (!checkScope(req, 'settings:read')) return res.status(403).json({ error: 'Scope settings:read required' });
  const user = db.prepare('SELECT settings FROM users WHERE id = ?').get(req.userId);
  res.json({ settings: JSON.parse(user?.settings || '{}') });
});

// Update settings (limited scope)
botRouter.patch('/settings', (req, res) => {
  if (!checkScope(req, 'settings:write')) return res.status(403).json({ error: 'Scope settings:write required' });

  const user = db.prepare('SELECT settings FROM users WHERE id = ?').get(req.userId);
  const current = JSON.parse(user?.settings || '{}');
  const allowed = ['briefingLength', 'modules', 'locale'];
  const updates = {};

  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const merged = { ...current, ...updates };
  db.prepare('UPDATE users SET settings = ?, updated_at = datetime("now") WHERE id = ?')
    .run(JSON.stringify(merged), req.userId);

  res.json({ settings: merged });
});
