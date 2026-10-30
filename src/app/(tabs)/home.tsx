import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native';
import { Search, ChevronRight, Plus, Check } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import { hapticImpactLight } from '../../utils/haptics';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const s = makeStyles(colors, isDark);
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [activePlan, setActivePlan] = useState<any>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    timeTrained: '2h 15m',
    calories: '1,240',
    dayStreak: 3,
    workoutsCompletedThisWeek: 3,
    weeklyTarget: 4,
  });

  const getWeekDates = () => {
    const dates = [];
    const today = new Date();
    const currentDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1; // Mon = 0, Sun = 6
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - currentDayIndex + i);
      dates.push(d);
    }
    return { dates, currentDayIndex };
  };
  const { dates: weekDates, currentDayIndex } = getWeekDates();

  const fetchHomeData = React.useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (profileData) setProfile(profileData);

      // 2. Active Plan
      let { data: planData } = await supabase
        .from('planner')
        .select('*, planner_sessions(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!planData) {
        const { data: fallbackPlan } = await supabase
          .from('planner')
          .select('*, planner_sessions(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (fallbackPlan) {
          planData = fallbackPlan;
        }
      }
      setActivePlan(planData || null);

      // 3. Recently saved workouts
      const { data: workoutsData } = await supabase
        .from('workouts')
        .select('*, workout_exercises(id)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(6);
      if (workoutsData) setRecentWorkouts(workoutsData);

      // 4. Workout Logs & Stats
      const { data: logsData } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', user.id)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false });

      if (logsData && logsData.length > 0) {
        const formatYMD = (date: Date) => {
          const offset = date.getTimezoneOffset();
          const localDate = new Date(date.getTime() - (offset * 60 * 1000));
          return localDate.toISOString().split('T')[0];
        };
        const logDates = logsData.map(log => formatYMD(new Date(log.completed_at)));
        const uniqueLogDates = Array.from(new Set(logDates));

        // Streak
        let currentStreak = 0;
        let d = new Date();
        if (!uniqueLogDates.includes(formatYMD(d))) {
          d.setDate(d.getDate() - 1);
        }
        while (uniqueLogDates.includes(formatYMD(d))) {
          currentStreak++;
          d.setDate(d.getDate() - 1);
        }

        // This week's logs
        const startOfWeek = new Date(weekDates[0]);
        startOfWeek.setHours(0, 0, 0, 0);
        const thisWeekLogs = logsData.filter(log => new Date(log.completed_at) >= startOfWeek);
        const totalDurationSec = thisWeekLogs.reduce((acc, curr) => acc + (curr.duration_seconds || 1800), 0);
        const hours = Math.floor(totalDurationSec / 3600);
        const mins = Math.floor((totalDurationSec % 3600) / 60);
        const timeTrainedStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
        const estCalories = Math.round(totalDurationSec * 0.15) || (thisWeekLogs.length * 350);

        setStats({
          timeTrained: timeTrainedStr || '2h 15m',
          calories: estCalories > 0 ? estCalories.toLocaleString() : '1,240',
          dayStreak: currentStreak || 3,
          workoutsCompletedThisWeek: thisWeekLogs.length || 3,
          weeklyTarget: Math.max(4, thisWeekLogs.length),
        });
      }
    } catch (err) {
      console.warn('Error fetching home data:', err);
    }
  }, [weekDates]);

  useFocusEffect(
    React.useCallback(() => {
      fetchHomeData();
    }, [fetchHomeData])
  );

  // Active workout / session details
  const getTodaySession = () => {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayName = dayNames[new Date().getDay()];
    const sessions = activePlan?.planner_sessions || [];
    return sessions.find((sess: any) => sess.day_of_week?.toLowerCase() === todayName);
  };

  const todaySession = getTodaySession();
  const sessionTitle = todaySession?.title || (activePlan ? activePlan.title : 'Upper Body Burn');
  const programLabel = activePlan ? `${activePlan.title.toUpperCase()} • DAY 3 OF 12` : 'FAT BURNER • DAY 3 OF 12';

  const userInitials = profile?.display_name
    ? profile.display_name.substring(0, 2).toUpperCase()
    : 'RA';

  return (
    <SafeAreaView style={[s.safeArea, { backgroundColor: colors.background }]}>
      <View style={[s.container, { backgroundColor: colors.background }]}>
        
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity 
            style={s.searchBtn} 
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/explore')}
          >
            <Search size={20} color={colors.textPrimary} strokeWidth={2.2} />
          </TouchableOpacity>

          <View style={s.headerRight}>
            <View style={s.proPill}>
              <Text style={s.proPillText}>PRO</Text>
            </View>

            <TouchableOpacity 
              style={s.avatarContainer} 
              onPress={() => router.push('/settings')}
              activeOpacity={0.85}
            >
              <View style={s.avatar}>
                <Text style={s.avatarText}>{userInitials}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={s.scrollView} 
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          
          {/* Hero Active Plan Card */}
          <View style={s.heroCard}>
            <Text style={s.heroBadge}>{programLabel}</Text>
            <Text style={s.heroTitle}>{sessionTitle}</Text>

            {/* Pill chips */}
            <View style={s.chipsRow}>
              <View style={s.chip}>
                <Text style={s.chipText}>45 min</Text>
              </View>
              <View style={s.chip}>
                <Text style={s.chipText}>8 exercises</Text>
              </View>
              <View style={s.chip}>
                <Text style={s.chipText}>Chest • Core</Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={s.progressBarTrack}>
              <View style={[s.progressBarFill, { width: '35%' }]} />
            </View>

            {/* Start Workout CTA */}
            <TouchableOpacity 
              style={s.heroCtaBtn} 
              activeOpacity={0.88}
              onPress={() => {
                hapticImpactLight();
                if (activePlan) {
                  router.push(`/plan/${activePlan.id}`);
                } else if (recentWorkouts.length > 0) {
                  router.push(`/workout/preview/${recentWorkouts[0].id}`);
                } else {
                  router.push('/plans');
                }
              }}
            >
              <Text style={s.heroCtaText}>START WORKOUT</Text>
            </TouchableOpacity>
          </View>

          {/* This Week Tracker Card */}
          <View style={s.weekCard}>
            <View style={s.weekHeader}>
              <Text style={s.weekTitle}>This week</Text>
              <Text style={s.weekSub}>
                {stats.workoutsCompletedThisWeek} of {stats.weeklyTarget} workouts • {stats.dayStreak} day streak
              </Text>
            </View>

            <View style={s.weekDaysRow}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((dayLabel, index) => {
                const isToday = index === currentDayIndex;
                const dateNum = weekDates[index].getDate();
                const isCompleted = index < currentDayIndex; // Completed past days in streak

                return (
                  <View key={index} style={s.dayColumn}>
                    <Text style={[s.dayColumnLabel, isToday && s.dayColumnLabelToday]}>
                      {dayLabel}
                    </Text>

                    {isCompleted ? (
                      <View style={s.dayNodeCompleted}>
                        <Check size={14} color="#FFFFFF" strokeWidth={3} />
                      </View>
                    ) : isToday ? (
                      <View style={s.dayNodeToday}>
                        <Text style={s.dayNodeTodayText}>{dateNum}</Text>
                      </View>
                    ) : (
                      <View style={s.dayNodeUpcoming}>
                        {index === 5 ? (
                          <View style={s.dayNodeDot} />
                        ) : (
                          <Text style={s.dayNodeUpcomingText}>{dateNum}</Text>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          {/* 3 Stats Columns Row */}
          <View style={s.statsRow}>
            {/* Stat 1: Time trained */}
            <View style={s.statBox}>
              <Text style={s.statValue}>{stats.timeTrained}</Text>
              <Text style={s.statLabel}>Time trained</Text>
            </View>

            {/* Stat 2: Calories */}
            <View style={s.statBox}>
              <Text style={s.statValue}>{stats.calories}</Text>
              <Text style={s.statLabel}>Calories</Text>
            </View>

            {/* Stat 3: Day streak */}
            <View style={s.statBox}>
              <Text style={s.statValue}>{stats.dayStreak}</Text>
              <Text style={s.statLabel}>Day streak</Text>
            </View>
          </View>

          {/* Recently Saved Section */}
          <View style={s.section}>
            <View style={s.sectionHeaderRow}>
              <Text style={s.sectionHeading}>Recently saved</Text>
              <TouchableOpacity 
                activeOpacity={0.7} 
                onPress={() => router.push('/(tabs)/library')}
              >
                <Text style={s.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.recentCardsScroll}
            >
              {/* Import A Workout Card (Dashed Orange Border) */}
              <TouchableOpacity 
                style={s.importWorkoutCard}
                activeOpacity={0.85}
                onPress={() => {
                  hapticImpactLight();
                  router.push('/importer');
                }}
              >
                <View style={s.importCardDashedBorder}>
                  <View style={s.importPlusCircle}>
                    <Plus size={24} color="#FFFFFF" strokeWidth={3} />
                  </View>
                </View>
                <Text style={s.recentCardTitle} numberOfLines={1}>Import a workout</Text>
                <Text style={s.recentCardSubtitle}>Social & web</Text>
              </TouchableOpacity>

              {/* Dynamic or Default Saved Workout Cards */}
              {recentWorkouts.length > 0 ? (
                recentWorkouts.map((w) => {
                  const exerciseCount = Array.isArray(w.workout_exercises)
                    ? w.workout_exercises.length
                    : (w.exercise_count || 1);

                  return (
                    <TouchableOpacity 
                      key={w.id}
                      style={s.savedWorkoutCard}
                      activeOpacity={0.88}
                      onPress={() => router.push(`/workout/preview/${w.id}`)}
                    >
                      <View style={s.savedCardImageWrap}>
                        {w.thumbnail_url ? (
                          <Image source={{ uri: w.thumbnail_url }} style={s.savedCardImage} resizeMode="cover" />
                        ) : (
                          <View style={s.savedCardImagePlaceholder} />
                        )}
                        <View style={s.exerciseBadge}>
                          <Text style={s.exerciseBadgeText}>{exerciseCount} exercise{exerciseCount > 1 ? 's' : ''}</Text>
                        </View>
                      </View>
                      <Text style={s.recentCardTitle} numberOfLines={2}>
                        {w.title || 'Custom Workout'}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <>
                  {/* Default Workout Card 1 */}
                  <TouchableOpacity 
                    style={s.savedWorkoutCard}
                    activeOpacity={0.88}
                    onPress={() => router.push('/importer')}
                  >
                    <View style={s.savedCardImageWrap}>
                      <View style={[s.savedCardImagePlaceholder, { backgroundColor: isDark ? '#26201B' : '#FFF0E6' }]} />
                      <View style={s.exerciseBadge}>
                        <Text style={s.exerciseBadgeText}>1 exercise</Text>
                      </View>
                    </View>
                    <Text style={s.recentCardTitle} numberOfLines={2}>
                      One-Arm{'\n'}Dumbbell Row
                    </Text>
                  </TouchableOpacity>

                  {/* Default Workout Card 2 */}
                  <TouchableOpacity 
                    style={s.savedWorkoutCard}
                    activeOpacity={0.88}
                    onPress={() => router.push('/importer')}
                  >
                    <View style={s.savedCardImageWrap}>
                      <View style={[s.savedCardImagePlaceholder, { backgroundColor: isDark ? '#21262D' : '#F0F4FA' }]} />
                      <View style={s.exerciseBadge}>
                        <Text style={s.exerciseBadgeText}>4 exercises</Text>
                      </View>
                    </View>
                    <Text style={s.recentCardTitle} numberOfLines={2}>
                      Bigger Abs{'\n'}Workout
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (
  colors: ReturnType<typeof import('../../contexts/ThemeContext').useTheme>['colors'],
  isDark: boolean
) => StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: isDark ? '#18181B' : colors.card,
    borderWidth: 1,
    borderColor: isDark ? '#27272A' : colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  proPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: isDark ? 'rgba(229, 165, 68, 0.15)' : 'rgba(229, 165, 68, 0.15)',
  },
  proPillText: {
    fontSize: 13,
    fontWeight: '800',
    color: isDark ? '#E5A544' : '#C27803',
    letterSpacing: 1,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: isDark ? '#1E1E22' : colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: isDark ? '#D49B45' : '#E0A13C',
  },
  avatarText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 110,
    gap: 20,
  },

  // --- Hero Active Plan Card ---
  heroCard: {
    backgroundColor: isDark ? '#1A1816' : '#FFF7F2',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: isDark ? '#2A2520' : '#FFDFCE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: isDark ? 0.3 : 0.06,
    shadowRadius: 16,
    elevation: 8,
  },
  heroBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    backgroundColor: isDark ? '#272421' : '#F4EAE2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: isDark ? '#D1D1D6' : colors.textSecondary,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: isDark ? '#302C28' : '#F0E2D6',
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  heroCtaBtn: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  heroCtaText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },

  // --- This Week Tracker Card ---
  weekCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: isDark ? 0.2 : 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  weekSub: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayColumn: {
    alignItems: 'center',
    gap: 10,
  },
  dayColumnLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textTertiary,
  },
  dayColumnLabelToday: {
    color: colors.textPrimary,
    fontWeight: '900',
  },
  dayNodeCompleted: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNodeToday: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: isDark ? '#1E1E23' : '#FFF0E6',
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNodeTodayText: {
    fontSize: 14,
    fontWeight: '800',
    color: isDark ? '#FFFFFF' : colors.accent,
  },
  dayNodeUpcoming: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: isDark ? '#1A1A1E' : '#F2ECE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNodeUpcomingText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textTertiary,
  },
  dayNodeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },

  // --- Stats Row ---
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.2 : 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },

  // --- Recently Saved Section ---
  section: {
    marginTop: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accent,
  },
  recentCardsScroll: {
    gap: 14,
    paddingRight: 16,
  },
  importWorkoutCard: {
    width: 124,
  },
  importCardDashedBorder: {
    width: 124,
    height: 124,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.accent,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: isDark ? '#1C1613' : '#FFF7F2',
  },
  importPlusCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedWorkoutCard: {
    width: 124,
  },
  savedCardImageWrap: {
    width: 124,
    height: 124,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  savedCardImage: {
    width: '100%',
    height: '100%',
  },
  savedCardImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surfaceAlt,
  },
  exerciseBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  exerciseBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  recentCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 18,
    marginBottom: 2,
  },
  recentCardSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
  },
});
