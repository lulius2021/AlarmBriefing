import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { colors } from '@/lib/theme';
import { createAlarm } from '@/lib/api';
import { t } from '@/lib/i18n';

export default function CreateAlarmScreen() {
  const [hours, setHours] = useState('07');
  const [minutes, setMinutes] = useState('00');
  const [name, setName] = useState('');
  const [days, setDays] = useState([1, 2, 3, 4, 5]);
  const [saving, setSaving] = useState(false);

  const toggleDay = (d: number) => setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  const save = async () => {
    const h = parseInt(hours), m = parseInt(minutes);
    if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
      Alert.alert(t.error, 'Invalid time'); return;
    }
    setSaving(true);
    try {
      await createAlarm({ name: name || 'Alarm', time: `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`, days });
      router.back();
    } catch (e: any) { Alert.alert(t.error, e.message); }
    setSaving(false);
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={s.back}>{t.cancel}</Text></TouchableOpacity>
        <Text style={s.headerTitle}>{t.newAlarm}</Text>
        <TouchableOpacity onPress={save} disabled={saving}><Text style={[s.done, saving && { opacity: 0.5 }]}>{t.done}</Text></TouchableOpacity>
      </View>
      <ScrollView style={s.body}>
        <View style={s.timeRow}>
          <TextInput style={s.timeInput} value={hours} onChangeText={setHours} keyboardType="number-pad" maxLength={2} />
          <Text style={s.timeColon}>:</Text>
          <TextInput style={s.timeInput} value={minutes} onChangeText={setMinutes} keyboardType="number-pad" maxLength={2} />
        </View>
        <Text style={s.label}>{t.alarmName}</Text>
        <TextInput style={s.input} value={name} onChangeText={setName} placeholder={t.alarmNamePlaceholder} placeholderTextColor={colors.textMuted} />
        <Text style={s.label}>{t.weekdays}</Text>
        <View style={s.daysRow}>
          {t.days.map((d, i) => (
            <TouchableOpacity key={i} style={[s.dayBtn, days.includes(i) && s.dayBtnActive]} onPress={() => toggleDay(i)}>
              <Text style={[s.dayBtnText, days.includes(i) && s.dayBtnTextActive]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={s.infoBox}>
          <Text style={s.infoTitle}>{t.briefingInfo}</Text>
          <Text style={s.infoText}>{t.briefingInfoText}</Text>
        </View>
        <TouchableOpacity style={s.saveBtn} onPress={save} disabled={saving}>
          <Text style={s.saveBtnText}>{saving ? t.saving : t.save}</Text>
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
