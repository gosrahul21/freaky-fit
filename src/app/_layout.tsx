import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from '../contexts/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import { PostHogProvider } from 'posthog-react-native';
import { posthog } from '../lib/posthog';

SplashScreen.preventAutoHideAsync();

import { useEffect } from 'react';
import { initPurchases } from '../lib/purchases';

export default function RootLayout() {
  useEffect(() => {
    // Hide the splash screen after the root component mounts
    SplashScreen.hideAsync();

    // Initialize RevenueCat
    initPurchases();
  }, []);

  return (
    <PostHogProvider client={posthog}>
      <ThemeProvider>
        <InnerLayout />
      </ThemeProvider>
    </PostHogProvider>
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
