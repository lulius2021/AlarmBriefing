import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TextInput, Dimensions,
} from 'react-native';
import { Colors, Shadows } from '../theme/colors';
import { GlowButton } from '../components/GlowButton';

const { width } = Dimensions.get('window');

const STEPS = [
  {
    icon: '🔔',
    title: 'Willkommen bei\nAlarmBriefing',
    desc: 'Dein intelligenter Wecker mit Audio-Briefings.\nStarte den Tag informiert — automatisch.',
  },
  {
    icon: '🔑',
    title: 'Account erstellen',
    desc: 'Melde dich an, um deine Wecker zu synchronisieren.',
    hasLogin: true,
  },
  {
    icon: '🤖',
    title: 'Bot verbinden',
    desc: 'Verbinde deinen Clawdbot, damit er deine Wecker und Briefings verwalten kann.',
    hasBotKey: true,
  },
  {
    icon: '✅',
    title: 'Alles bereit!',
    desc: 'Dein Bot kann jetzt Wecker erstellen, Briefings generieren und deinen Morgen optimieren.',
  },
];

export function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [botKey, setBotKey] = useState('');
  const current = STEPS[step];

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else onComplete();
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress */}
      <View style={styles.progress}>
        {STEPS.map((_, i) => (
          <View key={i} style={[styles.progressDot, i <= step && styles.progressDotActive]} />
        ))}
      </View>

      <View style={styles.content}>
        <Text style={styles.icon}>{current.icon}</Text>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.desc}>{current.desc}</Text>

        {current.hasLogin && (
          <View style={styles.loginButtons}>
            <GlowButton title=" Mit Apple anmelden" onPress={next} style={styles.loginBtn} />
            <GlowButton title=" Mit Google anmelden" onPress={next} variant="outline" style={styles.loginBtn} />
            <GlowButton title="📧 Mit E-Mail anmelden" onPress={next} variant="outline" style={styles.loginBtn} />
          </View>
        )}

        {current.hasBotKey && (
          <View style={styles.botSection}>
            <TextInput
              style={styles.input}
              value={botKey}
              onChangeText={setBotKey}
              placeholder="Bot-API-Key einfügen..."
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="none"
            />
            <GlowButton
              title="Verbindung testen"
              onPress={next}
              size="sm"
              style={{ marginTop: 10 }}
            />
            <Text style={styles.skipText} onPress={next}>Später verbinden →</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        {step > 0 && (
          <GlowButton title="Zurück" onPress={back} variant="outline" size="md" />
        )}
        <View style={{ flex: 1 }} />
        {!current.hasLogin && !current.hasBotKey && (
          <GlowButton
            title={step === STEPS.length - 1 ? 'Loslegen' : 'Weiter'}
            onPress={next}
            size="md"
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  progress: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  progressDotActive: {
    backgroundColor: Colors.blue,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  icon: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 36,
  },
  desc: {
    fontSize: 15,
    color: Colors.textDim,
    textAlign: 'center',
    lineHeight: 22,
  },
  loginButtons: {
    width: '100%',
    marginTop: 30,
    gap: 10,
  },
  loginBtn: {
    width: '100%',
  },
  botSection: {
    width: '100%',
    marginTop: 30,
  },
  input: {
    backgroundColor: Colors.bgInput,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    color: Colors.text,
    fontSize: 15,
  },
  skipText: {
    color: Colors.textDim,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 10,
  },
});
