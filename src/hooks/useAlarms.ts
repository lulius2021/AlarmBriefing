import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm } from '../types';

const STORAGE_KEY = 'alarms';

export function useAlarms() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setAlarms(JSON.parse(raw));
    } catch (e) {
      console.error('Failed to load alarms', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (updated: Alarm[]) => {
    setAlarms(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const addAlarm = async (alarm: Alarm) => {
    await save([...alarms, alarm]);
  };

  const updateAlarm = async (id: string, updates: Partial<Alarm>) => {
    await save(alarms.map(a => a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a));
  };

  const deleteAlarm = async (id: string) => {
    await save(alarms.filter(a => a.id !== id));
  };

  const toggleAlarm = async (id: string) => {
    const alarm = alarms.find(a => a.id === id);
    if (alarm) await updateAlarm(id, { active: !alarm.active });
  };

  return { alarms, loading, addAlarm, updateAlarm, deleteAlarm, toggleAlarm, reload: load };
}
