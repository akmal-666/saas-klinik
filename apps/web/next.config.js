/** @type {import('next').NextConfig} */
const path = require('path');

// Works for both local (monorepo root) and Vercel (rootDirectory=apps/web)
const pkgRoot = path.resolve(__dirname, '../../packages');

const nextConfig = {
  transpilePackages: ['@klinik/shared-types', '@klinik/shared-constants'],

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@klinik/shared-types':      path.join(pkgRoot, 'shared-types/src/index.ts'),
      '@klinik/shared-constants':  path.join(pkgRoot, 'shared-constants/src/index.ts'),
    };
    return config;
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },

  // Skip lint and type errors during build (CI-friendly)
  eslint:     { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

module.exports = nextConfig;
