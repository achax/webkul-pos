/** @type {import('next').NextConfig} */
const path = require('path');
const { locales, sourceLocale } = require('./lingui.config.js');
const APP_MODE = Boolean(process.env.MODE === 'production' ? true : false);
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  disable: APP_MODE,
  mode: process.env.MODE,
  skipWaiting: true,
  publicExcludes: ['!assets/**', '!pwa/**'],
});

const nextConfig = withPWA({
  reactStrictMode: true,
  images: {
    domains: [`${process.env.IMAGE_DOMAIN}`],
  },

  // env variables
  env: {
    MAGENTO_URL: process.env.MAGENTO_URL,
    APP_URL: process.env.APP_URL,
    DEMO_CREDENTIALS: process.env.DEMO_CREDENTIALS,
  },

  webpack: (config) => {
    config.module.rules.push({
      test: /\.(graphql|gql)$/,
      loader: 'graphql-tag/loader',
    });

    config.module.rules.push({
      test: /\.po/,
      use: ['@lingui/loader'],
    });

    config.resolve.alias = {
      ...config.resolve.alias,
      '~': path.resolve(__dirname),
    };

    return config;
  },
  i18n: {
    locales,
    defaultLocale: sourceLocale,
  },
});

module.exports = nextConfig;
