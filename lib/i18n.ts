/**
 * i18n — Internationalization for AlarmBriefing
 * Detects iOS/Android system language via expo-localization.
 * Falls back to 'en' if language is not supported.
 */
import { getLocales } from 'expo-localization';

type TranslationKey = keyof typeof de;

const de = {
  // Auth
  'auth.title.register': 'Registrieren',
  'auth.title.login': 'Anmelden',
  'auth.desc.register': 'Erstelle einen Account um loszulegen.',
  'auth.desc.login': 'Melde dich mit deinem Account an.',
  'auth.email': 'E-Mail',
  'auth.password': 'Passwort (min. 8 Zeichen)',
  'auth.name': 'Name (optional)',
  'auth.register': 'Registrieren',
  'auth.login': 'Anmelden',
  'auth.switchToLogin': 'Schon registriert?',
  'auth.switchToRegister': 'Noch kein Account?',
  'auth.or': 'oder',
  'auth.skipLogin': 'Ohne Account fortfahren →',
  'auth.emailRequired': 'E-Mail und Passwort erforderlich',
  'auth.passwordMin': 'Passwort muss mindestens 8 Zeichen lang sein',
  'auth.loading': 'Laden...',

  // Onboarding
  'ob.welcome.title': 'Willkommen bei AlarmBriefing',
  'ob.welcome.desc': 'Dein intelligenter Wecker mit Jarvis-Briefings. Der Clawdbot erstellt Wecker und spricht dir morgens Wetter, Termine und News vor.',
  'ob.welcome.howTitle': 'So funktioniert\'s',
  'ob.welcome.how1': '🤖 Dein Clawdbot steuert alles automatisch',
  'ob.welcome.how2': '⏰ Er erstellt Wecker für dich',
  'ob.welcome.how3': '🎙 Er generiert Audio-Briefings (wie Jarvis)',
  'ob.welcome.how4': '🔊 Beim Alarm hörst du dein Briefing',
  'ob.connect.title': 'Bot verbinden',
  'ob.connect.desc': 'Generiere einen API-Key und gib ihn deinem Clawdbot. Damit kann er auf deine App zugreifen.',
  'ob.connect.generated': '✅ Key generiert!',
  'ob.connect.copyHint': 'Kopiere den Key und gib ihn deinem Clawdbot als ALARMBRIEFING_API_KEY:',
  'ob.connect.tapCopy': 'Antippen zum Kopieren',
  'ob.connect.genTitle': 'API-Key generieren',
  'ob.connect.genDesc': 'Klicke den Button um einen Key zu erstellen.',
  'ob.connect.genBtn': '🔑 Key generieren',
  'ob.connect.generating': 'Generiere...',
  'ob.connect.laterBtn': 'Später verbinden',
  'ob.ready.title': 'Alles bereit!',
  'ob.ready.desc': 'Dein Wecker mit Jarvis-Briefings. Morgens wirst du wie Tony Stark geweckt.',
  'ob.ready.whatTitle': 'Was dein Bot kann',
  'ob.ready.what1': '⏰ Wecker erstellen und verwalten',
  'ob.ready.what2': '🎙 Audio-Briefings generieren',
  'ob.ready.what3': '🌤 Wetter, Kalender, News einbinden',
  'ob.ready.what4': '🔊 Abspielen über deine Lautsprecher',
  'ob.startApp': 'App starten',
  'ob.back': 'Zurück',
  'ob.next': 'Weiter',

  // Home
  'home.alarmsActive': '{count} Alarm{plural} aktiv',
  'home.alarmSingular': '',
  'home.alarmPlural': 'e',
  'home.briefingByBot': '🎙 Briefing wird vom Bot erstellt',
  'home.morningBriefing': 'Morgenbriefing',
  'home.noAlarms': 'Noch keine Wecker.\nTippe + oder lass deinen Bot einen erstellen.',
  'home.noBriefing': 'Noch kein Briefing vorhanden. Dein Bot wird eins erstellen.',
  'home.oneTime': 'Einmalig',

  // Create Alarm
  'create.title': 'Neuer Wecker',
  'create.cancel': 'Abbrechen',
  'create.done': 'Fertig',
  'create.name': 'Name',
  'create.namePlaceholder': 'z.B. Morgenwecker',
  'create.weekdays': 'Wochentage',
  'create.briefingTitle': '🤖 Briefing',
  'create.briefingDesc': 'Dein Clawdbot entscheidet automatisch was ins Briefing kommt — Wetter, Kalender, News etc.',
  'create.save': 'Speichern',
  'create.saving': 'Speichern...',

  // Detail
  'detail.back': '← Zurück',
  'detail.briefingMode': 'Briefing-Modus',
  'detail.modeNone': 'Nur Alarm',
  'detail.modeShort': 'Kurzbriefing (10-30s)',
  'detail.modeStandard': 'Standardbriefing (1-3 Min)',
  'detail.snooze': 'Snooze',
  'detail.snoozeDuration': 'Dauer (Min)',
  'detail.vibration': 'Vibration',
  'detail.lastTriggered': 'Letzter Alarm: {date}',
  'detail.delete': 'Wecker löschen',
  'detail.deleteConfirm': '"{name}" wirklich löschen?',

  // Settings
  'settings.title': 'Einstellungen',
  'settings.back': '← Zurück',
  'settings.botConnection': 'Bot-Verbindung',
  'settings.botExplain': 'Generiere einen API-Key und gib ihn deinem Clawdbot als ALARMBRIEFING_API_KEY. Der Bot kann dann Wecker erstellen und Briefings generieren.',
  'settings.noBot': 'Kein Bot verbunden',
  'settings.keyGenerated': 'Key generiert',
  'settings.newKey': '🔑 Neuen Key',
  'settings.copy': '📋 Kopieren',
  'settings.copied': '✓ Kopiert!',
  'settings.briefingSources': 'Briefing-Quellen',
  'settings.briefingSourcesDesc': 'Dein Bot sammelt diese Daten und erstellt daraus ein Audio-Briefing.',
  'settings.weather': '🌤 Wetter',
  'settings.calendar': '📅 Kalender',
  'settings.news': '📰 Nachrichten',
  'settings.tasks': '✅ Aufgaben',
  'settings.audio': 'Audio',
  'settings.audioDesc': 'Stimme und Tempo für dein Audio-Briefing.',
  'settings.voice': 'Stimme',
  'settings.speed': 'Tempo',
  'settings.account': 'Account',
  'settings.email': 'E-Mail',
  'settings.export': '📦 Daten exportieren',
  'settings.logout': '🚪 Abmelden',
  'settings.deleteAccount': '🗑 Account löschen',
  'settings.deleteConfirmTitle': 'Account löschen',
  'settings.deleteConfirmMsg': 'Alle Daten werden unwiderruflich gelöscht:\n\n• Account & Login\n• Alle Wecker\n• Alle API-Keys\n• Alle Briefings\n\nDas kann nicht rückgängig gemacht werden.',
  'settings.legal': 'Rechtliches',
  'settings.privacy': 'Datenschutz',
  'settings.terms': 'Nutzungsbedingungen',
  'settings.imprint': 'Impressum',
  'settings.support': 'Support & Hilfe',
  'settings.botActivity': 'Bot-Aktivitäten',
  'settings.noActivity': 'Noch keine Aktivitäten',

  // Alarm overlay
  'alarm.snooze': '😴 Snooze',
  'alarm.dismiss': '✅ Aufstehen',
  'alarm.briefingAfter': '🎙 Briefing wird nach dem Alarm vorgelesen...',

  // Audit
  'audit.title': 'Audit-Log',
  'audit.empty': 'Keine Bot-Aktivitäten',

  // Common
  'common.error': 'Fehler',
  'common.cancel': 'Abbrechen',
  'common.delete': 'Löschen',
  'common.save': 'Speichern',

  // Days
  'days.short': ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
};

const en: typeof de = {
  // Auth
  'auth.title.register': 'Sign Up',
  'auth.title.login': 'Sign In',
  'auth.desc.register': 'Create an account to get started.',
  'auth.desc.login': 'Sign in with your account.',
  'auth.email': 'Email',
  'auth.password': 'Password (min. 8 characters)',
  'auth.name': 'Name (optional)',
  'auth.register': 'Sign Up',
  'auth.login': 'Sign In',
  'auth.switchToLogin': 'Already have an account?',
  'auth.switchToRegister': 'No account yet?',
  'auth.or': 'or',
  'auth.skipLogin': 'Continue without account →',
  'auth.emailRequired': 'Email and password required',
  'auth.passwordMin': 'Password must be at least 8 characters',
  'auth.loading': 'Loading...',

  // Onboarding
  'ob.welcome.title': 'Welcome to AlarmBriefing',
  'ob.welcome.desc': 'Your smart alarm clock with Jarvis-style briefings. Clawdbot creates alarms and reads you weather, events, and news every morning.',
  'ob.welcome.howTitle': 'How it works',
  'ob.welcome.how1': '🤖 Your Clawdbot handles everything automatically',
  'ob.welcome.how2': '⏰ It creates alarms for you',
  'ob.welcome.how3': '🎙 It generates audio briefings (like Jarvis)',
  'ob.welcome.how4': '🔊 You hear your briefing when the alarm goes off',
  'ob.connect.title': 'Connect Bot',
  'ob.connect.desc': 'Generate an API key and give it to your Clawdbot so it can access your app.',
  'ob.connect.generated': '✅ Key generated!',
  'ob.connect.copyHint': 'Copy this key and set it as ALARMBRIEFING_API_KEY in your Clawdbot:',
  'ob.connect.tapCopy': 'Tap to copy',
  'ob.connect.genTitle': 'Generate API Key',
  'ob.connect.genDesc': 'Click the button to create a key.',
  'ob.connect.genBtn': '🔑 Generate Key',
  'ob.connect.generating': 'Generating...',
  'ob.connect.laterBtn': 'Connect later',
  'ob.ready.title': 'All set!',
  'ob.ready.desc': 'Your alarm clock with Jarvis briefings. Wake up like Tony Stark every morning.',
  'ob.ready.whatTitle': 'What your bot can do',
  'ob.ready.what1': '⏰ Create and manage alarms',
  'ob.ready.what2': '🎙 Generate audio briefings',
  'ob.ready.what3': '🌤 Include weather, calendar, news',
  'ob.ready.what4': '🔊 Play through your speakers',
  'ob.startApp': 'Start App',
  'ob.back': 'Back',
  'ob.next': 'Next',

  // Home
  'home.alarmsActive': '{count} alarm{plural} active',
  'home.alarmSingular': '',
  'home.alarmPlural': 's',
  'home.briefingByBot': '🎙 Briefing created by bot',
  'home.morningBriefing': 'Morning Briefing',
  'home.noAlarms': 'No alarms yet.\nTap + or let your bot create one.',
  'home.noBriefing': 'No briefing available yet. Your bot will create one.',
  'home.oneTime': 'One-time',

  // Create Alarm
  'create.title': 'New Alarm',
  'create.cancel': 'Cancel',
  'create.done': 'Done',
  'create.name': 'Name',
  'create.namePlaceholder': 'e.g. Morning alarm',
  'create.weekdays': 'Weekdays',
  'create.briefingTitle': '🤖 Briefing',
  'create.briefingDesc': 'Your Clawdbot automatically decides what goes into the briefing — weather, calendar, news, etc.',
  'create.save': 'Save',
  'create.saving': 'Saving...',

  // Detail
  'detail.back': '← Back',
  'detail.briefingMode': 'Briefing Mode',
  'detail.modeNone': 'Alarm only',
  'detail.modeShort': 'Short briefing (10-30s)',
  'detail.modeStandard': 'Standard briefing (1-3 min)',
  'detail.snooze': 'Snooze',
  'detail.snoozeDuration': 'Duration (min)',
  'detail.vibration': 'Vibration',
  'detail.lastTriggered': 'Last alarm: {date}',
  'detail.delete': 'Delete Alarm',
  'detail.deleteConfirm': 'Really delete "{name}"?',

  // Settings
  'settings.title': 'Settings',
  'settings.back': '← Back',
  'settings.botConnection': 'Bot Connection',
  'settings.botExplain': 'Generate an API key and set it as ALARMBRIEFING_API_KEY in your Clawdbot. The bot can then create alarms and generate briefings.',
  'settings.noBot': 'No bot connected',
  'settings.keyGenerated': 'Key generated',
  'settings.newKey': '🔑 New Key',
  'settings.copy': '📋 Copy',
  'settings.copied': '✓ Copied!',
  'settings.briefingSources': 'Briefing Sources',
  'settings.briefingSourcesDesc': 'Your bot collects this data and creates an audio briefing from it.',
  'settings.weather': '🌤 Weather',
  'settings.calendar': '📅 Calendar',
  'settings.news': '📰 News',
  'settings.tasks': '✅ Tasks',
  'settings.audio': 'Audio',
  'settings.audioDesc': 'Voice and speed for your audio briefing.',
  'settings.voice': 'Voice',
  'settings.speed': 'Speed',
  'settings.account': 'Account',
  'settings.email': 'Email',
  'settings.export': '📦 Export data',
  'settings.logout': '🚪 Sign out',
  'settings.deleteAccount': '🗑 Delete account',
  'settings.deleteConfirmTitle': 'Delete Account',
  'settings.deleteConfirmMsg': 'All data will be permanently deleted:\n\n• Account & login\n• All alarms\n• All API keys\n• All briefings\n\nThis cannot be undone.',
  'settings.legal': 'Legal',
  'settings.privacy': 'Privacy Policy',
  'settings.terms': 'Terms of Service',
  'settings.imprint': 'Imprint',
  'settings.support': 'Support & Help',
  'settings.botActivity': 'Bot Activity',
  'settings.noActivity': 'No activity yet',

  // Alarm overlay
  'alarm.snooze': '😴 Snooze',
  'alarm.dismiss': '✅ Dismiss',
  'alarm.briefingAfter': '🎙 Briefing will play after the alarm...',

  // Audit
  'audit.title': 'Audit Log',
  'audit.empty': 'No bot activity',

  // Common
  'common.error': 'Error',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.save': 'Save',

  // Days
  'days.short': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

const translations: Record<string, typeof de> = { de, en };

let currentLang = 'en';

export function initI18n() {
  try {
    const locales = getLocales();
    const lang = locales?.[0]?.languageCode || 'en';
    currentLang = translations[lang] ? lang : 'en';
  } catch {
    currentLang = 'en';
  }
}

export function getLocale(): string {
  return currentLang;
}

export function setLocale(lang: string) {
  currentLang = translations[lang] ? lang : 'en';
}

export function t(key: TranslationKey, params?: Record<string, string | number>): any {
  const val = translations[currentLang]?.[key] ?? translations.en[key] ?? key;
  if (typeof val !== 'string') return val;
  if (!params) return val;
  return Object.entries(params).reduce(
    (s, [k, v]) => s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)),
    val
  );
}

export function tDays(): string[] {
  return t('days.short') as unknown as string[];
}

// Get TTS language code based on current locale
export function getTTSLang(): string {
  return currentLang === 'de' ? 'de-DE' : 'en-US';
}

// Initialize on import
initI18n();
