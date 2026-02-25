import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.js';
import { alarmRouter } from './routes/alarms.js';
import { botRouter } from './routes/bot.js';
import { briefingRouter } from './routes/briefings.js';
import { authMiddleware } from './middleware/auth.js';
import { botAuthMiddleware } from './middleware/botAuth.js';

const app = express();
app.use(cors());
app.use(express.json());

// Health
app.get('/health', (_, res) => res.json({ status: 'ok', version: '1.0.0' }));

// Public routes
app.use('/api/auth', authRouter);

// Protected routes (user)
app.use('/api/alarms', authMiddleware, alarmRouter);
app.use('/api/briefings', authMiddleware, briefingRouter);

// Bot API routes
app.use('/api/bot', botAuthMiddleware, botRouter);

// Audit log
app.get('/api/audit', authMiddleware, (req, res) => {
  const logs = global.auditLog?.filter(l => l.userId === req.userId) || [];
  res.json({ logs: logs.slice(-100) });
});

// In-memory store (replace with DB in prod)
global.users = new Map();
global.alarms = new Map(); // userId -> Alarm[]
global.botKeys = new Map(); // keyHash -> { userId, scopes }
global.auditLog = [];
global.briefings = new Map();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`AlarmBriefing API on :${PORT}`));
