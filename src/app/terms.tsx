import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, ExternalLink } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { APP_LINKS, openWebUrl } from '../constants/links';

export default function TermsOfServiceScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const s = makeStyles(colors);

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} activeOpacity={0.7} onPress={() => router.back()}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Terms of Service</Text>
        <TouchableOpacity
          style={s.backBtn}
          activeOpacity={0.7}
          onPress={() => openWebUrl(APP_LINKS.TERMS_OF_SERVICE)}
          accessibilityLabel="Open in Web Browser"
        >
          <ExternalLink size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.lastUpdated}>Effective Date: October 2026</Text>

        <Text style={s.paragraph}>
          Please read these Terms of Service (&quot;Terms&quot;) carefully before using the FreakyFit mobile application. 
          By accessing or using our services, you agree to be bound by these Terms.
        </Text>

        <Text style={s.sectionTitle}>1. Medical & Fitness Disclaimer</Text>
        <Text style={s.warningBox}>
          <Text style={s.bold}>IMPORTANT: </Text>
          FreakyFit is not a medical organization and our AI-generated workouts, progression suggestions, and telemetry do not constitute medical advice or diagnosis. Always consult a physician before starting any exercise program. If you feel dizzy, nauseous, or experience pain during a workout, cease activity immediately.
        </Text>

        <Text style={s.sectionTitle}>2. Use of the App & User Accounts</Text>
        <Text style={s.paragraph}>
          You must be at least 13 years old to use FreakyFit. You are responsible for safeguarding your login credentials and for any activity under your account. You agree not to misuse our systems or extract copyrighted materials without authorization.
        </Text>

        <Text style={s.sectionTitle}>3. Subscriptions & Billing</Text>
        <Text style={s.paragraph}>
          FreakyFit Pro features may be offered on a recurring subscription basis. Subscriptions are billed through your Apple App Store or Google Play Store account. Subscriptions automatically renew unless cancelled at least 24 hours prior to the end of the current billing cycle in your device settings.
        </Text>

        <Text style={s.sectionTitle}>4. Workout Content & AI Extraction</Text>
        <Text style={s.paragraph}>
          When you submit public social URLs (such as YouTube, Instagram, or TikTok) for workout extraction, our AI analyzes publicly available metadata to generate structured routine notes. You represent that you have the right to reference such content for personal fitness tracking.
        </Text>

        <Text style={s.sectionTitle}>5. Limitation of Liability</Text>
        <Text style={s.paragraph}>
          To the maximum extent permitted by applicable law, FreakyFit and its team shall not be liable for any indirect, incidental, or consequential damages resulting from your use of the application or physical training.
        </Text>

        <Text style={s.sectionTitle}>6. Modifications & Termination</Text>
        <Text style={s.paragraph}>
          We reserve the right to modify these Terms at any time. Continued use of FreakyFit after modifications constitutes acceptance of the revised Terms.
        </Text>

        <Text style={s.sectionTitle}>7. Contact Us</Text>
        <Text style={s.paragraph}>
          For inquiries regarding these Terms, contact us at {APP_LINKS.SUPPORT_EMAIL} or visit {APP_LINKS.DOMAIN}.
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
  warningBox: {
    fontSize: 13,
    lineHeight: 20,
    color: '#9A3412',
    backgroundColor: '#FFEDD5',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
    marginBottom: 12,
  },
  bold: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
