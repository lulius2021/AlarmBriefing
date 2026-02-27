import { NextRequest, NextResponse } from 'next/server';
import { getBotFromRequest } from '@/lib/auth';
import { db, generateId } from '@/lib/db';

export async function POST(req: NextRequest) {
  const bot = getBotFromRequest(req);
  if (!bot) return NextResponse.json({ error: 'Ungueltiger Bot-Key' }, { status: 401 });
  if (!bot.scopes.includes('briefings:write')) return NextResponse.json({ error: 'Scope briefings:write erforderlich' }, { status: 403 });

  const { alarmId, modules, content, audioUrl } = await req.json();

  const briefing = {
    id: generateId(), alarmId, userId: bot.userId,
    modules: modules || ['weather', 'news'],
    content: content || '', audioUrl,
    generatedAt: new Date().toISOString(),
  };

  const list = db.briefings.get(bot.userId) || [];
  list.push(briefing);
  if (list.length > 100) list.shift();
  db.briefings.set(bot.userId, list);

  db.auditLog.push({
    id: generateId(), userId: bot.userId, actor: 'bot',
    action: 'Briefing generiert', target: alarmId || '-',
    details: `Module: ${briefing.modules.join(', ')}`, timestamp: new Date().toISOString(),
  });

  return NextResponse.json({ briefing });
}
