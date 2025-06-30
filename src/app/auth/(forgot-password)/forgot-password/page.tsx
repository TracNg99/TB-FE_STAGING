'use client';

import { Button, Container, Text, TextInput, Title } from '@mantine/core';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log(`Recovery email sent to: ${email}`);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Container size="xs" className="w-full max-w-[400px]">
        {!submitted ? (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Title order={1} className="text-2xl font-bold">
                Account Recovery
              </Title>
              <Text c="dimmed">
                Enter your email address and we&apos;ll send you a recovery link
              </Text>
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
              />

              <Button
                type="submit"
                fullWidth
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
          <div className="text-center space-y-6">
            <Title order={2} className="text-xl font-semibold text-[#FF4B12]">
              Recovery Email Sent
            </Title>
            <Text>
              A recovery email has been sent to {email}.<br />
              Please check your inbox.
            </Text>
            <Button
              onClick={() => router.push('/login')}
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

export default ForgotPasswordPage;

// const ForgotPasswordPage = () => {
//   return <div>Forgot password</div>;
// };

// export default ForgotPasswordPage;
