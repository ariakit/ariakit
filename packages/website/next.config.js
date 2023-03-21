// @ts-check
import PagesWebpackPlugin from "../../scripts/pages/pages-webpack-plugin.mjs";
import pagesConfig from "./pages.config.js";

export const PAGE_INDEX_FILE_REGEX = /\/[^\/]+\/(index\.[tj]sx?|readme\.md)/i;
export const PAGE_FILE_REGEX = new RegExp(
  `(${PAGE_INDEX_FILE_REGEX.source}|\.md)$`,
  "i"
);

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
    ];
  },
};

export default nextConfig;
