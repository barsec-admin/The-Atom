// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  // Add these configurations
  poweredByHeader: false,
  reactStrictMode: true,
  // Increase the timeout
  staticPageGenerationTimeout: 1000,
  // Add compression
  compress: true,
};

export default nextConfig;
