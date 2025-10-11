import React from 'react';
import { FlatList, RefreshControl, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Loading, ListSkeleton } from '../components/Loading';
import { ErrorView } from '../components/ErrorView';
import { useTweets } from '../hooks/useTweets';
import { useTheme } from '../App';
import styles from './XScreen.styles';
import { Tweet } from '../types';

const XScreen: React.FC = () => {
  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTweets();
  const { colors } = useTheme();

  const handleRefresh = () => {
    refetch();
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleTweetPress = (tweet: Tweet) => {
    // Tweet press handled in TweetCard component
  };

  const renderTweet = ({ item }: { item: Tweet }) => (
    <View style={[styles.tweetCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: colors.textPrimary }]}>{item.user.name}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14 }}>@{item.user.handle}</Text>
      </View>
      <Text style={[styles.tweetText, { color: colors.textPrimary }]}>{item.text}</Text>
      <View style={styles.tweetStats}>
        <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        {item.likes && (
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>❤️ {item.likes}</Text>
        )}
        {item.retweets && (
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>🔄 {item.retweets}</Text>
        )}
      </View>
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
          message="Failed to load tweets. Please try again."
          onRetry={handleRefresh}
        />
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No tweets available at the moment.
        </Text>
      </View>
    );
  };

  const tweets = data?.pages.flatMap(page => page.data) || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>X (Twitter)</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Latest crypto tweets and updates
        </Text>
      </View>

      <FlatList
        data={tweets}
        renderItem={renderTweet}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} colors={[colors.primary]} tintColor={colors.primary} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[styles.listContent, tweets.length === 0 && styles.emptyListContent]}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default XScreen;