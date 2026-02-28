import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { DB, generateId } from '@/lib/db';
import { validateAlarmTime, validateAlarmDays, sanitizeString, normalizeTime } from '@/lib/validation';

export async function GET(req: NextRequest) {
  try {
    const userId = getUserFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
    const alarms = await DB.getAlarms(userId);
    return NextResponse.json({ alarms });
  } catch (err: any) {
    return NextResponse.json({ error: 'Alarms konnten nicht geladen werden' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });

    const count = await DB.countAlarms(userId);
    if (count >= 50) return NextResponse.json({ error: 'Alarm-Limit erreicht (50)' }, { status: 429 });

    const body = await req.json();

    const timeErr = validateAlarmTime(body.time || '07:00');
    if (timeErr) return NextResponse.json({ error: timeErr }, { status: 400 });

    if (body.days) {
      const daysErr = validateAlarmDays(body.days);
      if (daysErr) return NextResponse.json({ error: daysErr }, { status: 400 });
    }

    const name = sanitizeString(body.name || 'Alarm', 100);
    const briefingMode = ['none', 'short', 'standard', 'long'].includes(body.briefingMode) ? body.briefingMode : 'standard';

    const alarm = await DB.createAlarm({
      id: generateId(), user_id: userId,
      name, active: body.active ?? true,
      time: normalizeTime(body.time || '07:00'), days: body.days || [],
      snooze_enabled: body.snoozeEnabled ?? true, snooze_duration: body.snoozeDuration || 5,
      sound: sanitizeString(body.sound || 'default', 50), vibration: body.vibration ?? true,
      briefing_mode: briefingMode, managed_by: 'manual',
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    });

    return NextResponse.json({ alarm }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Alarm konnte nicht erstellt werden' }, { status: 500 });
  }
}
