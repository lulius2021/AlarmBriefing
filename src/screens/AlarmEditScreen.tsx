import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Colors } from '../theme/colors';
import { GlowButton } from '../components/GlowButton';
import { useAlarms } from '../hooks/useAlarms';
import { t, tDays } from '../../lib/i18n';

export function AlarmEditScreen({ navigation }: any) {
  const { createAlarm } = useAlarms();
  const [hours, setHours] = useState('07');
  const [minutes, setMinutes] = useState('00');
  const [name, setName] = useState('');
  const [days, setDays] = useState([1, 2, 3, 4, 5]);
  const [saving, setSaving] = useState(false);
  const dayLabels = tDays();

  const toggleDay = (d: number) => {
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

  const save = async () => {
    setSaving(true);
    try {
      const h = hours.padStart(2, '0');
      const m = minutes.padStart(2, '0');
      await createAlarm({ name: name || 'Alarm', time: `${h}:${m}:00`, days, briefingMode: 'standard' } as any);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert(t('common.error'), e.message);
    }
    setSaving(false);
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>{t('create.cancel')}</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t('create.title')}</Text>
        <TouchableOpacity onPress={save} disabled={saving}>
          <Text style={[s.done, saving && { opacity: 0.5 }]}>{t('create.done')}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={s.body}>
        <View style={s.timeRow}>
          <TextInput style={s.timeInput} value={hours} onChangeText={setHours} keyboardType="number-pad" maxLength={2} />
          <Text style={s.timeColon}>:</Text>
          <TextInput style={s.timeInput} value={minutes} onChangeText={setMinutes} keyboardType="number-pad" maxLength={2} />
        </View>
        <Text style={s.label}>{t('create.name')}</Text>
        <TextInput style={s.input} value={name} onChangeText={setName} placeholder={t('create.namePlaceholder')} placeholderTextColor={Colors.textMuted} />
        <Text style={s.label}>{t('create.weekdays')}</Text>
        <View style={s.daysRow}>
          {dayLabels.map((d, i) => (
            <TouchableOpacity key={i} style={[s.dayBtn, days.includes(i) && s.dayBtnActive]} onPress={() => toggleDay(i)}>
              <Text style={[s.dayBtnText, days.includes(i) && s.dayBtnTextActive]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={s.infoBox}>
          <Text style={s.infoTitle}>{t('create.briefingTitle')}</Text>
          <Text style={s.infoText}>{t('create.briefingDesc')}</Text>
        </View>
        <GlowButton title={saving ? t('create.saving') : t('create.save')} onPress={save} size="lg" disabled={saving} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  back: { color: Colors.textDim, fontSize: 14 },
  headerTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
  done: { color: Colors.blue, fontSize: 14, fontWeight: '600' },
  body: { flex: 1, padding: 20 },
  timeRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 24 },
  timeInput: { width: 90, fontSize: 48, fontWeight: '700', fontFamily: 'monospace', color: Colors.text, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: 16, textAlign: 'center', padding: 10 },
  timeColon: { fontSize: 40, fontFamily: 'monospace', color: Colors.blue },
  label: { fontSize: 11, fontWeight: '700', color: Colors.textDim, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, marginTop: 4 },
  input: { backgroundColor: Colors.bgInput, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 14, color: Colors.text, fontSize: 15, marginBottom: 16 },
  daysRow: { flexDirection: 'row', gap: 6, marginBottom: 20 },
  dayBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  dayBtnActive: { backgroundColor: 'rgba(59,130,246,0.12)', borderColor: Colors.blue },
  dayBtnText: { fontSize: 13, fontWeight: '600', color: Colors.textDim },
  dayBtnTextActive: { color: Colors.blue },
  infoBox: { backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 14, marginBottom: 20 },
  infoTitle: { fontSize: 12, color: Colors.blue, fontWeight: '600', marginBottom: 4 },
  infoText: { fontSize: 12, color: Colors.textDim, lineHeight: 18 },
});
