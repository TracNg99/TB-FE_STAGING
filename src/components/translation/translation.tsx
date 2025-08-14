'use client';

import React from 'react';
import { Translation as I18nextTranslation } from 'react-i18next';

import { useI18n } from '@/contexts/i18n-provider';

interface TranslationProps {
  children: (
    t: (key: string, options?: any) => string,
    options?: {
      i18n: any;
      lng: string;
    },
  ) => React.ReactNode;
  ns?: string | string[];
}

/**
 * Custom Translation component that integrates with our I18nProvider context
 * This ensures that language changes from our context are properly reflected
 * in the Translation component from react-i18next
 */
export const Translation: React.FC<TranslationProps> = ({
  children,
  ns = 'common',
}) => {
  const { currentLanguage, isLoading } = useI18n();

  // Don't render until i18n is ready
  if (isLoading) {
    return null;
  }

  return (
    <I18nextTranslation ns={ns}>
      {(t, { i18n }) => {
        // Force re-render when our context language changes
        // by passing the current language as a key dependency
        return (
          <React.Fragment key={currentLanguage}>
            {children(t, { i18n, lng: currentLanguage })}
          </React.Fragment>
        );
      }}
    </I18nextTranslation>
  );
};

export default Translation;
