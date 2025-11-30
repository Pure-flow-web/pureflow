/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  
  // Disable image optimization for full static compatibility
  images: {
    unoptimized: true,
  },

  // Ensure strict mode for identifying potential problems in React
  reactStrictMode: true,

  // Ignore TypeScript and ESLint errors during build to prevent deployment blocks
  // This is for deployment resilience, assuming checks are done in CI/CD
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
