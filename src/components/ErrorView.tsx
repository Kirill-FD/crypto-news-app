import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './ErrorView.styles';
import { useTheme } from '../App';

interface ErrorViewProps {
  message?: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

export const ErrorView: React.FC<ErrorViewProps> = ({ 
  message = 'Something went wrong. Please try again.',
  onRetry,
  fullScreen = false 
}) => {
  const { colors } = useTheme();
  const content = (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: '#fef2f2' }]}>
        <Text style={[styles.icon, { color: '#dc2626' }]}>⚠️</Text>
      </View>
      
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        Oops! Something went wrong
      </Text>
      
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {message}
      </Text>
      
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          style={styles.retryButton}
          activeOpacity={0.8}
        >
          <Text style={styles.retryText}>
            Try Again
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (fullScreen) {
    return (
      <SafeAreaView style={[styles.fullScreen, { backgroundColor: colors.card }]}>
        {content}
      </SafeAreaView>
    );
  }

  return content;
};

interface NetworkErrorViewProps {
  onRetry?: () => void;
  fullScreen?: boolean;
}

export const NetworkErrorView: React.FC<NetworkErrorViewProps> = ({ 
  onRetry, 
  fullScreen = false 
}) => {
  return (
    <ErrorView
      message="Please check your internet connection and try again."
      onRetry={onRetry}
      fullScreen={fullScreen}
    />
  );
};

interface NotFoundErrorViewProps {
  message?: string;
  fullScreen?: boolean;
}

export const NotFoundErrorView: React.FC<NotFoundErrorViewProps> = ({ 
  message = 'The content you\'re looking for could not be found.',
  fullScreen = false 
}) => {
  return (
    <ErrorView
      message={message}
      fullScreen={fullScreen}
    />
  );
};
