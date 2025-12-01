import React, { useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider, dehydrate, hydrate } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { MMKV } from 'react-native-mmkv';
import { LanguageProvider } from './contexts/LanguageContext';

import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import RootNavigator from './navigation/RootNavigator';

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

type QueryCacheStorage = Pick<MMKV, 'getString' | 'set' | 'delete'>;

const createInMemoryCacheStorage = (): QueryCacheStorage => {
  const map = new Map<string, string>();
  return {
    getString: (key: string) => map.get(key),
    set: (key: string, value: string) => {
      map.set(key, value);
    },
    delete: (key: string) => {
      map.delete(key);
    },
  };
};

const hasTurboModuleSupport =
  typeof globalThis !== 'undefined' && Boolean((globalThis as any).__turboModuleProxy);

const createQueryCacheStorage = (): QueryCacheStorage => {
  if (!hasTurboModuleSupport) {
    console.warn(
      '[MMKV] TurboModules are disabled; query cache persistence will use in-memory storage.',
    );
    return createInMemoryCacheStorage();
  }

  try {
    return new MMKV({ id: 'react-query-cache' });
  } catch (error) {
    console.warn(
      '[MMKV] Failed to initialize query cache storage. Falling back to in-memory storage.',
      error,
    );
    return createInMemoryCacheStorage();
  }
};

const queryCacheStorage = createQueryCacheStorage();
const QUERY_CACHE_KEY = 'tanstack-query-cache-v1';

const App: React.FC = () => {
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


  if (!isQueryCacheReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        {/* <ThemeProvider>
          <AppContent />
        </ThemeProvider> */}
        <LanguageProvider>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
};

const AppContent: React.FC = () => {
  const { theme } = useTheme();

  return (
    <>
      <RootNavigator />
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </>
  );
};

export default App;
