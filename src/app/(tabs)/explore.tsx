import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Search, Filter, Play, Plus, Dumbbell } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { hapticSelection } from '../../utils/haptics';

// Mock data
const EXERCISES = [
  { id: '1', name: 'Barbell Bench Press', muscle: 'Chest', equipment: 'Barbell' },
  { id: '2', name: 'Incline Dumbbell Press', muscle: 'Chest', equipment: 'Dumbbell' },
  { id: '3', name: 'Cable Crossover', muscle: 'Chest', equipment: 'Cable' },
  { id: '4', name: 'Pull-up', muscle: 'Back', equipment: 'Bodyweight' },
  { id: '5', name: 'Barbell Squat', muscle: 'Legs', equipment: 'Barbell' },
];

const MUSCLES = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

export default function ExploreScreen() {
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const [search, setSearch] = useState('');
  const [activeMuscle, setActiveMuscle] = useState('All');

  const filtered = EXERCISES.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) && 
    (activeMuscle === 'All' || e.muscle === activeMuscle)
  );

  return (
    <SafeAreaView style={[s.safeArea, { backgroundColor: colors.background }]}>
      <View style={s.container}>
        
        {/* Header */}
        <View style={s.header}>
          <Text style={s.headerTitle}>EXERCISES</Text>
        </View>

        {/* Search Bar */}
        <View style={s.searchContainer}>
          <View style={s.searchBox}>
            <Search size={20} color={colors.textTertiary} />
            <TextInput 
              style={s.searchInput}
              placeholder="Search exercises..."
              placeholderTextColor={colors.textTertiary}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity style={s.filterBtn}>
            <Filter size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Muscle Filters */}
        <View style={s.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filtersScroll}>
            {MUSCLES.map(m => (
              <TouchableOpacity 
                key={m} 
                style={[s.filterChip, activeMuscle === m && s.filterChipActive]}
                onPress={() => { hapticSelection(); setActiveMuscle(m); }}
              >
                <Text style={[s.filterChipText, activeMuscle === m && s.filterChipTextActive]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* List */}
        <ScrollView style={s.listContainer} contentContainerStyle={s.listContent}>
          {filtered.map(ex => (
            <TouchableOpacity key={ex.id} style={s.exerciseCard} activeOpacity={0.8}>
              <View style={s.exImagePlaceholder}>
                <Dumbbell size={24} color={colors.textTertiary} />
              </View>
              <View style={s.exInfo}>
                <Text style={s.exName}>{ex.name}</Text>
                <Text style={s.exMeta}>{ex.muscle} • {ex.equipment}</Text>
              </View>
              <TouchableOpacity style={s.exAddBtn}>
                <Plus size={20} color={colors.accent} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colors.textPrimary,
  },
  filterBtn: {
    width: 44,
    height: 44,
    backgroundColor: colors.card,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  filterChipActive: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.background,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  exImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.skeleton,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  exInfo: {
    flex: 1,
  },
  exName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  exMeta: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  exAddBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
