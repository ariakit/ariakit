import path from "node:path";
import { fileURLToPath } from "node:url";
import pagesConfig from "./build-pages/config.js";
import PagesWebpackPlugin from "./build-pages/pages-webpack-plugin.js";
import { redirects } from "./redirects.js";

/** @type {import("next").NextConfig} */
const nextConfig = {
  redirects,
  experimental: {
    webpackBuildWorker: true,
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
    ],
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "img.clerk.com" }],
  },
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

    // Solid support
    const solidRule = {
      use: [
        {
          loader: "babel-loader",
          options: {
            babelrc: false,
            configFile: false,
            presets: [
              "@babel/preset-env",
              [
                "solid",
                {
                  generate: context.isServer ? "ssr" : "dom",
                  hydratable: true,
                },
              ],
              "@babel/preset-typescript",
            ],
          },
        },
      ],
    };
    config.module.rules.push({
      // .solid.tsx files anywhere
      test: /\.solid\.tsx$/,
      ...solidRule,
    });
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    config.module.rules.push({
      // .tsx files in the @ariakit/solid and @ariakit/solid-core packages
      test: /\.tsx?$/,
      include: [
        path.resolve(__dirname, "../packages/ariakit-solid"),
        path.resolve(__dirname, "../packages/ariakit-solid-core"),
      ],
      ...solidRule,
    });

    return config;
  },
};

export default nextConfig;
