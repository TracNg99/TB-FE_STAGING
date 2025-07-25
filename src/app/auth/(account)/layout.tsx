'use client';

import { Button, Divider } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Provider } from '@supabase/supabase-js';
import { IconBrandGoogle, IconBrandX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  useAuthWithGoogleMutation,
  useAuthWithXMutation,
} from '@/store/redux/slices/user/auth';

const oauthProviders = [
  {
    key: 'google',
    icon: IconBrandGoogle,
  },
  {
    key: 'twitter',
    icon: IconBrandX,
  },
] satisfies {
  key: Provider;
  icon: React.FC;
}[];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isClicked, setIsClicked] = useState(false);
  const [loginWithGgle, { isLoading: isLoadingGgle }] =
    useAuthWithGoogleMutation();
  const [loginWithX, { isLoading: isLoadingX }] = useAuthWithXMutation();

  const onOauthLogin = async (provider: Provider) => {
    try {
      switch (provider) {
        case 'google': {
          const {
            data: { url: urlGg },
          } = await loginWithGgle().unwrap();
          router.push(urlGg);
          break;
        }

        case 'twitter': {
          const {
            data: { url: urlX },
          } = await loginWithX().unwrap();
          router.push(urlX);
          break;
        }
      }
    } catch (error) {
      notifications.show({
        title: 'Failed to sign in with OAuth',
        message:
          error instanceof Error
            ? error.message
            : 'Something went wrong, please try again',
        color: 'red',
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-lvh gap-4 px-5 py-10 sm:justify-center">
      <div className="max-w-sm mx-auto w-full space-y-4">
        {children}
        <Divider label="Or sign in with" />
        <div className="flex flex-col gap-4 w-full">
          {oauthProviders.map(({ icon: Icon, key }, index) => (
            <Button
              variant="outline"
              key={index}
              onClick={() => {
                setIsClicked(true);
                onOauthLogin(key);
              }}
              disabled={isLoadingGgle || isLoadingX || isClicked}
            >
              <Icon />
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
