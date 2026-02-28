import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './src/screens/HomeScreen';
import { AlarmEditScreen } from './src/screens/AlarmEditScreen';
import { AlarmDetailScreen } from './src/screens/AlarmDetailScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { AuditLogScreen } from './src/screens/AuditLogScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { initTokens, getAccessToken } from './src/api/client';
import { setupNotificationChannel, requestPermissions } from './src/utils/alarmScheduler';

const Stack = createNativeStackNavigator();

type AppState = 'loading' | 'onboarding' | 'login' | 'app';

export default function App() {
  const [state, setState] = useState<AppState>('loading');

  useEffect(() => {
    async function boot() {
      await initTokens();
      await setupNotificationChannel();
      await requestPermissions();

      const token = getAccessToken();
      setState(token ? 'app' : 'onboarding');
    }
    boot();
  }, []);

  if (state === 'loading') return null;

  if (state === 'onboarding') {
    return <OnboardingScreen onComplete={() => setState('login')} />;
  }

  if (state === 'login') {
    return (
      <LoginScreen
        onLogin={(method, data) => {
          // TODO: wire up real auth
          setState('app');
        }}
        onSkip={() => setState('app')}
      />
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AlarmEdit" component={AlarmEditScreen} />
        <Stack.Screen name="AlarmDetail" component={AlarmDetailScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="AuditLog" component={AuditLogScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
