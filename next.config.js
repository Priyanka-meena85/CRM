/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  experimental: {
    outputFileTracingIncludes: {
      "/api/**/*": ["./prisma/dev.db"],
    },
  },
};

module.exports = nextConfig;
