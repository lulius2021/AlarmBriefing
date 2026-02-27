import { NextRequest, NextResponse } from 'next/server';
import { getBotFromRequest } from '@/lib/auth';
import { DB, generateId } from '@/lib/db';

export async function POST(req: NextRequest) {
  const bot = await getBotFromRequest(req);
  if (!bot) return NextResponse.json({ error: 'Ungueltiger Bot-Key' }, { status: 401 });
  if (!bot.scopes.includes('briefings:write')) return NextResponse.json({ error: 'Scope briefings:write erforderlich' }, { status: 403 });

  const { alarmId, modules, content, audioUrl } = await req.json();
  const briefing = await DB.createBriefing({
    id: generateId(), alarm_id: alarmId, user_id: bot.userId,
    modules: modules || ['weather', 'news'], content: content || '', audio_url: audioUrl,
    created_at: new Date().toISOString(),
  });

  await DB.addAudit({ id: generateId(), user_id: bot.userId, actor: 'bot', action: 'Briefing generiert', target: alarmId || '-', details: `Module: ${briefing.modules.join(', ')}`, created_at: new Date().toISOString() });

  return NextResponse.json({ briefing });
}
