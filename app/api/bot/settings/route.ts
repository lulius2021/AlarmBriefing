import { NextRequest, NextResponse } from 'next/server';
import { getBotFromRequest } from '@/lib/auth';
import { DB } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const bot = await getBotFromRequest(req);
    if (!bot) return NextResponse.json({ error: 'Ungueltiger Bot-Key' }, { status: 401 });
    if (!bot.scopes.includes('settings:read')) return NextResponse.json({ error: 'Scope settings:read erforderlich' }, { status: 403 });
    const user = await DB.getUserById(bot.userId);
    return NextResponse.json({ settings: user?.settings || {} });
  } catch (err: any) {
    return NextResponse.json({ error: 'Settings konnten nicht geladen werden' }, { status: 500 });
  }
}
