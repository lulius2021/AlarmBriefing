import { NextRequest, NextResponse } from 'next/server';
import { getBotFromRequest } from '@/lib/auth';
import { DB, generateId } from '@/lib/db';
import { validateAlarmTime, validateAlarmDays, sanitizeString, normalizeTime } from '@/lib/validation';

export async function GET(req: NextRequest) {
  try {
    const bot = await getBotFromRequest(req);
    if (!bot) return NextResponse.json({ error: 'Ungueltiger Bot-Key' }, { status: 401 });
    if (!bot.scopes.includes('alarms:read')) return NextResponse.json({ error: 'Scope alarms:read erforderlich' }, { status: 403 });
    const alarms = await DB.getAlarms(bot.userId);
    return NextResponse.json({ alarms });
  } catch (err: any) {
    return NextResponse.json({ error: 'Alarms konnten nicht geladen werden' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const bot = await getBotFromRequest(req);
    if (!bot) return NextResponse.json({ error: 'Ungueltiger Bot-Key' }, { status: 401 });
    if (!bot.scopes.includes('alarms:write')) return NextResponse.json({ error: 'Scope alarms:write erforderlich' }, { status: 403 });

    const count = await DB.countAlarms(bot.userId);
    if (count >= 50) return NextResponse.json({ error: 'Alarm-Limit erreicht' }, { status: 429 });

    const body = await req.json();

    const timeErr = validateAlarmTime(body.time || '07:00');
    if (timeErr) return NextResponse.json({ error: timeErr }, { status: 400 });

    if (body.days) {
      const daysErr = validateAlarmDays(body.days);
      if (daysErr) return NextResponse.json({ error: daysErr }, { status: 400 });
    }

    const name = sanitizeString(body.name || 'Bot-Alarm', 100);
    const briefingMode = ['none', 'short', 'standard', 'long'].includes(body.briefingMode) ? body.briefingMode : 'standard';

    const alarm = await DB.createAlarm({
      id: generateId(), user_id: bot.userId,
      name, active: body.active ?? true,
      time: normalizeTime(body.time || '07:00'), days: body.days || [],
      snooze_enabled: body.snoozeEnabled ?? true, snooze_duration: body.snoozeDuration || 5,
      sound: sanitizeString(body.sound || 'default', 50), vibration: body.vibration ?? true,
      briefing_mode: briefingMode, managed_by: 'bot',
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    });

    await DB.addAudit({ id: generateId(), user_id: bot.userId, actor: 'bot', action: `Alarm "${alarm.name}" erstellt`, target: alarm.id, details: `${alarm.time}`, created_at: new Date().toISOString() });

    return NextResponse.json({ alarm }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Alarm konnte nicht erstellt werden' }, { status: 500 });
  }
}
