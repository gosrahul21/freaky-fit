import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Search, Plus, Home as HomeIcon, Bookmark, User, CalendarDays, List, Edit3, ChevronRight, FolderPlus, Download, Zap, MessageSquare, Flame, Compass } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function LibraryScreen() {
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'workouts' | 'collections' | 'plans'>('workouts');

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.container}>
        
        {/* Top Header */}
        <View style={s.header}>
          <View style={s.avatarContainer}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>R</Text>
            </View>
            {/* Crown mock */}
            <View style={s.crownBadge}>
              <Text style={{ fontSize: 10 }}>👑</Text>
            </View>
          </View>
          
          <View style={s.headerActions}>
            <TouchableOpacity style={s.iconBtn}>
              <List size={24} color="#111827" />
            </TouchableOpacity>
            <TouchableOpacity style={s.iconBtn}>
              <Search size={24} color="#111827" />
            </TouchableOpacity>
            <TouchableOpacity style={s.iconBtn}>
              <Edit3 size={24} color="#111827" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Segmented Tabs */}
        <View style={s.tabsContainer}>
          <TouchableOpacity 
            style={s.tabBtn} 
            activeOpacity={0.8}
            onPress={() => setActiveTab('workouts')}
          >
            <Text style={[s.tabText, activeTab === 'workouts' && s.tabTextActive]}>Workouts</Text>
            {activeTab === 'workouts' && <View style={s.activeIndicator} />}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={s.tabBtn} 
            activeOpacity={0.8}
            onPress={() => setActiveTab('collections')}
          >
            <Text style={[s.tabText, activeTab === 'collections' && s.tabTextActive]}>Collections</Text>
            {activeTab === 'collections' && <View style={s.activeIndicator} />}
          </TouchableOpacity>

          <TouchableOpacity 
            style={s.tabBtn} 
            activeOpacity={0.8}
            onPress={() => setActiveTab('plans')}
          >
            <Text style={[s.tabText, activeTab === 'plans' && s.tabTextActive]}>Workout Plans</Text>
            {activeTab === 'plans' && <View style={s.activeIndicator} />}
          </TouchableOpacity>
        </View>

        {/* Content Area */}
        <ScrollView contentContainerStyle={s.contentArea} showsVerticalScrollIndicator={false}>
          
          {activeTab === 'workouts' && (
            <View style={s.centeredState}>
              <Text style={s.emptyTitle}>No workouts yet</Text>
              <Text style={s.emptySubtitle}>Import your first workout to get started</Text>
              
              <TouchableOpacity style={s.primaryBtn} onPress={() => router.push('/streaks')}>
                <Download size={20} color={colors.accent} />
                <Text style={s.primaryBtnText}>Import a workout</Text>
              </TouchableOpacity>

              <View style={s.quickStartContainer}>
                <Text style={s.quickStartTitle}>QUICK START TEMPLATES</Text>
                <View style={s.quickStartRow}>
                  <TouchableOpacity style={s.templatePill}>
                    <Text style={s.templatePillText}>Upper Power</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.templatePill}>
                    <Text style={s.templatePillText}>Legs Hypertrophy</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {activeTab === 'collections' && (
            <View style={s.collectionsState}>
              <TouchableOpacity style={s.newCollectionCard} activeOpacity={0.8}>
                <View style={s.newCollectionBox}>
                  <FolderPlus size={32} color="#111827" strokeWidth={1.5} />
                </View>
                <Text style={s.newCollectionText}>New collection</Text>
              </TouchableOpacity>
              
              <Text style={s.collectionsSubtitle}>Create a collection to organise your workouts.</Text>

              <View style={s.suggestedContainer}>
                <View style={s.suggestedHeader}>
                  <Text style={s.suggestedTitle}>SUGGESTED FOLDERS</Text>
                  <TouchableOpacity>
                    <Text style={s.exploreText}>Explore</Text>
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity style={s.folderRow} activeOpacity={0.8}>
                  <View style={s.folderRowLeft}>
                    <View style={s.folderIconBadge}>
                      <Zap size={20} color={colors.accent} fill={colors.accent} />
                    </View>
                    <View>
                      <Text style={s.folderName}>Hypertrophy Split</Text>
                      <Text style={s.folderDesc}>4 scheduled routines</Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeTab === 'plans' && (
            <View style={s.centeredState}>
              <Text style={s.emptyTitle}>No workout plans yet</Text>
              <Text style={s.emptySubtitle}>Build a personal day-by-day plan and it'll show up here</Text>
              
              <TouchableOpacity style={s.primaryBtn}>
                <CalendarDays size={20} color={colors.accent} />
                <Text style={s.primaryBtnText}>Create workout plan</Text>
              </TouchableOpacity>
              
              <View style={s.syncBadge}>
                <View style={s.syncDot} />
                <Text style={s.syncText}>Syncs automatically with Planner</Text>
              </View>
            </View>
          )}

        </ScrollView>

        </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof import("../../contexts/ThemeContext").useTheme>["colors"]) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  crownBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    transform: [{ rotate: '-12deg' }],
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabBtn: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginRight: 24,
    position: 'relative',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  contentArea: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 120,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
    marginBottom: 32,
    lineHeight: 20,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    gap: 8,
    width: '100%',
    maxWidth: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  quickStartContainer: {
    marginTop: 40,
    width: '100%',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 24,
    borderStyle: 'dashed',
  },
  quickStartTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 1,
    marginBottom: 12,
  },
  quickStartRow: {
    flexDirection: 'row',
    gap: 8,
  },
  templatePill: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  templatePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  collectionsState: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 16,
  },
  newCollectionCard: {
    width: '100%',
    maxWidth: 190,
    alignItems: 'center',
  },
  newCollectionBox: {
    width: '100%',
    aspectRatio: 1.35,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: '#111827',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  newCollectionText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  collectionsSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 24,
    maxWidth: 260,
  },
  suggestedContainer: {
    width: '100%',
    marginTop: 40,
  },
  suggestedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  suggestedTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 1,
  },
  exploreText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
  },
  folderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  folderRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  folderIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFF0E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  folderDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginTop: 32,
    gap: 8,
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  syncText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  feedbackFloatBtn: {
    position: 'absolute',
    bottom: 96,
    right: 16,
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  feedbackFloatText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  }});
