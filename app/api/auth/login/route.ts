import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { DB } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ error: 'Email und Passwort erforderlich' }, { status: 400 });

  const user = await DB.getUserByEmail(email.toLowerCase());
  if (!user) return NextResponse.json({ error: 'Ungueltige Anmeldedaten' }, { status: 401 });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return NextResponse.json({ error: 'Ungueltige Anmeldedaten' }, { status: 401 });

  const token = signToken(user.id);
  return NextResponse.json({ token, user: { id: user.id, email: user.email, name: user.name } });
}
