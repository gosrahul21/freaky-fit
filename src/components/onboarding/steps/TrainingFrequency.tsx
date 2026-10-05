import { hapticSelection } from '../../../utils/haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import { Header } from '../Header';

const FREQUENCIES = [
  { id: '1-2', label: '1–2 days a week', desc: 'Easing in • Starter pace', icon: '🚶' },
  { id: '3-4', label: '3–4 days a week', desc: 'Building the habit • Sweet spot', icon: '💪', popular: true },
  { id: '5-6', label: '5–6 days a week', desc: 'Serious progress • Advanced split', icon: '⚡' },
  { id: '7', label: 'Every day (7 days)', desc: 'All in • Performance & active rest', icon: '👑' },
];

export function TrainingFrequency({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const [selectedFreq, setSelectedFreq] = useState<string>('');

  const handleSelect = (id: string) => {
    setSelectedFreq(id);
    setTimeout(() => {
      onNext();
    }, 300);
  };

  const handleContinue = async () => {
    await AsyncStorage.setItem('@onboarding_training_frequency', JSON.stringify(selectedFreq));
    onNext();
  };

  return (
    <View style={styles.container}>
      <Header currentStep={11} onBack={onBack} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <Text style={styles.headline}>How often do you want to train?</Text>
          <Text style={styles.subtitle}>
            Pick a target you can stick to. We'll balance volume & recovery.
          </Text>
        </View>

        <View style={styles.optionsList}>
          {FREQUENCIES.map((freq) => {
            const isSelected = selectedFreq === freq.id;
            return (
              <TouchableOpacity
                key={freq.id}
                activeOpacity={0.8}
                onPress={() => { hapticSelection(); handleSelect(freq.id); }}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected
                ]}
              >
                {freq.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>MOST POPULAR</Text>
                  </View>
                )}
                <View style={styles.cardContent}>
                  <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
                    <Text style={styles.iconText}>{freq.icon}</Text>
                  </View>
                  <View style={styles.textContent}>
                    <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                      {freq.label}
                    </Text>
                    <Text style={[styles.cardDesc, isSelected && styles.cardDescSelected]}>
                      {freq.desc}
                    </Text>
                  </View>
                </View>

                <View style={[styles.radioOutline, isSelected && styles.radioOutlineSelected]}>
                  {isSelected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.coachTip}>
          <Text style={styles.coachTipIcon}>💡</Text>
          <Text style={styles.coachTipText}>
            <Text style={styles.coachTipBold}>Coach Tip:</Text> 3–4 days allows optimal muscle protein synthesis while ensuring full central nervous recovery for peak hypertrophy.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 80,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headline: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111317',
    textAlign: 'center',
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#687385',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
    fontWeight: '500',
    paddingHorizontal: 10,
  },
  optionsList: {
    gap: 14,
  },
  optionCard: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#111317',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
  optionCardSelected: {
    backgroundColor: '#FFF7F2',
    borderColor: '#ff5e00',
    borderWidth: 2,
    padding: 15,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 24,
    backgroundColor: '#ff5e00',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF3EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerSelected: {
    backgroundColor: '#ff5e00',
  },
  iconText: {
    fontSize: 20,
  },
  textContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111317',
  },
  cardTitleSelected: {
    color: '#111317',
  },
  cardDesc: {
    fontSize: 12,
    fontWeight: '500',
    color: '#687385',
    marginTop: 2,
  },
  cardDescSelected: {
    color: '#ff5e00',
    fontWeight: '600',
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
  coachTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F3F4F6',
    padding: 14,
    borderRadius: 12,
    marginTop: 24,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  coachTipIcon: {
    fontSize: 16,
  },
  coachTipText: {
    flex: 1,
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
  },
  coachTipBold: {
    fontWeight: '700',
    color: '#111827',
  }
});
