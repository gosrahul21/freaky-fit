import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Flame, Trophy, TrendingUp, Calendar, CalendarDays, Home as HomeIcon, Bookmark, Plus, Activity, Compass } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function StreaksScreen() {
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const router = useRouter();

  // Mock heatmap data (30 days)
  const heatmapData = Array.from({ length: 30 }, (_, i) => ({
    date: i + 1,
    intensity: Math.random() > 0.4 ? Math.floor(Math.random() * 3) + 1 : 0, // 0 to 3
  }));

  return (
    <SafeAreaView style={[s.safeArea, { backgroundColor: colors.background }]}>
      <View style={[s.container, { backgroundColor: colors.background }]}>
        
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
          
          {/* Header (Scrolls with page) */}
          <View style={s.header}>
            <Text style={s.headerTitle}>STREAKS</Text>
          </View>
          
          {/* Main Streak Card */}
          <View style={s.streakHeroCard}>
            <View style={s.streakIconWrapper}>
              <Flame size={48} color="#ff5e00" fill="#ff5e00" />
            </View>
            <Text style={s.streakNumber}>14<Text style={s.streakSuffix}> Days</Text></Text>
            <Text style={s.streakSubtitle}>You're on fire! Keep it going.</Text>
          </View>

          {/* Stat Row */}
          <View style={s.statsRow}>
            <View style={s.statBox}>
              <Trophy size={20} color={colors.accent} />
              <Text style={s.statValue}>21</Text>
              <Text style={s.statLabel}>Best Streak</Text>
            </View>
            <View style={s.statBox}>
              <Activity size={20} color={colors.success} />
              <Text style={s.statValue}>85%</Text>
              <Text style={s.statLabel}>Consistency</Text>
            </View>
          </View>

          {/* Activity Heatmap */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Activity</Text>
            <View style={s.heatmapCard}>
              <View style={s.heatmapGrid}>
                {heatmapData.map((day, i) => {
                  let bgColor = colors.skeleton;
                  if (day.intensity === 1) bgColor = colors.accentLight;
                  if (day.intensity === 2) bgColor = colors.accent;
                  if (day.intensity === 3) bgColor = colors.accentDark;
                  
                  return (
                    <View 
                      key={i} 
                      style={[s.heatNode, { backgroundColor: bgColor }]} 
                    />
                  );
                })}
              </View>
              <View style={s.heatmapLegend}>
                <Text style={s.legendText}>Less</Text>
                <View style={[s.legendNode, { backgroundColor: colors.skeleton }]} />
                <View style={[s.legendNode, { backgroundColor: colors.accentLight }]} />
                <View style={[s.legendNode, { backgroundColor: colors.accent }]} />
                <View style={[s.legendNode, { backgroundColor: colors.accentDark }]} />
                <Text style={s.legendText}>More</Text>
              </View>
            </View>
          </View>

          {/* Recent Milestones */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Milestones</Text>
            
            <View style={s.milestoneRow}>
              <View style={[s.milestoneIcon, { backgroundColor: 'rgba(255, 94, 0, 0.15)' }]}>
                <Flame size={20} color={colors.accent} />
              </View>
              <View style={s.milestoneTextContainer}>
                <Text style={s.milestoneTitle}>10 Day Streak</Text>
                <Text style={s.milestoneDesc}>Achieved on Sep 26, 2026</Text>
              </View>
            </View>
            
            <View style={s.milestoneRow}>
              <View style={[s.milestoneIcon, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                <TrendingUp size={20} color={colors.success} />
              </View>
              <View style={s.milestoneTextContainer}>
                <Text style={s.milestoneTitle}>50 Workouts Total</Text>
                <Text style={s.milestoneDesc}>Achieved on Sep 20, 2026</Text>
              </View>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof import('../../contexts/ThemeContext').useTheme>['colors']) => StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 16,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  content: {
    padding: 16,
  },
  streakHeroCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  streakIconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 94, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  streakSuffix: {
    fontSize: 24,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  streakSubtitle: {
    fontSize: 15,
    color: colors.textTertiary,
    marginTop: 8,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  heatmapCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 16,
  },
  heatNode: {
    width: 14, // Much smaller, like GitHub
    height: 14,
    borderRadius: 3,
  },
  heatmapLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  legendText: {
    fontSize: 10,
    color: colors.textTertiary,
  },
  legendNode: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  milestoneIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  milestoneTextContainer: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  milestoneDesc: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  
  // Nav
  bottomNav: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.navBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textTertiary,
  },
  navLabelActive: {
    color: colors.accent,
  },
  centerAddBtnWrapper: {
    position: 'relative',
    top: -20,
  },
  centerAddBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.skeleton,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
});
