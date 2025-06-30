'use client';

import { useSearchParams } from 'next/navigation';

import LoginForm from '@/components/forms/login';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirectUrl') || '/';

  return <LoginForm redirectUrl={redirectUrl} />;
}
