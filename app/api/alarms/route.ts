import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { db, generateId } from '@/lib/db';

export async function GET(req: NextRequest) {
  const userId = getUserFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  return NextResponse.json({ alarms: db.alarms.get(userId) || [] });
}

export async function POST(req: NextRequest) {
  const userId = getUserFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });

  const body = await req.json();
  const alarm = {
    id: generateId(),
    userId,
    name: body.name || 'Alarm',
    active: body.active ?? true,
    time: body.time || '07:00',
    days: body.days || [],
    snoozeEnabled: body.snoozeEnabled ?? true,
    snoozeDuration: body.snoozeDuration || 5,
    sound: body.sound || 'default',
    vibration: body.vibration ?? true,
    briefingMode: body.briefingMode || 'standard',
    managedBy: 'manual' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const alarms = db.alarms.get(userId) || [];
  if (alarms.length >= 50) {
    return NextResponse.json({ error: 'Alarm-Limit erreicht (50)' }, { status: 429 });
  }
  alarms.push(alarm);
  db.alarms.set(userId, alarms);

  return NextResponse.json({ alarm }, { status: 201 });
}
