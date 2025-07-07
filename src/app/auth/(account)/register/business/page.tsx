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

import { useSignUpMutation } from '@/store/redux/slices/business/auth';

const registerSchema = z.object({
  email: z.string().nonempty('Email is required').email('Invalid email format'),
  password: z
    .string()
    .nonempty('Password is required')
    .min(8, 'Password must be at least 8 characters long'),
  businessName: z.string().nonempty('Business name is required'),
  description: z.string(),
  phone: z
    .string()
    .nonempty('Phone number is required')
    .regex(/^\+?\d{10,14}$/, 'Invalid phone number format'),
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
      businessName: '',
      description: '',
      phone: '',
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
          title: 'Sign Up successful',
          message: 'Account created successfully!',
          position: 'top-center',
        });
        localStorage.setItem('jwt', signUpData?.access_token || '');
        localStorage.setItem('userId', signUpData?.userId || '');
        localStorage.setItem('role', 'business');
      }

      const currentPath = sessionStorage.getItem('currentPath') || '';
      if (currentPath) {
        router.replace(currentPath);
        sessionStorage.removeItem('currentPath');
        return;
      }

      router.replace('/auth/login/business');
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
    <>
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Welcome to Travel buddy</h1>
        <p className="text-sm">
          Already have a B2B Partner account?{' '}
          <Link href="/auth/login" className="underline">
            Log in
          </Link>
        </p>
      </header>
      <form
        className="flex flex-col gap-4 mt-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <TextInput
          {...form.register('businessName')}
          label="Business name"
          placeholder="Travel Buddy"
          error={form.formState.errors.businessName?.message}
        />
        <TextInput
          {...form.register('email')}
          label="Email"
          placeholder="email@example.com"
          error={form.formState.errors.email?.message}
        />
        <TextInput
          {...form.register('description')}
          label="Description"
          placeholder="Business Description"
          error={form.formState.errors.description?.message}
        />
        <TextInput
          {...form.register('phone')}
          label="Phone number"
          placeholder="+1234567890"
          error={form.formState.errors.phone?.message}
        />
        <PasswordInput
          {...form.register('password')}
          label="Password"
          placeholder="******"
          error={form.formState.errors.password?.message}
        />
        <Button
          type="submit"
          disabled={!form.formState.isValid}
          loading={loading}
        >
          Register
        </Button>
      </form>
    </>
  );
};

export default RegisterPage;
