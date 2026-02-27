import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { db, generateBotKey, hashKey, generateId } from '@/lib/db';

// Generate new bot key
export async function POST(req: NextRequest) {
  const userId = getUserFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });

  const scopes = ['alarms:read', 'alarms:write', 'briefings:write', 'settings:read'];
  const rawKey = generateBotKey();
  const hash = hashKey(rawKey);

  // Remove old keys for this user
  for (const [h, bot] of db.botKeys) {
    if (bot.userId === userId) db.botKeys.delete(h);
  }

  db.botKeys.set(hash, { hash, userId, scopes, createdAt: new Date().toISOString() });

  db.auditLog.push({
    id: generateId(), userId, actor: 'user', action: 'Bot-Key generiert',
    target: '-', details: `Scopes: ${scopes.join(', ')}`, timestamp: new Date().toISOString(),
  });

  return NextResponse.json({
    key: rawKey, scopes,
    note: 'Speichere diesen Key sicher. Er kann nicht erneut angezeigt werden. Gib ihn deinem Clawdbot als ALARMBRIEFING_API_KEY.',
  });
}

// Revoke all bot keys
export async function DELETE(req: NextRequest) {
  const userId = getUserFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });

  for (const [h, bot] of db.botKeys) {
    if (bot.userId === userId) db.botKeys.delete(h);
  }

  return NextResponse.json({ ok: true });
}
