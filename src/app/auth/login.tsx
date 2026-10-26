import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { checkIsPro } from '../../lib/purchases';
import { identifyUser } from '../../lib/posthog';

export default function LoginScreen() {
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        identifyUser(session.user.id, { email: session.user.email });
        const isPro = await checkIsPro(session.user.id);
        router.replace(isPro ? '/home' : '/paywall');
      }
    };
    checkSession();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        identifyUser(data.session.user.id, {
          email: data.session.user.email,
          name: data.session.user.email?.split('@')[0],
        });

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.session.user.id)
          .single();

        if (!profile) {
          await supabase.from('profiles').insert([
            {
              id: data.session.user.id,
              display_name: data.session.user.email?.split('@')[0] || 'FreakyFit User',
              updated_at: new Date().toISOString(),
            }
          ]);
        }

        const isPro = await checkIsPro(data.session.user.id);
        router.replace(isPro ? '/home' : '/paywall');
      }
    } catch (e: any) {
      Alert.alert('Login Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.container}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        
        <Text style={s.title}>Welcome Back</Text>
        <Text style={s.subtitle}>Log in to continue your journey</Text>

        <View style={s.form}>
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
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.submitText}>Log In</Text>}
          </TouchableOpacity>
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/auth/signup')}>
            <Text style={s.footerLink}>Sign up</Text>
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
