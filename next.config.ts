import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  },
  images: {
    domains: ['*'],
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
      new URL('https://north-vietnam.com/**'),
      new URL('https://www.vietnamairlines.com/**'),
    ],
    unoptimized: true,
  },
  webpack(config) {
    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule: any) =>
      rule.test?.test?.('.svg'),
    );

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
        use: ['@svgr/webpack'],
      },
    );

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
};

export default nextConfig;
