'use client';

import { Button, Container, PasswordInput, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { Translation } from '@/components/translation';
import { useResetPasswordMutation } from '@/store/redux/slices/user/auth';

function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [resetPassword] = useResetPasswordMutation();

  const handleSubmit = async (
    event: React.FormEvent,
    notificationTexts: {
      success: {
        title: string;
        message: string;
      };
      error: {
        title: string;
        message: string;
      };
    },
  ) => {
    event.preventDefault();

    try {
      const { error } = await resetPassword({ password }).unwrap();
      if (error) {
        notifications.show({
          title: notificationTexts.error.title,
          message: notificationTexts.error.message,
          color: 'red',
          position: 'top-right',
        });
      } else {
        notifications.show({
          title: notificationTexts.success.title,
          message: notificationTexts.success.message,
          color: 'green',
          position: 'top-right',
        });
        setSubmitted(true);
        localStorage.setItem('jwt', '');
        localStorage.setItem('userId', '');
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      notifications.show({
        title: notificationTexts.error.title,
        message: notificationTexts.error.message,
        color: 'red',
        position: 'top-right',
      });
    }
  };

  return (
    <Translation>
      {(t) => (
        <div className="min-h-screen flex items-center justify-center px-4">
          <Container size="xs" className="w-full max-w-[400px]">
            {!submitted ? (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <Title order={1} className="text-2xl font-bold">
                    {t('auth.resetPassword.title') || 'Reset Password'}
                  </Title>
                  <Text c="dimmed">
                    {t('auth.resetPassword.description') ||
                      'Enter your new password'}
                  </Text>
                </div>

                <form
                  onSubmit={(e) =>
                    handleSubmit(e, {
                      success: {
                        title:
                          t('auth.resetPassword.successTitle') || 'Success',
                        message:
                          t('auth.resetPassword.successMessage') ||
                          'Password reset successfully!',
                      },
                      error: {
                        title: t('auth.resetPassword.errorTitle') || 'Error',
                        message:
                          t('auth.resetPassword.errorMessage') ||
                          'Failed to reset password',
                      },
                    })
                  }
                  className="space-y-4"
                >
                  <PasswordInput
                    label={t('auth.password') || 'Password'}
                    placeholder=""
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    classNames={{
                      input: 'h-[42px]',
                    }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    className="bg-[#FF4B12] hover:bg-[#FF4B12]/90 h-[42px]"
                  >
                    {t('auth.resetPassword.submit') || 'Submit'}
                  </Button>
                </form>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <Title order={1} className="text-2xl font-bold">
                  {t('auth.resetPassword.title') || 'Password Reset'}
                </Title>
                <Text c="dimmed">
                  {t('auth.resetPassword.successMessage') ||
                    'Your password has been reset.'}
                </Text>
                <Button
                  onClick={() => router.push('/auth/login')}
                  className="bg-[#FF4B12] hover:bg-[#FF4B12]/90 h-[42px]"
                  fullWidth
                >
                  {t('auth.resetPassword.goToLogin') || 'Go To Login'}
                </Button>
              </div>
            )}
          </Container>
        </div>
      )}
    </Translation>
  );
}

export default ResetPasswordPage;
