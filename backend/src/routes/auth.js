import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { v4 as uuid } from 'uuid';
import { signToken, authMiddleware } from '../middleware/auth.js';

export const authRouter = Router();

// Register
authRouter.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  // Check duplicate
  for (const [, user] of global.users) {
    if (user.email === email) return res.status(409).json({ error: 'Email already registered' });
  }

  const id = uuid();
  const hashed = await bcrypt.hash(password, 10);
  global.users.set(id, { id, email, name, password: hashed, authProviders: ['email'] });
  global.alarms.set(id, []);

  const token = signToken(id);
  res.json({ token, user: { id, email, name, authProviders: ['email'] } });
});

// Login
authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;
  let found = null;
  for (const [, user] of global.users) {
    if (user.email === email) { found = user; break; }
  }
  if (!found) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, found.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = signToken(found.id);
  res.json({ token, user: { id: found.id, email: found.email, name: found.name, authProviders: found.authProviders } });
});

// Generate Bot Key
authRouter.post('/bot-key', authMiddleware, (req, res) => {
  const { scopes = ['alarms:read', 'alarms:write', 'briefings:write', 'settings:read'] } = req.body;
  const rawKey = `ab_${crypto.randomBytes(32).toString('hex')}`;
  const hash = crypto.createHash('sha256').update(rawKey).digest('hex');

  global.botKeys.set(hash, { userId: req.userId, scopes, createdAt: new Date().toISOString() });

  res.json({ key: rawKey, scopes, note: 'Store this key securely. It cannot be shown again.' });
});

// Revoke Bot Key
authRouter.delete('/bot-key', authMiddleware, (req, res) => {
  const { keyPrefix } = req.body; // first 8 chars
  for (const [hash, bot] of global.botKeys) {
    if (bot.userId === req.userId) {
      global.botKeys.delete(hash);
    }
  }
  res.json({ ok: true });
});
