// @ts-check
import pagesConfig from "./build-pages/config.js";
import PagesWebpackPlugin from "./build-pages/pages-webpack-plugin.js";

const isBuild = process.env.NODE_ENV === "production";

const pagesPlugin = new PagesWebpackPlugin(pagesConfig);

/** @type {import("next").NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    scrollRestoration: true,
    serverComponentsExternalPackages: [
      "@babel/core",
      "@babel/types",
      "typescript",
    ],
  },
  reactStrictMode: true,
  transpilePackages: !isBuild ? ["@ariakit/react", "@ariakit/playground"] : [],
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack(config, context) {
    if (!context.isServer) {
      config.plugins.unshift(pagesPlugin);
    }
    config.module.unknownContextCritical = false;
    config.module.exprContextCritical = false;
    config.resolve.extensionAlias = {
      ".js": [".js", ".ts", ".tsx"],
    };
    return config;
  },
};

export default nextConfig;
