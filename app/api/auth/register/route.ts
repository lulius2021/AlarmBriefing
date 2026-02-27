import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db, generateId } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Email und Passwort erforderlich' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Passwort muss mindestens 8 Zeichen lang sein' }, { status: 400 });
  }

  // Check duplicate
  for (const [, user] of db.users) {
    if (user.email === email.toLowerCase()) {
      return NextResponse.json({ error: 'Email bereits registriert' }, { status: 409 });
    }
  }

  const id = generateId();
  const passwordHash = await bcrypt.hash(password, 12);
  db.users.set(id, {
    id, email: email.toLowerCase(), name: name || '', passwordHash,
    settings: { briefingModules: ['weather', 'calendar', 'news'], voice: 'jarvis', speed: 1.0, location: 'Berlin, DE' },
    createdAt: new Date().toISOString(),
  });
  db.alarms.set(id, []);

  const token = signToken(id);
  return NextResponse.json({ token, user: { id, email, name } });
}
