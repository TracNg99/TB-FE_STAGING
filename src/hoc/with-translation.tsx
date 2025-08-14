'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

import { useI18n } from '@/contexts/i18n-provider';

export interface WithTranslationProps {
  t: (key: string, options?: any) => string;
  i18n: {
    currentLanguage: string;
    changeLanguage: (language: string) => void;
    supportedLanguages: Array<{
      code: string;
      name: string;
      nativeName: string;
    }>;
    isLoading: boolean;
  };
}

export function withTranslation<P extends object>(
  WrappedComponent: React.ComponentType<P & WithTranslationProps>,
) {
  const WithTranslationComponent = (props: P) => {
    const i18nContext = useI18n();
    const { t } = useTranslation();

    const enhancedProps = {
      ...props,
      t,
      i18n: i18nContext,
    } as P & WithTranslationProps;

    return <WrappedComponent {...enhancedProps} />;
  };

  WithTranslationComponent.displayName = `withTranslation(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return WithTranslationComponent;
}
