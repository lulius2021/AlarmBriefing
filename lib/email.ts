import nodemailer from 'nodemailer';
import crypto from 'crypto';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://alarm-briefing.vercel.app';
const FROM = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@alarmbriefing.app';

export function generateVerifyToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function sendVerificationEmail(email: string, token: string, lang = 'de') {
  const url = `${APP_URL}/api/auth/verify?token=${token}`;

  const subjects: Record<string, string> = {
    de: 'AlarmBriefing — Email bestätigen',
    en: 'AlarmBriefing — Verify your email',
  };

  const html = lang === 'de' ? `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#3b82f6">🔔 AlarmBriefing</h2>
      <p>Willkommen! Bitte bestätige deine Email-Adresse:</p>
      <a href="${url}" style="display:inline-block;background:#3b82f6;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">Email bestätigen</a>
      <p style="font-size:12px;color:#666">Oder kopiere diesen Link: ${url}</p>
      <p style="font-size:12px;color:#666">Der Link ist 24 Stunden gültig.</p>
    </div>
  ` : `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#3b82f6">🔔 AlarmBriefing</h2>
      <p>Welcome! Please verify your email address:</p>
      <a href="${url}" style="display:inline-block;background:#3b82f6;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">Verify Email</a>
      <p style="font-size:12px;color:#666">Or copy this link: ${url}</p>
      <p style="font-size:12px;color:#666">This link expires in 24 hours.</p>
    </div>
  `;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: subjects[lang] || subjects.en,
    html,
  });
}

export function isEmailConfigured(): boolean {
  return !!(process.env.SMTP_USER && process.env.SMTP_PASS);
}
