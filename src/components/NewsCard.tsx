import React, { useState } from 'react';
import { View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SmartImage } from './SmartImage';
import { formatDate, truncateText } from '../utils/format';
import { News } from '../types';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface NewsCardProps {
  news: News;
  onPress?: (news: News) => void;
  expandable?: boolean;
  maxSummaryLength?: number;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  news,
  onPress,
  expandable = true,
  maxSummaryLength = 150,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const placeholderImage = 'https://placehold.co/600x400?text=Crypto+News';
  const imageUri = news.imageUrl || placeholderImage;
  const sourceLabel = news.source || 'Crypto News Feed';
  const categoryLabel = news.category || news.tags?.[0]?.name;

  const handlePress = () => {
    if (expandable) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsExpanded(!isExpanded);
    }
    onPress?.(news);
  };

  const displayText = isExpanded ? news.content : truncateText(news.summary, maxSummaryLength);

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-4"
      activeOpacity={0.8}
    >
      <SmartImage
        uri={imageUri}
        className="w-full h-48"
        resizeMode="cover"
      />
      
      <View className="p-4">
        <Text 
          className="text-gray-900 dark:text-gray-100 text-lg font-semibold mb-2 leading-6"
          numberOfLines={isExpanded ? undefined : 2}
        >
          {news.title}
        </Text>
        
        <Text className="text-gray-600 dark:text-gray-300 text-base leading-6 mb-3">
          {displayText}
        </Text>
        
        {expandable && news.summary !== news.content && (
          <TouchableOpacity
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setIsExpanded(!isExpanded);
            }}
            className="self-start"
            activeOpacity={0.8}
          >
            <Text className="text-blue-600 dark:text-blue-400 font-medium">
              {isExpanded ? 'Show Less' : 'Read More'}
            </Text>
          </TouchableOpacity>
        )}
        
        <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <View className="flex-row items-center">
            <Text className="text-gray-500 dark:text-gray-400 text-sm">
              {sourceLabel}
            </Text>
            {(categoryLabel) && (
              <>
                <Text className="text-gray-400 dark:text-gray-500 mx-2">•</Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm">
                  {categoryLabel}
                </Text>
              </>
            )}
          </View>
          
          <Text className="text-gray-500 dark:text-gray-400 text-sm">
            {formatDate(news.publishedAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

interface CompactNewsCardProps {
  news: News;
  onPress?: (news: News) => void;
}

export const CompactNewsCard: React.FC<CompactNewsCardProps> = ({
  news,
  onPress,
}) => {
  const placeholderImage = 'https://placehold.co/400x400?text=Crypto+News';
  const imageUri = news.imageUrl || placeholderImage;
  const sourceLabel = news.source || 'Crypto News Feed';

  return (
    <TouchableOpacity
      onPress={() => onPress?.(news)}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-3"
      activeOpacity={0.8}
    >
      <View className="flex-row">
        <SmartImage
          uri={imageUri}
          className="w-24 h-24"
          resizeMode="cover"
        />
        
        <View className="flex-1 p-3">
          <Text 
            className="text-gray-900 dark:text-gray-100 font-medium mb-1 leading-5"
            numberOfLines={2}
          >
            {news.title}
          </Text>
          
          <Text 
            className="text-gray-600 dark:text-gray-300 text-sm leading-4 mb-2"
            numberOfLines={2}
          >
            {truncateText(news.summary, 100)}
          </Text>
          
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-500 dark:text-gray-400 text-xs">
              {sourceLabel}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-xs">
              {formatDate(news.publishedAt)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};



