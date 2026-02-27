// Database abstraction layer
// Uses Supabase when configured, falls back to in-memory for local dev.

import crypto from 'crypto';
import { getSupabaseAdmin, isSupabaseConfigured } from './supabase';

// ===== Types =====
export interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  settings: Record<string, any>;
  created_at: string;
}

export interface Alarm {
  id: string;
  user_id: string;
  name: string;
  active: boolean;
  time: string;
  days: number[];
  snooze_enabled: boolean;
  snooze_duration: number;
  sound: string;
  vibration: boolean;
  briefing_mode: string;
  managed_by: 'manual' | 'bot';
  created_at: string;
  updated_at: string;
}

export interface BotKey {
  hash: string;
  user_id: string;
  scopes: string[];
  created_at: string;
}

export interface AuditEntry {
  id: string;
  user_id: string;
  actor: 'bot' | 'user';
  action: string;
  target: string;
  details: string;
  created_at: string;
}

export interface Briefing {
  id: string;
  alarm_id: string;
  user_id: string;
  modules: string[];
  content: string;
  audio_url?: string;
  created_at: string;
}

// ===== Helpers =====
export function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}
export function generateId(): string {
  return crypto.randomUUID();
}
export function generateBotKey(): string {
  return `ab_${crypto.randomBytes(32).toString('hex')}`;
}

// ===== In-Memory Fallback =====
const g = globalThis as any;
if (!g.__mem) {
  g.__mem = { users: new Map(), alarms: new Map(), botKeys: new Map(), auditLog: [], briefings: new Map() };
}
const mem = g.__mem;

// ===== Database Operations =====
export const DB = {
  // --- Users ---
  async createUser(user: User): Promise<User> {
    if (isSupabaseConfigured()) {
      const { data, error } = await getSupabaseAdmin()!.from('users').insert(user).select().single();
      if (error) throw new Error(error.message);
      return data;
    }
    mem.users.set(user.id, user);
    return user;
  },

  async getUserByEmail(email: string): Promise<User | null> {
    if (isSupabaseConfigured()) {
      const { data } = await getSupabaseAdmin()!.from('users').select('*').eq('email', email).single();
      return data;
    }
    for (const [, u] of mem.users) { if (u.email === email) return u; }
    return null;
  },

  async getUserById(id: string): Promise<User | null> {
    if (isSupabaseConfigured()) {
      const { data } = await getSupabaseAdmin()!.from('users').select('*').eq('id', id).single();
      return data;
    }
    return mem.users.get(id) || null;
  },

  async deleteUser(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      await getSupabaseAdmin()!.from('briefings').delete().eq('user_id', id);
      await getSupabaseAdmin()!.from('audit_log').delete().eq('user_id', id);
      await getSupabaseAdmin()!.from('bot_keys').delete().eq('user_id', id);
      await getSupabaseAdmin()!.from('alarms').delete().eq('user_id', id);
      await getSupabaseAdmin()!.from('users').delete().eq('id', id);
      return;
    }
    mem.users.delete(id);
    mem.alarms.delete(id);
    mem.briefings.delete(id);
    for (const [h, b] of mem.botKeys) { if (b.user_id === id) mem.botKeys.delete(h); }
    g.__mem.auditLog = mem.auditLog.filter((a: any) => a.user_id !== id);
  },

  // --- Alarms ---
  async getAlarms(userId: string): Promise<Alarm[]> {
    if (isSupabaseConfigured()) {
      const { data } = await getSupabaseAdmin()!.from('alarms').select('*').eq('user_id', userId).order('time');
      return data || [];
    }
    return mem.alarms.get(userId) || [];
  },

  async createAlarm(alarm: Alarm): Promise<Alarm> {
    if (isSupabaseConfigured()) {
      const { data, error } = await getSupabaseAdmin()!.from('alarms').insert(alarm).select().single();
      if (error) throw new Error(error.message);
      return data;
    }
    const list = mem.alarms.get(alarm.user_id) || [];
    list.push(alarm);
    mem.alarms.set(alarm.user_id, list);
    return alarm;
  },

  async updateAlarm(id: string, userId: string, updates: Partial<Alarm>): Promise<Alarm | null> {
    if (isSupabaseConfigured()) {
      const { data, error } = await getSupabaseAdmin()!.from('alarms').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', userId).select().single();
      if (error) return null;
      return data;
    }
    const list = mem.alarms.get(userId) || [];
    const idx = list.findIndex((a: any) => a.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
    return list[idx];
  },

  async deleteAlarm(id: string, userId: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const { error } = await getSupabaseAdmin()!.from('alarms').delete().eq('id', id).eq('user_id', userId);
      return !error;
    }
    const list = mem.alarms.get(userId) || [];
    mem.alarms.set(userId, list.filter((a: any) => a.id !== id));
    return true;
  },

  async countAlarms(userId: string): Promise<number> {
    if (isSupabaseConfigured()) {
      const { count } = await getSupabaseAdmin()!.from('alarms').select('*', { count: 'exact', head: true }).eq('user_id', userId);
      return count || 0;
    }
    return (mem.alarms.get(userId) || []).length;
  },

  // --- Bot Keys ---
  async createBotKey(key: BotKey): Promise<void> {
    if (isSupabaseConfigured()) {
      // Remove old keys for user
      await getSupabaseAdmin()!.from('bot_keys').delete().eq('user_id', key.user_id);
      await getSupabaseAdmin()!.from('bot_keys').insert(key);
      return;
    }
    for (const [h, b] of mem.botKeys) { if (b.user_id === key.user_id) mem.botKeys.delete(h); }
    mem.botKeys.set(key.hash, key);
  },

  async getBotByHash(hash: string): Promise<BotKey | null> {
    if (isSupabaseConfigured()) {
      const { data } = await getSupabaseAdmin()!.from('bot_keys').select('*').eq('hash', hash).single();
      return data;
    }
    return mem.botKeys.get(hash) || null;
  },

  async deleteBotKeys(userId: string): Promise<void> {
    if (isSupabaseConfigured()) {
      await getSupabaseAdmin()!.from('bot_keys').delete().eq('user_id', userId);
      return;
    }
    for (const [h, b] of mem.botKeys) { if (b.user_id === userId) mem.botKeys.delete(h); }
  },

  // --- Audit ---
  async addAudit(entry: AuditEntry): Promise<void> {
    if (isSupabaseConfigured()) {
      await getSupabaseAdmin()!.from('audit_log').insert(entry);
      return;
    }
    mem.auditLog.push(entry);
  },

  async getAudit(userId: string, limit = 50): Promise<AuditEntry[]> {
    if (isSupabaseConfigured()) {
      const { data } = await getSupabaseAdmin()!.from('audit_log').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit);
      return data || [];
    }
    return mem.auditLog.filter((a: any) => a.user_id === userId).slice(-limit);
  },

  // --- Briefings ---
  async createBriefing(briefing: Briefing): Promise<Briefing> {
    if (isSupabaseConfigured()) {
      const { data, error } = await getSupabaseAdmin()!.from('briefings').insert(briefing).select().single();
      if (error) throw new Error(error.message);
      return data;
    }
    const list = mem.briefings.get(briefing.user_id) || [];
    list.push(briefing);
    if (list.length > 100) list.shift();
    mem.briefings.set(briefing.user_id, list);
    return briefing;
  },

  async getLatestBriefing(userId: string, alarmId: string): Promise<Briefing | null> {
    if (isSupabaseConfigured()) {
      const { data } = await getSupabaseAdmin()!.from('briefings').select('*').eq('user_id', userId).eq('alarm_id', alarmId).order('created_at', { ascending: false }).limit(1).single();
      return data;
    }
    const list = (mem.briefings.get(userId) || []).filter((b: any) => b.alarm_id === alarmId);
    return list[list.length - 1] || null;
  },
};
