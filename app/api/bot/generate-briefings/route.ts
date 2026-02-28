import { NextRequest, NextResponse } from 'next/server';
import { getBotFromRequest } from '@/lib/auth';
import { DB, generateId } from '@/lib/db';
import { getSupabaseAdmin } from '@/lib/supabase';

// Auto-generate fresh briefings for all active alarms of a user
// Called daily by cron/bot before alarms ring

async function fetchWeather(location = 'Berlin'): Promise<string> {
  const cities: Record<string, { lat: number; lon: number }> = {
    'berlin': { lat: 52.52, lon: 13.41 },
    'munich': { lat: 48.14, lon: 11.58 },
    'muenchen': { lat: 48.14, lon: 11.58 },
    'münchen': { lat: 48.14, lon: 11.58 },
    'hamburg': { lat: 53.55, lon: 9.99 },
    'köln': { lat: 50.94, lon: 6.96 },
    'frankfurt': { lat: 50.11, lon: 8.68 },
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
    80: 'Regenschauer', 81: 'starke Regenschauer', 95: 'Gewitter',
  };
  const desc = weatherCodes[c.weathercode] || 'wechselhaft';
  const rain = day.precipitation_probability_max?.[0] || 0;

  let text = `Aktuell ${c.temperature_2m} Grad in ${location}, ${desc}. `;
  text += `Wind ${c.windspeed_10m} Kilometer pro Stunde, Luftfeuchtigkeit ${c.relativehumidity_2m} Prozent. `;
  text += `Heute maximal ${day.temperature_2m_max[0]} Grad, nachts ${day.temperature_2m_min[0]} Grad. `;
  if (rain > 40) text += `Regenwahrscheinlichkeit ${rain} Prozent — nimm einen Schirm mit! `;
  else if (rain > 0) text += `Regenwahrscheinlichkeit nur ${rain} Prozent. `;

  return text;
}

async function fetchNews(): Promise<string> {
  // Simple news from a free API
  try {
    const res = await fetch('https://ok.surf/api/v1/cors/news-feed', { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return '';
    const data = await res.json();
    const items = (data?.['Business'] || data?.['Top'] || []).slice(0, 3);
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

function getGreeting(): string {
  const h = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin' })).getHours();
  if (h < 10) return 'Guten Morgen!';
  if (h < 14) return 'Guten Tag!';
  if (h < 18) return 'Guten Nachmittag!';
  return 'Guten Abend!';
}

export async function POST(req: NextRequest) {
  try {
    const bot = await getBotFromRequest(req);
    if (!bot) return NextResponse.json({ error: 'Ungueltiger Bot-Key' }, { status: 401 });
    if (!bot.scopes.includes('briefings:write')) return NextResponse.json({ error: 'Scope briefings:write erforderlich' }, { status: 403 });

    // Get user settings for location
    const user = await DB.getUserById(bot.userId);
    const location = user?.settings?.location?.split(',')[0] || 'Berlin';

    // Get all active alarms
    const alarms = await DB.getAlarms(bot.userId);
    const activeAlarms = alarms.filter(a => a.active);

    if (activeAlarms.length === 0) {
      return NextResponse.json({ generated: 0, message: 'Keine aktiven Alarme' });
    }

    // Build briefing content
    const greeting = getGreeting();
    const weather = await fetchWeather(location);
    const news = await fetchNews();

    const today = new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Berlin' });

    let content = `${greeting} Heute ist ${today}. `;
    content += weather;
    if (news) content += news;
    content += 'Hab einen grossartigen Tag!';

    // Generate briefing for each active alarm
    const generated = [];
    for (const alarm of activeAlarms) {
      const row = {
        id: generateId(),
        alarm_id: alarm.id,
        user_id: bot.userId,
        modules: news ? ['weather', 'news'] : ['weather'],
        content_text: content,
        generated_at: new Date().toISOString(),
      };

      const { data, error } = await getSupabaseAdmin()!.from('briefings').insert(row).select().single();
      if (!error) generated.push({ alarmId: alarm.id, alarmName: alarm.name, briefingId: data.id });
    }

    return NextResponse.json({
      generated: generated.length,
      briefings: generated,
      preview: content.substring(0, 200) + '...',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Briefing-Generierung fehlgeschlagen' }, { status: 500 });
  }
}
