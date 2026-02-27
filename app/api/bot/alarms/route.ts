import { NextRequest, NextResponse } from 'next/server';
import { getBotFromRequest } from '@/lib/auth';
import { db, generateId } from '@/lib/db';

export async function GET(req: NextRequest) {
  const bot = getBotFromRequest(req);
  if (!bot) return NextResponse.json({ error: 'Ungueltiger Bot-Key' }, { status: 401 });
  if (!bot.scopes.includes('alarms:read')) return NextResponse.json({ error: 'Scope alarms:read erforderlich' }, { status: 403 });
  return NextResponse.json({ alarms: db.alarms.get(bot.userId) || [] });
}

export async function POST(req: NextRequest) {
  const bot = getBotFromRequest(req);
  if (!bot) return NextResponse.json({ error: 'Ungueltiger Bot-Key' }, { status: 401 });
  if (!bot.scopes.includes('alarms:write')) return NextResponse.json({ error: 'Scope alarms:write erforderlich' }, { status: 403 });

  const alarms = db.alarms.get(bot.userId) || [];
  if (alarms.length >= 50) return NextResponse.json({ error: 'Alarm-Limit erreicht' }, { status: 429 });

  const body = await req.json();
  const alarm = {
    id: generateId(), userId: bot.userId,
    name: body.name || 'Bot-Alarm', active: body.active ?? true,
    time: body.time || '07:00', days: body.days || [],
    snoozeEnabled: body.snoozeEnabled ?? true, snoozeDuration: body.snoozeDuration || 5,
    sound: body.sound || 'default', vibration: body.vibration ?? true,
    briefingMode: body.briefingMode || 'standard', managedBy: 'bot' as const,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
  alarms.push(alarm);
  db.alarms.set(bot.userId, alarms);

  db.auditLog.push({
    id: generateId(), userId: bot.userId, actor: 'bot',
    action: `Alarm "${alarm.name}" erstellt`, target: alarm.id,
    details: `${alarm.time}, ${alarm.briefingMode}`, timestamp: new Date().toISOString(),
  });

  return NextResponse.json({ alarm }, { status: 201 });
}
