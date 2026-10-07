import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Link as LinkIcon, Wand2 } from 'lucide-react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { hapticImpactLight } from '../utils/haptics';

import { supabase } from '../lib/supabase';

export default function ImporterScreen() {
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImport = async () => {
    if (!url) return;
    hapticImpactLight();
    setIsProcessing(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      
      const response = await fetch(`${apiUrl}/api/extract-workout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, user_id: user.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to start extraction');
      }

      const { job_id } = await response.json();

      // Poll for job status
      const pollStatus = async () => {
        try {
          const statusRes = await fetch(`${apiUrl}/api/job-status/${job_id}`);
          if (!statusRes.ok) throw new Error('Failed to fetch job status');
          
          const statusData = await statusRes.json();

          if (statusData.state === 'completed') {
            setIsProcessing(false);
            // Result should contain the inserted workout details
            router.replace('/library');
          } else if (statusData.state === 'failed') {
            throw new Error(statusData.failedReason || 'Extraction failed');
          } else {
            // Still processing (waiting, active, etc.)
            setTimeout(pollStatus, 2000);
          }
        } catch (err) {
          console.error("Polling error:", err);
          setIsProcessing(false);
          alert('Error checking extraction status');
        }
      };

      // Start polling
      setTimeout(pollStatus, 2000);

    } catch (err) {
      console.error("Import error:", err);
      setIsProcessing(false);
      alert('Failed to start extraction');
    }
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

        {isProcessing ? (
          <View style={[s.content, { justifyContent: 'center', alignItems: 'center', flex: 1, paddingBottom: 100 }]}>
            <View style={s.iconCircle}>
              <ActivityIndicator color="#FFFFFF" size="large" />
            </View>
            <Text style={s.title}>Scanning Video...</Text>
            <Text style={s.subtitle}>
              You can close this screen and let it scan in the background. We will notify you when it's ready!
            </Text>
            
            <TouchableOpacity 
              style={[s.importBtn, { marginTop: 40 }]} 
              onPress={() => router.back()}
            >
              <Text style={s.importBtnText}>Continue in Background</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
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
                <Wand2 size={20} color="#FFFFFF" />
                <Text style={s.importBtnText}>Extract Workout</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
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
