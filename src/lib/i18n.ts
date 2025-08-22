// This file only exports constants and types, no React or i18next imports
export const defaultNS = 'common';

export const supportedLanguages = [
  { code: 'en', long_code: 'en-US', name: 'English', nativeName: 'English' },
  { code: 'ko', long_code: 'ko-KR', name: 'Korean', nativeName: '한국어' },
  { code: 'zh', long_code: 'zh-CN', name: 'Chinese', nativeName: '中文' },
  { code: 'fr', long_code: 'fr-FR', name: 'French', nativeName: 'Français' },
  { code: 'ja', long_code: 'ja-JP', name: 'Japanese', nativeName: '日本語' },
  { code: 'ru', long_code: 'ru-RU', name: 'Russian', nativeName: 'Русский' },
  {
    code: 'vi',
    long_code: 'vi-VN',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
  },
];

// Export type for resources
export type Resources = {
  en: { common: any };
  ko: { common: any };
  zh: { common: any };
  fr: { common: any };
  ja: { common: any };
  ru: { common: any };
  vi: { common: any };
};
