import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { DB } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const userId = getUserFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });

    const alarms = await DB.getAlarms(userId);
    const activeAlarms = alarms.filter(a => a.active);

    let latestBriefing = null;
    for (const alarm of activeAlarms) {
      const briefing = await DB.getLatestBriefing(userId, alarm.id);
      if (briefing && (!latestBriefing || briefing.created_at > latestBriefing.created_at)) {
        latestBriefing = briefing;
      }
    }

    return NextResponse.json({ briefing: latestBriefing });
  } catch (err: any) {
    return NextResponse.json({ error: 'Briefing konnte nicht geladen werden' }, { status: 500 });
  }
}
