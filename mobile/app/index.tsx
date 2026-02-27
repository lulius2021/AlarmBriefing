import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { colors } from '@/lib/theme';
import { login, register, getToken } from '@/lib/api';

export default function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if already logged in
    getToken().then(token => {
      if (token) {
        const onboarded = SecureStore.getItemAsync('ab_onboarded');
        onboarded.then(v => {
          router.replace(v ? '/home' : '/onboarding');
        });
      } else {
        setLoading(false);
      }
    });
  }, []);

  const handleAuth = async () => {
    setError('');
    try {
      if (mode === 'register') {
        await register(email, password, name);
      } else {
        await login(email, password);
      }
      router.replace('/onboarding');
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (loading) return <View style={s.container}><Text style={s.title}>🔔</Text></View>;

  return (
    <View style={s.container}>
      <Text style={{ fontSize: 48, marginBottom: 12 }}>🔔</Text>
      <Text style={s.title}>Alarm<Text style={{ color: colors.blue }}>Briefing</Text></Text>
      <Text style={s.desc}>
        {mode === 'register'
          ? 'Erstelle einen Account um loszulegen.'
          : 'Melde dich mit deinem Account an.'}
      </Text>

      {mode === 'register' && (
        <TextInput
          style={s.input}
          placeholder="Name (optional)"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
      )}
      <TextInput
        style={s.input}
        placeholder="Email"
        placeholderTextColor={colors.textMuted}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={s.input}
        placeholder="Passwort (min. 8 Zeichen)"
        placeholderTextColor={colors.textMuted}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {!!error && <Text style={s.error}>{error}</Text>}

      <TouchableOpacity style={s.btn} onPress={handleAuth}>
        <Text style={s.btnText}>{mode === 'register' ? 'Registrieren' : 'Anmelden'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setMode(mode === 'register' ? 'login' : 'register')}>
        <Text style={s.switchText}>
          {mode === 'register' ? 'Schon registriert? ' : 'Noch kein Account? '}
          <Text style={{ color: colors.blue, fontWeight: '600' }}>
            {mode === 'register' ? 'Anmelden' : 'Registrieren'}
          </Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: colors.bg },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 4 },
  desc: { fontSize: 14, color: colors.textDim, marginBottom: 20, textAlign: 'center', maxWidth: 280 },
  input: { width: '100%', maxWidth: 300, padding: 14, backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.border, borderRadius: 12, color: colors.text, fontSize: 15, marginBottom: 10 },
  error: { color: colors.danger, fontSize: 13, marginBottom: 8 },
  btn: { width: '100%', maxWidth: 300, padding: 14, backgroundColor: colors.blue, borderRadius: 14, alignItems: 'center', marginTop: 4 },
  btnText: { color: 'white', fontSize: 16, fontWeight: '600' },
  switchText: { color: colors.textDim, fontSize: 14, marginTop: 16 },
});
