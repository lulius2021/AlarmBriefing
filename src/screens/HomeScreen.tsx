import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Colors } from '../theme/colors';
import { useAlarms } from '../hooks/useAlarms';
import { t, tDays, getTTSLang } from '../../lib/i18n';
import { Alarm } from '../types';

export function HomeScreen({ navigation }: any) {
  const { alarms, loading, loadAlarms, toggleAlarm } = useAlarms();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAlarms();
    setRefreshing(false);
  };

  const sorted = [...alarms].sort((a, b) =>
    a.active === b.active ? a.time.localeCompare(b.time) : a.active ? -1 : 1
  );
  const activeCount = alarms.filter(a => a.active).length;
  const next = sorted.find(a => a.active);
  const days = tDays();

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>Alarm<Text style={{ color: Colors.blue }}>Briefing</Text></Text>
          <Text style={s.sub}>
            {t('home.alarmsActive', {
              count: activeCount,
              plural: activeCount !== 1 ? t('home.alarmPlural') : t('home.alarmSingular'),
            })}
          </Text>
        </View>
        <TouchableOpacity style={s.iconBtn} onPress={() => navigation.navigate('Settings')}>
          <Text style={{ fontSize: 16 }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {next && (
        <View style={s.nextAlarm}>
          <Text style={{ fontSize: 26 }}>⏰</Text>
          <View>
            <Text style={s.naTime}>{next.time}</Text>
            <Text style={s.naLabel}>{next.name}</Text>
            <Text style={s.naBrief}>{t('home.briefingByBot')}</Text>
          </View>
        </View>
      )}

      <ScrollView
        style={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.blue} />}
      >
        {sorted.length === 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 40, opacity: 0.5 }}>⏰</Text>
            <Text style={s.emptyText}>{t('home.noAlarms')}</Text>
          </View>
        ) : (
          sorted.map(a => (
            <TouchableOpacity
              key={a.id}
              style={[s.card, !a.active && { opacity: 0.4 }]}
              onPress={() => navigation.navigate('AlarmDetail', { alarmId: a.id })}
            >
              <View>
                <Text style={s.alarmTime}>{a.time}</Text>
                <Text style={s.alarmMeta}>
                  {a.name} {a.managedBy === 'bot' && <Text style={s.botTag}>BOT</Text>}
                </Text>
                <View style={{ flexDirection: 'row', gap: 3, marginTop: 3 }}>
                  {(a.days?.length ? a.days : []).map(d => (
                    <View key={d} style={s.dayTag}>
                      <Text style={s.dayTagText}>{days[d]}</Text>
                    </View>
                  ))}
                  {(!a.days || a.days.length === 0) && (
                    <View style={s.dayTag}>
                      <Text style={s.dayTagText}>{t('home.oneTime')}</Text>
                    </View>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={[s.toggle, a.active && s.toggleOn]}
                onPress={() => toggleAlarm(a.id)}
              >
                <View style={[s.toggleDot, a.active && s.toggleDotOn]} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 80 }} />
      </ScrollView>

      <TouchableOpacity style={s.fab} onPress={() => navigation.navigate('AlarmEdit')}>
        <Text style={{ color: 'white', fontSize: 28, fontWeight: '300' }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text },
  sub: { fontSize: 12, color: Colors.textDim, marginTop: 2 },
  iconBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, justifyContent: 'center', alignItems: 'center' },
  nextAlarm: { marginHorizontal: 16, padding: 14, backgroundColor: 'rgba(59,130,246,0.08)', borderWidth: 1, borderColor: 'rgba(59,130,246,0.2)', borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  naTime: { fontSize: 28, fontWeight: '700', color: Colors.blueLight, fontFamily: 'monospace' },
  naLabel: { fontSize: 12, color: Colors.textDim },
  naBrief: { fontSize: 11, color: Colors.blue, marginTop: 1 },
  list: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, padding: 14, marginBottom: 8 },
  alarmTime: { fontSize: 28, fontWeight: '700', color: Colors.text, fontFamily: 'monospace' },
  alarmMeta: { fontSize: 12, color: Colors.textDim, marginTop: 2 },
  botTag: { fontSize: 9, fontWeight: '700', color: Colors.blue },
  dayTag: { backgroundColor: 'rgba(59,130,246,0.12)', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  dayTagText: { fontSize: 9, fontWeight: '600', color: Colors.blueLight },
  toggle: { width: 44, height: 24, borderRadius: 12, backgroundColor: Colors.border, justifyContent: 'center', paddingHorizontal: 3 },
  toggleOn: { backgroundColor: 'rgba(59,130,246,0.12)' },
  toggleDot: { width: 18, height: 18, borderRadius: 9, backgroundColor: Colors.textDim },
  toggleDotOn: { backgroundColor: Colors.blue, alignSelf: 'flex-end' },
  fab: { position: 'absolute', bottom: 30, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.blue, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.blue, shadowRadius: 20, shadowOpacity: 0.4, elevation: 8 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText: { color: Colors.textDim, textAlign: 'center', marginTop: 10, lineHeight: 20 },
});
