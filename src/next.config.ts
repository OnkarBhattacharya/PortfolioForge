
import type {NextConfig} from 'next';

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  /* config options here */
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
  ...(isDev && {
    experimental: {
      // The allowedDevOrigins key is no longer experimental
    },
    // The allowedDevOrigins key should be at the top level
    allowedDevOrigins: [
        'https://6000-firebase-studio-1761648462474.cluster-lu4mup47g5gm4rtyvhzpwbfadi.cloudworkstations.dev',
    ],
  }),
};

export default nextConfig;
