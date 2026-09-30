import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Link as LinkIcon, Wand2 } from 'lucide-react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { hapticImpactLight } from '../utils/haptics';

export default function ImporterScreen() {
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImport = () => {
    if (!url) return;
    hapticImpactLight();
    setIsProcessing(true);
    
    // Simulate AI extraction delay
    setTimeout(() => {
      setIsProcessing(false);
      // For now, just go back. Later we will route to the extracted workout screen.
      router.back();
    }, 3000);
  };

  return (
    <SafeAreaView style={[s.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={s.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={s.header}>
          <View style={{ width: 40 }} />
          <Text style={s.headerTitle}>Smart Import</Text>
          <TouchableOpacity style={s.closeBtn} onPress={() => router.back()}>
            <X size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={s.content}>
          <View style={s.illustrationContainer}>
            <View style={s.iconCircle}>
              <Wand2 size={40} color="#FFFFFF" />
            </View>
            <Text style={s.title}>Extract Any Workout</Text>
            <Text style={s.subtitle}>
              Paste a link from Instagram, TikTok, or YouTube. Our AI will extract the exercises, sets, and reps automatically.
            </Text>
          </View>

          <View style={s.inputSection}>
            <View style={s.inputContainer}>
              <LinkIcon size={20} color={colors.textTertiary} style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholder="https://instagram.com/p/..."
                placeholderTextColor={colors.textTertiary}
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
                autoCorrect={false}
                clearButtonMode="while-editing"
              />
            </View>

            <View style={s.supportedPlatforms}>
              <Text style={s.supportedText}>Supported platforms:</Text>
              <View style={s.platformIcons}>
                <FontAwesome5 name="instagram" size={16} color={colors.textSecondary} />
                <FontAwesome5 name="youtube" size={16} color={colors.textSecondary} />
                <FontAwesome5 name="tiktok" size={14} color={colors.textSecondary} />
              </View>
            </View>
          </View>

        </View>

        <View style={s.footer}>
          <TouchableOpacity 
            style={[s.importBtn, !url && s.importBtnDisabled]} 
            activeOpacity={0.8}
            disabled={!url || isProcessing}
            onPress={handleImport}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Wand2 size={20} color="#FFFFFF" />
                <Text style={s.importBtnText}>Extract Workout</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  inputSection: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    color: colors.textPrimary,
    fontSize: 16,
  },
  supportedPlatforms: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  supportedText: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  platformIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tiktokIcon: {
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
  },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    paddingVertical: 18,
    borderRadius: 32,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  importBtnDisabled: {
    opacity: 0.5,
  },
  importBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  }
});
