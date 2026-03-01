import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

// On-demand briefing generation — called by the app when alarm triggers
// Returns fresh weather + news text, no bot key needed (user auth)

async function fetchWeather(location = 'Berlin'): Promise<string> {
  const cities: Record<string, { lat: number; lon: number; name: string }> = {
    'berlin': { lat: 52.52, lon: 13.41, name: 'Berlin' },
    'munich': { lat: 48.14, lon: 11.58, name: 'Muenchen' },
    'muenchen': { lat: 48.14, lon: 11.58, name: 'Muenchen' },
    'münchen': { lat: 48.14, lon: 11.58, name: 'Muenchen' },
    'hamburg': { lat: 53.55, lon: 9.99, name: 'Hamburg' },
    'köln': { lat: 50.94, lon: 6.96, name: 'Koeln' },
    'frankfurt': { lat: 50.11, lon: 8.68, name: 'Frankfurt' },
  };
  const loc = cities[location.toLowerCase()] || cities['berlin'];

  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,weathercode,windspeed_10m,relativehumidity_2m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Europe/Berlin&forecast_days=1`
  );
  const d = await res.json();
  const c = d.current;
  const day = d.daily;

  const weatherCodes: Record<number, string> = {
    0: 'klarer Himmel', 1: 'ueberwiegend klar', 2: 'teilweise bewoelkt', 3: 'bewoelkt',
    45: 'neblig', 48: 'Reifnebel', 51: 'leichter Nieselregen', 53: 'Nieselregen',
    55: 'starker Nieselregen', 61: 'leichter Regen', 63: 'Regen', 65: 'starker Regen',
    71: 'leichter Schneefall', 73: 'Schneefall', 75: 'starker Schneefall',
    80: 'Regenschauer', 95: 'Gewitter',
  };
  const desc = weatherCodes[c.weathercode] || 'wechselhaft';
  const rain = day.precipitation_probability_max?.[0] || 0;

  let text = `Aktuell ${c.temperature_2m} Grad in ${loc.name}, ${desc}. `;
  text += `Wind ${c.windspeed_10m} Kilometer pro Stunde. `;
  text += `Heute maximal ${day.temperature_2m_max[0]} Grad, nachts ${day.temperature_2m_min[0]} Grad. `;
  if (rain > 40) text += `Regenwahrscheinlichkeit ${rain} Prozent, nimm einen Schirm mit! `;

  return text;
}

async function fetchNews(): Promise<string> {
  try {
    const res = await fetch('https://ok.surf/api/v1/cors/news-feed', { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return '';
    const data = await res.json();
    const items = (data?.['Business'] || data?.['Top'] || Object.values(data)?.[0] || []).slice(0, 3);
    if (items.length === 0) return '';
    let text = 'Die wichtigsten Nachrichten: ';
    items.forEach((item: any, i: number) => {
      text += `${i + 1}. ${item.title}. `;
    });
    return text;
  } catch {
    return '';
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = getUserFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });

    // Import DB lazily to avoid build issues
    const { DB } = await import('@/lib/db');
    const user = await DB.getUserById(userId);
    const location = user?.settings?.location?.split(',')[0] || 'Berlin';

    const h = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin' })).getHours();
    const greeting = h < 10 ? 'Guten Morgen!' : h < 14 ? 'Guten Tag!' : h < 18 ? 'Guten Nachmittag!' : 'Guten Abend!';
    const today = new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Berlin' });

    const [weather, news] = await Promise.all([fetchWeather(location), fetchNews()]);

    const content = `${greeting} Heute ist ${today}. ${weather}${news}Hab einen grossartigen Tag!`;

    return NextResponse.json({ content, generatedAt: new Date().toISOString() });
  } catch (err: any) {
    return NextResponse.json({ error: 'Briefing-Generierung fehlgeschlagen' }, { status: 500 });
  }
}
