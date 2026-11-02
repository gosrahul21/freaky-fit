import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Zap, Mail } from 'lucide-react-native';
import { GoogleIcon, AppleIcon } from '../components/icons';

import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_LINKS, openWebUrl } from '../constants/links';
import { checkIsPro } from '../lib/purchases';
import { identifyUser } from '../lib/posthog';
import { getOAuthRedirectUrl, handleAuthRedirectUrl } from '../lib/auth';

WebBrowser.maybeCompleteAuthSession();

export default function WelcomeScreen() {
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const router = useRouter();
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleContinue = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      identifyUser(session.user.id, { email: session.user.email });
      const isPro = await checkIsPro(session.user.id);
      router.replace(isPro ? '/home' : '/paywall');
    } else {
      router.replace('/paywall');
    }
  };

  React.useEffect(() => {
    if (Platform.OS === 'android') {
      WebBrowser.warmUpAsync();
    }
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        identifyUser(session.user.id, { email: session.user.email });
        const isPro = await checkIsPro(session.user.id);
        router.replace(isPro ? '/home' : '/paywall');
      }
    };
    checkSession();

    return () => {
      if (Platform.OS === 'android') {
        WebBrowser.coolDownAsync();
      }
    };
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      const redirectUrl = getOAuthRedirectUrl();
      console.log('--- SUPABASE REDIRECT URL ---');
      console.log('Ensure this URL (or with ** appended) is in your Supabase Redirect URLs list:');
      console.log(redirectUrl);
      console.log('-------------------------------');

      // Setup a one-time link listener in case Android Custom Tabs dismisses upon receiving the deep link
      let handled = false;
      const sub = Linking.addEventListener('url', async (event) => {
        if (!handled && (event.url.includes('code=') || event.url.includes('access_token=') || event.url.includes('error='))) {
          handled = true;
          sub.remove();
          await handleAuthRedirectUrl(event.url);
          setGoogleLoading(false);
        }
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        sub.remove();
        setGoogleLoading(false);
        console.error('Supabase Auth Error:', error.message);
        Alert.alert('Google Sign-In Error', error.message);
        return;
      }

      if (data?.url) {
        let res: WebBrowser.WebBrowserAuthSessionResult | null = null;
        try {
          res = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
        } catch (wbError: any) {
          console.warn('openAuthSessionAsync threw error, attempting direct browser fallback:', wbError);
          try {
            await Linking.openURL(data.url);
            return;
          } catch (linkError: any) {
            console.error('Direct Linking.openURL also failed:', linkError);
            Alert.alert(
              'Could not open browser',
              'Please check if you have a web browser (e.g. Chrome) installed and enabled.'
            );
            return;
          }
        }

        if (res && res.type === 'success' && res.url) {
          handled = true;
          sub.remove();
          await handleAuthRedirectUrl(res.url);
        } else if (res && (res.type === 'dismiss' || res.type === 'cancel')) {
          // If browser dismissed, check if Android OS delivered redirect to initial URL
          setTimeout(async () => {
            if (!handled) {
              const initial = await Linking.getInitialURL();
              if (initial && (initial.includes('code=') || initial.includes('access_token='))) {
                handled = true;
                sub.remove();
                await handleAuthRedirectUrl(initial);
              }
            }
            sub.remove();
            setGoogleLoading(false);
          }, 1000);
          return;
        }
      }
      sub.remove();
    } catch (e: any) {
      console.error('OAuth Exception:', e);
      Alert.alert('Google Sign-In Error', e?.message || 'An unexpected error occurred during Google sign in.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Top Brand & Welcome Area */}
        <View style={s.headerSection}>
          <Image 
            source={require('../../assets/logo/png/freakyfit-orange-logo-transparent-512.png')}
            style={s.welcomeLogo}
            resizeMode="contain"
          />
          
          <Text style={s.preTitle}>Welcome to FreakyFit</Text>
          
          <Text style={s.subtitle}>
            Save, organize, and plan your workouts with precision.
          </Text>
          
          <View style={s.statPill}>
            <View style={s.statDot} />
            <Text style={s.statText}>120K+ ATHLETES LOGGING SESSIONS</Text>
          </View>
        </View>

        {/* Primary Authentication Actions */}
        <View style={s.actionsSection}>
          
          {/* Continue with Google */}
          <TouchableOpacity 
            style={[s.googleBtn, googleLoading && { opacity: 0.7 }]} 
            activeOpacity={0.8} 
            onPress={handleGoogleLogin}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator size="small" color="#1E293B" />
            ) : (
              <>
                <GoogleIcon size={20} />
                <Text style={s.googleText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>
          
          {/* Continue with Apple (Hidden on Android devices) */}
          {Platform.OS !== 'android' && (
            <TouchableOpacity style={s.appleBtn} activeOpacity={0.8} onPress={handleContinue}>
              <AppleIcon size={20} color="#FFFFFF" />
              <Text style={s.appleText}>Continue with Apple</Text>
            </TouchableOpacity>
          )}
          
          {/* Divider */}
          <View style={s.dividerContainer}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>or</Text>
          </View>

          {/* Continue with Email */}
          <TouchableOpacity 
            style={s.emailBtn} 
            activeOpacity={0.8} 
            onPress={() => router.push('/auth/login')}
          >
            <Mail size={20} color={colors.textPrimary} />
            <Text style={s.emailText}>Continue with Email</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Legal Footer */}
        <View style={s.footerSection}>
          <Text style={s.legalText}>By continuing you agree to FreakyFit&apos;s</Text>
          <View style={s.legalLinksRow}>
            <TouchableOpacity 
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} 
              activeOpacity={0.7} 
              onPress={() => router.push('/terms')}
            >
              <Text style={s.linkText}>Terms of Service</Text>
            </TouchableOpacity>
            <Text style={s.legalDot}>•</Text>
            <TouchableOpacity 
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} 
              activeOpacity={0.7} 
              onPress={() => router.push('/privacy')}
            >
              <Text style={s.linkText}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof import("../contexts/ThemeContext").useTheme>["colors"]) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 24,
  },
  welcomeLogo: {
    width: 140,
    height: 140,
    marginBottom: 24,
  },
  preTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: '#a63b00',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 16,
    gap: 6,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  actionsSection: {
    width: '100%',
    gap: 16,
    marginTop: 40,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  googleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  appleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    height: 60,
    borderRadius: 30,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  appleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dividerContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  dividerLine: {
    width: '100%',
    height: 1,
    backgroundColor: colors.cardBorder,
  },
  dividerText: {
    position: 'absolute',
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textTertiary,
    textTransform: 'uppercase',
  },
  emailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  footerSection: {
    alignItems: 'center',
    marginTop: 40,
    gap: 16,
  },
  legalText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  linkText: {
    fontWeight: '600',
    color: colors.textPrimary,
    textDecorationLine: 'underline',
    fontSize: 13,
  },
  legalLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    gap: 8,
  },
  legalDot: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  loginTextPrompt: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  loginTextAction: {
    fontSize: 14,
    fontWeight: '700',
    color: '#a63b00',
    textDecorationLine: 'underline',
  },
});
