export const BACKEND_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://video-extractor-qjgr.onrender.com';

let lastPingTime = 0;
const MIN_PING_INTERVAL_MS = 60 * 1000; // Throttle pings to once every minute

/**
 * Pings the backend /health endpoint to wake up Render service from cold sleep.
 */
export async function pingBackendHealth(force = false): Promise<void> {
  const now = Date.now();
  if (!force && now - lastPingTime < MIN_PING_INTERVAL_MS) {
    return;
  }
  lastPingTime = now;

  try {
    const healthUrl = `${BACKEND_URL.replace(/\/+$/, '')}/health`;
    fetch(healthUrl, { method: 'GET' })
      .then((res) => {
        if (__DEV__) console.log('[Backend] Health check pinged:', res.status);
      })
      .catch((err) => {
        if (__DEV__) console.log('[Backend] Health check ping error:', err?.message);
      });
  } catch {
    // Ignore network exceptions on background health check
  }
}
