import { NextRequest, NextResponse } from 'next/server';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'edge-tts-node';

const VOICES: Record<string, string> = {
  jarvis: 'de-DE-ConradNeural',
  female: 'de-DE-KatjaNeural',
  'en-jarvis': 'en-US-GuyNeural',
  'en-female': 'en-US-JennyNeural',
};

export async function POST(req: NextRequest) {
  try {
    const { text, voice } = await req.json();
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text ist erforderlich' }, { status: 400 });
    }
    if (text.length > 5000) {
      return NextResponse.json({ error: 'Text zu lang (max 5000)' }, { status: 400 });
    }

    const voiceName = VOICES[voice || 'jarvis'] || VOICES.jarvis;

    const ttsEngine = new MsEdgeTTS({});
    await ttsEngine.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    const readable = ttsEngine.toStream(text);

    const chunks: Buffer[] = [];
    for await (const chunk of readable) {
      if (Buffer.isBuffer(chunk)) {
        chunks.push(chunk);
      }
    }

    const audioBuffer = Buffer.concat(chunks);

    return new NextResponse(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (err: any) {
    console.error('Edge TTS error:', err);
    return NextResponse.json({ error: 'TTS Fehler: ' + (err.message || 'unbekannt') }, { status: 500 });
  }
}
