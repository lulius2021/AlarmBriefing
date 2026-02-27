import jwt from 'jsonwebtoken';
import { DB, hashKey } from './db';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'ab-dev-secret-change-in-prod';

export function signToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

export function getUserFromRequest(req: NextRequest): string | null {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const decoded = verifyToken(auth.slice(7));
  return decoded?.userId || null;
}

export async function getBotFromRequest(req: NextRequest): Promise<{ userId: string; scopes: string[] } | null> {
  const key = req.headers.get('x-bot-key');
  if (!key) return null;
  const hash = hashKey(key);
  const bot = await DB.getBotByHash(hash);
  if (!bot) return null;
  return { userId: bot.user_id, scopes: bot.scopes };
}
