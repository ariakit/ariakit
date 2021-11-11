const path = require("path");
const glob = require("glob");
const transpileModules = require("next-transpile-modules");
const PagesWebpackPlugin = require("../../scripts/pages/pages-webpack-plugin");

const withTranspileModules = transpileModules(["ariakit"]);

const plugins = [
  new PagesWebpackPlugin({
    name: "guide",
    sourceContext: path.resolve(__dirname, "../../docs"),
    sourceRegExp: /\.md$/,
    componentPath: path.join(__dirname, "components/markdown-page"),
  }),
  new PagesWebpackPlugin({
    name: "components",
    sourceContext: path.resolve(__dirname, "../ariakit/src"),
    sourceRegExp: /src\/[^\/]+\/[^\/]+\.md$/,
    componentPath: path.join(__dirname, "components/markdown-page"),
  }),
  new PagesWebpackPlugin({
    name: "examples",
    sourceContext: path.resolve(__dirname, ".."),
    sourceRegExp: /__examples__\/[^\/]+\/(index\.[tj]sx?|readme\.md)$/,
    componentPath: path.join(__dirname, "components/markdown-page"),
  }),
  new PagesWebpackPlugin({
    name: "blog",
    sourceContext: path.resolve(__dirname, "../../blog"),
    sourceRegExp: /\.md$/,
    componentPath: path.join(__dirname, "components/markdown-page"),
  }),
];

/** @type {import("next").NextConfig} */
const nextConfig = {
  experimental: {
    reactRoot: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.plugins.unshift(...plugins);
    return config;
  },
};

module.exports = withTranspileModules(nextConfig);
