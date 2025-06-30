'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { AuthError } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useSignUpMutation } from '@/store/redux/slices/user/auth';

const registerSchema = z.object({
  email: z.string().nonempty('Email is required').email('Invalid email format'),
  password: z
    .string()
    .nonempty('Password is required')
    .min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().nonempty('First name is required'),
  lastName: z.string().nonempty('Last name is required'),
  phoneNumber: z
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
      firstName: '',
      lastName: '',
      phoneNumber: '',
    },
    mode: 'onTouched',
  });
  const router = useRouter();

  const onSubmit = async (data: RegisterSchema) => {
    if (loading) return;
    setLoading(true);

    try {
      const { error } = await signUp(data);

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
        });
      } else {
        notifications.show({
          color: 'success',
          title: 'Sign Up successful',
          message: 'Account created successfully!',
        });
      }

      router.replace('/auth/login');
    } catch (error) {
      const message =
        error instanceof AuthError
          ? error.message
          : 'Something went wrong, please try again';
      notifications.show({
        color: 'red',
        title: 'Failed to login',
        message,
      });
    }
    setLoading(false);
  };

  return (
    <>
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Welcome to Travel buddy</h1>
        <p className="text-sm">
          Already have an account?{' '}
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
          {...form.register('firstName')}
          label="First name"
          placeholder="John"
          error={form.formState.errors.firstName?.message}
        />
        <TextInput
          {...form.register('lastName')}
          label="Last name"
          placeholder="Doe"
          error={form.formState.errors.lastName?.message}
        />
        <TextInput
          {...form.register('email')}
          label="Email"
          placeholder="email@example.com"
          error={form.formState.errors.email?.message}
        />
        <TextInput
          {...form.register('phoneNumber')}
          label="Phone number"
          placeholder="+1234567890"
          error={form.formState.errors.phoneNumber?.message}
        />
        <TextInput
          {...form.register('password')}
          label="Password"
          placeholder="******"
          type="password"
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
