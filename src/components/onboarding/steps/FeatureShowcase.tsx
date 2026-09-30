import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Dimensions } from 'react-native';
import { Header } from '../Header';
import { ContinueButton } from '../ContinueButton';

const { width } = Dimensions.get('window');

export function FeatureShowcase({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  return (
    <View style={styles.container}>
      <Header currentStep={5} onBack={onBack} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <Text style={styles.headline}>
            Awesome — You're <Text style={styles.highlightText}>Covered!</Text>
          </Text>
          <Text style={styles.subtitle}>
            FreakyFit imports workouts from anywhere. Paste any TikTok, Reel, YouTube link, or web log to auto-extract structured sets & kinetic telemetry.
          </Text>
        </View>

        <View style={styles.mockupContainer}>
          <View style={styles.ambientPulse} />
          <View style={styles.ambientGlow} />
          
          <View style={styles.phoneFrame}>
            <View style={styles.cameraIsland}>
              <View style={styles.cameraDot1} />
              <View style={styles.cameraDot2} />
            </View>
            
            <View style={styles.phoneScreen}>
              <View style={styles.appHeader}>
                <View style={styles.appHeaderLeft}>
                  <View style={styles.coachAvatar}>
                    <Text style={styles.coachIcon}>🏋️</Text>
                  </View>
                  <View>
                    <Text style={styles.coachName}>COACH MARCUS</Text>
                    <Text style={styles.coachSub}>Heavy Squat Focus</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.videoContainer}>
                <Image 
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCiUojwqVkEAyOwUNCaUwPM_mcFMfmcudkDzNxHGOrc04K-ykuqqze4bMfXhe27TxcfFuFpWMGHZCm-qQjmsnIcWJx2DgygcLZoPzmdPbGvFenDVNsuiLsNOY8rZsaHgZ986pMPGCSv7ljChEoYs5N3oWU-kZgNiTFgGcwNuhfKd_3PqS0I1p15IAy0cyDzyXqnaeKdtzJyInU07uAEYeJ6xgaEyDVIVCT75Lun_N8KVPEYe8m5Ea8E' }}
                  style={styles.videoImage}
                />
                <View style={styles.telemetryOverlay}>
                  <View style={styles.telemetryCard}>
                    <View style={styles.telemetryHeaderRow}>
                      <Text style={styles.telemetryTitle}>EXTRACTED WORKOUT</Text>
                      <View style={styles.parsedBadge}>
                        <Text style={styles.parsedText}>Parsed in 0.8s</Text>
                      </View>
                    </View>
                    
                    <View style={styles.telemetryRow}>
                      <Text style={styles.telemetryExercise}>1. Barbell Split Squats</Text>
                      <Text style={styles.telemetrySets}>4 × 8</Text>
                    </View>
                    <View style={styles.telemetryRow}>
                      <Text style={styles.telemetryExercise}>2. Romanian Deadlifts</Text>
                      <Text style={styles.telemetrySets}>3 × 10</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.featureGrid}>
          <View style={styles.featureCard}>
            <View style={[styles.featureIconBox, { backgroundColor: '#FFDBCE' }]}>
              <Text style={{ fontSize: 18 }}>📋</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Instant Paste</Text>
              <Text style={styles.featureDesc}>Captures captions, bio text & timestamps.</Text>
            </View>
          </View>
          <View style={styles.featureCard}>
            <View style={[styles.featureIconBox, { backgroundColor: '#FFDBC9' }]}>
              <Text style={{ fontSize: 18 }}>⏱️</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Auto Rest Timer</Text>
              <Text style={styles.featureDesc}>Injects intelligent recovery cadence.</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.socialProof}>
          <View style={styles.avatarGroup}>
            <View style={[styles.miniAvatar, { backgroundColor: '#E7E8E9' }]}>
              <Text style={{ fontSize: 10 }}>✓</Text>
            </View>
            <View style={[styles.miniAvatar, { backgroundColor: '#ff5e00', marginLeft: -8 }]}>
              <Text style={{ fontSize: 10, color: 'white' }}>⚡</Text>
            </View>
          </View>
          <Text style={styles.socialProofText}>
            Over <Text style={styles.socialProofBold}>500,000+</Text> creator routines converted
          </Text>
        </View>

      </ScrollView>

      <ContinueButton onPress={onNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headline: {
    fontSize: 28,
    fontWeight: '700',
    color: '#191C1D',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  highlightText: {
    color: '#ff5e00',
  },
  subtitle: {
    fontSize: 15,
    color: '#5B4137',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  mockupContainer: {
    height: 380,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 16,
  },
  ambientPulse: {
    position: 'absolute',
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: 'rgba(255, 219, 201, 0.4)',
  },
  ambientGlow: {
    position: 'absolute',
    width: 176,
    height: 176,
    borderRadius: 88,
    backgroundColor: 'rgba(255, 94, 0, 0.15)',
  },
  phoneFrame: {
    width: 210,
    height: 340,
    backgroundColor: '#2E3132',
    borderRadius: 32,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.28,
    shadowRadius: 45,
    elevation: 10,
  },
  cameraIsland: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    width: 64,
    height: 12,
    backgroundColor: '#2E3132',
    borderRadius: 6,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraDot1: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(91, 65, 55, 0.4)',
    marginRight: 4,
  },
  cameraDot2: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(91, 65, 55, 0.25)',
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
  },
  appHeader: {
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F5',
  },
  appHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coachAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 94, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachIcon: {
    fontSize: 14,
  },
  coachName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#191C1D',
  },
  coachSub: {
    fontSize: 9,
    color: '#5B4137',
    marginTop: 2,
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  videoImage: {
    width: '100%',
    height: '100%',
  },
  telemetryOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  telemetryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 8,
  },
  telemetryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  telemetryTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ff5e00',
  },
  parsedBadge: {
    backgroundColor: '#E7E8E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  parsedText: {
    fontSize: 9,
    color: '#5B4137',
  },
  telemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  telemetryExercise: {
    fontSize: 11,
    fontWeight: '600',
    color: '#191C1D',
  },
  telemetrySets: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ff5e00',
  },
  featureGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    marginBottom: 12,
  },
  featureCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  featureIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#191C1D',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 11,
    color: '#5B4137',
    lineHeight: 14,
  },
  socialProof: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  avatarGroup: {
    flexDirection: 'row',
  },
  miniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  socialProofText: {
    fontSize: 12,
    color: '#5B4137',
  },
  socialProofBold: {
    fontWeight: '600',
    color: '#191C1D',
  }
});
