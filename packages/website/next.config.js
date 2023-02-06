// @ts-check
const path = require("path");
const PagesWebpackPlugin = require("../../scripts/pages/pages-webpack-plugin");
const pages = require("./pages.config");

/** @type {import("next").NextConfig} */
const nextConfig = {
  experimental: {
    scrollRestoration: true,
    appDir: true,
  },
  reactStrictMode: true,
  transpilePackages: ["@ariakit/playground", "@ariakit/react"],
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack(config) {
    const plugins = pages.map((page) => new PagesWebpackPlugin(page));
    config.plugins.unshift(...plugins);
    config.module.unknownContextCritical = false;
    config.module.exprContextCritical = false;
    return config;
  },
  async headers() {
    return [
      {
        source: "/fonts/Inter-roman.var.woff2",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/fonts/Inter-italic.var.woff2",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
