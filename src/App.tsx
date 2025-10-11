import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

import RootNavigator from './navigation/RootNavigator';
import { getUserPreferences, setUserPreferences, UserPreferences } from './store/storage';

type ThemeMode = 'light' | 'dark';
interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  colors: {
    background: string;
    card: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    primary: string;
  };
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>('light');

  useEffect(() => {
    const prefs = getUserPreferences();
    setTheme(prefs.theme);
  }, []);

  const value: ThemeContextValue = useMemo(() => {
    const isDark = theme === 'dark';
    return {
      theme,
      setTheme: (mode: ThemeMode) => {
        setTheme(mode);
        const prev: UserPreferences = getUserPreferences();
        setUserPreferences({ theme: mode });
      },
      colors: {
        background: isDark ? '#0b0f14' : '#f9fafb',
        card: isDark ? '#111827' : '#ffffff',
        textPrimary: isDark ? '#f3f4f6' : '#111827',
        textSecondary: isDark ? '#d1d5db' : '#6b7280',
        border: isDark ? '#1f2937' : '#e5e7eb',
        primary: '#3b82f6',
      },
    };
  }, [theme]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeContext.Provider value={value}>
          <RootNavigator />
          <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        </ThemeContext.Provider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
};

export default App;
