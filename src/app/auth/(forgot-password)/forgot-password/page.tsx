'use client';

import { Button, Container, Text, TextInput, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { Translation } from '@/components/translation';
import {
  useForgotPasswordMutation,
  useVerifyOTPMutation,
} from '@/store/redux/slices/user/auth';

function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [verifyOTP, { isLoading: isLoadingVerifyOTP }] = useVerifyOTPMutation();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleVerifyOTP = async (
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
      const { access_token, userId, error } = await verifyOTP({
        email,
        token,
      }).unwrap();

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
        localStorage.setItem('jwt', access_token ?? '');
        localStorage.setItem('userId', userId ?? '');
        router.push('/auth/reset-password');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      notifications.show({
        title: notificationTexts.error.title,
        message: notificationTexts.error.message,
        color: 'red',
        position: 'top-right',
      });
    }
  };

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
      const { error } = await forgotPassword({ email }).unwrap();
      if (error) {
        notifications.show({
          title: notificationTexts.error.title,
          message: notificationTexts.error.message,
          color: 'red',
        });
        setSubmitted(false);
        return;
      } else {
        setSubmitted(true);
        notifications.show({
          title: notificationTexts.success.title,
          message: notificationTexts.success.message,
          color: 'green',
        });
      }
    } catch (error) {
      console.error('Error sending recovery email:', error);
      notifications.show({
        title: notificationTexts.error.title,
        message: notificationTexts.error.message,
        color: 'red',
      });
      setSubmitted(false);
      return;
    }
  };

  return (
    <Translation>
      {(t) => (
        <div className="min-h-screen flex items-center justify-center px-4">
          <Container size="xs" className="w-full max-w-[400px]">
            {!submitted ? (
              <div className="space-y-6 p-4 shadow-lg rounded-lg border border-gray-300">
                <div className="text-center space-y-2">
                  <Title order={1} className="text-2xl font-bold">
                    {t('auth.accountRecovery.title')}
                  </Title>
                  <Text c="dimmed">
                    {t('auth.accountRecovery.description') ||
                      'Enter your email address'}
                  </Text>
                </div>

                <form
                  onSubmit={(e) =>
                    handleSubmit(e, {
                      success: {
                        title: t('auth.accountRecovery.successTitle'),
                        message: t('auth.accountRecovery.successMessage'),
                      },
                      error: {
                        title: t('auth.accountRecovery.errorTitle'),
                        message: t('auth.accountRecovery.errorMessage'),
                      },
                    })
                  }
                  className="space-y-4"
                >
                  <TextInput
                    label={t('auth.email') || 'Email'}
                    placeholder="your@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    classNames={{
                      input: 'h-[42px]',
                    }}
                    disabled={isLoading}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    disabled={isLoading}
                    className="bg-[#FF4B12] hover:bg-[#FF4B12]/90 h-[42px]"
                  >
                    {t('auth.accountRecovery.sendRecoveryEmail') ||
                      'Send Recovery Email'}
                  </Button>
                </form>

                <div className="text-center">
                  <Link
                    href="/auth/login"
                    className="text-[#FF4B12] hover:underline"
                  >
                    {t('auth.resetPassword.goToLogin') || 'Go to Login'}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6 p-4 shadow-lg rounded-lg">
                <Title
                  order={2}
                  className="text-xl font-semibold text-[#FF4B12]"
                >
                  {t('auth.otpVerification.title') || 'OTP Verification'}
                </Title>
                <Text className="text-center text-pretty">
                  {t('auth.otpVerification.description', { email: email })}
                </Text>
                <form
                  onSubmit={(e) =>
                    handleVerifyOTP(e, {
                      success: {
                        title: t('auth.otpVerification.successTitle'),
                        message: t('auth.otpVerification.successMessage'),
                      },
                      error: {
                        title: t('auth.otpVerification.errorTitle'),
                        message: t('auth.otpVerification.errorMessage'),
                      },
                    })
                  }
                  className="space-y-4"
                >
                  <TextInput
                    label=""
                    placeholder={
                      t('auth.otpVerification.inputPlaceholder') || 'Enter OTP'
                    }
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    classNames={{
                      input: 'h-[42px]',
                    }}
                    disabled={isLoadingVerifyOTP}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    disabled={isLoadingVerifyOTP}
                    className="bg-[#FF4B12] hover:bg-[#FF4B12]/90 h-[42px]"
                  >
                    {t('auth.otpVerification.button') || 'Verify OTP'}
                  </Button>
                </form>
              </div>
            )}
          </Container>
        </div>
      )}
    </Translation>
  );
}

export default ForgotPasswordPage;
