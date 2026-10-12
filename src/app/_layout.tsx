import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from '../contexts/ThemeContext';
import { StatusBar } from 'expo-status-bar';

SplashScreen.preventAutoHideAsync();

import { useEffect } from 'react';
import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import Constants, { ExecutionEnvironment } from 'expo-constants';

export default function RootLayout() {
  useEffect(() => {
    // Hide the splash screen after the root component mounts
    SplashScreen.hideAsync();

    // Initialize RevenueCat
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    const iosApiKey = process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY || '';
    const androidApiKey = process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY || '';
    const isExpoGo =
      Constants.appOwnership === 'expo' ||
      Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

    try {
      if (isExpoGo) {
        // Expo Go cannot access native Google Play or App Store billing.
        // It requires a RevenueCat Test Store key (starts with 'test_').
        const testKey =
          (iosApiKey.startsWith('test_') ? iosApiKey : '') ||
          (androidApiKey.startsWith('test_') ? androidApiKey : '');

        if (testKey) {
          Purchases.configure({ apiKey: testKey });
        } else {
          console.warn(
            '[RevenueCat] Running in Expo Go requires a Test Store key (starts with test_).'
          );
        }
      } else {
        if (Platform.OS === 'ios' && iosApiKey) {
          Purchases.configure({ apiKey: iosApiKey });
        } else if (Platform.OS === 'android' && androidApiKey) {
          Purchases.configure({ apiKey: androidApiKey });
        }
      }
    } catch (error) {
      console.warn('[RevenueCat] Purchases.configure failed:', error);
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
