import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, StatusBar } from 'react-native';
import { X, PlayCircle, Plus, LayoutGrid, CheckSquare, ChevronDown, List as ListIcon, Activity } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Ellipse, Circle, Rect, Line, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

export default function WorkoutDetailsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        
        {/* Top Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Imported workout</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <X size={20} color="#4B5563" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Workout Hero Summary */}
          <View style={styles.heroSection}>
            <View style={styles.heroMainInfo}>
              
              <View style={styles.thumbnailContainer}>
                <View style={styles.thumbnailPlaceholder}>
                  <Svg width={60} height={60} viewBox="0 0 80 80">
                    <Rect x="8" y="14" width="64" height="52" rx="10" stroke="#D1D5DB" strokeWidth="3" strokeDasharray="3 3" fill="none" />
                    <Path d="M22 52L36 34L48 48L58 38L66 48" stroke="#9CA3AF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <Circle cx="30" cy="28" r="5" fill="#f97316" fillOpacity={0.8} />
                    <Path d="M12 60C24 55 42 66 68 59" stroke="#CBD5E1" strokeWidth="3" fill="none" />
                  </Svg>
                </View>
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>NEW</Text>
                </View>
              </View>

              <View style={styles.heroTextInfo}>
                <Text style={styles.workoutTitle} numberOfLines={2}>Build a Bigger Back: Upper, La...</Text>
                <View style={styles.metadataRow}>
                  <View style={styles.metaBadge}>
                    <ListIcon size={14} color="#374151" strokeWidth={2.5} />
                    <Text style={styles.metaBadgeText}>4 exercises</Text>
                  </View>
                  <Text style={styles.metaDot}>•</Text>
                  <View style={styles.metaBadge}>
                    <PlayCircle size={16} color="#DC2626" />
                    <Text style={styles.metaBadgeText}>YouTube</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.actionPillsRow}>
              <TouchableOpacity style={styles.actionPill}>
                <LayoutGrid size={16} color="#4B5563" />
                <Text style={styles.actionPillText}>Collection</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionPill}>
                <CheckSquare size={16} color="#4B5563" />
                <Text style={styles.actionPillText}>Plan</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>ABOUT THIS WORKOUT</Text>
            <Text style={styles.aboutText}>
              This workout focuses on comprehensively developing a bigger and stronger back by specifically targeting the upper back, lats, and rhomboids...
            </Text>
            <TouchableOpacity>
              <Text style={styles.showMoreText}>Show more</Text>
            </TouchableOpacity>
          </View>

          {/* Muscles Worked Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>MUSCLES WORKED</Text>
            
            <View style={styles.musclesDisplayBox}>
              <View style={styles.muscleFigure}>
                <Text style={styles.figureLabel}>FRONT</Text>
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

              <View style={styles.muscleFigure}>
                <Text style={styles.figureLabel}>BACK</Text>
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

            <View style={styles.legendContainer}>
              <Text style={styles.legendText}>less</Text>
              <View style={styles.legendBar}>
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
              <Text style={styles.legendText}>more</Text>
            </View>
          </View>

          {/* Exercises List */}
          <View style={styles.section}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.sectionHeader}>EXERCISES</Text>
              <Text style={styles.exerciseCount}>4</Text>
            </View>

            {/* EXERCISE 1 */}
            <View style={styles.exerciseCard}>
              <View style={styles.exerciseCardTop}>
                <View style={styles.exerciseIcon}>
                  <Svg width={40} height={50} viewBox="0 0 100 120">
                    <Ellipse cx="50" cy="18" rx="10" ry="12" fill="#e2e8f0" />
                    <Path d="M44 32 L56 32 L54 42 L46 42 Z" fill="#e2e8f0" />
                    <Path d="M38 42 C48 38 52 38 62 42 C58 55 42 55 38 42 Z" fill="#7f1d1d" />
                    <Path d="M26 44 C20 54 22 68 28 72 C32 68 34 56 36 44 Z" fill="#ea580c" />
                    <Path d="M74 44 C80 54 78 68 72 72 C68 68 66 56 64 44 Z" fill="#ea580c" />
                    <Path d="M38 44 C45 56 50 75 50 90 C50 75 55 56 62 44 Z" fill="#991b1b" />
                    <Path d="M34 55 C30 75 36 100 48 105 C48 88 40 68 34 55 Z" fill="#b91c1c" />
                    <Path d="M66 55 C70 75 64 100 52 105 C52 88 60 68 66 55 Z" fill="#b91c1c" />
                    <Path d="M22 75 C16 90 18 105 22 115 Z" fill="#e2e8f0" />
                    <Path d="M78 75 C84 90 82 105 78 115 Z" fill="#e2e8f0" />
                  </Svg>
                </View>
                <View style={styles.exerciseDetails}>
                  <Text style={styles.exerciseTitle}>1. Wide Dumbbell Rows</Text>
                  <View style={styles.exerciseStats}>
                    <Text style={styles.statText}>2 sets</Text>
                    <Text style={styles.statText}>10 reps</Text>
                  </View>
                  <View style={styles.exerciseTime}>
                    <Text style={styles.playIcon}>▶</Text>
                    <Text style={styles.timeText}>0:05–0:09</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.exerciseDesc}>A dumbbell row variation targeting the upper back, emphasizing a wider pull.</Text>
              <View style={styles.stepsRow}>
                <Text style={styles.stepsText}>Steps · 4</Text>
                <ChevronDown size={16} color="#9CA3AF" />
              </View>
              <View style={styles.toolsRow}>
                <Text style={styles.toolsTitle}>TOOLS</Text>
                <View style={styles.toolTags}>
                  <View style={styles.toolTag}><Text style={styles.toolTagText}>Dumbbell</Text></View>
                  <View style={styles.toolTag}><Text style={styles.toolTagText}>Flat Bench</Text></View>
                </View>
              </View>
            </View>

            {/* EXERCISE 2 */}
            <View style={styles.exerciseCard}>
              <View style={styles.exerciseCardTop}>
                <View style={styles.exerciseIcon}>
                  <Svg width={40} height={50} viewBox="0 0 100 120">
                    <Ellipse cx="50" cy="18" rx="10" ry="12" fill="#e2e8f0" />
                    <Path d="M44 32 L56 32 L54 42 L46 42 Z" fill="#e2e8f0" />
                    <Path d="M38 42 C48 38 52 38 62 42 C58 55 42 55 38 42 Z" fill="#991b1b" />
                    <Path d="M34 55 C30 75 36 100 48 105 C48 88 40 68 34 55 Z" fill="#ea580c" />
                    <Path d="M66 55 C70 75 64 100 52 105 C52 88 60 68 66 55 Z" fill="#f97316" />
                  </Svg>
                </View>
                <View style={styles.exerciseDetails}>
                  <Text style={styles.exerciseTitle}>2. Meadows Row</Text>
                  <View style={styles.exerciseStats}>
                    <Text style={styles.statText}>2 sets</Text>
                    <Text style={styles.statText}>10 reps</Text>
                  </View>
                  <View style={styles.exerciseTime}>
                    <Text style={styles.playIcon}>▶</Text>
                    <Text style={styles.timeText}>0:09–0:11</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.exerciseDesc}>A single-arm barbell row variation, typically performed with a landmine attachment.</Text>
              <View style={styles.stepsRow}>
                <Text style={styles.stepsText}>Steps · 4</Text>
                <ChevronDown size={16} color="#9CA3AF" />
              </View>
              <View style={styles.toolsRow}>
                <Text style={styles.toolsTitle}>TOOLS</Text>
                <View style={styles.toolTags}>
                  <View style={styles.toolTag}><Text style={styles.toolTagText}>Barbell</Text></View>
                  <View style={styles.toolTag}><Text style={styles.toolTagText}>Weight Plates</Text></View>
                </View>
              </View>
            </View>

            {/* Extra padding for bottom nav */}
            <View style={{ height: 40 }} />
          </View>

        </ScrollView>

        {/* Sticky Bottom Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.saveBtn} activeOpacity={0.9} onPress={() => router.replace('/library')}>
            <Text style={styles.saveBtnText}>Save workout</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },
  heroSection: {
    paddingVertical: 8,
  },
  heroMainInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnailPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#ff5e00',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroTextInfo: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 24,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  metaDot: {
    color: '#D1D5DB',
  },
  actionPillsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  section: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textDecorationLine: 'underline',
    marginTop: 4,
  },
  musclesDisplayBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
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
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 4,
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    paddingHorizontal: 8,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  legendBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 8,
  },
  exerciseCount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#9CA3AF',
  },
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 16,
  },
  exerciseCardTop: {
    flexDirection: 'row',
    gap: 16,
  },
  exerciseIcon: {
    width: 64,
    height: 80,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseDetails: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  exerciseStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  exerciseTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  playIcon: {
    fontSize: 12,
    color: '#111827',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  exerciseDesc: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 12,
    lineHeight: 18,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  stepsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
    textDecorationLine: 'underline',
  },
  toolsRow: {
    marginTop: 12,
  },
  toolsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 6,
  },
  toolTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  toolTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  toolTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1F2937',
    fontStyle: 'italic',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32, // safe area spacing roughly
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  saveBtn: {
    backgroundColor: '#111317',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  }
});
