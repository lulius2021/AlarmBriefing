import { NextRequest, NextResponse } from 'next/server';
import { getBotFromRequest } from '@/lib/auth';
import { generateTTSAudio, isPremiumTTSConfigured, VOICE_PROFILES, TTSVoice } from '@/lib/tts';

export async function POST(req: NextRequest) {
  try {
    const bot = await getBotFromRequest(req);
    if (!bot) return NextResponse.json({ error: 'Ungueltiger Bot-Key' }, { status: 401 });
    if (!bot.scopes.includes('briefings:write')) return NextResponse.json({ error: 'Scope briefings:write erforderlich' }, { status: 403 });

    if (!isPremiumTTSConfigured()) {
      return NextResponse.json({ error: 'Premium TTS nicht konfiguriert (OPENAI_API_KEY fehlt)' }, { status: 503 });
    }

    const { text, voice, speed } = await req.json();
    if (!text) return NextResponse.json({ error: 'text ist erforderlich' }, { status: 400 });
    if (text.length > 4096) return NextResponse.json({ error: 'Text darf maximal 4096 Zeichen lang sein' }, { status: 400 });

    // Resolve voice profile or use direct voice name
    const profile = VOICE_PROFILES[voice || 'jarvis'];
    const ttsVoice: TTSVoice = profile?.voice || (voice as TTSVoice) || 'onyx';
    const ttsSpeed = speed || profile?.speed || 1.0;

    const audioBuffer = await generateTTSAudio(text, ttsVoice, ttsSpeed);

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'TTS Fehler' }, { status: 500 });
  }
}
