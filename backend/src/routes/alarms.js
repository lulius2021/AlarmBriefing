import { Router } from 'express';
import { supabase } from '../lib/supabase.js';

export const alarmRouter = Router();

// List alarms
alarmRouter.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('alarms')
    .select('*')
    .eq('user_id', req.userId)
    .order('time', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ alarms: data });
});

// Get single alarm
alarmRouter.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('alarms')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.userId)
    .single();

  if (error) return res.status(404).json({ error: 'Alarm not found' });
  res.json({ alarm: data });
});

// Create alarm
alarmRouter.post('/', async (req, res) => {
  // Max 20 alarms per user
  const { count } = await supabase
    .from('alarms')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', req.userId);

  if (count >= 20) return res.status(429).json({ error: 'Max 20 alarms reached' });

  const { data, error } = await supabase.from('alarms').insert({
    user_id: req.userId,
    name: req.body.name || 'Alarm',
    active: req.body.active ?? true,
    time: req.body.time || '07:00:00',
    days: req.body.days || [1, 2, 3, 4, 5],
    snooze_enabled: req.body.snooze_enabled ?? true,
    snooze_duration: req.body.snooze_duration || 5,
    sound: req.body.sound || 'default',
    vibration: req.body.vibration ?? true,
    briefing_mode: req.body.briefing_mode || 'standard',
    managed_by: 'manual',
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  await supabase.from('audit_log').insert({
    user_id: req.userId,
    actor: 'user',
    action: 'Alarm created',
    target_type: 'alarm',
    target_id: data.id,
    details: { name: data.name, time: data.time },
  });

  res.status(201).json({ alarm: data });
});

// Update alarm
alarmRouter.patch('/:id', async (req, res) => {
  const allowed = ['name', 'active', 'time', 'days', 'snooze_enabled', 'snooze_duration',
    'sound', 'vibration', 'briefing_mode'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const { data, error } = await supabase
    .from('alarms')
    .update(updates)
    .eq('id', req.params.id)
    .eq('user_id', req.userId)
    .select()
    .single();

  if (error) return res.status(404).json({ error: 'Alarm not found' });
  res.json({ alarm: data });
});

// Delete alarm
alarmRouter.delete('/:id', async (req, res) => {
  const { error } = await supabase
    .from('alarms')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.userId);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});
