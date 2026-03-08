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
 *   ALARMBRIEFING_LANG     - Language: de (default) or en
 */

const i = require('./i18n');

const API_URL = process.env.ALARMBRIEFING_API_URL || 'https://alarm-briefing.vercel.app';
const API_KEY = process.env.ALARMBRIEFING_API_KEY;

if (!API_KEY) {
  console.error(i.noApiKey);
  console.error(i.noApiKeyHint);
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
    console.error(`${i.errorPrefix(res.status)}: ${data.error || JSON.stringify(data)}`);
    process.exit(1);
  }
  return data;
}

// === Commands ===
const commands = {
  async ping() {
    const d = await api('/api/bot/ping');
    console.log(i.connected);
    console.log(`${i.user}: ${d.userId}`);
    console.log(`${i.scopes}: ${d.scopes.join(', ')}`);
    console.log(`${i.time}: ${d.timestamp}`);
  },

  async alarms() {
    const d = await api('/api/bot/alarms');
    if (!d.alarms.length) { console.log(i.noAlarms); return; }
    console.log(i.alarmsCount(d.alarms.length));
    for (const a of d.alarms) {
      const days = (a.days || []).map(d => i.days[d]).join(',');
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
    console.log(i.alarmCreated(d.alarm.name, d.alarm.time, d.alarm.id));
  },

  async 'delete-alarm'() {
    const args = parseArgs();
    if (!args.id) { console.error(i.idRequired); process.exit(1); }
    await api(`/api/bot/alarms/${args.id}`, { method: 'DELETE' });
    console.log(i.alarmDeleted(args.id));
  },

  async 'update-alarm'() {
    const args = parseArgs();
    if (!args.id) { console.error(i.idRequired); process.exit(1); }
    const body = {};
    if (args.name) body.name = args.name;
    if (args.time) body.time = args.time;
    if (args.days) body.days = args.days.split(',').map(Number);
    if (args.active !== undefined) body.active = args.active !== 'false';
    const d = await api(`/api/bot/alarms/${args.id}`, { method: 'PATCH', body: JSON.stringify(body) });
    console.log(i.alarmUpdated(d.alarm.name, d.alarm.time));
  },

  async briefing() {
    const args = parseArgs();
    let content = args.content || '';
    
    if (!content) {
      console.log(i.generatingBriefing);
      const parts = [];
      const modules = (args.modules || 'weather,calendar,news').split(',');
      
      const now = new Date();
      parts.push(i.goodMorning(i.daysFull[now.getDay()], now.getDate(), i.months[now.getMonth()], now.getFullYear()));
      
      if (modules.includes('weather')) {
        try {
          const wRes = await fetch('https://wttr.in/Berlin?format=j1');
          const w = await wRes.json();
          const cur = w.current_condition[0];
          const desc = cur.lang_de?.[0]?.value || cur.weatherDesc[0].value;
          parts.push(i.weatherReport(desc, cur.temp_C, cur.FeelsLikeC));
          const today = w.weather[0];
          parts.push(i.tempRange(today.maxtempC, today.mintempC));
        } catch(e) {
          parts.push(i.weatherError);
        }
      }
      
      if (modules.includes('calendar')) {
        parts.push(i.noCalendar);
      }
      
      if (modules.includes('news')) {
        parts.push(i.closingLine);
      }
      
      content = parts.join(' ');
      console.log(i.generated(content.length));
    }
    
    const body = {
      alarmId: args.alarm || args.id || '',
      modules: (args.modules || 'weather,calendar,news').split(','),
      content,
      audioUrl: args.audio || null,
    };
    const d = await api('/api/bot/briefings', { method: 'POST', body: JSON.stringify(body) });
    console.log(i.briefingCreated(d.briefing.id));
    console.log(`${i.modules}: ${d.briefing.modules.join(', ')}`);
    console.log(`${i.content}: ${content.substring(0, 100)}...`);
  },

  async settings() {
    const d = await api('/api/bot/settings');
    console.log(i.userSettings);
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
  console.log(`${i.commands}:`);
  console.log(`  ping                  ${i.cmdPing}`);
  console.log(`  alarms                ${i.cmdAlarms}`);
  console.log(`  create-alarm          ${i.cmdCreate}`);
  console.log(`  update-alarm          ${i.cmdUpdate}`);
  console.log(`  delete-alarm          ${i.cmdDelete}`);
  console.log(`  briefing              ${i.cmdBriefing}`);
  console.log(`  settings              ${i.cmdSettings}`);
  process.exit(0);
}

commands[cmd]();
