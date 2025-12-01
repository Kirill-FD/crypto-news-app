import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { AppLanguage, getUserPreferences, setUserPreferences } from '../store/storage';
import { translations, TranslationKey } from '../i18n/translations';

interface LanguageContextValue {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  availableLanguages: { value: AppLanguage; label: string }[];
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const useTranslation = (): LanguageContextValue => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

const getInitialLanguage = (): AppLanguage => {
  const preferences = getUserPreferences();
  return preferences.language ?? 'en';
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>(getInitialLanguage());

  useEffect(() => {
    const preferences = getUserPreferences();
    if (preferences.language !== language) {
      setLanguageState(preferences.language ?? 'en');
    }
  }, []);

  const t = useMemo(
    () =>
      (key: TranslationKey, params?: Record<string, string | number>) => {
        const template = translations[language]?.[key] ?? translations.en[key] ?? key;

        if (!params) return template;

        return Object.keys(params).reduce((result, paramKey) => {
          const value = params[paramKey];
          return result.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(value));
        }, template);
      },
    [language],
  );

  const setLanguage = useCallback((nextLanguage: AppLanguage) => {
    setLanguageState(nextLanguage);
    const currentPreferences = getUserPreferences();
    if (currentPreferences.language !== nextLanguage) {
      setUserPreferences({ language: nextLanguage });
    }
  }, []);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage,
    t,
    availableLanguages: [
      { value: 'en', label: translations[language].english },
      { value: 'es', label: translations[language].spanish },
      { value: 'ru', label: translations[language].russian },
    ],
  }), [language, setLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};