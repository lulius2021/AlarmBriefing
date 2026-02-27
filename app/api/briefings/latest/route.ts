import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { DB } from '@/lib/db';

export async function GET(req: NextRequest) {
  const userId = getUserFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });

  // Get the user's alarms to find the next one
  const alarms = await DB.getAlarms(userId);
  const activeAlarms = alarms.filter(a => a.active);
  
  // Try to get latest briefing for any alarm
  let latestBriefing = null;
  for (const alarm of activeAlarms) {
    const briefing = await DB.getLatestBriefing(userId, alarm.id);
    if (briefing && (!latestBriefing || briefing.created_at > latestBriefing.created_at)) {
      latestBriefing = briefing;
    }
  }

  // Also check for briefings without specific alarm (general briefings)
  const generalBriefing = await DB.getLatestBriefing(userId, '');
  if (generalBriefing && (!latestBriefing || generalBriefing.created_at > latestBriefing.created_at)) {
    latestBriefing = generalBriefing;
  }

  return NextResponse.json({ briefing: latestBriefing });
}
