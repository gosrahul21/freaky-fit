import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Plus, CalendarDays, ChevronRight, Crown, Share2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';

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

  const fetchActivePlan = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      if (active) {
        await fetchActivePlan();
      }
    })();
    return () => {
      active = false;
    };
  }, [fetchActivePlan]);

  if (loading) {
    return (
      <SafeAreaView style={[s.safeArea, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </SafeAreaView>
    );
  }

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
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <TouchableOpacity 
                      style={s.shareCardBtn}
                      onPress={() => router.push(`/plan/${activePlan.id}`)}
                      activeOpacity={0.8}
                    >
                      <Share2 size={16} color={colors.accent} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={s.manageBtn}
                      onPress={() => router.push(`/plan/${activePlan.id}`)}
                    >
                      <ChevronRight size={20} color={colors.accent} />
                    </TouchableOpacity>
                  </View>
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
                Build your custom training split with the custom builder below.
              </Text>
            </View>
          )}

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
  shareCardBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
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
});


