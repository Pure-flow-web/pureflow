/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use standalone output for optimized Docker images and serverless deployments.
  output: "standalone",
  // Disable image optimization as we are not using next/image for external URLs
  // and are focused on a static-friendly build.
  images: {
    unoptimized: true,
  },
  // Ensure the app works correctly with static exports (`next export`).
  trailingSlash: true,
};

export default nextConfig;
