// TTS Engine — generates audio briefings
// Free: Web Speech API (client-side, no server needed)
// Premium: OpenAI TTS API (server-side, returns audio URL)

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_TTS_URL = 'https://api.openai.com/v1/audio/speech';

export type TTSVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

export function isPremiumTTSConfigured(): boolean {
  return !!OPENAI_API_KEY;
}

export async function generateTTSAudio(
  text: string,
  voice: TTSVoice = 'onyx',
  speed = 1.0
): Promise<Buffer> {
  if (!OPENAI_API_KEY) throw new Error('OpenAI API key not configured');

  const res = await fetch(OPENAI_TTS_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: text.slice(0, 4096), // OpenAI limit
      voice,
      speed: Math.max(0.25, Math.min(4.0, speed)),
      response_format: 'mp3',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI TTS failed: ${res.status} ${err}`);
  }

  return Buffer.from(await res.arrayBuffer());
}

// Voice recommendations for briefing style
export const VOICE_PROFILES: Record<string, { voice: TTSVoice; speed: number; description: string }> = {
  jarvis: { voice: 'onyx', speed: 1.05, description: 'Deep, confident — like Jarvis' },
  calm: { voice: 'nova', speed: 0.95, description: 'Warm, calm morning voice' },
  energetic: { voice: 'echo', speed: 1.1, description: 'Upbeat, energetic start' },
  neutral: { voice: 'alloy', speed: 1.0, description: 'Clean, neutral' },
};
