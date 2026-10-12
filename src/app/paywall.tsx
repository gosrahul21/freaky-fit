import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, Star, Zap } from 'lucide-react-native';
import { hapticImpactLight } from '../utils/haptics';
import Purchases, { PurchasesPackage } from 'react-native-purchases';

const { width } = Dimensions.get('window');

export default function PaywallScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    const fetchOfferings = async () => {
      try {
        const offerings = await Purchases.getOfferings();
        console.log("REVENUECAT OFFERINGS RESPONSE:", JSON.stringify(offerings, null, 2));
        
        if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
          setPackages(offerings.current.availablePackages);
          setSelectedPackage(offerings.current.availablePackages[0]);
        }
      } catch (e) {
        console.error("Error fetching offerings", e);
      } finally {
        setIsFetching(false);
      }
    };
    fetchOfferings();
  }, []);

  const handleSubscribe = async () => {
    hapticImpactLight();
    
    // Fallback if packages aren't loaded or configured yet
    if (!selectedPackage) {
      Alert.alert("Setup Incomplete", "Please configure RevenueCat products first.");
      return;
    }

    try {
      setIsPurchasing(true);
      const { customerInfo } = await Purchases.purchasePackage(selectedPackage);
      
      // Check if user got the entitlement (we assume the entitlement ID is 'pro' or 'Premium' in RevenueCat dashboard)
      // Usually you unlock the app if object has keys
      if (Object.keys(customerInfo.entitlements.active).length > 0) {
        router.replace('/welcome');
      }
    } catch (e: any) {
      if (!e.userCancelled) {
        Alert.alert("Purchase Error", e.message);
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          {/* Hard Paywall: Skip button removed */}
        </View>

        <View style={styles.content}>
          <View style={styles.badge}>
            <Star size={16} color="#FFFFFF" fill="#FFFFFF" />
          </View>
          <Text style={styles.title}>Unlock FreakyFit Pro</Text>
          <Text style={styles.subtitle}>
            Get full access to AI workout generation, premium plans, and advanced tracking.
          </Text>

          <View style={styles.features}>
            <FeatureItem text="Unlimited AI workout extraction" colors={colors} />
            <FeatureItem text="Advanced progress analytics" colors={colors} />
            <FeatureItem text="Custom workout programs" colors={colors} />
            <FeatureItem text="Priority support" colors={colors} />
          </View>
        </View>

        <View style={styles.footer}>
          {isFetching ? (
            <ActivityIndicator size="large" color={colors.accent} style={{ marginBottom: 24 }} />
          ) : (
            <>
              {packages.length > 0 && (
                <View style={styles.packageList}>
                  {packages.map((pkg) => {
                    const isSelected = selectedPackage?.identifier === pkg.identifier;
                    const isAnnual = pkg.packageType === 'ANNUAL';
                    return (
                      <TouchableOpacity 
                        key={pkg.identifier}
                        style={[
                          styles.packageCard, 
                          isSelected && { borderColor: colors.accent, borderWidth: 2, backgroundColor: colors.accent + '10' }
                        ]}
                        onPress={() => setSelectedPackage(pkg)}
                      >
                        {isAnnual && (
                          <View style={[styles.saveBadge, { backgroundColor: colors.accent }]}>
                            <Text style={styles.saveBadgeText}>SAVE 50%</Text>
                          </View>
                        )}
                        <Text style={[styles.packageTitle, isSelected && { color: colors.accent }]}>
                           {isAnnual ? 'Annual' : pkg.packageType === 'MONTHLY' ? 'Monthly' : pkg.identifier}
                        </Text>
                        <Text style={styles.packagePrice}>{pkg.product.priceString}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              <TouchableOpacity 
                style={[styles.subscribeBtn, { backgroundColor: colors.accent }]} 
                onPress={handleSubscribe}
                activeOpacity={0.9}
                disabled={isPurchasing || !selectedPackage}
              >
                {isPurchasing ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Zap size={20} color="#FFFFFF" fill="#FFFFFF" />
                    <Text style={styles.subscribeText}>
                      {selectedPackage?.product.introPrice ? `Start ${selectedPackage.product.introPrice.periodNumberOfUnits}-Day Free Trial` : 'Start Plan'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              <Text style={styles.footerText}>
                {selectedPackage ? `Then ${selectedPackage.product.priceString}. Cancel anytime.` : 'Cancel anytime.'}
              </Text>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

function FeatureItem({ text, colors }: { text: string, colors: any }) {
  const styles = makeStyles(colors);
  return (
    <View style={styles.featureItem}>
      <View style={[styles.checkCircle, { backgroundColor: colors.accent + '20' }]}>
        <Check size={14} color={colors.accent} strokeWidth={3} />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 16,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94A3B8',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ff5e00',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#ff5e00',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  features: {
    width: '100%',
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  footer: {
    width: '100%',
  },
  subscribeBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 32,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 16,
  },
  subscribeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  packageList: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
    width: '100%',
  },
  packageCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    backgroundColor: colors.surface,
    position: 'relative',
  },
  packageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  packagePrice: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  saveBadge: {
    position: 'absolute',
    top: -10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  saveBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  }
});
