import { NextRequest, NextResponse } from 'next/server';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { readFile, unlink, mkdir } from 'fs/promises';
import { randomUUID } from 'crypto';
import path from 'path';
import os from 'os';

const VOICES: Record<string, string> = {
  jarvis: 'de-DE-ConradNeural',
  conrad: 'de-DE-ConradNeural',
  killian: 'de-DE-KillianNeural',
  florian: 'de-DE-FlorianMultilingualNeural',
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
    const tmpDir = path.join(os.tmpdir(), `tts-${randomUUID()}`);
    await mkdir(tmpDir, { recursive: true });

    const tts = new MsEdgeTTS();
    await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
    const result = await tts.toFile(tmpDir, text);
    const audioBuffer = await readFile(result.audioFilePath);

    // Cleanup
    await unlink(result.audioFilePath).catch(() => {});
    if (result.metadataFilePath) await unlink(result.metadataFilePath).catch(() => {});

    return new NextResponse(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (err: any) {
    console.error('TTS error:', err);
    return NextResponse.json({ error: 'TTS Fehler: ' + (err.message || 'unbekannt') }, { status: 500 });
  }
}
