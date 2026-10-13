import PostHog from 'posthog-react-native';

const apiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY || 'YOUR_POSTHOG_API_KEY';
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

export const posthog = new PostHog(apiKey, {
  host,
  disabled: apiKey === 'YOUR_POSTHOG_API_KEY' || !apiKey,
});
