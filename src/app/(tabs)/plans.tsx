import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, Alert, ActivityIndicator } from 'react-native';
import { Plus, CalendarDays, Flame, ChevronRight, Play, CheckCircle2, Dumbbell, X, Sparkles, Crown } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import { hapticImpactLight, hapticSelection } from '../../utils/haptics';

interface PlanTemplate {
  id: string;
  title: string;
  daysPerWeek: string;
  badge: string;
  color: string;
  description: string;
  days: { day: string; title: string }[];
}

const TEMPLATES: PlanTemplate[] = [
  {
    id: 'ppl',
    title: 'Classic PPL',
    daysPerWeek: '6 Days / week',
    badge: 'Popular',
    color: '#FF5E00',
    description: 'High-frequency bodybuilding split focusing on Push (Chest/Shoulders/Triceps), Pull (Back/Biceps), and Legs twice weekly.',
    days: [
      { day: 'monday', title: 'Push Day A' },
      { day: 'tuesday', title: 'Pull Day A' },
      { day: 'wednesday', title: 'Legs Day A' },
      { day: 'thursday', title: 'Push Day B' },
      { day: 'friday', title: 'Pull Day B' },
      { day: 'saturday', title: 'Legs Day B' },
    ]
  },
  {
    id: 'upper_lower',
    title: 'Upper / Lower Split',
    daysPerWeek: '4 Days / week',
    badge: 'Strength',
    color: '#10B981',
    description: 'Balanced 4-day split alternating between Upper body and Lower body workouts with ample recovery days.',
    days: [
      { day: 'monday', title: 'Upper Body A' },
      { day: 'tuesday', title: 'Lower Body A' },
      { day: 'thursday', title: 'Upper Body B' },
      { day: 'friday', title: 'Lower Body B' },
    ]
  },
  {
    id: 'full_body',
    title: 'Full Body 3-Day',
    daysPerWeek: '3 Days / week',
    badge: 'Efficiency',
    color: '#3B82F6',
    description: 'Hits every major muscle group 3 times a week with alternating compound movements. Perfect for busy athletes.',
    days: [
      { day: 'monday', title: 'Full Body A' },
      { day: 'wednesday', title: 'Full Body B' },
      { day: 'friday', title: 'Full Body C' },
    ]
  },
  {
    id: 'bro_split',
    title: '5-Day Muscle Target',
    daysPerWeek: '5 Days / week',
    badge: 'Hypertrophy',
    color: '#8B5CF6',
    description: 'Target one primary muscle group per session for extreme volume and deep isolation pump.',
    days: [
      { day: 'monday', title: 'Chest Day' },
      { day: 'tuesday', title: 'Back Day' },
      { day: 'wednesday', title: 'Shoulders Day' },
      { day: 'thursday', title: 'Legs Day' },
      { day: 'friday', title: 'Arms & Core' },
    ]
  }
];

const DAY_ABBRS = [
  { key: 'monday', label: 'M' },
  { key: 'tuesday', label: 'T' },
  { key: 'wednesday', label: 'W' },
  { key: 'thursday', label: 'T' },
  { key: 'friday', label: 'F' },
  { key: 'saturday', label: 'S' },
  { key: 'sunday', label: 'S' },
];

export default function PlansScreen() {
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const router = useRouter();
  
  const [activePlan, setActivePlan] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Discover template modal
  const [selectedTemplate, setSelectedTemplate] = useState<PlanTemplate | null>(null);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    fetchActivePlan();
  }, []);

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
        const { data: sData } = await supabase
          .from('planner_sessions')
          .select('*')
          .eq('planner_id', data.id);
        setSessions(sData || []);
      } else {
        setActivePlan(null);
        setSessions([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateTemplate = async (template: PlanTemplate) => {
    hapticImpactLight();
    setActivating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Sign In Required', 'Please sign in to create and activate plans.');
        setActivating(false);
        return;
      }

      // 1. Deactivate old plans
      await supabase
        .from('planner')
        .update({ status: 'inactive' })
        .eq('user_id', user.id)
        .eq('status', 'active');

      // 2. Insert new plan (without duration)
      const { data: newPlan, error: pErr } = await supabase
        .from('planner')
        .insert([
          {
            user_id: user.id,
            title: template.title,
            description: template.description,
            start_date: new Date().toISOString().split('T')[0],
            status: 'active'
          }
        ])
        .select()
        .single();

      if (pErr) throw pErr;

      // 3. Insert sessions for this template
      const sessionInserts = template.days.map(d => ({
        planner_id: newPlan.id,
        title: d.title,
        week_number: 1,
        day_of_week: d.day,
        status: 'planned'
      }));

      const { error: sErr } = await supabase
        .from('planner_sessions')
        .insert(sessionInserts);

      if (sErr) throw sErr;

      setSelectedTemplate(null);
      await fetchActivePlan();
      router.push(`/plan/${newPlan.id}`);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to activate plan');
    } finally {
      setActivating(false);
    }
  };

  const scheduledDayKeys = sessions.map(s => s.day_of_week?.toLowerCase());

  return (
    <SafeAreaView style={[s.safeArea, { backgroundColor: colors.background }]}>
      <View style={[s.container, { backgroundColor: colors.background }]}>
        
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
          {/* Header with Standardized Avatar Button */}
          <View style={s.header}>
            <Text style={s.headerTitle}>PLANS</Text>
            <TouchableOpacity
              style={s.avatarContainer}
              onPress={() => router.push('/settings')}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' }}
                style={s.avatar}
              />
              <View style={s.proBadge}>
                <Crown size={8} color="#000" strokeWidth={3} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Active Plan Dashboard */}
          {activePlan ? (
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Active Plan</Text>
                <TouchableOpacity onPress={() => router.push(`/plan/${activePlan.id}`)}>
                  <Text style={s.sectionAction}>Manage Schedule</Text>
                </TouchableOpacity>
              </View>

              <View style={s.activePlanCard}>
                <View style={s.activePlanTopRow}>
                  <View style={{ flex: 1 }}>
                    <View style={s.activeSplitBadge}>
                      <View style={s.activeSplitDot} />
                      <Text style={s.activeSplitBadgeText}>ACTIVE TRAINING SPLIT</Text>
                    </View>
                    <Text style={s.activePlanName}>{activePlan.title}</Text>
                    <Text style={s.activePlanMeta}>
                      {sessions.length > 0 ? `${sessions.length} Training Days / Week` : 'No days configured yet'}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={s.manageBtn}
                    onPress={() => router.push(`/plan/${activePlan.id}`)}
                  >
                    <ChevronRight size={20} color={colors.accent} />
                  </TouchableOpacity>
                </View>

                {/* Weekly Split Days Bar */}
                <View style={s.weekDaysRow}>
                  {DAY_ABBRS.map((dayItem) => {
                    const isScheduled = scheduledDayKeys.includes(dayItem.key);
                    return (
                      <View 
                        key={dayItem.key} 
                        style={[s.dayPill, isScheduled && s.dayPillActive]}
                      >
                        <Text style={[s.dayPillText, isScheduled && s.dayPillTextActive]}>
                          {dayItem.label}
                        </Text>
                        {isScheduled && <View style={s.dayPillDot} />}
                      </View>
                    );
                  })}
                </View>

                <TouchableOpacity 
                  style={s.planQuickAction}
                  onPress={() => router.push(`/plan/${activePlan.id}`)}
                  activeOpacity={0.85}
                >
                  <CalendarDays size={16} color={colors.accent} />
                  <Text style={s.planQuickActionText}>View & Edit Weekly Routine</Text>
                  <ChevronRight size={16} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={[s.section, s.emptyPlanCard]}>
              <View style={s.emptyPlanIcon}>
                <CalendarDays size={28} color={colors.accent} />
              </View>
              <Text style={s.emptyPlanTitle}>No Active Workout Plan</Text>
              <Text style={s.emptyPlanSubtitle}>
                Choose a proven training template below or build your custom split.
              </Text>
            </View>
          )}

          {/* Discover Templates */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Sparkles size={18} color={colors.accent} />
                <Text style={s.sectionTitle}>Discover Plans</Text>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.horizontalScroll}>
              {TEMPLATES.map((tmpl) => (
                <TouchableOpacity 
                  key={tmpl.id} 
                  style={s.templateCard} 
                  activeOpacity={0.88}
                  onPress={() => {
                    hapticSelection();
                    setSelectedTemplate(tmpl);
                  }}
                >
                  <View style={[s.templateBanner, { backgroundColor: tmpl.color }]}>
                    <Text style={s.templateBadgeText}>{tmpl.badge}</Text>
                    <Dumbbell size={28} color="#FFFFFF" strokeWidth={1.8} style={s.templateBannerIcon} />
                  </View>
                  <View style={s.templateBody}>
                    <Text style={s.templateTitle} numberOfLines={1}>{tmpl.title}</Text>
                    <Text style={s.templateSubtitle}>{tmpl.daysPerWeek}</Text>
                  </View>
                </TouchableOpacity>
              ))}
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
                <Text style={s.customBuilderDesc}>Map out your custom training split from scratch</Text>
              </View>
              <ChevronRight size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Template Detail / Activation Modal */}
        <Modal
          visible={!!selectedTemplate}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedTemplate(null)}
        >
          <View style={s.modalBackdrop}>
            <View style={s.modalContent}>
              <View style={s.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={s.modalBadge}>{selectedTemplate?.badge} TEMPLATE</Text>
                  <Text style={s.modalTitle}>{selectedTemplate?.title}</Text>
                </View>
                <TouchableOpacity 
                  style={s.modalCloseBtn}
                  onPress={() => setSelectedTemplate(null)}
                >
                  <X size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={s.modalDesc}>{selectedTemplate?.description}</Text>

              <Text style={s.modalScheduleHeader}>WEEKLY SPLIT BREAKDOWN</Text>
              <ScrollView style={s.modalScheduleList} showsVerticalScrollIndicator={false}>
                {selectedTemplate?.days.map((d, i) => (
                  <View key={i} style={s.modalDayRow}>
                    <View style={s.modalDayBadge}>
                      <Text style={s.modalDayBadgeText}>{d.day.slice(0, 3).toUpperCase()}</Text>
                    </View>
                    <Text style={s.modalDayTitle}>{d.title}</Text>
                  </View>
                ))}
              </ScrollView>

              <TouchableOpacity 
                style={[s.modalActivateBtn, activating && { opacity: 0.7 }]}
                disabled={activating}
                onPress={() => selectedTemplate && handleActivateTemplate(selectedTemplate)}
                activeOpacity={0.85}
              >
                {activating ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <CheckCircle2 size={18} color="#FFFFFF" />
                    <Text style={s.modalActivateBtnText}>Activate This Plan</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof import('../../contexts/ThemeContext').useTheme>['colors']) => StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  content: { paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.cardBorder,
  },
  proBadge: {
    position: 'absolute',
    top: -6,
    right: -4,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  activePlanTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  activeSplitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  activeSplitDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  activeSplitBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: 0.5,
  },
  activePlanName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  activePlanMeta: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  manageBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 16,
    paddingTop: 8,
  },
  dayPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.skeleton,
  },
  dayPillActive: {
    backgroundColor: colors.accent,
  },
  dayPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textTertiary,
  },
  dayPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  dayPillDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    marginTop: 4,
  },
  planQuickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    gap: 8,
  },
  planQuickActionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptyPlanCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  emptyPlanIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyPlanTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  emptyPlanSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  horizontalScroll: {
    gap: 14,
    paddingRight: 16,
  },
  templateCard: {
    width: 170,
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  templateBanner: {
    height: 90,
    padding: 12,
    justifyContent: 'space-between',
    position: 'relative',
  },
  templateBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  templateBannerIcon: {
    alignSelf: 'flex-end',
    opacity: 0.9,
  },
  templateBody: {
    padding: 12,
  },
  templateTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  templateSubtitle: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: '600',
  },
  customBuilderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
    gap: 16,
  },
  customBuilderIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  modalBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.skeleton,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  modalScheduleHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textTertiary,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  modalScheduleList: {
    maxHeight: 180,
    marginBottom: 20,
  },
  modalDayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.skeleton,
  },
  modalDayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.skeleton,
  },
  modalDayBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  modalDayTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modalActivateBtn: {
    backgroundColor: colors.accent,
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modalActivateBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});


