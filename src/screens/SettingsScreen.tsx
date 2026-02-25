import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity, SafeAreaView, Alert,
} from 'react-native';
import { Colors } from '../theme/colors';
import { GlowButton } from '../components/GlowButton';

export function SettingsScreen({ navigation }: any) {
  const [botKey, setBotKey] = useState('');
  const [botConnected, setBotConnected] = useState(false);
  const [voice, setVoice] = useState('Alloy');
  const [speechRate, setSpeechRate] = useState(1.0);
  const [briefingLength, setBriefingLength] = useState<'short' | 'standard' | 'long'>('standard');
  const [telemetry, setTelemetry] = useState(false);

  // Modules
  const [modules, setModules] = useState([
    { id: 'weather', name: 'Wetter', enabled: true, icon: '🌤' },
    { id: 'calendar', name: 'Kalender', enabled: true, icon: '📅' },
    { id: 'news', name: 'Nachrichten', enabled: true, icon: '📰' },
    { id: 'tasks', name: 'Aufgaben', enabled: false, icon: '✅' },
  ]);

  const toggleModule = (id: string) => {
    setModules(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
  };

  const testBotConnection = () => {
    if (!botKey.trim()) return Alert.alert('Fehler', 'Bitte Bot-Key eingeben');
    // Simulate
    setBotConnected(true);
    Alert.alert('Verbunden', 'Bot-Verbindung erfolgreich!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Zurück</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Einstellungen</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Bot Connection */}
        <Text style={styles.sectionTitle}>Bot-Verbindung</Text>
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <View style={[styles.dot, botConnected && styles.dotActive]} />
            <Text style={styles.statusText}>
              {botConnected ? 'Verbunden' : 'Nicht verbunden'}
            </Text>
          </View>
          <TextInput
            style={styles.input}
            value={botKey}
            onChangeText={setBotKey}
            placeholder="Bot-API-Key einfügen..."
            placeholderTextColor={Colors.textMuted}
            secureTextEntry
            autoCapitalize="none"
          />
          <GlowButton title="Verbindung testen" onPress={testBotConnection} size="sm" style={{ marginTop: 10 }} />
        </View>

        {/* Audio */}
        <Text style={styles.sectionTitle}>Audio</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Stimme</Text>
            <Text style={styles.rowValue}>{voice}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Sprechtempo</Text>
            <Text style={styles.rowValue}>{speechRate.toFixed(1)}x</Text>
          </View>
        </View>

        {/* Briefing Modules */}
        <Text style={styles.sectionTitle}>Briefing-Quellen</Text>
        <View style={styles.card}>
          {modules.map(m => (
            <View key={m.id} style={styles.row}>
              <View style={styles.moduleRow}>
                <Text style={styles.moduleIcon}>{m.icon}</Text>
                <Text style={styles.rowLabel}>{m.name}</Text>
              </View>
              <Switch
                value={m.enabled}
                onValueChange={() => toggleModule(m.id)}
                trackColor={{ false: Colors.border, true: Colors.blueMuted }}
                thumbColor={m.enabled ? Colors.blue : Colors.textDim}
              />
            </View>
          ))}
        </View>

        {/* Briefing Length */}
        <Text style={styles.sectionTitle}>Briefing-Länge (Standard)</Text>
        <View style={styles.card}>
          {(['short', 'standard', 'long'] as const).map(l => (
            <TouchableOpacity
              key={l}
              style={[styles.row, briefingLength === l && styles.rowActive]}
              onPress={() => setBriefingLength(l)}
            >
              <Text style={[styles.rowLabel, briefingLength === l && { color: Colors.blue }]}>
                {l === 'short' ? 'Kurz (10-30s)' : l === 'standard' ? 'Standard (1-3 min)' : 'Lang (3-5 min)'}
              </Text>
              {briefingLength === l && <Text style={{ color: Colors.blue }}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* Privacy */}
        <Text style={styles.sectionTitle}>Datenschutz</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Telemetrie</Text>
            <Switch
              value={telemetry}
              onValueChange={setTelemetry}
              trackColor={{ false: Colors.border, true: Colors.blueMuted }}
              thumbColor={telemetry ? Colors.blue : Colors.textDim}
            />
          </View>
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowLabel}>Daten exportieren</Text>
            <Text style={styles.rowChevron}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.row, { borderBottomWidth: 0 }]}>
            <Text style={[styles.rowLabel, { color: Colors.danger }]}>Account löschen</Text>
            <Text style={[styles.rowChevron, { color: Colors.danger }]}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Audit Log */}
        <Text style={styles.sectionTitle}>Bot-Aktivitäten</Text>
        <View style={styles.card}>
          <TouchableOpacity style={[styles.row, { borderBottomWidth: 0 }]}
            onPress={() => navigation.navigate('AuditLog')}
          >
            <Text style={styles.rowLabel}>Audit-Log anzeigen</Text>
            <Text style={styles.rowChevron}>→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { color: Colors.blue, fontSize: 15 },
  headerTitle: { color: Colors.text, fontSize: 17, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 60 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textDim,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
    marginTop: 20,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 4,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowActive: {
    backgroundColor: Colors.blueMuted,
  },
  rowLabel: {
    fontSize: 15,
    color: Colors.text,
  },
  rowValue: {
    fontSize: 15,
    color: Colors.textDim,
  },
  rowChevron: {
    fontSize: 16,
    color: Colors.textDim,
  },
  moduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  moduleIcon: {
    fontSize: 18,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.danger,
  },
  dotActive: {
    backgroundColor: Colors.success,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  statusText: {
    fontSize: 14,
    color: Colors.textDim,
  },
  input: {
    backgroundColor: Colors.bgInput,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    color: Colors.text,
    fontSize: 14,
    margin: 14,
    marginTop: 10,
    marginBottom: 0,
  },
});
