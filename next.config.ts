import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  },
  images: {
    domains: ['kkhkvzjpcnivhhutxled.supabase.co'],
    remotePatterns: [
      new URL('https://kkhkvzjpcnivhhutxled.supabase.co/**'),
      new URL('https://picsum.photos/**'),
      new URL('https://via.placeholder.com/**'),
      new URL(
        'https://www.google.com/s2/favicons?domain=vespaadventures.com&sz=256',
      ),
      new URL(
        'https://www.google.com/s2/favicons?domain=saigontourist.com&sz=256',
      ),
      new URL('https://www.google.com/s2/favicons?domain=vietravel.com&sz=256'),
      // Placeholder image
      {
        hostname: 'picsum.photos',
        protocol: 'https',
        pathname: '/**',
        port: '',
        search: '',
      },
      {
        hostname: 'kkhkvzjpcnivhhutxled.supabase.co',
        protocol: 'https',
        pathname: '/**',
        port: '',
        search: '',
      },
      {
        hostname: 'via.placeholder.com',
        protocol: 'https',
        pathname: '/**',
        port: '',
        search: '',
      },
      {
        hostname: 'www.google.com',
        protocol: 'https',
        pathname: '/**',
        port: '',
        search: '',
      },
      // Add more domain here
    ],
  },
};

export default nextConfig;
