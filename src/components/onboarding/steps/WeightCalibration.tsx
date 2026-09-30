import { hapticSelection } from '../../../utils/haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent, TouchableOpacity } from 'react-native';
import { Header } from '../Header';
import { ContinueButton } from '../ContinueButton';

const { width } = Dimensions.get('window');
const TICK_WIDTH = 12;
const MIN_KG = 40;
const MAX_KG = 150;
const TOTAL_TICKS = MAX_KG - MIN_KG + 1;
const PADDING_HORIZONTAL = width / 2;

export function WeightCalibration({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const [weight, setWeight] = useState<number>(70);
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / TICK_WIDTH);
    const calculated = Math.min(MAX_KG, Math.max(MIN_KG, MIN_KG + index));
    if (calculated !== weight) {
      setWeight(calculated);
    }
  }, [weight]);

  const toggleUnit = (newUnit: 'kg' | 'lbs') => {
    setUnit(newUnit);
  };

  const getDisplayWeight = () => {
    if (unit === 'kg') return weight.toFixed(1);
    const handleContinue = async () => {
    await AsyncStorage.setItem('@onboarding_weight_kg', JSON.stringify(weight));
    onNext();
  };

  return (weight * 2.20462).toFixed(1);
  };

  const getEquivalent = () => {
    if (unit === 'kg') return `${(weight * 2.20462).toFixed(1)} lbs`;
    return `${weight.toFixed(1)} kg`;
  };

  const handleContinue = async () => {
    await AsyncStorage.setItem('@onboarding_weight_kg', JSON.stringify(weight));
    onNext();
  };

  return (
    <View style={styles.container}>
      <Header currentStep={13} onBack={onBack} />
      
      <View style={styles.content}>
        <View style={styles.headerSection}>
          <Text style={styles.headline}>Your current weight</Text>
          <Text style={styles.subtitle}>
            We use your weight to calibrate progressive resistance, plate calculations, and energy expenditure.
          </Text>
        </View>

        <View style={styles.unitToggleGroup}>
          <TouchableOpacity 
            style={[styles.toggleBtn, unit === 'lbs' && styles.toggleBtnActive]} 
            onPress={() => { hapticSelection(); toggleUnit('lbs'); }}
          >
            <Text style={[styles.toggleBtnText, unit === 'lbs' && styles.toggleBtnTextActive]}>LBS</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleBtn, unit === 'kg' && styles.toggleBtnActive]} 
            onPress={() => { hapticSelection(); toggleUnit('kg'); }}
          >
            <Text style={[styles.toggleBtnText, unit === 'kg' && styles.toggleBtnTextActive]}>KG</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.displayArea}>
          <View style={styles.valueRow}>
            <Text style={styles.weightValue}>{getDisplayWeight()}</Text>
            <Text style={styles.weightUnit}>{unit}</Text>
          </View>
          <View style={styles.equivalentBadge}>
            <Text style={styles.equivalentText}>≈ {getEquivalent()}</Text>
          </View>
        </View>

        <View style={styles.rulerContainer}>
          <View style={styles.rulerPointer}>
            <View style={styles.pointerDot}>
              <View style={styles.pointerInnerDot} />
            </View>
            <View style={styles.pointerLine} />
          </View>
          
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={TICK_WIDTH}
            decelerationRate="fast"
            style={{ flex: 1, maxHeight: 100 }}
            contentContainerStyle={{ 
              paddingHorizontal: PADDING_HORIZONTAL, 
              alignItems: 'flex-end' 
            }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentOffset={{ x: (70 - MIN_KG) * TICK_WIDTH, y: 0 }}
          >
            {Array.from({ length: TOTAL_TICKS }).map((_, i) => {
              const currentTick = MIN_KG + i;
              const isMajor = currentTick % 5 === 0;
              const handleContinue = async () => {
    await AsyncStorage.setItem('@onboarding_weight_kg', JSON.stringify(weight));
    onNext();
  };

  return (
                <View key={i} style={styles.tickContainer}>
                  <View style={[styles.tickLine, isMajor ? styles.tickMajor : styles.tickMinor]} />
                  {isMajor ? (
                    <Text style={styles.tickLabel}>{currentTick}</Text>
                  ) : (
                    <Text style={styles.tickLabelHidden}>.</Text>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>

      <ContinueButton onPress={handleContinue} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  headerSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  headline: {
    fontSize: 28,
    fontWeight: '700',
    color: '#191C1D',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 15,
    color: '#5B4137',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  unitToggleGroup: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#E7E8E9',
    borderRadius: 24,
    padding: 4,
    marginBottom: 40,
    width: 200,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#2E3132',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  toggleBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5B4137',
  },
  toggleBtnTextActive: {
    color: '#FFFFFF',
  },
  displayArea: {
    alignItems: 'center',
    marginBottom: 40,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  weightValue: {
    fontSize: 56,
    fontWeight: '700',
    color: '#191C1D',
    letterSpacing: -1,
  },
  weightUnit: {
    fontSize: 20,
    fontWeight: '700',
    color: '#a63b00',
    textTransform: 'uppercase',
  },
  equivalentBadge: {
    backgroundColor: '#EDEEEF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 8,
  },
  equivalentText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#5B4137',
  },
  rulerContainer: {
    position: 'relative',
    height: 100,
    justifyContent: 'flex-end',
  },
  rulerPointer: {
    position: 'absolute',
    top: -16,
    left: '50%',
    transform: [{ translateX: -7 }],
    alignItems: 'center',
    zIndex: 10,
  },
  pointerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ff5e00',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff5e00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
  pointerInnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  pointerLine: {
    width: 2,
    height: 80,
    backgroundColor: '#ff5e00',
    marginTop: 2,
    shadowColor: '#ff5e00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  tickContainer: {
    width: TICK_WIDTH,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 70,
  },
  tickLine: {
    width: 2,
    borderRadius: 1,
  },
  tickMajor: {
    height: 40,
    backgroundColor: '#8F7065',
  },
  tickMinor: {
    height: 16,
    backgroundColor: '#CBD5E1',
  },
  tickLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5B4137',
    marginTop: 6,
  },
  tickLabelHidden: {
    fontSize: 13,
    color: 'transparent',
    marginTop: 6,
  }
});
