import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { SocialProof } from '../../components/onboarding/steps/SocialProof';
import { SmartImporter } from '../../components/onboarding/steps/SmartImporter';
import { FreakyFitEngine } from '../../components/onboarding/steps/FreakyFitEngine';
import { GoalsSelector } from '../../components/onboarding/steps/GoalsSelector';
import { FeatureShowcase } from '../../components/onboarding/steps/FeatureShowcase';
import { GenderSelector } from '../../components/onboarding/steps/GenderSelector';
import { AgeSelector } from '../../components/onboarding/steps/AgeSelector';
import { HeightSelector } from '../../components/onboarding/steps/HeightSelector';
import { ValueProposition } from '../../components/onboarding/steps/ValueProposition';
import { ReferralSource } from '../../components/onboarding/steps/ReferralSource';
import { TrainingFrequency } from '../../components/onboarding/steps/TrainingFrequency';
import { TargetMuscleFocus } from '../../components/onboarding/steps/TargetMuscleFocus';
import { WeightCalibration } from '../../components/onboarding/steps/WeightCalibration';

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = () => {
    if (currentStep < 13) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Finished onboarding, go to Paywall
      router.replace('/paywall');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      router.back();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <SocialProof onNext={handleNext} onBack={handleBack} />;
      case 2:
        return <SmartImporter onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <FreakyFitEngine onNext={handleNext} onBack={handleBack} />;
      case 4:
        return <GoalsSelector onNext={handleNext} onBack={handleBack} />;
      case 5:
        return <FeatureShowcase onNext={handleNext} onBack={handleBack} />;
      case 6:
        return <GenderSelector onNext={handleNext} onBack={handleBack} />;
      case 7:
        return <AgeSelector onNext={handleNext} onBack={handleBack} />;
      case 8:
        return <HeightSelector onNext={handleNext} onBack={handleBack} />;
      case 9:
        return <ValueProposition onNext={handleNext} onBack={handleBack} />;
      case 10:
        return <ReferralSource onNext={handleNext} onBack={handleBack} />;
      case 11:
        return <TrainingFrequency onNext={handleNext} onBack={handleBack} />;
      case 12:
        return <TargetMuscleFocus onNext={handleNext} onBack={handleBack} />;
      case 13:
        return <WeightCalibration onNext={handleNext} onBack={handleBack} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderStep()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 18,
    color: '#64748B',
  },
});
