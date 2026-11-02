import * as Linking from 'expo-linking';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { supabase } from './supabase';
import { checkIsPro } from './purchases';
import { identifyUser } from './posthog';

/**
 * Returns the exact OAuth redirect URI needed for Supabase and the native WebBrowser.
 * In standalone builds, Linking.createURL('') can return 'freakyfit:///' (with three slashes).
 * This causes exact prefix-matching in expo-web-browser on Android to fail when Supabase returns 'freakyfit://'.
 * Normalizing it to 'freakyfit://' ensures compatibility across platforms.
 */
export function getOAuthRedirectUrl(): string {
  const url = Linking.createURL('');
  if (url.startsWith('freakyfit:/')) {
    return 'freakyfit://';
  }
  return url;
}

export interface AuthParams {
  code: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  error: string | null;
  errorDescription: string | null;
}

/**
 * Robustly parses auth tokens or authorization codes from deep link URLs,
 * whether they come in via search params (?code=...) or hash fragments (#access_token=...).
 */
export function extractAuthParams(url: string): AuthParams {
  let code: string | null = null;
  let accessToken: string | null = null;
  let refreshToken: string | null = null;
  let error: string | null = null;
  let errorDescription: string | null = null;

  try {
    const parsed = new URL(url);
    code = parsed.searchParams.get('code');
    error = parsed.searchParams.get('error');
    errorDescription = parsed.searchParams.get('error_description') || error;

    if (parsed.hash) {
      const hashParams = new URLSearchParams(parsed.hash.replace(/^#/, ''));
      if (!accessToken) accessToken = hashParams.get('access_token');
      if (!refreshToken) refreshToken = hashParams.get('refresh_token');
      if (!errorDescription) {
        errorDescription = hashParams.get('error_description') || hashParams.get('error');
      }
    }
  } catch {
    // Regex fallback for non-standard custom schemes
  }

  if (!code) {
    const codeMatch = url.match(/[?&]code=([^&#]+)/);
    if (codeMatch) code = decodeURIComponent(codeMatch[1]);
  }
  if (!accessToken) {
    const accessMatch = url.match(/[#?&]access_token=([^&#]+)/);
    if (accessMatch) accessToken = decodeURIComponent(accessMatch[1]);
  }
  if (!refreshToken) {
    const refreshMatch = url.match(/[#?&]refresh_token=([^&#]+)/);
    if (refreshMatch) refreshToken = decodeURIComponent(refreshMatch[1]);
  }
  if (!errorDescription) {
    const descMatch = url.match(/[#?&]error_description=([^&#]+)/) || url.match(/[#?&]error=([^&#]+)/);
    if (descMatch) errorDescription = decodeURIComponent(descMatch[1].replace(/\+/g, ' '));
  }

  return { code, accessToken, refreshToken, error, errorDescription };
}

let lastHandledUrl: string | null = null;
let isHandlingAuth = false;

/**
 * Handles incoming auth redirect URLs by exchanging code or setting session,
 * syncing profile data, and redirecting to the right destination (/home or /paywall).
 */
export async function handleAuthRedirectUrl(url: string): Promise<boolean> {
  if (!url) return false;
  if (lastHandledUrl === url || isHandlingAuth) {
    return true;
  }

  const { code, accessToken, refreshToken, errorDescription } = extractAuthParams(url);

  if (errorDescription) {
    console.error('[Auth] OAuth error callback:', errorDescription);
    Alert.alert('Sign-In Error', errorDescription);
    return false;
  }

  if (!code && !(accessToken && refreshToken)) {
    return false;
  }

  isHandlingAuth = true;
  lastHandledUrl = url;

  try {
    let sessionData: any = null;

    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error('[Auth] Failed to exchange code for session:', error.message);
        Alert.alert('Authentication Error', error.message);
        return false;
      }
      sessionData = data;
    } else if (accessToken && refreshToken) {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) {
        console.error('[Auth] Failed to set session:', error.message);
        Alert.alert('Authentication Error', error.message);
        return false;
      }
      sessionData = data;
    }

    if (sessionData?.session) {
      const user = sessionData.session.user;
      const userMeta = user.user_metadata;

      identifyUser(user.id, {
        email: user.email,
        name: userMeta?.full_name || user.email?.split('@')[0],
      });

      // Check if they are a returning FreakyFit user
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!profile) {
        console.log('[Auth] New user detected, creating profile...');
        const [
          gender,
          age,
          height_cm,
          weight_kg,
          primary_goal,
          training_frequency,
          target_muscles,
          referral_source,
        ] = await Promise.all([
          AsyncStorage.getItem('@onboarding_gender').then((v) => (v ? JSON.parse(v) : null)),
          AsyncStorage.getItem('@onboarding_age').then((v) => (v ? JSON.parse(v) : null)),
          AsyncStorage.getItem('@onboarding_height_cm').then((v) => (v ? JSON.parse(v) : null)),
          AsyncStorage.getItem('@onboarding_weight_kg').then((v) => (v ? JSON.parse(v) : null)),
          AsyncStorage.getItem('@onboarding_primary_goal').then((v) => (v ? JSON.parse(v) : null)),
          AsyncStorage.getItem('@onboarding_training_frequency').then((v) => (v ? JSON.parse(v) : null)),
          AsyncStorage.getItem('@onboarding_target_muscles').then((v) => (v ? JSON.parse(v) : null)),
          AsyncStorage.getItem('@onboarding_referral_source'),
        ]);

        const { error: insertError } = await supabase.from('profiles').insert([
          {
            id: user.id,
            display_name: userMeta?.full_name || user.email?.split('@')[0] || 'FreakyFit Athlete',
            avatar_url: userMeta?.avatar_url || null,
            gender,
            age,
            height_cm,
            weight_kg,
            primary_goal,
            training_frequency,
            target_muscles,
            referral_source,
            updated_at: new Date().toISOString(),
          },
        ]);

        if (insertError) {
          console.error('[Auth] Failed to create profile:', insertError.message);
        }
      }

      const isPro = await checkIsPro(user.id);
      router.replace(isPro ? '/home' : '/paywall');
      return true;
    }

    return false;
  } catch (err: any) {
    console.error('[Auth] Exception while handling auth URL:', err);
    Alert.alert('Sign-In Error', err?.message || 'Could not complete authentication.');
    return false;
  } finally {
    isHandlingAuth = false;
  }
}
