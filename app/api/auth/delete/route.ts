import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { db } from '@/lib/db';

export async function DELETE(req: NextRequest) {
  const userId = getUserFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });

  // Delete all user data
  db.users.delete(userId);
  db.alarms.delete(userId);
  db.briefings.delete(userId);

  // Delete bot keys
  for (const [hash, bot] of db.botKeys) {
    if (bot.userId === userId) db.botKeys.delete(hash);
  }

  // Remove audit logs
  const idx = db.auditLog.length;
  for (let i = idx - 1; i >= 0; i--) {
    if (db.auditLog[i].userId === userId) db.auditLog.splice(i, 1);
  }

  return NextResponse.json({ ok: true, message: 'Account und alle Daten wurden geloescht.' });
}
