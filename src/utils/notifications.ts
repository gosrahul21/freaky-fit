import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import Constants from 'expo-constants';

// Configure foreground notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification! Please enable in Settings.');
      return null;
    }
    
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      
      token = (await Notifications.getExpoPushTokenAsync({
        projectId,
      })).data;
      
      // Save token to supabase profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user && token) {
        await supabase.from('profiles').update({ push_token: token }).eq('id', user.id);
      }
    } catch (e) {
      console.error("Error getting push token: ", e);
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}
