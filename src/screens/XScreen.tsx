import React from 'react';
import { FlatList, RefreshControl, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';

// import { Loading, ListSkeleton } from '../components/Loading';
import { ListSkeleton } from '../components/Loading';
import { ErrorView } from '../components/ErrorView';
// import { useTweets } from '../hooks/useTweets';
import { TweetCard } from '../components/TweetCard';
import { useTweetsFromUrls } from '../hooks/useTweets';
import { useTheme } from '../contexts/ThemeContext';
import styles from './XScreen.styles';
import { Tweet } from '../types';
import { testTweetUrls } from '../constants/testTweetsUrls';

// Memoized TweetCard to prevent re-renders when other widgets update
const MemoizedTweetCard = React.memo(TweetCard);

const XScreen: React.FC = () => {
  const { data, isLoading, error, refetch, isFetching } = useTweetsFromUrls(testTweetUrls);
  const { colors } = useTheme();
  const headerHeight = useHeaderHeight();

  const handleRefresh = () => {
    refetch();
  };

  const handleTweetPress = (_tweet: Tweet) => {
    // Tweet press handled in TweetCard component
  };

  const renderFooter = () => {
    // if (isFetchingNextPage) {
    //   return <ListSkeleton count={2} />;
    // }
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

  // const tweets = data?.pages.flatMap(page => page.data) || [];

  const tweets = data || [];

  return (
    <SafeAreaView edges={['left','right','bottom']} style={[styles.container, { backgroundColor: colors.background }]}> 
      <FlatList
        data={tweets}
        // renderItem={renderTweet}
        renderItem={({ item }) => <MemoizedTweetCard tweet={item} onPress={handleTweetPress} />}
        keyExtractor={(item) => item.id}
        refreshControl={
          // <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} colors={[colors.primary]} tintColor={colors.primary} progressViewOffset={headerHeight} />
          <RefreshControl
          refreshing={isLoading || isFetching}
          onRefresh={handleRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
          progressViewOffset={headerHeight}
        />
        }
        // onEndReached={handleLoadMore}
        // onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        ListHeaderComponent={
          <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}> 
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>X (Twitter)</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}> 
              Latest crypto tweets and updates
            </Text>
          </View>
        }
        // contentContainerStyle={[styles.listContent, tweets.length === 0 && styles.emptyListContent]}
        contentContainerStyle={[
          styles.listContent, 
          tweets.length === 0 && styles.emptyListContent,
          { paddingVertical: 0, paddingHorizontal: 0 }
        ]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
        removeClippedSubviews={false}
      />
    </SafeAreaView>
  );
};

export default XScreen;