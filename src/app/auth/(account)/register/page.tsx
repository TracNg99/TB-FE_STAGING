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
import { useSignUpMutation } from '@/store/redux/slices/user/auth';

const registerSchema = z.object({
  email: z.string().nonempty('Email is required').email('Invalid email format'),
  password: z
    .string()
    .nonempty('Password is required')
    .min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().nonempty('First name is required'),
  lastName: z.string().nonempty('Last name is required'),
  // phoneNumber: z
  //   .string()
  //   .nonempty('Phone number is required')
  //   .regex(/^\+?\d{10,14}$/, 'Invalid phone number format'),
});

type RegisterSchema = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [signUp] = useSignUpMutation();

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      // phoneNumber: '',
    },
    mode: 'onTouched',
  });
  const router = useRouter();

  const onSubmit = async (data: RegisterSchema) => {
    if (loading) return;
    setLoading(true);

    try {
      const { data: signUpData, error } = await signUp(data);

      // If sign up fails, throw the error
      if (error) {
        const message =
          error instanceof AuthError
            ? error.message
            : 'Something went wrong, please try again!';
        notifications.show({
          color: 'red',
          title: 'Failed to register!',
          message,
          position: 'top-center',
        });
      } else {
        notifications.show({
          color: 'success',
          title: 'Account created successfully!',
          message: 'Account created successfully!',
          position: 'top-center',
        });
        localStorage.setItem('jwt', signUpData?.access_token || '');
        localStorage.setItem('refreshToken', signUpData?.refresh_token || '');
        localStorage.setItem('expiresAt', signUpData?.expires_at || '');
        localStorage.setItem('userId', signUpData?.userId || '');
        localStorage.setItem('role', 'user');
      }

      const currentPath = sessionStorage.getItem('currentPath') || '';
      if (currentPath) {
        router.replace(currentPath);
        sessionStorage.removeItem('currentPath');
        return;
      }

      router.replace('/');
    } catch (error) {
      const message =
        error instanceof AuthError
          ? error.message
          : 'Something went wrong, please try again';
      notifications.show({
        color: 'red',
        title: 'Failed to login',
        message,
        position: 'top-center',
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
              {t('auth.alreadyHaveAccount')}{' '}
              <Link href="/auth/login" className="underline">
                {t('auth.login')}
              </Link>
            </p>
          </header>
          <form
            className="flex flex-col gap-4 mt-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <TextInput
              {...form.register('firstName')}
              label={t('profile.firstName')}
              placeholder="John"
              error={form.formState.errors.firstName?.message}
            />
            <TextInput
              {...form.register('lastName')}
              label={t('profile.lastName')}
              placeholder="Doe"
              error={form.formState.errors.lastName?.message}
            />
            <TextInput
              {...form.register('email')}
              label={t('auth.email')}
              placeholder="email@example.com"
              error={form.formState.errors.email?.message}
            />
            {/* <TextInput
          {...form.register('phoneNumber')}
          label="Phone number"
          placeholder="+1234567890"
          error={form.formState.errors.phoneNumber?.message}
        /> */}
            <PasswordInput
              {...form.register('password')}
              label={t('auth.password')}
              placeholder="******"
              error={form.formState.errors.password?.message}
            />
            <Button
              type="submit"
              disabled={!form.formState.isValid}
              loading={loading}
            >
              {t('auth.register')}
            </Button>
          </form>
        </>
      )}
    </Translation>
  );
};

export default RegisterPage;
