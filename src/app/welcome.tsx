import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Zap, Mail } from 'lucide-react-native';

import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

export default function WelcomeScreen() {
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const router = useRouter();

  const handleContinue = () => {
    router.replace('/home');
  };

  const handleGoogleLogin = async () => {
    try {
      const redirectUrl = Linking.createURL('');
      console.log('--- SUPABASE REDIRECT URL ---');
      console.log('Make sure THIS exact URL (with a ** at the end) is in your Supabase Redirect URLs list:');
      console.log(redirectUrl);
      console.log('-------------------------------');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        console.error("Supabase Auth Error:", error.message);
        return;
      }

      if (data?.url) {
        const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
        
        if (res.type === 'success') {
          let sessionData: any = null;
          let sessionError: any = null;
          
          try {
            const parsedUrl = new URL(res.url);
            const code = parsedUrl.searchParams.get('code');
            if (code) {
              const result = await supabase.auth.exchangeCodeForSession(code);
              sessionData = result.data;
              sessionError = result.error;
            } else {
              // Parse hash fragment for implicit grant
              const hashParams = new URLSearchParams(parsedUrl.hash.substring(1));
              const accessToken = hashParams.get('access_token');
              const refreshToken = hashParams.get('refresh_token');
              if (accessToken && refreshToken) {
                const result = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken,
                });
                sessionData = result.data;
                sessionError = result.error;
              } else {
                const errorDesc = hashParams.get('error_description') || parsedUrl.searchParams.get('error_description');
                sessionError = new Error(errorDesc || 'No tokens or code found in redirect URL');
              }
            }
          } catch (e: any) {
            sessionError = e;
          }
          
          if (sessionError) {
            console.error("Session extraction error:", sessionError.message);
          } else if (sessionData.session) {
            // Check if they are a returning FreakyFit user
            const { data: profile } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', sessionData.session.user.id)
              .single();

            if (profile) {
              console.log("Welcome back returning user!");
              router.replace('/home');
            } else {
              console.log("New user detected, creating profile and sending to home!");
              const userMeta = sessionData.session.user.user_metadata;
              const { error: insertError } = await supabase
                .from('profiles')
                .insert([
                  {
                    id: sessionData.session.user.id,
                    display_name: userMeta?.full_name || sessionData.session.user.email?.split('@')[0] || 'New User',
                    avatar_url: userMeta?.avatar_url || null,
                    gender: JSON.parse((await AsyncStorage.getItem('@onboarding_gender')) || 'null'),
                    age: JSON.parse((await AsyncStorage.getItem('@onboarding_age')) || 'null'),
                    height_cm: JSON.parse((await AsyncStorage.getItem('@onboarding_height_cm')) || 'null'),
                    weight_kg: JSON.parse((await AsyncStorage.getItem('@onboarding_weight_kg')) || 'null'),
                    primary_goal: JSON.parse((await AsyncStorage.getItem('@onboarding_primary_goal')) || 'null'),
                    training_frequency: JSON.parse((await AsyncStorage.getItem('@onboarding_training_frequency')) || 'null'),
                    target_muscles: JSON.parse((await AsyncStorage.getItem('@onboarding_target_muscles')) || 'null'),
                    referral_source: await AsyncStorage.getItem('@onboarding_referral_source'),
                    updated_at: new Date().toISOString(),
                  }
                ]);
              if (insertError) {
                console.error("Failed to create profile:", insertError.message);
              }
              router.replace('/home');
            }
          }
        }
      }
    } catch (e) {
      console.error("OAuth Exception:", e);
    }
  };

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Top Brand & Welcome Area */}
        <View style={s.headerSection}>
          <View style={s.iconBadge}>
            <Zap size={32} color="#FFFFFF" fill="#FFFFFF" />
            <View style={s.pingDot} />
            <View style={s.solidDot} />
          </View>
          
          <Text style={s.preTitle}>Welcome to</Text>
          <Text style={s.title}>FreakyFit</Text>
          
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
          <TouchableOpacity style={s.googleBtn} activeOpacity={0.8} onPress={handleGoogleLogin}>
            <Text style={s.googleIcon}>G</Text>
            <Text style={s.googleText}>Continue with Google</Text>
          </TouchableOpacity>
          
          {/* Continue with Apple */}
          <TouchableOpacity style={s.appleBtn} activeOpacity={0.8} onPress={handleContinue}>
            <Text style={s.appleIcon}></Text>
            <Text style={s.appleText}>Continue with Apple</Text>
          </TouchableOpacity>
          
          {/* Divider */}
          <View style={s.dividerContainer}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>or</Text>
          </View>
          
          {/* Continue with Email */}
          <TouchableOpacity style={s.emailBtn} activeOpacity={0.8} onPress={handleContinue}>
            <Mail size={20} color="#5b4137" />
            <Text style={s.emailText}>Continue with Email</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Legal Footer */}
        <View style={s.footerSection}>
          <Text style={s.legalText}>
            By continuing you agree to FreakyFit's{' '}
            <Text style={s.linkText}>Terms of Service</Text> and{' '}
            <Text style={s.linkText}>Privacy Policy</Text>.
          </Text>
          
          <View style={s.loginRow}>
            <Text style={s.loginTextPrompt}>Already have an account?</Text>
            <TouchableOpacity onPress={handleContinue}>
              <Text style={s.loginTextAction}>Log in</Text>
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
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 24,
  },
  pingDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fe893c',
    opacity: 0.75,
  },
  solidDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fe893c',
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
    gap: 12,
    marginTop: 40,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    height: 56,
    borderRadius: 28,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4285F4',
  },
  googleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  appleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.textPrimary,
    height: 56,
    borderRadius: 28,
    gap: 12,
  },
  appleIcon: {
    fontSize: 20,
    color: colors.background,
  },
  appleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.background,
  },
  dividerContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  dividerLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#E1E3E4',
  },
  dividerText: {
    position: 'absolute',
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  emailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    height: 56,
    borderRadius: 28,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  emailText: {
    fontSize: 14,
    fontWeight: '600',
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
