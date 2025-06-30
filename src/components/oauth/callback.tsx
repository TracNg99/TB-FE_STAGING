'use client';

import { Loader, Text } from '@mantine/core';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { authKey } from '@/contexts/auth-provider';
import { useFetchUserAfterOAuthQuery } from '@/store/redux/slices/user/auth';

const OAuthCallback = () => {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const hash = localStorage.getItem('hash');

  // Extract access token on mount
  useEffect(() => {
    const queryParams = new URLSearchParams(hash?.split('#')[1] ?? '');
    const token = queryParams.get('access_token');
    const refresh = queryParams.get('refresh_token');

    if (token && token !== '') {
      localStorage.setItem('jwt', token); // Store access token
      localStorage.setItem('role', 'user');
      setAccessToken(token);
    }
    // else {
    //   console.error('Access token missing in OAuth response.');
    //   router.push('/?error=missing_token');
    // }

    if (refresh) {
      localStorage.setItem('refresh_token', refresh); // Store refresh token (if needed)
      setRefreshToken(refresh);
    }
  }, [router, accessToken, refreshToken, hash]);

  // Use RTK Query to fetch user data after OAuth
  const { data, error, isFetching } = useFetchUserAfterOAuthQuery(
    { accessToken, refreshToken }, // Pass as an object for flexibility
    { skip: !accessToken }, // Skip query if no access token is available
  );

  useEffect(() => {
    if (data) {
      // Set user data in the global context
      const { user } = data;
      localStorage.setItem(authKey, JSON.stringify(user));
      localStorage.removeItem('hash');

      // Redirect to the Home page
      router.push(`/`);
    }

    // if (error) {
    //   console.error('Error fetching user data:', error);
    //   router.push('/?error=oauth_failed');
    // }
  }, [data, error, router]);

  return (
    <>
      <div className="flex items-center justify-center align-middle mt-20">
        <Text size="xl" style={{ fontWeight: 'bold' }}>
          <Loader className="flex self-center" size={50} />
          {isFetching ? 'Loading...' : 'Redirecting...'}
        </Text>
      </div>
    </>
  );
};

export default OAuthCallback;
