
/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development';

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
        ],
      },
    ];
  },
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
  webpack: (config) => {
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      /Critical dependency: the request of a dependency is an expression/,
      /require function is used in a way in which dependencies cannot be statically extracted/,
    ];
    return config;
  },
};

module.exports = nextConfig;
