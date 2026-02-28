import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Colors, Shadows } from '../theme/colors';
import { GlowButton } from '../components/GlowButton';

interface LoginScreenProps {
  onLogin: (method: string, data?: any) => void;
  onSkip: () => void;
}

export function LoginScreen({ onLogin, onSkip }: LoginScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) return Alert.alert('Fehler', 'E-Mail und Passwort erforderlich');
    if (mode === 'register' && password.length < 6) return Alert.alert('Fehler', 'Passwort muss mindestens 6 Zeichen haben');

    setLoading(true);
    try {
      onLogin('email', { email: email.trim(), password, name: name.trim() || undefined, mode });
    } catch (e: any) {
      Alert.alert('Fehler', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <View style={styles.content}>
          <Text style={styles.icon}>🔑</Text>
          <Text style={styles.title}>{mode === 'login' ? 'Anmelden' : 'Registrieren'}</Text>
          <Text style={styles.desc}>
            {mode === 'login' ? 'Melde dich an um deine Wecker zu synchronisieren.' : 'Erstelle einen Account.'}
          </Text>

          {/* Social Buttons */}
          <View style={styles.socialButtons}>
            <GlowButton title=" Apple" onPress={() => onLogin('apple')} variant="outline" size="md" style={styles.socialBtn} />
            <GlowButton title=" Google" onPress={() => onLogin('google')} variant="outline" size="md" style={styles.socialBtn} />
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>oder</Text>
            <View style={styles.dividerLine} />
          </View>

          {mode === 'register' && (
            <TextInput style={styles.input} value={name} onChangeText={setName}
              placeholder="Name (optional)" placeholderTextColor={Colors.textMuted}
              autoCapitalize="words" />
          )}

          <TextInput style={styles.input} value={email} onChangeText={setEmail}
            placeholder="E-Mail" placeholderTextColor={Colors.textMuted}
            keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />

          <TextInput style={styles.input} value={password} onChangeText={setPassword}
            placeholder="Passwort" placeholderTextColor={Colors.textMuted}
            secureTextEntry />

          <GlowButton
            title={loading ? 'Laden...' : (mode === 'login' ? 'Anmelden' : 'Registrieren')}
            onPress={handleSubmit}
            size="lg"
            style={{ marginTop: 8 }}
            disabled={loading}
          />

          <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'register' : 'login')} style={styles.toggleMode}>
            <Text style={styles.toggleText}>
              {mode === 'login' ? 'Noch kein Account? Registrieren' : 'Schon registriert? Anmelden'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onSkip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Ohne Account fortfahren →</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  inner: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: 30 },
  icon: { fontSize: 48, textAlign: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.text, textAlign: 'center', marginBottom: 8 },
  desc: { fontSize: 14, color: Colors.textDim, textAlign: 'center', marginBottom: 24 },
  socialButtons: { flexDirection: 'row', gap: 10 },
  socialBtn: { flex: 1 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { color: Colors.textMuted, fontSize: 13, marginHorizontal: 12 },
  input: { backgroundColor: Colors.bgInput, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 16, color: Colors.text, fontSize: 15, marginBottom: 12 },
  toggleMode: { marginTop: 16, alignItems: 'center' },
  toggleText: { color: Colors.blue, fontSize: 14 },
  skipBtn: { marginTop: 20, alignItems: 'center' },
  skipText: { color: Colors.textDim, fontSize: 13 },
});
