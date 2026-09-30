import { hapticSelection } from '../../../utils/haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Header } from '../Header';
import { ContinueButton } from '../ContinueButton';

const { height: screenHeight } = Dimensions.get('window');
const TICK_HEIGHT = 20;
const MIN_HEIGHT = 145;
const MAX_HEIGHT = 205;
const TOTAL_TICKS = MAX_HEIGHT - MIN_HEIGHT + 1;
const PADDING_VERTICAL = 150;

export function HeightSelector({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const [heightCm, setHeightCm] = useState<number>(170);
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    // Scroll view goes down, so offset increases as we scroll down the list.
    // We reverse the logic to map the top of the list to max height.
    const index = Math.round(offsetY / TICK_HEIGHT);
    const calculatedHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, MAX_HEIGHT - index));
    if (calculatedHeight !== heightCm) {
      setHeightCm(calculatedHeight);
    }
  }, [heightCm]);

  const toggleUnit = (newUnit: 'metric' | 'imperial') => {
    setUnit(newUnit);
  };

  const displayValue = () => {
    if (unit === 'metric') {
      return { main: Math.round(heightCm).toString(), unitLabel: 'cm' };
    } else {
      const totalInches = Math.round(heightCm / 2.54);
      const feet = Math.floor(totalInches / 12);
      const inches = totalInches % 12;
      return { main: `${feet}'${inches}"`, unitLabel: '' };
    }
  };

  const displaySecondary = () => {
    if (unit === 'metric') {
      const totalInches = Math.round(heightCm / 2.54);
      const feet = Math.floor(totalInches / 12);
      const inches = totalInches % 12;
      return `${feet}'${inches}"`;
    } else {
      return `${Math.round(heightCm)} cm`;
    }
  };

  const scaleFactor = 0.85 + ((heightCm - MIN_HEIGHT) / (MAX_HEIGHT - MIN_HEIGHT)) * 0.25;

  const handleContinue = async () => {
    await AsyncStorage.setItem('@onboarding_height_cm', JSON.stringify(heightCm));
    onNext();
  };

  return (
    <View style={styles.container}>
      <Header currentStep={8} onBack={onBack} />
      
      <View style={styles.headerSection}>
        <Text style={styles.headline}>
          What's Your <Text style={styles.highlightText}>Height?</Text>
        </Text>
        <Text style={styles.subtitle}>
          Your stature establishes optimal biomechanical levers and velocity curves.
        </Text>
      </View>

      <View style={styles.unitToggleGroup}>
        <TouchableOpacity 
          style={[styles.toggleBtn, unit === 'imperial' && styles.toggleBtnActive]} 
          onPress={() => { hapticSelection(); toggleUnit('imperial'); }}
        >
          <Text style={[styles.toggleBtnText, unit === 'imperial' && styles.toggleBtnTextActive]}>ft / in</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleBtn, unit === 'metric' && styles.toggleBtnActive]} 
          onPress={() => { hapticSelection(); toggleUnit('metric'); }}
        >
          <Text style={[styles.toggleBtnText, unit === 'metric' && styles.toggleBtnTextActive]}>cm</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.valueDisplayRow}>
          <View style={styles.mainValueBox}>
            <Text style={styles.mainValueText}>{displayValue().main}</Text>
            <Text style={styles.mainUnitText}>{displayValue().unitLabel}</Text>
          </View>
          <View style={styles.secondaryValueBox}>
            <Text style={styles.secondaryValueText}>{displaySecondary()}</Text>
          </View>
        </View>

        <View style={styles.interactionStage}>
          <View style={styles.silhouetteContainer}>
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjeLYj1zmBKcbaYL-_hykwJvi7a0d8Sqk9LL2tlHcODcFxx_7j7_YN2J7DjCh_jJjipZOLya9zbyYe39P68XodFuIcvqIaR_KibjSKDfeXeAqTudwDjD8GToU32PnPU0rqiTGimDI-S7krfOvqf4VXnA-5Rly2cPpCZDgCn0s7UAzk8UlOabDoaTaPB99S17oP8cGPl9GDlsebfsZIjb4IXkz_SDqkZi1tOvbGWwc8Y-KSUM3iqzdE' }}
              style={[styles.silhouetteImage, { transform: [{ scale: scaleFactor }] }]}
              resizeMode="contain"
            />
          </View>

          <View style={styles.rulerContainer}>
            <View style={styles.rulerPointer}>
              <View style={styles.pointerLine} />
              <View style={styles.pointerDot} />
            </View>
            
            <ScrollView
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
              snapToInterval={TICK_HEIGHT}
              decelerationRate="fast"
              style={{ flex: 1, width: '100%' }}
              contentContainerStyle={{ paddingVertical: PADDING_VERTICAL }}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              contentOffset={{ x: 0, y: (MAX_HEIGHT - 170) * TICK_HEIGHT }}
            >
              <View style={styles.ticksWrapper}>
                {Array.from({ length: TOTAL_TICKS }).map((_, i) => {
                  const currentTickHeight = MAX_HEIGHT - i;
                  const isMajor = currentTickHeight % 10 === 0;
                  const isMid = currentTickHeight % 5 === 0 && !isMajor;
                  const handleContinue = async () => {
    await AsyncStorage.setItem('@onboarding_height_cm', JSON.stringify(heightCm));
    onNext();
  };

  return (
                    <View key={i} style={styles.tickContainer}>
                      <Text style={isMajor ? styles.tickLabel : styles.tickLabelHidden}>
                        {currentTickHeight}
                      </Text>
                      <View style={[
                        styles.tickLine, 
                        isMajor ? styles.tickMajor : (isMid ? styles.tickMid : styles.tickMinor)
                      ]} />
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>
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
  headerSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
  },
  headline: {
    fontSize: 28,
    fontWeight: '700',
    color: '#191C1D',
    textTransform: 'uppercase',
  },
  highlightText: {
    color: '#ff5e00',
  },
  subtitle: {
    fontSize: 14,
    color: '#5B4137',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  unitToggleGroup: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#E7E8E9',
    borderRadius: 24,
    padding: 4,
    marginBottom: 20,
  },
  toggleBtn: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  toggleBtnActive: {
    backgroundColor: '#2E3132',
  },
  toggleBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5B4137',
  },
  toggleBtnTextActive: {
    color: '#FFFFFF',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 16,
    marginBottom: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  valueDisplayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  mainValueBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  mainValueText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#191C1D',
    letterSpacing: -1,
  },
  mainUnitText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ff5e00',
    textTransform: 'uppercase',
  },
  secondaryValueBox: {
    backgroundColor: '#F3F4F5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  secondaryValueText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#565e74',
  },
  interactionStage: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
  },
  silhouetteContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  silhouetteImage: {
    width: '100%',
    height: '95%',
  },
  rulerContainer: {
    width: 100,
    position: 'relative',
    justifyContent: 'center',
  },
  rulerPointer: {
    position: 'absolute',
    left: 20,
    right: 0,
    top: '50%',
    marginTop: -1,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  pointerLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#ff5e00',
  },
  pointerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ff5e00',
    marginLeft: -3,
  },
  ticksWrapper: {
    alignItems: 'flex-end',
    width: '100%',
  },
  tickContainer: {
    height: TICK_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    paddingRight: 10,
  },
  tickLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ff5e00',
    marginRight: 8,
  },
  tickLabelHidden: {
    fontSize: 12,
    color: 'transparent',
    marginRight: 8,
  },
  tickLine: {
    height: 2,
    borderRadius: 1,
  },
  tickMajor: {
    width: 32,
    backgroundColor: '#191C1D',
  },
  tickMid: {
    width: 24,
    backgroundColor: 'rgba(25, 28, 29, 0.6)',
  },
  tickMinor: {
    width: 12,
    backgroundColor: 'rgba(25, 28, 29, 0.3)',
  },
});
