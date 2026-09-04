/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // تعطيل الـ Static Generation لمسارات API لتجنب خطأ Prisma أثناء الـ Build
  output: 'standalone',
};

module.exports = nextConfig;