import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, ExternalLink } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { APP_LINKS, openWebUrl } from '../constants/links';

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const s = makeStyles(colors);

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} activeOpacity={0.7} onPress={() => router.back()}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Privacy Policy</Text>
        <TouchableOpacity
          style={s.backBtn}
          activeOpacity={0.7}
          onPress={() => openWebUrl(APP_LINKS.PRIVACY_POLICY)}
          accessibilityLabel="Open in Web Browser"
        >
          <ExternalLink size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.lastUpdated}>Effective Date: October 2026</Text>

        <Text style={s.paragraph}>
          Welcome to FreakyFit (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). Your privacy is of paramount importance to us. 
          This Privacy Policy explains how we collect, use, store, and protect your personal information when you use the FreakyFit mobile application and related services.
        </Text>

        <Text style={s.sectionTitle}>1. Information We Collect</Text>
        <Text style={s.paragraph}>
          <Text style={s.bold}>Account Information: </Text>
          When you register using Google, Apple, or email, we collect your email address, display name, and avatar profile details.
        </Text>
        <Text style={s.paragraph}>
          <Text style={s.bold}>Fitness & Biometric Preferences: </Text>
          To calibrate workouts and progression, you may provide your age, height, weight, target muscle focus, and fitness goals during onboarding.
        </Text>
        <Text style={s.paragraph}>
          <Text style={s.bold}>Workout & Log Data: </Text>
          Workouts you create, import from social links (e.g. YouTube, Instagram, TikTok), workout logs, active session durations, sets, and weights are stored in your private cloud account.
        </Text>

        <Text style={s.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={s.paragraph}>
          • Personalize workout plans and target muscle recommendations.
          {'\n'}• Synchronize your routines and training logs across your devices.
          {'\n'}• Analyze imported workout links and extract structured exercise data using AI.
          {'\n'}• Facilitate subscription verification through RevenueCat and app store billing.
        </Text>

        <Text style={s.sectionTitle}>3. Data Security & Storage</Text>
        <Text style={s.paragraph}>
          Your data is encrypted in transit using industry-standard TLS encryption and securely stored in multi-tenant cloud databases with strict Row-Level Security (RLS) policies. Only authenticated requests originating from your user session can access your fitness records.
        </Text>

        <Text style={s.sectionTitle}>4. Third-Party Services</Text>
        <Text style={s.paragraph}>
          We partner with select third-party providers to power essential features:
          {'\n'}• <Text style={s.bold}>Supabase: </Text>Authentication and database infrastructure.
          {'\n'}• <Text style={s.bold}>RevenueCat: </Text>In-app purchase validation and subscription lifecycle.
          {'\n'}• <Text style={s.bold}>Apple / Google OAuth: </Text>Secure single sign-on authentication.
        </Text>

        <Text style={s.sectionTitle}>5. Your Rights & Data Deletion</Text>
        <Text style={s.paragraph}>
          You have the right to review, update, or request the deletion of your account and all associated fitness logs at any time. You can request complete account deletion in the Settings screen or by contacting support at {APP_LINKS.SUPPORT_EMAIL}.
        </Text>

        <Text style={s.sectionTitle}>6. Contact Us</Text>
        <Text style={s.paragraph}>
          If you have questions or concerns about this Privacy Policy, please reach out to Truemind Labs at {APP_LINKS.SUPPORT_EMAIL} or visit {APP_LINKS.DOMAIN}.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.navBorder,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  lastUpdated: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 20,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  bold: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
