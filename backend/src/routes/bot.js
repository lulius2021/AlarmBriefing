import { Router } from 'express';
import { supabase } from '../lib/supabase.js';

export const botRouter = Router();

// ─── Bot: List all user alarms ───
botRouter.get('/alarms', async (req, res) => {
  if (!req.botScopes.includes('alarms:read'))
    return res.status(403).json({ error: 'Scope alarms:read required' });

  const { data } = await supabase
    .from('alarms')
    .select('*')
    .eq('user_id', req.userId)
    .order('time');

  res.json({ alarms: data || [] });
});

// ─── Bot: Create alarm ───
botRouter.post('/alarms', async (req, res) => {
  if (!req.botScopes.includes('alarms:write'))
    return res.status(403).json({ error: 'Scope alarms:write required' });

  const { count } = await supabase
    .from('alarms')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', req.userId);

  if (count >= 20) return res.status(429).json({ error: 'Max 20 alarms' });

  const { data, error } = await supabase.from('alarms').insert({
    user_id: req.userId,
    name: req.body.name || 'Bot-Alarm',
    active: req.body.active ?? true,
    time: req.body.time || '07:00:00',
    days: req.body.days || [],
    snooze_enabled: req.body.snooze_enabled ?? true,
    snooze_duration: req.body.snooze_duration || 5,
    sound: req.body.sound || 'default',
    vibration: req.body.vibration ?? true,
    briefing_mode: req.body.briefing_mode || 'standard',
    managed_by: 'bot',
    bot_pairing_id: req.botPairingId,
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ alarm: data });
});

// ─── Bot: Update alarm (bot-managed only) ───
botRouter.patch('/alarms/:id', async (req, res) => {
  if (!req.botScopes.includes('alarms:write'))
    return res.status(403).json({ error: 'Scope alarms:write required' });

  // Verify it's a bot-managed alarm
  const { data: existing } = await supabase
    .from('alarms')
    .select('managed_by')
    .eq('id', req.params.id)
    .eq('user_id', req.userId)
    .single();

  if (!existing) return res.status(404).json({ error: 'Alarm not found' });
  if (existing.managed_by !== 'bot')
    return res.status(403).json({ error: 'Cannot modify user-created alarm' });

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

  if (error) return res.status(500).json({ error: error.message });
  res.json({ alarm: data });
});

// ─── Bot: Delete alarm (bot-managed only) ───
botRouter.delete('/alarms/:id', async (req, res) => {
  if (!req.botScopes.includes('alarms:write'))
    return res.status(403).json({ error: 'Scope alarms:write required' });

  const { data: existing } = await supabase
    .from('alarms')
    .select('managed_by')
    .eq('id', req.params.id)
    .eq('user_id', req.userId)
    .single();

  if (!existing) return res.status(404).json({ error: 'Alarm not found' });
  if (existing.managed_by !== 'bot')
    return res.status(403).json({ error: 'Cannot delete user-created alarm' });

  await supabase.from('alarms').delete().eq('id', req.params.id);
  res.json({ ok: true });
});

// ─── Bot: Push briefing ───
botRouter.post('/briefings', async (req, res) => {
  if (!req.botScopes.includes('briefings:write'))
    return res.status(403).json({ error: 'Scope briefings:write required' });

  const { alarm_id, modules, content_text, content_ssml, audio_url, weather_data, news_data } = req.body;
  if (!alarm_id) return res.status(400).json({ error: 'alarm_id required' });

  const { data, error } = await supabase.from('briefings').insert({
    alarm_id,
    user_id: req.userId,
    modules: modules || ['weather', 'news'],
    content_text,
    content_ssml,
    audio_url,
    weather_data,
    news_data,
    cached: true,
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ briefing: data });
});

// ─── Bot: Read user settings ───
botRouter.get('/settings', async (req, res) => {
  if (!req.botScopes.includes('settings:read'))
    return res.status(403).json({ error: 'Scope settings:read required' });

  const { data } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', req.userId)
    .single();

  res.json({ settings: data || {} });
});

// ─── Bot: Ping / health ───
botRouter.get('/ping', (req, res) => {
  res.json({
    ok: true,
    user_id: req.userId,
    scopes: req.botScopes,
    timestamp: new Date().toISOString(),
  });
});
