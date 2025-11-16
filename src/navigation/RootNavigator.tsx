import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootStackParamList, MainTabParamList } from './types';
import HomeScreen from '../screens/HomeScreen';
import XScreen from '../screens/XScreen';
import YouTubeListScreen from '../screens/YouTubeListScreen';
import YouTubePlayerScreen from '../screens/YouTubePlayerScreen';
import RSSScreen from '../screens/RSSScreen';
import ArticleDetailScreen from '../screens/ArticleDetailScreen';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../App';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
  const { colors, theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: 'Crypto News',
        headerRight: () => <ThemeToggle />,
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.textPrimary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabIcon icon="🏠" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="X"
        component={XScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabIcon icon="🐦" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="YouTube"
        component={YouTubeListScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabIcon icon="📺" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="RSS"
        component={RSSScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabIcon icon="📰" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

interface TabIconProps {
  icon: string;
  color: string;
  size: number;
}

const TabIcon: React.FC<TabIconProps> = ({ icon, color, size }) => {
  return (
    <Text style={{ fontSize: size, color }}>
      {icon}
    </Text>
  );
};

const RootNavigator: React.FC = () => {
  const { theme, colors } = useTheme();
  const navTheme: Theme = theme === 'dark' ? DarkTheme : DefaultTheme;
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen
            name="YouTubePlayer"
            component={YouTubePlayerScreen}
            options={{
              headerShown: true,
              title: 'Video Player',
              headerStyle: {
                backgroundColor: '#000000',
              },
              headerTintColor: '#ffffff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen
            name="ArticleDetails"
            component={ArticleDetailScreen}
            options={{
              headerShown: true,
              title: 'Article',
              headerStyle: {
                backgroundColor: colors.card,
              },
              headerTintColor: colors.textPrimary,
              headerShadowVisible: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default RootNavigator;
