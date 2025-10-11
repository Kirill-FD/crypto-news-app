import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './Loading.styles';
import { useTheme } from '../App';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({ 
  message = 'Loading...', 
  fullScreen = false 
}) => {
  const { colors } = useTheme();
  const content = (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {message}
      </Text>
    </View>
  );

  if (fullScreen) {
    return (
      <SafeAreaView style={styles.fullScreen}>
        {content}
      </SafeAreaView>
    );
  }

  return content;
};

export const SkeletonLoader: React.FC = () => {
  return (
    <View style={styles.skeleton}>
      <View style={[styles.skeletonLine, { width: '75%' }]} />
      <View style={[styles.skeletonLine, { width: '50%' }]} />
      <View style={[styles.skeletonLine, { width: '66%' }]} />
    </View>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <View style={styles.cardSkeleton}>
      <View style={styles.skeletonImage} />
      <View style={[styles.skeletonLine, { width: '75%', marginBottom: 8 }]} />
      <View style={[styles.skeletonLine, { width: '50%', marginBottom: 8 }]} />
      <View style={[styles.skeletonLine, { width: '66%' }]} />
    </View>
  );
};

export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </>
  );
};