import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');
    if (!token || token.length !== 64) {
      return new NextResponse(errorPage('Ungueltiger Link', 'Der Bestaetigungslink ist ungueltig.'), { status: 400, headers: { 'Content-Type': 'text/html' } });
    }

    const user = await DB.getUserByVerifyToken(token);
    if (!user) {
      return new NextResponse(errorPage('Link abgelaufen', 'Dieser Bestaetigungslink wurde bereits verwendet oder ist abgelaufen.'), { status: 404, headers: { 'Content-Type': 'text/html' } });
    }

    if (user.verify_expires && new Date(user.verify_expires) < new Date()) {
      return new NextResponse(errorPage('Link abgelaufen', 'Der Bestaetigungslink ist abgelaufen. Bitte registriere dich erneut.'), { status: 410, headers: { 'Content-Type': 'text/html' } });
    }

    await DB.verifyUser(user.id);

    return new NextResponse(successPage(), { status: 200, headers: { 'Content-Type': 'text/html' } });
  } catch (err: any) {
    return new NextResponse(errorPage('Fehler', 'Etwas ist schiefgelaufen.'), { status: 500, headers: { 'Content-Type': 'text/html' } });
  }
}

function successPage() {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Email bestätigt</title>
  <style>body{font-family:sans-serif;background:#0a0e1a;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
  .card{background:#111827;border:1px solid #1e2a42;border-radius:16px;padding:40px;text-align:center;max-width:400px}
  h1{color:#22c55e;font-size:24px}p{color:#94a3b8;font-size:14px;line-height:1.6}
  a{color:#3b82f6;text-decoration:none;font-weight:600}</style></head>
  <body><div class="card"><h1>✅ Email bestätigt!</h1><p>Deine Email-Adresse wurde erfolgreich verifiziert. Du kannst die App jetzt vollständig nutzen.</p>
  <p><a href="/app.html">Zur App →</a></p></div></body></html>`;
}

function errorPage(title: string, message: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
  <style>body{font-family:sans-serif;background:#0a0e1a;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
  .card{background:#111827;border:1px solid #1e2a42;border-radius:16px;padding:40px;text-align:center;max-width:400px}
  h1{color:#ef4444;font-size:24px}p{color:#94a3b8;font-size:14px;line-height:1.6}</style></head>
  <body><div class="card"><h1>❌ ${title}</h1><p>${message}</p></div></body></html>`;
}
