import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Linking } from 'react-native';
import { Colors } from '../theme/colors';
import { t } from '../../lib/i18n';
import { api, clearTokens, createBotKey } from '../api/client';

const API_URL = 'https://alarm-briefing.vercel.app';

export function SettingsScreen({ navigation }: any) {
  const [email, setEmail] = useState('-');
  const [botKey, setBotKey] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    api('/api/auth/me').then(d => setEmail(d.user?.email || '-')).catch(() => {});
  }, []);

  const genKey = async () => {
    setGenerating(true);
    try {
      const data = await createBotKey();
      setBotKey(data.key);
    } catch (e: any) {
      Alert.alert(t('common.error'), e.message);
    }
    setGenerating(false);
  };

  const logout = async () => {
    await clearTokens();
    // Navigate to auth - parent will handle this
  };

  const handleDelete = () => {
    Alert.alert(
      t('settings.deleteConfirmTitle'),
      t('settings.deleteConfirmMsg'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'), style: 'destructive',
          onPress: async () => {
            try {
              await api('/api/auth/account', { method: 'DELETE' });
              await clearTokens();
            } catch (e: any) {
              Alert.alert(t('common.error'), e.message);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>{t('settings.back')}</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t('settings.title')}</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView style={s.body}>
        <Text style={s.section}>{t('settings.botConnection')}</Text>
        <View style={s.card}>
          <View style={s.explain}>
            <Text style={s.explainText}>{t('settings.botExplain')}</Text>
          </View>
          {botKey && (
            <TouchableOpacity style={s.keyBox} onPress={() => {/* copy */}}>
              <Text style={s.keyText}>{botKey}</Text>
            </TouchableOpacity>
          )}
          <View style={s.cardActions}>
            <TouchableOpacity style={s.actionBtn} onPress={genKey} disabled={generating}>
              <Text style={s.actionBtnText}>{generating ? '...' : t('settings.newKey')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={s.section}>{t('settings.account')}</Text>
        <View style={s.card}>
          <View style={s.row}><Text style={s.rowLabel}>{t('settings.email')}</Text><Text style={s.rowDim}>{email}</Text></View>
          <TouchableOpacity style={s.row} onPress={logout}>
            <Text style={s.rowLabel}>{t('settings.logout')}</Text><Text style={s.rowDim}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.row, { borderBottomWidth: 0 }]} onPress={handleDelete}>
            <Text style={[s.rowLabel, { color: Colors.danger }]}>{t('settings.deleteAccount')}</Text>
            <Text style={{ color: Colors.danger }}>→</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.section}>{t('settings.legal')}</Text>
        <View style={s.card}>
          <TouchableOpacity style={s.row} onPress={() => Linking.openURL(`${API_URL}/privacy.html`)}>
            <Text style={s.rowLabel}>{t('settings.privacy')}</Text><Text style={s.rowDim}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.row} onPress={() => Linking.openURL(`${API_URL}/terms.html`)}>
            <Text style={s.rowLabel}>{t('settings.terms')}</Text><Text style={s.rowDim}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.row, { borderBottomWidth: 0 }]} onPress={() => Linking.openURL(`${API_URL}/support.html`)}>
            <Text style={s.rowLabel}>{t('settings.support')}</Text><Text style={s.rowDim}>→</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.version}>AlarmBriefing v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  back: { color: Colors.blue, fontSize: 14, fontWeight: '500' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
  body: { flex: 1, paddingHorizontal: 16 },
  section: { fontSize: 11, fontWeight: '700', color: Colors.textDim, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 20, marginBottom: 8 },
  card: { backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, overflow: 'hidden' },
  explain: { padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  explainText: { fontSize: 12, color: Colors.textDim, lineHeight: 18 },
  keyBox: { padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.bgInput },
  keyText: { fontFamily: 'monospace', fontSize: 11, color: Colors.blueLight, textAlign: 'center' },
  cardActions: { flexDirection: 'row', gap: 8, padding: 12 },
  actionBtn: { flex: 1, padding: 10, backgroundColor: Colors.blue, borderRadius: 10, alignItems: 'center' },
  actionBtnText: { color: 'white', fontWeight: '600', fontSize: 13 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowLabel: { fontSize: 14, color: Colors.text },
  rowDim: { fontSize: 13, color: Colors.textDim },
  version: { textAlign: 'center', fontSize: 12, color: Colors.textMuted, paddingVertical: 20 },
});
