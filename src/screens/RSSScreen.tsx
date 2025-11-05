import React, { useState } from 'react';
import { FlatList, RefreshControl, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';

import { Loading, ListSkeleton } from '../components/Loading';
import { ErrorView } from '../components/ErrorView';
import { useAllNews, useSearchNews } from '../hooks/useNews';
import { News } from '../types';
import { debounce } from '../utils/format';
import { useTheme } from '../App';
import styles from './RSSScreen.styles';

const RSSScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { colors } = useTheme();
  const headerHeight = useHeaderHeight();

  const {
    data: allNewsData,
    isLoading: allNewsLoading,
    error: allNewsError,
    refetch: refetchAllNews,
    fetchNextPage: fetchNextAllNews,
    hasNextPage: hasNextAllNews,
    isFetchingNextPage: isFetchingNextAllNews,
  } = useAllNews();

  const {
    data: searchData,
    isLoading: searchLoading,
    error: searchError,
    refetch: refetchSearch,
    fetchNextPage: fetchNextSearch,
    hasNextPage: hasNextSearch,
    isFetchingNextPage: isFetchingNextSearch,
  } = useSearchNews(searchQuery);

  const debouncedSearch = debounce((query: string) => {
    setSearchQuery(query);
    setIsSearching(query.length > 0);
  }, 300);

  const handleSearchChange = (text: string) => {
    debouncedSearch(text);
  };

  const handleRefresh = () => {
    if (isSearching) {
      refetchSearch();
    } else {
      refetchAllNews();
    }
  };

  const handleLoadMore = () => {
    if (isSearching) {
      if (hasNextSearch && !isFetchingNextSearch) {
        fetchNextSearch();
      }
    } else {
      if (hasNextAllNews && !isFetchingNextAllNews) {
        fetchNextAllNews();
      }
    }
  };

  const handleNewsPress = (news: News) => {
    // News press handled in NewsCard component (expand/collapse)
  };

  const renderNews = ({ item }: { item: News }) => (
    <View style={[styles.newsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.newsTitle, { color: colors.textPrimary }]}>{item.title}</Text>
      <Text style={[styles.newsSummary, { color: colors.textSecondary }]}>{item.summary}</Text>
      <View style={styles.newsMeta}>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{item.source}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{new Date(item.publishedAt).toLocaleDateString()}</Text>
      </View>
    </View>
  );

  const renderFooter = () => {
    const isFetching = isSearching ? isFetchingNextSearch : isFetchingNextAllNews;
    if (isFetching) {
      return <ListSkeleton count={2} />;
    }
    return null;
  };

  const renderEmpty = () => {
    const isLoading = isSearching ? searchLoading : allNewsLoading;
    const error = isSearching ? searchError : allNewsError;

    if (isLoading) {
      return <ListSkeleton count={5} />;
    }

    if (error) {
      return (
        <ErrorView
          message="Failed to load news. Please try again."
          onRetry={handleRefresh}
        />
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {isSearching 
            ? 'No news found matching your search.' 
            : 'No news available at the moment.'
          }
        </Text>
      </View>
    );
  };

  const newsData = isSearching ? searchData : allNewsData;
  const news = newsData?.pages.flatMap(page => page.data) || [];
  const isLoading = isSearching ? searchLoading : allNewsLoading;

  return (
    <SafeAreaView edges={['left','right','bottom']} style={[styles.container, { backgroundColor: colors.background }]}> 
      <FlatList
        data={news}
        renderItem={renderNews}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} colors={[colors.primary]} tintColor={colors.primary} progressViewOffset={headerHeight} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        ListHeaderComponent={
          <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}> 
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>RSS News</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}> 
              Latest cryptocurrency news and updates
            </Text>

            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: colors.background, borderColor: colors.border }]}> 
              <Text style={[styles.searchIcon, { color: colors.textSecondary }]}>🔍</Text>
              <TextInput
                placeholder="Search news..."
                placeholderTextColor={colors.textSecondary}
                style={[styles.searchInput, { color: colors.textPrimary }]}
                onChangeText={handleSearchChange}
                defaultValue={searchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery('');
                    setIsSearching(false);
                  }}
                  style={styles.clearButton}
                >
                  <Text style={{ color: colors.textSecondary }}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        }
        contentContainerStyle={[styles.listContent, news.length === 0 && styles.emptyListContent]}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default RSSScreen;