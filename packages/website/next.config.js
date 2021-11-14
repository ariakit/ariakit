// @ts-check
const transpileModules = require("next-transpile-modules");
const PagesWebpackPlugin = require("../../scripts/pages/pages-webpack-plugin");
const pages = require("./pages.config");

const withTranspileModules = transpileModules(["ariakit"]);

/** @type {import("next").NextConfig} */
const nextConfig = {
  experimental: {
    reactRoot: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    const plugins = pages.map((page) => new PagesWebpackPlugin(page));
    config.plugins.unshift(...plugins);
    return config;
  },
};

module.exports = withTranspileModules(nextConfig);
