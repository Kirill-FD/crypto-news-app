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
  // Use placeholder if URI is empty or invalid
  const imageUri = uri && uri.trim() !== '' 
    ? uri 
    : 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png';

  // Always use regular Image component for web compatibility
  return (
    <Image
      source={{ uri: imageUri }}
      resizeMode={resizeMode}
      style={style}
      onError={(error) => {
        // Silently handle errors - image will not display
        console.debug('Image load error:', imageUri);
      }}
    />
  );
};