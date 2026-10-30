import { Tabs, usePathname, useRouter } from 'expo-router';
import { Bookmark, CalendarDays, Flame, Home as HomeIcon, Plus } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { hapticImpactLight } from '../../utils/haptics';

export default function TabsLayout() {
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const router = useRouter();
  const pathname = usePathname();

  return (
    <>
      <Tabs screenOptions={{ headerShown: false }} tabBar={() => null}>
        <Tabs.Screen name="home" />
        <Tabs.Screen name="library" />
        <Tabs.Screen name="streaks" />
        <Tabs.Screen name="plans" />
        <Tabs.Screen name="explore" />
      </Tabs>

      {/* Bottom Navigation Bar */}
      <View style={s.bottomNav}>
        <TouchableOpacity style={s.navItem} onPress={() => { hapticImpactLight(); router.replace('/home') }}>
          <HomeIcon size={20} color={pathname === '/home' ? colors.accent : colors.textTertiary} strokeWidth={2.5} />
          <Text style={[s.navLabel, pathname === '/home' && s.navLabelActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.navItem} onPress={() => { hapticImpactLight(); router.replace('/library') }}>
          <Bookmark size={20} color={pathname === '/library' ? colors.accent : colors.textTertiary} strokeWidth={2} />
          <Text style={[s.navLabel, pathname === '/library' && s.navLabelActive]}>Library</Text>
        </TouchableOpacity>

        <View style={s.centerAddBtnWrapper}>
          <TouchableOpacity
            style={s.centerAddBtn}
            activeOpacity={0.8}
            onPress={() => { hapticImpactLight(); router.push('/importer'); }}
          >
            <Plus size={28} color={colors.accent} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.navItem} onPress={() => { hapticImpactLight(); router.replace('/plans') }}>
          <CalendarDays size={20} color={pathname === '/plans' ? colors.accent : colors.textTertiary} strokeWidth={2} />
          <Text style={[s.navLabel, pathname === '/plans' && s.navLabelActive]}>Plans</Text>
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
});
