import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Header } from '../Header';
import { ContinueButton } from '../ContinueButton';
import { CheckCircle, TrendingUp } from 'lucide-react-native';

export function ValueProposition({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  return (
    <View style={styles.container}>
      <Header currentStep={9} onBack={onBack} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <View style={styles.badgeContainer}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>GAINS CONSISTENCY ENGINE</Text>
          </View>
          <Text style={styles.headline}>
            Never miss a workout with FreakyFit
          </Text>
          <Text style={styles.subtitle}>
            Turn saved chaos into consistent, executed gains.
          </Text>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardEyebrow}>WORKOUT EXECUTION</Text>
              <View style={styles.metricRow}>
                <Text style={styles.metricLarge}>+380%</Text>
                <View style={styles.metricBadge}>
                  <Text style={styles.metricBadgeText}>Consistency</Text>
                </View>
              </View>
            </View>
            <View style={styles.microStat}>
              <TrendingUp size={14} color="#ea580c" />
              <Text style={styles.microStatText}>+12 sessions/mo</Text>
            </View>
          </View>

          <View style={styles.chartArea}>
            <View style={styles.chartDecorationRow}>
              <View style={styles.scatteredBadge}>
                <View style={styles.scatteredDot} />
                <Text style={styles.scatteredText}>Scattered saves (24%)</Text>
              </View>
            </View>
            
            <View style={styles.chartVisualPlaceholder}>
              <View style={styles.chartLineMock} />
              <View style={styles.chartCurveMock} />
              <View style={styles.chartPointNow} />
              <View style={styles.chartPointGoal}>
                <View style={styles.chartPointGoalInner} />
              </View>
            </View>

            <View style={styles.organizedBadge}>
              <View style={styles.organizedDot} />
              <Text style={styles.organizedText}>Organized & Executed</Text>
            </View>

            <View style={styles.chartFooter}>
              <Text style={styles.xAxisLabel}>Lost in Saved Folders</Text>
              <View style={styles.xAxisHighlight}>
                <View style={styles.xAxisHighlightDot} />
                <Text style={styles.xAxisHighlightText}>With FreakyFit</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.valueSection}>
          <Text style={styles.valueText}>
            Every workout you bookmark from <Text style={styles.valueTextBold}>TikTok & IG</Text> automatically parses into sets, reps, and targets — so you show up ready to lift.
          </Text>
        </View>

        <View style={styles.socialProof}>
          <View style={styles.avatarsRow}>
            <View style={[styles.avatarCircle, { backgroundColor: '#CBD5E1' }]}><Text style={styles.avatarText}>JD</Text></View>
            <View style={[styles.avatarCircle, { backgroundColor: '#FED7AA', marginLeft: -8 }]}><Text style={styles.avatarTextDark}>MK</Text></View>
            <View style={[styles.avatarCircle, { backgroundColor: '#1E293B', marginLeft: -8 }]}><Text style={styles.avatarTextLight}>★</Text></View>
          </View>
          <Text style={styles.socialProofText}>
            Trusted by <Text style={styles.socialProofBold}>190,000+</Text> lifters
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
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 237, 213, 0.7)',
    borderColor: 'rgba(254, 215, 170, 0.8)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 10,
    gap: 6,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ff5e00',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#c2410c',
    letterSpacing: 0.5,
  },
  headline: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0f1218',
    textAlign: 'center',
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 36,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
    marginBottom: 16,
  },
  cardEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 2,
  },
  metricLarge: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0f1218',
    letterSpacing: -1,
  },
  metricBadge: {
    backgroundColor: '#ECFDF5',
    borderColor: '#D1FAE5',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  metricBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  microStat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderColor: 'rgba(254, 215, 170, 0.7)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  microStatText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ea580c',
    letterSpacing: -0.2,
  },
  chartArea: {
    height: 180,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  chartDecorationRow: {
    position: 'absolute',
    top: 40,
    left: 0,
    zIndex: 10,
  },
  scatteredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(51, 65, 85, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  scatteredDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  scatteredText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  organizedBadge: {
    position: 'absolute',
    top: -10,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ea580c',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
    zIndex: 10,
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  organizedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  organizedText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  chartVisualPlaceholder: {
    height: 120,
    width: '100%',
    position: 'relative',
  },
  chartLineMock: {
    position: 'absolute',
    left: 20,
    bottom: 30,
    width: '30%',
    height: 2,
    backgroundColor: '#94A3B8',
    borderStyle: 'dashed',
  },
  chartCurveMock: {
    position: 'absolute',
    left: '30%',
    bottom: 30,
    width: '60%',
    height: 80,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#ff5e00',
    borderBottomRightRadius: 60,
    transform: [{ rotate: '-45deg' }],
  },
  chartPointNow: {
    position: 'absolute',
    left: '30%',
    bottom: 26,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#64748B',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chartPointGoal: {
    position: 'absolute',
    right: '5%',
    top: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 94, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartPointGoalInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff5e00',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  xAxisLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  xAxisHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  xAxisHighlightDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ff5e00',
  },
  xAxisHighlightText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ea580c',
  },
  valueSection: {
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  valueText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
    textAlign: 'center',
  },
  valueTextBold: {
    fontWeight: '700',
    color: '#0f1218',
  },
  socialProof: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  avatarsRow: {
    flexDirection: 'row',
  },
  avatarCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#334155',
  },
  avatarTextDark: {
    fontSize: 8,
    fontWeight: '700',
    color: '#9A3412',
  },
  avatarTextLight: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  socialProofText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  socialProofBold: {
    fontWeight: '700',
    color: '#0f1218',
  }
});
