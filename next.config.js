'use strict'

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})

/** @type {import('next').NextConfig} */
const nextConfig = withBundleAnalyzer({
  basePath: process.env.BASEPATH,
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/en',
        permanent: true,
        locale: false
      }
    ]
  },

  reactStrictMode: false,

  webpack: (config, { dev, isServer }) => {
    if (!dev) {
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename]
        }
      }
    }

    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
        os: false
      }
    }

    return config
  },

  swcMinify: true
})

module.exports = nextConfig
