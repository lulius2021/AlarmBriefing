export interface Alarm {
  id: string;
  name: string;
  active: boolean;
  time: string; // HH:MM:SS
  days: number[]; // 0=Sun..6=Sat, empty=one-time
  oneTime?: boolean;
  snoozeEnabled: boolean;
  snoozeDuration: number; // minutes
  sound: string;
  vibration: boolean;
  briefingMode: 'none' | 'short' | 'standard';
  managedBy: 'manual' | 'bot';
  lastTriggered?: string; // ISO
  nextTrigger?: string; // ISO
  createdAt: string;
  updatedAt: string;
}

export interface BotConnection {
  connected: boolean;
  keyHash?: string;
  scopes: string[];
  lastPing?: string;
  status: 'active' | 'inactive' | 'error';
}

export interface BriefingModule {
  id: string;
  name: string;
  enabled: boolean;
  icon: string;
}

export interface UserSettings {
  voice: string;
  speechRate: number; // 0.5 - 2.0
  briefingLength: 'short' | 'standard' | 'long';
  locale: string;
  quietHoursStart?: string; // HH:MM
  quietHoursEnd?: string; // HH:MM
  modules: BriefingModule[];
  telemetryOptIn: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: 'user' | 'bot';
  action: string;
  target: string;
  details?: string;
}

export interface User {
  id: string;
  email?: string;
  name?: string;
  authProviders: ('apple' | 'google' | 'facebook' | 'email')[];
}
