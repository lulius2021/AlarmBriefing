import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { authRouter } from './routes/auth.js';
import { alarmRouter } from './routes/alarms.js';
import { botRouter } from './routes/bot.js';
import { briefingRouter } from './routes/briefings.js';
import { auditRouter } from './routes/audit.js';
import { settingsRouter } from './routes/settings.js';
import { authMiddleware } from './middleware/auth.js';
import { botAuthMiddleware } from './middleware/botAuth.js';
import db from './db.js';

const app = express();
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Bot-Key'],
}));
app.use(express.json({ limit: '1mb' }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

const botLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 30,
  standardHeaders: true,
});
app.use('/api/bot/', botLimiter);

// Health
app.get('/health', (_, res) => res.json({
  status: 'ok',
  version: '1.0.0',
  timestamp: new Date().toISOString(),
}));

// Public routes
app.use('/api/auth', authRouter);

// Protected routes (user)
app.use('/api/alarms', authMiddleware, alarmRouter);
app.use('/api/briefings', authMiddleware, briefingRouter);
app.use('/api/settings', authMiddleware, settingsRouter);
app.use('/api/audit', authMiddleware, auditRouter);

// Bot API routes
app.use('/api/bot', botAuthMiddleware, botRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => console.log(`AlarmBriefing API on :${PORT}`));
