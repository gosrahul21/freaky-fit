import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import { Header } from '../Header';

const GENDERS = [
  { id: 'man', label: 'Man', icon: '👨' },
  { id: 'woman', label: 'Woman', icon: '👩' },
  { id: 'non-binary', label: 'Non-binary', icon: '🧑' },
  { id: 'private', label: 'Private', icon: '🛡️' },
];

export function GenderSelector({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const [selectedGender, setSelectedGender] = useState<string>('private');

  return (
    <View style={styles.container}>
      <Header currentStep={6} onBack={onBack} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <Text style={styles.headline}>What's your gender?</Text>
          <Text style={styles.subtitle}>
            Used to personalize caloric burn telemetry, hormonal recovery curves, and strength milestones.
          </Text>
        </View>

        <View style={styles.contentRow}>
          {/* Avatar side */}
          <View style={styles.avatarPanel}>
            <View style={styles.biometricBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.biometricText}>BIOMETRIC</Text>
            </View>
            
            <View style={styles.avatarWrapper}>
              <Image 
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCns5b2pTu_j2VGxv1DKWbxffTMgL2-Kn4WFAFHn6Ab3N5s50bkrYejyv5xB0Iayu_LUlbcTsh0L3_gbxpO7lXWepirdjhUoqZwphs2GjlLbhmA-RN89VPcB5PokkvHglYOpaeT-UEpAo17JpGSSmaqKlYZmzc9ShAAAQoqS2sxA_W_PVHesAKDbBitxiGhAnS_iH9Y7kFGi0xNVoLyYsCnkSaUno4lBoMnQOWcS-v3BwGVthXFYq9e' }}
                style={styles.avatarImage}
                resizeMode="contain"
              />
            </View>
          </View>
          
          {/* Options side */}
          <View style={styles.optionsPanel}>
            {GENDERS.map((gender) => {
              const isSelected = selectedGender === gender.id;
              return (
                <TouchableOpacity
                  key={gender.id}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedGender(gender.id);
                    setTimeout(() => {
                      onNext();
                    }, 300);
                  }}
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionCardSelected
                  ]}
                >
                  <View style={styles.optionContent}>
                    <View style={[styles.iconBox, isSelected && styles.iconBoxSelected]}>
                      <Text style={styles.iconText}>{gender.icon}</Text>
                    </View>
                    <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                      {gender.label}
                    </Text>
                  </View>
                  
                  <View style={[styles.radioDot, isSelected && styles.radioDotSelected]}>
                    {isSelected && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
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
    alignItems: 'center',
    marginBottom: 24,
  },
  headline: {
    fontSize: 28,
    fontWeight: '700',
    color: '#191C1D',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 14,
    color: '#5B4137',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  contentRow: {
    flexDirection: 'row',
    gap: 12,
  },
  avatarPanel: {
    flex: 5,
    backgroundColor: '#F3F4F5',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
  },
  biometricBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ff5e00',
  },
  biometricText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5B4137',
    letterSpacing: 1,
  },
  avatarWrapper: {
    flex: 1,
    width: '100%',
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  avatarImage: {
    width: '100%',
    height: 250,
  },
  optionsPanel: {
    flex: 7,
    gap: 10,
    justifyContent: 'space-between',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    minHeight: 56,
  },
  optionCardSelected: {
    borderWidth: 2,
    borderColor: '#ff5e00',
    shadowColor: '#ff5e00',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3F4F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxSelected: {
    backgroundColor: '#FFDBCE',
  },
  iconText: {
    fontSize: 16,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#191C1D',
    textTransform: 'uppercase',
  },
  optionLabelSelected: {
    color: '#191C1D',
  },
  radioDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F3F4F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDotSelected: {
    backgroundColor: '#ff5e00',
  }
});
