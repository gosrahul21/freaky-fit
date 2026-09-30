import { hapticSelection } from '../../../utils/haptics';
import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Dimensions } from 'react-native';
import { Sparkles, ShieldCheck, Star } from 'lucide-react-native';
import { Header } from '../Header';
import { ContinueButton } from '../ContinueButton';

const { width } = Dimensions.get('window');

export function FreakyFitEngine({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  return (
    <View style={styles.container}>
      <Header currentStep={3} onBack={onBack} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={styles.phoneFrame}>
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_7Bh21r0-jvpsZUV4-Ssijh5Tdg6PEY2Bz2vFG647hxmEYP9rmSbdfjOG0h1FxzciGvQK-PLlHJEsAOc3fkjXDBGkPaRX82Bj-OpseSu9c59d7zoy-0-qAYxKMb9mk3qxUeQn73MOBYxLXyQgjERSkKArirDrEtw4VyyLvzH9WEbeW6Ao-nWnAvdRHgVRdrZ5nM5ZuccutKrksPV2hgBfH0qPvr1DsFJuvNwUK_Rdk5qHnzCcFSK1mVxjXZrrrWj9gQ' }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            
            {/* AI Pill inside phone */}
            <View style={styles.aiPill}>
              <View style={styles.aiPillHeader}>
                <View style={styles.aiEngineRow}>
                  <View style={styles.pulseDot} />
                  <Text style={styles.aiEngineText}>FREAKYFIT ENGINE</Text>
                </View>
                <View style={styles.tagBadge}>
                  <Text style={styles.tagBadgeText}>RDL • Glutes</Text>
                </View>
              </View>
              <View style={styles.aiPillBody}>
                <View style={styles.iconBox}>
                  <Text style={styles.iconBoxText}>🏋️</Text>
                </View>
                <View style={styles.aiPillContent}>
                  <Text style={styles.aiPillTitle}>Barbell Romanian Deadlift</Text>
                  <Text style={styles.aiPillSubtitle}>4 Sets × 10 Reps • Auto Logged</Text>
                </View>
                <View style={styles.checkCircle}>
                  <Text style={styles.checkIcon}>✓</Text>
                </View>
              </View>
            </View>
          </View>
          
          <View style={styles.featureBadge}>
            <Sparkles size={14} color="#ff5e00" />
            <Text style={styles.featureBadgeText}>AI parses sets, reps, and form instantly</Text>
          </View>
        </View>

        <View style={styles.footerContent}>
          <Text style={styles.mainHeadline}>
            TURN ANY <Text style={styles.highlightWord}>TIKTOK</Text> OR REEL INTO WORKOUT PLANS
          </Text>
          
          <Text style={styles.bodyText}>
            Stop saving clips you never do. Paste any fitness link and our AI builds you custom daily routine cards.
          </Text>
          
          <View style={styles.trustRow}>
            {/* <View style={styles.trustItem}>
              <ShieldCheck size={12} color="#10B981" />
              <Text style={styles.trustText}>No credit card needed</Text>
            </View> */}
            {/* <Text style={styles.trustDot}>•</Text> */}
            {/* <View style={styles.trustItem}>
              <Star size={12} color="#FBBF24" fill="#FBBF24" />
              <Text style={styles.trustText}>4.9/5 Athlete rating</Text>
            </View> */}
          </View>
        </View>
      </ScrollView>

      <ContinueButton onPress={onNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  phoneFrame: {
    width: width * 0.75,
    height: width * 1.0,
    backgroundColor: '#000',
    borderRadius: 36,
    borderWidth: 6,
    borderColor: '#181920',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#ff5e00',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 10,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  aiPill: {
    position: 'absolute',
    bottom: 24,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(9, 10, 15, 0.9)',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  aiPillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiEngineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ff5e00',
  },
  aiEngineText: {
    color: '#FB923C',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tagBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagBadgeText: {
    color: '#D1D5DB',
    fontSize: 9,
    fontWeight: '600',
  },
  aiPillBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 94, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxText: {
    fontSize: 14,
  },
  aiPillContent: {
    flex: 1,
  },
  aiPillTitle: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  aiPillSubtitle: {
    color: '#9CA3AF',
    fontSize: 9,
    fontWeight: '500',
    marginTop: 2,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ff5e00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#ffedd5',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 20,
  },
  featureBadgeText: {
    color: '#c2410c',
    fontSize: 11,
    fontWeight: '700',
  },
  footerContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    marginTop: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 4,
  },
  mainHeadline: {
    fontSize: 30,
    fontWeight: '900',
    color: '#090a0f',
    textAlign: 'center',
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  highlightWord: {
    color: '#ff5e00',
  },
  bodyText: {
    color: '#6B7280',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
    fontWeight: '500',
    paddingHorizontal: 10,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 20,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trustText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  trustDot: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});
