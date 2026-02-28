import { NextRequest, NextResponse } from 'next/server';
import { getBotFromRequest } from '@/lib/auth';
import { DB, generateId } from '@/lib/db';
import { getSupabaseAdmin } from '@/lib/supabase';
import { validateBriefingContent, sanitizeString } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    const bot = await getBotFromRequest(req);
    if (!bot) return NextResponse.json({ error: 'Ungueltiger Bot-Key' }, { status: 401 });
    if (!bot.scopes.includes('briefings:write')) return NextResponse.json({ error: 'Scope briefings:write erforderlich' }, { status: 403 });

    const { alarmId, modules, content, audioUrl } = await req.json();

    if (!alarmId) return NextResponse.json({ error: 'alarmId ist erforderlich' }, { status: 400 });

    const contentErr = validateBriefingContent(content);
    if (contentErr) return NextResponse.json({ error: contentErr }, { status: 400 });

    const row: any = {
      id: generateId(), alarm_id: alarmId, user_id: bot.userId,
      modules: modules || ['weather', 'news'],
      content_text: sanitizeString(content || '', 5000),
      audio_url: audioUrl || null,
      generated_at: new Date().toISOString(),
    };

    const { data, error } = await getSupabaseAdmin()!.from('briefings').insert(row).select().single();
    if (error) throw new Error(error.message);

    await DB.addAudit({ id: generateId(), user_id: bot.userId, actor: 'bot', action: 'Briefing generiert', target: alarmId, details: `Module: ${(modules || []).join(', ')}`, created_at: new Date().toISOString() });

    return NextResponse.json({ briefing: data });
  } catch (err: any) {
    return NextResponse.json({ error: 'Briefing konnte nicht erstellt werden' }, { status: 500 });
  }
}
