import { Router } from 'express';
import crypto from 'crypto';
import { v4 as uuid } from 'uuid';
import db from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

export const pairingRouter = Router();

/**
 * PAIRING FLOW:
 * 1. User taps "Bot verbinden" in app → POST /api/pairing/code → gets 6-digit code
 * 2. User tells ClawdBot the code (e.g. "pair 482917")
 * 3. Bot calls POST /api/pairing/claim with the code → gets a bot_token back
 * 4. Bot uses bot_token for all future API calls (X-Bot-Token header)
 */

// ─── Step 1: User generates a pairing code ───
pairingRouter.post('/code', authMiddleware, (req, res) => {
  // Invalidate any existing pending codes
  db.prepare("UPDATE bot_pairings SET status = 'revoked' WHERE user_id = ? AND status = 'pending'")
    .run(req.userId);

  const id = uuid();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  db.prepare('INSERT INTO bot_pairings (id, user_id, pairing_code, status, expires_at) VALUES (?, ?, ?, ?, ?)')
    .run(id, req.userId, code, 'pending', expiresAt);

  res.json({
    code,
    expires_in: 600,
    message: `Give this code to your ClawdBot: "pair ${code}"`,
  });
});

// ─── Step 2: Bot claims the pairing code (public endpoint) ───
pairingRouter.post('/claim', (req, res) => {
  const { code, bot_name } = req.body;
  if (!code || typeof code !== 'string' || !/^\d{6}$/.test(code)) {
    return res.status(400).json({ error: 'Valid 6-digit pairing code required' });
  }

  const pairing = db.prepare(
    "SELECT * FROM bot_pairings WHERE pairing_code = ? AND status = 'pending' AND expires_at > datetime('now')"
  ).get(code);

  if (!pairing) {
    return res.status(404).json({ error: 'Invalid or expired pairing code' });
  }

  // Generate bot token
  const rawToken = `abt_${crypto.randomBytes(32).toString('hex')}`;
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  // Activate pairing
  db.prepare(
    "UPDATE bot_pairings SET status = 'active', bot_token_hash = ?, bot_name = ?, paired_at = datetime('now') WHERE id = ?"
  ).run(tokenHash, bot_name || 'ClawdBot', pairing.id);

  // Audit
  db.prepare("INSERT INTO audit_log (id, user_id, actor, action, target, details) VALUES (?, ?, 'bot', 'Bot paired', ?, ?)")
    .run(uuid(), pairing.user_id, pairing.id, JSON.stringify({ bot_name: bot_name || 'ClawdBot' }));

  res.json({
    bot_token: rawToken,
    user_id: pairing.user_id,
    scopes: JSON.parse(pairing.scopes),
    message: 'Pairing successful! Store this token securely — it cannot be shown again.',
  });
});

// ─── List active pairings ───
pairingRouter.get('/', authMiddleware, (req, res) => {
  const pairings = db.prepare(
    "SELECT id, bot_name, scopes, status, paired_at, created_at FROM bot_pairings WHERE user_id = ? AND status IN ('active', 'pending') ORDER BY created_at DESC"
  ).all(req.userId);

  res.json({
    pairings: pairings.map(p => ({ ...p, scopes: JSON.parse(p.scopes || '[]') })),
  });
});

// ─── Revoke a pairing ───
pairingRouter.delete('/:id', authMiddleware, (req, res) => {
  const result = db.prepare(
    "UPDATE bot_pairings SET status = 'revoked' WHERE id = ? AND user_id = ?"
  ).run(req.params.id, req.userId);

  if (result.changes === 0) return res.status(404).json({ error: 'Pairing not found' });

  db.prepare("INSERT INTO audit_log (id, user_id, actor, action, target) VALUES (?, ?, 'user', 'Bot pairing revoked', ?)")
    .run(uuid(), req.userId, req.params.id);

  res.json({ ok: true });
});
