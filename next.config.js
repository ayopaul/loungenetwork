// next.config.js
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
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
    buildActivityPosition: 'bottom-right',
  },
};

module.exports = nextConfig;