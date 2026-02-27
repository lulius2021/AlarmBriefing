import { Router } from 'express';
import { supabase } from '../lib/supabase.js';
import { authMiddleware } from '../middleware/auth.js';

export const authRouter = Router();

// ─── Email/Password Register ───
authRouter.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name || email.split('@')[0] },
  });

  if (error) return res.status(400).json({ error: error.message });

  // Sign in immediately
  const { data: session, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
  if (signInErr) return res.status(500).json({ error: signInErr.message });

  // Init settings
  await supabase.from('user_settings').upsert({ user_id: data.user.id });

  res.json({
    token: session.session.access_token,
    refresh_token: session.session.refresh_token,
    user: { id: data.user.id, email, name },
  });
});

// ─── Email/Password Login ───
authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: 'Invalid credentials' });

  res.json({
    token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user: { id: data.user.id, email: data.user.email },
  });
});

// ─── Apple Sign-In (receives Apple ID token from app) ───
authRouter.post('/apple', async (req, res) => {
  const { id_token, nonce } = req.body;
  if (!id_token) return res.status(400).json({ error: 'id_token required' });

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: id_token,
    nonce,
  });

  if (error) return res.status(401).json({ error: error.message });

  // Ensure settings exist
  await supabase.from('user_settings').upsert({ user_id: data.user.id });

  res.json({
    token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user: { id: data.user.id, email: data.user.email },
  });
});

// ─── Google Sign-In ───
authRouter.post('/google', async (req, res) => {
  const { id_token, nonce } = req.body;
  if (!id_token) return res.status(400).json({ error: 'id_token required' });

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: id_token,
    nonce,
  });

  if (error) return res.status(401).json({ error: error.message });

  await supabase.from('user_settings').upsert({ user_id: data.user.id });

  res.json({
    token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user: { id: data.user.id, email: data.user.email },
  });
});

// ─── Refresh Token ───
authRouter.post('/refresh', async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) return res.status(400).json({ error: 'refresh_token required' });

  const { data, error } = await supabase.auth.refreshSession({ refresh_token });
  if (error) return res.status(401).json({ error: error.message });

  res.json({
    token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
});

// ─── Complete Onboarding ───
authRouter.post('/onboarding-complete', authMiddleware, async (req, res) => {
  await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', req.userId);
  res.json({ ok: true });
});

// ─── Get Profile ───
authRouter.get('/me', authMiddleware, async (req, res) => {
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', req.userId).single();
  const { data: settings } = await supabase.from('user_settings').select('*').eq('user_id', req.userId).single();

  res.json({ profile, settings });
});
