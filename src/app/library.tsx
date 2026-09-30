import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Search, Plus, Home as HomeIcon, Bookmark, User, CalendarDays, List, Edit3, ChevronRight, FolderPlus, Download, Zap, MessageSquare } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function LibraryScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'workouts' | 'collections' | 'plans'>('workouts');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>R</Text>
            </View>
            {/* Crown mock */}
            <View style={styles.crownBadge}>
              <Text style={{ fontSize: 10 }}>👑</Text>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn}>
              <List size={24} color="#111827" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Search size={24} color="#111827" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Edit3 size={24} color="#111827" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Segmented Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={styles.tabBtn} 
            activeOpacity={0.8}
            onPress={() => setActiveTab('workouts')}
          >
            <Text style={[styles.tabText, activeTab === 'workouts' && styles.tabTextActive]}>Workouts</Text>
            {activeTab === 'workouts' && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.tabBtn} 
            activeOpacity={0.8}
            onPress={() => setActiveTab('collections')}
          >
            <Text style={[styles.tabText, activeTab === 'collections' && styles.tabTextActive]}>Collections</Text>
            {activeTab === 'collections' && <View style={styles.activeIndicator} />}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.tabBtn} 
            activeOpacity={0.8}
            onPress={() => setActiveTab('plans')}
          >
            <Text style={[styles.tabText, activeTab === 'plans' && styles.tabTextActive]}>Workout Plans</Text>
            {activeTab === 'plans' && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        </View>

        {/* Content Area */}
        <ScrollView contentContainerStyle={styles.contentArea} showsVerticalScrollIndicator={false}>
          
          {activeTab === 'workouts' && (
            <View style={styles.centeredState}>
              <Text style={styles.emptyTitle}>No workouts yet</Text>
              <Text style={styles.emptySubtitle}>Import your first workout to get started</Text>
              
              <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/analyze')}>
                <Download size={20} color="#ff5e00" />
                <Text style={styles.primaryBtnText}>Import a workout</Text>
              </TouchableOpacity>

              <View style={styles.quickStartContainer}>
                <Text style={styles.quickStartTitle}>QUICK START TEMPLATES</Text>
                <View style={styles.quickStartRow}>
                  <TouchableOpacity style={styles.templatePill}>
                    <Text style={styles.templatePillText}>Upper Power</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.templatePill}>
                    <Text style={styles.templatePillText}>Legs Hypertrophy</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {activeTab === 'collections' && (
            <View style={styles.collectionsState}>
              <TouchableOpacity style={styles.newCollectionCard} activeOpacity={0.8}>
                <View style={styles.newCollectionBox}>
                  <FolderPlus size={32} color="#111827" strokeWidth={1.5} />
                </View>
                <Text style={styles.newCollectionText}>New collection</Text>
              </TouchableOpacity>
              
              <Text style={styles.collectionsSubtitle}>Create a collection to organise your workouts.</Text>

              <View style={styles.suggestedContainer}>
                <View style={styles.suggestedHeader}>
                  <Text style={styles.suggestedTitle}>SUGGESTED FOLDERS</Text>
                  <TouchableOpacity>
                    <Text style={styles.exploreText}>Explore</Text>
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity style={styles.folderRow} activeOpacity={0.8}>
                  <View style={styles.folderRowLeft}>
                    <View style={styles.folderIconBadge}>
                      <Zap size={20} color="#ff5e00" fill="#ff5e00" />
                    </View>
                    <View>
                      <Text style={styles.folderName}>Hypertrophy Split</Text>
                      <Text style={styles.folderDesc}>4 scheduled routines</Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeTab === 'plans' && (
            <View style={styles.centeredState}>
              <Text style={styles.emptyTitle}>No workout plans yet</Text>
              <Text style={styles.emptySubtitle}>Build a personal day-by-day plan and it'll show up here</Text>
              
              <TouchableOpacity style={styles.primaryBtn}>
                <CalendarDays size={20} color="#ff5e00" />
                <Text style={styles.primaryBtnText}>Create workout plan</Text>
              </TouchableOpacity>
              
              <View style={styles.syncBadge}>
                <View style={styles.syncDot} />
                <Text style={styles.syncText}>Syncs automatically with Planner</Text>
              </View>
            </View>
          )}

        </ScrollView>

        {/* Floating Feedback Button */}
        <TouchableOpacity style={styles.feedbackFloatBtn} activeOpacity={0.9}>
          <MessageSquare size={16} color="#6B7280" />
          <Text style={styles.feedbackFloatText}>Feedback</Text>
        </TouchableOpacity>

        {/* Bottom Navigation Bar */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/home')}>
            <HomeIcon size={20} color="#9CA3AF" strokeWidth={2} />
            <Text style={styles.navLabel}>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem}>
            <Bookmark size={20} color="#ff5e00" strokeWidth={2.5} />
            <Text style={[styles.navLabel, styles.navLabelActive]}>Library</Text>
          </TouchableOpacity>

          <View style={styles.centerAddBtnWrapper}>
            <TouchableOpacity style={styles.centerAddBtn} activeOpacity={0.8}>
              <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.navItem}>
            <CalendarDays size={20} color="#9CA3AF" strokeWidth={2} />
            <Text style={styles.navLabel}>Planner</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem}>
            <User size={20} color="#9CA3AF" strokeWidth={2} />
            <Text style={styles.navLabel}>Profile</Text>
          </TouchableOpacity>
        </View>

        {/* iOS Home Indicator Space */}
        <View style={styles.homeIndicatorSpace}>
          <View style={styles.homeIndicator} />
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#111827',
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#ff5e00',
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
    color: '#111827',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
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
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 12,
  },
  quickStartRow: {
    flexDirection: 'row',
    gap: 8,
  },
  templatePill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    backgroundColor: '#FFFFFF',
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
    color: '#111827',
  },
  collectionsSubtitle: {
    fontSize: 14,
    color: '#6B7280',
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
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  exploreText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ff5e00',
  },
  folderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    color: '#111827',
  },
  folderDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    color: '#6B7280',
  },
  feedbackFloatBtn: {
    position: 'absolute',
    bottom: 96,
    right: 16,
    backgroundColor: '#FFFFFF',
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
    borderColor: '#E5E7EB',
  },
  feedbackFloatText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 24, // adjust for safe area manually since we're using absolute
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  navLabelActive: {
    color: '#ff5e00',
  },
  centerAddBtnWrapper: {
    position: 'relative',
    top: -20,
  },
  centerAddBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ff5e00',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff5e00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  homeIndicatorSpace: {
    height: 24,
    backgroundColor: '#FFFFFF',
  },
  homeIndicator: {
    width: 120,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
  }
});
