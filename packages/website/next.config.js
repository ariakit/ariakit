// @ts-check
import PagesWebpackPlugin from "../../scripts/pages/pages-webpack-plugin.mjs";
import pagesConfig from "./pages.config.js";

const plugin = new PagesWebpackPlugin(pagesConfig);

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
