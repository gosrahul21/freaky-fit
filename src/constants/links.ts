import * as WebBrowser from 'expo-web-browser';
import { Linking } from 'react-native';

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
 * Opens an external web URL inside an in-app browser with full-screen presentation,
 * falling back to the system browser if unavailable.
 */
export const openWebUrl = async (url: string): Promise<void> => {
  try {
    await WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      enableBarCollapsing: true,
      toolbarColor: '#0A0A0A',
    });
  } catch {
    try {
      await Linking.openURL(url);
    } catch (err) {
      console.warn('Failed to open URL:', url, err);
    }
  }
};
