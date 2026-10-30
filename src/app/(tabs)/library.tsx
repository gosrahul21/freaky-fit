import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  useWindowDimensions, 
  Modal, 
  TextInput, 
  Alert, 
  Image 
} from 'react-native';
import { 
  Search, 
  Plus, 
  Edit3, 
  ChevronRight, 
  FolderPlus,
  Folder,
  Zap, 
  X, 
  Trash2, 
  MoreVertical, 
  Share2, 
  Dumbbell
} from 'lucide-react-native';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { hapticImpactLight } from '../../utils/haptics';
import { shareWorkout } from '../../utils/share';

const FILTER_TAGS = ['All', 'Back', 'Arms', 'Abs', 'Recent'];

// Gradient background presets for workout cards (adapts to dark and light mode)
const CARD_GRADIENTS = [
  { bg: '#1E1724', lightBg: '#FAF5FF', tagBg: '#EA580C', dotColor: '#EC4899', defaultCategory: 'Back' },
  { bg: '#1B1E24', lightBg: '#F0F7FF', tagBg: '#EA580C', dotColor: '#EF4444', defaultCategory: 'Abs' },
  { bg: '#221C18', lightBg: '#FFF7ED', tagBg: '#EA580C', dotColor: '#EF4444', defaultCategory: 'Arms' },
  { bg: '#17221E', lightBg: '#F0FDF4', tagBg: '#EA580C', dotColor: '#EF4444', defaultCategory: 'Core' },
];

export default function LibraryScreen() {
  const { colors, isDark } = useTheme();
  const s = makeStyles(colors, isDark);
  const router = useRouter();
  const params = useLocalSearchParams();
  const { width: screenWidth } = useWindowDimensions();

  const CARD_GAP = 12;
  const PADDING_HORIZONTAL = 16;
  const cardWidth = Math.floor((screenWidth - (PADDING_HORIZONTAL * 2) - CARD_GAP) / 2);

  const [activeTab, setActiveTab] = useState<'workouts' | 'collections'>('workouts');
  const [selectedTag, setSelectedTag] = useState('All');
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCollectionModalVisible, setCollectionModalVisible] = useState(false);
  const [newCollectionTitle, setNewCollectionTitle] = useState('');
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [userName, setUserName] = useState('RA');

  const getPlatformInfo = (w: any) => {
    const url = (w?.source_url || '').toLowerCase();
    const type = (w?.source_type || '').toLowerCase();
    if (url.includes('instagram') || type.includes('instagram')) {
      return { name: 'Instagram', dotColor: '#EC4899' };
    }
    if (url.includes('youtube') || url.includes('youtu.be') || type.includes('youtube')) {
      return { name: 'YouTube', dotColor: '#EF4444' };
    }
    if (url.includes('tiktok') || type.includes('tiktok')) {
      return { name: 'TikTok', dotColor: '#06B6D4' };
    }
    return { name: 'Workout', dotColor: '#EA580C' };
  };

  const getMuscleTag = (w: any, index: number) => {
    if (w?.target_muscle) return w.target_muscle;
    if (w?.category) return w.category;
    // Derive from title if present
    const t = (w?.title || '').toLowerCase();
    if (t.includes('back') || t.includes('row') || t.includes('pull')) return 'Back';
    if (t.includes('abs') || t.includes('core') || t.includes('belly')) return 'Abs';
    if (t.includes('bicep') || t.includes('arm') || t.includes('tricep')) return 'Arms';
    if (t.includes('leg') || t.includes('squat')) return 'Legs';
    if (t.includes('chest') || t.includes('bench')) return 'Chest';
    return CARD_GRADIENTS[index % CARD_GRADIENTS.length].defaultCategory;
  };

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    
    // User Initials
    const initials = user.user_metadata?.full_name
      ? user.user_metadata.full_name.substring(0, 2).toUpperCase()
      : (user.email ? user.email.substring(0, 2).toUpperCase() : 'RA');
    setUserName(initials);

    // Workouts
    const { data: workoutsData } = await supabase
      .from('workouts')
      .select('*, workout_exercises(id)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    // Collections with exercises
    const { data: collectionsData } = await supabase
      .from('collections')
      .select('*, collection_exercises(id)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (workoutsData) setWorkouts(workoutsData);
    if (collectionsData) setCollections(collectionsData);
    setLoading(false);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      let active = true;
      void (async () => {
        if (active) {
          await fetchData();
          if (params.action === 'create_collection') {
            setActiveTab('collections');
            setCollectionModalVisible(true);
            router.setParams({ action: '' });
          }
        }
      })();
      return () => {
        active = false;
      };
    }, [params.action, params._ts, router, fetchData])
  );

  const handleCreateCollection = async () => {
    if (!newCollectionTitle.trim()) {
      Alert.alert('Error', 'Please enter a collection name.');
      return;
    }
    setIsCreatingCollection(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsCreatingCollection(false);
        Alert.alert('Sign In Required', 'Please sign in to create and save collections.', [
          { text: 'Sign In', onPress: () => router.push('/auth/login') },
          { text: 'Cancel', style: 'cancel' }
        ]);
        return;
      }
      
      const { data, error } = await supabase
        .from('collections')
        .insert([{ title: newCollectionTitle.trim(), user_id: user.id }])
        .select();
        
      if (error) {
        Alert.alert('Error', error.message);
      } else if (data && data.length > 0) {
        setCollections(prev => [data[0], ...prev]);
        setCollectionModalVisible(false);
        setNewCollectionTitle('');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create collection');
    } finally {
      setIsCreatingCollection(false);
    }
  };

  const handleDelete = async (id: string, type: 'workout' | 'collection') => {
    Alert.alert(
      `Delete ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      `Are you sure you want to delete this ${type}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (type === 'collection') {
                await supabase.from('collection_exercises').delete().eq('collection_id', id);
                await supabase.from('collections').delete().eq('id', id);
                setCollections(prev => prev.filter(c => c.id !== id));
              } else if (type === 'workout') {
                await supabase.from('workout_exercises').delete().eq('workout_id', id);
                await supabase.from('workouts').delete().eq('id', id);
                setWorkouts(prev => prev.filter(w => w.id !== id));
              }
            } catch (err: any) {
              console.error('Delete error:', err);
              Alert.alert('Error', err.message || 'Failed to delete item');
            }
          }
        }
      ]
    );
  };

  const showItemOptions = (item: { id: string; title: string; type: 'workout' | 'collection' }) => {
    hapticImpactLight();
    Alert.alert(
      item.title,
      `Choose an action for this ${item.type}`,
      [
        {
          text: 'Open',
          onPress: () => {
            if (item.type === 'workout') router.push(`/workout/preview/${item.id}`);
            if (item.type === 'collection') router.push(`/collection/${item.id}`);
          }
        },
        {
          text: 'Share',
          onPress: () => {
            if (item.type === 'workout') {
              const w = workouts.find(x => x.id === item.id) || item;
              shareWorkout(w);
            }
          }
        },
        {
          text: `Delete ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}`,
          style: 'destructive',
          onPress: () => handleDelete(item.id, item.type)
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  // Filter workouts by search and active category tag
  const filteredWorkouts = workouts.filter((w, index) => {
    const matchesSearch = w.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedTag === 'All') return true;
    if (selectedTag === 'Recent') return true;
    const tag = getMuscleTag(w, index).toLowerCase();
    return tag.includes(selectedTag.toLowerCase()) || w.title.toLowerCase().includes(selectedTag.toLowerCase());
  });

  const filteredCollections = collections.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));

  // Render dummy cards when library is empty so it looks full & matches preview
  const displayWorkouts = filteredWorkouts.length > 0 ? filteredWorkouts : [
    {
      id: 'mock-1',
      title: 'One-Arm Dumbbell Row',
      source_type: 'Instagram',
      source_url: 'https://instagram.com',
      exercise_count: 1,
      target_muscle: 'Back',
    },
    {
      id: 'mock-2',
      title: 'Bigger Abs Workout',
      source_type: 'YouTube',
      source_url: 'https://youtube.com',
      exercise_count: 4,
      target_muscle: 'Abs',
    },
    {
      id: 'mock-3',
      title: 'CBUM Bigger Biceps',
      source_type: 'YouTube',
      source_url: 'https://youtube.com',
      exercise_count: 3,
      target_muscle: 'Arms',
    },
    {
      id: 'mock-4',
      title: 'Morning Belly Fat Burner',
      source_type: 'YouTube',
      source_url: 'https://youtube.com',
      exercise_count: 4,
      target_muscle: 'Core',
    },
  ];

  const workoutsCount = workouts.length > 0 ? workouts.length : 4;

  return (
    <SafeAreaView style={[s.safeArea, { backgroundColor: colors.background }]}>
      <View style={[s.container, { backgroundColor: colors.background }]}>
        
        {/* Top Header */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <TouchableOpacity 
              style={[s.iconBtn, isSearchActive && s.iconBtnActive]} 
              activeOpacity={0.8}
              onPress={() => setIsSearchActive(!isSearchActive)}
            >
              <Search size={20} color={colors.textPrimary} strokeWidth={2.2} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[s.iconBtn, isEditMode && s.iconBtnActive]} 
              activeOpacity={0.8}
              onPress={() => setIsEditMode(!isEditMode)}
            >
              <Edit3 size={18} color={isEditMode ? '#FF6422' : colors.textPrimary} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>
          
          <View style={s.headerRight}>
            <View style={s.proPill}>
              <Text style={s.proPillText}>PRO</Text>
            </View>

            <TouchableOpacity 
              style={s.avatarContainer} 
              activeOpacity={0.85}
              onPress={() => router.push('/settings')}
            >
              <View style={s.avatar}>
                <Text style={s.avatarText}>{userName}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar Input (toggled) */}
        {isSearchActive && (
          <View style={s.searchContainer}>
            <Search size={18} color={colors.textTertiary} />
            <TextInput
              style={s.searchInput}
              placeholder="Search library..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Tab Switcher: Workouts | Collections | Workout Plans */}
        <View style={s.tabsContainer}>
          <TouchableOpacity 
            style={s.tabBtn} 
            activeOpacity={0.8}
            onPress={() => setActiveTab('workouts')}
          >
            <Text style={[s.tabText, activeTab === 'workouts' && s.tabTextActive]}>Workouts</Text>
            {activeTab === 'workouts' && <View style={s.activeTabIndicator} />}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={s.tabBtn} 
            activeOpacity={0.8}
            onPress={() => setActiveTab('collections')}
          >
            <Text style={[s.tabText, activeTab === 'collections' && s.tabTextActive]}>Collections</Text>
            {activeTab === 'collections' && <View style={s.activeTabIndicator} />}
          </TouchableOpacity>
        </View>

        {/* Main Content Area */}
        <ScrollView 
          contentContainerStyle={s.contentScroll} 
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'workouts' && (
            <>
              {/* Section Header: e.g. "4 workouts" + "+ Import" Button */}
              <View style={s.workoutsTopRow}>
                <Text style={s.workoutsCountHeading}>
                  {workoutsCount} workouts
                </Text>

                <TouchableOpacity 
                  style={s.importCtaBtn} 
                  activeOpacity={0.88}
                  onPress={() => {
                    hapticImpactLight();
                    router.push('/importer');
                  }}
                >
                  <Text style={s.importCtaBtnText}>+ Import</Text>
                </TouchableOpacity>
              </View>

              {/* Filter Chips Carousel: All | Back | Arms | Abs | Recent */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.filterRow}
              >
                {FILTER_TAGS.map((tag) => {
                  const isSelected = selectedTag === tag;
                  return (
                    <TouchableOpacity
                      key={tag}
                      style={[s.filterChip, isSelected && s.filterChipSelected]}
                      activeOpacity={0.8}
                      onPress={() => {
                        hapticImpactLight();
                        setSelectedTag(tag);
                      }}
                    >
                      <Text style={[s.filterChipText, isSelected && s.filterChipTextSelected]}>
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* 2-Column Workout Cards Grid */}
              <View style={s.gridContainer}>
                {displayWorkouts.map((w, index) => {
                  const exerciseCount = Array.isArray(w.workout_exercises)
                    ? w.workout_exercises.length
                    : (w.exercise_count || 1);
                  const platform = getPlatformInfo(w);
                  const muscleTag = getMuscleTag(w, index);
                  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
                  const isMock = String(w.id).startsWith('mock-');

                  return (
                    <TouchableOpacity
                      key={w.id}
                      style={[
                        s.workoutCard, 
                        { width: cardWidth, backgroundColor: isDark ? gradient.bg : gradient.lightBg }
                      ]}
                      activeOpacity={0.88}
                      onPress={() => {
                        if (isEditMode && !isMock) {
                          handleDelete(w.id, 'workout');
                        } else if (!isMock) {
                          router.push(`/workout/preview/${w.id}`);
                        } else {
                          router.push('/importer');
                        }
                      }}
                      onLongPress={() => !isMock && showItemOptions({ id: w.id, title: w.title, type: 'workout' })}
                    >
                      {/* Thumbnail image if exists */}
                      {w.thumbnail_url && (
                        <Image source={{ uri: w.thumbnail_url }} style={s.workoutBgImage} resizeMode="cover" />
                      )}

                      {/* Smooth dark gradient scrim so white text is crystal clear without needing a background box */}
                      <LinearGradient
                        colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.2)', 'rgba(0, 0, 0, 0.88)']}
                        locations={[0, 0.45, 1]}
                        style={s.cardGradientOverlay}
                      />

                      {/* Card Top Row: Platform Badge + Edit delete btn */}
                      <View style={s.cardTopRow}>
                        <View style={s.platformPill}>
                          <View style={[s.platformDot, { backgroundColor: platform.dotColor }]} />
                          <Text style={s.platformText}>{platform.name}</Text>
                        </View>

                        {isEditMode && (
                          <TouchableOpacity
                            style={s.cardMoreBtn}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            onPress={() => {
                              if (!isMock) {
                                handleDelete(w.id, 'workout');
                              }
                            }}
                          >
                            <Trash2 size={15} color="#EF4444" />
                          </TouchableOpacity>
                        )}
                      </View>

                      {/* Card Bottom Content: Title + Muscle & Exercise Badges */}
                      <View style={s.cardBottom}>
                        <Text style={s.cardTitle} numberOfLines={2}>
                          {w.title}
                        </Text>

                        <View style={s.cardTagsRow}>
                          <View style={s.muscleBadge}>
                            <Text style={s.muscleBadgeText}>{muscleTag}</Text>
                          </View>

                          <View style={s.exerciseCountBadge}>
                            <Text style={s.exerciseCountText}>
                              {exerciseCount} exercise{exerciseCount > 1 ? 's' : ''}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Bottom Dashed "Import a workout" Banner Card */}
              <TouchableOpacity
                style={s.bottomImportBanner}
                activeOpacity={0.85}
                onPress={() => {
                  hapticImpactLight();
                  router.push('/importer');
                }}
              >
                <View style={s.bottomImportPlus}>
                  <Plus size={24} color="#FFFFFF" strokeWidth={3} />
                </View>
                <View style={s.bottomImportTextContainer}>
                  <Text style={s.bottomImportTitle}>Import a workout</Text>
                  <Text style={s.bottomImportSubtitle}>
                    Paste a link from Instagram or YouTube
                  </Text>
                </View>
              </TouchableOpacity>
            </>
          )}

          {/* Collections Tab */}
          {activeTab === 'collections' && (
            <View style={s.collectionsContainer}>
              {/* Header: e.g. "2 collections" + "+ New" Button */}
              <View style={s.workoutsTopRow}>
                <Text style={s.workoutsCountHeading}>
                  {collections.length > 0 ? `${collections.length} collections` : '2 collections'}
                </Text>

                <TouchableOpacity 
                  style={s.importCtaBtn} 
                  activeOpacity={0.88}
                  onPress={() => {
                    hapticImpactLight();
                    setCollectionModalVisible(true);
                  }}
                >
                  <Text style={s.importCtaBtnText}>+ New</Text>
                </TouchableOpacity>
              </View>

              {/* Collections Grid (2-column layout matching screenshot) */}
              <View style={s.collectionsGrid}>
                {(filteredCollections.length > 0 ? filteredCollections : [
                  { id: 'mock-c1', title: 'Biceps collection', count: 3, colors: ['#3A2C21', '#28323C', '#2A292E', '#3D2F45'] },
                  { id: 'mock-c2', title: 'Leg collection', count: 2, colors: ['#23342B', '#392C23', '#25262B', '#2C2B2D'] }
                ]).map((c: any, index: number) => {
                  const exerciseCount = c.collection_exercises?.length ?? c.count ?? 2;
                  const isMock = String(c.id).startsWith('mock-');
                  const quadColors = c.colors || (isDark ? [
                    ['#3A2C21', '#28323C', '#2A292E', '#3D2F45'],
                    ['#23342B', '#392C23', '#25262B', '#2C2B2D'],
                  ][index % 2] : [
                    ['#FFE5D3', '#E0EDFA', '#EFEBF5', '#FCE7F3'],
                    ['#DCFCE7', '#FEF3C7', '#F1F5F9', '#F3E8FF'],
                  ][index % 2]);

                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[s.collectionCard, { width: cardWidth }]}
                      activeOpacity={0.88}
                      onPress={() => {
                        if (isEditMode && !isMock) {
                          handleDelete(c.id, 'collection');
                        } else if (!isMock) {
                          router.push(`/collection/${c.id}`);
                        } else {
                          setCollectionModalVisible(true);
                        }
                      }}
                      onLongPress={() => !isMock && showItemOptions({ id: c.id, title: c.title, type: 'collection' })}
                    >
                      {/* 2x2 Quadrant Artwork Thumbnail Grid */}
                      <View style={s.collectionQuadGrid}>
                        <View style={[s.quadCell, { backgroundColor: quadColors[0] }]} />
                        <View style={[s.quadCell, { backgroundColor: quadColors[1] }]} />
                        <View style={[s.quadCell, { backgroundColor: quadColors[2] }]} />
                        <View style={[s.quadCell, { backgroundColor: quadColors[3] }]} />
                      </View>

                      {/* Collection Details Row */}
                      <View style={s.collectionCardBottom}>
                        <View style={{ flex: 1 }}>
                          <Text style={s.collectionCardTitle} numberOfLines={1}>
                            {c.title}
                          </Text>
                          <Text style={s.collectionCardCount}>
                            {exerciseCount} workout{exerciseCount === 1 ? '' : 's'}
                          </Text>
                        </View>

                        {isEditMode && (
                          <TouchableOpacity
                            style={s.cardMoreBtn}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            onPress={() => {
                              if (!isMock) {
                                handleDelete(c.id, 'collection');
                              }
                            }}
                          >
                            <Trash2 size={15} color="#EF4444" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}

                {/* Dashed "New collection" Card (same width as other cards) */}
                <TouchableOpacity
                  style={[s.newCollectionDashedCard, { width: cardWidth }]}
                  activeOpacity={0.85}
                  onPress={() => {
                    hapticImpactLight();
                    setCollectionModalVisible(true);
                  }}
                >
                  <View style={s.newCollectionFolderCircle}>
                    <FolderPlus size={22} color="#FFFFFF" strokeWidth={2.5} />
                  </View>
                  <Text style={s.newCollectionDashedTitle}>New collection</Text>
                </TouchableOpacity>
              </View>

              {/* QUICK START SECTION */}
              <View style={s.quickStartSection}>
                <Text style={s.quickStartHeading}>QUICK START</Text>
                <View style={s.quickStartChipsRow}>
                  {['+ Push', '+ Pull', '+ Core', '+ Full body'].map((pillText) => (
                    <TouchableOpacity
                      key={pillText}
                      style={s.quickStartChip}
                      activeOpacity={0.8}
                      onPress={async () => {
                        hapticImpactLight();
                        const title = pillText.replace('+ ', '');
                        try {
                          const { data: { user } } = await supabase.auth.getUser();
                          if (!user) return;
                          const { data, error } = await supabase
                            .from('collections')
                            .insert([{ title, user_id: user.id }])
                            .select();
                          if (!error && data && data.length > 0) {
                            setCollections(prev => [data[0], ...prev]);
                          }
                        } catch (e) {
                          console.warn(e);
                        }
                      }}
                    >
                      <Text style={s.quickStartChipText}>{pillText}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Modal: Create Collection */}
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
              placeholderTextColor="#8A8A93"
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

const makeStyles = (
  colors: ReturnType<typeof import('../../contexts/ThemeContext').useTheme>['colors'],
  isDark: boolean
) => StyleSheet.create({
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: isDark ? '#18181B' : colors.card,
    borderWidth: 1,
    borderColor: isDark ? '#27272A' : colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnActive: {
    backgroundColor: isDark ? '#272320' : '#FFF0E6',
    borderColor: isDark ? '#FF6422' : '#FFD5C0',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  proPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: isDark ? 'rgba(229, 165, 68, 0.15)' : 'rgba(229, 165, 68, 0.15)',
  },
  proPillText: {
    fontSize: 13,
    fontWeight: '800',
    color: isDark ? '#E5A544' : '#C27803',
    letterSpacing: 1,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: isDark ? '#1E1E22' : colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: isDark ? '#D49B45' : '#E0A13C',
  },
  avatarText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Search input
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: 0,
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    marginTop: 6,
  },
  tabBtn: {
    paddingVertical: 14,
    marginRight: 22,
    position: 'relative',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.textPrimary,
    fontWeight: '800',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.accent,
    borderRadius: 2,
  },

  contentScroll: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 110,
  },

  // Top Section: Count + "+ Import" Button
  workoutsTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  workoutsCountHeading: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  importCtaBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  importCtaBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Filter Row
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  filterChipSelected: {
    backgroundColor: isDark ? '#FFFFFF' : '#1B1612',
    borderColor: isDark ? '#FFFFFF' : '#1B1612',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  filterChipTextSelected: {
    color: isDark ? '#000000' : '#FFFFFF',
    fontWeight: '800',
  },

  // Grid
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  workoutCard: {
    height: 190,
    borderRadius: 24,
    padding: 14,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: isDark ? '#26262B' : colors.cardBorder,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.2 : 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  workoutBgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 1,
  },
  cardGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  platformPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  platformDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  platformText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardMoreBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  cardBottom: {
    zIndex: 2,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 21,
    letterSpacing: -0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  muscleBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  muscleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  exerciseCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  exerciseCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Bottom Import Dashed Banner
  bottomImportBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.accent,
    borderStyle: 'dashed',
    backgroundColor: isDark ? '#1A1513' : '#FFF7F2',
    padding: 16,
    gap: 14,
  },
  bottomImportPlus: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomImportTextContainer: {
    flex: 1,
  },
  bottomImportTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  bottomImportSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },

  // Collections & Plans
  collectionsContainer: {
    paddingTop: 4,
  },
  collectionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  collectionCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.2 : 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  collectionQuadGrid: {
    width: '100%',
    aspectRatio: 1.15,
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    backgroundColor: colors.surfaceAlt,
  },
  quadCell: {
    width: '50%',
    height: '50%',
  },
  collectionCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    paddingBottom: 2,
  },
  collectionCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  collectionCardCount: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },

  // Dashed "New collection" Card
  newCollectionDashedCard: {
    aspectRatio: 0.95,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.accent,
    borderStyle: 'dashed',
    backgroundColor: isDark ? '#171412' : '#FFF7F2',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  newCollectionFolderCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  newCollectionDashedTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },

  // Quick Start Section
  quickStartSection: {
    marginTop: 4,
    paddingBottom: 20,
  },
  quickStartHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 1.2,
    marginBottom: 14,
  },
  quickStartChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickStartChip: {
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  quickStartChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  emptyCollectionsNote: {
    fontSize: 13,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  modalInput: {
    height: 48,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.cardBorder,
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
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modalCreateBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  modalCreateText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
