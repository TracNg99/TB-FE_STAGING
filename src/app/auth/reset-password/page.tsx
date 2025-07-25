'use client';

import { Button, Container, PasswordInput, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { useResetPasswordMutation } from '@/store/redux/slices/user/auth';

function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [resetPassword] = useResetPasswordMutation();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const { error } = await resetPassword({ password }).unwrap();
      if (error) {
        notifications.show({
          title: 'Error',
          message: (error as any)?.data?.message || 'Failed to reset password',
          color: 'red',
          position: 'top-right',
        });
      } else {
        notifications.show({
          title: 'Success',
          message: 'Password reset successfully!',
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
        title: 'Error',
        message: (error as any)?.data?.message || 'Failed to reset password',
        color: 'red',
        position: 'top-right',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Container size="xs" className="w-full max-w-[400px]">
        {!submitted ? (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Title order={1} className="text-2xl font-bold">
                Reset Password
              </Title>
              <Text c="dimmed">Enter your new password</Text>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <PasswordInput
                label="Password"
                placeholder="your password"
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
                Submit
              </Button>
            </form>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <Title order={1} className="text-2xl font-bold">
              Password Reset
            </Title>
            <Text c="dimmed">Your password has been reset.</Text>
            <Button
              onClick={() => router.push('/auth/login')}
              className="bg-[#FF4B12] hover:bg-[#FF4B12]/90 h-[42px]"
              fullWidth
            >
              Go To Login
            </Button>
          </div>
        )}
      </Container>
    </div>
  );
}

export default ResetPasswordPage;
