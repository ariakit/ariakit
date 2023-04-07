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
      "vscode-oniguruma",
      "onigasm",
      "shiki",
      "monaco-textmate",
      "monaco-vscode-textmate-theme-converter",
      "rollup",
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
      config.plugins.push(
        new MonacoWebpackPlugin({
          filename: "static/[name].worker.js",
        })
      );
    }
    config.module.rules.push({
      test: /\.wasm$/,
      type: "asset/resource",
      generator: {
        filename: "static/wasm/[name].[hash][ext]",
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
