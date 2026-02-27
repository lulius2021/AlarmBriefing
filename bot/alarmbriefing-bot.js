#!/usr/bin/env node
/**
 * AlarmBriefing Bot Client
 * 
 * Allows ClawdBot (Clark) to manage alarms and generate briefings
 * via the AlarmBriefing API.
 * 
 * Usage:
 *   node alarmbriefing-bot.js ping
 *   node alarmbriefing-bot.js alarms
 *   node alarmbriefing-bot.js create-alarm --name "Morgenwecker" --time "06:30" --days "1,2,3,4,5"
 *   node alarmbriefing-bot.js delete-alarm --id <alarm-id>
 *   node alarmbriefing-bot.js briefing --alarm <alarm-id> --content "Guten Morgen! Heute 14°C, bewölkt..."
 *   node alarmbriefing-bot.js settings
 * 
 * Environment:
 *   ALARMBRIEFING_API_KEY  - Bot API key from the app
 *   ALARMBRIEFING_API_URL  - API base URL (default: https://alarm-briefing.vercel.app)
 */

const API_URL = process.env.ALARMBRIEFING_API_URL || 'https://alarm-briefing.vercel.app';
const API_KEY = process.env.ALARMBRIEFING_API_KEY;

if (!API_KEY) {
  console.error('Error: ALARMBRIEFING_API_KEY not set');
  console.error('Generate one in the app: Settings → Bot-Verbindung → Neuen Key generieren');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  'X-Bot-Key': API_KEY,
};

async function api(path, opts = {}) {
  const res = await fetch(`${API_URL}${path}`, { ...opts, headers: { ...headers, ...(opts.headers || {}) } });
  const data = await res.json();
  if (!res.ok) {
    console.error(`Error ${res.status}: ${data.error || JSON.stringify(data)}`);
    process.exit(1);
  }
  return data;
}

// === Commands ===
const commands = {
  async ping() {
    const d = await api('/api/bot/ping');
    console.log('✅ Connected!');
    console.log(`User: ${d.userId}`);
    console.log(`Scopes: ${d.scopes.join(', ')}`);
    console.log(`Time: ${d.timestamp}`);
  },

  async alarms() {
    const d = await api('/api/bot/alarms');
    if (!d.alarms.length) { console.log('No alarms.'); return; }
    console.log(`${d.alarms.length} alarm(s):\n`);
    for (const a of d.alarms) {
      const days = (a.days || []).map(d => ['So','Mo','Di','Mi','Do','Fr','Sa'][d]).join(',');
      const status = a.active ? '🟢' : '⚪';
      console.log(`${status} ${a.time} - ${a.name} [${days}] ${a.managed_by === 'bot' ? '🤖' : '👤'} (${a.id})`);
    }
  },

  async 'create-alarm'() {
    const args = parseArgs();
    const body = {
      name: args.name || 'Bot-Alarm',
      time: args.time || '07:00',
      days: args.days ? args.days.split(',').map(Number) : [1, 2, 3, 4, 5],
      briefingMode: 'auto',
    };
    const d = await api('/api/bot/alarms', { method: 'POST', body: JSON.stringify(body) });
    console.log(`✅ Alarm created: ${d.alarm.name} at ${d.alarm.time} (${d.alarm.id})`);
  },

  async 'delete-alarm'() {
    const args = parseArgs();
    if (!args.id) { console.error('--id required'); process.exit(1); }
    // Note: need to add DELETE endpoint
    console.log('Delete not yet implemented via bot API. Use the app.');
  },

  async briefing() {
    const args = parseArgs();
    let content = args.content || '';
    
    // Auto-generate briefing text if no content provided
    if (!content) {
      console.log('Generating briefing content...');
      const parts = [];
      const modules = (args.modules || 'weather,calendar,news').split(',');
      
      const now = new Date();
      const dayNames = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
      const monthNames = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
      
      parts.push(`Guten Morgen! Heute ist ${dayNames[now.getDay()]}, der ${now.getDate()}. ${monthNames[now.getMonth()]} ${now.getFullYear()}.`);
      
      if (modules.includes('weather')) {
        // Fetch weather from wttr.in
        try {
          const wRes = await fetch('https://wttr.in/Berlin?format=j1');
          const w = await wRes.json();
          const cur = w.current_condition[0];
          const temp = cur.temp_C;
          const desc = cur.lang_de?.[0]?.value || cur.weatherDesc[0].value;
          const feelsLike = cur.FeelsLikeC;
          parts.push(`Das Wetter: ${desc}, ${temp} Grad, gefühlt ${feelsLike} Grad.`);
          
          const today = w.weather[0];
          parts.push(`Tageshöchstwert ${today.maxtempC} Grad, Tiefstwert ${today.mintempC} Grad.`);
        } catch(e) {
          parts.push('Wetterdaten konnten nicht geladen werden.');
        }
      }
      
      if (modules.includes('calendar')) {
        parts.push('Dein Kalender: Keine Termine fuer heute eingetragen.');
      }
      
      if (modules.includes('news')) {
        parts.push('Das waren die wichtigsten Infos fuer deinen Start in den Tag. Viel Erfolg!');
      }
      
      content = parts.join(' ');
      console.log(`Generated: ${content.length} chars`);
    }
    
    const body = {
      alarmId: args.alarm || args.id || '',
      modules: (args.modules || 'weather,calendar,news').split(','),
      content,
      audioUrl: args.audio || null,
    };
    const d = await api('/api/bot/briefings', { method: 'POST', body: JSON.stringify(body) });
    console.log(`✅ Briefing created: ${d.briefing.id}`);
    console.log(`Modules: ${d.briefing.modules.join(', ')}`);
    console.log(`Content: ${content.substring(0, 100)}...`);
  },

  async settings() {
    const d = await api('/api/bot/settings');
    console.log('User settings:');
    console.log(JSON.stringify(d.settings, null, 2));
  },
};

function parseArgs() {
  const args = {};
  const argv = process.argv.slice(3);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      args[key] = argv[i + 1] || true;
      i++;
    }
  }
  return args;
}

// === Main ===
const cmd = process.argv[2];
if (!cmd || !commands[cmd]) {
  console.log('AlarmBriefing Bot Client\n');
  console.log('Commands:');
  console.log('  ping                  Test connection');
  console.log('  alarms                List all alarms');
  console.log('  create-alarm          Create alarm (--name, --time, --days)');
  console.log('  briefing              Generate briefing (--alarm, --content, --modules)');
  console.log('  settings              Read user settings');
  process.exit(0);
}

commands[cmd]();
