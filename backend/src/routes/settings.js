import { Router } from 'express';
import { supabase } from '../lib/supabase.js';

export const settingsRouter = Router();

// Get settings
settingsRouter.get('/', async (req, res) => {
  const { data } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', req.userId)
    .single();

  res.json({ settings: data || {} });
});

// Update settings
settingsRouter.patch('/', async (req, res) => {
  const allowed = ['tts_voice', 'tts_speed', 'briefing_length', 'modules_enabled',
    'telemetry_enabled', 'notification_enabled'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const { data, error } = await supabase
    .from('user_settings')
    .upsert({ user_id: req.userId, ...updates })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ settings: data });
});
