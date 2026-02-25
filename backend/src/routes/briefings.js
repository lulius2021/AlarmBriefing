import { Router } from 'express';

export const briefingRouter = Router();

// Get latest briefing for alarm
briefingRouter.get('/:alarmId/latest', (req, res) => {
  const briefings = global.briefings.get(req.userId) || [];
  const latest = briefings
    .filter(b => b.alarmId === req.params.alarmId)
    .sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))[0];

  if (!latest) return res.json({ briefing: null, cached: false });
  res.json({ briefing: latest, cached: latest.cached });
});

// List briefing history
briefingRouter.get('/', (req, res) => {
  const briefings = global.briefings.get(req.userId) || [];
  res.json({ briefings: briefings.slice(-20) });
});
