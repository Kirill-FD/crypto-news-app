import React from 'react';
import { ScrollView, RefreshControl, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useHeaderHeight } from '@react-navigation/elements';

import { Loading } from '../components/Loading';
import { ErrorView } from '../components/ErrorView';
import { useLatestVideo } from '../hooks/useVideos';
import { useLatestTweet } from '../hooks/useTweets';
import { useLatestNews } from '../hooks/useNews';
import { Video, Tweet, News } from '../types';
import { useTheme } from '../App';
import styles from './HomeScreen.styles';
import { RootStackParamList } from '../navigation/types';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { colors } = useTheme();
  const headerHeight = useHeaderHeight();

  const {
    data: latestVideo,
    isLoading: videoLoading,
    error: videoError,
    refetch: refetchVideo,
  } = useLatestVideo();

  const {
    data: latestTweet,
    isLoading: tweetLoading,
    error: tweetError,
    refetch: refetchTweet,
  } = useLatestTweet();

  const {
    data: latestNews,
    isLoading: newsLoading,
    error: newsError,
    refetch: refetchNews,
  } = useLatestNews();

  const handleRefresh = () => {
    refetchVideo();
    refetchTweet();
    refetchNews();
  };

  const handleVideoPress = (video: Video) => {
    navigation.navigate('YouTubePlayer', { video });
  };

  const handleTweetPress = (tweet: Tweet) => {
    navigation.navigate('MainTabs', { screen: 'X' });
  };

  const handleNewsPress = (news: News) => {
    navigation.navigate('MainTabs', { screen: 'RSS' });
  };

  const isLoading = videoLoading || tweetLoading || newsLoading;
  const hasError = videoError || tweetError || newsError;

  if (isLoading && !latestVideo && !latestTweet && !latestNews) {
    return <Loading message="Loading latest content..." fullScreen />;
  }

  if (hasError && !latestVideo && !latestTweet && !latestNews) {
    return (
      <ErrorView
        message="Failed to load content. Please try again."
        onRetry={handleRefresh}
        fullScreen
      />
    );
  }

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

            {videoLoading && !latestVideo ? (
              <Loading message="Loading latest video..." />
            ) : videoError && !latestVideo ? (
              <ErrorView message="Failed to load video" onRetry={refetchVideo} />
            ) : latestVideo ? (
              <TouchableOpacity
                onPress={() => handleVideoPress(latestVideo)}
                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                activeOpacity={0.8}
              >
                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{latestVideo.title}</Text>
                <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>Click to watch</Text>
              </TouchableOpacity>
            ) : null}
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
              <TouchableOpacity
                onPress={() => handleTweetPress(latestTweet)}
                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                activeOpacity={0.8}
              >
                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{latestTweet.user.name}</Text>
                <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>{latestTweet.text}</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Latest News Section */}
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

            {newsLoading && !latestNews ? (
              <Loading message="Loading latest news..." />
            ) : newsError && !latestNews ? (
              <ErrorView message="Failed to load news" onRetry={refetchNews} />
            ) : latestNews ? (
              latestNews.data.map((news) => (
                <TouchableOpacity
                  key={news.id}
                  onPress={() => handleNewsPress(news)}
                  style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{news.title}</Text>
                  <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>{news.summary}</Text>
                </TouchableOpacity>
              ))
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;