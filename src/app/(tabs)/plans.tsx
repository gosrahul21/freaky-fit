import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Plus, Calendar, Share2, ChevronRight } from 'lucide-react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { hapticSelection, hapticImpactLight } from '../../utils/haptics';
import { shareWorkoutPlan } from '../../utils/share';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchPlans, setActivePlan } from '../../store/slices/plansSlice';
import { fetchUserProfile } from '../../store/slices/authSlice';

interface DayConfig {
  key: string;
  label: string;
  dayIndex: number; // 0: Sunday, 1: Monday, ..., 6: Saturday
}

const DAYS_OF_WEEK: DayConfig[] = [
  { key: 'monday', label: 'M', dayIndex: 1 },
  { key: 'tuesday', label: 'T', dayIndex: 2 },
  { key: 'wednesday', label: 'W', dayIndex: 3 },
  { key: 'thursday', label: 'T', dayIndex: 4 },
  { key: 'friday', label: 'F', dayIndex: 5 },
  { key: 'saturday', label: 'S', dayIndex: 6 },
  { key: 'sunday', label: 'S', dayIndex: 0 },
];

export default function PlansScreen() {
  const { colors, isDark } = useTheme();
  const s = makeStyles(colors, isDark);
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const activePlan = useAppSelector((state) => state.plans.activePlan);
  const allPlans = useAppSelector((state) => state.plans.plans);
  const plansStatus = useAppSelector((state) => state.plans.status);
  const profile = useAppSelector((state) => state.auth.profile);

  const [refreshing, setRefreshing] = useState(false);

  const loading = plansStatus === 'loading' && allPlans.length === 0;

  const fetchPlansData = useCallback(
    (force = false) => {
      dispatch(fetchUserProfile(force ? { force: true } : undefined));
      dispatch(fetchPlans(force ? { force: true } : undefined));
    },
    [dispatch]
  );

  useFocusEffect(
    useCallback(() => {
      fetchPlansData(false);
    }, [fetchPlansData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(fetchUserProfile({ force: true })),
      dispatch(fetchPlans({ force: true })),
    ]);
    setRefreshing(false);
  }, [dispatch]);

  const handleActivatePlan = async (planToActivate: any) => {
    try {
      hapticSelection();
      if (!planToActivate.id?.startsWith('sample-')) {
        await dispatch(setActivePlan(planToActivate.id));
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to activate plan');
    }
  };

  // If user has no plans, provide sample fallback plans matching mockup
  const effectiveActivePlan = activePlan || {
    id: 'sample-active',
    title: 'Fat burner',
    status: 'active',
    duration: '12 days',
    created_at: new Date().toISOString(),
  };

  const effectivePlans = allPlans.length > 0 ? allPlans : [
    { id: 'sample-1', title: '2 week abs', duration: '14 days', status: 'inactive' },
    { id: 'sample-2', title: 'Muscles Strength', duration: '8 weeks', status: 'inactive' },
    { id: 'sample-3', title: 'This', duration: '1 week', status: 'inactive' },
  ];

  const sessions = (activePlan?.planner_sessions && activePlan.planner_sessions.length > 0)
    ? activePlan.planner_sessions
    : [
        { day_of_week: 'monday', title: 'Lower Body Blast' },
        { day_of_week: 'tuesday', title: 'Core Shred' },
        { day_of_week: 'thursday', title: 'Upper Body Burn' },
        { day_of_week: 'friday', title: 'Full Body HIIT' },
        { day_of_week: 'saturday', title: 'Active Recovery' },
      ];

  if (loading) {
    return (
      <SafeAreaView style={[s.safeArea, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </SafeAreaView>
    );
  }

  // Today calculations
  const todayDayIndex = new Date().getDay();
  const scheduledDayKeys = sessions.map((s) => s.day_of_week?.toLowerCase());
  const workoutsThisWeek = sessions.length || 3;

  // Today session info
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayName = dayNames[todayDayIndex];
  const todaySession = sessions.find((s) => s.day_of_week?.toLowerCase() === todayName);
  const todayWorkoutTitle = todaySession?.title || 'Upper Body Burn';
  const todayWorkoutMeta = todaySession?.exercises_count 
    ? `45 min • ${todaySession.exercises_count} exercises` 
    : '45 min • 8 exercises';

  const currentActivePlan = effectiveActivePlan;
  const currentPlansList = effectivePlans;

  const userInitials = profile?.display_name
    ? profile.display_name.substring(0, 2).toUpperCase()
    : (profile?.email ? profile.email.substring(0, 2).toUpperCase() : 'RA');

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.container}>
        
        {/* Header Bar */}
        <View style={s.header}>
          <Text style={s.headerTitle}>Plans</Text>
          
          <View style={s.headerRight}>
            <View style={s.proBadge}>
              <Text style={s.proBadgeText}>PRO</Text>
            </View>
            <TouchableOpacity 
              style={s.avatarCircle}
              activeOpacity={0.8}
              onPress={() => router.push('/settings')}
            >
              <Text style={s.avatarInitials}>{userInitials}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={s.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
        >
          {/* Active Training Split Card */}
          {currentActivePlan && (
            <View style={s.activePlanCard}>
              {/* Card Header Row */}
              <View style={s.cardHeaderRow}>
                <Text style={s.cardBadgeText}>ACTIVE TRAINING SPLIT</Text>
                <TouchableOpacity 
                  style={s.shareBtn} 
                  activeOpacity={0.7}
                  onPress={() => shareWorkoutPlan(currentActivePlan, sessions)}
                >
                  <Share2 size={19} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Title & Progress Subtitle */}
              <Text style={s.activePlanTitle}>{currentActivePlan.title || 'Fat burner'}</Text>
              <Text style={s.activePlanSubtitle}>
                Day 3 of 12 • {workoutsThisWeek} workouts this week
              </Text>

              {/* Progress Bar */}
              <View style={s.progressBarTrack}>
                <View style={[s.progressBarFill, { width: '25%' }]} />
              </View>

              {/* Weekly Tracker Row */}
              <View style={s.weekDaysRow}>
                {DAYS_OF_WEEK.map((d) => {
                  const isToday = d.dayIndex === todayDayIndex;
                  const isScheduled = scheduledDayKeys.includes(d.key);

                  return (
                    <View 
                      key={d.key} 
                      style={[
                        s.dayPill,
                        isToday && s.dayPillToday,
                      ]}
                    >
                      <Text 
                        style={[
                          s.dayLabel,
                          isToday ? s.dayLabelToday : null,
                        ]}
                      >
                        {d.label}
                      </Text>
                      {isToday ? (
                        <View style={s.todayDot} />
                      ) : isScheduled ? (
                        <View style={s.scheduledDot} />
                      ) : (
                        <Text style={s.restDash}>–</Text>
                      )}
                    </View>
                  );
                })}
              </View>

              {/* Inner Divider */}
              <View style={s.cardDivider} />

              {/* Today's Workout Details & Start Button */}
              <View style={s.todaySectionRow}>
                <View style={s.todayInfoBox}>
                  <Text style={s.todayLabel}>Today</Text>
                  <Text style={s.todayTitle}>{todayWorkoutTitle}</Text>
                  <Text style={s.todayMeta}>{todayWorkoutMeta}</Text>
                </View>

                <TouchableOpacity 
                  style={s.startBtn}
                  activeOpacity={0.88}
                  onPress={() => {
                    hapticImpactLight();
                    if (currentActivePlan.id && !currentActivePlan.id.startsWith('sample-')) {
                      router.push(`/plan/${currentActivePlan.id}`);
                    } else {
                      router.push('/(tabs)/home');
                    }
                  }}
                >
                  <Text style={s.startBtnText}>START</Text>
                </TouchableOpacity>
              </View>

              {/* Edit weekly routine link */}
              <TouchableOpacity 
                style={s.editRoutineRow}
                activeOpacity={0.7}
                onPress={() => {
                  if (currentActivePlan.id && !currentActivePlan.id.startsWith('sample-')) {
                    router.push(`/plan/${currentActivePlan.id}`);
                  } else {
                    router.push('/plan-builder');
                  }
                }}
              >
                <Text style={s.editRoutineText}>Edit weekly routine</Text>
                <ChevronRight size={15} color={colors.accent} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          )}

          {/* "Your plans" Section */}
          <View style={s.yourPlansSection}>
            <View style={s.sectionHeaderRow}>
              <Text style={s.sectionTitle}>Your plans</Text>
              <Text style={s.plansCountText}>{currentPlansList.length} saved</Text>
            </View>

            {/* List of Saved Plans */}
            {currentPlansList.map((plan: any) => {
              const isActive = currentActivePlan && currentActivePlan.id === plan.id;
              const durationText = plan.duration || '4 weeks';

              return (
                <TouchableOpacity 
                  key={plan.id} 
                  style={s.planCard}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (plan.id && !plan.id.startsWith('sample-')) {
                      router.push(`/plan/${plan.id}`);
                    }
                  }}
                >
                  {/* Left: Calendar Icon Box */}
                  <View style={s.calendarIconBox}>
                    <Calendar size={20} color={colors.accent} strokeWidth={2.2} />
                  </View>

                  {/* Center: Title & Duration */}
                  <View style={s.planInfoBox}>
                    <Text style={s.planCardTitle} numberOfLines={1}>{plan.title}</Text>
                    <Text style={s.planDurationText}>{durationText}</Text>
                  </View>

                  {/* Right: Activate Button */}
                  <TouchableOpacity 
                    style={[
                      s.activateBtn,
                      isActive && s.activateBtnActive,
                    ]}
                    activeOpacity={0.75}
                    onPress={() => handleActivatePlan(plan)}
                  >
                    <Text 
                      style={[
                        s.activateBtnText,
                        isActive && s.activateBtnTextActive,
                      ]}
                    >
                      {isActive ? 'Active' : 'Activate'}
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}

            {/* Dashed "+ Create your plan" button */}
            <TouchableOpacity 
              style={s.createPlanDashedBtn}
              activeOpacity={0.8}
              onPress={() => {
                hapticImpactLight();
                router.push('/plan-builder');
              }}
            >
              <Plus size={18} color={colors.accent} strokeWidth={2.6} />
              <Text style={s.createPlanDashedText}>Create your plan</Text>
            </TouchableOpacity>
          </View>

          {/* Extra Bottom Spacer */}
          <View style={{ height: 110 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof import('../../contexts/ThemeContext').useTheme>['colors'], isDark: boolean) => StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: colors.background,
  },
  container: { 
    flex: 1, 
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.6,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  proBadge: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  proBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFD700',
    letterSpacing: 1.2,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: '#FFD700',
    backgroundColor: isDark ? '#1C1917' : '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  content: { 
    paddingHorizontal: 18,
    paddingTop: 4,
  },
  activePlanCard: {
    backgroundColor: isDark ? '#1C1917' : '#FFF7ED',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 94, 0, 0.16)' : '#FFEDD5',
    marginBottom: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.35 : 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  shareBtn: {
    padding: 4,
  },
  activePlanTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  activePlanSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  progressBarTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: isDark ? '#2E2A27' : '#E5E7EB',
    marginTop: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 7,
    marginBottom: 6,
  },
  dayPill: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: isDark ? '#23201D' : '#F3F4F6',
    borderWidth: 1,
    borderColor: isDark ? '#2E2A26' : '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  dayPillToday: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  dayLabelToday: {
    color: '#000000',
    fontWeight: '900',
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#000000',
  },
  scheduledDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.accent,
  },
  restDash: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textTertiary,
    lineHeight: 12,
  },
  cardDivider: {
    height: 1,
    backgroundColor: isDark ? '#2B2724' : '#F3F4F6',
    marginVertical: 18,
  },
  todaySectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  todayInfoBox: {
    flex: 1,
    marginRight: 12,
  },
  todayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textTertiary,
  },
  todayTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
    letterSpacing: -0.3,
  },
  todayMeta: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  startBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  startBtnText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  editRoutineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  editRoutineText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accent,
  },
  yourPlansSection: {
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  plansCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textTertiary,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 12,
  },
  calendarIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: isDark ? '#23201D' : '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  planInfoBox: {
    flex: 1,
  },
  planCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  planDurationText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  activateBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.accent,
    backgroundColor: 'transparent',
  },
  activateBtnActive: {
    backgroundColor: colors.accent,
  },
  activateBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.accent,
  },
  activateBtnTextActive: {
    color: '#000000',
  },
  createPlanDashedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: colors.accent,
    borderStyle: 'dashed',
    borderRadius: 20,
    paddingVertical: 16,
    marginTop: 6,
    backgroundColor: isDark ? 'rgba(255, 94, 0, 0.03)' : 'rgba(255, 94, 0, 0.02)',
  },
  createPlanDashedText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.accent,
  },
});
