import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Shadows } from '../theme/colors';
import { Alarm } from '../types';

const DAY_LABELS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

interface AlarmCardProps {
  alarm: Alarm;
  onToggle: () => void;
  onPress: () => void;
}

export function AlarmCard({ alarm, onToggle, onPress }: AlarmCardProps) {
  const timeStr = alarm.time.slice(0, 5); // HH:MM

  const briefingLabel =
    alarm.briefingMode === 'none' ? 'Nur Alarm' :
    alarm.briefingMode === 'short' ? 'Kurzbriefing' : 'Standardbriefing';

  return (
    <TouchableOpacity
      style={[styles.card, alarm.active && styles.cardActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        <Text style={[styles.time, alarm.active && styles.timeActive]}>{timeStr}</Text>
        <Text style={styles.name}>{alarm.name}</Text>
        <View style={styles.daysRow}>
          {alarm.days.length > 0 ? (
            alarm.days.map(d => (
              <Text key={d} style={styles.dayBadge}>{DAY_LABELS[d]}</Text>
            ))
          ) : (
            <Text style={styles.dayBadge}>Einmalig</Text>
          )}
        </View>
      </View>
      <View style={styles.right}>
        <View style={styles.badges}>
          {alarm.managedBy === 'bot' && (
            <View style={styles.botBadge}>
              <Text style={styles.botBadgeText}>BOT</Text>
            </View>
          )}
          <Text style={styles.briefingLabel}>{briefingLabel}</Text>
        </View>
        <Switch
          value={alarm.active}
          onValueChange={onToggle}
          trackColor={{ false: Colors.border, true: Colors.blueMuted }}
          thumbColor={alarm.active ? Colors.blue : Colors.textDim}
          ios_backgroundColor={Colors.border}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  cardActive: {
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  left: { flex: 1 },
  time: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.textDim,
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
  },
  timeActive: {
    color: Colors.text,
  },
  name: {
    fontSize: 14,
    color: Colors.textDim,
    marginTop: 2,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
  },
  dayBadge: {
    fontSize: 11,
    color: Colors.blueLight,
    backgroundColor: Colors.blueMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  right: {
    alignItems: 'flex-end',
    gap: 8,
  },
  badges: {
    alignItems: 'flex-end',
    gap: 4,
  },
  botBadge: {
    backgroundColor: Colors.blueMuted,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  botBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.blue,
    letterSpacing: 1,
  },
  briefingLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
});
