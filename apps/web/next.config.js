const path = require("path");

const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin();

const imageSources = process.env.IMAGE_SOURCES
  ? process.env.IMAGE_SOURCES.split(",").map((url) => {
      const { hostname, protocol } = new URL(url.trim());
      return {
        protocol: protocol.replace(":", ""),
        hostname,
      };
    })
  : [];

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    useCache: true,
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  pageExtensions: ["ts", "tsx"],
  images: {
    minimumCacheTTL: 60,
    remotePatterns: imageSources,
  },
  reactStrictMode: false,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias["yjs"] = path.resolve(__dirname, "node_modules/yjs");
    }
    return config;
  },
};

module.exports = withNextIntl(nextConfig);
