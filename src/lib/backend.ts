export type JobErrorCode =
  | 'AI_SERVICE_UNAVAILABLE'
  | 'AI_RATE_LIMITED'
  | 'AI_AUTH_ERROR'
  | 'VIDEO_UNAVAILABLE'
  | 'VIDEO_ACCESS_BLOCKED'
  | 'INVALID_VIDEO_URL'
  | 'VIDEO_DOWNLOAD_FAILED'
  | 'VIDEO_UPLOAD_FAILED'
  | 'AI_EXTRACTION_FAILED'
  | 'DATABASE_ERROR'
  | 'PROCESSING_FAILED';

export interface JobError {
  code: JobErrorCode;
  stage: 'download' | 'upload' | 'extract' | 'save' | 'unknown';
  message: string;
  retryable: boolean;
  statusCode?: number;
}

export interface JobStatusResponse {
  job_id: string;
  state: 'waiting' | 'active' | 'completed' | 'failed';
  result: { workout_id: string; workoutData: unknown } | null;
  failedReason: string | null;
  error: JobError | null;
}

export const BACKEND_URL = (
  'https://n7ynlrw7h3jmscqkjauaopdmca0pcnwd.lambda-url.ap-southeast-2.on.aws'
)
  .trim()
  .replace(/\/+$/, '');

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
