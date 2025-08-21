'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, PasswordInput, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { AuthError } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Translation } from '@/components/translation';
import { useLogInMutation } from '@/store/redux/slices/user/auth';

const loginSchema = z.object({
  email: z.string().nonempty('Email is required').email('Invalid email format'),
  password: z
    .string()
    .nonempty('Password is required')
    .min(8, 'Password must be at least 8 characters long'),
});

type LoginSchema = z.infer<typeof loginSchema>;

interface LoginFormProps {
  redirectUrl?: string;
  onSuccess?: () => void;
}

export function LoginForm({ redirectUrl, onSuccess }: Readonly<LoginFormProps>) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [logIn] = useLogInMutation();

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onTouched',
  });

  const onSubmit = async (data: LoginSchema) => {
    if (loading) return;
    setLoading(true);

    const { email, password } = data;

    try {
      const { data: authData, error } = await logIn({ email, password });

      if (error) {
        const message =
          error instanceof AuthError
            ? error.message
            : 'Something went wrong, please try again!';
        notifications.show({
          color: 'red',
          title: 'Failed to login!',
          message,
        });
        setLoading(false);
      } else {
        localStorage.setItem('jwt', authData?.access_token ?? '');
        localStorage.setItem('userId', authData?.userId ?? '');
        localStorage.setItem('role', 'user');

        sessionStorage.setItem('expiresAt', authData?.expires_at ?? '');
        sessionStorage.setItem('refreshToken', authData?.refresh_token ?? '');
        if (redirectUrl) {
          router.replace(redirectUrl);
        } else {
          router.replace('/');
        }
        onSuccess?.();
      }
    } catch (error) {
      const message =
        error instanceof AuthError
          ? error.message
          : 'Something went wrong, please try again!';
      notifications.show({
        color: 'red',
        title: 'Failed to login!',
        message,
      });
    }
    setLoading(false);
  };

  return (
    <Translation>
      {(t) => (
        <>
          <header className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold">
              {t('chat.landingPageWelcome')}
            </h1>
            <p className="text-sm">
              {t('auth.dontHaveAccount')}{' '}
              <Link href="/auth/register" className="underline">
                {t('auth.register')}
              </Link>
            </p>
          </header>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <TextInput
              {...form.register('email')}
              label={t('auth.email')}
              placeholder="email@example.com"
              error={form.formState.errors.email?.message}
            />
            <div className="flex flex-col gap-2">
              <PasswordInput
                {...form.register('password')}
                label={t('auth.password')}
                placeholder="******"
                error={form.formState.errors.password?.message}
              />
              <Link
                href="/auth/forgot-password"
                className="underline text-xs text-neutral-600"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>
            <Button
              type="submit"
              disabled={!form.formState.isValid}
              loading={loading}
            >
              {t('auth.login')}
            </Button>
          </form>
        </>
      )}
    </Translation>
  );
}

export default LoginForm;
