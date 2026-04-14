/** @type {import('next').NextConfig} */
const nextConfig = {
  onDemandEntries: {
    maxInactiveAge: 120 * 1000,
    pagesBufferLength: 8,
  },
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        poll: 1000,
        aggregateTimeout: 500,
      };
    }
    if (dev && !isServer && config.output) {
      config.output.chunkLoadTimeout = 180000;
    }
    return config;
  },
};

export default nextConfig;
