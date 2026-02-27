import crypto from 'crypto';
import { supabase } from '../lib/supabase.js';

/**
 * Authenticate bot via X-Bot-Token header.
 * The token is hashed and looked up in bot_pairings.
 * Sets req.userId, req.botScopes, req.botPairingId.
 */
export async function botAuthMiddleware(req, res, next) {
  const token = req.headers['x-bot-token'];
  if (!token) return res.status(401).json({ error: 'No bot token. Send X-Bot-Token header.' });

  const hash = crypto.createHash('sha256').update(token).digest('hex');

  const { data: pairing, error } = await supabase
    .from('bot_pairings')
    .select('*')
    .eq('bot_token_hash', hash)
    .eq('status', 'active')
    .single();

  if (error || !pairing) {
    return res.status(401).json({ error: 'Invalid or revoked bot token' });
  }

  req.userId = pairing.user_id;
  req.botScopes = pairing.scopes;
  req.botPairingId = pairing.id;

  // Audit log (fire-and-forget)
  supabase.from('audit_log').insert({
    user_id: pairing.user_id,
    actor: 'bot',
    action: `${req.method} ${req.path}`,
    target_type: req.params?.id ? 'alarm' : null,
    target_id: req.params?.id || null,
    details: { body: JSON.stringify(req.body || {}).slice(0, 500) },
  }).then(() => {});

  next();
}
