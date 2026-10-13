import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

let isConfiguring = false;

/**
 * Initializes RevenueCat if not already configured.
 */
export async function initPurchases(): Promise<boolean> {
  try {
    const configured = await Purchases.isConfigured();
    if (configured) return true;
    if (isConfiguring) return false;
    isConfiguring = true;

    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    const iosApiKey = process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY || '';
    const androidApiKey = process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY || '';
    const isExpoGo =
      Constants.appOwnership === 'expo' ||
      Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

    if (isExpoGo) {
      const testKey =
        (iosApiKey.startsWith('test_') ? iosApiKey : '') ||
        (androidApiKey.startsWith('test_') ? androidApiKey : '');

      if (testKey) {
        Purchases.configure({ apiKey: testKey });
        return true;
      } else {
        console.warn(
          '[RevenueCat] Running in Expo Go requires a Test Store key (starts with test_).'
        );
        return false;
      }
    } else {
      const key = Platform.OS === 'ios' ? iosApiKey : androidApiKey;
      if (key) {
        Purchases.configure({ apiKey: key });
        return true;
      }
    }
    return false;
  } catch (error) {
    console.warn('[RevenueCat] Purchases.configure failed:', error);
    return false;
  } finally {
    isConfiguring = false;
  }
}

/**
 * Syncs the authenticated Supabase user ID with RevenueCat.
 */
export async function syncPurchasesUser(userId?: string): Promise<void> {
  try {
    if (!userId) return;
    await initPurchases();
    const configured = await Purchases.isConfigured();
    if (!configured) return;
    await Purchases.logIn(userId);
  } catch (error) {
    console.warn('[RevenueCat] syncPurchasesUser failed:', error);
  }
}

/**
 * Checks whether the current user has an active Pro subscription or free trial.
 * In RevenueCat, active free trials are included in `customerInfo.entitlements.active`.
 */
export async function checkIsPro(userId?: string): Promise<boolean> {
  try {
    await initPurchases();
    const configured = await Purchases.isConfigured();
    if (!configured) {
      console.warn('[RevenueCat] Not configured, assuming non-pro');
      return false;
    }

    if (userId) {
      await syncPurchasesUser(userId);
    }

    const customerInfo = await Purchases.getCustomerInfo();
    const activeEntitlements = Object.keys(customerInfo.entitlements.active);
    return activeEntitlements.length > 0;
  } catch (error) {
    console.warn('[RevenueCat] checkIsPro error:', error);
    return false;
  }
}

/**
 * Restores purchases for the user (e.g. after reinstalling the app).
 */
export async function restorePurchases(): Promise<boolean> {
  try {
    await initPurchases();
    const configured = await Purchases.isConfigured();
    if (!configured) {
      throw new Error('Billing is not configured on this device.');
    }
    const customerInfo = await Purchases.restorePurchases();
    return Object.keys(customerInfo.entitlements.active).length > 0;
  } catch (error) {
    console.warn('[RevenueCat] restorePurchases failed:', error);
    throw error;
  }
}

/**
 * Logs out the user from RevenueCat on sign out.
 */
export async function logoutPurchases(): Promise<void> {
  try {
    const configured = await Purchases.isConfigured();
    if (configured) {
      await Purchases.logOut();
    }
  } catch (error) {
    console.warn('[RevenueCat] logoutPurchases failed:', error);
  }
}
