import * as Notifications from 'expo-notifications';
import { Alarm } from '../types';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    priority: Notifications.AndroidNotificationPriority.MAX,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true, allowCriticalAlerts: true },
  });
  return status === 'granted';
}

export async function scheduleAlarm(alarm: Alarm): Promise<string[]> {
  const ids: string[] = [];

  if (!alarm.active) return ids;

  const [hours, minutes] = alarm.time.split(':').map(Number);

  if (alarm.days.length === 0) {
    // One-time alarm
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ ${alarm.name}`,
        body: alarm.briefingMode !== 'none' ? 'Tippe für dein Briefing' : 'Alarm!',
        sound: true,
        data: { alarmId: alarm.id, briefingMode: alarm.briefingMode },
        ...(Platform.OS === 'android' && {
          priority: 'max',
          channelId: 'alarms',
        }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: getNextDate(hours, minutes),
      },
    });
    ids.push(id);
  } else {
    // Recurring per weekday
    for (const weekday of alarm.days) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `⏰ ${alarm.name}`,
          body: alarm.briefingMode !== 'none' ? 'Tippe für dein Briefing' : 'Alarm!',
          sound: true,
          data: { alarmId: alarm.id, briefingMode: alarm.briefingMode },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: weekday === 0 ? 1 : weekday + 1, // Expo uses 1=Sun
          hour: hours,
          minute: minutes,
        },
      });
      ids.push(id);
    }
  }

  return ids;
}

export async function cancelAlarm(alarm: Alarm) {
  // Cancel all notifications with matching alarmId
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.content.data?.alarmId === alarm.id) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }
}

export async function rescheduleAllAlarms(alarms: Alarm[]) {
  // Cancel all existing
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Reschedule active alarms
  for (const alarm of alarms) {
    if (alarm.active) {
      await scheduleAlarm(alarm);
    }
  }
}

function getNextDate(hours: number, minutes: number): Date {
  const now = new Date();
  const next = new Date(now);
  next.setHours(hours, minutes, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next;
}

// Setup Android notification channel
export async function setupNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('alarms', {
      name: 'Alarme',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
      enableLights: true,
      lightColor: '#3b82f6',
    });
  }
}
