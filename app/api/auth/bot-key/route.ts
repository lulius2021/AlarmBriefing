import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { DB, generateBotKey, hashKey, generateId } from '@/lib/db';

export async function POST(req: NextRequest) {
  const userId = getUserFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });

  const scopes = ['alarms:read', 'alarms:write', 'briefings:write', 'settings:read'];
  const rawKey = generateBotKey();
  const hash = hashKey(rawKey);

  await DB.createBotKey({ hash, user_id: userId, scopes, created_at: new Date().toISOString() });
  await DB.addAudit({ id: generateId(), user_id: userId, actor: 'user', action: 'Bot-Key generiert', target: '-', details: `Scopes: ${scopes.join(', ')}`, created_at: new Date().toISOString() });

  return NextResponse.json({ key: rawKey, scopes, note: 'Speichere diesen Key sicher. Gib ihn deinem Clawdbot als ALARMBRIEFING_API_KEY.' });
}

export async function DELETE(req: NextRequest) {
  const userId = getUserFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  await DB.deleteBotKeys(userId);
  return NextResponse.json({ ok: true });
}
