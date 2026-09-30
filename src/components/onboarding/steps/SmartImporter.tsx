import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import { Header } from '../Header';
import { ContinueButton } from '../ContinueButton';

const SOURCES = [
  {
    id: 'social_media',
    title: 'Social media',
    subtitle: 'Import directly via share sheet or copied link',
    icon: null,
    badges: [
      { text: 'TikTok', bg: '#F5F5F5', color: '#404040' },
      { text: 'Reels', bg: '#FDF2F8', color: '#DB2777' },
      { text: 'YouTube', bg: '#FEF2F2', color: '#DC2626' },
      { text: 'Reddit', bg: '#FFF7ED', color: '#EA580C' },
    ],
    topBadge: 'Fast Sync',
  },
  {
    id: 'websites_blogs',
    title: 'Websites & blogs',
    subtitle: 'Articles, workout routines & bodybuilding guides',
    icon: '🌐',
    bottomBadge: { text: 'Web clipper enabled', color: '#0284C7' },
    iconBg: '#F0F9FF',
  },
  {
    id: 'coach',
    title: 'Personal trainer or coach',
    subtitle: 'PDFs, spreadsheets, WhatsApp messages & notes',
    icon: '📋',
    iconBg: '#ECFDF5',
  },
  {
    id: 'another_app',
    title: 'Another fitness app',
    subtitle: 'Hevy, Strong, Nike Training Club, Apple Fitness',
    icon: '📱',
    bottomBadge: { text: 'Auto-migrator', color: '#6D28D9', bg: '#F3E8FF' },
    iconBg: '#F5F3FF',
  },
  {
    id: 'screenshots',
    title: 'Saved camera roll / Screenshots',
    subtitle: 'Exercise screenshots & gym whiteboard photos',
    icon: '📸',
    bottomBadge: { text: 'OCR Text Scanner', color: '#B45309' },
    iconBg: '#FFFBEB',
  },
  {
    id: 'somewhere_else',
    title: 'Somewhere else',
    subtitle: 'Paper notebooks, custom memory routines, or AI builder',
    icon: '✨',
    iconBg: '#FFF7ED',
  },
];

export function SmartImporter({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const [selected, setSelected] = useState<string[]>(['social_media', 'websites_blogs']);

  const toggleSelection = (id: string) => {
    setSelected((prev) => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const getContinueText = () => {
    if (selected.length === 0) return 'Select at least 1';
    return `Continue (${selected.length} selected)`;
  };

  return (
    <View style={styles.container}>
      <Header currentStep={2} onBack={onBack} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>✨ Smart Importer</Text>
          </View>
          <Text style={styles.headline}>
            Where do you get your workouts from?
          </Text>
          {/* <Text style={styles.subtitle}>
            Select all that apply — we'll set up your one-tap import presets.
          </Text> */}
        </View>

        <View style={styles.optionsList}>
          {SOURCES.map((source) => {
            const isSelected = selected.includes(source.id);
            return (
              <TouchableOpacity
                key={source.id}
                activeOpacity={0.8}
                onPress={() => toggleSelection(source.id)}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected
                ]}
              >
                <View style={styles.cardContent}>
                  {source.icon && (
                    <View style={[styles.iconContainer, { backgroundColor: source.iconBg }]}>
                      <Text style={styles.iconText}>{source.icon}</Text>
                    </View>
                  )}
                  
                  <View style={styles.textContent}>
                    <View style={styles.titleRow}>
                      <Text style={styles.cardTitle}>{source.title}</Text>
                      {source.topBadge && (
                        <View style={styles.topBadge}>
                          <Text style={styles.topBadgeText}>{source.topBadge}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.cardSubtitle}>{source.subtitle}</Text>
                    
                    {source.badges && (
                      <View style={styles.badgesRow}>
                        {source.badges.map((badge, idx) => (
                          <View key={idx} style={[styles.badge, { backgroundColor: badge.bg }]}>
                            <Text style={[styles.badgeText, { color: badge.color }]}>{badge.text}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    
                    {source.bottomBadge && (
                      <View style={[styles.bottomBadge, source.bottomBadge.bg && { backgroundColor: source.bottomBadge.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, alignSelf: 'flex-start', marginTop: 8 }]}>
                        <Text style={[styles.bottomBadgeText, { color: source.bottomBadge.color }]}>
                          {source.bottomBadge.text}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <ContinueButton 
        label={getContinueText()}
        onPress={onNext} 
        disabled={selected.length === 0}
        style={styles.continueBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
  },
  headerSection: {
    marginBottom: 24,
  },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    marginBottom: 8,
  },
  tagText: {
    color: '#EA5300',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headline: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0A0A0A',
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    lineHeight: 20,
  },
  optionsList: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  optionCardSelected: {
    borderColor: '#ff5e00',
    backgroundColor: '#FFFFFF',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  textContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A0A0A',
  },
  topBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  topBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#525252',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 18,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  bottomBadge: {
    marginTop: 8,
  },
  bottomBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D4D4D8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxSelected: {
    backgroundColor: '#ff5e00',
    borderColor: '#ff5e00',
  },
  continueBtn: {
    backgroundColor: '#ff5e00',
  }
});
