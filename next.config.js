// next.config.js
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    domains: ['loungenetwork.ng'],
  },
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
};

module.exports = nextConfig;