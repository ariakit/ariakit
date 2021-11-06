const path = require("path");
const transpileModules = require("next-transpile-modules");
const withTranspileModules = transpileModules(["ariakit"]);

class MyExampleWebpackPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap("MyExampleWebpackPlugin", (compilation) => {
      compilation.contextDependencies.add(
        path.resolve(__dirname, "../ariakit/src/button/__examples__")
      );
    });
  }
}

/** @type {import("next").NextConfig} */
const nextConfig = {
  experimental: {
    reactRoot: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, context) => {
    // Add loader here to run pages script.
    console.log(" ooool");
    config.plugins.push(new MyExampleWebpackPlugin());
    return config;
  },
};

module.exports = withTranspileModules(nextConfig);
