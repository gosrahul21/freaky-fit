import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Zap, ArrowRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Top Mockup Showcase Section */}
        <View style={styles.mockupSection}>
          <View style={styles.phoneFrame}>
            <View style={styles.phoneScreen}>
              
              {/* Dynamic Island Notch Mock */}
              <View style={styles.notchContainer}>
                <View style={styles.notch} />
              </View>

              {/* Bolt Emblem */}
              <View style={styles.emblemWrapper}>
                <View style={styles.emblemInner}>
                  <Zap size={32} color="#ff5e00" fill="#ff5e00" style={styles.boltIcon} />
                </View>
              </View>

              <Text style={styles.mockupTitle}>
                <Text style={styles.mockupTitleBlack}>FREAKY</Text>
                <Text style={styles.mockupTitleOrange}>FIT</Text>
              </Text>

              {/* Decorative Tagline inside Mockup */}
              <View style={styles.mockupTaglineBox}>
                <View style={styles.mockupTagBadge}>
                  <Text style={styles.mockupTagBadgeText}>SMART SCANNER</Text>
                </View>
                <Text style={styles.mockupTagText}>
                  HAVE{'\n'}
                  <Text style={styles.mockupTagTextOrange}>THOUSANDS OF</Text>{'\n'}
                  WORKOUT{'\n'}
                  VIDEOS?
                </Text>
              </View>

              {/* Mockup home indicator */}
              <View style={styles.mockupHomeIndicator} />
            </View>
          </View>
        </View>

        {/* Value Proposition & CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.heroTitle}>
            TURN ANY <Text style={styles.heroTitleHighlight}>VIDEO</Text>{'\n'}
            INTO WORKOUT PLANS
          </Text>
          
          <Text style={styles.heroSubtitle}>
            Instant AI exercise extraction from TikTok, Instagram Reels & YouTube.
          </Text>

          <TouchableOpacity 
            style={styles.getStartedBtn} 
            activeOpacity={0.9} 
            onPress={() => router.push('/welcome')}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
            <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>

          <View style={styles.signInRow}>
            <Text style={styles.signInTextPrompt}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/welcome')}>
              <Text style={styles.signInTextAction}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    shadowColor: '#ff5e00',
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
  emblemWrapper: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#ff5e00',
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginTop: 8,
  },
  emblemInner: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boltIcon: {
    transform: [{ rotate: '-6deg' }],
  },
  mockupTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 12,
    letterSpacing: -0.5,
  },
  mockupTitleBlack: {
    color: '#111317',
  },
  mockupTitleOrange: {
    color: '#ff5e00',
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
    color: '#ff5e00',
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
    color: '#ff5e00',
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
    color: '#111317',
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  heroTitleHighlight: {
    color: '#ff5e00',
  },
  heroSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
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
    backgroundColor: '#111317',
    paddingVertical: 18,
    borderRadius: 32,
    marginTop: 24,
    gap: 8,
    shadowColor: '#111317',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  getStartedText: {
    color: '#FFFFFF',
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
    color: '#ff5e00',
  },
});
