import { Stack, usePathname, useRootNavigationState, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { ShareIntentProvider, useShareIntentContext } from 'expo-share-intent';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import { PostHogProvider } from 'posthog-react-native';
import { posthog } from '../lib/posthog';
import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { initPurchases } from '../lib/purchases';
import { pingBackendHealth } from '../lib/backend';
import { handleAuthRedirectUrl } from '../lib/auth';
import { Provider } from 'react-redux';
import { store } from '../store';
import { setAuthSession, clearAuth, fetchUserProfile } from '../store/slices/authSlice';
import { supabase } from '../lib/supabase';

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

    // Initial user fetch into Redux store
    store.dispatch(fetchUserProfile());

    // Listen to Supabase auth changes and keep Redux in sync
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          store.dispatch(setAuthSession({ user: session.user, session }));
          store.dispatch(fetchUserProfile());
        } else if (event === 'SIGNED_OUT') {
          store.dispatch(clearAuth());
        }
      }
    );

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        pingBackendHealth();
      }
    });

    return () => {
      authSub.unsubscribe();
      subscription.remove();
    };
  }, []);

  return (
    <Provider store={store}>
      <ShareIntentProvider>
        <PostHogProvider client={posthog}>
          <ThemeProvider>
            <InnerLayout />
          </ThemeProvider>
        </PostHogProvider>
      </ShareIntentProvider>
    </Provider>
  );
}

const URL_REGEX = /https?:\/\/[^\s]+/i;

function extractSharedUrl(webUrl?: string | null, text?: string | null): string | null {
  if (webUrl) {
    const match = webUrl.match(URL_REGEX);
    if (match) return match[0];
  }
  if (text) {
    const match = text.match(URL_REGEX);
    if (match) return match[0];
  }
  return null;
}

function InnerLayout() {
  const { isDark } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const rootNavigationState = useRootNavigationState();
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext();

  useEffect(() => {
    if (!hasShareIntent || !rootNavigationState?.key) return;

    // Wait until the user is past splash/auth/onboarding/paywall before opening importer
    const isBlockedRoute =
      pathname === '/' ||
      pathname === '/paywall' ||
      pathname === '/welcome' ||
      pathname.startsWith('/auth') ||
      pathname.startsWith('/onboarding');
    if (isBlockedRoute) return;

    const sharedUrl = extractSharedUrl(shareIntent.webUrl, shareIntent.text);
    if (!sharedUrl) {
      resetShareIntent();
      return;
    }

    if (pathname === '/importer') {
      router.setParams({ sharedUrl });
    } else {
      router.push({ pathname: '/importer', params: { sharedUrl } });
    }
    resetShareIntent();
  }, [hasShareIntent, shareIntent, pathname, rootNavigationState?.key, router, resetShareIntent]);

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

