import os
import re

files_to_fix = [
    'src/app/(tabs)/home.tsx',
    'src/app/(tabs)/plans.tsx',
    'src/app/(tabs)/streaks.tsx',
    'src/app/(tabs)/library.tsx'
]

# Create _layout.tsx template (leaving out the huge stylesheet for now, we'll append it)
layout_template = """import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Tabs, useRouter, usePathname } from 'expo-router';
import { Home as HomeIcon, CalendarDays, Bookmark, Flame, Plus, Download, FolderPlus, CalendarPlus } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function TabsLayout() {
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const router = useRouter();
  const pathname = usePathname();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <>
      <Tabs screenOptions={{ headerShown: false }} tabBar={() => null}>
        <Tabs.Screen name="home" />
        <Tabs.Screen name="plans" />
        <Tabs.Screen name="streaks" />
        <Tabs.Screen name="library" />
      </Tabs>

      {/* Bottom Navigation Bar */}
      <View style={s.bottomNav}>
        <TouchableOpacity style={s.navItem} onPress={() => router.replace('/home')}>
          <HomeIcon size={20} color={pathname === '/home' ? colors.accent : colors.textTertiary} strokeWidth={2.5} />
          <Text style={[s.navLabel, pathname === '/home' && s.navLabelActive]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={s.navItem} onPress={() => router.replace('/plans')}>
          <CalendarDays size={20} color={pathname === '/plans' ? colors.accent : colors.textTertiary} strokeWidth={2} />
          <Text style={[s.navLabel, pathname === '/plans' && s.navLabelActive]}>Plans</Text>
        </TouchableOpacity>

        <View style={s.centerAddBtnWrapper}>
          <TouchableOpacity 
            style={s.centerAddBtn} 
            activeOpacity={0.8}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={28} color={colors.accent} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.navItem} onPress={() => router.replace('/library')}>
          <Bookmark size={20} color={pathname === '/library' ? colors.accent : colors.textTertiary} strokeWidth={2} />
          <Text style={[s.navLabel, pathname === '/library' && s.navLabelActive]}>Library</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={s.navItem} onPress={() => router.replace('/streaks')}>
          <Flame size={20} color={pathname === '/streaks' ? colors.accent : colors.textTertiary} strokeWidth={2} />
          <Text style={[s.navLabel, pathname === '/streaks' && s.navLabelActive]}>Streaks</Text>
        </TouchableOpacity>
      </View>

      {/* iOS Home Indicator Space */}
      <View style={s.homeIndicatorSpace}>
        <View style={s.homeIndicator} />
      </View>

      {/* Quick Add Bottom Sheet Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <Pressable style={s.modalBackdrop} onPress={() => setShowAddModal(false)}>
          <Pressable style={s.bottomSheet} onPress={(e) => e.stopPropagation()}>
            <View style={s.dragHandleContainer}>
              <View style={s.dragHandle} />
            </View>
            
            <Text style={s.sheetTitle}>What would you like to add?</Text>
            
            <View style={s.sheetOptionsContainer}>
              {/* Option 1 */}
              <TouchableOpacity style={s.sheetOption} activeOpacity={0.7} onPress={() => setShowAddModal(false)}>
                <View style={s.sheetOptionIcon}>
                  <Download size={24} color={colors.textPrimary} strokeWidth={2.2} />
                </View>
                <View style={s.sheetOptionTextContainer}>
                  <Text style={s.sheetOptionTitle}>Import a Workout</Text>
                  <Text style={s.sheetOptionDesc}>From a URL, photo, or paste text</Text>
                </View>
              </TouchableOpacity>

              {/* Option 2 */}
              <TouchableOpacity style={s.sheetOption} activeOpacity={0.7} onPress={() => setShowAddModal(false)}>
                <View style={s.sheetOptionIcon}>
                  <FolderPlus size={24} color={colors.textPrimary} strokeWidth={2} />
                </View>
                <View style={s.sheetOptionTextContainer}>
                  <Text style={s.sheetOptionTitle}>Create a Collection</Text>
                  <Text style={s.sheetOptionDesc}>Organise your workouts into collections</Text>
                </View>
              </TouchableOpacity>

              {/* Option 3 */}
              <TouchableOpacity style={s.sheetOption} activeOpacity={0.7} onPress={() => setShowAddModal(false)}>
                <View style={s.sheetOptionIcon}>
                  <CalendarPlus size={24} color={colors.textPrimary} strokeWidth={2.2} />
                </View>
                <View style={s.sheetOptionTextContainer}>
                  <Text style={s.sheetOptionTitle}>Create workout plan</Text>
                  <Text style={s.sheetOptionDesc}>Build a personal day-based plan</Text>
                </View>
              </TouchableOpacity>
            </View>
            
            <View style={s.homeIndicatorSpaceSheet}>
              <View style={s.homeIndicator} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
"""

def extract_styles(content):
    match = re.search(r'  bottomNav: \{(.*)', content, re.DOTALL)
    if match:
        return '  bottomNav: {' + match.group(1)
    return None

for file in files_to_fix:
    with open(file, 'r') as f:
        content = f.read()

    # 1. Update relative path for ThemeContext
    content = content.replace("'../contexts/ThemeContext'", "'../../contexts/ThemeContext'")
    
    # Extract styles from home.tsx to put in _layout.tsx
    if 'home.tsx' in file:
        styles = extract_styles(content)
        if styles:
            with open('src/app/(tabs)/_layout.tsx', 'w') as f_out:
                f_out.write(layout_template + styles)

    # 2. Remove bottomNav and modals in TSX structure
    # This regex removes everything from {/* Bottom Navigation Bar */} to the end of the View right before </SafeAreaView>
    # Actually, let's use a simpler approach. We know it ends just before </SafeAreaView>
    content = re.sub(r'\{/\* Bottom Navigation Bar \*/\}.*?</SafeAreaView>', '</SafeAreaView>', content, flags=re.DOTALL)

    # In home.tsx, there's also the feedback float btn and tooltip that can remain, but Quick Add modal needs removal if it's caught
    content = re.sub(r'\{/\* Quick Add Bottom Sheet Modal \*/\}.*?</Modal>', '', content, flags=re.DOTALL)

    # 3. Remove styles from bottomNav onwards
    content = re.sub(r',\s*bottomNav: \{.*\}\);', '});', content, flags=re.DOTALL)

    with open(file, 'w') as f:
        f.write(content)

print("Refactor complete.")
