import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignupScreen() {
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !fullName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) throw error;

      if (data.session) {
        // User is logged in automatically (if email confirmation is disabled)
        await createProfile(data.session.user.id);
        router.replace('/home');
      } else {
        Alert.alert('Success', 'Please check your email to verify your account.');
        router.push('/auth/login');
      }
    } catch (e: any) {
      Alert.alert('Signup Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (userId: string) => {
    try {
      const { error } = await supabase.from('profiles').insert([
        {
          id: userId,
          display_name: fullName,
          gender: JSON.parse((await AsyncStorage.getItem('@onboarding_gender')) || 'null'),
          age: JSON.parse((await AsyncStorage.getItem('@onboarding_age')) || 'null'),
          height_cm: JSON.parse((await AsyncStorage.getItem('@onboarding_height_cm')) || 'null'),
          weight_kg: JSON.parse((await AsyncStorage.getItem('@onboarding_weight_kg')) || 'null'),
          primary_goal: JSON.parse((await AsyncStorage.getItem('@onboarding_primary_goal')) || 'null'),
          training_frequency: JSON.parse((await AsyncStorage.getItem('@onboarding_training_frequency')) || 'null'),
          target_muscles: JSON.parse((await AsyncStorage.getItem('@onboarding_target_muscles')) || 'null'),
          updated_at: new Date().toISOString(),
        }
      ]);
      if (error) console.error("Profile creation error:", error);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.container}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        
        <Text style={s.title}>Create Account</Text>
        <Text style={s.subtitle}>Sign up to start your fitness journey</Text>

        <View style={s.form}>
          <Text style={s.label}>Full Name</Text>
          <TextInput 
            style={s.input}
            placeholder="John Doe"
            placeholderTextColor={colors.textTertiary}
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={s.label}>Email Address</Text>
          <TextInput 
            style={s.input}
            placeholder="you@example.com"
            placeholderTextColor={colors.textTertiary}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={s.label}>Password</Text>
          <TextInput 
            style={s.input}
            placeholder="••••••••"
            placeholderTextColor={colors.textTertiary}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity 
            style={s.submitBtn} 
            activeOpacity={0.8}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.submitText}>Sign Up</Text>}
          </TouchableOpacity>
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/auth/login')}>
            <Text style={s.footerLink}>Log in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: 24 },
  backBtn: { marginBottom: 24, alignSelf: 'flex-start' },
  title: { fontSize: 32, fontWeight: '800', color: colors.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.textSecondary, marginBottom: 32 },
  form: { width: '100%', gap: 16 },
  label: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: -8 },
  input: {
    width: '100%',
    height: 52,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 12,
    paddingHorizontal: 16,
    color: colors.textPrimary,
    fontSize: 16,
  },
  submitBtn: {
    width: '100%',
    height: 52,
    backgroundColor: colors.accent,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: { color: colors.textSecondary, fontSize: 14 },
  footerLink: { color: colors.accent, fontSize: 14, fontWeight: '700' },
});
