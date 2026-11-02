import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { ThemeProvider } from '../contexts/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import { PostHogProvider } from 'posthog-react-native';
import { posthog } from '../lib/posthog';
import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { initPurchases } from '../lib/purchases';
import { pingBackendHealth } from '../lib/backend';
import { handleAuthRedirectUrl } from '../lib/auth';

WebBrowser.maybeCompleteAuthSession();
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Hide the splash screen after the root component mounts
    SplashScreen.hideAsync();

    // Initialize RevenueCat
    initPurchases();

    // Ping backend to wake up Render on app open
    pingBackendHealth();

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        pingBackendHealth();
      }
    });

    return () => {
      subscription.remove();
    };
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

  useEffect(() => {
    const handleUrl = (event: { url: string }) => {
      if (event.url && (event.url.includes('code=') || event.url.includes('access_token=') || event.url.includes('error='))) {
        handleAuthRedirectUrl(event.url);
      }
    };

    const sub = Linking.addEventListener('url', handleUrl);
    Linking.getInitialURL().then((url) => {
      if (url && (url.includes('code=') || url.includes('access_token=') || url.includes('error='))) {
        handleAuthRedirectUrl(url);
      }
    });

    return () => {
      sub.remove();
    };
  }, []);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

