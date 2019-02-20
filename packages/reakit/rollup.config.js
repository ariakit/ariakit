const proxyDirecoriesPlugin = require("rollup-plugin-proxy-directories");
const createConfig = require("../../rollup.config");
const pkg = require("./package.json");

export default [
  createConfig({
    pkg,
    input: [],
    output: [
      {
        format: "es",
        dir: "es"
      },
      {
        format: "cjs",
        dir: "lib",
        exports: "named"
      }
    ],
    plugins: [proxyDirecoriesPlugin()]
  }),
  createConfig({ pkg, input: "src/index.ts", umd: true })
];
