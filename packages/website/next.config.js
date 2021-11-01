const transpileModules = require("next-transpile-modules");
const withTranspileModules = transpileModules(["ariakit"]);

/** @type {import("next").NextConfig} */
module.exports = withTranspileModules({
  experimental: {
    reactRoot: true,
    concurrentFeatures: true,
    serverComponents: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
});
