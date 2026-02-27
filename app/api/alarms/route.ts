import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { DB, generateId } from '@/lib/db';

export async function GET(req: NextRequest) {
  const userId = getUserFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  const alarms = await DB.getAlarms(userId);
  return NextResponse.json({ alarms });
}

export async function POST(req: NextRequest) {
  const userId = getUserFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });

  const count = await DB.countAlarms(userId);
  if (count >= 50) return NextResponse.json({ error: 'Alarm-Limit erreicht (50)' }, { status: 429 });

  const body = await req.json();
  const alarm = await DB.createAlarm({
    id: generateId(), user_id: userId,
    name: body.name || 'Alarm', active: body.active ?? true,
    time: body.time || '07:00', days: body.days || [],
    snooze_enabled: body.snoozeEnabled ?? true, snooze_duration: body.snoozeDuration || 5,
    sound: body.sound || 'default', vibration: body.vibration ?? true,
    briefing_mode: body.briefingMode || 'auto', managed_by: 'manual',
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  });

  return NextResponse.json({ alarm }, { status: 201 });
}
