import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TextInput, Switch, TouchableOpacity, SafeAreaView, Alert,
} from 'react-native';
import { Colors } from '../theme/colors';
import { GlowButton } from '../components/GlowButton';
import { useAlarms } from '../hooks/useAlarms';
import { Alarm } from '../types';

const DAY_LABELS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const BRIEFING_MODES = [
  { key: 'none', label: 'Nur Alarm' },
  { key: 'short', label: 'Kurzbriefing (10-30s)' },
  { key: 'standard', label: 'Standardbriefing (1-3 min)' },
] as const;

export function AlarmDetailScreen({ navigation, route }: any) {
  const { alarms, updateAlarm, deleteAlarm } = useAlarms();
  const alarmId = route.params?.alarmId;
  const alarm = alarms.find(a => a.id === alarmId);

  const [name, setName] = useState('');
  const [hours, setHours] = useState('07');
  const [minutes, setMinutes] = useState('00');
  const [days, setDays] = useState<number[]>([]);
  const [snoozeEnabled, setSnoozeEnabled] = useState(true);
  const [snoozeDuration, setSnoozeDuration] = useState('5');
  const [briefingMode, setBriefingMode] = useState<'none' | 'short' | 'standard'>('standard');
  const [vibration, setVibration] = useState(true);

  useEffect(() => {
    if (alarm) {
      setName(alarm.name);
      const [h, m] = alarm.time.split(':');
      setHours(h);
      setMinutes(m);
      setDays(alarm.days);
      setSnoozeEnabled(alarm.snoozeEnabled);
      setSnoozeDuration(String(alarm.snoozeDuration));
      setBriefingMode(alarm.briefingMode);
      setVibration(alarm.vibration);
    }
  }, [alarm]);

  if (!alarm) return null;

  const toggleDay = (day: number) => {
    setDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort());
  };

  const handleSave = async () => {
    await updateAlarm(alarm.id, {
      name,
      time: `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`,
      days,
      snoozeEnabled,
      snoozeDuration: parseInt(snoozeDuration) || 5,
      briefingMode,
      vibration,
    });
    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert('Wecker löschen', `"${alarm.name}" wirklich löschen?`, [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Löschen', style: 'destructive', onPress: async () => {
        await deleteAlarm(alarm.id);
        navigation.goBack();
      }},
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Zurück</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{alarm.name}</Text>
        <View style={styles.headerRight}>
          {alarm.managedBy === 'bot' && (
            <View style={styles.botBadge}><Text style={styles.botBadgeText}>BOT</Text></View>
          )}
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.timeContainer}>
          <TextInput style={styles.timeInput} value={hours}
            onChangeText={t => setHours(t.replace(/[^0-9]/g, '').slice(0, 2))}
            keyboardType="number-pad" maxLength={2} selectTextOnFocus />
          <Text style={styles.timeSep}>:</Text>
          <TextInput style={styles.timeInput} value={minutes}
            onChangeText={t => setMinutes(t.replace(/[^0-9]/g, '').slice(0, 2))}
            keyboardType="number-pad" maxLength={2} selectTextOnFocus />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Wochentage</Text>
          <View style={styles.daysGrid}>
            {DAY_LABELS.map((label, i) => (
              <TouchableOpacity key={i}
                style={[styles.dayBtn, days.includes(i) && styles.dayBtnActive]}
                onPress={() => toggleDay(i)}>
                <Text style={[styles.dayBtnText, days.includes(i) && styles.dayBtnTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Briefing-Modus</Text>
          {BRIEFING_MODES.map(m => (
            <TouchableOpacity key={m.key}
              style={[styles.radioRow, briefingMode === m.key && styles.radioRowActive]}
              onPress={() => setBriefingMode(m.key)}>
              <View style={[styles.radio, briefingMode === m.key && styles.radioActive]}>
                {briefingMode === m.key && <View style={styles.radioDot} />}
              </View>
              <Text style={styles.radioLabel}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Snooze</Text>
            <Switch value={snoozeEnabled} onValueChange={setSnoozeEnabled}
              trackColor={{ false: Colors.border, true: Colors.blueMuted }}
              thumbColor={snoozeEnabled ? Colors.blue : Colors.textDim} />
          </View>
          {snoozeEnabled && (
            <View style={styles.inlineRow}>
              <Text style={styles.inlineLabel}>Dauer (Min)</Text>
              <TextInput style={[styles.input, { width: 60, textAlign: 'center' }]}
                value={snoozeDuration} onChangeText={setSnoozeDuration} keyboardType="number-pad" />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Vibration</Text>
            <Switch value={vibration} onValueChange={setVibration}
              trackColor={{ false: Colors.border, true: Colors.blueMuted }}
              thumbColor={vibration ? Colors.blue : Colors.textDim} />
          </View>
        </View>

        {alarm.lastTriggered && (
          <Text style={styles.metaText}>Letzter Alarm: {new Date(alarm.lastTriggered).toLocaleString('de-DE')}</Text>
        )}

        <GlowButton title="Speichern" onPress={handleSave} size="lg" style={{ marginTop: 20 }} />
        <GlowButton title="Wecker löschen" onPress={handleDelete} variant="danger" size="md" style={{ marginTop: 12 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { color: Colors.blue, fontSize: 15 },
  headerTitle: { color: Colors.text, fontSize: 17, fontWeight: '600' },
  headerRight: { width: 60, alignItems: 'flex-end' },
  botBadge: { backgroundColor: Colors.blueMuted, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: 'rgba(59,130,246,0.3)' },
  botBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.blue, letterSpacing: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 60 },
  timeContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 30, marginTop: 10 },
  timeInput: { fontSize: 64, fontWeight: '700', color: Colors.text, fontVariant: ['tabular-nums'], width: 110, textAlign: 'center', backgroundColor: Colors.bgCard, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 12 },
  timeSep: { fontSize: 56, fontWeight: '300', color: Colors.blue, marginHorizontal: 8 },
  section: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.textDim, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  input: { backgroundColor: Colors.bgInput, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 14, color: Colors.text, fontSize: 15 },
  daysGrid: { flexDirection: 'row', gap: 8 },
  dayBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border },
  dayBtnActive: { backgroundColor: Colors.blueMuted, borderColor: Colors.blue },
  dayBtnText: { fontSize: 13, fontWeight: '600', color: Colors.textDim },
  dayBtnTextActive: { color: Colors.blue },
  radioRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, marginBottom: 8, gap: 12 },
  radioRowActive: { borderColor: Colors.blue, backgroundColor: Colors.blueMuted },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.textDim, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: Colors.blue },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.blue },
  radioLabel: { fontSize: 14, color: Colors.text },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  inlineRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  inlineLabel: { fontSize: 14, color: Colors.textDim },
  metaText: { fontSize: 12, color: Colors.textMuted, textAlign: 'center', marginTop: 8 },
});
