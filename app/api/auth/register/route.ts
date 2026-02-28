import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { DB, generateId } from '@/lib/db';
import { signToken } from '@/lib/auth';
import { validateEmail, validatePassword, sanitizeString } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    const emailErr = validateEmail(email);
    if (emailErr) return NextResponse.json({ error: emailErr }, { status: 400 });

    const pwErr = validatePassword(password);
    if (pwErr) return NextResponse.json({ error: pwErr }, { status: 400 });

    const cleanName = sanitizeString(name, 50);
    const cleanEmail = email.trim().toLowerCase();

    const existing = await DB.getUserByEmail(cleanEmail);
    if (existing) return NextResponse.json({ error: 'Email bereits registriert' }, { status: 409 });

    const id = generateId();
    const password_hash = await bcrypt.hash(password, 12);
    await DB.createUser({
      id, email: cleanEmail, name: cleanName, password_hash,
      settings: { briefingModules: ['weather', 'calendar', 'news'], voice: 'jarvis', speed: 1.0, location: 'Berlin, DE' },
      created_at: new Date().toISOString(),
    });

    const token = signToken(id);
    return NextResponse.json({ token, user: { id, email: cleanEmail, name: cleanName } });
  } catch (err: any) {
    return NextResponse.json({ error: 'Registrierung fehlgeschlagen' }, { status: 500 });
  }
}
