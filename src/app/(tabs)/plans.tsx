import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, } from 'react-native';
import { Home as HomeIcon, Bookmark, Plus, CalendarDays, Flame, ChevronRight, Play, MoreHorizontal } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';

export default function PlansScreen() {
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const router = useRouter();
  
  const [activePlan, setActivePlan] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [currentWeek, setCurrentWeek] = React.useState(1);

  React.useEffect(() => {
    fetchActivePlan();
  }, []);

  const calculateCurrentWeek = (startDateStr: string, totalWeeks: number) => {
    if (!startDateStr) return 1;
    const start = new Date(startDateStr).getTime();
    const now = new Date().getTime();
    const diffTime = now - start;
    if (diffTime < 0) return 1;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const week = Math.floor(diffDays / 7) + 1;
    return Math.min(week, totalWeeks || 4);
  };

  const fetchActivePlan = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('planner')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (data) {
        setActivePlan(data);
        setCurrentWeek(calculateCurrentWeek(data.start_date, data.duration_weeks));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[s.safeArea, { backgroundColor: colors.background }]}>
      <View style={[s.container, { backgroundColor: colors.background }]}>
        
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
          {/* Header */}
          <View style={s.header}>
            <Text style={s.headerTitle}>PLANS</Text>
          </View>

          {/* Active Plan Dashboard */}
          {activePlan ? (
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Active Plan</Text>
                <TouchableOpacity onPress={() => router.push(`/plan/${activePlan.id}`)}>
                  <Text style={s.sectionAction}>Manage</Text>
                </TouchableOpacity>
              </View>

              <View style={s.activePlanCard}>
                <View style={s.activePlanTopRow}>
                  <View>
                    <Text style={s.activePlanName}>{activePlan.title}</Text>
                    <Text style={s.activePlanDuration}>{activePlan.duration_weeks} Weeks</Text>
                  </View>
                  <View style={s.progressCircle}>
                    <Text style={s.progressCircleText}>{Math.round(((currentWeek - 1) / (activePlan.duration_weeks || 4)) * 100)}%</Text>
                  </View>
                </View>

                <View style={s.weekProgressBar}>
                  {Array.from({ length: Math.min(12, activePlan.duration_weeks || 4) }).map((_, i) => (
                    <View key={i} style={[
                      s.weekNode, 
                      i + 1 < currentWeek && s.weekNodeCompleted,
                      i + 1 === currentWeek && s.weekNodeActive
                    ]} />
                  ))}
                </View>
                
                <Text style={s.weekLabel}>Week {currentWeek} of {activePlan.duration_weeks}</Text>
              </View>

            </View>
          ) : (
            <View style={[s.section, { alignItems: 'center', paddingVertical: 20 }]}>
              <Text style={{color: colors.textSecondary, marginBottom: 8}}>You don't have an active plan yet.</Text>
            </View>
          )}

          {/* Discover Templates */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Discover Plans</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.horizontalScroll}>
              <TouchableOpacity style={s.templateCard} activeOpacity={0.9}>
                <View style={[s.templateImage, { backgroundColor: '#FFD700' }]} />
                <Text style={s.templateTitle} numberOfLines={1}>Classic PPL</Text>
                <Text style={s.templateSubtitle}>6 Days/wk • 8 Weeks</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.templateCard} activeOpacity={0.9}>
                <View style={[s.templateImage, { backgroundColor: '#4ade80' }]} />
                <Text style={s.templateTitle} numberOfLines={1}>Upper/Lower Split</Text>
                <Text style={s.templateSubtitle}>4 Days/wk • 12 Weeks</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.templateCard} activeOpacity={0.9}>
                <View style={[s.templateImage, { backgroundColor: '#60a5fa' }]} />
                <Text style={s.templateTitle} numberOfLines={1}>Couch to 5k</Text>
                <Text style={s.templateSubtitle}>3 Days/wk • 9 Weeks</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Custom Builder */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Custom Builder</Text>
            </View>
            <TouchableOpacity style={s.customBuilderCard} activeOpacity={0.9} onPress={() => router.push('/plan-builder')}>
              <View style={s.customBuilderIcon}>
                <Plus size={24} color={colors.textPrimary} />
              </View>
              <View style={s.customBuilderTextContainer}>
                <Text style={s.customBuilderTitle}>Create your own plan</Text>
                <Text style={s.customBuilderDesc}>Map out your own mesocycle from scratch</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof import('../../contexts/ThemeContext').useTheme>['colors']) => StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  content: { paddingHorizontal: 16 },
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
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accent,
  },
  activePlanCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 16,
  },
  activePlanTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  activePlanName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  activePlanDuration: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  progressCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircleText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  weekProgressBar: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  weekNode: {
    flex: 1,
    height: 6,
    backgroundColor: colors.skeleton,
    borderRadius: 3,
  },
  weekNodeCompleted: {
    backgroundColor: colors.accent,
  },
  weekNodeActive: {
    backgroundColor: colors.accentLight,
  },
  weekLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: '600',
    textAlign: 'right',
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 12,
    marginTop: 8,
  },
  nextWorkoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  nextWorkoutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nextWorkoutIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextWorkoutDay: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '700',
    marginBottom: 2,
  },
  nextWorkoutTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  horizontalScroll: {
    gap: 16,
    paddingRight: 16,
  },
  templateCard: {
    width: 160,
  },
  templateImage: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    marginBottom: 8,
  },
  templateTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  templateSubtitle: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  customBuilderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.textTertiary,
    backgroundColor: colors.skeleton,
    gap: 16,
  },
  customBuilderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  customBuilderTextContainer: {
    flex: 1,
  },
  customBuilderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  customBuilderDesc: {
    fontSize: 12,
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
