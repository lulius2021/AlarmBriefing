// In-memory DB for MVP. Replace with Supabase/Postgres for production.
// Data persists within a single Vercel serverless instance but resets on cold start.
// This is intentional for MVP — we add Supabase in Phase 2.

import crypto from 'crypto';

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  settings: Record<string, any>;
  createdAt: string;
}

export interface Alarm {
  id: string;
  userId: string;
  name: string;
  active: boolean;
  time: string;
  days: number[];
  snoozeEnabled: boolean;
  snoozeDuration: number;
  sound: string;
  vibration: boolean;
  briefingMode: 'none' | 'short' | 'standard';
  managedBy: 'manual' | 'bot';
  createdAt: string;
  updatedAt: string;
}

export interface BotKey {
  hash: string;
  userId: string;
  scopes: string[];
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  userId: string;
  actor: 'bot' | 'user';
  action: string;
  target: string;
  details: string;
  timestamp: string;
}

export interface Briefing {
  id: string;
  alarmId: string;
  userId: string;
  modules: string[];
  content: string;
  audioUrl?: string;
  generatedAt: string;
}

// Global store (persists across requests within same instance)
const g = globalThis as any;
if (!g.__db) {
  g.__db = {
    users: new Map<string, User>(),
    alarms: new Map<string, Alarm[]>(),
    botKeys: new Map<string, BotKey>(),
    auditLog: [] as AuditEntry[],
    briefings: new Map<string, Briefing[]>(),
  };
}

export const db = g.__db as {
  users: Map<string, User>;
  alarms: Map<string, Alarm[]>;
  botKeys: Map<string, BotKey>;
  auditLog: AuditEntry[];
  briefings: Map<string, Briefing[]>;
};

// Helpers
export function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function generateBotKey(): string {
  return `ab_${crypto.randomBytes(32).toString('hex')}`;
}
