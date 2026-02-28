import crypto from 'crypto';
import db from '../db.js';
import { v4 as uuid } from 'uuid';

export function botAuthMiddleware(req, res, next) {
  const key = req.headers['x-bot-key'];
  if (!key) return res.status(401).json({ error: 'No bot key provided' });

  const hash = crypto.createHash('sha256').update(key).digest('hex');
  const bot = db.prepare('SELECT * FROM bot_keys WHERE key_hash = ?').get(hash);
  if (!bot) return res.status(401).json({ error: 'Invalid bot key' });

  req.userId = bot.user_id;
  req.botScopes = JSON.parse(bot.scopes || '[]');
  req.botKeyHash = hash;

  // Update last_used
  db.prepare('UPDATE bot_keys SET last_used = datetime("now") WHERE key_hash = ?').run(hash);

  // Audit log
  db.prepare(`INSERT INTO audit_log (id, user_id, actor, action, target, details) VALUES (?, ?, 'bot', ?, ?, ?)`)
    .run(uuid(), bot.user_id, `${req.method} ${req.path}`, req.body?.alarmId || req.params?.id || '-', JSON.stringify(req.body || {}).slice(0, 500));

  next();
}
