import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Check } from 'lucide-react-native';
import { Header } from '../Header';
import { ContinueButton } from '../ContinueButton';

const MUSCLES = [
  { id: 'chest', label: 'Chest' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'biceps', label: 'Biceps' },
  { id: 'triceps', label: 'Triceps' },
  { id: 'abs', label: 'Abs & Core' },
  { id: 'quads', label: 'Quads' },
];

export function TargetMuscleFocus({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const [selected, setSelected] = useState<string[]>(['chest', 'shoulders']);
  const [viewAngle, setViewAngle] = useState<'front' | 'back'>('front');

  const toggleSelection = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

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
              onPress={() => setViewAngle('front')}
            >
              {viewAngle === 'front' && <View style={styles.toggleDot} />}
              <Text style={[styles.toggleBtnText, viewAngle === 'front' && styles.toggleBtnTextActive]}>
                Front side
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleBtn, viewAngle === 'back' && styles.toggleBtnActive]}
              onPress={() => setViewAngle('back')}
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
            {MUSCLES.map((muscle) => {
              const isSelected = selected.includes(muscle.id);
              return (
                <TouchableOpacity
                  key={muscle.id}
                  activeOpacity={0.8}
                  onPress={() => toggleSelection(muscle.id)}
                  style={[
                    styles.muscleCard,
                    isSelected && styles.muscleCardSelected
                  ]}
                >
                  <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                  </View>
                  <Text style={[styles.muscleLabel, isSelected && styles.muscleLabelSelected]}>
                    {muscle.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          
          <View style={styles.graphicCol}>
            <View style={styles.graphicGlow} />
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFdK7-60U8XvNqM0x9tVwX8k-G65-xG_J_E93k41t2Z9D-X7Hw5U6H1h4c29m1K1X0l1oQvH5D-k4s0q9E65w3v1sO8h8J_T2F7D6e5f1W6o8oO1q5e3k8d_x4v2e6p3H1y4t9a5s8d2H1_u2u2_j3D9K1g1O9I2x5R_G4o9T7x4E' }} 
              style={styles.anatomyImage}
              resizeMode="contain"
            />
            <View style={styles.viewBadge}>
              <View style={styles.viewBadgeDot} />
              <Text style={styles.viewBadgeText}>{viewAngle === 'front' ? 'ANTERIOR' : 'POSTERIOR'}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <ContinueButton onPress={onNext} title={`Continue (${selected.length} selected)`} />
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
    backgroundColor: '#F1F5F9',
    padding: 4,
    borderRadius: 24,
    width: 280,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#0F172A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
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
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  toggleBtnTextActive: {
    color: '#FFFFFF',
  },
  splitLayout: {
    flexDirection: 'row',
    gap: 12,
    minHeight: 400,
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
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  graphicGlow: {
    position: 'absolute',
    top: '20%',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 94, 0, 0.05)',
  },
  anatomyImage: {
    width: '100%',
    height: 350,
    tintColor: '#CBD5E1', // Fallback mockup
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
