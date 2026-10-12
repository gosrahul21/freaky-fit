import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { GoogleIcon } from './GoogleIcon';
import { AppleIcon } from './AppleIcon';
import { InstagramIcon } from './InstagramIcon';
import { TikTokIcon } from './TikTokIcon';
import { RedditIcon } from './RedditIcon';
import { FacebookIcon } from './FacebookIcon';
import { YouTubeIcon } from './YouTubeIcon';

export {
  GoogleIcon,
  AppleIcon,
  InstagramIcon,
  TikTokIcon,
  RedditIcon,
  FacebookIcon,
  YouTubeIcon,
};

interface PlatformIconProps {
  name?: string;
  url?: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  fallback?: React.ReactNode;
}

export function PlatformIcon({ name, url, size = 20, color, style, fallback }: PlatformIconProps) {
  const combined = `${name || ''} ${url || ''}`.toLowerCase();

  if (combined.includes('youtube') || combined.includes('youtu.be') || combined.includes('shorts') || combined === 'yt') {
    return <YouTubeIcon size={size} style={style} />;
  }
  if (combined.includes('instagram') || combined.includes('reels') || combined === 'ig') {
    return <InstagramIcon size={size} style={style} />;
  }
  if (combined.includes('tiktok') || combined === 'tt') {
    return <TikTokIcon size={size} style={style} />;
  }
  if (combined.includes('reddit')) {
    return <RedditIcon size={size} style={style} />;
  }
  if (combined.includes('google')) {
    return <GoogleIcon size={size} style={style} />;
  }
  if (combined.includes('apple') || combined.includes('appstore')) {
    return <AppleIcon size={size} color={color || '#FFFFFF'} style={style} />;
  }
  if (combined.includes('facebook') || combined === 'fb') {
    return <FacebookIcon size={size} style={style} />;
  }

  if (fallback !== undefined) {
    return <>{fallback}</>;
  }

  return <YouTubeIcon size={size} style={style} />;
}
