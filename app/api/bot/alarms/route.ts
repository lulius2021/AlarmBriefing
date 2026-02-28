import { NextRequest, NextResponse } from 'next/server';
import { getBotFromRequest } from '@/lib/auth';
import { DB, generateId } from '@/lib/db';

export async function GET(req: NextRequest) {
  const bot = await getBotFromRequest(req);
  if (!bot) return NextResponse.json({ error: 'Ungueltiger Bot-Key' }, { status: 401 });
  if (!bot.scopes.includes('alarms:read')) return NextResponse.json({ error: 'Scope alarms:read erforderlich' }, { status: 403 });
  const alarms = await DB.getAlarms(bot.userId);
  return NextResponse.json({ alarms });
}

export async function POST(req: NextRequest) {
  const bot = await getBotFromRequest(req);
  if (!bot) return NextResponse.json({ error: 'Ungueltiger Bot-Key' }, { status: 401 });
  if (!bot.scopes.includes('alarms:write')) return NextResponse.json({ error: 'Scope alarms:write erforderlich' }, { status: 403 });

  const count = await DB.countAlarms(bot.userId);
  if (count >= 50) return NextResponse.json({ error: 'Alarm-Limit erreicht' }, { status: 429 });

  try {
    const body = await req.json();
    const t = body.time || '07:00';
    const timeStr = t.split(':').length === 2 ? `${t}:00` : t;
    const alarm = await DB.createAlarm({
      id: generateId(), user_id: bot.userId,
      name: body.name || 'Bot-Alarm', active: body.active ?? true,
      time: timeStr, days: body.days || [],
      snooze_enabled: body.snoozeEnabled ?? true, snooze_duration: body.snoozeDuration || 5,
      sound: body.sound || 'default', vibration: body.vibration ?? true,
      briefing_mode: body.briefingMode || 'standard', managed_by: 'bot',
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    });

    await DB.addAudit({ id: generateId(), user_id: bot.userId, actor: 'bot', action: `Alarm "${alarm.name}" erstellt`, target: alarm.id, details: `${alarm.time}`, created_at: new Date().toISOString() });

    return NextResponse.json({ alarm }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Fehler beim Erstellen' }, { status: 500 });
  }
}
