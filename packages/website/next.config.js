// @ts-check
const path = require("path");
const transpileModules = require("next-transpile-modules");
const PagesWebpackPlugin = require("../../scripts/pages/pages-webpack-plugin");
const pages = require("./pages.config");

const withTranspileModules = transpileModules([
  "@ariakit/core",
  "@ariakit/playground",
  "@ariakit/react-core",
  "@ariakit/react",
  path.resolve(__dirname, "../../examples"),
]);

/** @type {import("next").NextConfig} */
const nextConfig = {
  experimental: {
    scrollRestoration: true,
  },
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack(config) {
    const plugins = pages.map((page) => new PagesWebpackPlugin(page));
    config.plugins.unshift(...plugins);
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

module.exports = withTranspileModules(nextConfig);
