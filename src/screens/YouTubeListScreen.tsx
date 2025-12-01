import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../contexts/ThemeContext';
import styles from './YouTubeListScreen.styles';
import { useFeaturedVideos } from '../hooks/useYouTubeVideos';
import { Loading } from '../components/Loading';
import YouTubeEmbed from '../components/YouTubeEmbed';

const YouTubeListScreen: React.FC = () => {
  const { colors } = useTheme();
  const { featuredVideos, isLoading } = useFeaturedVideos();

  const renderFeaturedSection = () => (
    <View style={styles.widgetsContainer}>
      {isLoading ? (
        <Loading message="Loading videos..." />
      ) : (
        featuredVideos.map((video, index) => (
        <View
          key={video.id}
          style={[
            styles.widgetCard,
            index === 0 ? { marginTop: 0 } : null,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <YouTubeEmbed
            videoId={video.youtubeId}
          />

          <View style={styles.widgetBody}>
            <Text style={[styles.widgetTitle, { color: colors.textPrimary }]}>
              {video.title}
            </Text>
            <Text style={[styles.widgetDescription, { color: colors.textSecondary }]}>
              {video.description}
            </Text>

            <View style={styles.widgetMeta}>
              <Text style={[styles.widgetMetaText, { color: colors.textSecondary }]}>
                {video.duration} • {video.viewCount?.toLocaleString()} views
              </Text>
            </View>
          </View>
        </View>
        ))
      )}
    </View>
  );

  return (
    <SafeAreaView edges={['left','right','bottom']} style={[styles.container, { backgroundColor: colors.background }]}> 
      <ScrollView
        style={styles.listContent}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}> 
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>YouTube</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}> 
            Crypto videos and tutorials
          </Text>
        </View>
        {renderFeaturedSection()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default YouTubeListScreen;