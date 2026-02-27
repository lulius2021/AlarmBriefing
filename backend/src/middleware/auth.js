import { supabase } from '../lib/supabase.js';

/**
 * Verify Supabase JWT from Authorization header.
 * Sets req.userId on success.
 */
export async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid or expired token' });

  req.userId = user.id;
  req.userEmail = user.email;
  next();
}
