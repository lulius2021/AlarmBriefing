import { Router } from 'express';
import { v4 as uuid } from 'uuid';

export const botRouter = Router();

// Bot: List alarms
botRouter.get('/alarms', (req, res) => {
  if (!req.botScopes.includes('alarms:read'))
    return res.status(403).json({ error: 'Scope alarms:read required' });
  const alarms = global.alarms.get(req.userId) || [];
  res.json({ alarms });
});

// Bot: Create alarm
botRouter.post('/alarms', (req, res) => {
  if (!req.botScopes.includes('alarms:write'))
    return res.status(403).json({ error: 'Scope alarms:write required' });

  // Rate limit: max 20 alarms
  const alarms = global.alarms.get(req.userId) || [];
  if (alarms.length >= 20) return res.status(429).json({ error: 'Alarm limit reached (20)' });

  const alarm = {
    id: uuid(),
    name: req.body.name || 'Bot-Alarm',
    active: req.body.active ?? true,
    time: req.body.time || '07:00:00',
    days: req.body.days || [],
    snoozeEnabled: req.body.snoozeEnabled ?? true,
    snoozeDuration: req.body.snoozeDuration || 5,
    sound: req.body.sound || 'default',
    vibration: req.body.vibration ?? true,
    briefingMode: req.body.briefingMode || 'standard',
    managedBy: 'bot',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  alarms.push(alarm);
  global.alarms.set(req.userId, alarms);
  res.status(201).json({ alarm });
});

// Bot: Update alarm
botRouter.patch('/alarms/:id', (req, res) => {
  if (!req.botScopes.includes('alarms:write'))
    return res.status(403).json({ error: 'Scope alarms:write required' });

  const alarms = global.alarms.get(req.userId) || [];
  const idx = alarms.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  // Bot can only modify bot-managed alarms
  if (alarms[idx].managedBy !== 'bot')
    return res.status(403).json({ error: 'Cannot modify manual alarm' });

  alarms[idx] = { ...alarms[idx], ...req.body, managedBy: 'bot', updatedAt: new Date().toISOString() };
  global.alarms.set(req.userId, alarms);
  res.json({ alarm: alarms[idx] });
});

// Bot: Delete alarm
botRouter.delete('/alarms/:id', (req, res) => {
  if (!req.botScopes.includes('alarms:write'))
    return res.status(403).json({ error: 'Scope alarms:write required' });

  let alarms = global.alarms.get(req.userId) || [];
  const alarm = alarms.find(a => a.id === req.params.id);
  if (!alarm) return res.status(404).json({ error: 'Not found' });
  if (alarm.managedBy !== 'bot')
    return res.status(403).json({ error: 'Cannot delete manual alarm' });

  alarms = alarms.filter(a => a.id !== req.params.id);
  global.alarms.set(req.userId, alarms);
  res.json({ ok: true });
});

// Bot: Trigger briefing generation
botRouter.post('/briefings/generate', (req, res) => {
  if (!req.botScopes.includes('briefings:write'))
    return res.status(403).json({ error: 'Scope briefings:write required' });

  const { alarmId, modules, content } = req.body;
  const briefing = {
    id: uuid(),
    alarmId,
    userId: req.userId,
    modules: modules || ['weather', 'news'],
    content: content || '',
    generatedAt: new Date().toISOString(),
    cached: true,
  };

  const userBriefings = global.briefings.get(req.userId) || [];
  userBriefings.push(briefing);
  // Keep last 50
  if (userBriefings.length > 50) userBriefings.shift();
  global.briefings.set(req.userId, userBriefings);

  res.json({ briefing });
});

// Bot: Read settings
botRouter.get('/settings', (req, res) => {
  if (!req.botScopes.includes('settings:read'))
    return res.status(403).json({ error: 'Scope settings:read required' });
  const user = global.users.get(req.userId);
  res.json({ settings: user?.settings || {} });
});

// Bot: Ping
botRouter.get('/ping', (req, res) => {
  res.json({ ok: true, userId: req.userId, scopes: req.botScopes, timestamp: new Date().toISOString() });
});
