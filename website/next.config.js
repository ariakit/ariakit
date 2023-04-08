import MonacoWebpackPlugin from "monaco-editor-webpack-plugin";
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
      "shiki",
      "onigasm",
      "vscode-oniguruma",
      "vscode-textmate",
      "monaco-vscode-textmate-theme-converter",
    ],
  },
  reactStrictMode: true,
  transpilePackages: !isBuild ? ["@ariakit/react"] : [],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack(config, context) {
    if (!context.isServer) {
      config.plugins.unshift(pagesPlugin);
      config.plugins.push(
        new MonacoWebpackPlugin({
          filename: context.dev
            ? "static/monaco/[name].worker.js"
            : "static/monaco/[name].[contenthash].worker.js",
          features: [
            "!hover",
            "!gotoError",
            "!colorPicker",
            "!stickyScroll",
            "!contextmenu",
          ],
        })
      );
    }
    config.module.rules.push({
      test: /\.wasm$/,
      type: "asset/resource",
      generator: {
        filename: context.dev
          ? "static/wasm/[name][ext]"
          : "static/wasm/[name].[contenthash][ext]",
      },
    });
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    config.module.unknownContextCritical = false;
    config.module.exprContextCritical = false;
    config.resolve.extensionAlias = {
      ".js": [".js", ".ts", ".tsx"],
    };

    return config;
  },
};

export default nextConfig;
