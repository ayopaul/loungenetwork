/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  staticPageGenerationTimeout: 120,

  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['@prisma/client'],
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'loungenetwork.ng',
        pathname: '/**',
      },
    ],
  },

  devIndicators: {
    buildActivity: false,
  },
};

module.exports = nextConfig;