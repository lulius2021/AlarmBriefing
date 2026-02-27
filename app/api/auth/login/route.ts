import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Email und Passwort erforderlich' }, { status: 400 });
  }

  let found: any = null;
  for (const [, user] of db.users) {
    if (user.email === email.toLowerCase()) { found = user; break; }
  }
  if (!found) {
    return NextResponse.json({ error: 'Ungueltige Anmeldedaten' }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, found.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: 'Ungueltige Anmeldedaten' }, { status: 401 });
  }

  const token = signToken(found.id);
  return NextResponse.json({ token, user: { id: found.id, email: found.email, name: found.name } });
}
