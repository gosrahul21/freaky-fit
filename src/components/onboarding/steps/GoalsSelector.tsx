import { hapticSelection } from '../../../utils/haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import { Header } from '../Header';

const GOALS = [
  {
    id: 'build_muscle',
    title: 'Build muscle',
    subtitle: 'Hypertrophy & progressive overload',
    icon: '💪',
  },
  {
    id: 'lose_fat',
    title: 'Lose fat & get lean',
    subtitle: 'High burn, calorie tracking & conditioning',
    icon: '🔥',
  },
  {
    id: 'consistency',
    title: 'Stay consistent',
    subtitle: 'Habit formation & streak tracker',
    icon: '📅',
  },
  {
    id: 'get_stronger',
    title: 'Get stronger',
    subtitle: 'Powerlifting, compound movements & PRs',
    icon: '🏋️',
  },
  {
    id: 'athletic',
    title: 'Athletic performance',
    subtitle: 'Agility, functional fitness & stamina',
    icon: '⚡',
  },
];

export function GoalsSelector({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const [selectedGoal, setSelectedGoal] = useState<string>('build_muscle');

  const handleContinue = async () => {
    await AsyncStorage.setItem('@onboarding_primary_goal', JSON.stringify(selectedGoal));
    onNext();
  };

  return (
    <View style={styles.container}>
      <Header currentStep={4} onBack={onBack} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <Text style={styles.headline}>
            What's your main goal?
          </Text>
          <Text style={styles.subtitle}>
            We'll tailor your workout plans, auto-tags, and recommendations around it.
          </Text>
        </View>

        <View style={styles.optionsList}>
          {GOALS.map((goal) => {
            const isSelected = selectedGoal === goal.id;
            return (
              <TouchableOpacity
                key={goal.id}
                activeOpacity={0.8}
                onPress={async () => { hapticSelection(); 
                  setSelectedGoal(goal.id);
                  await AsyncStorage.setItem('@onboarding_primary_goal', JSON.stringify(goal.id));
                  setTimeout(() => {
                    onNext();
                  }, 300);
                }}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected
                ]}
              >
                <View style={styles.cardContent}>
                  <View style={[styles.iconContainer, isSelected ? styles.iconContainerSelected : styles.iconContainerDefault]}>
                    <Text style={styles.iconText}>{goal.icon}</Text>
                  </View>
                  
                  <View style={styles.textContent}>
                    <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>{goal.title}</Text>
                    <Text style={styles.cardSubtitle}>{goal.subtitle}</Text>
                  </View>
                </View>

                <View style={[styles.radioOutline, isSelected && styles.radioOutlineSelected]}>
                  {isSelected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
    marginBottom: 24,
  },
  headline: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111315',
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#687076',
    marginTop: 8,
    lineHeight: 22,
    fontWeight: '500',
  },
  optionsList: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E8ECF0',
    shadowColor: '#111315',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  optionCardSelected: {
    borderColor: '#ff5e00',
    shadowColor: '#ff5e00',
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  iconContainerDefault: {
    backgroundColor: '#F8FAFC',
    borderColor: '#F1F5F9',
  },
  iconContainerSelected: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FFEDD5',
  },
  iconText: {
    fontSize: 24,
  },
  textContent: {
    flex: 1,
    paddingRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111315',
  },
  cardTitleSelected: {
    color: '#ff5e00',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#687076',
    marginTop: 4,
    lineHeight: 16,
    fontWeight: '500',
  },
  radioOutline: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOutlineSelected: {
    backgroundColor: '#ff5e00',
    borderColor: '#ff5e00',
  },
  continueBtn: {
    backgroundColor: '#ff5e00',
  }
});
