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
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export function PlatformIcon({ name, size = 20, color, style }: PlatformIconProps) {
  const normalized = (name || '').toLowerCase();

  if (normalized.includes('google')) {
    return <GoogleIcon size={size} style={style} />;
  }
  if (normalized.includes('apple') || normalized.includes('appstore')) {
    return <AppleIcon size={size} color={color || '#FFFFFF'} style={style} />;
  }
  if (normalized.includes('instagram')) {
    return <InstagramIcon size={size} style={style} />;
  }
  if (normalized.includes('tiktok')) {
    return <TikTokIcon size={size} style={style} />;
  }
  if (normalized.includes('reddit')) {
    return <RedditIcon size={size} style={style} />;
  }
  if (normalized.includes('facebook') || normalized === 'fb') {
    return <FacebookIcon size={size} style={style} />;
  }
  if (normalized.includes('youtube') || normalized.includes('shorts') || normalized === 'yt') {
    return <YouTubeIcon size={size} style={style} />;
  }

  // Fallback to YouTube Shorts icon or null
  return <YouTubeIcon size={size} style={style} />;
}
