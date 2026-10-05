import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Modal, Pressable } from 'react-native';
import { Search, Crown, ChevronRight, Plus, Camera, Scale, CalendarDays, MoreHorizontal, Home as HomeIcon, Bookmark, MessageSquare, X, Download, FolderPlus, CalendarPlus, Flame, User, Compass } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const s = makeStyles(colors);
  const router = useRouter();
  const [showFeedbackTour, setShowFeedbackTour] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [activePlan, setActivePlan] = useState<any>(null);

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

  React.useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (profileData) setProfile(profileData);

    const { data: planData } = await supabase
      .from('planner')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();
    if (planData) setActivePlan(planData);
  };

  return (
    <SafeAreaView style={[s.safeArea, { backgroundColor: colors.background }]}>
      <View style={[s.container, { backgroundColor: colors.background }]}>
        
        {/* Main Header */}
        <View style={[s.header, { backgroundColor: colors.background, borderBottomColor: colors.navBorder }]}>
          <View style={s.headerLeft}>
            <TouchableOpacity style={[s.searchBtn, { backgroundColor: colors.card }]}>
              <Search size={24} color={colors.textPrimary} strokeWidth={2.2} />
            </TouchableOpacity>
            <Text style={[s.headerTitle, { color: colors.textPrimary }]}>HOME</Text>
          </View>
          
          <TouchableOpacity style={s.avatarContainer} onPress={() => router.push('/settings')}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>
                {profile?.display_name ? profile.display_name.substring(0, 2).toUpperCase() : 'RG'}
              </Text>
            </View>
            <View style={s.crownBadge}>
              <Crown size={12} color="#D97706" fill="#FBBF24" />
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={s.scrollView} 
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          
          {/* Active Planner Banner */}
          <View style={s.activePlanCard}>
            {activePlan ? (
              <>
                <View style={s.activePlanTop}>
                  <Text style={s.activePlanSubtitle}>ACTIVE PLAN</Text>
                  <Text style={s.activePlanTitle}>{activePlan.title} 🔥</Text>
                </View>
                
                <View style={s.activePlanExercises}>
                  <Text style={s.activePlanExerciseText}>Your next session is ready.</Text>
                </View>
                
                <TouchableOpacity style={s.activePlanBtn} activeOpacity={0.8} onPress={() => router.push(`/plan/${activePlan.id}`)}>
                  <Text style={s.activePlanBtnText}>VIEW PLAN</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={s.activePlanTop}>
                  <Text style={s.activePlanSubtitle}>NO ACTIVE PLAN</Text>
                  <Text style={s.activePlanTitle}>Ready to start?</Text>
                </View>
                
                <View style={s.activePlanExercises}>
                  <Text style={s.activePlanExerciseText}>Create a new day-by-day plan or import a workout to get started.</Text>
                </View>
                
                <TouchableOpacity style={s.activePlanBtn} activeOpacity={0.8} onPress={() => router.push('/plans')}>
                  <Text style={s.activePlanBtnText}>BROWSE PLANS</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Calendar Strip */}
          <View style={s.calendarStrip}>
            {['M','T','W','T','F','S','S'].map((day, i) => {
              const isToday = i === currentDayIndex;
              const date = weekDates[i].getDate();
              return (
                <TouchableOpacity key={i} style={s.calendarDay}>
                  {isToday ? (
                    <View style={s.calendarDayLabelTodayContainer}>
                      <Text style={s.calendarDayLabelToday}>{day}</Text>
                    </View>
                  ) : (
                    <Text style={s.calendarDayLabel}>{day}</Text>
                  )}
                  
                  <View style={[s.calendarDateNode, isToday && s.calendarDateNodeToday]}>
                    <Text style={[s.calendarDateText, isToday && s.calendarDateTextToday]}>
                      {date}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Recently Saved Section */}
          <View style={s.section}>
            <TouchableOpacity style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Recently saved</Text>
              <ChevronRight size={16} color={colors.textTertiary} />
            </TouchableOpacity>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={s.recentScroll}
              contentContainerStyle={s.recentScrollContent}
            >
              {/* Card 1: Import */}
              <TouchableOpacity style={s.recentCard} activeOpacity={0.9} onPress={() => router.push('/importer')}>
                <View style={[s.recentCardImage, { backgroundColor: colors.skeleton }]}>
                  <View style={s.importCardVisual}>
                    <View style={s.importPlusBtn}>
                      <Plus size={16} color={colors.textInverse} strokeWidth={3} />
                    </View>
                  </View>
                </View>
                <Text style={s.recentCardTitle} numberOfLines={1}>Import a Work...</Text>
                <Text style={s.recentCardSubtitle}>Social & web</Text>
              </TouchableOpacity>
              
              {/* Card 2 */}
              <TouchableOpacity style={s.recentCard} activeOpacity={0.9} onPress={() => router.push('/workout/preview/mock')}>
                <View style={s.recentCardImage}>
                  <Text style={s.recentCardIconText}>💪</Text>
                  <Text style={s.recentCardTag}>BACK & PULL</Text>
                </View>
                <Text style={s.recentCardTitle} numberOfLines={1}>Build a Bigger ...</Text>
                <Text style={s.recentCardSubtitle}>4 exercises</Text>
              </TouchableOpacity>
              
              {/* Card 3 */}
              <TouchableOpacity style={s.recentCard} activeOpacity={0.9} onPress={() => router.push('/workout/preview/mock')}>
                <View style={s.recentCardImage}>
                  <Text style={s.recentCardIconText}>🔥</Text>
                  <Text style={s.recentCardTag}>HYPERTROPHY</Text>
                </View>
                <Text style={s.recentCardTitle} numberOfLines={1}>Build a Bigger ...</Text>
                <Text style={s.recentCardSubtitle}>4 exercises</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>




        </ScrollView>



        </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof import("../../contexts/ThemeContext").useTheme>["colors"]) => StyleSheet.create({
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.backgroundElevated,
  },
  avatarText: {
    color: colors.backgroundElevated,
    fontSize: 12,
    fontWeight: '700',
  },
  crownBadge: {
    position: 'absolute',
    top: -6,
    right: -4,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 2,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.6)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
    gap: 20,
  },
  // --- Active Plan Card ---
  activePlanCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.accentDark,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  activePlanTop: {
    marginBottom: 16,
  },
  activePlanSubtitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  activePlanTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  activePlanExercises: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 6,
  },
  activePlanExerciseText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activePlanBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePlanBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  calendarStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.navBorder,
  },
  calendarDay: {
    alignItems: 'center',
    gap: 6,
  },
  calendarDayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
  },
  calendarDayLabelTodayContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(156, 163, 175, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDayLabelToday: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  calendarDateNode: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDateNodeToday: {
    backgroundColor: colors.textPrimary,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  calendarDateText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  calendarDateTextToday: {
    color: colors.backgroundElevated,
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  recentScroll: {
    marginHorizontal: -16,
  },
  recentScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  recentCard: {
    width: 112,
  },
  recentCardImage: {
    width: 112,
    height: 112,
    borderRadius: 16,
    backgroundColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 8,
  },
  importCardVisual: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  importPlusBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentCardIconText: {
    fontSize: 28,
    marginBottom: 4,
  },
  recentCardTag: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  recentCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  recentCardSubtitle: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 2,
  },
  progressGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  progressCard: {
    flex: 1,
    height: 120,
    backgroundColor: colors.skeleton,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
    alignItems: 'center',
  },
  progressCardVisual: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scaleIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  scaleIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendDotWrapper: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  progressCardHint: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  todayHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  todayHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  todayTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  todayDate: {
    fontSize: 14,
    color: colors.textTertiary,
    marginLeft: 4,
  },
  calendarBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.skeleton,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeRoutineCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.navBorder,
  },
  activeRoutineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  activeRoutineTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagBadge: {
    backgroundColor: colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  tagBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accent,
  },
  routineDuration: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textTertiary,
  },
  routineTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  routineDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  startSessionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    marginTop: 16,
    paddingTop: 12,
  },
  avatarStack: {
    flexDirection: 'row',
  },
  miniAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.cardBorder,
    borderWidth: 2,
    borderColor: colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatarText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  startBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  startBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
  },
  feedbackFloatBtn: {
    position: 'absolute',
    bottom: 96,
    right: 16,
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  feedbackFloatText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  }
  , feedbackTooltip: {
    position: 'absolute',
    bottom: 110,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    zIndex: 40,
  },
  tooltipTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tooltipLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
    paddingRight: 16,
  },
  tooltipIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipTextContent: {
    flex: 1,
  },
  tooltipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  tooltipDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 18,
  },
  tooltipCloseBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  tooltipStepText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  tooltipNextText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  }

});
