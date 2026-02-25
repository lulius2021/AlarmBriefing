import { Router } from 'express';
import { v4 as uuid } from 'uuid';

export const alarmRouter = Router();

// List alarms
alarmRouter.get('/', (req, res) => {
  const alarms = global.alarms.get(req.userId) || [];
  res.json({ alarms });
});

// Get alarm
alarmRouter.get('/:id', (req, res) => {
  const alarms = global.alarms.get(req.userId) || [];
  const alarm = alarms.find(a => a.id === req.params.id);
  if (!alarm) return res.status(404).json({ error: 'Not found' });
  res.json({ alarm });
});

// Create alarm
alarmRouter.post('/', (req, res) => {
  const alarm = {
    id: uuid(),
    name: req.body.name || 'Alarm',
    active: req.body.active ?? true,
    time: req.body.time || '07:00:00',
    days: req.body.days || [],
    snoozeEnabled: req.body.snoozeEnabled ?? true,
    snoozeDuration: req.body.snoozeDuration || 5,
    sound: req.body.sound || 'default',
    vibration: req.body.vibration ?? true,
    briefingMode: req.body.briefingMode || 'standard',
    managedBy: req.body.managedBy || 'manual',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const alarms = global.alarms.get(req.userId) || [];
  alarms.push(alarm);
  global.alarms.set(req.userId, alarms);

  res.status(201).json({ alarm });
});

// Update alarm
alarmRouter.patch('/:id', (req, res) => {
  const alarms = global.alarms.get(req.userId) || [];
  const idx = alarms.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  alarms[idx] = { ...alarms[idx], ...req.body, updatedAt: new Date().toISOString() };
  global.alarms.set(req.userId, alarms);

  res.json({ alarm: alarms[idx] });
});

// Delete alarm
alarmRouter.delete('/:id', (req, res) => {
  let alarms = global.alarms.get(req.userId) || [];
  alarms = alarms.filter(a => a.id !== req.params.id);
  global.alarms.set(req.userId, alarms);
  res.json({ ok: true });
});
