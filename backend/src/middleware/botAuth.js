import crypto from 'crypto';

export function botAuthMiddleware(req, res, next) {
  const key = req.headers['x-bot-key'];
  if (!key) return res.status(401).json({ error: 'No bot key' });

  const hash = crypto.createHash('sha256').update(key).digest('hex');
  const bot = global.botKeys.get(hash);
  if (!bot) return res.status(401).json({ error: 'Invalid bot key' });

  req.userId = bot.userId;
  req.botScopes = bot.scopes;
  req.botKeyHash = hash;

  // Audit
  global.auditLog.push({
    id: Date.now().toString(),
    userId: bot.userId,
    timestamp: new Date().toISOString(),
    actor: 'bot',
    action: `${req.method} ${req.path}`,
    target: req.body?.alarmId || req.params?.id || '-',
    details: JSON.stringify(req.body || {}).slice(0, 200),
  });

  next();
}
