// This file only exports constants and types, no React or i18next imports
export const defaultNS = 'common';

export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
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
