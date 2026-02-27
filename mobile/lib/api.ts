import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://alarm-briefing.vercel.app';

let cachedToken: string | null = null;

export async function getToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;
  cachedToken = await SecureStore.getItemAsync('ab_token');
  return cachedToken;
}

export async function setToken(token: string) {
  cachedToken = token;
  await SecureStore.setItemAsync('ab_token', token);
}

export async function clearToken() {
  cachedToken = null;
  await SecureStore.deleteItemAsync('ab_token');
  await SecureStore.deleteItemAsync('ab_user');
}

export async function api(path: string, opts: any = {}) {
  const token = await getToken();
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    ...opts,
    headers: { ...headers, ...(opts.headers || {}) },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Fehler');
  return data;
}

export async function register(email: string, password: string, name: string) {
  const data = await api('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
  await setToken(data.token);
  await SecureStore.setItemAsync('ab_user', JSON.stringify(data.user));
  return data;
}

export async function login(email: string, password: string) {
  const data = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  await setToken(data.token);
  await SecureStore.setItemAsync('ab_user', JSON.stringify(data.user));
  return data;
}

export async function getAlarms() {
  const data = await api('/api/alarms');
  return data.alarms || [];
}

export async function createAlarm(alarm: { name: string; time: string; days: number[] }) {
  return api('/api/alarms', {
    method: 'POST',
    body: JSON.stringify({ ...alarm, briefingMode: 'auto' }),
  });
}

export async function generateBotKey() {
  return api('/api/auth/bot-key', { method: 'POST' });
}

export async function getLatestBriefing() {
  return api('/api/briefings/latest');
}

export async function deleteAccount() {
  await api('/api/auth/delete', { method: 'DELETE' });
  await clearToken();
}
