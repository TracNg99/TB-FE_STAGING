# Translation Component Integration

This document explains how to use the `<Translation>` component that integrates with your custom i18n context.

## Problem Solved

The original `<Translation>` component from `react-i18next` was not responding to language changes handled by your custom `I18nProvider` context. This custom wrapper ensures proper synchronization.

## Usage

### Basic Usage

```tsx
import { Translation } from '@/components/translation';

function MyComponent() {
  return (
    <Translation>
      {(t) => (
        <div>
          <h1>{t('navigation.home')}</h1>
          <p>{t('common.loading')}</p>
        </div>
      )}
    </Translation>
  );
}
```

### With Specific Namespace

```tsx
import { Translation } from '@/components/translation';

function MyComponent() {
  return (
    <Translation ns="common">
      {(t) => (
        <div>
          <h1>{t('experiences.title')}</h1>
          <p>{t('experiences.description')}</p>
        </div>
      )}
    </Translation>
  );
}
```

### With Multiple Namespaces

```tsx
import { Translation } from '@/components/translation';

function MyComponent() {
  return (
    <Translation ns={['common', 'auth']}>
      {(t) => (
        <div>
          <h1>{t('common:navigation.home')}</h1>
          <p>{t('auth:login.title')}</p>
        </div>
      )}
    </Translation>
  );
}
```

## Key Features

1. **Context Integration**: Automatically syncs with your `I18nProvider` context
2. **Language Change Reactivity**: Re-renders when language changes through your context
3. **Loading State Handling**: Prevents rendering until i18n is fully initialized
4. **Namespace Support**: Supports single or multiple namespaces
5. **Type Safety**: Maintains TypeScript support from react-i18next

## How It Works

1. The component listens to your `I18nProvider` context for language changes
2. It uses React's `key` prop to force re-renders when the language changes
3. It wraps the original `react-i18next` `Translation` component
4. It prevents rendering during the loading state to avoid flicker

## Migration from react-i18next Translation

Simply replace your imports:

```tsx
// Before
import { Translation } from 'react-i18next';

// After
import { Translation } from '@/components/translation';
```

The API remains exactly the same, but now it will properly respond to language changes from your context.

## Alternative Approaches

If you prefer to use hooks instead of the render prop pattern, you can still use:

- `useTranslation()` from `@/hooks/use-translation`
- `useT()` from `@/hooks/use-translation`
- `withTranslation()` HOC from `@/hoc/with-translation`

These are already integrated with your context and will work seamlessly.
