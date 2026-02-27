import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { DB } from '@/lib/db';

export async function DELETE(req: NextRequest) {
  const userId = getUserFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  await DB.deleteUser(userId);
  return NextResponse.json({ ok: true, message: 'Account und alle Daten wurden geloescht.' });
}
