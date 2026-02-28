import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db.js';
import { validateAlarmBody } from '../middleware/validate.js';

export const alarmRouter = Router();
alarmRouter.use(validateAlarmBody);

function rowToAlarm(row) {
  return {
    id: row.id,
    name: row.name,
    active: !!row.active,
    time: row.time,
    days: JSON.parse(row.days || '[]'),
    oneTime: !!row.one_time,
    snoozeEnabled: !!row.snooze_enabled,
    snoozeDuration: row.snooze_duration,
    sound: row.sound,
    vibration: !!row.vibration,
    briefingMode: row.briefing_mode,
    managedBy: row.managed_by,
    lastTriggered: row.last_triggered,
    nextTrigger: row.next_trigger,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// List alarms
alarmRouter.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM alarms WHERE user_id = ? ORDER BY time ASC').all(req.userId);
  res.json({ alarms: rows.map(rowToAlarm) });
});

// Get alarm
alarmRouter.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM alarms WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!row) return res.status(404).json({ error: 'Alarm not found' });
  res.json({ alarm: rowToAlarm(row) });
});

// Create alarm
alarmRouter.post('/', (req, res) => {
  const count = db.prepare('SELECT COUNT(*) as cnt FROM alarms WHERE user_id = ?').get(req.userId);
  if (count.cnt >= 50) return res.status(429).json({ error: 'Maximum 50 alarms per account' });

  const id = uuid();
  const b = req.body;
  db.prepare(`INSERT INTO alarms (id, user_id, name, active, time, days, one_time, snooze_enabled, snooze_duration, sound, vibration, briefing_mode, managed_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, req.userId, b.name || 'Alarm', b.active !== false ? 1 : 0, b.time || '07:00:00',
      JSON.stringify(b.days || []), b.oneTime ? 1 : 0, b.snoozeEnabled !== false ? 1 : 0,
      b.snoozeDuration || 5, b.sound || 'default', b.vibration !== false ? 1 : 0,
      b.briefingMode || 'standard', b.managedBy || 'manual');

  const row = db.prepare('SELECT * FROM alarms WHERE id = ?').get(id);
  res.status(201).json({ alarm: rowToAlarm(row) });
});

// Update alarm
alarmRouter.patch('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM alarms WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!existing) return res.status(404).json({ error: 'Alarm not found' });

  const b = req.body;
  const updates = [];
  const values = [];

  if (b.name !== undefined) { updates.push('name = ?'); values.push(b.name); }
  if (b.active !== undefined) { updates.push('active = ?'); values.push(b.active ? 1 : 0); }
  if (b.time !== undefined) { updates.push('time = ?'); values.push(b.time); }
  if (b.days !== undefined) { updates.push('days = ?'); values.push(JSON.stringify(b.days)); }
  if (b.oneTime !== undefined) { updates.push('one_time = ?'); values.push(b.oneTime ? 1 : 0); }
  if (b.snoozeEnabled !== undefined) { updates.push('snooze_enabled = ?'); values.push(b.snoozeEnabled ? 1 : 0); }
  if (b.snoozeDuration !== undefined) { updates.push('snooze_duration = ?'); values.push(b.snoozeDuration); }
  if (b.sound !== undefined) { updates.push('sound = ?'); values.push(b.sound); }
  if (b.vibration !== undefined) { updates.push('vibration = ?'); values.push(b.vibration ? 1 : 0); }
  if (b.briefingMode !== undefined) { updates.push('briefing_mode = ?'); values.push(b.briefingMode); }

  if (updates.length === 0) return res.json({ alarm: rowToAlarm(existing) });

  updates.push('updated_at = datetime("now")');
  values.push(req.params.id, req.userId);

  db.prepare(`UPDATE alarms SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`).run(...values);

  const row = db.prepare('SELECT * FROM alarms WHERE id = ?').get(req.params.id);
  res.json({ alarm: rowToAlarm(row) });
});

// Delete alarm
alarmRouter.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM alarms WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  if (result.changes === 0) return res.status(404).json({ error: 'Alarm not found' });
  res.json({ ok: true });
});
