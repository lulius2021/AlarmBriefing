import jwt from 'jsonwebtoken';
import { DB, hashKey } from './db';
import { NextRequest } from 'next/server';

function getJwtSecret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('FATAL: JWT_SECRET environment variable is required');
  return s;
}

export function signToken(userId: string): string {
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn: '30d' });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, getJwtSecret()) as { userId: string };
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
