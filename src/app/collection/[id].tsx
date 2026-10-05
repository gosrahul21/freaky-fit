import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Modal, FlatList, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, FolderPlus, Activity, ChevronRight, Plus, CheckCircle2, Circle } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';

export default function CollectionDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const router = useRouter();

  const [collection, setCollection] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Exercise Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [allWorkoutExercises, setAllWorkoutExercises] = useState<any[]>([]);
  const [selectedToAdd, setSelectedToAdd] = useState<Set<string>>(new Set());
  const [isAdding, setIsAdding] = useState(false);
  const [isFetchingExercises, setIsFetchingExercises] = useState(false);

  useEffect(() => {
    if (id) fetchCollectionData();
  }, [id]);

  const fetchCollectionData = async () => {
    setLoading(true);
    try {
      // 1. Fetch collection details
      const { data: cData, error: cErr } = await supabase
        .from('collections')
        .select('*')
        .eq('id', id)
        .single();
      
      if (cErr) throw cErr;
      setCollection(cData);

      // 2. Fetch collection exercises
      const { data: eData, error: eErr } = await supabase
        .from('collection_exercises')
        .select('*, workout_exercises(*, exercises(*))')
        .eq('collection_id', id)
        .order('added_at', { ascending: false });

      if (eErr) throw eErr;
      
      const flatExercises = (eData || []).map((ce: any) => ce.workout_exercises);
      setExercises(flatExercises);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllWorkoutExercises = async () => {
    setIsFetchingExercises(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: workouts } = await supabase.from('workouts').select('id, title').eq('user_id', user.id);
      if (!workouts || workouts.length === 0) {
        setIsFetchingExercises(false);
        return;
      }

      const workoutIds = workouts.map(w => w.id);
      const { data: weData } = await supabase
        .from('workout_exercises')
        .select('*, exercises(*)')
        .in('workout_id', workoutIds);

      const enriched = (weData || []).map((we: any) => {
        const w = workouts.find(x => x.id === we.workout_id);
        return { ...we, workout_title: w?.title };
      });
      setAllWorkoutExercises(enriched);
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetchingExercises(false);
    }
  };

  const handleOpenAddModal = () => {
    fetchAllWorkoutExercises();
    setSelectedToAdd(new Set());
    setShowAddModal(true);
  };

  const toggleSelection = (weId: string) => {
    const newSet = new Set(selectedToAdd);
    if (newSet.has(weId)) newSet.delete(weId);
    else newSet.add(weId);
    setSelectedToAdd(newSet);
  };

  const handleSaveToCollection = async () => {
    if (selectedToAdd.size === 0) return;
    setIsAdding(true);
    try {
      const inserts = Array.from(selectedToAdd).map(weId => ({
        collection_id: id,
        workout_exercise_id: weId
      }));

      const { error } = await supabase.from('collection_exercises').insert(inserts);
      if (error) {
        if (error.code === '23505') { // unique constraint violation
          Alert.alert('Notice', 'Some of these exercises are already in this collection.');
        } else {
          throw error;
        }
      } else {
        setShowAddModal(false);
        fetchCollectionData(); // refresh list
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setIsAdding(false);
    }
  };


  if (loading) {
    return (
      <View style={[s.safeArea, s.center]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!collection) {
    return (
      <View style={[s.safeArea, s.center]}>
        <Text style={{color: colors.textPrimary}}>Collection not found.</Text>
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
        <Text style={s.headerTitle} numberOfLines={1}>{collection.title}</Text>
        <TouchableOpacity style={s.iconBtn} onPress={handleOpenAddModal}>
          <Plus size={24} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.hero}>
          <View style={s.iconWrapper}>
            <FolderPlus size={40} color={colors.accent} strokeWidth={1.5} />
          </View>
          <Text style={s.heroTitle}>{collection.title}</Text>
          <Text style={s.heroSubtitle}>{exercises.length} Exercises saved</Text>
        </View>

        <View style={s.listContainer}>
          <Text style={s.sectionTitle}>SAVED EXERCISES</Text>

          {exercises.length === 0 ? (
            <View style={s.emptyState}>
              <Text style={s.emptyTitle}>Empty Collection</Text>
              <Text style={s.emptyDesc}>Go to your workouts or tap the button below to add exercises to this collection!</Text>
              <TouchableOpacity 
                style={[s.primaryBtn, { marginTop: 16 }]} 
                onPress={handleOpenAddModal}
              >
                <Plus size={20} color="#FFFFFF" />
                <Text style={s.primaryBtnText}>Add Exercises</Text>
              </TouchableOpacity>
            </View>
          ) : (
            exercises.map((we, idx) => (
              <View key={we.id || idx} style={s.exerciseCard}>
                <View style={s.exerciseIcon}>
                  <Activity size={24} color={colors.accent} />
                </View>
                <View style={s.exerciseDetails}>
                  <Text style={s.exerciseName}>{we?.exercises?.name || 'Unknown Exercise'}</Text>
                  <Text style={s.exerciseStats}>{we?.sets || 0} sets x {we?.reps || 0} reps</Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Exercise Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={[s.safeArea, { backgroundColor: colors.background }]}>
          <View style={s.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)} style={s.modalCloseBtn}>
              <Text style={{color: colors.textPrimary, fontWeight: '600'}}>Cancel</Text>
            </TouchableOpacity>
            <Text style={s.modalTitle}>Add to Collection</Text>
            <TouchableOpacity 
              onPress={handleSaveToCollection} 
              disabled={selectedToAdd.size === 0 || isAdding}
              style={s.modalSaveBtn}
            >
              <Text style={[s.modalSaveText, (selectedToAdd.size === 0 || isAdding) && { opacity: 0.5 }]}>
                {isAdding ? 'Adding...' : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>

          {isFetchingExercises ? (
            <View style={s.center}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : (
            <FlatList
              data={allWorkoutExercises}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }) => {
                const isSelected = selectedToAdd.has(item.id);
                return (
                  <TouchableOpacity 
                    style={[s.modalExerciseCard, isSelected && { borderColor: colors.accent }]}
                    activeOpacity={0.7}
                    onPress={() => toggleSelection(item.id)}
                  >
                    <View style={s.exerciseIcon}>
                      <Activity size={24} color={isSelected ? colors.accent : "#9CA3AF"} />
                    </View>
                    <View style={s.exerciseDetails}>
                      <Text style={s.exerciseName}>{item.exercises?.name || 'Unknown'}</Text>
                      <Text style={s.exerciseStats}>From: {item.workout_title}</Text>
                    </View>
                    {isSelected ? (
                      <CheckCircle2 size={24} color={colors.accent} />
                    ) : (
                      <Circle size={24} color="#D1D5DB" />
                    )}
                  </TouchableOpacity>
                )
              }}
              ListEmptyComponent={
                <Text style={{textAlign: 'center', marginTop: 40, color: colors.textSecondary}}>No exercises found in your workouts.</Text>
              }
            />
          )}
        </View>
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
    padding: 24,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  listContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textTertiary,
    letterSpacing: 1,
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  exerciseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.skeleton,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  exerciseDetails: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  exerciseStats: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  modalCloseBtn: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalSaveBtn: {
    padding: 8,
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent,
  },
  modalExerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  }
});
