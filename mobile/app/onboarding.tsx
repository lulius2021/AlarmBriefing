import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as Clipboard from 'expo-clipboard';
import { colors } from '@/lib/theme';
import { generateBotKey } from '@/lib/api';
import { t } from '@/lib/i18n';

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [botKey, setBotKey] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const genKey = async () => {
    setGenerating(true);
    try { const data = await generateBotKey(); setBotKey(data.key); }
    catch (e: any) { Alert.alert(t.error, e.message); }
    setGenerating(false);
  };

  const copyKey = async () => {
    if (botKey) { await Clipboard.setStringAsync(botKey); Alert.alert(t.copied, t.copiedMsg); }
  };

  const finish = async () => { await SecureStore.setItemAsync('ab_onboarded', '1'); router.replace('/home'); };

  const steps = [
    { icon: '🔔', title: t.welcomeTitle, desc: t.welcomeDesc, content: null },
    {
      icon: '🔑', title: t.connectBot, desc: t.connectBotDesc,
      content: (
        <View style={s.box}>
          {botKey ? (
            <>
              <Text style={s.boxTitle}>{t.keyGenerated}</Text>
              <Text style={s.boxDesc}>{t.copyKeyDesc}</Text>
              <TouchableOpacity style={s.keyBox} onPress={copyKey}><Text style={s.keyText}>{botKey}</Text></TouchableOpacity>
              <Text style={s.hint}>{t.tapToCopy}</Text>
            </>
          ) : (
            <>
              <Text style={s.boxTitle}>{t.generateApiKey}</Text>
              <Text style={s.boxDesc}>{t.generateKeyDesc}</Text>
              <TouchableOpacity style={s.genBtn} onPress={genKey} disabled={generating}>
                <Text style={s.genBtnText}>{generating ? t.generating : t.generateKey}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      ),
    },
    {
      icon: '✅', title: t.allReady, desc: t.allReadyDesc,
      content: (
        <View style={s.box}>
          <Text style={s.boxTitle}>{t.botCan}</Text>
          <Text style={s.boxDesc}>{t.botCan1}</Text>
          <Text style={s.boxDesc}>{t.botCan2}</Text>
          <Text style={s.boxDesc}>{t.botCan3}</Text>
          <Text style={s.boxDesc}>{t.botCan4}</Text>
        </View>
      ),
    },
  ];

  const current = steps[step];

  return (
    <View style={s.container}>
      <View style={s.progress}>
        {steps.map((_, i) => <View key={i} style={[s.dot, i <= step && s.dotActive, i === step && s.dotCurrent]} />)}
      </View>
      <View style={s.body}>
        <Text style={s.icon}>{current.icon}</Text>
        <Text style={s.title}>{current.title}</Text>
        <Text style={s.desc}>{current.desc}</Text>
        {current.content}
      </View>
      <View style={s.footer}>
        {step > 0 && (
          <TouchableOpacity style={s.btnSecondary} onPress={() => setStep(step - 1)}>
            <Text style={s.btnSecondaryText}>{t.back}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[s.btn, { flex: 1 }]} onPress={() => step < steps.length - 1 ? setStep(step + 1) : finish()}>
          <Text style={s.btnText}>{step === steps.length - 1 ? t.startApp : step === 1 && !botKey ? t.connectLater : t.next}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 24 },
  progress: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 20, marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.blue },
  dotCurrent: { width: 24, shadowColor: colors.blue, shadowRadius: 8, shadowOpacity: 0.5 },
  body: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 52, marginBottom: 14 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 8 },
  desc: { fontSize: 14, color: colors.textDim, textAlign: 'center', lineHeight: 22, maxWidth: 300, marginBottom: 16 },
  box: { backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 16, width: '100%', maxWidth: 320 },
  boxTitle: { fontSize: 12, fontWeight: '700', color: colors.blue, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  boxDesc: { fontSize: 13, color: colors.textDim, lineHeight: 20, marginBottom: 3 },
  keyBox: { backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, marginTop: 8 },
  keyText: { fontFamily: 'monospace', fontSize: 11, color: colors.blueLight, textAlign: 'center' },
  hint: { fontSize: 11, color: colors.textMuted, textAlign: 'center', marginTop: 6 },
  genBtn: { backgroundColor: colors.blue, borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 10 },
  genBtnText: { color: 'white', fontWeight: '600', fontSize: 14 },
  footer: { flexDirection: 'row', gap: 10, paddingTop: 12 },
  btn: { padding: 14, backgroundColor: colors.blue, borderRadius: 14, alignItems: 'center' },
  btnText: { color: 'white', fontSize: 15, fontWeight: '600' },
  btnSecondary: { padding: 14, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, borderRadius: 14, flex: 0.5, alignItems: 'center' },
  btnSecondaryText: { color: colors.text, fontSize: 15, fontWeight: '600' },
});
