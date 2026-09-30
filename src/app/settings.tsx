import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  Moon,
  Sun,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  User,
  Star,
  MessageSquare,
} from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, isDark, toggleMode, mode } = useTheme();

  const s = makeStyles(colors);

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserEmail(session.user.email || null);
        setUserName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User');
      }
    });
  }, []);



  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: async () => {
        await supabase.auth.signOut();
        router.replace('/welcome');
      }},
    ]);
  };


  return (
    <SafeAreaView style={[s.safeArea, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Profile Section */}
        <View style={s.profileCard}>
          <View style={s.profileAvatar}>
            <Text style={s.profileAvatarText}>{userName ? userName[0].toUpperCase() : 'U'}</Text>
          </View>
          <View style={s.profileInfo}>
            <Text style={s.profileName}>{userName || 'Guest User'}</Text>
            <Text style={s.profileEmail}>{userEmail || 'Not logged in'}</Text>
          </View>
          <TouchableOpacity style={s.editProfileBtn}>
            <Text style={s.editProfileText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Appearance */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>APPEARANCE</Text>

          <View style={s.settingsCard}>
            {/* Dark / Light toggle */}
            <View style={s.settingsRow}>
              <View style={s.settingsRowLeft}>
                <View style={[s.iconBadge, { backgroundColor: colors.accentLight }]}>
                  {isDark
                    ? <Moon size={18} color={colors.accent} />
                    : <Sun size={18} color={colors.accent} />
                  }
                </View>
                <View>
                  <Text style={s.settingsRowTitle}>Dark Mode</Text>
                  <Text style={s.settingsRowSubtitle}>{isDark ? 'Dark theme active' : 'Light theme active'}</Text>
                </View>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleMode}
                trackColor={{ false: colors.divider, true: colors.accent }}
                thumbColor={colors.textInverse}
                ios_backgroundColor={colors.divider}
              />
            </View>
          </View>
        </View>

        {/* Notifications */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>NOTIFICATIONS</Text>
          <View style={s.settingsCard}>
            <TouchableOpacity style={s.settingsRow}>
              <View style={s.settingsRowLeft}>
                <View style={[s.iconBadge, { backgroundColor: '#1a2a1a' }]}>
                  <Bell size={18} color={colors.success} />
                </View>
                <View>
                  <Text style={s.settingsRowTitle}>Push Notifications</Text>
                  <Text style={s.settingsRowSubtitle}>Reminders, streaks, and updates</Text>
                </View>
              </View>
              <ChevronRight size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Account */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>ACCOUNT</Text>
          <View style={s.settingsCard}>
            <TouchableOpacity style={s.settingsRow}>
              <View style={s.settingsRowLeft}>
                <View style={[s.iconBadge, { backgroundColor: '#1a1a2a' }]}>
                  <Shield size={18} color="#818CF8" />
                </View>
                <Text style={s.settingsRowTitle}>Privacy & Security</Text>
              </View>
              <ChevronRight size={18} color={colors.textTertiary} />
            </TouchableOpacity>

            <View style={s.rowDivider} />

            <TouchableOpacity style={s.settingsRow}>
              <View style={s.settingsRowLeft}>
                <View style={[s.iconBadge, { backgroundColor: '#1a1a2a' }]}>
                  <User size={18} color="#818CF8" />
                </View>
                <Text style={s.settingsRowTitle}>Personal Information</Text>
              </View>
              <ChevronRight size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Support */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>SUPPORT</Text>
          <View style={s.settingsCard}>
            <TouchableOpacity style={s.settingsRow}>
              <View style={s.settingsRowLeft}>
                <View style={[s.iconBadge, { backgroundColor: '#1a2010' }]}>
                  <Star size={18} color="#FCD34D" />
                </View>
                <Text style={s.settingsRowTitle}>Rate FreakyFit</Text>
              </View>
              <ChevronRight size={18} color={colors.textTertiary} />
            </TouchableOpacity>

            <View style={s.rowDivider} />

            <TouchableOpacity style={s.settingsRow}>
              <View style={s.settingsRowLeft}>
                <View style={[s.iconBadge, { backgroundColor: '#1a1520' }]}>
                  <MessageSquare size={18} color="#A78BFA" />
                </View>
                <Text style={s.settingsRowTitle}>Send Feedback</Text>
              </View>
              <ChevronRight size={18} color={colors.textTertiary} />
            </TouchableOpacity>

            <View style={s.rowDivider} />

            <TouchableOpacity style={s.settingsRow}>
              <View style={s.settingsRowLeft}>
                <View style={[s.iconBadge, { backgroundColor: '#1a1520' }]}>
                  <HelpCircle size={18} color="#A78BFA" />
                </View>
                <Text style={s.settingsRowTitle}>Help Center</Text>
              </View>
              <ChevronRight size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Version */}
        <Text style={s.versionText}>FreakyFit v1.0.0</Text>

        {/* Log Out */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <LogOut size={18} color="#EF4444" />
          <Text style={s.logoutText}>Log out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof import('../contexts/ThemeContext').useTheme>['colors']) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 8,
    },
    profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      marginBottom: 24,
      gap: 12,
    },
    profileAvatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    profileAvatarText: {
      color: '#FFFFFF',
      fontSize: 22,
      fontWeight: '800',
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    profileEmail: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    editProfileBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.accent,
    },
    editProfileText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.accent,
    },
    section: {
      marginBottom: 20,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textTertiary,
      letterSpacing: 1,
      marginBottom: 8,
      paddingHorizontal: 4,
    },
    settingsCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      overflow: 'hidden',
    },
    settingsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    settingsRowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    iconBadge: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    settingsRowTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    settingsRowSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    rowDivider: {
      height: 1,
      backgroundColor: colors.divider,
      marginLeft: 64,
    },
    versionText: {
      textAlign: 'center',
      fontSize: 12,
      color: colors.textTertiary,
      marginBottom: 16,
    },
    logoutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#3A1515',
      paddingVertical: 16,
    },
    logoutText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#EF4444',
    },
  });
