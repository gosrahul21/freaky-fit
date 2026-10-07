import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from '../contexts/ThemeContext';
import { StatusBar } from 'expo-status-bar';

SplashScreen.preventAutoHideAsync();

import { useEffect } from 'react';
import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

export default function RootLayout() {
  useEffect(() => {
    // Hide the splash screen after the root component mounts
    SplashScreen.hideAsync();

    // Initialize RevenueCat
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    const iosApiKey = process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY || '';
    const androidApiKey = process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY || '';

    if (Platform.OS === 'ios') {
      Purchases.configure({ apiKey: iosApiKey });
    } else if (Platform.OS === 'android') {
      Purchases.configure({ apiKey: androidApiKey });
    }
  }, []);

  return (
    <ThemeProvider>
      <InnerLayout />
    </ThemeProvider>
  );
}

function InnerLayout() {
  // We import useTheme inside a child so it can read the context
  const { isDark } = require('../contexts/ThemeContext').useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
