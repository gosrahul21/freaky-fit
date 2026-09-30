import { hapticSelection } from '../../../utils/haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Header } from '../Header';
import { ContinueButton } from '../ContinueButton';

const { width } = Dimensions.get('window');
const TICK_WIDTH = 20;
const MIN_AGE = 14;
const MAX_AGE = 80;
const TOTAL_TICKS = MAX_AGE - MIN_AGE + 1;
const PADDING_HORIZONTAL = width / 2;

export function AgeSelector({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const [age, setAge] = useState<number>(24);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / TICK_WIDTH);
    const calculatedAge = Math.min(MAX_AGE, Math.max(MIN_AGE, MIN_AGE + index));
    if (calculatedAge !== age) {
      setAge(calculatedAge);
    }
  }, [age]);

  const getInsightText = () => {
    // if (age < 26) return 'Peak metabolic recovery range';
    // if (age < 36) return 'Optimal strength & density phase';
    // if (age < 48) return 'Joint longevity & sustained output';
    return '';
  };

  const handleContinue = async () => {
    await AsyncStorage.setItem('@onboarding_age', JSON.stringify(age));
    onNext();
  };

  return (
    <View style={styles.container}>
      <Header currentStep={7} onBack={onBack} />
      
      <View style={styles.content}>
        <View style={styles.headerSection}>
          <Text style={styles.headline}>How old are you?</Text>
          <Text style={styles.subtitle}>
            We use your age to tailor workout intensity, joint recovery protocols, and volume progression.
          </Text>
        </View>

        <View style={styles.pickerContainer}>
          <View style={styles.displayArea}>
            <View style={styles.ageValueRow}>
              <Text style={styles.ageValue}>{age}</Text>
              <Text style={styles.ageUnit}>yrs</Text>
            </View>
            <View style={styles.insightBadge}>
              <Text style={styles.insightText}>{getInsightText()}</Text>
            </View>
          </View>

          <View style={styles.rulerContainer}>
            <View style={styles.rulerPointer}>
              <View style={styles.pointerDot} />
              <View style={styles.pointerLine} />
            </View>
            
            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={TICK_WIDTH}
              decelerationRate="fast"
              style={{ flex: 1, maxHeight: 80 }}
              contentContainerStyle={{ 
                paddingHorizontal: PADDING_HORIZONTAL, 
                alignItems: 'flex-end' 
              }}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              contentOffset={{ x: (24 - MIN_AGE) * TICK_WIDTH, y: 0 }}
            >
              {Array.from({ length: TOTAL_TICKS }).map((_, i) => {
                const currentTickAge = MIN_AGE + i;
                const isMajor = currentTickAge % 5 === 0;
                const handleContinue = async () => {
    await AsyncStorage.setItem('@onboarding_age', JSON.stringify(age));
    onNext();
  };

  return (
                  <View key={i} style={styles.tickContainer}>
                    <View style={[styles.tickLine, isMajor ? styles.tickMajor : styles.tickMinor]} />
                    {isMajor ? (
                      <Text style={styles.tickLabel}>{currentTickAge}</Text>
                    ) : (
                      <Text style={styles.tickLabelHidden}>.</Text>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
          
          <View style={styles.footerNoteRow}>
            {/* <View style={styles.noteItem}>
              <View style={[styles.noteDot, { backgroundColor: '#ff5e00' }]} />
              <Text style={styles.noteText}>Calibrated</Text>
            </View> */}
            <View style={styles.noteItem}>
              <View style={[styles.noteDot, { backgroundColor: '#CBD5E1' }]} />
              <Text style={styles.noteText}>Drag ruler to adjust</Text>
            </View>
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
  content: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  headline: {
    fontSize: 28,
    fontWeight: '700',
    color: '#191C1D',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 14,
    color: '#5B4137',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  displayArea: {
    alignItems: 'center',
    marginBottom: 32,
  },
  ageValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  ageValue: {
    fontSize: 64,
    fontWeight: '700',
    color: '#191C1D',
    letterSpacing: -2,
  },
  ageUnit: {
    fontSize: 20,
    fontWeight: '700',
    color: '#8F7065',
    textTransform: 'uppercase',
  },
  insightBadge: {
    backgroundColor: 'rgba(255, 94, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 8,
  },
  insightText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a63b00',
  },
  rulerContainer: {
    position: 'relative',
    height: 80,
    justifyContent: 'flex-end',
  },
  rulerPointer: {
    position: 'absolute',
    top: -10,
    left: '50%',
    transform: [{ translateX: -1.5 }],
    alignItems: 'center',
    zIndex: 10,
  },
  pointerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff5e00',
    shadowColor: '#ff5e00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  pointerLine: {
    width: 3,
    height: 80,
    backgroundColor: '#ff5e00',
    marginTop: 2,
  },
  tickContainer: {
    width: TICK_WIDTH,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 60,
  },
  tickLine: {
    width: 2,
    borderRadius: 1,
    marginBottom: 8,
  },
  tickMajor: {
    height: 32,
    backgroundColor: '#8F7065',
  },
  tickMinor: {
    height: 16,
    backgroundColor: '#CBD5E1',
  },
  tickLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5B4137',
    marginTop: 4,
  },
  tickLabelHidden: {
    fontSize: 12,
    color: 'transparent',
    marginTop: 4,
  },
  footerNoteRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 24,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noteDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  noteText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8F7065',
    textTransform: 'uppercase',
  }
});
