import React, { useState, useEffect } from 'react';
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
import { useRouter } from 'expo-router';
import { X, Link2, Check, Wand2 } from 'lucide-react-native';
import { InstagramIcon, YouTubeIcon, TikTokIcon } from '../components/icons';
import { useTheme } from '../contexts/ThemeContext';
import { hapticImpactLight, hapticSelection } from '../utils/haptics';
import { supabase } from '../lib/supabase';
import { BACKEND_URL } from '../lib/backend';
import { usePostHog } from 'posthog-react-native';

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
  const posthog = usePostHog();

  const [url, setUrl] = useState('youtube.com/shorts/cbum-biceps');
  const [isProcessing, setIsProcessing] = useState(false);
  const [fetchedMeta, setFetchedMeta] = useState<{ url: string; title?: string; thumbnail?: string } | null>(null);

  useEffect(() => {
    posthog.screen('Importer');
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

  const handleImport = async () => {
    if (!url.trim()) return;
    hapticImpactLight();
    setIsProcessing(true);

    const platform = detectPlatform(url);
    const startTime = Date.now();
    posthog.capture('video_import_started', {
      platform,
      url,
    });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const apiUrl = BACKEND_URL;
      
      const response = await fetch(`${apiUrl}/api/extract-workout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), user_id: user.id }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to start extraction');
      }

      const { job_id } = await response.json();

      // Poll for job status
      const pollStatus = async () => {
        try {
          const statusRes = await fetch(`${apiUrl}/api/job-status/${job_id}`);
          if (!statusRes.ok) throw new Error('Failed to fetch job status');
          
          const statusData = await statusRes.json();

          if (statusData.state === 'completed') {
            const durationSec = Math.round((Date.now() - startTime) / 1000);
            posthog.capture('video_import_succeeded', {
              platform,
              job_id,
              duration_seconds: durationSec,
            });

            setIsProcessing(false);
            router.replace('/library');
          } else if (statusData.state === 'failed') {
            const errorMsg = statusData.failedReason || 'Extraction failed';
            const durationSec = Math.round((Date.now() - startTime) / 1000);
            posthog.capture('video_import_failed', {
              platform,
              job_id,
              error: errorMsg,
              duration_seconds: durationSec,
            });
            throw new Error(errorMsg);
          } else {
            setTimeout(pollStatus, 2000);
          }
        } catch (err: any) {
          console.error("Polling error:", err);
          setIsProcessing(false);
          posthog.capture('video_import_failed', {
            platform,
            error: err?.message || 'Polling error',
          });
          alert('Error checking extraction status');
        }
      };

      setTimeout(pollStatus, 2000);

    } catch (err: any) {
      console.error("Import error:", err);
      setIsProcessing(false);
      posthog.capture('video_import_failed', {
        platform,
        error: err?.message || 'Failed to start extraction',
      });
      alert('Failed to start extraction');
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
                onChangeText={setUrl}
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
});
