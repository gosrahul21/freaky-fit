import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Flame, Trophy, TrendingUp, Calendar, CalendarDays, Home as HomeIcon, Bookmark, Plus, Activity, Compass } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

export default function StreaksScreen() {
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const router = useRouter();

  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data, error } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', user.id)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false });
        
      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const formatYMD = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };
  const logDates = logs.map(log => formatYMD(new Date(log.completed_at)));
  const uniqueLogDates = Array.from(new Set(logDates)); // Already sorted descending

  // 1. Current Streak
  let currentStreak = 0;
  let d = new Date();
  if (!uniqueLogDates.includes(formatYMD(d))) {
    d.setDate(d.getDate() - 1); // shift to yesterday if no workout today
  }
  while (uniqueLogDates.includes(formatYMD(d))) {
    currentStreak++;
    d.setDate(d.getDate() - 1);
  }

  // 2. Best Streak
  let bestStreak = 0;
  if (uniqueLogDates.length > 0) {
    let currentBest = 1;
    bestStreak = 1;
    for (let i = 0; i < uniqueLogDates.length - 1; i++) {
      const d1 = new Date(uniqueLogDates[i]);
      const d2 = new Date(uniqueLogDates[i + 1]);
      const diffTime = Math.abs(d1.getTime() - d2.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      if (diffDays === 1) {
        currentBest++;
        if (currentBest > bestStreak) bestStreak = currentBest;
      } else {
        currentBest = 1;
      }
    }
  }

  // 3. Consistency (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const activeDaysInLast30 = uniqueLogDates.filter(dateStr => new Date(dateStr) >= thirtyDaysAgo).length;
  const consistency = Math.round((activeDaysInLast30 / 30) * 100);

  // 4. Heatmap Data (Last 30 days up to today)
  const heatmapData = Array.from({ length: 30 }, (_, i) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - (29 - i));
    const ymd = formatYMD(targetDate);
    
    const logsOnDay = logDates.filter(dateStr => dateStr === ymd).length;
    let intensity = 0;
    if (logsOnDay === 1) intensity = 1;
    else if (logsOnDay === 2) intensity = 2;
    else if (logsOnDay >= 3) intensity = 3;
    
    return {
      date: targetDate.getDate(),
      intensity
    };
  });

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
            <Text style={s.streakNumber}>{currentStreak}<Text style={s.streakSuffix}> Days</Text></Text>
            <Text style={s.streakSubtitle}>
              {currentStreak > 0 ? "You're on fire! Keep it going." : "Start your streak today!"}
            </Text>
          </View>

          {/* Stat Row */}
          <View style={s.statsRow}>
            <View style={s.statBox}>
              <Trophy size={20} color={colors.accent} />
              <Text style={s.statValue}>{bestStreak}</Text>
              <Text style={s.statLabel}>Best Streak</Text>
            </View>
            <View style={s.statBox}>
              <Activity size={20} color={colors.success} />
              <Text style={s.statValue}>{consistency}%</Text>
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
            
            {logs.length > 0 ? (
              <>
                <View style={s.milestoneRow}>
                  <View style={[s.milestoneIcon, { backgroundColor: 'rgba(255, 94, 0, 0.15)' }]}>
                    <Flame size={20} color={colors.accent} />
                  </View>
                  <View style={s.milestoneTextContainer}>
                    <Text style={s.milestoneTitle}>
                      {bestStreak >= 10 ? '10+ Day Streak' : `${bestStreak} Day Best Streak`}
                    </Text>
                    <Text style={s.milestoneDesc}>Personal Record</Text>
                  </View>
                </View>
                
                <View style={s.milestoneRow}>
                  <View style={[s.milestoneIcon, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                    <TrendingUp size={20} color={colors.success} />
                  </View>
                  <View style={s.milestoneTextContainer}>
                    <Text style={s.milestoneTitle}>{logs.length} Workouts Total</Text>
                    <Text style={s.milestoneDesc}>Since {formatYMD(new Date(logs[logs.length-1].completed_at))}</Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={[s.milestoneRow, { justifyContent: 'center' }]}>
                <Text style={{color: colors.textSecondary}}>Complete workouts to unlock milestones!</Text>
              </View>
            )}
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
