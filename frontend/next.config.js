// frontend/next.config.js
module.exports = {
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  // Handle runtime errors for browser APIs used in SSR
  eslint: {
    // Allow production builds to successfully complete even with ESLint errors
    ignoreDuringBuilds: true,
  },
  // Configure webpack for ethers.js compatibility
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fixes npm packages that depend on `fs` module
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
  // Disable CSS optimization to avoid critters dependency
  experimental: {
    optimizeCss: false, // Changed from true to false
  },
}