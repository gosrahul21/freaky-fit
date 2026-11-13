import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator, 
  Image, 
  ScrollView 
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, Link2, Check, Wand2, AlertCircle, RotateCcw } from 'lucide-react-native';
import { InstagramIcon, YouTubeIcon, TikTokIcon } from '../components/icons';
import { useTheme } from '../contexts/ThemeContext';
import { hapticImpactLight, hapticSelection } from '../utils/haptics';
import { supabase } from '../lib/supabase';
import { BACKEND_URL, JobError, JobErrorCode, JobStatusResponse } from '../lib/backend';
import { usePostHog } from 'posthog-react-native';

interface ImportErrorState {
  title: string;
  message: string;
  retryable: boolean;
  code?: JobErrorCode;
  stage?: JobError['stage'];
}

const JOB_ERROR_TITLES: Record<JobErrorCode, string> = {
  AI_SERVICE_UNAVAILABLE: 'AI Temporarily Busy',
  AI_RATE_LIMITED: 'AI Temporarily Busy',
  AI_AUTH_ERROR: 'Extraction Unavailable',
  VIDEO_UNAVAILABLE: 'Video Unavailable',
  VIDEO_ACCESS_BLOCKED: 'Video Access Blocked',
  INVALID_VIDEO_URL: 'Invalid Video Link',
  VIDEO_DOWNLOAD_FAILED: 'Video Download Failed',
  VIDEO_UPLOAD_FAILED: 'Video Upload Failed',
  AI_EXTRACTION_FAILED: 'Extraction Failed',
  DATABASE_ERROR: 'Save Failed',
  PROCESSING_FAILED: 'Extraction Failed',
};

function formatJobError(statusData: JobStatusResponse): ImportErrorState {
  const err = statusData.error;
  const code = err?.code;
  const title = (code && JOB_ERROR_TITLES[code]) || 'Extraction Failed';
  const message =
    err?.message ||
    statusData.failedReason ||
    'Something went wrong while processing your video.';

  return {
    title,
    message,
    retryable: err?.retryable !== false,
    code,
    stage: err?.stage,
  };
}

const detectPlatform = (targetUrl: string) => {
  const lower = targetUrl.toLowerCase();
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  if (lower.includes('instagram.com')) return 'instagram';
  if (lower.includes('tiktok.com')) return 'tiktok';
  return 'other';
};

const extractYouTubeVideoId = (targetUrl: string) => {
  const match = targetUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|(?:embed|v|shorts)\/))([\w-]{11})/i);
  return match ? match[1] : null;
};

export default function ImporterScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const s = makeStyles(colors, isDark);
  const router = useRouter();
  const { sharedUrl } = useLocalSearchParams<{ sharedUrl?: string }>();
  const posthog = usePostHog();

  const [url, setUrl] = useState(
    typeof sharedUrl === 'string' && sharedUrl.trim() ? sharedUrl.trim() : 'youtube.com/shorts/cbum-biceps'
  );
  const [prevSharedUrl, setPrevSharedUrl] = useState<string | undefined>(
    typeof sharedUrl === 'string' ? sharedUrl : undefined
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [importError, setImportError] = useState<ImportErrorState | null>(null);
  const [fetchedMeta, setFetchedMeta] = useState<{ url: string; title?: string; thumbnail?: string } | null>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  if (typeof sharedUrl === 'string' && sharedUrl.trim() && sharedUrl !== prevSharedUrl) {
    setPrevSharedUrl(sharedUrl);
    setUrl(sharedUrl.trim());
    setImportError(null);
  }

  useEffect(() => {
    isMountedRef.current = true;
    posthog.screen('Importer');
    return () => {
      isMountedRef.current = false;
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }
    };
  }, [posthog]);

  // Dynamically fetch live title and thumbnail from the entered URL
  useEffect(() => {
    const trimmed = url.trim();
    const platform = detectPlatform(trimmed);
    if (!trimmed || platform === 'other') return;

    let isMounted = true;

    async function loadMetadata() {
      // Defer to next microtask so no synchronous setState occurs inside effect body
      await Promise.resolve();
      if (!isMounted) return;

      const normalizedUrl = trimmed.startsWith('http://') || trimmed.startsWith('https://') 
        ? trimmed 
        : `https://${trimmed}`;

      try {
        const ytId = extractYouTubeVideoId(trimmed);
        if (ytId) {
          const watchUrl = `https://www.youtube.com/watch?v=${ytId}`;
          const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(watchUrl)}`);
          if (res.ok) {
            const data = await res.json();
            if (isMounted && data?.title) {
              setFetchedMeta({
                url: trimmed,
                title: data.title,
                thumbnail: data.thumbnail_url || `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
              });
              return;
            }
          }
          if (isMounted) {
            setFetchedMeta({
              url: trimmed,
              thumbnail: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
            });
          }
        }

        const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(normalizedUrl)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data?.title) {
            setFetchedMeta({
              url: trimmed,
              title: data.title,
              thumbnail: data.thumbnail_url,
            });
            return;
          }
        }

        if (platform === 'tiktok') {
          const ttRes = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(normalizedUrl)}`);
          if (ttRes.ok) {
            const data = await ttRes.json();
            if (isMounted && data?.title) {
              setFetchedMeta({
                url: trimmed,
                title: data.title,
                thumbnail: data.thumbnail_url,
              });
              return;
            }
          }
        }
      } catch (err) {
        if (__DEV__) console.log('[Importer] Metadata fetch error:', err);
      }
    }

    loadMetadata();

    return () => {
      isMounted = false;
    };
  }, [url]);

  const previewData = React.useMemo(() => {
    const trimmed = url.trim();
    if (!trimmed) return null;

    const platform = detectPlatform(trimmed);
    if (platform === 'other') return null;

    const ytId = extractYouTubeVideoId(trimmed);
    const instantYtThumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;
    const currentMeta = fetchedMeta?.url === trimmed ? fetchedMeta : null;

    let defaultTitle = currentMeta?.title;
    let platformLabel = 'YouTube • Shorts';
    let duration = '0:42';
    let fallbackThumb = currentMeta?.thumbnail || instantYtThumb || 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=300';

    if (platform === 'youtube') {
      platformLabel = trimmed.includes('shorts') ? 'YouTube • Shorts' : 'YouTube • Video';
      if (!defaultTitle) {
        defaultTitle = trimmed.toLowerCase().includes('cbum') 
          ? 'CBUM Bigger Biceps Routine' 
          : 'YouTube Workout Video';
      }
    } else if (platform === 'instagram') {
      platformLabel = 'Instagram • Reel';
      if (!defaultTitle) {
        defaultTitle = 'Fitness Workout Reel';
      }
      duration = '0:30';
      fallbackThumb = currentMeta?.thumbnail || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300';
    } else if (platform === 'tiktok') {
      platformLabel = 'TikTok • Video';
      if (!defaultTitle) {
        defaultTitle = 'Gym Fitness Routine';
      }
      duration = '0:45';
      fallbackThumb = currentMeta?.thumbnail || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300';
    }

    return {
      title: defaultTitle,
      platformLabel,
      duration,
      thumbnail: fallbackThumb,
    };
  }, [url, fetchedMeta]);

  const clearPollTimeout = () => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  };

  const handleImport = async () => {
    if (!url.trim()) return;
    hapticImpactLight();
    clearPollTimeout();
    setImportError(null);
    setIsProcessing(true);

    const trimmedUrl = url.trim();
    const normalizedUrl = trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')
      ? trimmedUrl
      : `https://${trimmedUrl}`;

    const platform = detectPlatform(normalizedUrl);
    const startTime = Date.now();
    posthog.capture('video_import_started', {
      platform,
      url: normalizedUrl,
    });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const apiUrl = BACKEND_URL;
      
      const response = await fetch(`${apiUrl}/api/extract-workout`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ url: normalizedUrl, user_id: user.id }),
      });

      const rawText = await response.text();
      let responseData: any = null;
      try {
        responseData = JSON.parse(rawText);
      } catch {
        if (__DEV__) {
          console.warn('[Importer] Non-JSON response from /api/extract-workout:', response.status, rawText);
        }
        throw new Error(
          rawText.trim().length > 0 && rawText.length < 120 && !rawText.includes('<')
            ? rawText.trim()
            : 'Server returned an unexpected response. Please try again.'
        );
      }

      if (!response.ok || !responseData?.job_id) {
        const errorMsg = responseData?.error || responseData?.message || 'Could not start workout extraction. Please try again.';
        throw new Error(errorMsg);
      }

      const { job_id } = responseData;

      // Poll for job status
      const pollStatus = async () => {
        if (!isMountedRef.current) return;

        try {
          const statusRes = await fetch(`${apiUrl}/api/job-status/${job_id}`, {
            headers: { 'Accept': 'application/json' },
          });

          const rawStatusText = await statusRes.text();
          let statusData: JobStatusResponse | null = null;
          try {
            statusData = JSON.parse(rawStatusText);
          } catch {
            if (__DEV__) {
              console.warn('[Importer] Non-JSON response from /api/job-status:', statusRes.status, rawStatusText);
            }
            throw new Error('Unable to read extraction status.');
          }

          if (!statusRes.ok || !statusData) {
            throw new Error('Unable to check extraction status.');
          }
          
          if (!isMountedRef.current) return;

          if (statusData.state === 'completed') {
            clearPollTimeout();
            const durationSec = Math.round((Date.now() - startTime) / 1000);
            posthog.capture('video_import_succeeded', {
              platform,
              job_id,
              duration_seconds: durationSec,
            });

            setIsProcessing(false);
            router.replace('/library');
          } else if (statusData.state === 'failed') {
            clearPollTimeout();
            const formattedError = formatJobError(statusData);
            const durationSec = Math.round((Date.now() - startTime) / 1000);
            posthog.capture('video_import_failed', {
              platform,
              job_id,
              error: formattedError.message,
              error_code: formattedError.code ?? null,
              error_stage: formattedError.stage ?? null,
              retryable: formattedError.retryable,
              duration_seconds: durationSec,
            });
            setIsProcessing(false);
            setImportError(formattedError);
          } else {
            pollTimeoutRef.current = setTimeout(pollStatus, 2000);
          }
        } catch (err: any) {
          console.error("Polling error:", err);
          clearPollTimeout();
          if (!isMountedRef.current) return;
          setIsProcessing(false);
          posthog.capture('video_import_failed', {
            platform,
            error: err?.message || 'Polling error',
          });
          setImportError({
            title: 'Connection Issue',
            message: 'Lost connection while checking your video. Please try again.',
            retryable: true,
          });
        }
      };

      pollTimeoutRef.current = setTimeout(pollStatus, 2000);

    } catch (err: any) {
      console.error("Import error:", err);
      clearPollTimeout();
      if (!isMountedRef.current) return;
      setIsProcessing(false);
      posthog.capture('video_import_failed', {
        platform,
        error: err?.message || 'Failed to start extraction',
      });
      setImportError({
        title: 'Could Not Start Import',
        message: err?.message || 'Something went wrong while starting your video import. Please try again.',
        retryable: true,
      });
    }
  };

  const detectedPlatform = detectPlatform(url.trim());
  const platformName = detectedPlatform === 'youtube' ? 'YouTube' : detectedPlatform === 'instagram' ? 'Instagram' : detectedPlatform === 'tiktok' ? 'TikTok' : null;

  return (
    <SafeAreaView style={s.safeArea}>
      <KeyboardAvoidingView 
        style={s.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={s.header}>
          <View style={{ width: 40 }} />
          <Text style={s.headerTitle}>Smart Import</Text>
          <TouchableOpacity 
            style={s.closeBtn} 
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <X size={18} color={colors.textPrimary} strokeWidth={2.4} />
          </TouchableOpacity>
        </View>

        {isProcessing ? (
          <View style={s.processingContainer}>
            <View style={s.iconCircle}>
              <ActivityIndicator color="#000000" size="large" />
            </View>
            <Text style={s.processingTitle}>Scanning Video...</Text>
            <Text style={s.processingSubtitle}>
              You can close this screen and let it scan in the background. We will notify you when it&apos;s ready!
            </Text>
            
            <TouchableOpacity 
              style={s.backgroundBtn} 
              onPress={() => router.back()}
            >
              <Text style={s.backgroundBtnText}>Continue in Background</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView 
            contentContainerStyle={s.scrollContent} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Center Hero Icon */}
            <View style={s.heroIconContainer}>
              <View style={s.iconCircle}>
                <Wand2 size={32} color="#000000" strokeWidth={2.4} />
              </View>
            </View>

            {/* Title & Subtitle */}
            <Text style={s.title}>Import a workout</Text>
            <Text style={s.subtitle}>
              Paste a link and our AI pulls out the exercises, sets and reps for you.
            </Text>

            {/* Input Section */}
            <View style={s.inputContainer}>
              <Link2 size={18} color={url ? colors.accent : colors.textTertiary} strokeWidth={2.4} />
              <TextInput
                style={s.input}
                placeholder="Paste Instagram, TikTok, or YouTube link..."
                placeholderTextColor={colors.textTertiary}
                value={url}
                onChangeText={(text) => {
                  setUrl(text);
                  if (importError) setImportError(null);
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {!!url && (
                <TouchableOpacity 
                  style={s.clearBtn} 
                  activeOpacity={0.7}
                  onPress={() => {
                    hapticSelection();
                    setUrl('');
                    setImportError(null);
                  }}
                >
                  <X size={13} color={colors.textPrimary} strokeWidth={2.5} />
                </TouchableOpacity>
              )}
            </View>

            {/* Detected link status */}
            {platformName && (
              <View style={s.detectedRow}>
                <Check size={14} color="#34D399" strokeWidth={3} />
                <Text style={s.detectedText}>{platformName} link detected</Text>
              </View>
            )}

            {/* Extraction Error Card */}
            {importError && (
              <View style={s.errorCard}>
                <View style={s.errorHeader}>
                  <View style={s.errorIconWrap}>
                    <AlertCircle size={18} color="#EF4444" strokeWidth={2.4} />
                  </View>
                  <View style={s.errorTextWrap}>
                    <Text style={s.errorTitle}>{importError.title}</Text>
                    <Text style={s.errorMessage}>{importError.message}</Text>
                  </View>
                </View>

                {importError.retryable ? (
                  <TouchableOpacity
                    style={s.retryBtn}
                    activeOpacity={0.85}
                    onPress={handleImport}
                  >
                    <RotateCcw size={15} color="#FFFFFF" strokeWidth={2.4} />
                    <Text style={s.retryBtnText}>Try Again</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={s.errorHintText}>
                    Please check or replace the video link above.
                  </Text>
                )}
              </View>
            )}

            {/* Video Preview Card */}
            {previewData && (
              <View style={s.previewCard}>
                <View style={s.previewThumbContainer}>
                  {previewData.thumbnail ? (
                    <Image source={{ uri: previewData.thumbnail }} style={s.previewThumb} resizeMode="cover" />
                  ) : (
                    <View style={[s.previewThumbFallback, { alignItems: 'center', justifyContent: 'center' }]}>
                      <ActivityIndicator size="small" color={colors.accent} />
                    </View>
                  )}
                  <View style={s.durationBadge}>
                    <Text style={s.durationText}>{previewData.duration}</Text>
                  </View>
                </View>
                <View style={s.previewTextContainer}>
                  <Text style={s.previewTitle} numberOfLines={2}>
                    {previewData.title}
                  </Text>
                  <Text style={s.previewPlatform}>{previewData.platformLabel}</Text>
                </View>
              </View>
            )}

            {/* WE'LL EXTRACT Section */}
            <View style={s.section}>
              <Text style={s.sectionLabel}>WE&apos;LL EXTRACT</Text>
              <View style={s.featuresRow}>
                <View style={s.featurePill}>
                  <Check size={13} color={colors.accent} strokeWidth={3} />
                  <Text style={s.featurePillText}>Exercises</Text>
                </View>
                <View style={s.featurePill}>
                  <Check size={13} color={colors.accent} strokeWidth={3} />
                  <Text style={s.featurePillText}>Sets & reps</Text>
                </View>
                <View style={s.featurePill}>
                  <Check size={13} color={colors.accent} strokeWidth={3} />
                  <Text style={s.featurePillText}>Equipment</Text>
                </View>
                <View style={s.featurePill}>
                  <Check size={13} color={colors.accent} strokeWidth={3} />
                  <Text style={s.featurePillText}>Muscles worked</Text>
                </View>
              </View>
            </View>

            {/* WORKS WITH Section */}
            <View style={s.section}>
              <Text style={s.sectionLabel}>WORKS WITH</Text>
              <View style={s.platformsRow}>
                <TouchableOpacity 
                  style={s.platformPill}
                  activeOpacity={0.8}
                  onPress={() => {
                    setUrl('https://www.instagram.com/reel/example');
                  }}
                >
                  <InstagramIcon size={18} />
                  <Text style={s.platformName}>Instagram</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={s.platformPill}
                  activeOpacity={0.8}
                  onPress={() => {
                    setUrl('youtube.com/shorts/cbum-biceps');
                  }}
                >
                  <YouTubeIcon size={18} />
                  <Text style={s.platformName}>YouTube</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={s.platformPill}
                  activeOpacity={0.8}
                  onPress={() => {
                    setUrl('https://www.tiktok.com/@example/video/1234');
                  }}
                >
                  <TikTokIcon size={16} />
                  <Text style={s.platformName}>TikTok</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ height: 120 }} />
          </ScrollView>
        )}

        {/* Sticky Bottom Bar */}
        {!isProcessing && (
          <View style={[s.bottomFooter, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <TouchableOpacity 
              style={[s.extractBtn, !url.trim() && s.extractBtnDisabled]} 
              activeOpacity={0.88}
              disabled={!url.trim() || isProcessing}
              onPress={handleImport}
            >
              <Wand2 size={19} color="#000000" strokeWidth={2.4} />
              <Text style={s.extractBtnText}>Extract workout</Text>
            </TouchableOpacity>
            <Text style={s.extractHelperText}>Usually takes about 10 seconds</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof import('../contexts/ThemeContext').useTheme>['colors'], isDark: boolean) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: isDark ? '#1F1F24' : '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  heroIconContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#161619' : '#F9FAFB',
    borderWidth: 1.5,
    borderColor: colors.accent,
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 56,
    gap: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  clearBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: isDark ? '#2B2B32' : '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 4,
  },
  detectedText: {
    color: '#34D399',
    fontSize: 13,
    fontWeight: '600',
  },
  previewCard: {
    backgroundColor: isDark ? '#17171A' : '#F9FAFB',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: isDark ? '#26262B' : '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 14,
  },
  previewThumbContainer: {
    width: 82,
    height: 64,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.surfaceAlt,
  },
  previewThumb: {
    width: '100%',
    height: '100%',
  },
  previewThumbFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surfaceAlt,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  previewTextContainer: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: 4,
  },
  previewPlatform: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  section: {
    marginTop: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textTertiary,
    letterSpacing: 1.2,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: isDark ? '#1A1A1E' : '#F3F4F6',
    borderWidth: 1,
    borderColor: isDark ? '#28282E' : '#E5E7EB',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
  },
  featurePillText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  platformsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  platformPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: isDark ? '#1A1A1E' : '#F3F4F6',
    borderWidth: 1,
    borderColor: isDark ? '#28282E' : '#E5E7EB',
    paddingVertical: 11,
    borderRadius: 20,
  },
  platformName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  bottomFooter: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: isDark ? 'rgba(14,14,16,0.92)' : 'rgba(255,255,255,0.92)',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  extractBtn: {
    backgroundColor: colors.accent,
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  extractBtnDisabled: {
    opacity: 0.5,
  },
  extractBtnText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  extractHelperText: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 10,
    fontWeight: '500',
  },
  processingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 80,
  },
  processingTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.textPrimary,
    marginTop: 20,
    marginBottom: 8,
  },
  processingSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  backgroundBtn: {
    marginTop: 32,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 20,
  },
  backgroundBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  errorCard: {
    marginTop: 14,
    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#FEF2F2',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(239, 68, 68, 0.35)' : '#FECACA',
    borderRadius: 18,
    padding: 14,
    gap: 12,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  errorIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  errorTextWrap: {
    flex: 1,
    gap: 3,
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: isDark ? '#FCA5A5' : '#991B1B',
  },
  errorMessage: {
    fontSize: 13,
    lineHeight: 19,
    color: isDark ? '#FECACA' : '#B91C1C',
    fontWeight: '500',
  },
  retryBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EF4444',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
  },
  retryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  errorHintText: {
    fontSize: 12,
    fontWeight: '600',
    color: isDark ? '#FCA5A5' : '#B91C1C',
    paddingLeft: 42,
  },
});
