import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Video } from '../types';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../App';
import styles from './YouTubePlayerScreen.styles';

type YouTubePlayerScreenRouteProp = RouteProp<RootStackParamList, 'YouTubePlayer'>;

const YouTubePlayerScreen: React.FC = () => {
  const route = useRoute<YouTubePlayerScreenRouteProp>();
  const navigation = useNavigation();
  const { video } = route.params;
  const { colors } = useTheme();

  const [playing, setPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleOpenInYouTube = async () => {
    const youtubeUrl = `https://www.youtube.com/watch?v=${video.youtubeId}`;
    
    if (await Linking.canOpenURL(youtubeUrl)) {
      await Linking.openURL(youtubeUrl);
    } else {
      Alert.alert('Error', 'Cannot open YouTube app');
    }
  };

  const handleStateChange = (state: string) => {
    if (state === 'ended') {
      setPlaying(false);
    }
  };

  const handleReady = () => {
    setIsLoading(false);
  };

  const handleError = (error: any) => {
    console.error('YouTube player error:', error);
    setIsLoading(false);
    Alert.alert('Error', 'Failed to load video. Please try again.');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#000000' }]}>
      {/* Video Player Placeholder */}
      <View style={styles.videoContainer}>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading video...</Text>
          </View>
        )}
        
        <View style={styles.videoPlaceholder}>
          <Text style={styles.videoTitle}>{video.title}</Text>
          <Text style={styles.videoId}>Video ID: {video.youtubeId}</Text>
        </View>
      </View>

      {/* Video Info */}
      <View style={[styles.infoContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.videoTitleText, { color: colors.textPrimary }]}>
          {video.title}
        </Text>
        
        <View style={styles.videoMeta}>
          {video.duration && (
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              Duration: {video.duration}
            </Text>
          )}
          {video.viewCount && (
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {video.viewCount.toLocaleString()} views
            </Text>
          )}
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            onPress={() => setPlaying(!playing)}
            style={[styles.controlButton, playing ? styles.pauseButton : styles.playButton]}
            activeOpacity={0.8}
          >
            <Text style={styles.controlButtonText}>
              {playing ? 'Pause' : 'Play'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleOpenInYouTube}
            style={[styles.controlButton, styles.youtubeButton]}
            activeOpacity={0.8}
          >
            <Text style={styles.controlButtonText}>
              Open in YouTube
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default YouTubePlayerScreen;