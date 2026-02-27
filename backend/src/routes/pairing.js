import { Router } from 'express';
import crypto from 'crypto';
import { supabase } from '../lib/supabase.js';
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
pairingRouter.post('/code', authMiddleware, async (req, res) => {
  // Invalidate any existing pending codes
  await supabase
    .from('bot_pairings')
    .update({ status: 'revoked' })
    .eq('user_id', req.userId)
    .eq('status', 'pending');

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  const { data, error } = await supabase.from('bot_pairings').insert({
    user_id: req.userId,
    pairing_code: code,
    status: 'pending',
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 min
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  res.json({
    code,
    expires_in: 600,
    message: 'Gib diesen Code deinem ClawdBot: "pair ' + code + '"',
  });
});

// ─── Step 2: Bot claims the pairing code (public endpoint) ───
pairingRouter.post('/claim', async (req, res) => {
  const { code, bot_name } = req.body;
  if (!code) return res.status(400).json({ error: 'Pairing code required' });

  // Find valid pending pairing
  const { data: pairing, error } = await supabase
    .from('bot_pairings')
    .select('*')
    .eq('pairing_code', code)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !pairing) {
    return res.status(404).json({ error: 'Invalid or expired pairing code' });
  }

  // Generate bot token
  const rawToken = `abt_${crypto.randomBytes(32).toString('hex')}`;
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  // Activate pairing
  const { error: updateErr } = await supabase
    .from('bot_pairings')
    .update({
      status: 'active',
      bot_token_hash: tokenHash,
      bot_name: bot_name || 'ClawdBot',
      paired_at: new Date().toISOString(),
    })
    .eq('id', pairing.id);

  if (updateErr) return res.status(500).json({ error: updateErr.message });

  // Audit
  await supabase.from('audit_log').insert({
    user_id: pairing.user_id,
    actor: 'bot',
    action: 'Bot paired',
    target_type: 'pairing',
    target_id: pairing.id,
    details: { bot_name: bot_name || 'ClawdBot' },
  });

  res.json({
    bot_token: rawToken,
    user_id: pairing.user_id,
    scopes: pairing.scopes,
    message: 'Pairing successful! Store this token securely — it cannot be shown again.',
  });
});

// ─── List active pairings ───
pairingRouter.get('/', authMiddleware, async (req, res) => {
  const { data } = await supabase
    .from('bot_pairings')
    .select('id, bot_name, scopes, status, paired_at, created_at')
    .eq('user_id', req.userId)
    .in('status', ['active', 'pending'])
    .order('created_at', { ascending: false });

  res.json({ pairings: data || [] });
});

// ─── Revoke a pairing ───
pairingRouter.delete('/:id', authMiddleware, async (req, res) => {
  const { error } = await supabase
    .from('bot_pairings')
    .update({ status: 'revoked' })
    .eq('id', req.params.id)
    .eq('user_id', req.userId);

  if (error) return res.status(500).json({ error: error.message });

  await supabase.from('audit_log').insert({
    user_id: req.userId,
    actor: 'user',
    action: 'Bot pairing revoked',
    target_type: 'pairing',
    target_id: req.params.id,
  });

  res.json({ ok: true });
});
