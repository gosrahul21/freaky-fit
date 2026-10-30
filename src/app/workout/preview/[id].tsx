import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  StatusBar, 
  ActivityIndicator, 
  Modal, 
  Image, 
  Linking, 
  Alert, 
  TextInput 
} from 'react-native';
import { 
  ChevronLeft, 
  Share2, 
  Play, 
  MoreVertical, 
  Plus, 
  FolderPlus, 
  X, 
  Activity 
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../../../lib/supabase';
import { shareWorkout } from '../../../utils/share';
import Svg, { Path, Ellipse, Line, Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function WorkoutDetailsScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const s = makeStyles(colors, isDark);
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const [workout, setWorkout] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<any[]>([]);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [showFullAbout, setShowFullAbout] = useState(false);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [activeExerciseMenu, setActiveExerciseMenu] = useState<any | null>(null);

  const openVideoAtTimestamp = async (startTimeStr?: string) => {
    if (!workout?.source_url) return;
    let url = workout.source_url;
    if (startTimeStr) {
      const parts = String(startTimeStr).split(':').map(Number);
      let totalSeconds = 0;
      if (parts.length === 3) {
        totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else if (parts.length === 2) {
        totalSeconds = parts[0] * 60 + parts[1];
      } else if (parts.length === 1 && !isNaN(parts[0])) {
        totalSeconds = parts[0];
      }
      if (totalSeconds > 0 && (url.includes('youtube.com') || url.includes('youtu.be'))) {
        url += (url.includes('?') ? '&' : '?') + `t=${totalSeconds}s`;
      }
    }
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch {
      Linking.openURL(url);
    }
  };

  useEffect(() => {
    let isCurrent = true;
    async function loadData() {
      try {
        const { data: wData } = await supabase
          .from('workouts')
          .select('*, workout_exercises(*, exercises(*))')
          .eq('id', id)
          .single();

        if (wData && isCurrent) {
          wData.workout_exercises = (wData.workout_exercises || []).sort((a: any, b: any) => a.order_index - b.order_index);
          setWorkout(wData);
          if (wData.workout_exercises?.length > 0) {
            setExpandedExerciseId(wData.workout_exercises[0].id);
          }
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (user && isCurrent) {
          const { data: cData } = await supabase
            .from('collections')
            .select('*')
            .eq('user_id', user.id);
          if (cData && isCurrent) setCollections(cData);
        }
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    }

    if (id) {
      loadData();
    }
    return () => {
      isCurrent = false;
    };
  }, [id]);

  const handleSaveToCollection = async (collectionId: string) => {
    if (selectedExerciseId) {
      const { error } = await supabase
        .from('collection_exercises')
        .insert([{ collection_id: collectionId, workout_exercise_id: selectedExerciseId }]);
      
      setShowCollectionModal(false);
      setSelectedExerciseId(null);
      if (error && error.code !== '23505') {
        Alert.alert('Error', 'Failed to save to collection: ' + error.message);
      } else {
        Alert.alert('Success', 'Exercise saved to collection!');
      }
    } else if (workout?.workout_exercises?.length) {
      const inserts = workout.workout_exercises.map((we: any) => ({
        collection_id: collectionId,
        workout_exercise_id: we.id,
      }));
      const { error } = await supabase
        .from('collection_exercises')
        .insert(inserts);

      setShowCollectionModal(false);
      if (error && error.code !== '23505') {
        Alert.alert('Error', 'Failed to save to collection: ' + error.message);
      } else {
        Alert.alert('Success', 'Saved all exercises to collection!');
      }
    }
  };

  const handleCreateAndSave = async () => {
    if (!newCollectionName.trim()) {
      Alert.alert('Error', 'Please enter a collection name.');
      return;
    }
    setIsCreatingCollection(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Sign In Required', 'Please sign in to save collections.', [
          { text: 'Sign In', onPress: () => router.push('/auth/login') },
          { text: 'Cancel', style: 'cancel' }
        ]);
        setIsCreatingCollection(false);
        return;
      }
      const { data, error } = await supabase
        .from('collections')
        .insert([{ title: newCollectionName.trim(), user_id: user.id }])
        .select()
        .single();
      if (error) {
        Alert.alert('Error', error.message);
      } else if (data) {
        setCollections((prev: any[]) => [data, ...prev]);
        setNewCollectionName('');
        setShowCreateInput(false);
        await handleSaveToCollection(data.id);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create collection');
    } finally {
      setIsCreatingCollection(false);
    }
  };

  if (loading || !workout) {
    return (
      <SafeAreaView style={[s.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </SafeAreaView>
    );
  }

  const exercises = workout.workout_exercises || [];
  const exercisesCount = exercises.length;
  const totalSets = exercises.reduce((acc: number, curr: any) => acc + (Number(curr.sets) || 3), 0);
  const estMinutes = exercisesCount > 0 ? Math.max(15, Math.round(totalSets * 2.2)) : 25;

  // Extract equipment & tags
  const equipmentSet = new Set<string>();
  exercises.forEach((we: any) => {
    const eqList = we.exercises?.equipment;
    if (Array.isArray(eqList)) {
      eqList.forEach((eq: string) => equipmentSet.add(eq));
    } else if (typeof eqList === 'string' && eqList.trim()) {
      equipmentSet.add(eqList.trim());
    }
  });
  const equipmentList = Array.from(equipmentSet);
  const targetTag = workout.target_muscle || workout.category || 'Biceps';
  const displayTags = [targetTag, ...(equipmentList.length > 0 ? equipmentList.slice(0, 2) : ['EZ-Bar', 'Dumbbells'])];

  // Platform name formatted
  const platformName = workout.source_type 
    ? (workout.source_type.charAt(0).toUpperCase() + workout.source_type.slice(1).toLowerCase())
    : (workout.source_url?.includes('youtube') || workout.source_url?.includes('youtu.be') ? 'YouTube' : 'Custom');

  return (
    <View style={s.root}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />

      {/* Floating Header */}
      <View style={[s.floatingHeader, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity 
          style={s.circularNavBtn} 
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={22} color={colors.textPrimary} strokeWidth={2.4} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={s.circularNavBtn} 
          onPress={() => workout && shareWorkout(workout)}
          activeOpacity={0.7}
        >
          <Share2 size={19} color={colors.textPrimary} strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={s.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={s.heroContainer}>
          {workout.thumbnail_url ? (
            <Image 
              source={{ uri: workout.thumbnail_url }} 
              style={s.heroImage} 
              resizeMode="cover"
            />
          ) : (
            <View style={s.heroPlaceholder}>
              <Activity size={60} color={colors.textTertiary} />
            </View>
          )}

          {/* Bottom gradient fade */}
          <LinearGradient
            colors={['transparent', isDark ? 'rgba(14,14,16,0.65)' : 'rgba(255,255,255,0.7)', colors.background]}
            locations={[0, 0.55, 1]}
            style={s.heroGradient}
          />

          {/* Center Play Button Overlay */}
          {workout.source_url && (
            <TouchableOpacity 
              style={s.heroPlayButton}
              activeOpacity={0.85}
              onPress={() => openVideoAtTimestamp()}
            >
              <Play size={26} color="#000000" fill="#000000" style={{ marginLeft: 3 }} />
            </TouchableOpacity>
          )}
        </View>

        {/* Content Details */}
        <View style={s.bodyContent}>
          {/* Platform & New Badges */}
          <View style={s.badgesRow}>
            <View style={s.platformPill}>
              <View style={s.platformDot} />
              <Text style={s.platformText}>{platformName}</Text>
            </View>
            <View style={s.newBadge}>
              <Text style={s.newBadgeText}>NEW</Text>
            </View>
          </View>

          {/* Workout Title */}
          <Text style={s.workoutTitle}>{workout.title}</Text>

          {/* Stats Row */}
          <View style={s.statsRow}>
            <Text style={s.statItem}>
              <Text style={s.statValue}>{exercisesCount}</Text>
              <Text style={s.statLabel}> exercises</Text>
            </Text>
            <Text style={s.statItem}>
              <Text style={s.statValue}>{totalSets}</Text>
              <Text style={s.statLabel}> sets</Text>
            </Text>
            <Text style={s.statItem}>
              <Text style={s.statValue}>~{estMinutes}</Text>
              <Text style={s.statLabel}> min</Text>
            </Text>
          </View>

          {/* Tags Row */}
          <View style={s.tagsRow}>
            {displayTags.map((tag, idx) => (
              <View key={idx} style={s.tagPill}>
                <Text style={s.tagPillText}>{tag}</Text>
              </View>
            ))}
          </View>

          {/* Action Pills: + Collection, + Plan, Edit */}
          <View style={s.actionPillsRow}>
            <TouchableOpacity 
              style={s.actionPill} 
              activeOpacity={0.75}
              onPress={() => {
                setSelectedExerciseId(null);
                setShowCollectionModal(true);
              }}
            >
              <Text style={s.actionPillText}>+ Collection</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={s.actionPill} 
              activeOpacity={0.75}
              onPress={() => router.push('/plan-builder')}
            >
              <Text style={s.actionPillText}>+ Plan</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={s.actionPill} 
              activeOpacity={0.75}
              onPress={() => {
                Alert.alert('Edit Workout', 'Workout editing tools are coming soon!');
              }}
            >
              <Text style={s.actionPillText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* ABOUT THIS WORKOUT */}
          <View style={s.section}>
            <Text style={s.sectionHeader}>ABOUT THIS WORKOUT</Text>
            <Text 
              style={s.aboutText} 
              numberOfLines={showFullAbout ? undefined : 2}
            >
              {workout.description || 'A focused bicep workout routine featuring EZ-Bar curls, standing hammer curls, and incline dumbbell curls.'}
            </Text>
            <TouchableOpacity 
              onPress={() => setShowFullAbout(!showFullAbout)}
              style={s.showMoreBtn}
              activeOpacity={0.7}
            >
              <Text style={s.showMoreText}>
                {showFullAbout ? 'Show less' : 'Show more'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* MUSCLES WORKED — UNTOUCHED SKELETON SECTION */}
          <View style={s.section}>
            <Text style={s.sectionHeader}>MUSCLES WORKED</Text>
            
            <View style={s.musclesDisplayBox}>
              <View style={s.muscleFigure}>
                <Text style={s.figureLabel}>FRONT</Text>
                <Svg width={100} height={180} viewBox="0 0 160 300">
                  {/* Base Body */}
                  <Ellipse cx="80" cy="22" rx="14" ry="18" fill="#e2e8f0" />
                  <Path d="M72 40 L88 40 L86 52 L74 52 Z" fill="#e2e8f0" />
                  <Path d="M60 52 C50 65 52 110 54 135 C65 140 95 140 106 135 C108 110 110 65 100 52 Z" fill="#e2e8f0" />
                  <Line x1="80" y1="58" x2="80" y2="128" stroke="#cbd5e1" strokeWidth="2" />
                  {/* Highlights Front */}
                  <Path d="M50 56 C44 65 42 80 48 90 C54 86 56 68 60 56 Z" fill="#ea580c" />
                  <Path d="M110 56 C116 65 118 80 112 90 C106 86 104 68 100 56 Z" fill="#ea580c" />
                  <Path d="M42 120 C36 135 34 165 38 175 C42 170 47 145 46 120 Z" fill="#f97316" />
                  <Path d="M118 120 C124 135 126 165 122 175 C118 170 113 145 114 120 Z" fill="#f97316" />
                  {/* Arms */}
                  <Path d="M47 90 C43 100 42 112 43 120 C47 120 51 106 50 90 Z" fill="#cbd5e1" />
                  <Path d="M113 90 C117 100 118 112 117 120 C113 120 109 106 110 90 Z" fill="#cbd5e1" />
                  {/* Lower */}
                  <Path d="M56 136 C64 146 96 146 104 136 C100 156 60 156 56 136 Z" fill="#e2e8f0" />
                  <Path d="M56 150 C54 185 58 220 62 235 C68 234 76 215 76 150 Z" fill="#f97316" />
                  <Path d="M104 150 C106 185 102 220 98 235 C92 234 84 215 84 150 Z" fill="#f97316" />
                  <Path d="M60 240 C56 260 58 280 62 292 C67 292 70 275 72 240 Z" fill="#e2e8f0" />
                  <Path d="M100 240 C104 260 102 280 98 292 C93 292 90 275 88 240 Z" fill="#e2e8f0" />
                </Svg>
              </View>

              <View style={s.muscleFigure}>
                <Text style={s.figureLabel}>BACK</Text>
                <Svg width={100} height={180} viewBox="0 0 160 300">
                  <Ellipse cx="80" cy="22" rx="14" ry="18" fill="#e2e8f0" />
                  <Path d="M72 38 C75 48 85 48 88 38 Z" fill="#e2e8f0" />
                  {/* Back highlights */}
                  <Path d="M64 50 C74 46 86 46 96 50 C90 68 70 68 64 50 Z" fill="#7f1d1d" />
                  <Path d="M50 56 C44 65 42 78 48 88 C54 84 58 70 62 56 Z" fill="#c2410c" />
                  <Path d="M110 56 C116 65 118 78 112 88 C106 84 102 70 98 56 Z" fill="#c2410c" />
                  <Path d="M64 56 C74 72 80 95 80 115 C80 95 86 72 96 56 C88 64 72 64 64 56 Z" fill="#991b1b" />
                  <Path d="M60 70 C54 95 62 132 78 135 C78 110 68 85 60 70 Z" fill="#b91c1c" />
                  <Path d="M100 70 C106 95 98 132 82 135 C82 110 92 85 100 70 Z" fill="#b91c1c" />
                  <Path d="M43 120 C36 135 34 165 38 175 C42 170 47 145 46 120 Z" fill="#f97316" />
                  <Path d="M117 120 C124 135 126 165 122 175 C118 170 113 145 114 120 Z" fill="#f97316" />
                  <Path d="M47 90 C43 100 42 112 43 120 C47 120 51 106 50 90 Z" fill="#ea580c" />
                  <Path d="M113 90 C117 100 118 112 117 120 C113 120 109 106 110 90 Z" fill="#ea580c" />
                  <Path d="M58 136 C64 135 78 140 79 164 C65 168 56 156 58 136 Z" fill="#991b1b" />
                  <Path d="M102 136 C96 135 82 140 81 164 C95 168 104 156 102 136 Z" fill="#991b1b" />
                  <Path d="M58 168 C58 200 62 230 68 235 C74 230 78 200 78 168 Z" fill="#c2410c" />
                  <Path d="M102 168 C102 200 98 230 92 235 C86 230 82 200 82 168 Z" fill="#c2410c" />
                  <Path d="M60 240 C56 260 58 280 62 292 C67 292 70 275 72 240 Z" fill="#e2e8f0" />
                  <Path d="M100 240 C104 260 102 280 98 292 C93 292 90 275 88 240 Z" fill="#e2e8f0" />
                </Svg>
              </View>
            </View>

            <View style={s.legendContainer}>
              <Text style={s.legendText}>less</Text>
              <View style={s.legendBar}>
                <Svg width="100%" height="100%">
                  <Defs>
                    <SvgLinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                      <Stop offset="0" stopColor="#e5e7eb" stopOpacity="1" />
                      <Stop offset="0.33" stopColor="#fcd34d" stopOpacity="1" />
                      <Stop offset="0.66" stopColor="#f97316" stopOpacity="1" />
                      <Stop offset="1" stopColor="#7f1d1d" stopOpacity="1" />
                    </SvgLinearGradient>
                  </Defs>
                  <Rect width="100%" height="100%" fill="url(#grad)" rx="4" />
                </Svg>
              </View>
              <Text style={s.legendText}>more</Text>
            </View>
          </View>

          {/* EXERCISES SECTION */}
          <View style={s.section}>
            <View style={s.exercisesHeaderRow}>
              <Text style={s.exerciseHeaderTitle}>
                Exercises <Text style={{ color: colors.accent }}>{exercisesCount}</Text>
              </Text>
              <Text style={s.exerciseTotalSets}>{totalSets} sets total</Text>
            </View>

            {exercises.map((we: any, idx: number) => {
              const ex = we.exercises;
              const isExpanded = expandedExerciseId === we.id;
              const timeRange = (we.timestamp_start || we.timestamp_end) 
                ? `${we.timestamp_start || '0:00'}–${we.timestamp_end || '0:00'}`
                : '0:00–0:00';
              const repText = we.reps ? String(we.reps) : '10–12';
              const setsReps = `${we.sets || 3} × ${repText}`;
              const equipmentLabel = Array.isArray(ex?.equipment) && ex.equipment.length > 0 
                ? ex.equipment[0] 
                : (typeof ex?.equipment === 'string' && ex.equipment.trim() ? ex.equipment : 'Dumbbells');
              const tipsText = we.notes || we.description || ex?.description || (Array.isArray(ex?.steps) ? ex.steps.join(' ') : ex?.steps);

              return (
                <TouchableOpacity 
                  key={we.id} 
                  style={s.exerciseCard}
                  activeOpacity={0.88}
                  onPress={() => setExpandedExerciseId(isExpanded ? null : we.id)}
                >
                  <View style={s.exerciseCardTop}>
                    {/* Thumbnail with timestamp & play */}
                    <TouchableOpacity 
                      style={s.exerciseThumbnailBox}
                      activeOpacity={0.8}
                      onPress={() => openVideoAtTimestamp(we.timestamp_start)}
                    >
                      {workout.thumbnail_url ? (
                        <Image source={{ uri: workout.thumbnail_url }} style={s.exerciseThumbnailImg} resizeMode="cover" />
                      ) : (
                        <View style={s.exerciseThumbnailPlaceholder}>
                          <Activity size={24} color={colors.textTertiary} />
                        </View>
                      )}
                      {/* Play overlay button */}
                      <View style={s.exercisePlayBadge}>
                        <Play size={14} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 2 }} />
                      </View>
                      {/* Timestamp badge */}
                      <View style={s.timestampBadge}>
                        <Text style={s.timestampText}>{timeRange}</Text>
                      </View>
                    </TouchableOpacity>

                    {/* Exercise Info */}
                    <View style={s.exerciseDetails}>
                      <View style={s.exerciseTitleRow}>
                        <Text style={s.exerciseName} numberOfLines={2}>
                          <Text style={s.exerciseIndex}>{idx + 1} </Text>
                          {ex?.name || 'Exercise'}
                        </Text>
                        <TouchableOpacity 
                          style={s.exerciseOptionsBtn}
                          activeOpacity={0.7}
                          onPress={() => setActiveExerciseMenu(we)}
                        >
                          <MoreVertical size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                      </View>

                      {/* Badges row: sets/reps & equipment */}
                      <View style={s.exerciseBadgesRow}>
                        <View style={s.setsRepsBadge}>
                          <Text style={s.setsRepsText}>{setsReps}</Text>
                        </View>
                        <View style={s.equipmentBadge}>
                          <Text style={s.equipmentText}>{equipmentLabel}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Expanded tips & notes */}
                  {isExpanded && (
                    <View style={s.expandedContent}>
                      {tipsText ? (
                        <Text style={s.tipsText}>{tipsText}</Text>
                      ) : (
                        <Text style={s.tipsText}>Keep proper form and lift with controlled tempo throughout each rep.</Text>
                      )}
                      
                      {/* Equipment Pills */}
                      <View style={s.expandedEquipmentRow}>
                        {Array.isArray(ex?.equipment) && ex.equipment.length > 0 ? (
                          ex.equipment.map((eq: string, i: number) => (
                            <View key={i} style={s.expandedEquipmentTag}>
                              <Text style={s.expandedEquipmentText}>{eq}</Text>
                            </View>
                          ))
                        ) : (
                          <View style={s.expandedEquipmentTag}>
                            <Text style={s.expandedEquipmentText}>{equipmentLabel}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}

            {/* Helper hint */}
            <Text style={s.tapHelperText}>Tap an exercise to see tips and equipment</Text>

            {/* Bottom spacer for sticky CTA */}
            <View style={{ height: 100 }} />
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={[s.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity 
          style={s.startBtn} 
          activeOpacity={0.9} 
          onPress={() => router.push(`/workout/${workout.id}`)}
        >
          <Play size={18} color="#FFFFFF" fill="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={s.startBtnText}>Start workout • ~{estMinutes} min</Text>
        </TouchableOpacity>
      </View>

      {/* Exercise 3-dots Menu Modal */}
      <Modal
        visible={!!activeExerciseMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveExerciseMenu(null)}
      >
        <TouchableOpacity 
          style={s.modalBackdrop} 
          activeOpacity={1} 
          onPress={() => setActiveExerciseMenu(null)}
        >
          <View style={s.actionSheetContent}>
            <View style={s.actionSheetHeader}>
              <Text style={s.actionSheetTitle} numberOfLines={1}>
                {activeExerciseMenu?.exercises?.name || 'Exercise Options'}
              </Text>
              <TouchableOpacity onPress={() => setActiveExerciseMenu(null)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={s.actionSheetOption}
              onPress={() => {
                const exId = activeExerciseMenu.id;
                setActiveExerciseMenu(null);
                setSelectedExerciseId(exId);
                setShowCollectionModal(true);
              }}
            >
              <FolderPlus size={20} color={colors.accent} />
              <Text style={s.actionSheetOptionText}>Add to Collection</Text>
            </TouchableOpacity>

            {workout.source_url && (
              <TouchableOpacity 
                style={s.actionSheetOption}
                onPress={() => {
                  const start = activeExerciseMenu.timestamp_start;
                  setActiveExerciseMenu(null);
                  openVideoAtTimestamp(start);
                }}
              >
                <Play size={20} color={colors.textPrimary} fill={colors.textPrimary} />
                <Text style={s.actionSheetOptionText}>Watch Exercise Clip</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[s.actionSheetOption, { borderBottomWidth: 0 }]}
              onPress={() => setActiveExerciseMenu(null)}
            >
              <X size={20} color={colors.textSecondary} />
              <Text style={[s.actionSheetOptionText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Collection Modal */}
      <Modal
        visible={showCollectionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCollectionModal(false)}
      >
        <TouchableOpacity 
          style={s.modalBackdrop} 
          activeOpacity={1} 
          onPress={() => { setShowCollectionModal(false); setShowCreateInput(false); }}
        >
          <TouchableOpacity style={s.modalContent} activeOpacity={1}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Save to Collection</Text>
              <TouchableOpacity onPress={() => { setShowCollectionModal(false); setShowCreateInput(false); }}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Inline Create Collection */}
            {showCreateInput ? (
              <View style={s.createCollectionBox}>
                <TextInput
                  style={s.createCollectionInput}
                  placeholder="Collection name (e.g. Leg Day)"
                  placeholderTextColor={colors.textTertiary}
                  value={newCollectionName}
                  onChangeText={setNewCollectionName}
                  autoFocus
                />
                <View style={s.createActionsRow}>
                  <TouchableOpacity 
                    style={s.createCancelBtn}
                    onPress={() => { setShowCreateInput(false); setNewCollectionName(''); }}
                  >
                    <Text style={s.createCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={s.createConfirmBtn}
                    onPress={handleCreateAndSave}
                    disabled={isCreatingCollection}
                  >
                    <Text style={s.createConfirmText}>{isCreatingCollection ? 'Creating...' : 'Create & Add'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity 
                style={s.addNewCollectionRow}
                activeOpacity={0.8}
                onPress={() => setShowCreateInput(true)}
              >
                <Plus size={18} color={colors.accent} strokeWidth={2.5} />
                <Text style={s.addNewCollectionText}>Create New Collection</Text>
              </TouchableOpacity>
            )}
            
            <ScrollView style={s.collectionList}>
              {collections.length === 0 ? (
                <Text style={s.emptyCollectionText}>No collections yet. Tap above to create one!</Text>
              ) : (
                collections.map((c) => (
                  <TouchableOpacity 
                    key={c.id} 
                    style={s.collectionRow} 
                    onPress={() => handleSaveToCollection(c.id)}
                  >
                    <FolderPlus size={20} color={colors.accent} />
                    <Text style={s.collectionName}>{c.title}</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof import("../../../contexts/ThemeContext").useTheme>["colors"], isDark: boolean) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  circularNavBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: isDark ? 'rgba(23, 23, 26, 0.75)' : 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroContainer: {
    width: SCREEN_WIDTH,
    height: 250,
    position: 'relative',
    backgroundColor: colors.card,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 140,
  },
  heroPlayButton: {
    position: 'absolute',
    top: '46%',
    left: '50%',
    transform: [{ translateX: -28 }, { translateY: -28 }],
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6,
  },
  bodyContent: {
    paddingHorizontal: 20,
    marginTop: -8,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  platformPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#1F1F24' : '#F3F4F6',
    borderWidth: 1,
    borderColor: isDark ? '#2E2E33' : '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 6,
  },
  platformDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  platformText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  newBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  workoutTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 32,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 14,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  tagPill: {
    backgroundColor: isDark ? '#1C1C20' : '#F3F4F6',
    borderWidth: 1,
    borderColor: isDark ? '#2D2D34' : '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  tagPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  actionPillsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  actionPill: {
    flex: 1,
    backgroundColor: isDark ? '#1A1A1E' : '#F9FAFB',
    borderWidth: 1,
    borderColor: isDark ? '#2E2E35' : '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPillText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  section: {
    paddingTop: 18,
    marginBottom: 8,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textTertiary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  aboutText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  showMoreBtn: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accent,
  },
  musclesDisplayBox: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  muscleFigure: {
    alignItems: 'center',
  },
  figureLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
    paddingHorizontal: 8,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  legendBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: isDark ? '#2E2E33' : '#E5E7EB',
  },
  exercisesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  exerciseHeaderTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  exerciseTotalSets: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  exerciseCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 14,
  },
  exerciseCardTop: {
    flexDirection: 'row',
    gap: 14,
  },
  exerciseThumbnailBox: {
    width: 76,
    height: 76,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  exerciseThumbnailImg: {
    width: '100%',
    height: '100%',
  },
  exerciseThumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exercisePlayBadge: {
    position: 'absolute',
    top: '32%',
    left: '32%',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timestampBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 6,
    paddingVertical: 2,
    alignItems: 'center',
  },
  timestampText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  exerciseDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  exerciseTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  exerciseIndex: {
    color: colors.accent,
    fontWeight: '900',
    fontSize: 16,
  },
  exerciseName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 20,
  },
  exerciseOptionsBtn: {
    padding: 4,
    marginLeft: 4,
  },
  exerciseBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  setsRepsBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },
  setsRepsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  equipmentBadge: {
    backgroundColor: isDark ? '#232328' : '#F3F4F6',
    borderWidth: 1,
    borderColor: isDark ? '#2F2F37' : '#E5E7EB',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },
  equipmentText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  tipsText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: 10,
  },
  expandedEquipmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  expandedEquipmentTag: {
    backgroundColor: isDark ? '#232328' : '#F3F4F6',
    borderWidth: 1,
    borderColor: isDark ? '#2F2F37' : '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  expandedEquipmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  tapHelperText: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: 10,
    fontWeight: '500',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: isDark ? 'rgba(14,14,16,0.92)' : 'rgba(255,255,255,0.92)',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  startBtn: {
    backgroundColor: colors.accent,
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    maxHeight: '65%',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  collectionList: {
    marginBottom: 20,
  },
  collectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    gap: 12,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  emptyCollectionText: {
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: 20,
  },
  addNewCollectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: isDark ? 'rgba(255, 94, 0, 0.12)' : '#FFF7ED',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 94, 0, 0.25)' : '#FFEDD5',
    marginBottom: 16,
  },
  addNewCollectionText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accent,
  },
  createCollectionBox: {
    padding: 14,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 16,
    gap: 12,
  },
  createCollectionInput: {
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  createActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  createCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  createCancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  createConfirmBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.accent,
  },
  createConfirmText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionSheetContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  actionSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  actionSheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 10,
  },
  actionSheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  actionSheetOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
