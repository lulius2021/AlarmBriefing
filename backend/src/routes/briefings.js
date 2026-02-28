import { Router } from 'express';
import db from '../db.js';

export const briefingRouter = Router();

// Get latest briefing for alarm
briefingRouter.get('/:alarmId/latest', (req, res) => {
  const row = db.prepare('SELECT * FROM briefings WHERE user_id = ? AND alarm_id = ? ORDER BY generated_at DESC LIMIT 1')
    .get(req.userId, req.params.alarmId);
  res.json({ briefing: row || null });
});

// List briefing history
briefingRouter.get('/', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const rows = db.prepare('SELECT * FROM briefings WHERE user_id = ? ORDER BY generated_at DESC LIMIT ?')
    .all(req.userId, limit);
  res.json({ briefings: rows });
});
