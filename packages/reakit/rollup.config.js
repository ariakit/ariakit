const proxyDirecoriesPlugin = require("rollup-plugin-proxy-directories");
const createConfig = require("../../rollup.config");
const publicFiles = require("./scripts/publicFiles");
const pkg = require("./package.json");

export default [
  createConfig({
    pkg,
    input: publicFiles,
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
    plugins: [
      proxyDirecoriesPlugin({
        name: pkg.name,
        files: publicFiles,
        gitIgnore: true
      })
    ]
  }),
  createConfig({ pkg, input: "src/index.ts", umd: true })
];
