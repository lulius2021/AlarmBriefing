// Shared input validation helpers

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TIME_RE = /^\d{2}:\d{2}(:\d{2})?$/;

export function validateEmail(email: unknown): string | null {
  if (typeof email !== 'string') return 'Email ist erforderlich';
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return 'Email ist erforderlich';
  if (trimmed.length > 254) return 'Email ist zu lang';
  if (!EMAIL_RE.test(trimmed)) return 'Ungueltiges Email-Format';
  return null;
}

export function validatePassword(password: unknown): string | null {
  if (typeof password !== 'string') return 'Passwort ist erforderlich';
  if (password.length < 8) return 'Passwort muss mindestens 8 Zeichen lang sein';
  if (password.length > 128) return 'Passwort darf maximal 128 Zeichen lang sein';
  return null;
}

export function validateAlarmTime(time: unknown): string | null {
  if (typeof time !== 'string') return 'Zeit ist erforderlich';
  if (!TIME_RE.test(time)) return 'Zeit muss im Format HH:MM oder HH:MM:SS sein';
  const [h, m] = time.split(':').map(Number);
  if (h < 0 || h > 23 || m < 0 || m > 59) return 'Ungueltige Uhrzeit';
  return null;
}

export function validateAlarmDays(days: unknown): string | null {
  if (!Array.isArray(days)) return 'Tage muessen ein Array sein';
  if (days.length > 7) return 'Maximal 7 Tage';
  for (const d of days) {
    if (typeof d !== 'number' || d < 0 || d > 7 || !Number.isInteger(d)) {
      return 'Tage muessen ganze Zahlen von 0-7 sein';
    }
  }
  return null;
}

export function sanitizeString(input: unknown, maxLen = 100): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLen).replace(/[<>]/g, '');
}

export function validateBriefingContent(content: unknown): string | null {
  if (typeof content !== 'string') return null; // optional
  if (content.length > 5000) return 'Briefing-Text darf maximal 5000 Zeichen lang sein';
  return null;
}

export function normalizeTime(time: string): string {
  // "07:30" -> "07:30:00"
  return time.split(':').length === 2 ? `${time}:00` : time;
}
