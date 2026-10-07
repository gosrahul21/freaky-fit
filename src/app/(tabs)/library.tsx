import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Modal, TextInput, Alert, Image } from 'react-native';
import { Search, Plus, Home as HomeIcon, Bookmark, User, CalendarDays, List, Edit3, ChevronRight, FolderPlus, Download, Zap, MessageSquare, Flame, Compass, X, Trash2, PlaySquare, Camera, Smartphone } from 'lucide-react-native';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function LibraryScreen() {
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'workouts' | 'collections' | 'plans'>('workouts');
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCollectionModalVisible, setCollectionModalVisible] = useState(false);
  const [newCollectionTitle, setNewCollectionTitle] = useState('');
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [userName, setUserName] = useState('U');

  const params = useLocalSearchParams();

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
      if (params.action === 'create_collection') {
        setActiveTab('collections');
        setCollectionModalVisible(true);
        router.setParams({ action: '' });
      }
    }, [params.action])
  );

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    setUserName(user.user_metadata?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U');

    // Fetch Workouts
    const { data: workoutsData } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    // Fetch Collections
    const { data: collectionsData } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Fetch Plans
    const { data: plansData } = await supabase
      .from('planner')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (workoutsData) setWorkouts(workoutsData);
    if (collectionsData) setCollections(collectionsData);
    if (plansData) setPlans(plansData);
    setLoading(false);
  };

  const handleCreateCollection = async () => {
    if (!newCollectionTitle.trim()) {
      Alert.alert('Error', 'Please enter a collection name.');
      return;
    }
    setIsCreatingCollection(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsCreatingCollection(false);
      return;
    }
    
    const { data, error } = await supabase
      .from('collections')
      .insert([{ title: newCollectionTitle.trim(), user_id: user.id }])
      .select();
      
    if (error) {
      Alert.alert('Error', error.message);
    } else if (data) {
      setCollections([data[0], ...collections]);
      setCollectionModalVisible(false);
      setNewCollectionTitle('');
    }
    setIsCreatingCollection(false);
  };

  const handleDelete = async (id: string, type: 'workout' | 'collection' | 'plan') => {
    Alert.alert('Delete', `Are you sure you want to delete this ${type}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          let table = 'workouts';
          if (type === 'collection') table = 'collections';
          if (type === 'plan') table = 'planner';
          
          await supabase.from(table).delete().eq('id', id);
          fetchData(); // Refresh list
      }}
    ]);
  };

  const filteredWorkouts = workouts.filter(w => w.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredCollections = collections.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredPlans = plans.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.container}>
        
        {/* Top Header */}
        <View style={s.header}>
          <View style={s.avatarContainer}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{userName}</Text>
            </View>
            {/* Crown mock */}
            <View style={s.crownBadge}>
              <Text style={{ fontSize: 10 }}>👑</Text>
            </View>
          </View>
          
          <View style={s.headerActions}>
            <TouchableOpacity style={s.iconBtn} onPress={() => setIsSearchActive(!isSearchActive)}>
              <Search size={24} color={isSearchActive ? colors.accent : "#111827"} />
            </TouchableOpacity>
            <TouchableOpacity style={s.iconBtn} onPress={() => setIsEditMode(!isEditMode)}>
              <Edit3 size={24} color={isEditMode ? colors.accent : "#111827"} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        {isSearchActive && (
          <View style={s.searchContainer}>
            <Search size={20} color="#9CA3AF" />
            <TextInput
              style={s.searchInput}
              placeholder="Search..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        )}

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
            filteredWorkouts.length > 0 ? (
              <View style={{ gap: 12 }}>
                {filteredWorkouts.map(w => {
                  let PlatformIcon = Zap;
                  let iconColor = colors.accent;
                  
                  if (w.source_url?.includes('youtube.com') || w.source_url?.includes('youtu.be')) {
                    PlatformIcon = PlaySquare;
                    iconColor = '#FF0000'; // YouTube Red
                  } else if (w.source_url?.includes('instagram.com')) {
                    PlatformIcon = Camera;
                    iconColor = '#E1306C'; // Instagram Pink
                  } else if (w.source_url?.includes('tiktok.com')) {
                    PlatformIcon = Smartphone;
                    iconColor = '#000000'; // TikTok Black (or white in dark mode, but let's use textPrimary)
                  }

                  return (
                    <TouchableOpacity 
                      key={w.id} 
                      style={s.folderRow} 
                      activeOpacity={0.8} 
                      onPress={() => !isEditMode && router.push(`/workout/${w.id}`)}
                    >
                      <View style={s.folderRowLeft}>
                        {w.thumbnail_url ? (
                          <View style={{ position: 'relative', marginRight: 16 }}>
                            <Image source={{ uri: w.thumbnail_url }} style={[s.workoutThumbnail, { marginRight: 0 }]} />
                            <View style={[s.platformBadgeOverlay, { backgroundColor: iconColor }]}>
                              <PlatformIcon size={10} color="#FFFFFF" />
                            </View>
                          </View>
                        ) : (
                          <View style={[s.folderIconBadge, { backgroundColor: `${iconColor}15` }]}>
                            <PlatformIcon size={20} color={w.source_url?.includes('tiktok.com') ? colors.textPrimary : iconColor} />
                          </View>
                        )}
                        <View style={{flex: 1}}>
                          <Text style={s.folderName} numberOfLines={1}>{w.title}</Text>
                          <Text style={s.folderDesc}>{w.source_type || 'Custom Workout'}</Text>
                        </View>
                      </View>
                    {isEditMode ? (
                      <TouchableOpacity onPress={() => handleDelete(w.id, 'workout')} style={{padding: 8}}>
                        <Trash2 size={20} color="#ef4444" />
                      </TouchableOpacity>
                    ) : (
                      <ChevronRight size={20} color="#9CA3AF" />
                    )}
                  </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={s.centeredState}>
                <Text style={s.emptyTitle}>No workouts yet</Text>
                <Text style={s.emptySubtitle}>Import your first workout to get started</Text>
                
                <TouchableOpacity style={s.primaryBtn} onPress={() => router.push('/importer')}>
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
            )
          )}

          {activeTab === 'collections' && (
            <View style={s.collectionsState}>
              <TouchableOpacity style={s.newCollectionCard} activeOpacity={0.8} onPress={() => setCollectionModalVisible(true)}>
                <View style={s.newCollectionBox}>
                  <FolderPlus size={32} color="#111827" strokeWidth={1.5} />
                </View>
                <Text style={s.newCollectionText}>New collection</Text>
              </TouchableOpacity>
              
              {collections.length === 0 && (
                <Text style={s.collectionsSubtitle}>Create a collection to organise your workouts.</Text>
              )}

              {filteredCollections.length > 0 && (
                <View style={[s.suggestedContainer, { marginTop: 24 }]}>
                  {filteredCollections.map(c => (
                    <TouchableOpacity 
                      key={c.id} 
                      style={[s.folderRow, { marginBottom: 8 }]} 
                      activeOpacity={0.8}
                      onPress={() => !isEditMode && router.push(`/collection/${c.id}`)}
                    >
                      <View style={s.folderRowLeft}>
                        <View style={s.folderIconBadge}>
                          <FolderPlus size={20} color={colors.accent} />
                        </View>
                        <View>
                          <Text style={s.folderName}>{c.title}</Text>
                        </View>
                      </View>
                      {isEditMode ? (
                        <TouchableOpacity onPress={() => handleDelete(c.id, 'collection')} style={{padding: 8}}>
                          <Trash2 size={20} color="#ef4444" />
                        </TouchableOpacity>
                      ) : (
                        <ChevronRight size={20} color="#9CA3AF" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {collections.length === 0 && (
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
              )}
            </View>
          )}

          {activeTab === 'plans' && (
            filteredPlans.length > 0 ? (
              <View style={{ gap: 12 }}>
                {filteredPlans.map(p => (
                  <TouchableOpacity key={p.id} style={s.folderRow} activeOpacity={0.8}>
                    <View style={s.folderRowLeft}>
                      <View style={s.folderIconBadge}>
                        <CalendarDays size={20} color={colors.accent} />
                      </View>
                      <View>
                        <Text style={s.folderName}>{p.title}</Text>
                        <Text style={s.folderDesc}>{p.status}</Text>
                      </View>
                    </View>
                    {isEditMode ? (
                      <TouchableOpacity onPress={() => handleDelete(p.id, 'plan')} style={{padding: 8}}>
                        <Trash2 size={20} color="#ef4444" />
                      </TouchableOpacity>
                    ) : (
                      <ChevronRight size={20} color="#9CA3AF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
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
            )
          )}

        </ScrollView>
        </View>

      <Modal
        visible={isCollectionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCollectionModalVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContainer}>
            <Text style={s.modalTitle}>New Collection</Text>
            <TextInput
              style={s.modalInput}
              placeholder="e.g. Leg Days"
              placeholderTextColor="#9CA3AF"
              value={newCollectionTitle}
              onChangeText={setNewCollectionTitle}
              autoFocus
            />
            <View style={s.modalActions}>
              <TouchableOpacity style={s.modalCancelBtn} onPress={() => setCollectionModalVisible(false)}>
                <Text style={s.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={s.modalCreateBtn} 
                onPress={handleCreateCollection}
                disabled={isCreatingCollection}
              >
                <Text style={s.modalCreateText}>{isCreatingCollection ? 'Creating...' : 'Create'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    paddingVertical: 8,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.backgroundElevated,
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
    flex: 1,
  },
  workoutThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.skeleton,
  },
  platformBadgeOverlay: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.card,
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },
  modalInput: {
    height: 48,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalCreateBtn: {
    backgroundColor: '#D97706',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalCreateText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 0,
  }
});
