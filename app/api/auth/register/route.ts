import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { DB, generateId } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json();
  if (!email || !password) return NextResponse.json({ error: 'Email und Passwort erforderlich' }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: 'Passwort muss mindestens 8 Zeichen lang sein' }, { status: 400 });

  const existing = await DB.getUserByEmail(email.toLowerCase());
  if (existing) return NextResponse.json({ error: 'Email bereits registriert' }, { status: 409 });

  const id = generateId();
  const password_hash = await bcrypt.hash(password, 12);
  await DB.createUser({
    id, email: email.toLowerCase(), name: name || '', password_hash,
    settings: { briefingModules: ['weather', 'calendar', 'news'], voice: 'jarvis', speed: 1.0, location: 'Berlin, DE' },
    created_at: new Date().toISOString(),
  });

  const token = signToken(id);
  return NextResponse.json({ token, user: { id, email: email.toLowerCase(), name } });
}
