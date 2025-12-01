import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';

import { getUserPreferences, setUserPreferences, UserPreferences } from '../store/storage';

export type ThemeMode = 'light' | 'dark';

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
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
};

const getInitialTheme = (): ThemeMode => {
  const preferences = getUserPreferences();
  return preferences.theme;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme());

  useEffect(() => {
    const preferences = getUserPreferences();
    setTheme(preferences.theme);
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const isDark = theme === 'dark';
    return {
      theme,
      setTheme: (mode: ThemeMode) => {
        setTheme(mode);
        const currentPreferences: UserPreferences = getUserPreferences();
        if (currentPreferences.theme !== mode) {
          setUserPreferences({ theme: mode });
        }
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

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};


