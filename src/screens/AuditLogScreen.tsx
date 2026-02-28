import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Colors } from '../theme/colors';

interface AuditEntry {
  id: string;
  actor: 'user' | 'bot';
  action: string;
  target: string;
  details?: string;
  timestamp: string;
}

export function AuditLogScreen({ navigation }: any) {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Demo data for now, will connect to API
    setLogs([
      { id: '1', actor: 'bot', action: 'POST /alarms', target: 'Morgenwecker', details: '06:30, Mo-Fr, Standardbriefing', timestamp: new Date().toISOString() },
      { id: '2', actor: 'bot', action: 'PATCH /alarms/abc', target: 'Workout', details: 'Zeit: 07:00 → 07:15', timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: '3', actor: 'bot', action: 'POST /briefings/generate', target: 'Morgenwecker', details: 'Module: Wetter, News, Kalender', timestamp: new Date(Date.now() - 7200000).toISOString() },
      { id: '4', actor: 'user', action: 'POST /alarms', target: 'Meeting Prep', details: '08:45, Mo-Fr', timestamp: new Date(Date.now() - 86400000).toISOString() },
    ]);
    setLoading(false);
  }, []);

  const renderEntry = ({ item }: { item: AuditEntry }) => (
    <View style={styles.entry}>
      <View style={styles.entryHeader}>
        <View style={[styles.actorBadge, item.actor === 'bot' ? styles.actorBot : styles.actorUser]}>
          <Text style={[styles.actorText, item.actor === 'bot' ? styles.actorBotText : styles.actorUserText]}>
            {item.actor.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.action}>{item.action}</Text>
      </View>
      <Text style={styles.target}>{item.target}</Text>
      {item.details && <Text style={styles.details}>{item.details}</Text>}
      <Text style={styles.time}>{new Date(item.timestamp).toLocaleString('de-DE')}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Zurück</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Audit-Log</Text>
        <View style={{ width: 60 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.blue} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={logs}
          keyExtractor={item => item.id}
          renderItem={renderEntry}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Keine Bot-Aktivitäten</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { color: Colors.blue, fontSize: 15 },
  headerTitle: { color: Colors.text, fontSize: 17, fontWeight: '600' },
  list: { padding: 20 },
  entry: { backgroundColor: Colors.bgCard, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 14, marginBottom: 10 },
  entryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  actorBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4 },
  actorBot: { backgroundColor: Colors.blueMuted },
  actorUser: { backgroundColor: 'rgba(34,197,94,0.12)' },
  actorText: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  actorBotText: { color: Colors.blue },
  actorUserText: { color: Colors.success },
  action: { fontSize: 13, color: Colors.text, fontWeight: '500' },
  target: { fontSize: 14, color: Colors.text, fontWeight: '600', marginTop: 2 },
  details: { fontSize: 12, color: Colors.textDim, marginTop: 4 },
  time: { fontSize: 11, color: Colors.textMuted, marginTop: 6 },
  emptyText: { color: Colors.textDim, textAlign: 'center', marginTop: 40 },
});
