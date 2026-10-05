import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Modal, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, CalendarPlus, ChevronRight, CheckCircle2, Circle, Dumbbell } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import { hapticSelection } from '../../utils/haptics';

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function PlanDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const router = useRouter();

  const [plan, setPlan] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [userWorkouts, setUserWorkouts] = useState<any[]>([]);
  const [userCollections, setUserCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDayForModal, setSelectedDayForModal] = useState<string | null>(null);

  // Modal states
  const [modalMode, setModalMode] = useState<'sources' | 'exercises'>('sources');
  const [activeTab, setActiveTab] = useState<'workouts' | 'collections'>('workouts');
  const [selectedSource, setSelectedSource] = useState<any>(null);
  const [sourceExercises, setSourceExercises] = useState<any[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPlanData();
    }
  }, [id]);

  const fetchPlanData = async () => {
    setLoading(true);
    try {
      // Fetch plan details
      const { data: pData } = await supabase
        .from('planner')
        .select('*')
        .eq('id', id)
        .single();
      
      setPlan(pData);

      // Fetch sessions for this plan
      const { data: sData } = await supabase
        .from('planner_sessions')
        .select('*')
        .eq('planner_id', id);

      setSessions(sData || []);

      // Fetch user's workouts and collections for the modal
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: wData } = await supabase
          .from('workouts')
          .select('id, title, source_type')
          .eq('user_id', user.id);
        setUserWorkouts(wData || []);

        const { data: cData } = await supabase
          .from('collections')
          .select('id, title')
          .eq('user_id', user.id);
        setUserCollections(cData || []);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[s.safeArea, s.center]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={[s.safeArea, s.center]}>
        <Text style={{color: colors.textPrimary}}>Plan not found.</Text>
      </View>
    );
  }

  // Filter sessions (ignoring week_number since duration is removed)
  const weekSessions = sessions;

  const handleDayPress = (day: string) => {
    hapticSelection();
    setSelectedDayForModal(day);
    setModalMode('sources');
    setSelectedSource(null);
    setSourceExercises([]);
  };

  const handleSelectSource = async (source: any, type: 'workout' | 'collection') => {
    hapticSelection();
    setSelectedSource({ ...source, type });
    setModalMode('exercises');
    
    // Fetch exercises for this source
    if (type === 'workout') {
      const { data } = await supabase
        .from('workout_exercises')
        .select('*, exercises(*)')
        .eq('workout_id', source.id)
        .order('order_index');
      setSourceExercises(data || []);
    } else {
      const { data } = await supabase
        .from('collection_exercises')
        .select('*, workout_exercises(*, exercises(*))')
        .eq('collection_id', source.id);
      
      // Flatten the structure for collection
      const flat = (data || []).map(ce => ce.workout_exercises);
      setSourceExercises(flat || []);
    }
  };

  const handleAssignExercises = async (exercisesToAdd: any[]) => {
    if (!selectedDayForModal || exercisesToAdd.length === 0) return;
    hapticSelection();
    setIsAssigning(true);

    try {
      // 1. First ensure a session exists for this day (or create one)
      let session = sessions.find(s => s.day_of_week === selectedDayForModal);
      
      if (!session) {
        const { data, error } = await supabase.from('planner_sessions').insert([
          {
            planner_id: id,
            title: selectedSource?.title || 'Custom Session',
            week_number: 1,
            day_of_week: selectedDayForModal,
            status: 'planned'
          }
        ]).select().single();

        if (error) throw error;
        session = data;
        setSessions([...sessions, data]);
      }

      // 2. Fetch existing exercises for this session to determine order_index
      const { data: existingEx } = await supabase
        .from('planner_session_exercises')
        .select('order_index')
        .eq('session_id', session.id);
      
      const nextOrderIndex = existingEx && existingEx.length > 0 
        ? Math.max(...existingEx.map((e: any) => e.order_index)) + 1 
        : 1;

      // 3. Insert new exercises
      const inserts = exercisesToAdd.map((we, idx) => ({
        session_id: session.id,
        exercise_id: we.exercise_id,
        order_index: nextOrderIndex + idx,
        sets: we.sets || 3,
        reps: we.reps || '10',
        notes: we.notes || ''
      }));

      const { error: insErr } = await supabase.from('planner_session_exercises').insert(inserts);
      if (insErr) throw insErr;
      
      alert(`Added ${exercisesToAdd.length} exercise(s) to ${DAY_NAMES[DAYS_OF_WEEK.indexOf(selectedDayForModal)]}!`);
      
    } catch (err) {
      console.error(err);
      alert('Failed to assign exercises.');
    } finally {
      setIsAssigning(false);
      setSelectedDayForModal(null);
    }
  };

  return (
    <SafeAreaView style={[s.safeArea, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.iconBtn} onPress={() => router.back()}>
          <X size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{plan.title}</Text>
        <View style={{ width: 40 }} />
      </View>



      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        
        <View style={s.scheduleContainer}>
          <Text style={s.scheduleTitle}>Weekly Schedule</Text>
          <Text style={s.scheduleDesc}>Tap a day to assign a workout from your library or create a new session.</Text>

          {DAYS_OF_WEEK.map((day, idx) => {
            const sessionForDay = weekSessions.find(s => s.day_of_week === day);
            const hasSession = !!sessionForDay;

            return (
              <TouchableOpacity 
                key={day} 
                style={[s.dayRow, hasSession && s.dayRowHasSession]}
                activeOpacity={0.7}
                onPress={() => handleDayPress(day)}
              >
                <View style={s.dayInfo}>
                  <Text style={s.dayName}>{DAY_NAMES[idx]}</Text>
                  {hasSession ? (
                    <Text style={s.sessionTitle}>{sessionForDay.title || 'Scheduled Workout'}</Text>
                  ) : (
                    <Text style={s.sessionEmpty}>Rest Day</Text>
                  )}
                </View>

                {hasSession ? (
                  <View style={s.statusBadge}>
                    <CheckCircle2 size={16} color={colors.success} />
                  </View>
                ) : (
                  <TouchableOpacity style={s.addBtn} onPress={() => handleDayPress(day)}>
                    <CalendarPlus size={20} color={colors.accent} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Assign Workout Modal */}
      <Modal
        visible={!!selectedDayForModal}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedDayForModal(null)}
      >
        <Pressable style={s.modalBackdrop} onPress={() => setSelectedDayForModal(null)}>
          <Pressable style={s.bottomSheet} onPress={(e) => e.stopPropagation()}>
            <View style={s.dragHandleContainer}>
              <View style={s.dragHandle} />
            </View>
            
            <Text style={s.sheetTitle}>
              {modalMode === 'sources' ? 'Assign Exercises' : selectedSource?.title}
            </Text>
            
            {modalMode === 'sources' ? (
              <>
                <Text style={s.sheetDesc}>
                  Select a source to pick exercises for {selectedDayForModal ? DAY_NAMES[DAYS_OF_WEEK.indexOf(selectedDayForModal)] : ''}.
                </Text>

                <View style={s.tabContainer}>
                  <TouchableOpacity 
                    style={[s.tabBtn, activeTab === 'workouts' && s.tabBtnActive]}
                    onPress={() => setActiveTab('workouts')}
                  >
                    <Text style={[s.tabText, activeTab === 'workouts' && s.tabTextActive]}>Workouts</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[s.tabBtn, activeTab === 'collections' && s.tabBtnActive]}
                    onPress={() => setActiveTab('collections')}
                  >
                    <Text style={[s.tabText, activeTab === 'collections' && s.tabTextActive]}>Collections</Text>
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={s.sheetScroll} showsVerticalScrollIndicator={false}>
                  {activeTab === 'workouts' && (
                    <>
                      {userWorkouts.length === 0 && <Text style={{textAlign: 'center', marginTop: 20, color: colors.textSecondary}}>No workouts found.</Text>}
                      {userWorkouts.map(w => (
                        <TouchableOpacity key={w.id} style={s.sheetOption} onPress={() => handleSelectSource(w, 'workout')}>
                          <View style={s.sheetOptionIcon}><Dumbbell size={24} color={colors.accent} /></View>
                          <View style={s.sheetOptionTextContainer}>
                            <Text style={s.sheetOptionTitle}>{w.title}</Text>
                          </View>
                          <ChevronRight size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                      ))}
                    </>
                  )}
                  {activeTab === 'collections' && (
                    <>
                      {userCollections.length === 0 && <Text style={{textAlign: 'center', marginTop: 20, color: colors.textSecondary}}>No collections found.</Text>}
                      {userCollections.map(c => (
                        <TouchableOpacity key={c.id} style={s.sheetOption} onPress={() => handleSelectSource(c, 'collection')}>
                          <View style={s.sheetOptionIcon}><Circle size={24} color={colors.accent} /></View>
                          <View style={s.sheetOptionTextContainer}>
                            <Text style={s.sheetOptionTitle}>{c.title}</Text>
                          </View>
                          <ChevronRight size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                      ))}
                    </>
                  )}
                  <View style={{height: 40}} />
                </ScrollView>
              </>
            ) : (
              <>
                <TouchableOpacity 
                  style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }} 
                  onPress={() => setModalMode('sources')}
                >
                  <Text style={{ color: colors.accent, fontWeight: '600' }}>← Back to sources</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={s.addAllBtn} 
                  onPress={() => handleAssignExercises(sourceExercises)}
                  disabled={isAssigning || sourceExercises.length === 0}
                >
                  {isAssigning ? <ActivityIndicator color="#fff" /> : <Text style={s.addAllBtnText}>Add All {sourceExercises.length} Exercises</Text>}
                </TouchableOpacity>

                <ScrollView style={s.sheetScroll} showsVerticalScrollIndicator={false}>
                  {sourceExercises.map((we) => (
                    <View key={we.id} style={s.exerciseRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.exerciseRowName}>{we.exercises?.name}</Text>
                        <Text style={s.exerciseRowDesc}>{we.sets} sets x {we.reps} reps</Text>
                      </View>
                      <TouchableOpacity 
                        style={s.addSingleBtn} 
                        onPress={() => handleAssignExercises([we])}
                        disabled={isAssigning}
                      >
                        <Text style={s.addSingleBtnText}>+ Add</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  <View style={{height: 40}} />
                </ScrollView>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  safeArea: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  weekSelector: {
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    backgroundColor: colors.card,
  },
  weekScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  weekTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.skeleton,
  },
  weekTabActive: {
    backgroundColor: colors.textPrimary,
  },
  weekTabText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  weekTabTextActive: {
    color: colors.background,
  },
  content: {
    padding: 24,
  },
  scheduleContainer: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  scheduleTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  scheduleDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.skeleton,
  },
  dayRowHasSession: {
    backgroundColor: colors.accentLight,
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  sessionEmpty: {
    fontSize: 15,
    color: colors.textTertiary,
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.skeleton,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    maxHeight: '80%',
  },
  dragHandleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 12,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.cardBorder,
    borderRadius: 2,
  },
  sheetTitle: {
    fontSize: 23,
    fontWeight: '900',
    color: colors.textPrimary,
    marginTop: 4,
    letterSpacing: -0.5,
  },
  sheetDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    marginTop: 4,
  },
  sheetScroll: {
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  sheetOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.skeleton,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  sheetOptionTextContainer: {
    flex: 1,
  },
  sheetOptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sheetOptionDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.skeleton,
    borderRadius: 8,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabBtnActive: {
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.textPrimary,
  },
  addAllBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  addAllBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  exerciseRowName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  exerciseRowDesc: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  addSingleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.accentLight,
    borderRadius: 16,
  },
  addSingleBtnText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
  }
});
