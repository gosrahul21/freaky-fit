import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { ProgressBar } from './ProgressBar';

interface HeaderProps {
  currentStep: number;
  showBack?: boolean;
  onBack?: () => void;
}

export function Header({ currentStep, showBack = true, onBack }: HeaderProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        {showBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color="#1E293B" strokeWidth={2.5} />
          </TouchableOpacity>
        ) : (
          <View style={styles.spacer} />
        )}
        
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../../assets/logo/png/freakyfit-orange-logo-text-onlight-800.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.spacer} />
      </View>
      <ProgressBar currentStep={currentStep} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 120,
    height: 30,
  },
  spacer: {
    width: 40,
  },
});
