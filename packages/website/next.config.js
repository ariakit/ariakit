const path = require("path");
const glob = require("glob");
const transpileModules = require("next-transpile-modules");
const PagesWebpackPlugin = require("../../scripts/pages/pages-webpack-plugin");

const withTranspileModules = transpileModules(["ariakit"]);

/** @type {import("next").NextConfig} */
const nextConfig = {
  experimental: {
    reactRoot: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.plugins.push(
      new PagesWebpackPlugin({
        name: "examples",
        context: path.resolve(__dirname, ".."),
        test: /__examples__\/[^\/]+\/(index\.[tj]sx?|readme.md)$/,
      })
    );
    // config.plugins.push(
    //   new WatchPagesWebpackPlugin({
    //     pattern: path.resolve(
    //       __dirname,
    //       "../**/__examples__/**/*.{js,ts,tsx,md}"
    //     ),
    //     ignore: ["**/*test.{js,ts,tsx}", "**/node_modules/**"],
    //   })
    // );
    // config.module.rules.push({
    //   test: /__examples__/,
    //   use: path.resolve(__dirname, "../../scripts/pages/page-loader.js"),
    // });
    // config.module.rules.push({
    //   test: /\.md$/,
    //   use: path.resolve(__dirname, "../../scripts/pages/md-loader.js"),
    // });

    // const originalEntry = config.entry;

    // config.entry = async () => {
    //   const entries = await originalEntry();
    //   return {
    //     ...entries,
    //     context: path.resolve(__dirname, "context.js"),
    //   };
    // };

    // config.entry = () => {
    //   return entry().then((e) => {
    //     const files = glob.sync(
    //       path.resolve(__dirname, "../**/__examples__/**/*.{js,ts,tsx,md}"),
    //       { ignore: ["**/*test.{js,ts,tsx}", "**/node_modules/**"] }
    //     );
    //     console.log(e);
    //     files.forEach((file) => {
    //       e["pages/lool"] = path.resolve(
    //         __dirname,
    //         "../ariakit/src/button/__examples__/button-example/index.tsx"
    //       );
    //     });
    //     return e;
    //   });
    // };

    return config;
  },
};

module.exports = withTranspileModules(nextConfig);
