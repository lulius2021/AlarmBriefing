export interface Alarm {
  id: string;
  name: string;
  active: boolean;
  time: string;
  days: number[];
  oneTime?: boolean;
  snoozeEnabled: boolean;
  snoozeDuration: number;
  sound: string;
  vibration: boolean;
  briefingMode: 'none' | 'short' | 'standard';
  managedBy: 'manual' | 'bot';
  lastTriggered?: string;
  nextTrigger?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  authProviders: string[];
}

export interface BotKey {
  id: string;
  name: string;
  scopes: string[];
  lastUsed?: string;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  actor: 'user' | 'bot';
  action: string;
  target: string;
  details?: string;
  timestamp: string;
}

export interface Briefing {
  id: string;
  alarmId: string;
  modules: string[];
  content: string;
  audioUrl?: string;
  createdAt: string;
}

export interface Settings {
  voice: string;
  speechRate: number;
  briefingLength: string;
  locale: string;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  modules: { id: string; name: string; enabled: boolean; icon: string }[];
  telemetryOptIn: boolean;
}
