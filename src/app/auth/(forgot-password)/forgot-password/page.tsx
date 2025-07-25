'use client';

import { Button, Container, Text, TextInput, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

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

  const handleVerifyOTP = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const { access_token, userId, error } = await verifyOTP({
        email,
        token,
      }).unwrap();

      if (error) {
        notifications.show({
          title: 'Error',
          message: (error as any)?.data?.message || 'Failed to verify OTP',
          color: 'red',
          position: 'top-right',
        });
      } else {
        notifications.show({
          title: 'Success',
          message: 'OTP verified successfully!',
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
        title: 'Error',
        message: (error as any)?.data?.message || 'Failed to verify OTP',
        color: 'red',
        position: 'top-right',
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const { error } = await forgotPassword({ email }).unwrap();
      if (error) {
        notifications.show({
          title: 'Error',
          message: 'Failed to send recovery email',
          color: 'red',
        });
        setSubmitted(false);
        return;
      } else {
        setSubmitted(true);
        notifications.show({
          title: 'Success',
          message: 'Recovery email sent successfully!',
          color: 'green',
        });
      }
    } catch (error) {
      console.error('Error sending recovery email:', error);
      notifications.show({
        title: 'Error',
        message:
          (error as any)?.data?.message || 'Failed to send recovery email',
        color: 'red',
      });
      setSubmitted(false);
      return;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Container size="xs" className="w-full max-w-[400px]">
        {!submitted ? (
          <div className="space-y-6 p-4 shadow-lg rounded-lg border border-gray-300">
            <div className="text-center space-y-2">
              <Title order={1} className="text-2xl font-bold">
                Account Recovery
              </Title>
              <Text c="dimmed">Enter your email address</Text>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <TextInput
                label="Email"
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
                Send Recovery Email
              </Button>
            </form>

            <div className="text-center">
              <Link
                href="/auth/login"
                className="text-[#FF4B12] hover:underline"
              >
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6 p-4 shadow-lg rounded-lg">
            <Title order={2} className="text-xl font-semibold text-[#FF4B12]">
              OTP Verification
            </Title>
            <Text>
              A recovery email has been sent to {email}.<br />
              Please check your inbox to verify OTP.
            </Text>
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <TextInput
                label=""
                placeholder="your OTP"
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
                Verify OTP
              </Button>
            </form>
          </div>
        )}
      </Container>
    </div>
  );
}

export default ForgotPasswordPage;
