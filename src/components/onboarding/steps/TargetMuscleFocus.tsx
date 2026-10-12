import { hapticSelection } from '../../../utils/haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import Svg, { Path, Ellipse, Line } from 'react-native-svg';
import { Header } from '../Header';
import { ContinueButton } from '../ContinueButton';

const FRONT_MUSCLES = [
  { id: 'chest', label: 'Chest' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'biceps', label: 'Biceps' },
  { id: 'forearms', label: 'Forearms' },
  { id: 'abs', label: 'Abs & Core' },
  { id: 'quads', label: 'Quads' },
  { id: 'calves', label: 'Calves' },
];

const BACK_MUSCLES = [
  { id: 'traps', label: 'Traps' },
  { id: 'upper_back', label: 'Lats & Upper Back' },
  { id: 'triceps', label: 'Triceps' },
  { id: 'lower_back', label: 'Lower Back' },
  { id: 'glutes', label: 'Glutes' },
  { id: 'hamstrings', label: 'Hamstrings' },
  { id: 'calves', label: 'Calves' },
];

export function TargetMuscleFocus({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [viewAngle, setViewAngle] = useState<'front' | 'back'>('front');

  const toggleSelection = (id: string) => {
    hapticSelection();
    setSelected(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleContinue = async () => {
    await AsyncStorage.setItem('@onboarding_target_muscles', JSON.stringify(selected));
    onNext();
  };

  const currentMuscles = viewAngle === 'front' ? FRONT_MUSCLES : BACK_MUSCLES;
  const isSelected = (id: string) => selected.includes(id);

  const highlightColor = '#FF5E00';
  const defaultBodyColor = '#E2E8F0';
  const strokeLineColor = '#CBD5E1';

  return (
    <View style={styles.container}>
      <Header currentStep={12} onBack={onBack} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <Text style={styles.headline}>Target muscle groups</Text>
          <Text style={styles.subtitle}>
            Select what you want to grow — our AI will prioritize workouts matching these areas.
          </Text>
        </View>

        <View style={styles.viewToggleContainer}>
          <View style={styles.viewToggle}>
            <TouchableOpacity 
              style={[styles.toggleBtn, viewAngle === 'front' && styles.toggleBtnActive]}
              onPress={() => { hapticSelection(); setViewAngle('front'); }}
            >
              {viewAngle === 'front' && <View style={styles.toggleDot} />}
              <Text style={[styles.toggleBtnText, viewAngle === 'front' && styles.toggleBtnTextActive]}>
                Front side
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleBtn, viewAngle === 'back' && styles.toggleBtnActive]}
              onPress={() => { hapticSelection(); setViewAngle('back'); }}
            >
              {viewAngle === 'back' && <View style={styles.toggleDot} />}
              <Text style={[styles.toggleBtnText, viewAngle === 'back' && styles.toggleBtnTextActive]}>
                Back side
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.splitLayout}>
          <View style={styles.optionsCol}>
            {currentMuscles.map((muscle) => {
              const active = isSelected(muscle.id);
              return (
                <TouchableOpacity
                  key={muscle.id}
                  activeOpacity={0.8}
                  onPress={() => toggleSelection(muscle.id)}
                  style={[
                    styles.muscleCard,
                    active && styles.muscleCardSelected
                  ]}
                >
                  <View style={[styles.checkbox, active && styles.checkboxSelected]}>
                    {active && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                  </View>
                  <Text style={[styles.muscleLabel, active && styles.muscleLabelSelected]}>
                    {muscle.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          
          <View style={styles.graphicCol}>
            <View style={styles.graphicGlow} />

            {/* Interactive Anatomical SVG Figure */}
            <View style={styles.anatomySvgWrapper}>
              {viewAngle === 'front' ? (
                <Svg width={135} height={290} viewBox="0 0 160 300">
                  {/* Head */}
                  <Ellipse cx="80" cy="22" rx="14" ry="18" fill={defaultBodyColor} />
                  {/* Neck */}
                  <Path d="M72 40 L88 40 L86 52 L74 52 Z" fill={defaultBodyColor} />
                  {/* Torso Base */}
                  <Path d="M60 52 C50 65 52 110 54 135 C65 140 95 140 106 135 C108 110 110 65 100 52 Z" fill={defaultBodyColor} />
                  <Line x1="80" y1="58" x2="80" y2="128" stroke={strokeLineColor} strokeWidth="1.5" />

                  {/* Shoulders / Delts */}
                  <Path d="M50 56 C44 65 42 78 48 88 C54 84 56 68 60 56 Z" fill={isSelected('shoulders') ? highlightColor : defaultBodyColor} />
                  <Path d="M110 56 C116 65 118 78 112 88 C106 84 104 68 100 56 Z" fill={isSelected('shoulders') ? highlightColor : defaultBodyColor} />

                  {/* Chest */}
                  <Path d="M58 56 C58 74 78 76 78 56 Z" fill={isSelected('chest') ? highlightColor : defaultBodyColor} />
                  <Path d="M102 56 C102 74 82 76 82 56 Z" fill={isSelected('chest') ? highlightColor : defaultBodyColor} />

                  {/* Biceps */}
                  <Path d="M47 88 C43 98 42 110 44 118 C48 118 51 104 50 88 Z" fill={isSelected('biceps') ? highlightColor : defaultBodyColor} />
                  <Path d="M113 88 C117 98 118 110 116 118 C112 118 109 104 110 88 Z" fill={isSelected('biceps') ? highlightColor : defaultBodyColor} />

                  {/* Forearms */}
                  <Path d="M44 118 C40 134 38 152 41 164 C45 164 48 146 48 118 Z" fill={isSelected('forearms') ? highlightColor : defaultBodyColor} />
                  <Path d="M116 118 C120 134 122 152 119 164 C115 164 112 146 112 118 Z" fill={isSelected('forearms') ? highlightColor : defaultBodyColor} />

                  {/* Abs & Core */}
                  <Path d="M64 78 C64 96 78 96 78 78 Z" fill={isSelected('abs') ? highlightColor : defaultBodyColor} />
                  <Path d="M96 78 C96 96 82 96 82 78 Z" fill={isSelected('abs') ? highlightColor : defaultBodyColor} />
                  <Path d="M65 98 C65 120 78 120 78 98 Z" fill={isSelected('abs') ? highlightColor : defaultBodyColor} />
                  <Path d="M95 98 C95 120 82 120 82 98 Z" fill={isSelected('abs') ? highlightColor : defaultBodyColor} />

                  {/* Pelvis */}
                  <Path d="M56 136 C64 146 96 146 104 136 C100 156 60 156 56 136 Z" fill={defaultBodyColor} />

                  {/* Quads */}
                  <Path d="M56 150 C54 185 58 220 62 235 C68 234 76 215 76 150 Z" fill={isSelected('quads') ? highlightColor : defaultBodyColor} />
                  <Path d="M104 150 C106 185 102 220 98 235 C92 234 84 215 84 150 Z" fill={isSelected('quads') ? highlightColor : defaultBodyColor} />

                  {/* Calves */}
                  <Path d="M60 240 C56 260 58 280 62 292 C67 292 70 275 72 240 Z" fill={isSelected('calves') ? highlightColor : defaultBodyColor} />
                  <Path d="M100 240 C104 260 102 280 98 292 C93 292 90 275 88 240 Z" fill={isSelected('calves') ? highlightColor : defaultBodyColor} />
                </Svg>
              ) : (
                <Svg width={135} height={290} viewBox="0 0 160 300">
                  {/* Head */}
                  <Ellipse cx="80" cy="22" rx="14" ry="18" fill={defaultBodyColor} />
                  {/* Neck / Traps Base */}
                  <Path d="M72 38 C75 48 85 48 88 38 Z" fill={defaultBodyColor} />

                  {/* Traps */}
                  <Path d="M64 48 C74 44 86 44 96 48 C90 64 70 64 64 48 Z" fill={isSelected('traps') ? highlightColor : defaultBodyColor} />

                  {/* Rear Delts */}
                  <Path d="M50 56 C44 65 42 78 48 88 C54 84 58 70 62 56 Z" fill={isSelected('shoulders') ? highlightColor : defaultBodyColor} />
                  <Path d="M110 56 C116 65 118 78 112 88 C106 84 102 70 98 56 Z" fill={isSelected('shoulders') ? highlightColor : defaultBodyColor} />

                  {/* Lats & Upper Back */}
                  <Path d="M62 64 C54 85 60 120 76 126 C76 102 68 80 62 64 Z" fill={isSelected('upper_back') ? highlightColor : defaultBodyColor} />
                  <Path d="M98 64 C106 85 100 120 84 126 C84 102 92 80 98 64 Z" fill={isSelected('upper_back') ? highlightColor : defaultBodyColor} />

                  {/* Triceps */}
                  <Path d="M47 88 C43 98 42 110 44 118 C48 118 51 104 50 88 Z" fill={isSelected('triceps') ? highlightColor : defaultBodyColor} />
                  <Path d="M113 88 C117 98 118 110 116 118 C112 118 109 104 110 88 Z" fill={isSelected('triceps') ? highlightColor : defaultBodyColor} />

                  {/* Lower Back */}
                  <Path d="M68 118 C74 130 86 130 92 118 C88 136 72 136 68 118 Z" fill={isSelected('lower_back') ? highlightColor : defaultBodyColor} />

                  {/* Glutes */}
                  <Path d="M56 138 C54 165 76 166 76 138 Z" fill={isSelected('glutes') ? highlightColor : defaultBodyColor} />
                  <Path d="M104 138 C106 165 84 166 84 138 Z" fill={isSelected('glutes') ? highlightColor : defaultBodyColor} />

                  {/* Hamstrings */}
                  <Path d="M56 168 C54 195 58 220 62 235 C68 234 76 215 76 168 Z" fill={isSelected('hamstrings') ? highlightColor : defaultBodyColor} />
                  <Path d="M104 168 C106 195 102 220 98 235 C92 234 84 215 84 168 Z" fill={isSelected('hamstrings') ? highlightColor : defaultBodyColor} />

                  {/* Calves */}
                  <Path d="M60 240 C56 260 58 280 62 292 C67 292 70 275 72 240 Z" fill={isSelected('calves') ? highlightColor : defaultBodyColor} />
                  <Path d="M100 240 C104 260 102 280 98 292 C93 292 90 275 88 240 Z" fill={isSelected('calves') ? highlightColor : defaultBodyColor} />
                </Svg>
              )}
            </View>

            <View style={styles.viewBadge}>
              <View style={styles.viewBadgeDot} />
              <Text style={styles.viewBadgeText}>{viewAngle === 'front' ? 'ANTERIOR' : 'POSTERIOR'}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <ContinueButton onPress={handleContinue} label={`Continue (${selected.length} selected)`} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
  },
  headerSection: {
    marginBottom: 20,
  },
  headline: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    lineHeight: 20,
    fontWeight: '500',
  },
  viewToggleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 24,
    padding: 4,
    gap: 4,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ff5e00',
  },
  toggleBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  toggleBtnTextActive: {
    color: '#0F172A',
  },
  splitLayout: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  optionsCol: {
    flex: 1,
    gap: 10,
  },
  muscleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  muscleCardSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#ff5e00',
    borderWidth: 2,
    padding: 11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#ff5e00',
    borderColor: '#ff5e00',
  },
  muscleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  muscleLabelSelected: {
    color: '#0F172A',
    fontWeight: '700',
  },
  graphicCol: {
    flex: 1,
    minHeight: 340,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    paddingVertical: 16,
  },
  anatomySvgWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  graphicGlow: {
    position: 'absolute',
    top: '20%',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 94, 0, 0.05)',
  },
  viewBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  viewBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ff5e00',
  },
  viewBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ea580c',
    letterSpacing: 1,
  }
});
