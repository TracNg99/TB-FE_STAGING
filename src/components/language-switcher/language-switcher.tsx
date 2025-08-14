'use client';

import { Button, Loader, Menu, Text } from '@mantine/core';
import { IconCheck, IconLanguage } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { languageOptions } from '@/components/modals/WelcomeModal';
import { useI18n } from '@/contexts/i18n-provider';

interface LanguageSwitcherProps {
  variant?: 'button' | 'menu' | 'compact';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'menu',
  size = 'sm',
  showLabel = true,
}) => {
  const { currentLanguage, changeLanguage, supportedLanguages, isLoading } =
    useI18n();

  const currentLang = supportedLanguages.find(
    (lang) => lang.code === currentLanguage,
  );

  const { t } = useTranslation();

  if (variant === 'compact') {
    return (
      <Menu shadow="md" width={200} position="bottom-end">
        <Menu.Target>
          <Button
            className="bg-[#FF4B12]/40 hover:bg-[#FF4B12]/70 h-[42px] backdrop-blur-sm border-1 border-[#FF4B12]/40"
            size={size}
            loading={isLoading}
            disabled={isLoading}
          >
            {
              languageOptions.find(
                (lang) => lang.value.split('-')[0] === currentLang?.code,
              )?.flag
            }{' '}
            {currentLang?.code.toUpperCase() || 'EN'}
          </Button>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>{t('common.language')}</Menu.Label>
          {supportedLanguages.map((language) => (
            <Menu.Item
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              rightSection={
                currentLanguage === language.code ? (
                  <IconCheck size={16} />
                ) : null
              }
              disabled={isLoading}
            >
              <div>
                <Text size="sm" fw={500}>
                  {language.nativeName}
                </Text>
                <Text size="xs" c="dimmed">
                  {language.name}
                </Text>
              </div>
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    );
  }

  if (variant === 'button') {
    return (
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {supportedLanguages.map((language) => (
          <div key={language.code}>
            <div>
              {
                languageOptions.find((lang) => lang.label === language.name)
                  ?.flag
              }
            </div>
            <Button
              key={language.code}
              variant={currentLanguage === language.code ? 'filled' : 'outline'}
              size={size}
              onClick={() => changeLanguage(language.code)}
              disabled={isLoading}
            >
              {language.code.toUpperCase()}
            </Button>
          </div>
        ))}
      </div>
    );
  }

  // Default menu variant
  return (
    <Menu shadow="md" width={250} position="bottom-end">
      <Menu.Target>
        <Button
          variant="subtle"
          size={size}
          leftSection={
            isLoading ? <Loader size={16} /> : <IconLanguage size={16} />
          }
          disabled={isLoading}
        >
          {showLabel && (
            <>
              {currentLang?.nativeName || 'English'}
              {!isLoading && (
                <Text size="xs" c="dimmed" ml={4}>
                  ({currentLang?.code.toUpperCase() || 'EN'})
                </Text>
              )}
            </>
          )}
          {!showLabel && (currentLang?.code.toUpperCase() || 'EN')}
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>{t('common.language')}</Menu.Label>
        {supportedLanguages.map((language) => (
          <Menu.Item
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            rightSection={
              currentLanguage === language.code ? <IconCheck size={16} /> : null
            }
            disabled={isLoading}
          >
            <div>
              <Text size="sm" fw={500}>
                {language.nativeName}
              </Text>
              <Text size="xs" c="dimmed">
                {language.name}
              </Text>
            </div>
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
};
