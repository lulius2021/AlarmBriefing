import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

let accessToken: string | null = null;
let refreshToken: string | null = null;

export async function initTokens() {
  accessToken = await SecureStore.getItemAsync('access_token');
  refreshToken = await SecureStore.getItemAsync('refresh_token');
}

export async function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  await SecureStore.setItemAsync('access_token', access);
  await SecureStore.setItemAsync('refresh_token', refresh);
}

export async function clearTokens() {
  accessToken = null;
  refreshToken = null;
  await SecureStore.deleteItemAsync('access_token');
  await SecureStore.deleteItemAsync('refresh_token');
}

export function getAccessToken() { return accessToken; }

async function tryRefresh(): Promise<boolean> {
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    await setTokens(data.token, data.refreshToken);
    return true;
  } catch { return false; }
}

export async function api(path: string, options: RequestInit = {}): Promise<any> {
  const headers: any = { 'Content-Type': 'application/json', ...options.headers };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  let res = await fetch(`${API_URL}${path}`, { ...options, headers });

  // Auto-refresh on 401
  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${accessToken}`;
      res = await fetch(`${API_URL}${path}`, { ...options, headers });
    }
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API error');
  return data;
}

// Auth
export async function register(email: string, password: string, name?: string) {
  const data = await api('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
  await setTokens(data.token, data.refreshToken);
  return data.user;
}

export async function login(email: string, password: string) {
  const data = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  await setTokens(data.token, data.refreshToken);
  return data.user;
}

export async function socialLogin(provider: string, providerId: string, email?: string, name?: string) {
  const data = await api('/api/auth/social', {
    method: 'POST',
    body: JSON.stringify({ provider, providerId, email, name }),
  });
  await setTokens(data.token, data.refreshToken);
  return data.user;
}

export async function logout() {
  await clearTokens();
}

// Alarms
export async function getAlarms() {
  const data = await api('/api/alarms');
  return data.alarms;
}

export async function createAlarm(alarm: any) {
  const data = await api('/api/alarms', { method: 'POST', body: JSON.stringify(alarm) });
  return data.alarm;
}

export async function updateAlarm(id: string, updates: any) {
  const data = await api(`/api/alarms/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
  return data.alarm;
}

export async function deleteAlarm(id: string) {
  await api(`/api/alarms/${id}`, { method: 'DELETE' });
}

// Settings
export async function getSettings() {
  const data = await api('/api/settings');
  return data.settings;
}

export async function updateSettings(settings: any) {
  const data = await api('/api/settings', { method: 'PATCH', body: JSON.stringify(settings) });
  return data.settings;
}

// Bot Key
export async function createBotKey(scopes?: string[], name?: string) {
  const data = await api('/api/auth/bot-key', { method: 'POST', body: JSON.stringify({ scopes, name }) });
  return data;
}

export async function getBotKeys() {
  const data = await api('/api/auth/bot-keys');
  return data.keys;
}

export async function revokeBotKey(id: string) {
  await api(`/api/auth/bot-key/${id}`, { method: 'DELETE' });
}

// Briefings
export async function getLatestBriefing(alarmId: string) {
  const data = await api(`/api/briefings/${alarmId}/latest`);
  return data.briefing;
}

// Audit
export async function getAuditLog(limit = 50) {
  const data = await api(`/api/audit?limit=${limit}`);
  return data.logs;
}

// Data Export
export async function exportData() {
  return await api('/api/settings/export');
}

// Delete Account
export async function deleteAccount() {
  await api('/api/auth/account', { method: 'DELETE' });
  await clearTokens();
}
