# Travel Buddy i18n Implementation

This document describes the internationalization (i18n) implementation for the Travel Buddy frontend application using react-i18next.

## Features

- **6 Supported Languages**: English, Korean, Chinese (Mandarin), French, Japanese, Russian
- **HOC Pattern**: Higher-Order Components for wrapping components with translation functionality
- **Context Provider**: Centralized language management with React Context
- **Multiple Usage Patterns**: Hooks, HOCs, and direct translation access
- **Language Persistence**: Automatic language preference saving to localStorage
- **TypeScript Support**: Full type safety for translation keys
- **SSR Compatible**: Works with Next.js Server-Side Rendering

## File Structure

```
src/
├── lib/
│   └── i18n.ts                 # i18n configuration
├── locales/
│   ├── en/common.json          # English translations
│   ├── ko/common.json          # Korean translations
│   ├── zh/common.json          # Chinese translations
│   ├── fr/common.json          # French translations
│   ├── ja/common.json          # Japanese translations
│   └── ru/common.json          # Russian translations
├── contexts/
│   └── i18n-provider.tsx       # i18n Context Provider
├── hoc/
│   └── with-translation.tsx    # Higher-Order Components
├── hooks/
│   └── use-translation.ts      # Custom translation hooks
├── components/
│   └── language-switcher/      # Language switcher component
└── types/
    └── i18next.d.ts           # TypeScript declarations
```

## Usage Patterns

### 1. Using Hooks (Recommended)

```tsx
import { useT, useTranslation } from '@/hooks/use-translation';

// Full hook with language management
const MyComponent = () => {
  const { t, i18n } = useTranslation();

  return (
    <div>
      <h1>{t('navigation.home')}</h1>
      <p>Current language: {i18n.currentLanguage}</p>
      <button onClick={() => i18n.changeLanguage('ko')}>
        Switch to Korean
      </button>
    </div>
  );
};

// Simple translation-only hook
const SimpleComponent = () => {
  const t = useT();
  return <h1>{t('common.welcome')}</h1>;
};
```

### 2. Using HOC Pattern

```tsx
import { WithTranslationProps, withTranslation } from '@/hoc/with-translation';

interface Props extends WithTranslationProps {
  customProp: string;
}

const MyComponent: React.FC<Props> = ({ t, i18n, customProp }) => {
  return (
    <div>
      <h1>{t('navigation.home')}</h1>
      <p>{customProp}</p>
    </div>
  );
};

export default withTranslation(MyComponent);
```

### 3. Using Language Switcher

```tsx
import { LanguageSwitcher } from '@/components/language-switcher';

// Different variants
<LanguageSwitcher variant="menu" size="sm" />
<LanguageSwitcher variant="compact" size="xs" />
<LanguageSwitcher variant="button" size="md" />
```

## Translation Keys Structure

```json
{
  "navigation": {
    "home": "Home",
    "discoveries": "Discoveries",
    "stories": "Stories"
  },
  "common": {
    "loading": "Loading...",
    "error": "Error",
    "success": "Success"
  },
  "auth": {
    "login": "Login",
    "register": "Register"
  },
  "experiences": {
    "title": "Experiences",
    "newExperience": "New Experience"
  }
}
```

## Adding New Languages

1. Create a new translation file in `src/locales/{language-code}/common.json`
2. Add the language to `supportedLanguages` in `src/lib/i18n.ts`
3. Import and add to resources in `src/lib/i18n.ts`

## Adding New Translation Keys

1. Add the key to all language files in `src/locales/*/common.json`
2. TypeScript will automatically provide type checking for the new keys

## Best Practices

1. **Use semantic keys**: `auth.login` instead of `loginButton`
2. **Group related translations**: Keep navigation items under `navigation.*`
3. **Use interpolation for dynamic content**: `"welcome": "Hello {{name}}!"`
4. **Provide fallbacks**: Always ensure English translations exist
5. **Use the useT hook** for simple translation-only needs
6. **Use the full useTranslation hook** when you need language switching
7. **Use HOCs** for class components or when you prefer the HOC pattern

## Language Codes

- `en` - English
- `ko` - Korean (한국어)
- `zh` - Chinese (中文)
- `fr` - French (Français)
- `ja` - Japanese (日本語)
- `ru` - Russian (Русский)

## Integration with Existing Components

The i18n system is now integrated into the app layout and ready to use. Simply import the hooks or HOCs in your existing components and replace hardcoded strings with translation keys.

Example migration:

```tsx
// Before
const title = "Welcome to Travel Buddy";

// After
const { t } = useTranslation();
const title = t('modals.welcome.title');
```
