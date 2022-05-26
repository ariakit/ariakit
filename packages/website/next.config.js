// @ts-check
const transpileModules = require("next-transpile-modules");
const React = require("react");
const PagesWebpackPlugin = require("../../scripts/pages/pages-webpack-plugin");
const pages = require("./pages.config");

const withTranspileModules = transpileModules(["ariakit"]);

/** @type {import("next").NextConfig} */
const nextConfig = {
  experimental: {
    reactRoot: /^(16|17)/.test(React.version) ? false : true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: "/examples/:example/:path*",
        destination: `/examples/:example`,
      },
    ];
  },
  webpack(config) {
    const plugins = pages.map((page) => new PagesWebpackPlugin(page));
    config.plugins.unshift(...plugins);
    config.module.exprContextCritical = false;
    return config;
  },
};

module.exports = withTranspileModules(nextConfig);
