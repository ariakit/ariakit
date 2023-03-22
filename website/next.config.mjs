// @ts-check
import pagesConfig from "./build-pages/config.mjs";
import PagesWebpackPlugin from "./build-pages/pages-webpack-plugin.mjs";

const plugin = new PagesWebpackPlugin(pagesConfig);

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
  transpilePackages: ["@ariakit/playground", "@ariakit/react"],
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack(config, context) {
    if (!context.isServer) {
      config.plugins.unshift(plugin);
    }
    config.module.unknownContextCritical = false;
    config.module.exprContextCritical = false;
    config.resolve.extensionAlias = {
      ".js": [".js", ".ts"],
      ".jsx": [".jsx", ".tsx"],
    };
    return config;
  },
};

export default nextConfig;
