import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Modal, Pressable, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, CalendarPlus, ChevronRight, CheckCircle2, Circle, Dumbbell, Trash2, Plus, Minus, Share2 } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import { hapticSelection, hapticImpactLight } from '../../utils/haptics';
import { shareWorkoutPlan } from '../../utils/share';

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

  // Day inspection & management modal
  const [activeDay, setActiveDay] = useState<string | null>(null);

  // Share modal


  // Source exercise picker modal
  const [showAddPicker, setShowAddPicker] = useState(false);
  const [modalMode, setModalMode] = useState<'sources' | 'exercises'>('sources');
  const [activeTab, setActiveTab] = useState<'workouts' | 'collections'>('workouts');
  const [selectedSource, setSelectedSource] = useState<any>(null);
  const [sourceExercises, setSourceExercises] = useState<any[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchPlanData = useCallback(async () => {
    try {
      // 1. Fetch plan details
      const { data: pData } = await supabase
        .from('planner')
        .select('*')
        .eq('id', id)
        .single();
      
      setPlan(pData);

      // 2. Fetch sessions with their assigned exercises
      const { data: sData } = await supabase
        .from('planner_sessions')
        .select(`
          *,
          planner_session_exercises (
            id,
            exercise_id,
            order_index,
            sets,
            reps,
            notes,
            exercises ( id, name, primary_muscle )
          )
        `)
        .eq('planner_id', id);

      // Sort exercises inside each session by order_index
      const sortedSessions = (sData || []).map(sess => ({
        ...sess,
        planner_session_exercises: (sess.planner_session_exercises || []).sort(
          (a: any, b: any) => (a.order_index || 0) - (b.order_index || 0)
        )
      }));

      setSessions(sortedSessions);

      // 3. Fetch user workouts and collections
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
  }, [id]);

  useEffect(() => {
    let active = true;
    if (id) {
      void (async () => {
        if (active) {
          await fetchPlanData();
        }
      })();
    }
    return () => {
      active = false;
    };
  }, [id, fetchPlanData]);

  const currentSessionForActiveDay = sessions.find(s => s.day_of_week === activeDay);

  const handleOpenDay = (day: string) => {
    hapticSelection();
    setActiveDay(day);
  };

  const handleOpenAddPicker = () => {
    hapticSelection();
    setModalMode('sources');
    setSelectedSource(null);
    setSourceExercises([]);
    setShowAddPicker(true);
  };

  const handleSelectSource = async (source: any, type: 'workout' | 'collection') => {
    hapticSelection();
    setSelectedSource({ ...source, type });
    setModalMode('exercises');
    
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
      
      const flat = (data || []).map(ce => ce.workout_exercises).filter(Boolean);
      setSourceExercises(flat);
    }
  };

  const handleAssignExercises = async (exercisesToAdd: any[]) => {
    if (!activeDay || exercisesToAdd.length === 0) return;
    hapticImpactLight();
    setIsAssigning(true);

    try {
      // 1. Ensure session exists
      let session = sessions.find(s => s.day_of_week === activeDay);
      
      if (!session) {
        const { data: newSession, error } = await supabase.from('planner_sessions').insert([
          {
            planner_id: id,
            title: selectedSource?.title || 'Custom Workout',
            week_number: 1,
            day_of_week: activeDay,
            status: 'planned'
          }
        ]).select().single();

        if (error) throw error;
        session = { ...newSession, planner_session_exercises: [] };
      }

      // 2. Next order index
      const existingList = session.planner_session_exercises || [];
      const nextOrderIndex = existingList.length > 0 
        ? Math.max(...existingList.map((e: any) => e.order_index || 0)) + 1 
        : 1;

      // 3. Insert exercises into planner_session_exercises
      const inserts = exercisesToAdd.map((we, idx) => ({
        session_id: session!.id,
        exercise_id: we.exercise_id,
        order_index: nextOrderIndex + idx,
        sets: we.sets || 3,
        reps: we.reps || '10',
        notes: we.notes || ''
      }));

      const { data: insertedData, error: insErr } = await supabase
        .from('planner_session_exercises')
        .insert(inserts)
        .select('*, exercises(*)');

      if (insErr) throw insErr;
      
      // Update local sessions state
      const updatedExercises = [...existingList, ...(insertedData || [])];
      setSessions(prev => {
        const exists = prev.some(s => s.id === session!.id);
        if (exists) {
          return prev.map(s => s.id === session!.id ? { ...s, planner_session_exercises: updatedExercises } : s);
        } else {
          return [...prev, { ...session, planner_session_exercises: updatedExercises }];
        }
      });

      setShowAddPicker(false);
      Alert.alert('Success', `Added ${exercisesToAdd.length} exercise(s) to ${DAY_NAMES[DAYS_OF_WEEK.indexOf(activeDay)]}!`);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message || 'Failed to assign exercises.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUpdateExerciseSets = async (pseId: string, currentSets: number, delta: number) => {
    const newSets = Math.max(1, Math.min(10, currentSets + delta));
    if (newSets === currentSets) return;
    hapticSelection();

    // Update in Supabase
    await supabase
      .from('planner_session_exercises')
      .update({ sets: newSets })
      .eq('id', pseId);

    // Update local state
    setSessions(prev => prev.map(sess => {
      if (sess.day_of_week === activeDay) {
        return {
          ...sess,
          planner_session_exercises: sess.planner_session_exercises.map((e: any) => 
            e.id === pseId ? { ...e, sets: newSets } : e
          )
        };
      }
      return sess;
    }));
  };

  const handleUpdateExerciseReps = async (pseId: string, newReps: string) => {
    await supabase
      .from('planner_session_exercises')
      .update({ reps: newReps })
      .eq('id', pseId);

    setSessions(prev => prev.map(sess => {
      if (sess.day_of_week === activeDay) {
        return {
          ...sess,
          planner_session_exercises: sess.planner_session_exercises.map((e: any) => 
            e.id === pseId ? { ...e, reps: newReps } : e
          )
        };
      }
      return sess;
    }));
  };

  const handleRemoveExercise = async (pseId: string) => {
    hapticImpactLight();
    await supabase
      .from('planner_session_exercises')
      .delete()
      .eq('id', pseId);

    setSessions(prev => prev.map(sess => {
      if (sess.day_of_week === activeDay) {
        return {
          ...sess,
          planner_session_exercises: sess.planner_session_exercises.filter((e: any) => e.id !== pseId)
        };
      }
      return sess;
    }));
  };

  const handleClearDay = async () => {
    if (!currentSessionForActiveDay) return;
    hapticImpactLight();
    Alert.alert(
      'Clear Day Exercises',
      'Are you sure you want to remove all scheduled exercises for this day?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All Exercises', 
          style: 'destructive',
          onPress: async () => {
            await supabase.from('planner_sessions').delete().eq('id', currentSessionForActiveDay.id);
            setSessions(prev => prev.filter(s => s.id !== currentSessionForActiveDay.id));
            setActiveDay(null);
          }
        }
      ]
    );
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

  return (
    <SafeAreaView style={[s.safeArea, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.iconBtn} onPress={() => router.back()}>
          <X size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{plan.title}</Text>
        <TouchableOpacity 
          style={s.iconBtn} 
          onPress={() => {
            shareWorkoutPlan(plan, sessions);
          }}
        >
          <Share2 size={20} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.scheduleContainer}>
          <Text style={s.scheduleTitle}>Weekly Split Schedule</Text>
          <Text style={s.scheduleDesc}>
            Tap any day to customize target sets, reps, and exercise routines for this workout plan.
          </Text>

          {DAYS_OF_WEEK.map((day, idx) => {
            const sessionForDay = sessions.find(s => s.day_of_week === day);
            const exercisesCount = sessionForDay?.planner_session_exercises?.length || 0;
            const hasSession = !!sessionForDay && exercisesCount > 0;

            return (
              <TouchableOpacity 
                key={day} 
                style={[s.dayRow, hasSession && s.dayRowHasSession]}
                activeOpacity={0.75}
                onPress={() => handleOpenDay(day)}
              >
                <View style={s.dayInfo}>
                  <Text style={s.dayName}>{DAY_NAMES[idx]}</Text>
                  {hasSession ? (
                    <Text style={s.sessionTitle}>
                      {sessionForDay.title} ({exercisesCount} {exercisesCount === 1 ? 'exercise' : 'exercises'})
                    </Text>
                  ) : (
                    <Text style={s.sessionEmpty}>No exercises</Text>
                  )}
                </View>

                {hasSession ? (
                  <View style={s.statusBadge}>
                    <CheckCircle2 size={18} color={colors.success || '#10B981'} />
                  </View>
                ) : (
                  <View style={s.addBtn}>
                    <CalendarPlus size={18} color={colors.accent} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Day Routine Manager Modal */}
      <Modal
        visible={!!activeDay && !showAddPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveDay(null)}
      >
        <Pressable style={s.modalBackdrop} onPress={() => setActiveDay(null)}>
          <Pressable style={s.bottomSheet} onPress={(e) => e.stopPropagation()}>
            <View style={s.dragHandleContainer}>
              <View style={s.dragHandle} />
            </View>

            <View style={s.daySheetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={s.daySheetSubtitle}>
                  {activeDay ? DAY_NAMES[DAYS_OF_WEEK.indexOf(activeDay)].toUpperCase() : ''}
                </Text>
                <Text style={s.sheetTitle}>
                  {currentSessionForActiveDay?.title || 'Workout Session'}
                </Text>
              </View>
              <TouchableOpacity 
                style={s.sheetCloseBtn}
                onPress={() => setActiveDay(null)}
              >
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* List of Exercises for this day */}
            <ScrollView style={s.dayExerciseScroll} showsVerticalScrollIndicator={false}>
              {(!currentSessionForActiveDay || !currentSessionForActiveDay.planner_session_exercises || currentSessionForActiveDay.planner_session_exercises.length === 0) ? (
                <View style={s.emptyDayContainer}>
                  <Dumbbell size={36} color={colors.textTertiary} strokeWidth={1.5} />
                  <Text style={s.emptyDayTitle}>No exercises scheduled</Text>
                  <Text style={s.emptyDayDesc}>
                    Add exercises from imported workouts or collections to train on {activeDay ? DAY_NAMES[DAYS_OF_WEEK.indexOf(activeDay)] : ''}.
                  </Text>
                </View>
              ) : (
                currentSessionForActiveDay.planner_session_exercises.map((pse: any, idx: number) => (
                  <View key={pse.id} style={s.planExerciseCard}>
                    <View style={s.planExTopRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.planExName}>
                          {idx + 1}. {pse.exercises?.name || 'Exercise'}
                        </Text>
                        {pse.exercises?.primary_muscle && (
                          <Text style={s.planExMuscle}>{pse.exercises.primary_muscle}</Text>
                        )}
                      </View>
                      <TouchableOpacity 
                        style={s.trashBtn}
                        onPress={() => handleRemoveExercise(pse.id)}
                      >
                        <Trash2 size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>

                    {/* Sets & Target Reps Adjuster */}
                    <View style={s.planExControlsRow}>
                      <View style={s.planExControlGroup}>
                        <Text style={s.planExControlLabel}>SETS</Text>
                        <View style={s.stepper}>
                          <TouchableOpacity 
                            style={s.stepperBtn}
                            onPress={() => handleUpdateExerciseSets(pse.id, pse.sets || 3, -1)}
                          >
                            <Minus size={14} color={colors.textPrimary} />
                          </TouchableOpacity>
                          <Text style={s.stepperValue}>{pse.sets || 3}</Text>
                          <TouchableOpacity 
                            style={s.stepperBtn}
                            onPress={() => handleUpdateExerciseSets(pse.id, pse.sets || 3, 1)}
                          >
                            <Plus size={14} color={colors.textPrimary} />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={s.planExControlGroup}>
                        <Text style={s.planExControlLabel}>REPS</Text>
                        <TextInput
                          style={s.repsInput}
                          defaultValue={String(pse.reps || '10')}
                          keyboardType="default"
                          placeholder="10"
                          placeholderTextColor={colors.textTertiary}
                          onEndEditing={(e) => handleUpdateExerciseReps(pse.id, e.nativeEvent.text)}
                        />
                      </View>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            {/* Bottom Actions */}
            <View style={s.daySheetBottomActions}>
              <TouchableOpacity 
                style={s.addExercisesBtn}
                onPress={handleOpenAddPicker}
                activeOpacity={0.85}
              >
                <Plus size={18} color="#FFFFFF" />
                <Text style={s.addExercisesBtnText}> Add Exercises</Text>
              </TouchableOpacity>

              {currentSessionForActiveDay && (
                <TouchableOpacity 
                  style={s.clearDayBtn}
                  onPress={handleClearDay}
                >
                  <Text style={s.clearDayBtnText}>Clear exercises</Text>
                </TouchableOpacity>
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Add Exercises From Source Modal */}
      <Modal
        visible={showAddPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddPicker(false)}
      >
        <Pressable style={s.modalBackdrop} onPress={() => setShowAddPicker(false)}>
          <Pressable style={s.bottomSheet} onPress={(e) => e.stopPropagation()}>
            <View style={s.dragHandleContainer}>
              <View style={s.dragHandle} />
            </View>
            
            <View style={s.daySheetHeader}>
              <Text style={s.sheetTitle}>
                {modalMode === 'sources' ? 'Add From' : selectedSource?.title}
              </Text>
              <TouchableOpacity onPress={() => setShowAddPicker(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            {modalMode === 'sources' ? (
              <>
                <Text style={s.sheetDesc}>
                  Select a workout or collection to assign to {activeDay ? DAY_NAMES[DAYS_OF_WEEK.indexOf(activeDay)] : ''}.
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
                      {userWorkouts.length === 0 && (
                        <Text style={s.emptyPickerText}>No workouts in your library yet.</Text>
                      )}
                      {userWorkouts.map(w => (
                        <TouchableOpacity key={w.id} style={s.sheetOption} onPress={() => handleSelectSource(w, 'workout')}>
                          <View style={s.sheetOptionIcon}><Dumbbell size={22} color={colors.accent} /></View>
                          <View style={s.sheetOptionTextContainer}>
                            <Text style={s.sheetOptionTitle}>{w.title}</Text>
                          </View>
                          <ChevronRight size={20} color={colors.textTertiary} />
                        </TouchableOpacity>
                      ))}
                    </>
                  )}
                  {activeTab === 'collections' && (
                    <>
                      {userCollections.length === 0 && (
                        <Text style={s.emptyPickerText}>No collections in your library yet.</Text>
                      )}
                      {userCollections.map(c => (
                        <TouchableOpacity key={c.id} style={s.sheetOption} onPress={() => handleSelectSource(c, 'collection')}>
                          <View style={s.sheetOptionIcon}><Circle size={22} color={colors.accent} /></View>
                          <View style={s.sheetOptionTextContainer}>
                            <Text style={s.sheetOptionTitle}>{c.title}</Text>
                          </View>
                          <ChevronRight size={20} color={colors.textTertiary} />
                        </TouchableOpacity>
                      ))}
                    </>
                  )}
                  <View style={{ height: 40 }} />
                </ScrollView>
              </>
            ) : (
              <>
                <TouchableOpacity 
                  style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }} 
                  onPress={() => setModalMode('sources')}
                >
                  <Text style={{ color: colors.accent, fontWeight: '700' }}>← Back to sources</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={s.addAllBtn} 
                  onPress={() => handleAssignExercises(sourceExercises)}
                  disabled={isAssigning || sourceExercises.length === 0}
                  activeOpacity={0.85}
                >
                  {isAssigning ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={s.addAllBtnText}>
                      Add All ({sourceExercises.length} Exercises)
                    </Text>
                  )}
                </TouchableOpacity>

                <ScrollView style={s.sheetScroll} showsVerticalScrollIndicator={false}>
                  {sourceExercises.map((we) => (
                    <View key={we.id} style={s.exerciseRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.exerciseRowName}>{we.exercises?.name || 'Exercise'}</Text>
                        <Text style={s.exerciseRowDesc}>{we.sets || 3} sets • {we.reps || 10} reps</Text>
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
                  <View style={{ height: 40 }} />
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
  content: {
    padding: 20,
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
    marginBottom: 20,
    lineHeight: 18,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
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
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sessionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.accent,
  },
  sessionEmpty: {
    fontSize: 14,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.skeleton,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    maxHeight: '85%',
  },
  dragHandleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.cardBorder,
    borderRadius: 2,
  },
  daySheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  daySheetSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: 0.5,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.skeleton,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  dayExerciseScroll: {
    maxHeight: 380,
  },
  emptyDayContainer: {
    alignItems: 'center',
    paddingVertical: 36,
    gap: 8,
  },
  emptyDayTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 8,
  },
  emptyDayDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
  },
  planExerciseCard: {
    backgroundColor: colors.skeleton,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  planExTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  planExName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  planExMuscle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  trashBtn: {
    padding: 6,
  },
  planExControlsRow: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  planExControlGroup: {
    flex: 1,
  },
  planExControlLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textTertiary,
    marginBottom: 6,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    height: 38,
    paddingHorizontal: 4,
  },
  stepperBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  repsInput: {
    height: 38,
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  daySheetBottomActions: {
    marginTop: 16,
    gap: 10,
  },
  addExercisesBtn: {
    backgroundColor: colors.accent,
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addExercisesBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  clearDayBtn: {
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearDayBtnText: {
    color: colors.textTertiary,
    fontSize: 13,
    fontWeight: '600',
  },
  sheetScroll: {
    maxHeight: 340,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: colors.skeleton,
    borderRadius: 10,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: colors.card,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.textPrimary,
  },
  emptyPickerText: {
    textAlign: 'center',
    marginTop: 24,
    color: colors.textSecondary,
    fontSize: 13,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.skeleton,
  },
  sheetOptionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  sheetOptionTextContainer: {
    flex: 1,
  },
  sheetOptionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  addAllBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  addAllBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.skeleton,
  },
  exerciseRowName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  exerciseRowDesc: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  addSingleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.accentLight,
    borderRadius: 14,
  },
  addSingleBtnText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '800',
  },
  shareOptionsContainer: {
    marginTop: 8,
    gap: 12,
  },
  shareOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  shareOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  shareOptionTextContainer: {
    flex: 1,
  },
  shareOptionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  shareOptionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
