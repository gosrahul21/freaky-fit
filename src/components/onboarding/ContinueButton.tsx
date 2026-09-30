import { hapticImpactLight } from '../../utils/haptics';
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ContinueButtonProps {
  onPress: () => void;
  label?: string;
  disabled?: boolean;
  style?: any;
}

export function ContinueButton({ onPress, label = 'Continue', disabled = false, style }: ContinueButtonProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 24) }]}>
      <TouchableOpacity 
        style={[styles.button, style, disabled && styles.disabledButton]}
        onPress={() => {
          hapticImpactLight();
          onPress();
        }}
        activeOpacity={0.8}
        disabled={disabled}
      >
        <Text style={styles.label}>{label}</Text>
        <ArrowRight size={20} color="#FFFFFF" strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    // Using a solid background instead of gradient for simplicity,
    // though a LinearGradient could be used if expo-linear-gradient is added
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    zIndex: 30,
  },
  button: {
    backgroundColor: '#ff5e00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 100,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  label: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 17,
    letterSpacing: -0.5,
  },
});
