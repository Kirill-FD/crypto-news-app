import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SmartImage } from './SmartImage';
import { formatDate, formatViewCount } from '../utils/format';
import { Video } from '../types';

interface VideoCardProps {
  video: Video;
  onPress: (video: Video) => void;
  showStats?: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onPress,
  showStats = true,
}) => {
  return (
    <TouchableOpacity
      onPress={() => onPress(video)}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-4"
      activeOpacity={0.8}
    >
      <View className="relative">
        <SmartImage
          uri={video.thumbnail}
          className="w-full h-48"
          resizeMode="cover"
        />
        
        {/* Duration badge */}
        {video.duration && (
          <View className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded">
            <Text className="text-white text-xs font-medium">
              {video.duration}
            </Text>
          </View>
        )}
      </View>
      
      <View className="p-4">
        <Text 
          className="text-gray-900 dark:text-gray-100 text-lg font-semibold mb-2 leading-6"
          numberOfLines={2}
        >
          {video.title}
        </Text>
        
        {showStats && (
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-500 dark:text-gray-400 text-sm">
              {formatDate(video.publishedAt)}
            </Text>
            
            {video.viewCount && (
              <Text className="text-gray-500 dark:text-gray-400 text-sm">
                {formatViewCount(video.viewCount)}
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

interface CompactVideoCardProps {
  video: Video;
  onPress: (video: Video) => void;
}

export const CompactVideoCard: React.FC<CompactVideoCardProps> = ({
  video,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={() => onPress(video)}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-3"
      activeOpacity={0.8}
    >
      <View className="flex-row">
        <View className="relative w-32 h-20">
          <SmartImage
            uri={video.thumbnail}
            className="w-full h-full"
            resizeMode="cover"
          />
          
          {video.duration && (
            <View className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 rounded">
              <Text className="text-white text-xs">
                {video.duration}
              </Text>
            </View>
          )}
        </View>
        
        <View className="flex-1 p-3">
          <Text 
            className="text-gray-900 dark:text-gray-100 font-medium mb-1 leading-5"
            numberOfLines={2}
          >
            {video.title}
          </Text>
          
          <Text className="text-gray-500 dark:text-gray-400 text-xs">
            {formatDate(video.publishedAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};



