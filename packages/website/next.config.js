// @ts-check
const transpileModules = require("next-transpile-modules");
const PagesWebpackPlugin = require("../../scripts/pages/pages-webpack-plugin");
const pages = require("./pages.config");

const withTranspileModules = transpileModules(["ariakit"]);

/** @type {import("next").NextConfig} */
const nextConfig = {
  experimental: {
    scrollRestoration: true,
  },
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    const plugins = pages.map((page) => new PagesWebpackPlugin(page));
    config.plugins.unshift(...plugins);
    config.module.exprContextCritical = false;
    return config;
  },
};

module.exports = withTranspileModules(nextConfig);
