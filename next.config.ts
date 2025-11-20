
import type { NextConfig } from 'next';
import type { Configuration } from 'webpack';

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // The 'allowedDevOrigins' property helps with CORS issues in development.
  // It is a top-level property in this Next.js version.
  allowedDevOrigins: isDev
    ? [
        'https://6000-firebase-studio-1761648462474.cluster-lu4mup47g5gm4rtyvhzpwbfadi.cloudworkstations.dev',
      ]
    : [],
  webpack: (config: Configuration) => {
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      /Critical dependency: the request of a dependency is an expression/,
      /require function is used in a way in which dependencies cannot be statically extracted/,
    ];
    return config;
  },
};

export default nextConfig;
