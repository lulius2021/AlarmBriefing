import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { DB } from '@/lib/db';
import { signToken } from '@/lib/auth';
import { validateEmail, validatePassword } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const emailErr = validateEmail(email);
    if (emailErr) return NextResponse.json({ error: emailErr }, { status: 400 });

    const pwErr = validatePassword(password);
    if (pwErr) return NextResponse.json({ error: 'Ungueltige Anmeldedaten' }, { status: 401 });

    const user = await DB.getUserByEmail(email.trim().toLowerCase());
    if (!user) return NextResponse.json({ error: 'Ungueltige Anmeldedaten' }, { status: 401 });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return NextResponse.json({ error: 'Ungueltige Anmeldedaten' }, { status: 401 });

    const token = signToken(user.id);
    return NextResponse.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err: any) {
    return NextResponse.json({ error: 'Login fehlgeschlagen' }, { status: 500 });
  }
}
