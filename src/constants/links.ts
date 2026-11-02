import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Linking as RNLinking, Alert } from 'react-native';

export const APP_LINKS = {
  DOMAIN: 'freakyfit.truemindlabs.com',
  WEBSITE: 'https://freakyfit.truemindlabs.com',
  PRIVACY_POLICY: 'https://freakyfit.truemindlabs.com/privacy',
  TERMS_OF_SERVICE: 'https://freakyfit.truemindlabs.com/terms',
  SUPPORT_EMAIL: 'support@truemindlabs.com',
  APP_STORE: 'https://apps.apple.com/us/app/freakyfit-workout-organizer/id6756478119',
  PLAY_STORE: 'https://play.google.com/store/apps/details?id=com.freakyfit.app',
};

/**
 * Opens an external web URL inside an in-app browser or the system browser,
 * with comprehensive fallback across expo-web-browser, expo-linking, and RN linking.
 */
export const openWebUrl = async (url: string): Promise<void> => {
  if (!url) return;
  const cleanUrl = url.trim();

  // 1. Try Expo Linking (opens default browser directly without CustomTabs dependency)
  try {
    const canOpen = await Linking.canOpenURL(cleanUrl).catch(() => false);
    if (canOpen) {
      await Linking.openURL(cleanUrl);
      return;
    }
  } catch (err) {
    console.log('[openWebUrl] Linking.canOpenURL bypassed:', err);
  }

  // 2. Direct RN Linking attempt
  try {
    await RNLinking.openURL(cleanUrl);
    return;
  } catch (rnErr) {
    console.log('[openWebUrl] RNLinking.openURL failed, trying WebBrowser:', rnErr);
  }

  // 3. Fallback to WebBrowser (Chrome Custom Tabs / Safari)
  try {
    await WebBrowser.openBrowserAsync(cleanUrl);
    return;
  } catch (browserErr) {
    console.error('[openWebUrl] Failed to open URL with all mechanisms:', cleanUrl, browserErr);
    Alert.alert(
      'Unable to Open Link',
      `Could not open the link:\n\n${cleanUrl}\n\nPlease ensure a web browser is installed on your device.`
    );
  }
};

