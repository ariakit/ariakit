// import MonacoWebpackPlugin from "monaco-editor-webpack-plugin";
import pagesConfig from "./build-pages/config.js";
import PagesWebpackPlugin from "./build-pages/pages-webpack-plugin.js";
import { redirects } from "./redirects.js";

/** @type {import("next").NextConfig} */
const nextConfig = {
  redirects,
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: [
      "@babel/core",
      "@babel/types",
      "@babel/preset-env",
      "@babel/preset-react",
      "@babel/preset-typescript",
      "typescript",
      "ts-morph",
      "onigasm",
      "shiki",
      "vscode-oniguruma",
      "vscode-textmate",
      "monaco-vscode-textmate-theme-converter",
    ],
  },
  images: {
    domains: ["img.clerk.com"],
  },
  reactStrictMode: true,
  transpilePackages: ["@ariakit/*"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack(config, context) {
    if (context.isServer) {
      config.plugins.push(
        new context.webpack.DefinePlugin({
          "process.env.NEXT_BUILD_ID": JSON.stringify(context.buildId),
        }),
      );
    }

    if (!context.isServer) {
      config.plugins.unshift(new PagesWebpackPlugin(pagesConfig));
      // config.plugins.push(
      //   new MonacoWebpackPlugin({
      //     filename: context.dev
      //       ? "static/monaco/[name].worker.js"
      //       : "static/monaco/[name].[contenthash].worker.js",
      //     features: [
      //       "!hover",
      //       "!gotoError",
      //       "!colorPicker",
      //       "!stickyScroll",
      //       "!contextmenu",
      //     ],
      //   }),
      // );
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
      ".jsx": [".jsx", ".tsx"],
    };

    return config;
  },
};

export default nextConfig;
