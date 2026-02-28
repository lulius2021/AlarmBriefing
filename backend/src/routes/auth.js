import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { v4 as uuid } from 'uuid';
import db from '../db.js';
import { signToken, signRefreshToken, verifyRefreshToken, authMiddleware } from '../middleware/auth.js';

export const authRouter = Router();

import { validateAuthBody, stripHtml } from '../middleware/validate.js';

// Register with email
authRouter.post('/register', validateAuthBody, async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const id = uuid();
  const hashed = await bcrypt.hash(password, 12);
  db.prepare('INSERT INTO users (id, email, name, password, auth_providers) VALUES (?, ?, ?, ?, ?)')
    .run(id, email.toLowerCase().trim(), name || null, hashed, JSON.stringify(['email']));

  db.prepare('INSERT INTO auth_identities (id, user_id, provider, provider_id, email) VALUES (?, ?, ?, ?, ?)')
    .run(uuid(), id, 'email', email.toLowerCase().trim(), email.toLowerCase().trim());

  const token = signToken(id);
  const refreshToken = signRefreshToken(id);
  res.status(201).json({ token, refreshToken, user: { id, email, name, authProviders: ['email'] } });
});

// Login with email
authRouter.post('/login', validateAuthBody, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (!user || !user.password) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = signToken(user.id);
  const refreshToken = signRefreshToken(user.id);
  res.json({ token, refreshToken, user: { id: user.id, email: user.email, name: user.name, authProviders: JSON.parse(user.auth_providers) } });
});

// Social login / link
authRouter.post('/social', async (req, res) => {
  const { provider, providerId, email, name } = req.body;
  if (!provider || !providerId) return res.status(400).json({ error: 'Provider and providerId required' });

  // Check if identity already exists
  const existing = db.prepare('SELECT * FROM auth_identities WHERE provider = ? AND provider_id = ?').get(provider, providerId);

  if (existing) {
    // Login
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(existing.user_id);
    const token = signToken(user.id);
    const refreshToken = signRefreshToken(user.id);
    return res.json({ token, refreshToken, user: { id: user.id, email: user.email, name: user.name, authProviders: JSON.parse(user.auth_providers) } });
  }

  // Check if email matches existing user → link account
  let userId;
  if (email) {
    const userByEmail = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (userByEmail) {
      userId = userByEmail.id;
      const providers = JSON.parse(userByEmail.auth_providers);
      if (!providers.includes(provider)) {
        providers.push(provider);
        db.prepare('UPDATE users SET auth_providers = ?, updated_at = datetime("now") WHERE id = ?')
          .run(JSON.stringify(providers), userId);
      }
    }
  }

  // New user
  if (!userId) {
    userId = uuid();
    db.prepare('INSERT INTO users (id, email, name, auth_providers) VALUES (?, ?, ?, ?)')
      .run(userId, email?.toLowerCase().trim() || null, name || null, JSON.stringify([provider]));
  }

  // Create identity link
  db.prepare('INSERT INTO auth_identities (id, user_id, provider, provider_id, email) VALUES (?, ?, ?, ?, ?)')
    .run(uuid(), userId, provider, providerId, email?.toLowerCase().trim() || null);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  const token = signToken(userId);
  const refreshToken = signRefreshToken(userId);
  res.status(201).json({ token, refreshToken, user: { id: user.id, email: user.email, name: user.name, authProviders: JSON.parse(user.auth_providers) } });
});

// Link additional provider to existing account
authRouter.post('/link', authMiddleware, async (req, res) => {
  const { provider, providerId, email } = req.body;
  if (!provider || !providerId) return res.status(400).json({ error: 'Provider and providerId required' });

  const existing = db.prepare('SELECT * FROM auth_identities WHERE provider = ? AND provider_id = ?').get(provider, providerId);
  if (existing) {
    if (existing.user_id === req.userId) return res.json({ ok: true, message: 'Already linked' });
    return res.status(409).json({ error: 'This identity is linked to another account' });
  }

  db.prepare('INSERT INTO auth_identities (id, user_id, provider, provider_id, email) VALUES (?, ?, ?, ?, ?)')
    .run(uuid(), req.userId, provider, providerId, email?.toLowerCase().trim() || null);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  const providers = JSON.parse(user.auth_providers);
  if (!providers.includes(provider)) {
    providers.push(provider);
    db.prepare('UPDATE users SET auth_providers = ?, updated_at = datetime("now") WHERE id = ?')
      .run(JSON.stringify(providers), req.userId);
  }

  res.json({ ok: true, authProviders: providers });
});

// Refresh token
authRouter.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });

    const newToken = signToken(user.id);
    const newRefreshToken = signRefreshToken(user.id);
    res.json({ token: newToken, refreshToken: newRefreshToken });
  } catch {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Generate Bot Key
authRouter.post('/bot-key', authMiddleware, (req, res) => {
  const { scopes = ['alarms:read', 'alarms:write', 'briefings:write', 'settings:read'], name = 'Bot Key' } = req.body;
  const rawKey = `ab_${crypto.randomBytes(32).toString('hex')}`;
  const hash = crypto.createHash('sha256').update(rawKey).digest('hex');

  // Max 5 keys per user
  const count = db.prepare('SELECT COUNT(*) as cnt FROM bot_keys WHERE user_id = ?').get(req.userId);
  if (count.cnt >= 5) return res.status(429).json({ error: 'Maximum 5 bot keys per account' });

  db.prepare('INSERT INTO bot_keys (key_hash, user_id, scopes, name) VALUES (?, ?, ?, ?)')
    .run(hash, req.userId, JSON.stringify(scopes), name);

  res.status(201).json({ key: rawKey, scopes, name, note: 'Store this key securely. It cannot be shown again.' });
});

// List Bot Keys
authRouter.get('/bot-keys', authMiddleware, (req, res) => {
  const keys = db.prepare('SELECT key_hash, name, scopes, last_used, created_at FROM bot_keys WHERE user_id = ?').all(req.userId);
  res.json({
    keys: keys.map(k => ({
      id: k.key_hash.slice(0, 8),
      name: k.name,
      scopes: JSON.parse(k.scopes),
      lastUsed: k.last_used,
      createdAt: k.created_at,
    }))
  });
});

// Revoke Bot Key
authRouter.delete('/bot-key/:id', authMiddleware, (req, res) => {
  const keys = db.prepare('SELECT key_hash FROM bot_keys WHERE user_id = ?').all(req.userId);
  const key = keys.find(k => k.key_hash.startsWith(req.params.id));
  if (!key) return res.status(404).json({ error: 'Key not found' });

  db.prepare('DELETE FROM bot_keys WHERE key_hash = ?').run(key.key_hash);
  res.json({ ok: true });
});

// Delete account
authRouter.delete('/account', authMiddleware, async (req, res) => {
  db.prepare('DELETE FROM users WHERE id = ?').run(req.userId);
  res.json({ ok: true, message: 'Account deleted' });
});

// Get current user
authRouter.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, email, name, auth_providers, created_at FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const identities = db.prepare('SELECT provider, email, created_at FROM auth_identities WHERE user_id = ?').all(req.userId);
  res.json({ user: { ...user, authProviders: JSON.parse(user.auth_providers), identities } });
});
