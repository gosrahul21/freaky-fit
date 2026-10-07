import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import Purchases from 'react-native-purchases';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const router = useRouter();

  React.useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        try {
          const customerInfo = await Purchases.getCustomerInfo();
          // Check if they have an active subscription
          if (Object.keys(customerInfo.entitlements.active).length > 0) {
            router.replace('/home'); // Active user, let them in
          } else {
            router.replace('/paywall'); // Trial ended or no sub, send to paywall
          }
        } catch (e) {
          // If RC fails (no internet), fallback to paywall or let them in? Better to paywall or retry.
          router.replace('/paywall');
        }
      }
    };
    checkAccess();
  }, []);

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.container}>
        
        {/* Top Mockup Showcase Section */}
        <View style={s.mockupSection}>
          <View style={s.phoneFrame}>
            <View style={s.phoneScreen}>
              
              {/* Dynamic Island Notch Mock */}
              <View style={s.notchContainer}>
                <View style={s.notch} />
              </View>

              {/* Logo */}
              <Image 
                source={require('../../assets/logo/png/freakyfit-orange-logo-text-onlight-800.png')} 
                style={s.actualLogo}
                resizeMode="contain"
              />

              {/* Decorative Tagline inside Mockup */}
              <View style={s.mockupTaglineBox}>
                <View style={s.mockupTagBadge}>
                  <Text style={s.mockupTagBadgeText}>SMART SCANNER</Text>
                </View>
                <Text style={s.mockupTagText}>
                  HAVE{'\n'}
                  <Text style={s.mockupTagTextOrange}>THOUSANDS OF</Text>{'\n'}
                  WORKOUT{'\n'}
                  VIDEOS?
                </Text>
              </View>

              {/* Mockup home indicator */}
              <View style={s.mockupHomeIndicator} />
            </View>
          </View>
        </View>

        {/* Value Proposition & CTA Section */}
        <View style={s.ctaSection}>
          <Text style={s.heroTitle}>
            TURN ANY <Text style={s.heroTitleHighlight}>VIDEO</Text>{'\n'}
            INTO WORKOUT PLANS
          </Text>
          
          <Text style={s.heroSubtitle}>
            Instant AI exercise extraction from TikTok, Instagram Reels & YouTube.
          </Text>

          <TouchableOpacity 
            style={s.getStartedBtn} 
            activeOpacity={0.9} 
            onPress={() => router.push('/onboarding')}
          >
            <Text style={s.getStartedText}>Get Started</Text>
            <ArrowRight size={18} color={colors.background} strokeWidth={2.5} />
          </TouchableOpacity>

          <View style={s.signInRow}>
            <Text style={s.signInTextPrompt}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/welcome')}>
              <Text style={s.signInTextAction}>Log in</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof import("../contexts/ThemeContext").useTheme>["colors"]) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.card,
  },
  container: {
    flex: 1,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  mockupSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 16,
  },
  phoneFrame: {
    width: width * 0.65,
    maxWidth: 260,
    aspectRatio: 245 / 375,
    backgroundColor: '#111317',
    borderRadius: 42,
    padding: 8,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: '#FFF9F5',
    borderRadius: 34,
    overflow: 'hidden',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 94, 0, 0.1)',
  },
  notchContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  notch: {
    width: 82,
    height: 22,
    backgroundColor: '#000000',
    borderRadius: 11,
  },
  actualLogo: {
    width: 140,
    height: 70,
    marginTop: 12,
  },
  mockupTaglineBox: {
    marginTop: 'auto',
    alignItems: 'center',
    marginBottom: 24,
  },
  mockupTagBadge: {
    backgroundColor: 'rgba(255, 94, 0, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  mockupTagBadgeText: {
    color: colors.accent,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  mockupTagText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111317',
    textAlign: 'center',
    lineHeight: 26,
    letterSpacing: -0.5,
  },
  mockupTagTextOrange: {
    color: colors.accent,
  },
  mockupHomeIndicator: {
    width: 96,
    height: 4,
    backgroundColor: 'rgba(17, 19, 23, 0.3)',
    borderRadius: 2,
    marginTop: 'auto',
  },
  ctaSection: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 16,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  heroTitleHighlight: {
    color: colors.accent,
  },
  heroSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  getStartedBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    paddingVertical: 18,
    borderRadius: 32,
    marginTop: 24,
    gap: 8,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  getStartedText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  signInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
    gap: 4,
  },
  signInTextPrompt: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  signInTextAction: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
  },
});
