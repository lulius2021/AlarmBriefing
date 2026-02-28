import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Colors } from '../theme/colors';
import { GlowButton } from '../components/GlowButton';
import { t } from '../../lib/i18n';
import { createBotKey } from '../api/client';

interface Props {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [botKey, setBotKey] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

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

  const copyKey = async () => {
    if (botKey) {
      await Clipboard.setStringAsync(botKey);
      Alert.alert(t('settings.copied'));
    }
  };

  const steps = [
    {
      icon: '🔔',
      title: t('ob.welcome.title'),
      desc: t('ob.welcome.desc'),
      content: (
        <View style={s.box}>
          <Text style={s.boxTitle}>{t('ob.welcome.howTitle')}</Text>
          <Text style={s.boxDesc}>{t('ob.welcome.how1')}</Text>
          <Text style={s.boxDesc}>{t('ob.welcome.how2')}</Text>
          <Text style={s.boxDesc}>{t('ob.welcome.how3')}</Text>
          <Text style={s.boxDesc}>{t('ob.welcome.how4')}</Text>
        </View>
      ),
    },
    {
      icon: '🔑',
      title: t('ob.connect.title'),
      desc: t('ob.connect.desc'),
      content: botKey ? (
        <View style={s.box}>
          <Text style={s.boxTitle}>{t('ob.connect.generated')}</Text>
          <Text style={s.boxDesc}>{t('ob.connect.copyHint')}</Text>
          <TouchableOpacity style={s.keyBox} onPress={copyKey}>
            <Text style={s.keyText}>{botKey}</Text>
          </TouchableOpacity>
          <Text style={s.hint}>{t('ob.connect.tapCopy')}</Text>
        </View>
      ) : (
        <View style={s.box}>
          <Text style={s.boxTitle}>{t('ob.connect.genTitle')}</Text>
          <Text style={s.boxDesc}>{t('ob.connect.genDesc')}</Text>
          <GlowButton
            title={generating ? t('ob.connect.generating') : t('ob.connect.genBtn')}
            onPress={genKey}
            disabled={generating}
            size="md"
            style={{ marginTop: 10 }}
          />
        </View>
      ),
    },
    {
      icon: '✅',
      title: t('ob.ready.title'),
      desc: t('ob.ready.desc'),
      content: (
        <View style={s.box}>
          <Text style={s.boxTitle}>{t('ob.ready.whatTitle')}</Text>
          <Text style={s.boxDesc}>{t('ob.ready.what1')}</Text>
          <Text style={s.boxDesc}>{t('ob.ready.what2')}</Text>
          <Text style={s.boxDesc}>{t('ob.ready.what3')}</Text>
          <Text style={s.boxDesc}>{t('ob.ready.what4')}</Text>
        </View>
      ),
    },
  ];

  const current = steps[step];

  return (
    <View style={s.container}>
      <View style={s.progress}>
        {steps.map((_, i) => (
          <View key={i} style={[s.dot, i <= step && s.dotActive, i === step && s.dotCurrent]} />
        ))}
      </View>
      <View style={s.body}>
        <Text style={s.icon}>{current.icon}</Text>
        <Text style={s.title}>{current.title}</Text>
        <Text style={s.desc}>{current.desc}</Text>
        {current.content}
      </View>
      <View style={s.footer}>
        {step > 0 && (
          <GlowButton title={t('ob.back')} onPress={() => setStep(step - 1)} variant="outline" style={{ flex: 0.5 }} />
        )}
        <GlowButton
          title={step === steps.length - 1 ? t('ob.startApp') : step === 1 && !botKey ? t('ob.connect.laterBtn') : t('ob.next')}
          onPress={() => (step < steps.length - 1 ? setStep(step + 1) : onComplete())}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg, padding: 24 },
  progress: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 20, marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.blue },
  dotCurrent: { width: 24, shadowColor: Colors.blue, shadowRadius: 8, shadowOpacity: 0.5 },
  body: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 52, marginBottom: 14 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.text, textAlign: 'center', marginBottom: 8 },
  desc: { fontSize: 14, color: Colors.textDim, textAlign: 'center', lineHeight: 22, maxWidth: 300, marginBottom: 16 },
  box: { backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, padding: 16, width: '100%', maxWidth: 320 },
  boxTitle: { fontSize: 12, fontWeight: '700', color: Colors.blue, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  boxDesc: { fontSize: 13, color: Colors.textDim, lineHeight: 20, marginBottom: 3 },
  keyBox: { backgroundColor: Colors.bgInput, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 12, marginTop: 8 },
  keyText: { fontFamily: 'monospace', fontSize: 11, color: Colors.blueLight, textAlign: 'center' },
  hint: { fontSize: 11, color: Colors.textMuted, textAlign: 'center', marginTop: 6 },
  footer: { flexDirection: 'row', gap: 10, paddingTop: 12 },
});
