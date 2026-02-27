import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.js';
import { alarmRouter } from './routes/alarms.js';
import { botRouter } from './routes/bot.js';
import { briefingRouter } from './routes/briefings.js';
import { pairingRouter } from './routes/pairing.js';
import { settingsRouter } from './routes/settings.js';
import { authMiddleware } from './middleware/auth.js';
import { botAuthMiddleware } from './middleware/botAuth.js';

const app = express();
app.use(cors());
app.use(express.json());

// ─── Health ───
app.get('/health', (_, res) => res.json({
  status: 'ok',
  version: '2.0.0',
  timestamp: new Date().toISOString(),
}));

// ─── Public routes ───
app.use('/api/auth', authRouter);
app.use('/api/pairing', pairingRouter);   // /claim is public, /code needs auth

// ─── User routes (JWT auth) ───
app.use('/api/alarms', authMiddleware, alarmRouter);
app.use('/api/briefings', authMiddleware, briefingRouter);
app.use('/api/settings', authMiddleware, settingsRouter);

// ─── Bot routes (bot token auth) ───
app.use('/api/bot', botAuthMiddleware, botRouter);

// ─── 404 ───
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

// ─── Error handler ───
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🔔 AlarmBriefing API v2.0.0 on :${PORT}`);
  console.log(`   Supabase: ${process.env.SUPABASE_URL ? '✅ configured' : '⚠️  not configured'}`);
});
