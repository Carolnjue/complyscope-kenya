/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  serverExternalPackages: ['mysql2', 'nodemailer', 'bcryptjs'],
  experimental: { serverActions: { bodySizeLimit: '12mb' } },
};
export default nextConfig;
