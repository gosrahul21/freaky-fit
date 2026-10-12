import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { StyleProp, ViewStyle } from 'react-native';

interface IconProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function YouTubeIcon({ size = 20, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M17.77 10.32L15.45 9.1C17.04 6.35 16.12 2.82 13.37 1.23C10.62 -0.36 7.09 0.56 5.5 3.31L3.18 7.33C2.17 9.07 2.37 11.24 3.67 12.78L1.97 11.88C0.38 11.04 -0.54 9.12 -0.26 7.35C0.02 5.58 1.44 4.22 3.2 3.94L4.84 3.68C5.81 1.83 7.74 0.55 9.99 0.18C13.26 -0.36 16.41 1.15 17.79 4.23L17.77 10.32Z"
        fill="#FF0000"
      />
      <Path d="M9.5 8.5L15 12L9.5 15.5V8.5Z" fill="#FFFFFF" />
    </Svg>
  );
}

export default YouTubeIcon;
