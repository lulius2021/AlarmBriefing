#!/usr/bin/env python3
"""Edge TTS wrapper - generates MP3 from text using Conrad voice."""
import asyncio
import sys
import edge_tts

async def main():
    text = sys.stdin.read()
    if not text.strip():
        sys.exit(1)
    voice = sys.argv[1] if len(sys.argv) > 1 else "de-DE-ConradNeural"
    output = sys.argv[2] if len(sys.argv) > 2 else "/dev/stdout"
    c = edge_tts.Communicate(text, voice, rate="-8%", pitch="-10Hz")
    await c.save(output)

asyncio.run(main())
