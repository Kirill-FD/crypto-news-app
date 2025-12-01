import React from 'react';
import {
  ScrollView,
  RefreshControl,
  View,
  Text,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useHeaderHeight } from '@react-navigation/elements';

import { Loading } from '../components/Loading';
import { ErrorView } from '../components/ErrorView';
import { TweetCard } from '../components/TweetCard';
import { useLatestTweet } from '../hooks/useTweets';
import { useAllNews } from '../hooks/useNews';
import { Tweet, News } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import styles from './HomeScreen.styles';
import { RootStackParamList } from '../navigation/types';
import { useFeaturedVideos } from '../hooks/useYouTubeVideos';
import YouTubeEmbed from '../components/YouTubeEmbed';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { colors } = useTheme();
  const headerHeight = useHeaderHeight();

  const {
    data: latestTweet,
    isLoading: tweetLoading,
    error: tweetError,
    refetch: refetchTweet,
  } = useLatestTweet();

  const {
    data: newsPages,
    isLoading: newsLoading,
    error: newsError,
    refetch: refetchNews,
    fetchNextPage: fetchNextNews,
    hasNextPage: hasNextNews,
    isFetchingNextPage: isFetchingNextNews,
  } = useAllNews(10);

  const newsItems = newsPages?.pages.flatMap(page => page.items) || [];

  const { featuredVideos } = useFeaturedVideos();
  const heroVideo = featuredVideos[0];

  const handleRefresh = () => {
    refetchTweet();
    refetchNews();
  };

  const handleTweetPress = (tweet: Tweet) => {
    navigation.navigate('MainTabs', { screen: 'X' });
  };

  const handleNewsPress = (news: News) => {
    navigation.navigate('ArticleDetails', { articleId: news.id, initialArticle: news });
  };

  const isLoading = tweetLoading || newsLoading;
  const hasError = tweetError || newsError;

  if (isLoading && !latestTweet && newsItems.length === 0) {
    return <Loading message="Loading latest content..." fullScreen />;
  }

  if (hasError && !latestTweet && newsItems.length === 0) {
    return (
      <ErrorView
        message="Failed to load content. Please try again."
        onRetry={handleRefresh}
        fullScreen
      />
    );
  }

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!hasNextNews || isFetchingNextNews) {
      return;
    }

    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const distanceFromBottom =
      contentSize.height - (layoutMeasurement.height + contentOffset.y);

    if (distanceFromBottom < 200) {
      fetchNextNews();
    }
  };

  return (
    <SafeAreaView edges={['left','right','bottom']} style={[styles.container, { backgroundColor: colors.background }]}> 
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            progressViewOffset={headerHeight}
          />
        }
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
      >
        {/* Header
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Crypto News</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Stay updated with the latest in cryptocurrency
          </Text>
        </View> */}

        <View style={styles.content}>
          {/* Latest Video Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Latest Video</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('MainTabs', { screen: 'YouTube' })}
                style={styles.viewAllButton}
              >
                <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
              </TouchableOpacity>
            </View>

            {heroVideo ? (
              <View
                style={[
                  styles.latestVideoCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <YouTubeEmbed videoId={heroVideo.youtubeId} />

                <View style={styles.latestVideoBody}>
                  <Text style={[styles.latestVideoTitle, { color: colors.textPrimary }]}>
                    {heroVideo.title}
                  </Text>
                  <Text style={[styles.latestVideoDescription, { color: colors.textSecondary }]}>
                    {heroVideo.description}
                  </Text>
                  <Text style={[styles.latestVideoMeta, { color: colors.textSecondary }]}>
                    {heroVideo.duration} • {heroVideo.viewCount?.toLocaleString()} views
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                Featured videos are unavailable right now.
              </Text>
            )}
          </View>

          {/* Latest Tweet Section */}
           <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Latest Tweet</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('MainTabs', { screen: 'X' })}
                style={styles.viewAllButton}
              >
                <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
              </TouchableOpacity>
            </View>

            {tweetLoading && !latestTweet ? (
              <Loading message="Loading latest tweet..." />
            ) : tweetError && !latestTweet ? (
              <ErrorView message="Failed to load tweet" onRetry={refetchTweet} />
            ) : latestTweet ? (
              <View style={{ marginHorizontal: 0, marginVertical: 0, marginBottom: 0, paddingBottom: 0 }}>
                <TweetCard tweet={latestTweet} onPress={handleTweetPress} />
              </View>
            ) : null}
          </View>

          {/* Latest News Section (infinite scroll) */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Latest News</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('MainTabs', { screen: 'RSS' })}
                style={styles.viewAllButton}
              >
                <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
              </TouchableOpacity>
            </View>

            {newsLoading && newsItems.length === 0 ? (
              <Loading message="Loading latest news..." />
            ) : newsError && newsItems.length === 0 ? (
              <ErrorView message="Failed to load news" onRetry={refetchNews} />
            ) : newsItems.length > 0 ? (
              <>
                {newsItems.map((news) => (
                <TouchableOpacity
                  key={news.id}
                  onPress={() => handleNewsPress(news)}
                  style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{news.title}</Text>
                  <Text
                    style={[styles.cardSubtitle, { color: colors.textSecondary }]}
                    numberOfLines={3}
                    ellipsizeMode="tail"
                  >
                    {news.summary}
                  </Text>
                </TouchableOpacity>
                ))}
                {isFetchingNextNews && (
                  <View style={{ marginTop: 12 }}>
                    <Loading message="Loading more news..." />
                  </View>
                )}
              </>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;