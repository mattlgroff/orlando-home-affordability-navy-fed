/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack: (config, { isServer }) => {
      if (!isServer) {
          // don't resolve 'fs' module on the client to prevent this error on build --> Error: Can't resolve 'fs'
          config.resolve.fallback = {
              fs: false,
              module: false,
              tls: false,
              net: false,
              readline: false,
              child_process: false,
              'import-fresh': false,
              'yargs-parser': false,
              yargs: false,
          }
      }

      return config;
  }
};

module.exports = nextConfig;
