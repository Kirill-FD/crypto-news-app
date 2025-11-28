import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { QueryClient, QueryClientProvider, dehydrate, hydrate } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { MMKV } from 'react-native-mmkv';

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

// const queryCacheStorage = new MMKV({ id: 'react-query-cache' });
const createQueryCacheStorage = () => {
  try {
    return new MMKV({ id: 'react-query-cache' });
  } catch (error) {
    console.warn(
      '[MMKV] Failed to initialize query cache storage. Falling back to in-memory storage.',
      error,
    );

    const map = new Map<string, string>();
    return {
      getString: (key: string) => map.get(key),
      set: (key: string, value: string) => map.set(key, value),
      delete: (key: string) => map.delete(key),
    } as Pick<MMKV, 'getString' | 'set' | 'delete'>;
  }
};

const queryCacheStorage = createQueryCacheStorage();
const QUERY_CACHE_KEY = 'tanstack-query-cache-v1';

const App: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>('light');

  const [isQueryCacheReady, setIsQueryCacheReady] = useState(false);
  const persistTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const cached = queryCacheStorage.getString(QUERY_CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        hydrate(queryClient, parsed);
      } catch (error) {
        console.warn('Failed to hydrate query cache, clearing stale data', error);
        queryCacheStorage.delete(QUERY_CACHE_KEY);
      }
    }

    const persistCache = () => {
      if (persistTimeout.current) clearTimeout(persistTimeout.current);
      persistTimeout.current = setTimeout(() => {
        try {
          const dehydrated = dehydrate(queryClient);
          queryCacheStorage.set(QUERY_CACHE_KEY, JSON.stringify(dehydrated));
        } catch (error) {
          console.warn('Failed to persist query cache', error);
        }
      }, 250);
    };

    const unsubscribeQuery = queryClient.getQueryCache().subscribe(persistCache);
    const unsubscribeMutations = queryClient.getMutationCache().subscribe(persistCache);

    setIsQueryCacheReady(true);
    persistCache();

    return () => {
      unsubscribeQuery();
      unsubscribeMutations();
      if (persistTimeout.current) clearTimeout(persistTimeout.current);
    };
  }, []);


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

  if (!isQueryCacheReady) {
    return null;
  }

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
