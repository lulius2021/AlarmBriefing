import { NextRequest, NextResponse } from 'next/server';
import { getBotFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const bot = await getBotFromRequest(req);
  if (!bot) return NextResponse.json({ error: 'Ungueltiger Bot-Key' }, { status: 401 });
  return NextResponse.json({ ok: true, userId: bot.userId, scopes: bot.scopes, timestamp: new Date().toISOString() });
}
