import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from '@expo-google-fonts/poppins';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { AuthProvider } from '@/hooks/use-auth';
import { I18nProvider } from '@/hooks/use-i18n';
import { ChatSessionProvider } from '@/contexts/chat-session-context';
import { SettingsProvider } from '@/contexts/settings-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <I18nProvider>
        <ChatSessionProvider>
          <SettingsProvider>
            <ThemeProvider value={DefaultTheme}>
              <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="chat" />
                <Stack.Screen name="courses" />
              </Stack>
              <StatusBar style="dark" />
            </ThemeProvider>
          </SettingsProvider>
        </ChatSessionProvider>
      </I18nProvider>
    </AuthProvider>
  );
}
