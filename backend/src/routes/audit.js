import { Router } from 'express';
import db from '../db.js';

export const auditRouter = Router();

auditRouter.get('/', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);
  const rows = db.prepare('SELECT * FROM audit_log WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?')
    .all(req.userId, limit);
  res.json({ logs: rows });
});
