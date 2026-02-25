import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { Colors, Shadows } from '../theme/colors';
import { AlarmCard } from '../components/AlarmCard';
import { useAlarms } from '../hooks/useAlarms';

export function HomeScreen({ navigation }: any) {
  const { alarms, toggleAlarm, loading } = useAlarms();

  const sorted = [...alarms].sort((a, b) => {
    if (a.active !== b.active) return a.active ? -1 : 1;
    return a.time.localeCompare(b.time);
  });

  const nextAlarm = sorted.find(a => a.active);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Alarm<Text style={styles.titleAccent}>Briefing</Text></Text>
          <Text style={styles.subtitle}>
            {nextAlarm
              ? `Nächster Alarm: ${nextAlarm.time.slice(0, 5)}`
              : 'Keine aktiven Alarme'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.settingsIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      {/* Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>
          {alarms.filter(a => a.active).length} aktive Alarme
        </Text>
        <Text style={styles.statusSep}>•</Text>
        <Text style={styles.statusText}>
          {alarms.filter(a => a.managedBy === 'bot').length} Bot-verwaltet
        </Text>
      </View>

      {/* Alarm List */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {loading ? (
          <Text style={styles.emptyText}>Laden...</Text>
        ) : sorted.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>⏰</Text>
            <Text style={styles.emptyTitle}>Keine Wecker</Text>
            <Text style={styles.emptyText}>
              Erstelle einen Wecker oder verbinde deinen Bot.
            </Text>
          </View>
        ) : (
          sorted.map(alarm => (
            <AlarmCard
              key={alarm.id}
              alarm={alarm}
              onToggle={() => toggleAlarm(alarm.id)}
              onPress={() => navigation.navigate('AlarmDetail', { alarmId: alarm.id })}
            />
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AlarmEdit')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  titleAccent: {
    color: Colors.blue,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textDim,
    marginTop: 2,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 20,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  statusText: {
    fontSize: 13,
    color: Colors.textDim,
  },
  statusSep: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textDim,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.glow,
  },
  fabText: {
    fontSize: 32,
    color: Colors.white,
    fontWeight: '300',
    marginTop: -2,
  },
});
