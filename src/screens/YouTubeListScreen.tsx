import React from 'react';
import { FlatList, RefreshControl, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Loading, ListSkeleton } from '../components/Loading';
import { ErrorView } from '../components/ErrorView';
import { useVideos } from '../hooks/useVideos';
import { Video } from '../types';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../App';
import styles from './YouTubeListScreen.styles';

type YouTubeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const YouTubeListScreen: React.FC = () => {
  const navigation = useNavigation<YouTubeScreenNavigationProp>();
  const { colors } = useTheme();

  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useVideos();

  const handleRefresh = () => {
    refetch();
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleVideoPress = (video: Video) => {
    navigation.navigate('YouTubePlayer', { video });
  };

  const renderVideo = ({ item }: { item: Video }) => (
    <View style={[styles.videoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.videoTitle, { color: colors.textPrimary }]}>{item.title}</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 4 }}>{item.duration}</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{item.viewCount?.toLocaleString()} views</Text>
    </View>
  );

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return <ListSkeleton count={2} />;
    }
    return null;
  };

  const renderEmpty = () => {
    if (isLoading) {
      return <ListSkeleton count={5} />;
    }

    if (error) {
      return (
        <ErrorView
          message="Failed to load videos. Please try again."
          onRetry={handleRefresh}
        />
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No videos available at the moment.
        </Text>
      </View>
    );
  };

  const videos = data?.pages.flatMap(page => page.data) || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>YouTube</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Crypto videos and tutorials
        </Text>
      </View>

      <FlatList
        data={videos}
        renderItem={renderVideo}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} colors={[colors.primary]} tintColor={colors.primary} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[styles.listContent, videos.length === 0 && styles.emptyListContent]}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default YouTubeListScreen;