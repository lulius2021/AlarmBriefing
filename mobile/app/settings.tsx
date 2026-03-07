import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Linking } from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as Clipboard from 'expo-clipboard';
import { colors } from '@/lib/theme';
import { generateBotKey, deleteAccount, clearToken } from '@/lib/api';
import { t } from '@/lib/i18n';

const API_URL = 'https://alarm-briefing.vercel.app';

export default function SettingsScreen() {
  const [email, setEmail] = useState('-');
  const [botKey, setBotKey] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync('ab_user').then(u => { if (u) setEmail(JSON.parse(u).email); });
  }, []);

  const genKey = async () => {
    setGenerating(true);
    try { const data = await generateBotKey(); setBotKey(data.key); }
    catch (e: any) { Alert.alert(t.error, e.message); }
    setGenerating(false);
  };

  const copyKey = async () => {
    if (botKey) { await Clipboard.setStringAsync(botKey); Alert.alert(t.copied, t.copiedMsg); }
  };

  const logout = async () => { await clearToken(); router.replace('/'); };

  const handleDelete = () => {
    Alert.alert(t.deleteAccount, t.deleteConfirm, [
      { text: t.cancel, style: 'cancel' },
      { text: t.deleteAccount, style: 'destructive', onPress: async () => {
        try { await deleteAccount(); router.replace('/'); }
        catch (e: any) { Alert.alert(t.error, e.message); }
      }},
    ]);
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={s.back}>← {t.back}</Text></TouchableOpacity>
        <Text style={s.headerTitle}>{t.settings}</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView style={s.body}>
        <Text style={s.section}>{t.botConnection}</Text>
        <View style={s.card}>
          <View style={s.explain}><Text style={s.explainText}>{t.botConnectionDesc}</Text></View>
          {botKey && (<TouchableOpacity style={s.keyBox} onPress={copyKey}><Text style={s.keyText}>{botKey}</Text></TouchableOpacity>)}
          <View style={s.cardActions}>
            <TouchableOpacity style={s.actionBtn} onPress={genKey} disabled={generating}>
              <Text style={s.actionBtnText}>{generating ? '...' : t.newKey}</Text>
            </TouchableOpacity>
            {botKey && (<TouchableOpacity style={s.actionBtnSecondary} onPress={copyKey}><Text style={s.actionBtnSecondaryText}>{t.copy}</Text></TouchableOpacity>)}
          </View>
        </View>

        <Text style={s.section}>{t.account}</Text>
        <View style={s.card}>
          <View style={s.row}><Text style={s.rowLabel}>{t.email}</Text><Text style={s.rowDim}>{email}</Text></View>
          <TouchableOpacity style={s.row} onPress={logout}><Text style={s.rowLabel}>{t.logout}</Text><Text style={s.rowDim}>→</Text></TouchableOpacity>
          <TouchableOpacity style={[s.row, { borderBottomWidth: 0 }]} onPress={handleDelete}>
            <Text style={[s.rowLabel, { color: colors.danger }]}>{t.deleteAccount}</Text><Text style={{ color: colors.danger }}>→</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.section}>{t.legal}</Text>
        <View style={s.card}>
          <TouchableOpacity style={s.row} onPress={() => Linking.openURL(`${API_URL}/privacy.html`)}><Text style={s.rowLabel}>{t.privacy}</Text><Text style={s.rowDim}>→</Text></TouchableOpacity>
          <TouchableOpacity style={s.row} onPress={() => Linking.openURL(`${API_URL}/terms.html`)}><Text style={s.rowLabel}>{t.terms}</Text><Text style={s.rowDim}>→</Text></TouchableOpacity>
          <TouchableOpacity style={s.row} onPress={() => Linking.openURL(`${API_URL}/imprint.html`)}><Text style={s.rowLabel}>{t.imprint}</Text><Text style={s.rowDim}>→</Text></TouchableOpacity>
          <TouchableOpacity style={[s.row, { borderBottomWidth: 0 }]} onPress={() => Linking.openURL(`${API_URL}/support.html`)}><Text style={s.rowLabel}>{t.support}</Text><Text style={s.rowDim}>→</Text></TouchableOpacity>
        </View>

        <Text style={s.version}>AlarmBriefing v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  back: { color: colors.blue, fontSize: 14, fontWeight: '500' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  body: { flex: 1, paddingHorizontal: 16 },
  section: { fontSize: 11, fontWeight: '700', color: colors.textDim, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 20, marginBottom: 8 },
  card: { backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, borderRadius: 14, overflow: 'hidden' },
  explain: { padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: 'rgba(59,130,246,0.03)' },
  explainText: { fontSize: 12, color: colors.textDim, lineHeight: 18 },
  keyBox: { padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.bgInput },
  keyText: { fontFamily: 'monospace', fontSize: 11, color: colors.blueLight, textAlign: 'center' },
  cardActions: { flexDirection: 'row', gap: 8, padding: 12 },
  actionBtn: { flex: 1, padding: 10, backgroundColor: colors.blue, borderRadius: 10, alignItems: 'center' },
  actionBtnText: { color: 'white', fontWeight: '600', fontSize: 13 },
  actionBtnSecondary: { flex: 1, padding: 10, backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.border, borderRadius: 10, alignItems: 'center' },
  actionBtnSecondaryText: { color: colors.text, fontWeight: '600', fontSize: 13 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { fontSize: 14, color: colors.text },
  rowDim: { fontSize: 13, color: colors.textDim },
  version: { textAlign: 'center', fontSize: 12, color: colors.textMuted, paddingVertical: 20 },
});
