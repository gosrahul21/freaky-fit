import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, Check, Timer, Play, Pause, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { hapticImpactLight, hapticSelection } from '../../utils/haptics';

// Mock data until we integrate Supabase
const MOCK_WORKOUT = {
  title: "Hypertrophy Push Day",
  exercises: [
    {
      id: "e1",
      name: "Incline Dumbbell Press",
      sets: [
        { id: "s1", reps: "10", weight: "25", completed: false },
        { id: "s2", reps: "10", weight: "25", completed: false },
        { id: "s3", reps: "8", weight: "27.5", completed: false },
      ]
    },
    {
      id: "e2",
      name: "Overhead Tricep Extension",
      sets: [
        { id: "s4", reps: "12", weight: "15", completed: false },
        { id: "s5", reps: "12", weight: "15", completed: false },
        { id: "s6", reps: "10", weight: "17.5", completed: false },
      ]
    }
  ]
};

export default function WorkoutSessionScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const router = useRouter();
  
  const [workout, setWorkout] = useState(MOCK_WORKOUT);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleSetComplete = (exerciseIndex: number, setIndex: number) => {
    hapticSelection();
    const newWorkout = { ...workout };
    const currentStatus = newWorkout.exercises[exerciseIndex].sets[setIndex].completed;
    newWorkout.exercises[exerciseIndex].sets[setIndex].completed = !currentStatus;
    setWorkout(newWorkout);
  };

  const handleFinish = () => {
    hapticImpactLight();
    // Finish logic goes here
    router.back();
  };

  return (
    <SafeAreaView style={[s.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={s.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.iconBtn} onPress={() => router.back()}>
            <X size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerTitle} numberOfLines={1}>{workout.title}</Text>
            <View style={s.timerBadge}>
              <Timer size={14} color={colors.accent} style={{ marginRight: 4 }} />
              <Text style={s.timerText}>{formatTime(seconds)}</Text>
            </View>
          </View>
          <TouchableOpacity style={s.finishBtn} onPress={handleFinish}>
            <Text style={s.finishBtnText}>Finish</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          {workout.exercises.map((exercise, eIdx) => (
            <View key={exercise.id} style={s.exerciseCard}>
              <View style={s.exerciseHeader}>
                <Text style={s.exerciseName}>{exercise.name}</Text>
                <TouchableOpacity>
                  <Text style={s.exerciseOptions}>Replace</Text>
                </TouchableOpacity>
              </View>

              <View style={s.tableHeaderRow}>
                <Text style={[s.tableCol, s.colSet]}>SET</Text>
                <Text style={[s.tableCol, s.colWeight]}>KG</Text>
                <Text style={[s.tableCol, s.colReps]}>REPS</Text>
                <Text style={[s.tableCol, s.colCheck]}><Check size={16} color={colors.textTertiary} /></Text>
              </View>

              {exercise.sets.map((set, sIdx) => (
                <View key={set.id} style={[s.setRow, set.completed && s.setRowCompleted]}>
                  <Text style={[s.tableCol, s.colSet, s.setNumber, set.completed && s.setNumberCompleted]}>
                    {sIdx + 1}
                  </Text>
                  
                  <View style={[s.tableCol, s.colWeight]}>
                    <View style={[s.inputBox, set.completed && s.inputBoxDisabled]}>
                      <TextInput 
                        style={s.input}
                        defaultValue={set.weight}
                        keyboardType="decimal-pad"
                        editable={!set.completed}
                      />
                    </View>
                  </View>

                  <View style={[s.tableCol, s.colReps]}>
                    <View style={[s.inputBox, set.completed && s.inputBoxDisabled]}>
                      <TextInput 
                        style={s.input}
                        defaultValue={set.reps}
                        keyboardType="number-pad"
                        editable={!set.completed}
                      />
                    </View>
                  </View>

                  <View style={[s.tableCol, s.colCheck]}>
                    <TouchableOpacity 
                      style={[s.checkBtn, set.completed && s.checkBtnCompleted]}
                      onPress={() => toggleSetComplete(eIdx, sIdx)}
                    >
                      {set.completed && <Check size={16} color="#FFFFFF" strokeWidth={3} />}
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <TouchableOpacity style={s.addSetBtn}>
                <Text style={s.addSetText}>+ Add Set</Text>
              </TouchableOpacity>
            </View>
          ))}
          
          <TouchableOpacity style={s.addExerciseBtn}>
            <Text style={s.addExerciseText}>+ Add Exercise</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    backgroundColor: colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
  },
  finishBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  finishBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  content: {
    padding: 16,
  },
  exerciseCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  exerciseOptions: {
    fontSize: 13,
    color: colors.accent,
    fontWeight: '600',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tableCol: {
    justifyContent: 'center',
  },
  colSet: {
    width: 40,
    alignItems: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: colors.textTertiary,
  },
  colWeight: {
    flex: 1,
    alignItems: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: colors.textTertiary,
  },
  colReps: {
    flex: 1,
    alignItems: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: colors.textTertiary,
  },
  colCheck: {
    width: 50,
    alignItems: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  setRowCompleted: {
    opacity: 0.6,
  },
  setNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  setNumberCompleted: {
    color: colors.success,
  },
  inputBox: {
    backgroundColor: colors.skeleton,
    borderRadius: 8,
    width: 70,
    height: 36,
    justifyContent: 'center',
  },
  inputBoxDisabled: {
    backgroundColor: 'transparent',
  },
  input: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  checkBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.skeleton,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBtnCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  addSetBtn: {
    marginTop: 8,
    alignItems: 'center',
    paddingVertical: 12,
  },
  addSetText: {
    color: colors.textTertiary,
    fontSize: 14,
    fontWeight: '600',
  },
  addExerciseBtn: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.accent,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addExerciseText: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '700',
  }
});
