import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { SmartImage } from './SmartImage';
import { TweetWidget } from './TweetWidget';
import { formatDate, formatLikeCount } from '../utils/format';
import { Tweet } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface TweetCardProps {
  tweet: Tweet;
  onPress?: (tweet: Tweet) => void;
  showStats?: boolean;
}

export const TweetCard: React.FC<TweetCardProps> = ({
  tweet,
  onPress,
  showStats = true,
}) => {
  const { t } = useTranslation();

  const handleExternalLink = async () => {
    if (await Linking.canOpenURL(tweet.url)) {
      await Linking.openURL(tweet.url);
    }
  };

  // If we have embed HTML, show widget only (it includes all info)
  if (tweet.embedHtml) {
    return (
      <View style={{ margin: 0, padding: 0, marginVertical: 0, marginHorizontal: 0, marginBottom: 0 }}>
        <TweetWidget 
          embedHtml={tweet.embedHtml} 
          tweetUrl={tweet.url}
          onLoad={() => console.log('Tweet widget loaded')}
          onError={(error) => console.warn('Tweet widget error:', error)}
        />
      </View>
    );
  }

  // Fallback: Show custom tweet card
  return (
    <TouchableOpacity
      onPress={() => onPress?.(tweet)}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4"
      activeOpacity={0.8}
    >
      {/* User info */}
      <View className="flex-row items-center mb-3">
        <SmartImage
          uri={tweet.user.avatar}
          className="w-10 h-10 rounded-full mr-3"
          resizeMode="cover"
        />
        
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="text-gray-900 dark:text-gray-100 font-semibold mr-2">
              {tweet.user.name}
            </Text>
            {tweet.user.verified && (
              <Text className="text-blue-500">✓</Text>
            )}
          </View>
          
          <Text className="text-gray-500 dark:text-gray-400 text-sm">
            @{tweet.user.handle}
          </Text>
        </View>
        
        <TouchableOpacity
          onPress={handleExternalLink}
          className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full"
          activeOpacity={0.8}
        >
          <Text className="text-gray-600 dark:text-gray-300">🔗</Text>
        </TouchableOpacity>
      </View>
      
      {/* Tweet content */}
      <Text className="text-gray-900 dark:text-gray-100 text-base leading-6 mb-3">
        {tweet.text}
      </Text>

      {tweet.mediaUrl && (
        <TouchableOpacity
          onPress={handleExternalLink}
          activeOpacity={0.9}
          className="mb-3"
        >
          <View className="relative">
            <SmartImage
              uri={tweet.mediaUrl}
              className="w-full h-52 rounded-lg"
              resizeMode="cover"
            />

            {tweet.mediaType === 'video' && (
              <>
                <View className="absolute inset-0 bg-black/20 rounded-lg" />
                <View className="absolute inset-0 items-center justify-center">
                  <View className="bg-black/70 rounded-full p-4">
                    <Text className="text-white text-2xl">▶️</Text>
                  </View>
                </View>
                <View className="absolute bottom-3 left-3 bg-black/70 px-2 py-1 rounded-full">
                  {/* <Text className="text-white text-xs">Видео</Text> */}
                  <Text className="text-white text-xs">{t('videoLabel')}</Text>
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
      )}
      
      {/* Stats */}
      {showStats && (
        <View className="flex-row items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <Text className="text-gray-500 dark:text-gray-400 text-sm">
            {formatDate(tweet.createdAt)}
          </Text>
          
          <View className="flex-row items-center space-x-4">
            {tweet.likes && (
              <View className="flex-row items-center">
                <Text className="text-gray-500 dark:text-gray-400 text-sm mr-1">
                  ❤️
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm">
                  {formatLikeCount(tweet.likes)}
                </Text>
              </View>
            )}
            
            {tweet.retweets && (
              <View className="flex-row items-center">
                <Text className="text-gray-500 dark:text-gray-400 text-sm mr-1">
                  🔄
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm">
                  {formatLikeCount(tweet.retweets)}
                </Text>
              </View>
            )}
            
            {tweet.replies && (
              <View className="flex-row items-center">
                <Text className="text-gray-500 dark:text-gray-400 text-sm mr-1">
                  💬
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm">
                  {formatLikeCount(tweet.replies)}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

interface CompactTweetCardProps {
  tweet: Tweet;
  onPress?: (tweet: Tweet) => void;
}

export const CompactTweetCard: React.FC<CompactTweetCardProps> = ({
  tweet,
  onPress,
}) => {
  const handleExternalLink = async () => {
    if (await Linking.canOpenURL(tweet.url)) {
      await Linking.openURL(tweet.url);
    }
  };

  return (
    <TouchableOpacity
      onPress={() => onPress?.(tweet)}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 mb-2"
      activeOpacity={0.8}
    >
      <View className="flex-row items-center">
        <SmartImage
          uri={tweet.user.avatar}
          className="w-8 h-8 rounded-full mr-3"
          resizeMode="cover"
        />
        
        <View className="flex-1">
          <Text className="text-gray-900 dark:text-gray-100 font-medium mb-1">
            {tweet.user.name}
          </Text>
          <Text 
            className="text-gray-600 dark:text-gray-400 text-sm leading-5"
            numberOfLines={2}
          >
            {tweet.text}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">
            {formatDate(tweet.createdAt)}
          </Text>
        </View>
        
        <TouchableOpacity
          onPress={handleExternalLink}
          className="bg-gray-100 dark:bg-gray-700 p-1.5 rounded-full ml-2"
          activeOpacity={0.8}
        >
          <Text className="text-gray-600 dark:text-gray-300 text-xs">🔗</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};



