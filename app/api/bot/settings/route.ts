import { NextRequest, NextResponse } from 'next/server';
import { getBotFromRequest } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const bot = getBotFromRequest(req);
  if (!bot) return NextResponse.json({ error: 'Ungueltiger Bot-Key' }, { status: 401 });
  if (!bot.scopes.includes('settings:read')) return NextResponse.json({ error: 'Scope settings:read erforderlich' }, { status: 403 });
  const user = db.users.get(bot.userId);
  return NextResponse.json({ settings: user?.settings || {} });
}
