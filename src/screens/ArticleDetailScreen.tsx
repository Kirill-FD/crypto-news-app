import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';

import { useTheme } from '../App';
import { RootStackParamList } from '../navigation/types';
import { useArticle } from '../hooks/useNews';
import { SmartImage } from '../components/SmartImage';
import { Loading } from '../components/Loading';
import { ErrorView } from '../components/ErrorView';
import { formatDate } from '../utils/format';
import styles from './ArticleDetailScreen.styles';

type ArticleDetailRouteProp = RouteProp<RootStackParamList, 'ArticleDetails'>;

const ArticleDetailScreen: React.FC = () => {
  const route = useRoute<ArticleDetailRouteProp>();
  const { colors } = useTheme();
  const { articleId } = route.params;

  const {
    data: article,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useArticle(articleId);

  if (isLoading && !article) {
    return <Loading message="Loading article..." fullScreen />;
  }

  if (error && !article) {
    return (
      <ErrorView
        message="Failed to load the article. Please try again."
        onRetry={refetch}
        fullScreen
      />
    );
  }

  if (!article) {
    return null;
  }

  const imageUri = article.imageUrl || 'https://placehold.co/800x500?text=Crypto+News';
  const sourceLabel = article.source || 'Crypto News Feed';
  const rawContent = article.content && article.content.trim().length > 0 ? article.content : article.summary;
  const normalizedContent = rawContent?.replace(/\r\n/g, '\n') ?? '';
  const doubleBreakParagraphs = normalizedContent
    ? normalizedContent
        .split(/\n{2,}/)
        .map(paragraph => paragraph.trim())
        .filter(Boolean)
    : [];
  const singleBreakParagraphs =
    doubleBreakParagraphs.length === 0 && normalizedContent
      ? normalizedContent
          .split(/\n/)
          .map(paragraph => paragraph.trim())
          .filter(Boolean)
      : [];
  const contentParagraphs = doubleBreakParagraphs.length > 0
    ? doubleBreakParagraphs
    : singleBreakParagraphs.length > 0
      ? singleBreakParagraphs
      : normalizedContent
        ? [normalizedContent.trim()]
        : [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <SmartImage uri={imageUri} style={styles.image} resizeMode="cover" />
        <View style={styles.body}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{article.title}</Text>
          <View style={styles.metaRow}>
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{sourceLabel}</Text>
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{formatDate(article.publishedAt)}</Text>
          </View>

          {article.tags?.length ? (
            <View style={styles.tagsContainer}>
              {article.tags.map((tag, index) => {
                const key =
                  (tag.id !== undefined && tag.id !== null ? String(tag.id) : undefined) ||
                  tag.slug ||
                  tag.name ||
                  `tag-${index}`;
                const label = tag.name || tag.slug || key;

                return (
                  <View
                    key={key}
                    style={[styles.tagChip, { borderColor: colors.border }]}
                  >
                    <Text style={[styles.tagText, { color: colors.textSecondary }]}>
                      {label}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : null}

          {article.tickers?.length ? (
            <View style={styles.tickersContainer}>
              {article.tickers.map((ticker, index) => {
                const key =
                  (ticker.id !== undefined && ticker.id !== null ? String(ticker.id) : undefined) ||
                  ticker.symbol ||
                  `ticker-${index}`;
                const symbolLabel = ticker.symbol || key;
                const nameLabel = ticker.name;

                return (
                  <View
                    key={key}
                    style={[styles.tickerChip, { backgroundColor: colors.card }]}
                  >
                    <Text style={[styles.tickerSymbol, { color: colors.textPrimary }]}>
                      {symbolLabel}
                    </Text>
                    {/* {nameLabel && (
                      <Text style={[styles.tickerName, { color: colors.textSecondary }]}>
                        {nameLabel}
                      </Text>
                    )} */}
                  </View>
                );
              })}
            </View>
          ) : null}

          <View style={styles.articleContent}>
            {contentParagraphs.map((paragraph, index) => (
              <Text
                key={`paragraph-${index}`}
                style={[styles.contentText, { color: colors.textPrimary }]}
              >
                {paragraph}
              </Text>
            ))}
          </View>

          {error && !isLoading && (
            <View style={styles.errorContainer}>
              <ErrorView
                message="Some data might be outdated. Tap to retry."
                onRetry={refetch}
              />
            </View>
          )}

          {isRefetching && (
            <View style={styles.errorContainer}>
              <Loading message="Refreshing article..." />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ArticleDetailScreen;

