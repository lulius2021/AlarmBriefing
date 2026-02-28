import { useState, useEffect, useCallback } from 'react';
import { Alarm } from '../types';
import { api } from '../api/client';
import { rescheduleAllAlarms } from '../utils/alarmScheduler';

export function useAlarms() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlarms = useCallback(async () => {
    try {
      const data = await api('/api/alarms');
      const mapped: Alarm[] = (data.alarms || []).map((a: any) => ({
        id: a.id,
        name: a.name,
        active: a.active,
        time: a.time,
        days: a.days || [],
        snoozeEnabled: a.snoozeEnabled ?? a.snooze_enabled ?? true,
        snoozeDuration: a.snoozeDuration ?? a.snooze_duration ?? 5,
        sound: a.sound || 'default',
        vibration: a.vibration ?? true,
        briefingMode: a.briefingMode ?? a.briefing_mode ?? 'standard',
        managedBy: a.managedBy ?? a.managed_by ?? 'manual',
        lastTriggered: a.lastTriggered ?? a.last_triggered,
        nextTrigger: a.nextTrigger ?? a.next_trigger,
        createdAt: a.createdAt ?? a.created_at,
        updatedAt: a.updatedAt ?? a.updated_at,
      }));
      setAlarms(mapped);
      await rescheduleAllAlarms(mapped);
    } catch (e) {
      console.error('Failed to load alarms:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAlarms(); }, [loadAlarms]);

  const createAlarm = useCallback(async (alarm: Partial<Alarm>) => {
    const data = await api('/api/alarms', {
      method: 'POST',
      body: JSON.stringify(alarm),
    });
    await loadAlarms();
    return data.alarm;
  }, [loadAlarms]);

  const updateAlarm = useCallback(async (id: string, updates: Partial<Alarm>) => {
    const data = await api(`/api/alarms/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    await loadAlarms();
    return data.alarm;
  }, [loadAlarms]);

  const deleteAlarm = useCallback(async (id: string) => {
    await api(`/api/alarms/${id}`, { method: 'DELETE' });
    await loadAlarms();
  }, [loadAlarms]);

  const toggleAlarm = useCallback(async (id: string) => {
    const alarm = alarms.find(a => a.id === id);
    if (!alarm) return;
    await updateAlarm(id, { active: !alarm.active } as any);
  }, [alarms, updateAlarm]);

  return { alarms, loading, loadAlarms, createAlarm, updateAlarm, deleteAlarm, toggleAlarm };
}
