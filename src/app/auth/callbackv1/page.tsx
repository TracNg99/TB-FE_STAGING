'use client';

import { Loader, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import TransitionTopbar from '@/components/layouts/logo-bar';
import MobileNavbar from '@/components/layouts/mobile-nav-layout';
import { Translation } from '@/components/translation';
import { authKey } from '@/contexts/auth-provider';
import { useFetchUserAfterOAuthQuery } from '@/store/redux/slices/user/auth';

const OAuthCallback = () => {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const hash = localStorage.getItem('hash');
  const isMobile = useMediaQuery('(max-width: 768px)');

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

    if (refresh) {
      sessionStorage.setItem('refreshToken', refresh); // Store refresh token (if needed)
      setRefreshToken(refresh);
    }
  }, [router, accessToken, refreshToken, hash]);

  // Use RTK Query to fetch user data after OAuth
  const { data, error, isFetching } = useFetchUserAfterOAuthQuery(
    {
      accessToken: accessToken as string,
      refreshToken: refreshToken as string,
    }, // Pass as an object for flexibility
    { skip: !accessToken }, // Skip query if no access token is available
  );

  useEffect(() => {
    if (data) {
      // Set user data in the global context
      const { user, expires_at } = data;

      sessionStorage.setItem('expiresAt', expires_at as string);
      localStorage.setItem(authKey, JSON.stringify(user));
      localStorage.removeItem('hash');

      const currentPath = sessionStorage.getItem('currentPath');
      if (currentPath) {
        console.log('Current Path: ', currentPath);
        router.replace(currentPath);
        sessionStorage.removeItem('currentPath');
        return;
      }
      // Redirect to the Home page
      router.replace(`/`);
    }

    if (error) {
      console.error('Error fetching user data:', error);
      router.push('/?error=oauth_failed');
    }
  }, [data, error, router]);

  return (
    <Translation>
      {(t) => (
        <>
          {isMobile && <TransitionTopbar />}
          <div className="flex items-center justify-center align-middle mt-20">
            <Text size="xl" style={{ fontWeight: 'bold' }}>
              <Loader className="flex place-self-center" size={50} />
              {isFetching ? t('common.loading') : t('common.redirecting')}
            </Text>
          </div>
          {isMobile && <MobileNavbar />}
        </>
      )}
    </Translation>
  );
};

export default OAuthCallback;
