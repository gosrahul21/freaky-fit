import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Zap, Mail } from 'lucide-react-native';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleContinue = () => {
    router.push('/onboarding');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Top Brand & Welcome Area */}
        <View style={styles.headerSection}>
          <View style={styles.iconBadge}>
            <Zap size={32} color="#FFFFFF" fill="#FFFFFF" />
            <View style={styles.pingDot} />
            <View style={styles.solidDot} />
          </View>
          
          <Text style={styles.preTitle}>Welcome to</Text>
          <Text style={styles.title}>FreakyFit</Text>
          
          <Text style={styles.subtitle}>
            Save, organize, and plan your workouts with precision.
          </Text>
          
          <View style={styles.statPill}>
            <View style={styles.statDot} />
            <Text style={styles.statText}>120K+ ATHLETES LOGGING SESSIONS</Text>
          </View>
        </View>

        {/* Primary Authentication Actions */}
        <View style={styles.actionsSection}>
          
          {/* Continue with Google */}
          <TouchableOpacity style={styles.googleBtn} activeOpacity={0.8} onPress={handleContinue}>
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleText}>Continue with Google</Text>
          </TouchableOpacity>
          
          {/* Continue with Apple */}
          <TouchableOpacity style={styles.appleBtn} activeOpacity={0.8} onPress={handleContinue}>
            <Text style={styles.appleIcon}></Text>
            <Text style={styles.appleText}>Continue with Apple</Text>
          </TouchableOpacity>
          
          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
          </View>
          
          {/* Continue with Email */}
          <TouchableOpacity style={styles.emailBtn} activeOpacity={0.8} onPress={handleContinue}>
            <Mail size={20} color="#5b4137" />
            <Text style={styles.emailText}>Continue with Email</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Legal Footer */}
        <View style={styles.footerSection}>
          <Text style={styles.legalText}>
            By continuing you agree to FreakyFit's{' '}
            <Text style={styles.linkText}>Terms of Service</Text> and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>.
          </Text>
          
          <View style={styles.loginRow}>
            <Text style={styles.loginTextPrompt}>Already have an account?</Text>
            <TouchableOpacity onPress={handleContinue}>
              <Text style={styles.loginTextAction}>Log in</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
    backgroundColor: '#ff5e00',
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
    color: '#191C1D',
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
    color: '#5b4137',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7E8E9',
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
    backgroundColor: '#ff5e00',
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5b4137',
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
    backgroundColor: '#FFFFFF',
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
    color: '#191C1D',
  },
  appleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#191C1D',
    height: 56,
    borderRadius: 28,
    gap: 12,
  },
  appleIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  appleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: '600',
    color: '#5b4137',
    textTransform: 'uppercase',
  },
  emailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
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
    color: '#191C1D',
  },
  footerSection: {
    alignItems: 'center',
    marginTop: 40,
    gap: 16,
  },
  legalText: {
    fontSize: 13,
    color: '#5b4137',
    textAlign: 'center',
    lineHeight: 20,
  },
  linkText: {
    fontWeight: '600',
    color: '#191C1D',
    textDecorationLine: 'underline',
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  loginTextPrompt: {
    fontSize: 13,
    color: '#5b4137',
  },
  loginTextAction: {
    fontSize: 14,
    fontWeight: '700',
    color: '#a63b00',
    textDecorationLine: 'underline',
  },
});
