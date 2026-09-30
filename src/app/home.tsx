import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, Modal, Pressable } from 'react-native';
import { Search, Crown, Infinity as InfinityIcon, ChevronRight, Plus, Camera, Scale, CalendarDays, MoreHorizontal, Home as HomeIcon, Bookmark, User, MessageSquare, X, Download, FolderPlus, CalendarPlus } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [showFeedbackTour, setShowFeedbackTour] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Main Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.searchBtn}>
              <Search size={24} color="#1F2937" strokeWidth={2.2} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>HOME</Text>
          </View>
          
          <TouchableOpacity style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>RG</Text>
            </View>
            <View style={styles.crownBadge}>
              <Crown size={12} color="#D97706" fill="#FBBF24" />
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          
          {/* Import Banner */}
          <View style={styles.importBanner}>
            <View style={styles.importBannerTop}>
              <Text style={styles.importBannerSubtitle}>ANYWHERE...</Text>
              <View style={styles.importBannerRight}>
                <InfinityIcon size={14} color="#ff5e00" />
                <Text style={styles.importBannerUnlimited}>Unlimited imports</Text>
              </View>
            </View>
            
            <View style={styles.importProgressBars}>
              <View style={styles.importProgressFill} />
              <View style={styles.importProgressFill} />
              <View style={styles.importProgressFill} />
              <View style={styles.importProgressFill} />
              <View style={styles.importProgressFill} />
            </View>
            
            <View style={styles.importBannerBottom}>
              <TouchableOpacity>
                <Text style={styles.importNowText}>Import now</Text>
              </TouchableOpacity>
              <Text style={styles.importBannerDesc}>Sync web, reel & notes</Text>
            </View>
          </View>

          {/* Calendar Strip */}
          <View style={styles.calendarStrip}>
            {['M','T','W','T','F','S','S'].map((day, i) => {
              const isToday = i === 6;
              const date = 21 + i;
              return (
                <TouchableOpacity key={i} style={styles.calendarDay}>
                  {isToday ? (
                    <View style={styles.calendarDayLabelTodayContainer}>
                      <Text style={styles.calendarDayLabelToday}>{day}</Text>
                    </View>
                  ) : (
                    <Text style={styles.calendarDayLabel}>{day}</Text>
                  )}
                  
                  <View style={[styles.calendarDateNode, isToday && styles.calendarDateNodeToday]}>
                    <Text style={[styles.calendarDateText, isToday && styles.calendarDateTextToday]}>
                      {date}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Recently Saved Section */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recently saved</Text>
              <ChevronRight size={16} color="#9CA3AF" />
            </TouchableOpacity>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.recentScroll}
              contentContainerStyle={styles.recentScrollContent}
            >
              {/* Card 1: Import */}
              <TouchableOpacity style={styles.recentCard} activeOpacity={0.9} onPress={() => router.push('/workout-details')}>
                <View style={[styles.recentCardImage, { backgroundColor: '#F3F4F6' }]}>
                  <View style={styles.importCardVisual}>
                    <View style={styles.importPlusBtn}>
                      <Plus size={16} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  </View>
                </View>
                <Text style={styles.recentCardTitle} numberOfLines={1}>Import a Work...</Text>
                <Text style={styles.recentCardSubtitle}>Social & web</Text>
              </TouchableOpacity>
              
              {/* Card 2 */}
              <TouchableOpacity style={styles.recentCard} activeOpacity={0.9} onPress={() => router.push('/workout-details')}>
                <View style={styles.recentCardImage}>
                  <Text style={styles.recentCardIconText}>💪</Text>
                  <Text style={styles.recentCardTag}>BACK & PULL</Text>
                </View>
                <Text style={styles.recentCardTitle} numberOfLines={1}>Build a Bigger ...</Text>
                <Text style={styles.recentCardSubtitle}>4 exercises</Text>
              </TouchableOpacity>
              
              {/* Card 3 */}
              <TouchableOpacity style={styles.recentCard} activeOpacity={0.9} onPress={() => router.push('/workout-details')}>
                <View style={styles.recentCardImage}>
                  <Text style={styles.recentCardIconText}>🔥</Text>
                  <Text style={styles.recentCardTag}>HYPERTROPHY</Text>
                </View>
                <Text style={styles.recentCardTitle} numberOfLines={1}>Build a Bigger ...</Text>
                <Text style={styles.recentCardSubtitle}>4 exercises</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Progress Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Progress</Text>
            </View>
            
            <View style={styles.progressGrid}>
              <TouchableOpacity style={styles.progressCard} activeOpacity={0.9}>
                <View style={styles.progressCardVisual}>
                  <Camera size={24} color="#4B5563" />
                </View>
                <Text style={styles.progressCardTitle}>Progress Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.progressCard} activeOpacity={0.9}>
                <View style={[styles.progressCardVisual, { justifyContent: 'center' }]}>
                  <View style={styles.scaleIconRow}>
                    <View style={styles.scaleIconWrapper}>
                      <Scale size={16} color="#374151" />
                    </View>
                    <View style={styles.trendDotWrapper}>
                      <View style={styles.trendDot} />
                    </View>
                  </View>
                  <Text style={styles.progressCardHint}>Log your weight to see a trend</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Today / Active Routine Section */}
          <View style={styles.section}>
            <View style={styles.todayHeader}>
              <View style={styles.todayHeaderLeft}>
                <Text style={styles.todayTitle}>TODAY</Text>
                <ChevronRight size={20} color="#6B7280" />
                <Text style={styles.todayDate}>Sep 27</Text>
              </View>
              <TouchableOpacity style={styles.calendarBtn}>
                <CalendarDays size={16} color="#4B5563" />
              </TouchableOpacity>
            </View>

            <View style={styles.activeRoutineCard}>
              <View style={styles.activeRoutineHeader}>
                <View style={styles.activeRoutineTags}>
                  <View style={styles.tagBadge}>
                    <Text style={styles.tagBadgeText}>LEGS & CORE</Text>
                  </View>
                  <Text style={styles.routineDuration}>50 mins</Text>
                </View>
                <TouchableOpacity>
                  <MoreHorizontal size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.routineTitle}>Hypertrophy Lower Quad Focus</Text>
              <Text style={styles.routineDesc}>Barbell Squats, Romanian Deadlifts, Bulgarian Split Squats</Text>
              
              <TouchableOpacity style={styles.startSessionFooter}>
                <View style={styles.avatarStack}>
                  <View style={styles.miniAvatar}><Text style={styles.miniAvatarText}>1</Text></View>
                  <View style={[styles.miniAvatar, { marginLeft: -8 }]}><Text style={styles.miniAvatarText}>2</Text></View>
                  <View style={[styles.miniAvatar, { marginLeft: -8 }]}><Text style={styles.miniAvatarText}>3</Text></View>
                </View>
                <View style={styles.startBtnContent}>
                  <Text style={styles.startBtnText}>Start Session</Text>
                  <ChevronRight size={16} color="#ff5e00" />
                </View>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>

        {/* Feedback Tour Tooltip Modal */}
        {showFeedbackTour && (
          <View style={styles.feedbackTooltip}>
            <View style={styles.tooltipTopRow}>
              <View style={styles.tooltipLeft}>
                <View style={styles.tooltipIconBadge}>
                  <MessageSquare size={20} color="#1F2937" />
                </View>
                <View style={styles.tooltipTextContent}>
                  <Text style={styles.tooltipTitle}>Share your feedback</Text>
                  <Text style={styles.tooltipDesc}>
                    Found a bug or have an idea? Tap here anytime — you can also drag the button anywhere.
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.tooltipCloseBtn} onPress={() => setShowFeedbackTour(false)}>
                <X size={16} color="#6B7280" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.tooltipBottomRow}>
              <Text style={styles.tooltipStepText}>1 of 3</Text>
              <TouchableOpacity onPress={() => setShowFeedbackTour(false)}>
                <Text style={styles.tooltipNextText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Floating Feedback Button */}
        <TouchableOpacity style={styles.feedbackFloatBtn} activeOpacity={0.9} onPress={() => setShowFeedbackTour(true)}>
          <Text style={styles.feedbackFloatText}>Feedback</Text>
        </TouchableOpacity>

        {/* Bottom Navigation Bar */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem}>
            <HomeIcon size={20} color="#ff5e00" strokeWidth={2.5} />
            <Text style={[styles.navLabel, styles.navLabelActive]}>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/library')}>
            <Bookmark size={20} color="#9CA3AF" strokeWidth={2} />
            <Text style={styles.navLabel}>Library</Text>
          </TouchableOpacity>

          <View style={styles.centerAddBtnWrapper}>
            <TouchableOpacity 
              style={styles.centerAddBtn} 
              activeOpacity={0.8}
              onPress={() => setShowAddModal(true)}
            >
              <Plus size={28} color="#ff5e00" strokeWidth={2.5} />
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

      {/* Quick Add Bottom Sheet Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowAddModal(false)}>
          <Pressable style={styles.bottomSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>
            
            <Text style={styles.sheetTitle}>What would you like to add?</Text>
            
            <View style={styles.sheetOptionsContainer}>
              
              {/* Option 1 */}
              <TouchableOpacity style={styles.sheetOption} activeOpacity={0.7} onPress={() => setShowAddModal(false)}>
                <View style={styles.sheetOptionIcon}>
                  <Download size={24} color="#111827" strokeWidth={2.2} />
                </View>
                <View style={styles.sheetOptionTextContainer}>
                  <Text style={styles.sheetOptionTitle}>Import a Workout</Text>
                  <Text style={styles.sheetOptionDesc}>From a URL, photo, or paste text</Text>
                </View>
              </TouchableOpacity>

              {/* Option 2 */}
              <TouchableOpacity style={styles.sheetOption} activeOpacity={0.7} onPress={() => setShowAddModal(false)}>
                <View style={styles.sheetOptionIcon}>
                  <FolderPlus size={24} color="#374151" strokeWidth={2} />
                </View>
                <View style={styles.sheetOptionTextContainer}>
                  <Text style={styles.sheetOptionTitle}>Create a Collection</Text>
                  <Text style={styles.sheetOptionDesc}>Organise your workouts into collections</Text>
                </View>
              </TouchableOpacity>

              {/* Option 3 */}
              <TouchableOpacity style={styles.sheetOption} activeOpacity={0.7} onPress={() => setShowAddModal(false)}>
                <View style={styles.sheetOptionIcon}>
                  <CalendarPlus size={24} color="#1F2937" strokeWidth={2.2} />
                </View>
                <View style={styles.sheetOptionTextContainer}>
                  <Text style={styles.sheetOptionTitle}>Create workout plan</Text>
                  <Text style={styles.sheetOptionDesc}>Build a personal day-based plan</Text>
                </View>
              </TouchableOpacity>

            </View>
            
            <View style={styles.homeIndicatorSpaceSheet}>
              <View style={styles.homeIndicator} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

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
    paddingVertical: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  crownBadge: {
    position: 'absolute',
    top: -6,
    right: -4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 2,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.6)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
    gap: 20,
  },
  importBanner: {
    backgroundColor: '#111317',
    borderRadius: 16,
    padding: 16,
  },
  importBannerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  importBannerSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  importBannerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  importBannerUnlimited: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ff5e00',
  },
  importProgressBars: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  importProgressFill: {
    flex: 1,
    height: 6,
    backgroundColor: '#ff5e00',
    borderRadius: 3,
  },
  importBannerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  importNowText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  importBannerDesc: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  calendarStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  calendarDay: {
    alignItems: 'center',
    gap: 6,
  },
  calendarDayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  calendarDayLabelTodayContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(156, 163, 175, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDayLabelToday: {
    fontSize: 10,
    fontWeight: '800',
    color: '#374151',
  },
  calendarDateNode: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDateNodeToday: {
    backgroundColor: '#111827',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  calendarDateText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  calendarDateTextToday: {
    color: '#FFFFFF',
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  recentScroll: {
    marginHorizontal: -16,
  },
  recentScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  recentCard: {
    width: 112,
  },
  recentCardImage: {
    width: 112,
    height: 112,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  importCardVisual: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  importPlusBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff5e00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentCardIconText: {
    fontSize: 28,
    marginBottom: 4,
  },
  recentCardTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  recentCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
  },
  recentCardSubtitle: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  progressGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  progressCard: {
    flex: 1,
    height: 120,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    alignItems: 'center',
  },
  progressCardVisual: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
  },
  scaleIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  scaleIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendDotWrapper: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff5e00',
  },
  progressCardHint: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 16,
  },
  todayHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  todayHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  todayTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
  },
  todayDate: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  calendarBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeRoutineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  activeRoutineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  activeRoutineTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagBadge: {
    backgroundColor: '#FFF3EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  tagBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ff5e00',
  },
  routineDuration: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  routineTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  routineDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  startSessionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: 16,
    paddingTop: 12,
  },
  avatarStack: {
    flexDirection: 'row',
  },
  miniAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatarText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#4B5563',
  },
  startBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  startBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ff5e00',
  },
  feedbackFloatBtn: {
    position: 'absolute',
    bottom: 96,
    right: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
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
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
  },
  feedbackTooltip: {
    position: 'absolute',
    bottom: 110,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    zIndex: 40,
  },
  tooltipTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tooltipLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
    paddingRight: 16,
  },
  tooltipIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipTextContent: {
    flex: 1,
  },
  tooltipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  tooltipDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 18,
  },
  tooltipCloseBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  tooltipStepText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  tooltipNextText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.28,
    shadowRadius: 40,
    elevation: 20,
  },
  dragHandleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 12,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  sheetTitle: {
    fontSize: 23,
    fontWeight: '900',
    color: '#0A0A0B',
    marginTop: 4,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  sheetOptionsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sheetOptionIcon: {
    marginRight: 16,
  },
  sheetOptionTextContainer: {
    flex: 1,
  },
  sheetOptionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0A0A0B',
    letterSpacing: -0.2,
  },
  sheetOptionDesc: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  homeIndicatorSpaceSheet: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 24,
  }
});
