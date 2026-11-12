import { getShareExtensionKey } from 'expo-share-intent';

/**
 * Intercepts iOS Share Extension deep links (`freakyfit://dataUrl=freakyfitShareKey`)
 * so Expo Router doesn't treat them as unmatched routes.
 */
export function redirectSystemPath({
  path,
  initial,
}: {
  path: string;
  initial: boolean;
}): string | null {
  try {
    const shareKey = getShareExtensionKey();
    if (path.includes(`dataUrl=${shareKey}`)) {
      return initial ? '/' : null;
    }
    return path;
  } catch {
    return '/';
  }
}

