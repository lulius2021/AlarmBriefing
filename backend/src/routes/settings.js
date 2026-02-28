import { Router } from 'express';
import db from '../db.js';

export const settingsRouter = Router();

// Get settings
settingsRouter.get('/', (req, res) => {
  const user = db.prepare('SELECT settings FROM users WHERE id = ?').get(req.userId);
  const defaults = {
    voice: 'alloy',
    speechRate: 1.0,
    briefingLength: 'standard',
    locale: 'de-DE',
    quietHoursStart: null,
    quietHoursEnd: null,
    modules: [
      { id: 'weather', name: 'Wetter', enabled: true, icon: '🌤' },
      { id: 'calendar', name: 'Kalender', enabled: true, icon: '📅' },
      { id: 'news', name: 'Nachrichten', enabled: true, icon: '📰' },
      { id: 'tasks', name: 'Aufgaben', enabled: false, icon: '✅' },
    ],
    telemetryOptIn: false,
  };
  const saved = JSON.parse(user?.settings || '{}');
  res.json({ settings: { ...defaults, ...saved } });
});

// Update settings
settingsRouter.patch('/', (req, res) => {
  const user = db.prepare('SELECT settings FROM users WHERE id = ?').get(req.userId);
  const current = JSON.parse(user?.settings || '{}');
  const merged = { ...current, ...req.body };

  db.prepare('UPDATE users SET settings = ?, updated_at = datetime("now") WHERE id = ?')
    .run(JSON.stringify(merged), req.userId);

  res.json({ settings: merged });
});

// Export user data (DSGVO)
settingsRouter.get('/export', (req, res) => {
  const user = db.prepare('SELECT id, email, name, auth_providers, settings, created_at FROM users WHERE id = ?').get(req.userId);
  const alarms = db.prepare('SELECT * FROM alarms WHERE user_id = ?').all(req.userId);
  const briefings = db.prepare('SELECT id, alarm_id, modules, generated_at FROM briefings WHERE user_id = ?').all(req.userId);
  const auditLogs = db.prepare('SELECT * FROM audit_log WHERE user_id = ? ORDER BY timestamp DESC LIMIT 200').all(req.userId);

  res.json({
    exportDate: new Date().toISOString(),
    user: { ...user, authProviders: JSON.parse(user.auth_providers), settings: JSON.parse(user.settings) },
    alarms,
    briefings,
    auditLogs,
  });
});
