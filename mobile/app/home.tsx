import { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import { colors } from '@/lib/theme';
import { getAlarms, getLatestBriefing, clearToken } from '@/lib/api';

const DAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

interface Alarm {
  id: string;
  name: string;
  active: boolean;
  time: string;
  days: number[];
  managed_by: string;
  briefing_mode: string;
}

export default function HomeScreen() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [briefing, setBriefing] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const a = await getAlarms();
      setAlarms(a);
    } catch (e) {
      console.error(e);
    }
    try {
      const b = await getLatestBriefing();
      if (b.briefing?.content) setBriefing(b.briefing.content);
    } catch (e) {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const toggleSpeech = () => {
    if (speaking) {
      Speech.stop();
      setSpeaking(false);
    } else {
      const text = briefing || 'Noch kein Briefing vorhanden. Dein Bot wird eins erstellen.';
      Speech.speak(text, {
        language: 'de-DE',
        rate: 1.0,
        pitch: 0.9,
        onDone: () => setSpeaking(false),
      });
      setSpeaking(true);
    }
  };

  const sorted = [...alarms].sort((a, b) =>
    a.active === b.active ? a.time.localeCompare(b.time) : a.active ? -1 : 1
  );
  const active = alarms.filter(a => a.active);
  const next = sorted.find(a => a.active);

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.title}>Alarm<Text style={{ color: colors.blue }}>Briefing</Text></Text>
          <Text style={s.sub}>{active.length} Alarm{active.length !== 1 ? 'e' : ''} aktiv</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={s.iconBtn} onPress={() => router.push('/settings')}>
            <Text style={{ fontSize: 16 }}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Next Alarm */}
      {next && (
        <View style={s.nextAlarm}>
          <Text style={{ fontSize: 26 }}>⏰</Text>
          <View>
            <Text style={s.naTime}>{next.time}</Text>
            <Text style={s.naLabel}>{next.name}</Text>
            <Text style={s.naBrief}>🎙 Briefing wird vom Bot erstellt</Text>
          </View>
        </View>
      )}

      {/* Briefing Player */}
      {briefing && (
        <TouchableOpacity style={s.player} onPress={toggleSpeech}>
          <View style={s.playBtn}>
            <Text style={{ color: 'white', fontSize: 14 }}>{speaking ? '⏸' : '▶'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.playerTitle}>Morgenbriefing</Text>
            <Text style={s.playerSub} numberOfLines={1}>{briefing.substring(0, 60)}...</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Alarm List */}
      <ScrollView
        style={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.blue} />}
      >
        {sorted.length === 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 40, opacity: 0.5 }}>⏰</Text>
            <Text style={s.emptyText}>Noch keine Wecker.{'\n'}Tippe + oder lass deinen Bot einen erstellen.</Text>
          </View>
        ) : (
          sorted.map(a => (
            <View key={a.id} style={[s.card, !a.active && { opacity: 0.4 }]}>
              <View>
                <Text style={s.alarmTime}>{a.time}</Text>
                <Text style={s.alarmMeta}>
                  {a.name} {a.managed_by === 'bot' && <Text style={s.botTag}>BOT</Text>}
                </Text>
                <View style={{ flexDirection: 'row', gap: 3, marginTop: 3 }}>
                  {(a.days?.length ? a.days : []).map(d => (
                    <View key={d} style={s.dayTag}>
                      <Text style={s.dayTagText}>{DAYS[d]}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={[s.toggle, a.active && s.toggleOn]}>
                <View style={[s.toggleDot, a.active && s.toggleDotOn]} />
              </View>
            </View>
          ))
        )}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={s.fab} onPress={() => router.push('/create-alarm')}>
        <Text style={{ color: 'white', fontSize: 28, fontWeight: '300' }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  sub: { fontSize: 12, color: colors.textDim, marginTop: 2 },
  iconBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' },
  nextAlarm: { marginHorizontal: 16, padding: 14, backgroundColor: 'rgba(59,130,246,0.08)', borderWidth: 1, borderColor: 'rgba(59,130,246,0.2)', borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  naTime: { fontSize: 28, fontWeight: '700', color: colors.blueLight, fontFamily: 'monospace' },
  naLabel: { fontSize: 12, color: colors.textDim },
  naBrief: { fontSize: 11, color: colors.blue, marginTop: 1 },
  player: { marginHorizontal: 16, marginTop: 8, padding: 12, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: 'rgba(59,130,246,0.2)', borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  playBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.blue, justifyContent: 'center', alignItems: 'center' },
  playerTitle: { fontSize: 13, fontWeight: '600', color: colors.text },
  playerSub: { fontSize: 11, color: colors.textDim },
  list: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 14, marginBottom: 8 },
  alarmTime: { fontSize: 28, fontWeight: '700', color: colors.text, fontFamily: 'monospace' },
  alarmMeta: { fontSize: 12, color: colors.textDim, marginTop: 2 },
  botTag: { fontSize: 9, fontWeight: '700', color: colors.blue, backgroundColor: 'rgba(59,130,246,0.12)', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, overflow: 'hidden' },
  dayTag: { backgroundColor: 'rgba(59,130,246,0.12)', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  dayTagText: { fontSize: 9, fontWeight: '600', color: colors.blueLight },
  toggle: { width: 44, height: 24, borderRadius: 12, backgroundColor: colors.border, justifyContent: 'center', paddingHorizontal: 3 },
  toggleOn: { backgroundColor: 'rgba(59,130,246,0.12)' },
  toggleDot: { width: 18, height: 18, borderRadius: 9, backgroundColor: colors.textDim },
  toggleDotOn: { backgroundColor: colors.blue, alignSelf: 'flex-end' },
  fab: { position: 'absolute', bottom: 30, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.blue, justifyContent: 'center', alignItems: 'center', shadowColor: colors.blue, shadowRadius: 20, shadowOpacity: 0.4, elevation: 8 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText: { color: colors.textDim, textAlign: 'center', marginTop: 10, lineHeight: 20 },
});
