import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { colors } from '@/lib/theme';
import { createAlarm } from '@/lib/api';

const DAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

export default function CreateAlarmScreen() {
  const [hours, setHours] = useState('07');
  const [minutes, setMinutes] = useState('00');
  const [name, setName] = useState('');
  const [days, setDays] = useState([1, 2, 3, 4, 5]);
  const [saving, setSaving] = useState(false);

  const toggleDay = (d: number) => {
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

  const save = async () => {
    setSaving(true);
    try {
      const h = hours.padStart(2, '0');
      const m = minutes.padStart(2, '0');
      await createAlarm({ name: name || 'Alarm', time: `${h}:${m}`, days });
      router.back();
    } catch (e: any) {
      Alert.alert('Fehler', e.message);
    }
    setSaving(false);
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.back}>Abbrechen</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Neuer Wecker</Text>
        <TouchableOpacity onPress={save} disabled={saving}>
          <Text style={[s.done, saving && { opacity: 0.5 }]}>Fertig</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.body}>
        {/* Time */}
        <View style={s.timeRow}>
          <TextInput style={s.timeInput} value={hours} onChangeText={setHours} keyboardType="number-pad" maxLength={2} />
          <Text style={s.timeColon}>:</Text>
          <TextInput style={s.timeInput} value={minutes} onChangeText={setMinutes} keyboardType="number-pad" maxLength={2} />
        </View>

        {/* Name */}
        <Text style={s.label}>Name</Text>
        <TextInput style={s.input} value={name} onChangeText={setName} placeholder="z.B. Morgenwecker" placeholderTextColor={colors.textMuted} />

        {/* Days */}
        <Text style={s.label}>Wochentage</Text>
        <View style={s.daysRow}>
          {DAYS.map((d, i) => (
            <TouchableOpacity key={i} style={[s.dayBtn, days.includes(i) && s.dayBtnActive]} onPress={() => toggleDay(i)}>
              <Text style={[s.dayBtnText, days.includes(i) && s.dayBtnTextActive]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Briefing info */}
        <View style={s.infoBox}>
          <Text style={s.infoTitle}>🤖 Briefing</Text>
          <Text style={s.infoText}>Dein Clawdbot entscheidet automatisch was ins Briefing kommt — Wetter, Kalender, News etc.</Text>
        </View>

        <TouchableOpacity style={s.saveBtn} onPress={save} disabled={saving}>
          <Text style={s.saveBtnText}>{saving ? 'Speichern...' : 'Speichern'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  back: { color: colors.textDim, fontSize: 14 },
  headerTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  done: { color: colors.blue, fontSize: 14, fontWeight: '600' },
  body: { flex: 1, padding: 20 },
  timeRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 24 },
  timeInput: { width: 90, fontSize: 48, fontWeight: '700', fontFamily: 'monospace', color: colors.text, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, borderRadius: 16, textAlign: 'center', padding: 10 },
  timeColon: { fontSize: 40, fontFamily: 'monospace', color: colors.blue },
  label: { fontSize: 11, fontWeight: '700', color: colors.textDim, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, marginTop: 4 },
  input: { backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, color: colors.text, fontSize: 15, marginBottom: 16 },
  daysRow: { flexDirection: 'row', gap: 6, marginBottom: 20 },
  dayBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  dayBtnActive: { backgroundColor: 'rgba(59,130,246,0.12)', borderColor: colors.blue },
  dayBtnText: { fontSize: 13, fontWeight: '600', color: colors.textDim },
  dayBtnTextActive: { color: colors.blue },
  infoBox: { backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, marginBottom: 20 },
  infoTitle: { fontSize: 12, color: colors.blue, fontWeight: '600', marginBottom: 4 },
  infoText: { fontSize: 12, color: colors.textDim, lineHeight: 18 },
  saveBtn: { backgroundColor: colors.blue, borderRadius: 14, padding: 16, alignItems: 'center' },
  saveBtnText: { color: 'white', fontSize: 16, fontWeight: '600' },
});
