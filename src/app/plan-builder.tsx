import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { X, CalendarDays, Loader2 } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { hapticImpactLight } from '../utils/haptics';

export default function PlanBuilderScreen() {
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [weeks, setWeeks] = useState('4');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;
    hapticImpactLight();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const duration = parseInt(weeks) || 4;

      const { data, error } = await supabase
        .from('planner')
        .insert([
          {
            user_id: user.id,
            title: title.trim(),
            duration_weeks: duration,
            status: 'active'
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      router.replace('/plans');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[s.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.iconBtn} onPress={() => router.back()}>
            <X size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>New Plan</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={s.content}>
          <View style={s.iconWrapper}>
            <CalendarDays size={48} color={colors.accent} strokeWidth={1.5} />
          </View>
          
          <Text style={s.title}>Create a Workout Plan</Text>
          <Text style={s.subtitle}>Set up a block of training and track your progress week over week.</Text>

          <View style={s.form}>
            <Text style={s.label}>Plan Name</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. Hypertrophy Block v1"
              placeholderTextColor={colors.textTertiary}
              value={title}
              onChangeText={setTitle}
              autoFocus
            />

            <Text style={[s.label, { marginTop: 24 }]}>Duration (Weeks)</Text>
            <TextInput
              style={s.input}
              placeholder="4"
              placeholderTextColor={colors.textTertiary}
              value={weeks}
              onChangeText={setWeeks}
              keyboardType="number-pad"
              maxLength={2}
            />
          </View>
        </View>

        <View style={s.footer}>
          <TouchableOpacity 
            style={[s.createBtn, (!title.trim() || loading) && s.createBtnDisabled]} 
            activeOpacity={0.8}
            onPress={handleCreate}
            disabled={!title.trim() || loading}
          >
            <Text style={s.createBtnText}>Create Plan</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 32,
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  createBtn: {
    backgroundColor: colors.accent,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  createBtnDisabled: {
    opacity: 0.5,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  }
});
