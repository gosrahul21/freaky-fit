import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import { Header } from '../Header';

const REFERRAL_SOURCES = [
  { id: 'instagram', label: 'Instagram', icon: '📸', color: '#E1306C' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵', color: '#000000' },
  { id: 'youtube', label: 'YouTube', icon: '▶️', color: '#FF0000' },
  { id: 'reddit', label: 'Reddit', icon: '👽', color: '#FF4500' },
  { id: 'friend', label: 'Friend or Gym Partner', icon: '🤝', color: '#10B981' },
  { id: 'google', label: 'Google / Web Search', icon: '🔍', color: '#4285F4' },
  { id: 'appstore', label: 'App Store Search', icon: '📱', color: '#0EA5E9' },
  { id: 'podcast', label: 'Podcast / Other', icon: '🎙️', color: '#7C3AED' },
];

export function ReferralSource({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const [selectedSource, setSelectedSource] = useState<string>('');

  const handleSelect = (id: string) => {
    setSelectedSource(id);
    setTimeout(() => {
      onNext();
    }, 300);
  };

  return (
    <View style={styles.container}>
      <Header currentStep={10} onBack={onBack} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <Text style={styles.headline}>Where did you hear about us?</Text>
          <Text style={styles.subtitle}>
            Help us reach more lifters and dedicated athletes like you.
          </Text>
        </View>

        <View style={styles.optionsList}>
          {REFERRAL_SOURCES.map((source) => {
            const isSelected = selectedSource === source.id;
            return (
              <TouchableOpacity
                key={source.id}
                activeOpacity={0.8}
                onPress={() => handleSelect(source.id)}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected
                ]}
              >
                <View style={styles.cardContent}>
                  <View style={[styles.iconContainer, { backgroundColor: source.color }]}>
                    <Text style={styles.iconText}>{source.icon}</Text>
                  </View>
                  <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                    {source.label}
                  </Text>
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
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 120,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headline: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111317',
    textAlign: 'center',
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  optionsList: {
    gap: 10,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#111317',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  optionCardSelected: {
    backgroundColor: '#FFF7ED',
    borderColor: '#ff5e00',
    borderWidth: 2,
    padding: 13, // Adjust for thicker border
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  cardTitleSelected: {
    color: '#ff5e00',
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
  }
});
