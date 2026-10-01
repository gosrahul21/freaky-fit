import { Tabs, usePathname, useRouter } from 'expo-router';
import { Bookmark, CalendarDays, CalendarPlus, Download, Flame, FolderPlus, Home as HomeIcon, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { hapticImpactLight } from '../../utils/haptics';

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
        <Tabs.Screen name="explore" />
      </Tabs>

      {/* Bottom Navigation Bar */}
      <View style={s.bottomNav}>
        <TouchableOpacity style={s.navItem} onPress={() => { hapticImpactLight(); router.replace('/home') }}>
          <HomeIcon size={20} color={pathname === '/home' ? colors.accent : colors.textTertiary} strokeWidth={2.5} />
          <Text style={[s.navLabel, pathname === '/home' && s.navLabelActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.navItem} onPress={() => { hapticImpactLight(); router.replace('/plans') }}>
          <CalendarDays size={20} color={pathname === '/plans' ? colors.accent : colors.textTertiary} strokeWidth={2} />
          <Text style={[s.navLabel, pathname === '/plans' && s.navLabelActive]}>Plans</Text>
        </TouchableOpacity>

        <View style={s.centerAddBtnWrapper}>
          <TouchableOpacity
            style={s.centerAddBtn}
            activeOpacity={0.8}
            onPress={() => { hapticImpactLight(); setShowAddModal(true); }}
          >
            <Plus size={28} color={colors.accent} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.navItem} onPress={() => { hapticImpactLight(); router.replace('/library') }}>
          <Bookmark size={20} color={pathname === '/library' ? colors.accent : colors.textTertiary} strokeWidth={2} />
          <Text style={[s.navLabel, pathname === '/library' && s.navLabelActive]}>Library</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.navItem} onPress={() => { hapticImpactLight(); router.replace('/streaks') }}>
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
              <TouchableOpacity style={s.sheetOption} activeOpacity={0.7} onPress={() => { setShowAddModal(false); router.push('/importer'); }}>
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
              <TouchableOpacity style={s.sheetOption} activeOpacity={0.7} onPress={() => { setShowAddModal(false); router.push('/plan-builder'); }}>
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
  bottomNav: {
    position: 'absolute',
    bottom: 24, // adjust for safe area manually since we're using absolute
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
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
    color: colors.textTertiary,
  },
  navLabelActive: {
    color: colors.accent,
  },
  centerAddBtnWrapper: {
    position: 'relative',
    top: -20,
  },
  centerAddBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.skeleton,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  homeIndicatorSpace: {
    height: 24,
    backgroundColor: colors.card,
  },
  homeIndicator: {
    width: 120,
    height: 4,
    backgroundColor: colors.cardBorder,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
  },
  feedbackTooltip: {
    position: 'absolute',
    bottom: 110,
    left: 16,
    right: 16,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
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
    backgroundColor: colors.skeleton,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipTextContent: {
    flex: 1,
  },
  tooltipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  tooltipDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  tooltipCloseBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.skeleton,
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
    borderTopColor: colors.cardBorder,
  },
  tooltipStepText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textTertiary,
  },
  tooltipNextText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: colors.card,
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
    backgroundColor: colors.cardBorder,
    borderRadius: 2,
  },
  sheetTitle: {
    fontSize: 23,
    fontWeight: '900',
    color: colors.textPrimary,
    marginTop: 4,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  sheetOptionsContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
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
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  sheetOptionDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  homeIndicatorSpaceSheet: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 24,
  }
});
