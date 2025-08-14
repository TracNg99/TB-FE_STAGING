'use client';

import i18n from 'i18next';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { initReactI18next } from 'react-i18next';

import { supportedLanguages } from '@/lib/i18n';

interface I18nContextType {
  currentLanguage: string;
  changeLanguage: (language: string) => Promise<void>;
  supportedLanguages: typeof supportedLanguages;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: React.ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(true);
  const [i18nInitialized, setI18nInitialized] = useState(false);

  useEffect(() => {
    const initializeI18n = async () => {
      try {
        // Only initialize once
        if (i18nInitialized) return;

        // Initialize i18n with resources
        await i18n.use(initReactI18next).init({
          lng: 'en',
          fallbackLng: 'en',
          defaultNS: 'common',
          resources: {
            en: { common: (await import('@/locales/en/common.json')).default },
            ko: { common: (await import('@/locales/ko/common.json')).default },
            zh: { common: (await import('@/locales/zh/common.json')).default },
            fr: { common: (await import('@/locales/fr/common.json')).default },
            ja: { common: (await import('@/locales/ja/common.json')).default },
            ru: { common: (await import('@/locales/ru/common.json')).default },
            vi: { common: (await import('@/locales/vi/common.json')).default },
          },
          interpolation: {
            escapeValue: false,
          },
          react: {
            useSuspense: false,
          },
        });

        setI18nInitialized(true);

        // Listen to i18next language changes to sync with Translation component
        const handleLanguageChange = (lng: string) => {
          setCurrentLanguage(lng);
          document.documentElement.lang = lng;
        };

        i18n.on('languageChanged', handleLanguageChange);

        // Load saved language from localStorage
        const savedLanguage = sessionStorage.getItem('language');
        if (
          savedLanguage &&
          supportedLanguages.some(
            (lang) => lang.code === savedLanguage.split('-')[0],
          )
        ) {
          await i18n.changeLanguage(savedLanguage.split('-')[0]);
          setCurrentLanguage(savedLanguage.split('-')[0]);
        } else {
          setCurrentLanguage(i18n.language || 'en');
        }

        // Update HTML lang attribute
        document.documentElement.lang = i18n.language || 'en';

        // Cleanup function
        return () => {
          i18n.off('languageChanged', handleLanguageChange);
        };
      } catch (error) {
        console.error('Failed to initialize i18n:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const cleanup = initializeI18n();

    // Return cleanup function for useEffect
    return () => {
      cleanup?.then?.((cleanupFn) => cleanupFn?.());
    };
  }, [i18nInitialized]);

  const changeLanguage = async (language: string) => {
    if (isLoading || !i18nInitialized) return;

    setIsLoading(true);
    try {
      await i18n.changeLanguage(language);
      setCurrentLanguage(language);
      sessionStorage.setItem('language', language);
      document.documentElement.lang = language;
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: I18nContextType = {
    currentLanguage,
    changeLanguage,
    supportedLanguages,
    isLoading,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
