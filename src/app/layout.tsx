import { ColorSchemeScript, MantineProvider, createTheme } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import clsx from 'clsx';
import type { Metadata, Viewport } from 'next';
import { Oswald, Roboto } from 'next/font/google';

import AuthProvider from '@/contexts/auth-provider';
import { ChatProvider } from '@/contexts/chat-provider';
import ReduxProvider from '@/contexts/redux-provider';

import './globals.css';

// const poppins = Poppins({
//   subsets: ['latin'],
//   weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
//   variable: '--font-poppins',
// });

const oswald = Oswald({
  variable: '--font-oswald',
  subsets: ['latin'],
});

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-roboto',
});

const theme = createTheme({
  fontFamily: 'var(--font-roboto)',
  colors: {
    orange: [
      'var(--color-orange-50)',
      'var(--color-orange-75)',
      'var(--color-orange-100)',
      'var(--color-orange-200)',
      'var(--color-orange-300)',
      'var(--color-orange-400)',
      'var(--color-orange-500)',
      'var(--color-orange-600)',
      'var(--color-orange-700)',
      'var(--color-orange-800)',
      'var(--color-orange-900)',
    ],
  },
  primaryColor: 'orange',
  primaryShade: 6,
  defaultRadius: 'md',
  components: {
    Loader: {
      defaultProps: {
        type: 'bars',
      },
    },
  },
});

export const metadata: Metadata = {
  title: 'Travel Buddy',
};

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  interactiveWidget: 'resizes-content',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head className="fixed">
        <ColorSchemeScript defaultColorScheme="light" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        />
      </head>
      <body
        className={clsx(roboto.className, roboto.variable, oswald.variable)}
      >
        <ReduxProvider>
          <AuthProvider>
            <ChatProvider>
              <MantineProvider theme={theme} defaultColorScheme="light">
                <ModalsProvider>
                  <Notifications />
                  {children}
                </ModalsProvider>
              </MantineProvider>
            </ChatProvider>
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
