import React from 'react';
import { Image, ImageStyle } from 'react-native';

interface SmartImageProps {
  uri: string;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
  style?: ImageStyle;
  className?: string;
}

export const SmartImage: React.FC<SmartImageProps> = ({
  uri,
  resizeMode = 'cover',
  style,
}) => {
  // Always use regular Image component for web compatibility
  return (
    <Image
      source={{ uri }}
      resizeMode={resizeMode}
      style={style}
    />
  );
};