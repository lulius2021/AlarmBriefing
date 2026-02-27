import { Router } from 'express';
import { supabase } from '../lib/supabase.js';

export const briefingRouter = Router();

// Get latest briefing for an alarm
briefingRouter.get('/:alarmId/latest', async (req, res) => {
  const { data } = await supabase
    .from('briefings')
    .select('*')
    .eq('alarm_id', req.params.alarmId)
    .eq('user_id', req.userId)
    .order('generated_at', { ascending: false })
    .limit(1)
    .single();

  res.json({ briefing: data || null });
});

// List briefing history
briefingRouter.get('/', async (req, res) => {
  const { data } = await supabase
    .from('briefings')
    .select('*')
    .eq('user_id', req.userId)
    .order('generated_at', { ascending: false })
    .limit(20);

  res.json({ briefings: data || [] });
});
